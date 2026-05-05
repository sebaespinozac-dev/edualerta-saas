import { Router } from 'express';
import { z } from 'zod';
import { db } from '../../lib/db';
import { authenticate } from '../../middleware/auth';
import { validate } from '../../middleware/validate';
import { HttpError } from '../../middleware/errorHandler';
import { getIO } from '../../lib/socket';

const router = Router();
router.use(authenticate);

const checkInSchema = z
  .object({
    qr_code: z.string().uuid().optional(),
    student_id: z.string().uuid().optional(),
    type: z.enum(['check_in', 'check_out']).default('check_in'),
    method: z.enum(['qr', 'manual', 'biometric']).default('qr'),
    lat: z.number().optional(),
    lng: z.number().optional(),
  })
  .refine((d) => d.qr_code || d.student_id, {
    message: 'qr_code or student_id required',
  });

router.post('/check-in', validate(checkInSchema), async (req, res, next) => {
  try {
    const d = req.body as z.infer<typeof checkInSchema>;

    const student = await db.one<{
      id: string;
      establishment_id: string;
      full_name: string;
      organization_id: string;
    }>(
      `SELECT s.id, s.establishment_id, s.full_name, e.organization_id
         FROM students s
         JOIN establishments e ON e.id = s.establishment_id
        WHERE ${d.qr_code ? 's.qr_code = $1' : 's.id = $1'}
          AND e.organization_id = $2
          AND s.status = 'active'`,
      [d.qr_code ?? d.student_id, req.user!.org],
    );

    if (!student) throw new HttpError(404, 'Student not found or inactive', 'student_not_found');

    const row = await db.one(
      `INSERT INTO attendance
        (student_id, establishment_id, timestamp, type, method, lat, lng, recorded_by)
       VALUES ($1, $2, now(), $3, $4, $5, $6, $7)
       RETURNING *`,
      [
        student.id,
        student.establishment_id,
        d.type,
        d.method,
        d.lat ?? null,
        d.lng ?? null,
        req.user!.sub,
      ],
    );

    const payload = {
      ...row,
      student: { id: student.id, full_name: student.full_name },
    };

    try {
      const io = getIO();
      io.of('/realtime')
        .to(`org:${req.user!.org}`)
        .emit('attendance', payload);
    } catch { /* socket may not be initialized in tests */ }

    res.status(201).json(payload);
  } catch (err) {
    next(err);
  }
});

const listQuery = z.object({
  establishment_id: z.string().uuid().optional(),
  date: z.string().date().optional(),
  student_id: z.string().uuid().optional(),
});

router.get('/', validate(listQuery, 'query'), async (req, res, next) => {
  try {
    const q = req.query as unknown as z.infer<typeof listQuery>;
    const params: unknown[] = [req.user!.org];
    let where = `e.organization_id = $1`;
    if (q.establishment_id) {
      params.push(q.establishment_id);
      where += ` AND a.establishment_id = $${params.length}`;
    }
    if (q.student_id) {
      params.push(q.student_id);
      where += ` AND a.student_id = $${params.length}`;
    }
    if (q.date) {
      params.push(q.date);
      where += ` AND a.timestamp::date = $${params.length}::date`;
    }
    const rows = await db.many(
      `SELECT a.id, a.timestamp, a.type, a.method,
              s.id AS student_id, s.full_name AS student_name,
              e.id AS establishment_id, e.name AS establishment_name
         FROM attendance a
         JOIN students s ON s.id = a.student_id
         JOIN establishments e ON e.id = a.establishment_id
        WHERE ${where}
        ORDER BY a.timestamp DESC
        LIMIT 500`,
      params,
    );
    res.json({ data: rows, total: rows.length });
  } catch (err) {
    next(err);
  }
});

router.get('/stats', async (req, res, next) => {
  try {
    const stats = await db.many<{ day: string; check_ins: string; check_outs: string }>(
      `SELECT a.timestamp::date::text AS day,
              COUNT(*) FILTER (WHERE a.type='check_in')::text  AS check_ins,
              COUNT(*) FILTER (WHERE a.type='check_out')::text AS check_outs
         FROM attendance a
         JOIN establishments e ON e.id = a.establishment_id
        WHERE e.organization_id = $1
          AND a.timestamp >= now() - interval '7 days'
        GROUP BY day
        ORDER BY day DESC`,
      [req.user!.org],
    );
    res.json({ data: stats });
  } catch (err) {
    next(err);
  }
});

export default router;
