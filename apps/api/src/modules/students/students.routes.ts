import { Router } from 'express';
import { z } from 'zod';
import { db } from '../../lib/db';
import { authenticate, requireRole } from '../../middleware/auth';
import { validate } from '../../middleware/validate';
import { qrPng, qrSvg } from '../../lib/qr';

const router = Router();
router.use(authenticate);

const listQuery = z.object({
  establishment_id: z.string().uuid().optional(),
  search: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(25),
});

const createSchema = z.object({
  establishment_id: z.string().uuid(),
  run: z.string().min(7),
  full_name: z.string().min(2),
  course: z.string().min(1),
  birth_date: z.string().date().optional(),
  gender: z.enum(['M', 'F', 'X']).optional(),
  photo_url: z.string().url().optional(),
});

const updateSchema = createSchema.partial();

router.get('/', validate(listQuery, 'query'), async (req, res, next) => {
  try {
    const q = req.query as unknown as z.infer<typeof listQuery>;
    const offset = (q.page - 1) * q.limit;
    const params: unknown[] = [req.user!.org];
    let where = `e.organization_id = $1 AND s.status = 'active'`;
    if (q.establishment_id) {
      params.push(q.establishment_id);
      where += ` AND s.establishment_id = $${params.length}`;
    }
    if (q.search) {
      params.push(`%${q.search}%`);
      where += ` AND (s.full_name ILIKE $${params.length} OR s.run ILIKE $${params.length})`;
    }
    params.push(q.limit, offset);
    const rows = await db.many(
      `SELECT s.id, s.run, s.full_name, s.course, s.qr_code, s.status, s.risk_score,
              e.id AS establishment_id, e.name AS establishment_name
         FROM students s
         JOIN establishments e ON e.id = s.establishment_id
        WHERE ${where}
        ORDER BY s.full_name ASC
        LIMIT $${params.length - 1} OFFSET $${params.length}`,
      params,
    );
    const totalRow = await db.one<{ total: string }>(
      `SELECT COUNT(*)::text AS total
         FROM students s
         JOIN establishments e ON e.id = s.establishment_id
        WHERE ${where.replace(/LIMIT.*$/, '')}`,
      params.slice(0, params.length - 2),
    );
    res.json({ data: rows, page: q.page, limit: q.limit, total: Number(totalRow?.total ?? 0) });
  } catch (err) {
    next(err);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const row = await db.oneRequired(
      `SELECT s.*, e.name AS establishment_name
         FROM students s
         JOIN establishments e ON e.id = s.establishment_id
        WHERE s.id = $1 AND e.organization_id = $2`,
      [req.params.id, req.user!.org],
      'student_not_found',
    );
    res.json(row);
  } catch (err) {
    next(err);
  }
});

router.get('/:id/qr', async (req, res, next) => {
  try {
    const s = await db.oneRequired<{ qr_code: string; full_name: string }>(
      `SELECT s.qr_code, s.full_name
         FROM students s
         JOIN establishments e ON e.id = s.establishment_id
        WHERE s.id = $1 AND e.organization_id = $2`,
      [req.params.id, req.user!.org],
      'student_not_found',
    );
    const format = (req.query.format as string) ?? 'png';
    if (format === 'svg') {
      const svg = await qrSvg(s.qr_code);
      res.setHeader('content-type', 'image/svg+xml');
      return res.send(svg);
    }
    const buf = await qrPng(s.qr_code);
    res.setHeader('content-type', 'image/png');
    res.setHeader('content-disposition', `inline; filename="qr-${s.qr_code}.png"`);
    res.send(buf);
  } catch (err) {
    next(err);
  }
});

router.post(
  '/',
  requireRole('admin', 'super_admin', 'docente'),
  validate(createSchema),
  async (req, res, next) => {
    try {
      const d = req.body as z.infer<typeof createSchema>;
      const owned = await db.one<{ id: string }>(
        `SELECT id FROM establishments WHERE id = $1 AND organization_id = $2`,
        [d.establishment_id, req.user!.org],
      );
      if (!owned) return res.status(404).json({ error: 'establishment_not_found' });

      const row = await db.one(
        `INSERT INTO students (establishment_id, run, full_name, course, birth_date, gender, photo_url)
         VALUES ($1,$2,$3,$4,$5,$6,$7)
         RETURNING *`,
        [
          d.establishment_id,
          d.run,
          d.full_name,
          d.course,
          d.birth_date ?? null,
          d.gender ?? null,
          d.photo_url ?? null,
        ],
      );
      res.status(201).json(row);
    } catch (err) {
      next(err);
    }
  },
);

router.patch(
  '/:id',
  requireRole('admin', 'super_admin', 'docente'),
  validate(updateSchema),
  async (req, res, next) => {
    try {
      const d = req.body as z.infer<typeof updateSchema>;
      const fields = Object.keys(d);
      if (fields.length === 0) return res.status(400).json({ error: 'no_changes' });
      const sets = fields.map((k, i) => `${k} = $${i + 3}`).join(', ');
      const values = fields.map((k) => (d as Record<string, unknown>)[k]);
      const row = await db.one(
        `UPDATE students s
            SET ${sets}, updated_at = now()
           FROM establishments e
          WHERE s.establishment_id = e.id
            AND s.id = $1 AND e.organization_id = $2
        RETURNING s.*`,
        [req.params.id, req.user!.org, ...values],
      );
      if (!row) return res.status(404).json({ error: 'student_not_found' });
      res.json(row);
    } catch (err) {
      next(err);
    }
  },
);

router.delete('/:id', requireRole('admin', 'super_admin'), async (req, res, next) => {
  try {
    const row = await db.one(
      `UPDATE students s
          SET status = 'inactive', updated_at = now()
         FROM establishments e
        WHERE s.establishment_id = e.id
          AND s.id = $1 AND e.organization_id = $2
      RETURNING s.id`,
      [req.params.id, req.user!.org],
    );
    if (!row) return res.status(404).json({ error: 'student_not_found' });
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

export default router;
