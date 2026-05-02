import { Router } from 'express';
import { z } from 'zod';
import { db } from '../../lib/db';
import { authenticate } from '../../middleware/auth';
import { validate } from '../../middleware/validate';

const router = Router();
router.use(authenticate);

const generateSchema = z.object({
  type: z.enum([
    'asistencia_mensual',
    'cumplimiento_ley_21809',
    'incidentes_alertas',
    'acceso_apoderado',
    'asistencia_curso',
    'auditoria_acceso',
  ]),
  parameters: z.record(z.string(), z.any()).default({}),
  format: z.enum(['pdf', 'xlsx']).default('pdf'),
});

router.post('/generate', validate(generateSchema), async (req, res, next) => {
  try {
    const d = req.body as z.infer<typeof generateSchema>;
    // Stub: real implementation would enqueue a job to render PDF/XLSX
    // and store in object storage, returning a signed URL.
    const row = await db.one<{ id: string; created_at: string }>(
      `INSERT INTO reports (organization_id, type, generated_by, parameters)
       VALUES ($1,$2,$3,$4)
       RETURNING id, created_at`,
      [req.user!.org, d.type, req.user!.sub, JSON.stringify(d.parameters)],
    );
    res.status(202).json({
      id: row?.id,
      status: 'queued',
      type: d.type,
      format: d.format,
      created_at: row?.created_at,
    });
  } catch (err) {
    next(err);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const row = await db.oneRequired(
      `SELECT * FROM reports WHERE id = $1 AND organization_id = $2`,
      [req.params.id, req.user!.org],
      'report_not_found',
    );
    res.json(row);
  } catch (err) {
    next(err);
  }
});

export default router;
