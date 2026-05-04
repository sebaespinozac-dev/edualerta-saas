import { Router } from 'express';
import { z } from 'zod';
import { db } from '../../lib/db';
import { authenticate, requireRole } from '../../middleware/auth';
import { validate } from '../../middleware/validate';
import { sendSms, sendWhatsApp, twilioConfigured } from '../../lib/twilio';

const router = Router();
router.use(authenticate);

const broadcastSchema = z.object({
  subject: z.string().min(1).max(200),
  message: z.string().min(1).max(2000),
  channels: z.array(z.enum(['sms', 'whatsapp', 'email', 'app'])).min(1),
  scope: z.enum(['all', 'establishment', 'course']),
  establishment_id: z.string().uuid().optional(),
  course: z.string().optional(),
});

router.post(
  '/broadcast',
  requireRole('admin', 'super_admin'),
  validate(broadcastSchema),
  async (req, res, next) => {
    try {
      const d = req.body as z.infer<typeof broadcastSchema>;
      const orgId = req.user!.org;

      let where = `e.organization_id = $1 AND s.status = 'active'`;
      const params: unknown[] = [orgId];

      if (d.scope === 'establishment' && d.establishment_id) {
        params.push(d.establishment_id);
        where += ` AND s.establishment_id = $${params.length}`;
      }
      if (d.scope === 'course' && d.course) {
        params.push(d.course);
        where += ` AND s.course = $${params.length}`;
      }

      const guardians = await db.many<{ phone: string | null; full_name: string }>(
        `SELECT DISTINCT g.phone, g.full_name
           FROM guardians g
           JOIN student_guardians sg ON sg.guardian_id = g.id
           JOIN students s ON s.id = sg.student_id
           JOIN establishments e ON e.id = s.establishment_id
          WHERE ${where} AND g.phone IS NOT NULL`,
        params,
      );

      let smsSent = 0;
      let whatsappSent = 0;

      const body = `${d.subject}\n\n${d.message}\n\n— EduAlerta CMDS Antofagasta`;

      for (const g of guardians) {
        if (!g.phone) continue;
        if (d.channels.includes('sms')) {
          const ok = await sendSms(g.phone, body);
          if (ok) smsSent++;
        }
        if (d.channels.includes('whatsapp')) {
          const ok = await sendWhatsApp(g.phone, body);
          if (ok) whatsappSent++;
        }
      }

      res.json({
        recipients: guardians.length,
        sms_sent: smsSent,
        whatsapp_sent: whatsappSent,
        twilio_configured: twilioConfigured,
      });
    } catch (err) {
      next(err);
    }
  },
);

router.post(
  '/student-alert',
  validate(
    z.object({
      student_id: z.string().uuid(),
      type: z.enum(['check_in', 'check_out', 'late', 'emergency']),
      message: z.string().max(500).optional(),
    }),
  ),
  async (req, res, next) => {
    try {
      const d = req.body;
      const guardians = await db.many<{ phone: string | null; full_name: string }>(
        `SELECT g.phone, g.full_name
           FROM guardians g
           JOIN student_guardians sg ON sg.guardian_id = g.id
          WHERE sg.student_id = $1 AND g.phone IS NOT NULL`,
        [d.student_id],
      );

      const labels: Record<string, string> = {
        check_in: 'ha ingresado al establecimiento',
        check_out: 'ha salido del establecimiento',
        late: 'registra un atraso',
        emergency: '¡ALERTA DE EMERGENCIA!',
      };

      const body = d.message ?? `Su pupilo(a) ${labels[d.type]}. — EduAlerta`;

      let sent = 0;
      for (const g of guardians) {
        if (!g.phone) continue;
        const ok = await sendSms(g.phone, body);
        if (ok) sent++;
      }

      res.json({ recipients: guardians.length, sent });
    } catch (err) {
      next(err);
    }
  },
);

export default router;
