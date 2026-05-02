import { Router } from 'express';
import bcrypt from 'bcrypt';
import { z } from 'zod';
import { db } from '../../lib/db';
import { signAccess, signRefresh, verifyRefresh } from '../../lib/jwt';
import { validate } from '../../middleware/validate';
import { authenticate } from '../../middleware/auth';
import { loginLimiter } from '../../middleware/rateLimit';
import { HttpError } from '../../middleware/errorHandler';

const router = Router();

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const refreshSchema = z.object({
  refresh_token: z.string().min(10),
});

interface UserRow {
  id: string;
  organization_id: string;
  email: string;
  password_hash: string;
  full_name: string;
  role: 'super_admin' | 'admin' | 'docente' | 'apoderado';
  status: 'active' | 'inactive' | 'pending';
}

router.post('/login', loginLimiter, validate(loginSchema), async (req, res, next) => {
  try {
    const { email, password } = req.body as z.infer<typeof loginSchema>;
    const user = await db.one<UserRow>(
      `SELECT id, organization_id, email, password_hash, full_name, role, status
         FROM users WHERE email = $1 LIMIT 1`,
      [email.toLowerCase()],
    );
    if (!user) throw new HttpError(401, 'Invalid credentials', 'invalid_credentials');
    if (user.status !== 'active') throw new HttpError(403, 'Account not active', 'account_inactive');

    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) throw new HttpError(401, 'Invalid credentials', 'invalid_credentials');

    const access = signAccess({
      sub: user.id,
      org: user.organization_id,
      role: user.role,
      email: user.email,
    });
    const refresh = signRefresh({ sub: user.id });

    await db.query(`UPDATE users SET last_login_at = now() WHERE id = $1`, [user.id]);

    res.json({
      access_token: access,
      refresh_token: refresh,
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        role: user.role,
      },
    });
  } catch (err) {
    next(err);
  }
});

router.post('/refresh', validate(refreshSchema), async (req, res, next) => {
  try {
    const { refresh_token } = req.body as z.infer<typeof refreshSchema>;
    const payload = verifyRefresh(refresh_token);
    const user = await db.one<UserRow>(
      `SELECT id, organization_id, email, full_name, role, status, password_hash
         FROM users WHERE id = $1 LIMIT 1`,
      [payload.sub],
    );
    if (!user || user.status !== 'active') {
      throw new HttpError(401, 'Refresh token invalid', 'invalid_refresh');
    }
    const access = signAccess({
      sub: user.id,
      org: user.organization_id,
      role: user.role,
      email: user.email,
    });
    res.json({ access_token: access });
  } catch (err) {
    next(err);
  }
});

router.post('/logout', authenticate, (_req, res) => {
  // Stateless JWT — actual revocation would happen via Redis denylist; out of scope here.
  res.status(204).end();
});

router.get('/me', authenticate, async (req, res, next) => {
  try {
    const u = await db.oneRequired<{
      id: string;
      email: string;
      full_name: string;
      role: string;
      organization_id: string;
    }>(
      `SELECT id, email, full_name, role, organization_id
         FROM users WHERE id = $1`,
      [req.user!.sub],
      'user_not_found',
    );
    res.json(u);
  } catch (err) {
    next(err);
  }
});

export default router;
