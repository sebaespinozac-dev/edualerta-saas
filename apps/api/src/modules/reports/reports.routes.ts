import { Router } from 'express';
import { z } from 'zod';
import PDFDocument from 'pdfkit';
import ExcelJS from 'exceljs';
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

interface AttendanceReportRow {
  student_name: string;
  course: string;
  establishment_name: string;
  check_ins: string;
  check_outs: string;
}

interface AlertReportRow {
  type: string;
  level: string;
  status: string;
  establishment_name: string;
  message: string | null;
  created_at: string;
}

router.post('/generate', validate(generateSchema), async (req, res, next) => {
  try {
    const d = req.body as z.infer<typeof generateSchema>;
    const orgId = req.user!.org;

    await db.one<{ id: string }>(
      `INSERT INTO reports (organization_id, type, generated_by, parameters)
       VALUES ($1,$2,$3,$4) RETURNING id`,
      [orgId, d.type, req.user!.sub, JSON.stringify(d.parameters)],
    );

    if (d.type === 'asistencia_mensual' || d.type === 'asistencia_curso') {
      const rows = await db.many<AttendanceReportRow>(
        `SELECT s.full_name AS student_name, s.course,
                e.name AS establishment_name,
                COUNT(*) FILTER (WHERE a.type='check_in')::text AS check_ins,
                COUNT(*) FILTER (WHERE a.type='check_out')::text AS check_outs
           FROM students s
           JOIN establishments e ON e.id = s.establishment_id
           LEFT JOIN attendance a ON a.student_id = s.id
             AND a.timestamp >= NOW() - interval '30 days'
          WHERE e.organization_id = $1 AND s.status = 'active'
          GROUP BY s.id, s.full_name, s.course, e.name
          ORDER BY e.name, s.course, s.full_name`,
        [orgId],
      );

      if (d.format === 'xlsx') {
        return sendExcel(res, 'Asistencia', rows, [
          { header: 'Alumno', key: 'student_name', width: 30 },
          { header: 'Curso', key: 'course', width: 15 },
          { header: 'Establecimiento', key: 'establishment_name', width: 35 },
          { header: 'Entradas', key: 'check_ins', width: 12 },
          { header: 'Salidas', key: 'check_outs', width: 12 },
        ]);
      }
      return sendPdf(res, 'Reporte de Asistencia Mensual', rows.map((r) => [
        r.student_name, r.course, r.establishment_name, r.check_ins, r.check_outs,
      ]), ['Alumno', 'Curso', 'Establecimiento', 'Entradas', 'Salidas']);
    }

    if (d.type === 'incidentes_alertas') {
      const rows = await db.many<AlertReportRow>(
        `SELECT a.type, a.level, a.status, e.name AS establishment_name,
                a.message, a.created_at::text
           FROM alerts a
           JOIN establishments e ON e.id = a.establishment_id
          WHERE e.organization_id = $1
          ORDER BY a.created_at DESC
          LIMIT 500`,
        [orgId],
      );

      if (d.format === 'xlsx') {
        return sendExcel(res, 'Alertas', rows, [
          { header: 'Tipo', key: 'type', width: 20 },
          { header: 'Nivel', key: 'level', width: 12 },
          { header: 'Estado', key: 'status', width: 15 },
          { header: 'Establecimiento', key: 'establishment_name', width: 35 },
          { header: 'Mensaje', key: 'message', width: 40 },
          { header: 'Fecha', key: 'created_at', width: 20 },
        ]);
      }
      return sendPdf(res, 'Reporte de Incidentes y Alertas', rows.map((r) => [
        r.type, r.level, r.status, r.establishment_name, r.message ?? '', r.created_at,
      ]), ['Tipo', 'Nivel', 'Estado', 'Establecimiento', 'Mensaje', 'Fecha']);
    }

    res.status(202).json({ status: 'queued', type: d.type, format: d.format });
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

function sendPdf(
  res: import('express').Response,
  title: string,
  rows: string[][],
  headers: string[],
) {
  const doc = new PDFDocument({ size: 'LETTER', margin: 50 });
  res.setHeader('content-type', 'application/pdf');
  res.setHeader('content-disposition', `attachment; filename="${title}.pdf"`);
  doc.pipe(res);

  doc.fontSize(18).text(title, { align: 'center' });
  doc.moveDown(0.5);
  doc.fontSize(10).fillColor('#666').text(
    `CMDS Antofagasta — Generado el ${new Date().toLocaleDateString('es-CL')}`,
    { align: 'center' },
  );
  doc.moveDown(1);

  const colWidth = (doc.page.width - 100) / headers.length;
  const startX = 50;
  let y = doc.y;

  doc.fontSize(8).fillColor('#1a2e5a');
  headers.forEach((h, i) => {
    doc.text(h, startX + i * colWidth, y, { width: colWidth, align: 'left' });
  });
  y += 15;
  doc.moveTo(startX, y).lineTo(doc.page.width - 50, y).stroke('#ccc');
  y += 5;

  doc.fillColor('#333');
  for (const row of rows) {
    if (y > doc.page.height - 80) {
      doc.addPage();
      y = 50;
    }
    row.forEach((cell, i) => {
      doc.text(cell ?? '', startX + i * colWidth, y, { width: colWidth, align: 'left' });
    });
    y += 14;
  }

  doc.end();
}

async function sendExcel(
  res: import('express').Response,
  sheetName: string,
  rows: object[],
  columns: { header: string; key: string; width: number }[],
) {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'EduAlerta - CMDS Antofagasta';
  const sheet = workbook.addWorksheet(sheetName);
  sheet.columns = columns;

  sheet.getRow(1).font = { bold: true, size: 10, color: { argb: 'FF1A2E5A' } };
  sheet.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFF0F4FF' },
  };

  for (const row of rows) {
    sheet.addRow(row);
  }

  res.setHeader('content-type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('content-disposition', `attachment; filename="${sheetName}.xlsx"`);
  await workbook.xlsx.write(res);
  res.end();
}

export default router;
