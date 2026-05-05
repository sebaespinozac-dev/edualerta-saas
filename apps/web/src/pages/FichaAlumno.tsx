import { useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Calendar,
  Download,
  FileText,
  Mail,
  MapPin,
  Phone,
  User,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import { students, schools } from '@/lib/mock-data';

/* ------------------------------------------------------------------ */
/*  Mock data local to this page                                      */
/* ------------------------------------------------------------------ */

const mockAttendanceLog = [
  { id: 1, date: '02/05/2026', time: '07:58', type: 'Entrada' as const, who: 'Sistema biometrico' },
  { id: 2, date: '02/05/2026', time: '13:05', type: 'Salida' as const, who: 'Sistema biometrico' },
  { id: 3, date: '30/04/2026', time: '07:55', type: 'Entrada' as const, who: 'Sistema biometrico' },
  { id: 4, date: '30/04/2026', time: '11:30', type: 'Retiro' as const, who: 'Maria Gonzalez (apoderada)' },
  { id: 5, date: '29/04/2026', time: '08:02', type: 'Entrada' as const, who: 'Sistema biometrico' },
  { id: 6, date: '29/04/2026', time: '15:30', type: 'Salida' as const, who: 'Sistema biometrico' },
  { id: 7, date: '28/04/2026', time: '07:50', type: 'Entrada' as const, who: 'Sistema biometrico' },
  { id: 8, date: '28/04/2026', time: '15:30', type: 'Salida' as const, who: 'Sistema biometrico' },
  { id: 9, date: '25/04/2026', time: '08:10', type: 'Entrada' as const, who: 'Sistema biometrico' },
  { id: 10, date: '25/04/2026', time: '12:00', type: 'Retiro' as const, who: 'Carlos Rojas (apoderado)' },
];

const mockNotices = [
  {
    id: 1,
    date: '30/04/2026',
    title: 'Citacion apoderado',
    description: 'Se solicita la presencia del apoderado para reunion con profesor jefe el dia 05/05/2026 a las 16:00 hrs.',
    severity: 'warning' as const,
  },
  {
    id: 2,
    date: '28/04/2026',
    title: 'Uniforme incompleto',
    description: 'El alumno asistio sin buzo deportivo en clase de educacion fisica. Favor regularizar.',
    severity: 'info' as const,
  },
  {
    id: 3,
    date: '22/04/2026',
    title: 'Destacado en actividad',
    description: 'Felicitaciones. El alumno participo destacadamente en la Feria de Ciencias del establecimiento.',
    severity: 'info' as const,
  },
  {
    id: 4,
    date: '15/04/2026',
    title: 'Atraso reiterado',
    description: 'Se registran 3 atrasos en las ultimas 2 semanas. Favor tomar las medidas necesarias para asegurar la puntualidad.',
    severity: 'urgent' as const,
  },
];

const mockDocuments = [
  { id: 1, name: 'Informe de notas 1er semestre.pdf', size: '245 KB' },
  { id: 2, name: 'Certificado de alumno regular.pdf', size: '120 KB' },
  { id: 3, name: 'Protocolo de seguridad.pdf', size: '1.2 MB' },
];

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function typeBadge(type: 'Entrada' | 'Salida' | 'Retiro') {
  if (type === 'Entrada') return <Badge tone="success" dot>{type}</Badge>;
  if (type === 'Salida') return <Badge tone="accent" dot>{type}</Badge>;
  return <Badge tone="warning" dot>{type}</Badge>;
}

function severityBadge(severity: 'info' | 'warning' | 'urgent') {
  if (severity === 'info') return <Badge tone="accent">Informativo</Badge>;
  if (severity === 'warning') return <Badge tone="warning">Aviso</Badge>;
  return <Badge tone="danger">Urgente</Badge>;
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function FichaAlumno() {
  const { id } = useParams<{ id: string }>();

  const student = useMemo(() => students.find((s) => s.id === id), [id]);
  const school = useMemo(
    () => (student ? schools.find((s) => s.rbd === student.schoolRbd) : undefined),
    [student],
  );

  if (!student) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <p className="text-sm text-muted">Alumno no encontrado</p>
        <Link to="/alumnos" className="mt-4">
          <Button variant="secondary" size="sm">
            <ArrowLeft className="h-3.5 w-3.5" strokeWidth={1.75} />
            Volver al listado
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back link */}
      <Link
        to="/alumnos"
        className="inline-flex items-center gap-1.5 text-xs text-muted hover:text-text transition-colors"
      >
        <ArrowLeft className="h-3.5 w-3.5" strokeWidth={1.75} />
        Volver al listado
      </Link>

      {/* Header */}
      <Card className="p-5">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
          <Avatar
            name={student.name}
            src={student.photoUrl}
            size={80}
            className="flex-none ring-4 ring-accent/10"
          />
          <div className="flex-1 text-center sm:text-left">
            <h1 className="text-lg font-semibold text-text">{student.name}</h1>
            <div className="mt-1 flex flex-wrap items-center justify-center sm:justify-start gap-2 text-xs text-muted">
              <span className="tabular">{student.run}</span>
              <span className="text-border">|</span>
              <span>ID: {student.id}</span>
            </div>
            <div className="mt-2 flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-600/10 dark:bg-blue-500/10 dark:text-blue-400 dark:ring-blue-500/20">
                {student.grade}
              </span>
              {student.status === 'presente' ? (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-0.5 text-2xs font-semibold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">
                  <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Presente
                </span>
              ) : student.status === 'ausente' ? (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-2.5 py-0.5 text-2xs font-semibold text-red-700 dark:bg-red-500/10 dark:text-red-400">
                  <span className="size-1.5 rounded-full bg-red-500" />
                  Ausente
                </span>
              ) : (
                <Badge tone="default" dot>Retirado</Badge>
              )}
            </div>
            {school && (
              <p className="mt-1.5 text-xs text-muted">{school.name}</p>
            )}
          </div>
        </div>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="info">
        <TabsList className="w-full overflow-x-auto">
          <TabsTrigger value="info">Informacion</TabsTrigger>
          <TabsTrigger value="attendance">Asistencia</TabsTrigger>
          <TabsTrigger value="notices">Avisos</TabsTrigger>
          <TabsTrigger value="documents">Documentos</TabsTrigger>
        </TabsList>

        {/* Tab: Informacion */}
        <TabsContent value="info" className="mt-4 space-y-4">
          <Card className="overflow-hidden">
            <div className="border-b border-border px-4 py-2.5 text-xs font-semibold text-text">
              Datos personales
            </div>
            <div className="divide-y divide-border">
              <InfoRow icon={User} label="Nombre completo" value={student.name} />
              <InfoRow icon={FileText} label="RUT" value={student.run} />
              <InfoRow icon={Calendar} label="Fecha de nacimiento" value="15 marzo 2012" />
              <InfoRow icon={MapPin} label="Direccion" value="Av. Argentina 1234, Antofagasta" />
            </div>
          </Card>

          <Card className="overflow-hidden">
            <div className="border-b border-border px-4 py-2.5 text-xs font-semibold text-text">
              Apoderado titular
            </div>
            <div className="divide-y divide-border">
              <InfoRow icon={User} label="Nombre" value={student.guardianName} />
              <InfoRow icon={Phone} label="Telefono" value={student.guardianPhone} />
              <InfoRow icon={Mail} label="Email" value="apoderado@email.cl" />
            </div>
          </Card>

          <Card className="overflow-hidden">
            <div className="border-b border-border px-4 py-2.5 text-xs font-semibold text-text">
              Contactos de emergencia
            </div>
            <div className="divide-y divide-border">
              <div className="px-4 py-3">
                <div className="text-xs font-medium text-text">Ana Martinez Soto</div>
                <div className="text-2xs text-muted mt-0.5">Tia - +56 9 8765 4321</div>
              </div>
              <div className="px-4 py-3">
                <div className="text-xs font-medium text-text">Pedro Gonzalez Rojas</div>
                <div className="text-2xs text-muted mt-0.5">Abuelo - +56 9 1234 5678</div>
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* Tab: Asistencia */}
        <TabsContent value="attendance" className="mt-4 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Card className="p-4 text-center">
              <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 tabular">92.5%</div>
              <div className="mt-1 text-2xs text-muted">Asistencia este mes</div>
            </Card>
            <Card className="p-4 text-center">
              <div className="text-2xl font-bold text-accent tabular">95.1%</div>
              <div className="mt-1 text-2xs text-muted">Asistencia anual</div>
            </Card>
          </div>

          <Card className="overflow-hidden">
            <div className="border-b border-border px-4 py-2.5 text-xs font-semibold text-text">
              Registro reciente de entradas y salidas
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-border bg-bg/40">
                  <tr>
                    {['Fecha', 'Hora', 'Tipo', 'Responsable'].map((h) => (
                      <th
                        key={h}
                        className="px-4 py-2 text-left text-2xs font-medium uppercase tracking-wider text-muted"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {mockAttendanceLog.map((row) => (
                    <tr key={row.id} className="border-b border-border last:border-b-0">
                      <td className="px-4 py-2.5 text-xs text-text tabular">{row.date}</td>
                      <td className="px-4 py-2.5 text-xs text-text tabular">{row.time}</td>
                      <td className="px-4 py-2.5">{typeBadge(row.type)}</td>
                      <td className="px-4 py-2.5 text-xs text-muted">{row.who}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </TabsContent>

        {/* Tab: Avisos */}
        <TabsContent value="notices" className="mt-4 space-y-3">
          {mockNotices.map((notice) => (
            <Card key={notice.id} className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-xs font-semibold text-text">{notice.title}</h3>
                    {severityBadge(notice.severity)}
                  </div>
                  <p className="mt-1.5 text-xs text-muted leading-relaxed">{notice.description}</p>
                </div>
                <span className="flex-none text-2xs text-muted tabular whitespace-nowrap">{notice.date}</span>
              </div>
            </Card>
          ))}
        </TabsContent>

        {/* Tab: Documentos */}
        <TabsContent value="documents" className="mt-4">
          <Card className="overflow-hidden">
            <div className="border-b border-border px-4 py-2.5 text-xs font-semibold text-text">
              Código QR del alumno
            </div>
            <div className="flex items-center justify-between px-4 py-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="flex size-8 flex-none items-center justify-center rounded-md border border-border bg-bg text-muted">
                  <FileText className="h-4 w-4" strokeWidth={1.5} />
                </div>
                <div>
                  <div className="text-xs font-medium text-text">QR de acceso al establecimiento</div>
                  <div className="text-2xs text-muted">Para portería — escanear al ingreso/salida</div>
                </div>
              </div>
              <a
                href={`/api/v1/students/${student.id}/qr?format=png`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-7 items-center gap-1.5 rounded-md px-2.5 text-xs font-medium text-muted hover:bg-bg hover:text-text transition-colors"
                aria-label="Descargar QR"
              >
                <Download className="h-3.5 w-3.5" strokeWidth={1.75} />
                Descargar
              </a>
            </div>
          </Card>

          <Card className="overflow-hidden mt-4">
            <div className="border-b border-border px-4 py-2.5 text-xs font-semibold text-text">
              Documentos compartidos
            </div>
            <ul className="divide-y divide-border">
              {mockDocuments.map((doc) => (
                <li key={doc.id} className="flex items-center justify-between px-4 py-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex size-8 flex-none items-center justify-center rounded-md border border-border bg-bg text-muted">
                      <FileText className="h-4 w-4" strokeWidth={1.5} />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-medium text-text truncate">{doc.name}</div>
                      <div className="text-2xs text-muted">{doc.size}</div>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" aria-label={`Descargar ${doc.name}`}>
                    <Download className="h-3.5 w-3.5" strokeWidth={1.75} />
                  </Button>
                </li>
              ))}
            </ul>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Small helper component                                            */
/* ------------------------------------------------------------------ */

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<Record<string, unknown>>;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3 px-4 py-3">
      <Icon className="h-4 w-4 flex-none text-muted" strokeWidth={1.5} />
      <div className="min-w-0 flex-1">
        <div className="text-2xs text-muted">{label}</div>
        <div className="text-xs text-text">{value}</div>
      </div>
    </div>
  );
}
