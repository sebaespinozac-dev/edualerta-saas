import { Router } from 'express';
import { z } from 'zod';
import { db } from '../../lib/db';
import { authenticate } from '../../middleware/auth';
import { validate } from '../../middleware/validate';
import { emitAlert } from '../../lib/socket';

const router = Router();
router.use(authenticate);

const triggerSchema = z.object({
  establishment_id: z.string().uuid(),
  student_id: z.string().uuid().optional(),
  type: z.enum(['panic', 'medical', 'evacuation', 'intruder', 'missing_student', 'late_pickup']),
  level: z.enum(['info', 'warning', 'critical']).default('warning'),
  message: z.string().max(2000).optional(),
});

router.post('/', validate(triggerSchema), async (req, res, next) => {
  try {
    const d = req.body as z.infer<typeof triggerSchema>;
    const owned = await db.one<{ id: string }>(
      `SELECT id FROM establishments WHERE id = $1 AND organization_id = $2`,
      [d.establishment_id, req.user!.org],
    );
    if (!owned) return res.status(404).json({ error: 'establishment_not_found' });

    const row = await db.one<{
      id: string;
      establishment_id: string;
      type: string;
      level: string;
      status: string;
      created_at: string;
    }>(
      `INSERT INTO alerts (establishment_id, student_id, type, level, status, message, triggered_by)
       VALUES ($1,$2,$3,$4,'active',$5,$6)
       RETURNING *`,
      [
        d.establishment_id,
        d.student_id ?? null,
        d.type,
        d.level,
        d.message ?? null,
        req.user!.sub,
      ],
    );

    if (row) emitAlert({ ...row });
    res.status(201).json(row);
  } catch (err) {
    next(err);
  }
});

router.post('/:id/acknowledge', async (req, res, next) => {
  try {
    const row = await db.one(
      `UPDATE alerts a
          SET status = 'acknowledged',
              acknowledged_by = $1
         FROM establishments e
        WHERE a.establishment_id = e.id
          AND a.id = $2
          AND e.organization_id = $3
          AND a.status = 'active'
      RETURNING a.*`,
      [req.user!.sub, req.params.id, req.user!.org],
    );
    if (!row) return res.status(404).json({ error: 'alert_not_found_or_already_handled' });
    res.json(row);
  } catch (err) {
    next(err);
  }
});

router.post('/:id/resolve', async (req, res, next) => {
  try {
    const row = await db.one(
      `UPDATE alerts a
          SET status = 'resolved',
              resolved_at = now()
         FROM establishments e
        WHERE a.establishment_id = e.id
          AND a.id = $1
          AND e.organization_id = $2
      RETURNING a.*`,
      [req.params.id, req.user!.org],
    );
    if (!row) return res.status(404).json({ error: 'alert_not_found' });
    res.json(row);
  } catch (err) {
    next(err);
  }
});

const listQuery = z.object({
  status: z.enum(['active', 'acknowledged', 'resolved']).optional(),
  establishment_id: z.string().uuid().optional(),
});

router.get('/', validate(listQuery, 'query'), async (req, res, next) => {
  try {
    const q = req.query as unknown as z.infer<typeof listQuery>;
    const params: unknown[] = [req.user!.org];
    let where = `e.organization_id = $1`;
    if (q.status) {
      params.push(q.status);
      where += ` AND a.status = $${params.length}`;
    }
    if (q.establishment_id) {
      params.push(q.establishment_id);
      where += ` AND a.establishment_id = $${params.length}`;
    }
    const rows = await db.many(
      `SELECT a.*, e.name AS establishment_name
         FROM alerts a
         JOIN establishments e ON e.id = a.establishment_id
        WHERE ${where}
        ORDER BY a.created_at DESC
        LIMIT 200`,
      params,
    );
    res.json({ data: rows, total: rows.length });
  } catch (err) {
    next(err);
  }
});

export default router;
