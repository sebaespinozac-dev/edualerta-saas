import { Router } from 'express';
import { db } from '../../lib/db';
import { authenticate } from '../../middleware/auth';

const router = Router();
router.use(authenticate);

// Guardian fetches their own children (by email match to guardians table)
router.get('/me/students', async (req, res, next) => {
  try {
    const rows = await db.many(
      `SELECT s.id, s.run, s.full_name, s.course, s.photo_url, s.risk_score,
              e.id AS establishment_id, e.name AS establishment_name,
              e.rbd, e.lat, e.lng, e.phone AS establishment_phone
         FROM students s
         JOIN establishments e ON e.id = s.establishment_id
         JOIN student_guardians sg ON sg.student_id = s.id
         JOIN guardians g ON g.id = sg.guardian_id
         JOIN users u ON u.email = g.email
        WHERE u.id = $1 AND s.status = 'active'
        ORDER BY s.full_name`,
      [req.user!.sub],
    );
    res.json({ data: rows });
  } catch (err) { next(err); }
});

// Today's attendance for guardian's children
router.get('/me/attendance', async (req, res, next) => {
  try {
    const rows = await db.many(
      `SELECT a.id, a.timestamp, a.type, a.method,
              s.id AS student_id, s.full_name AS student_name
         FROM attendance a
         JOIN students s ON s.id = a.student_id
         JOIN student_guardians sg ON sg.student_id = s.id
         JOIN guardians g ON g.id = sg.guardian_id
         JOIN users u ON u.email = g.email
        WHERE u.id = $1
          AND a.timestamp::date = CURRENT_DATE
        ORDER BY a.timestamp DESC`,
      [req.user!.sub],
    );
    res.json({ data: rows });
  } catch (err) { next(err); }
});

export default router;
