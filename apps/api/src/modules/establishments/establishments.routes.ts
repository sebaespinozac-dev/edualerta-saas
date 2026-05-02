import { Router } from 'express';
import { z } from 'zod';
import { db } from '../../lib/db';
import { authenticate, requireRole } from '../../middleware/auth';
import { validate } from '../../middleware/validate';

const router = Router();
router.use(authenticate);

const createSchema = z.object({
  rbd: z.string().min(3),
  name: z.string().min(2),
  type: z.enum(['Media', 'Basica', 'Parvulo', 'Especial']),
  lat: z.number(),
  lng: z.number(),
  address: z.string().optional(),
  phone: z.string().optional(),
  principal_name: z.string().optional(),
});

router.get('/', async (req, res, next) => {
  try {
    const rows = await db.many(
      `SELECT id, rbd, name, type, lat, lng, address, phone, principal_name, created_at
         FROM establishments
         WHERE organization_id = $1
         ORDER BY name ASC`,
      [req.user!.org],
    );
    res.json({ data: rows, total: rows.length });
  } catch (err) {
    next(err);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const row = await db.oneRequired(
      `SELECT * FROM establishments WHERE id = $1 AND organization_id = $2`,
      [req.params.id, req.user!.org],
      'establishment_not_found',
    );
    res.json(row);
  } catch (err) {
    next(err);
  }
});

router.post('/', requireRole('admin', 'super_admin'), validate(createSchema), async (req, res, next) => {
  try {
    const data = req.body as z.infer<typeof createSchema>;
    const row = await db.one(
      `INSERT INTO establishments
        (organization_id, rbd, name, type, lat, lng, address, phone, principal_name)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
       RETURNING *`,
      [
        req.user!.org,
        data.rbd,
        data.name,
        data.type,
        data.lat,
        data.lng,
        data.address ?? null,
        data.phone ?? null,
        data.principal_name ?? null,
      ],
    );
    res.status(201).json(row);
  } catch (err) {
    next(err);
  }
});

export default router;
