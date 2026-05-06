import { Router } from 'express';
import { z } from 'zod';
import bcrypt from 'bcrypt';
import { db } from '../../lib/db';
import { authenticate, requireRole } from '../../middleware/auth';
import { validate } from '../../middleware/validate';
import { env } from '../../config/env';
import { HttpError } from '../../middleware/errorHandler';

const router = Router();
router.use(authenticate);
router.use(requireRole('admin', 'super_admin'));

interface UserRow {
  id: string;
  email: string;
  full_name: string;
  role: string;
  status: string;
  last_login_at: string | null;
  created_at: string;
}

router.get('/', async (req, res, next) => {
  try {
    const rows = await db.many<UserRow>(
      `SELECT id, email, full_name, role, status, last_login_at, created_at
         FROM users
        WHERE organization_id = $1
        ORDER BY created_at DESC`,
      [req.user!.org],
    );
    res.json({ data: rows, total: rows.length });
  } catch (err) { next(err); }
});

const createSchema = z.object({
  email: z.string().email(),
  full_name: z.string().min(2),
  role: z.enum(['admin', 'docente', 'apoderado']),
  password: z.string().min(6),
});

router.post('/', validate(createSchema), async (req, res, next) => {
  try {
    const d = req.body as z.infer<typeof createSchema>;
    const hash = await bcrypt.hash(d.password, env.BCRYPT_ROUNDS);
    const row = await db.one<UserRow>(
      `INSERT INTO users (organization_id, email, password_hash, full_name, role, status)
       VALUES ($1,$2,$3,$4,$5,'active')
       RETURNING id, email, full_name, role, status, created_at, last_login_at`,
      [req.user!.org, d.email.toLowerCase(), hash, d.full_name, d.role],
    );
    res.status(201).json(row);
  } catch (err: unknown) {
    const e = err as { code?: string };
    if (e.code === '23505') return next(new HttpError(409, 'Email ya registrado', 'email_taken'));
    next(err);
  }
});

const updateSchema = z.object({
  full_name: z.string().min(2).optional(),
  role: z.enum(['admin', 'docente', 'apoderado']).optional(),
  status: z.enum(['active', 'inactive']).optional(),
  password: z.string().min(6).optional(),
});

router.patch('/:id', validate(updateSchema), async (req, res, next) => {
  try {
    const d = req.body as z.infer<typeof updateSchema>;
    const updates: Record<string, unknown> = {};
    if (d.full_name) updates.full_name = d.full_name;
    if (d.role) updates.role = d.role;
    if (d.status) updates.status = d.status;
    if (d.password) updates.password_hash = await bcrypt.hash(d.password, env.BCRYPT_ROUNDS);

    if (Object.keys(updates).length === 0) return res.status(400).json({ error: 'no_changes' });

    const keys = Object.keys(updates);
    const sets = keys.map((k, i) => `${k} = $${i + 3}`).join(', ');
    const values = keys.map((k) => updates[k]);

    const row = await db.one<UserRow>(
      `UPDATE users SET ${sets}, updated_at = now()
        WHERE id = $1 AND organization_id = $2
        RETURNING id, email, full_name, role, status, created_at, last_login_at`,
      [req.params.id, req.user!.org, ...values],
    );
    if (!row) return next(new HttpError(404, 'Usuario no encontrado', 'user_not_found'));
    res.json(row);
  } catch (err) { next(err); }
});

router.delete('/:id', async (req, res, next) => {
  try {
    if (req.params.id === req.user!.sub) {
      return next(new HttpError(400, 'No puedes desactivar tu propia cuenta', 'self_deactivate'));
    }
    const row = await db.one(
      `UPDATE users SET status = 'inactive', updated_at = now()
        WHERE id = $1 AND organization_id = $2
        RETURNING id`,
      [req.params.id, req.user!.org],
    );
    if (!row) return next(new HttpError(404, 'Usuario no encontrado', 'user_not_found'));
    res.status(204).end();
  } catch (err) { next(err); }
});

export default router;
