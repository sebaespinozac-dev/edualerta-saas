import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  AlertTriangle,
  Bell,
  ChevronRight,
  ClipboardList,
  ExternalLink,
  LogIn,
  LogOut,
  MessageCircle,
  Phone,
  ShieldAlert,
  ShieldCheck,
  Smartphone,
} from 'lucide-react';
import { toast } from 'sonner';
import { Logo } from '@/components/layout/Logo';
import { Card } from '@/components/ui/Card';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/Dialog';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { students, schools } from '@/lib/mock-data';
import { api } from '@/lib/api';

interface ApiStudent {
  id: string;
  full_name: string;
  course: string;
  photo_url: string | null;
  establishment_name: string;
  establishment_phone: string | null;
  risk_score: number | null;
}

interface ApiAttendance {
  id: string;
  timestamp: string;
  type: 'check_in' | 'check_out';
  student_name: string;
}

const _mockChild = students[0];
const _mockChildSchool = schools.find((s) => s.rbd === _mockChild.schoolRbd)!;

const timeline = [
  { time: '07:58', label: 'Ingreso registrado', kind: 'in' as const, ok: true },
  { time: '10:30', label: 'Recreo', kind: 'recess' as const, ok: true },
  { time: '13:00', label: 'Almuerzo', kind: 'lunch' as const, ok: true },
  { time: '15:30', label: 'Salida estimada', kind: 'pending' as const, ok: false },
];

const MOCK_NOTIFICATIONS_TEMPLATE = [
  {
    id: '1',
    icon: 'entrada' as const,
    message: 'Su hijo/a ingreso al establecimiento',
    time: 'Hoy 07:58',
  },
  {
    id: '2',
    icon: 'retiro' as const,
    message: 'Su hijo/a fue retirado/a ayer a las 15:35',
    time: 'Ayer 15:35',
  },
  {
    id: '3',
    icon: 'alerta' as const,
    message: 'Alerta general activada en el establecimiento',
    time: 'Hace 3 dias',
  },
];

const recentAttendanceLog = [
  { id: 1, date: '02/05/2026', time: '07:58', type: 'Entrada' as const, who: 'Sistema biometrico' },
  { id: 2, date: '30/04/2026', time: '15:30', type: 'Salida' as const, who: 'Sistema biometrico' },
  { id: 3, date: '30/04/2026', time: '07:55', type: 'Entrada' as const, who: 'Sistema biometrico' },
  { id: 4, date: '29/04/2026', time: '11:30', type: 'Retiro' as const, who: 'Maria Gonzalez (apoderada)' },
  { id: 5, date: '29/04/2026', time: '08:02', type: 'Entrada' as const, who: 'Sistema biometrico' },
];

const inspectoriaNotices = [
  {
    id: 1,
    date: '30/04/2026',
    title: 'Citacion apoderado',
    description: 'Reunion con profesor jefe el 05/05/2026 a las 16:00 hrs.',
    severity: 'warning' as const,
  },
  {
    id: 2,
    date: '28/04/2026',
    title: 'Uniforme incompleto',
    description: 'El alumno asistio sin buzo deportivo en clase de educacion fisica.',
    severity: 'info' as const,
  },
];

function typeBadgeSmall(type: 'Entrada' | 'Salida' | 'Retiro') {
  if (type === 'Entrada')
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-2xs font-medium text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">
        <span className="size-1 rounded-full bg-emerald-500" />
        {type}
      </span>
    );
  if (type === 'Salida')
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-0.5 text-2xs font-medium text-blue-700 dark:bg-blue-500/10 dark:text-blue-400">
        <span className="size-1 rounded-full bg-blue-500" />
        {type}
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-2xs font-medium text-amber-700 dark:bg-amber-500/10 dark:text-amber-400">
      <span className="size-1 rounded-full bg-amber-500" />
      {type}
    </span>
  );
}

function NotificationIcon({ kind }: { kind: 'entrada' | 'retiro' | 'alerta' }) {
  if (kind === 'entrada') {
    return (
      <div className="flex size-8 flex-none items-center justify-center rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
        <LogIn className="h-4 w-4" strokeWidth={1.75} />
      </div>
    );
  }
  if (kind === 'retiro') {
    return (
      <div className="flex size-8 flex-none items-center justify-center rounded-full bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
        <LogOut className="h-4 w-4" strokeWidth={1.75} />
      </div>
    );
  }
  return (
    <div className="flex size-8 flex-none items-center justify-center rounded-full bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400">
      <ShieldAlert className="h-4 w-4" strokeWidth={1.75} />
    </div>
  );
}

export function Apoderado() {
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const [alertOpen, setAlertOpen] = useState(false);
  const [smsEnabled, setSmsEnabled] = useState(true);
  const [whatsappEnabled, setWhatsappEnabled] = useState(true);

  const { data: apiStudents } = useQuery({
    queryKey: ['guardian', 'students'],
    queryFn: () => api<{ data: ApiStudent[] }>('/guardians/me/students'),
    select: (r) => r.data,
    retry: false,
  });

  const { data: apiAttendance } = useQuery({
    queryKey: ['guardian', 'attendance'],
    queryFn: () => api<{ data: ApiAttendance[] }>('/guardians/me/attendance'),
    select: (r) => r.data,
    retry: false,
  });

  const apiChild = apiStudents?.[0];
  const childSchoolName = apiChild?.establishment_name ?? _mockChildSchool.name;
  const childName = apiChild?.full_name ?? _mockChild.name;
  const childCourse = apiChild?.course ?? _mockChild.grade;
  const childPhoto = apiChild?.photo_url ?? _mockChild.photoUrl;
  const childStatus = _mockChild.status;
  const childId = apiChild?.id ?? _mockChild.id;
  const guardianPhone = _mockChild.guardianPhone;
  const hasApiData = !!apiChild;

  const mockNotifications = MOCK_NOTIFICATIONS_TEMPLATE.map((n) =>
    n.id === '3' ? { ...n, message: `Alerta general activada en ${childSchoolName}` } : n,
  );

  return (
    <div className="min-h-screen bg-bg pb-24">
      <header className="sticky top-0 z-10 border-b border-border bg-surface/90 px-4 py-2.5 backdrop-blur">
        <div className="mx-auto flex max-w-md items-center justify-between">
          <Logo />
          <div className="flex items-center gap-1.5">
            <button className="relative inline-flex h-8 w-8 items-center justify-center rounded-md text-muted hover:bg-bg hover:text-text">
              <Bell className="h-4 w-4" strokeWidth={1.75} />
              <span className="absolute right-1.5 top-1.5 size-1.5 rounded-full bg-emerald-500" />
            </button>
            <button
              className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted hover:bg-bg hover:text-text"
              onClick={() => {
                signOut();
                navigate('/login');
              }}
            >
              <LogOut className="h-4 w-4" strokeWidth={1.75} />
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-md space-y-3 px-4 py-5">
        {/* Hero card with large photo */}
        <Card className="p-5">
          <div className="flex flex-col items-center text-center gap-3">
            <Avatar
              name={childName}
              src={childPhoto ?? undefined}
              size={80}
              className="ring-4 ring-emerald-500/20"
            />
            <div>
              <div className="text-base font-semibold text-text">{childName}</div>
              <div className="mt-0.5 text-xs text-muted">{childCourse}</div>
              <div className="mt-0.5 text-2xs text-muted">{childSchoolName}</div>
              {hasApiData && (
                <span className="mt-1 inline-flex items-center gap-1 text-2xs text-emerald-600 dark:text-emerald-400">
                  <span className="size-1.5 rounded-full bg-emerald-500" />
                  Datos en tiempo real
                </span>
              )}
            </div>
          </div>
          <div className="mt-4 flex justify-center">
            {childStatus === 'presente' ? (
              <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">
                <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
                Presente - Ingreso 07:58 hrs
              </span>
            ) : (
              <span className="inline-flex items-center gap-2 rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-700 dark:bg-red-500/10 dark:text-red-400">
                <span className="size-2 rounded-full bg-red-500" />
                Ausente hoy
              </span>
            )}
          </div>
        </Card>

        {/* Emergency Alert Button */}
        <Dialog open={alertOpen} onOpenChange={setAlertOpen}>
          <DialogTrigger asChild>
            <button className="flex w-full items-center justify-center gap-2.5 rounded-lg bg-red-600 px-4 py-3.5 text-sm font-semibold text-white shadow-lg shadow-red-500/20 transition-all hover:bg-red-700 hover:shadow-red-500/30 active:scale-[0.98]">
              <AlertTriangle className="h-5 w-5" strokeWidth={2} />
              Alerta de Emergencia
            </button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirmar alerta de emergencia</DialogTitle>
              <DialogDescription>
                Esta accion enviara una alerta de emergencia al establecimiento {childSchoolName}.
                El equipo directivo sera notificado inmediatamente. ¿Deseas continuar?
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setAlertOpen(false)}>
                Cancelar
              </Button>
              <Button
                variant="danger"
                onClick={() => {
                  setAlertOpen(false);
                  toast.success('Alerta enviada al establecimiento');
                }}
              >
                Enviar alerta
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Timeline */}
        <Card className="overflow-hidden">
          <div className="border-b border-border px-4 py-2.5 text-xs font-semibold text-text">
            Hoy - Actividad
          </div>
          <ul>
            {timeline.map((t) => (
              <li
                key={t.time}
                className="flex items-center justify-between border-b border-border px-4 py-3 last:border-b-0"
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`size-1.5 rounded-full ${
                      t.ok ? 'bg-emerald-500' : 'bg-border'
                    }`}
                  />
                  <span
                    className={`text-2xs tabular ${
                      t.ok ? 'text-text' : 'text-muted'
                    }`}
                  >
                    {t.time}
                  </span>
                  <span className={`text-xs ${t.ok ? 'text-text' : 'text-muted'}`}>
                    {t.label}
                  </span>
                </div>
                {t.ok && <ChevronRight className="h-3.5 w-3.5 text-muted" strokeWidth={1.75} />}
              </li>
            ))}
          </ul>
        </Card>

        {/* Notifications */}
        <Card className="overflow-hidden">
          <div className="border-b border-border px-4 py-2.5 text-xs font-semibold text-text">
            Notificaciones recientes
          </div>
          <ul>
            {mockNotifications.map((n) => (
              <li
                key={n.id}
                className="flex items-center gap-3 border-b border-border px-4 py-3 last:border-b-0"
              >
                <NotificationIcon kind={n.icon} />
                <div className="min-w-0 flex-1">
                  <div className="text-xs text-text">{n.message}</div>
                  <div className="text-2xs text-muted">{n.time}</div>
                </div>
              </li>
            ))}
          </ul>
        </Card>

        {/* Recent attendance log */}
        <Card className="overflow-hidden">
          <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
            <div className="flex items-center gap-2">
              <ClipboardList className="h-3.5 w-3.5 text-muted" strokeWidth={1.75} />
              <span className="text-xs font-semibold text-text">Registro de asistencia reciente</span>
            </div>
          </div>
          <ul className="divide-y divide-border">
            {apiAttendance && apiAttendance.length > 0 ? (
              apiAttendance.map((row) => {
                const ts = new Date(row.timestamp);
                const date = ts.toLocaleDateString('es-CL', { day: '2-digit', month: '2-digit', year: 'numeric' });
                const time = ts.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' });
                const type = row.type === 'check_in' ? 'Entrada' : 'Salida';
                return (
                  <li key={row.id} className="flex items-center justify-between px-4 py-2.5">
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="text-2xs text-muted tabular whitespace-nowrap">{date} {time}</span>
                      {typeBadgeSmall(type as 'Entrada' | 'Salida' | 'Retiro')}
                    </div>
                    <span className="text-2xs text-muted truncate ml-2 max-w-[120px]">Sistema</span>
                  </li>
                );
              })
            ) : (
              recentAttendanceLog.map((row) => (
                <li key={row.id} className="flex items-center justify-between px-4 py-2.5">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-2xs text-muted tabular whitespace-nowrap">{row.date} {row.time}</span>
                    {typeBadgeSmall(row.type)}
                  </div>
                  <span className="text-2xs text-muted truncate ml-2 max-w-[120px]">{row.who}</span>
                </li>
              ))
            )}
          </ul>
          <div className="border-t border-border px-4 py-2.5">
            <Link
              to={`/alumnos/${childId}`}
              className="inline-flex items-center gap-1.5 text-2xs font-medium text-accent hover:underline"
            >
              <ExternalLink className="h-3 w-3" strokeWidth={1.75} />
              Ver ficha completa
            </Link>
          </div>
        </Card>

        {/* Avisos de Inspectoria */}
        <Card className="overflow-hidden">
          <div className="border-b border-border px-4 py-2.5 text-xs font-semibold text-text">
            Avisos de Inspectoria
          </div>
          <ul className="divide-y divide-border">
            {inspectoriaNotices.map((notice) => (
              <li key={notice.id} className="px-4 py-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-text">{notice.title}</span>
                      {notice.severity === 'warning' ? (
                        <span className="inline-flex items-center rounded border border-amber-500/30 px-1.5 h-5 text-2xs font-medium text-amber-600 dark:text-amber-400">Aviso</span>
                      ) : (
                        <span className="inline-flex items-center rounded border border-accent/30 px-1.5 h-5 text-2xs font-medium text-accent dark:text-accent/90">Info</span>
                      )}
                    </div>
                    <p className="mt-1 text-2xs text-muted leading-relaxed">{notice.description}</p>
                  </div>
                  <span className="flex-none text-2xs text-muted tabular">{notice.date}</span>
                </div>
              </li>
            ))}
          </ul>
        </Card>

        {/* Alerts status */}
        <Card className="flex items-center gap-3 p-4">
          <div className="flex size-9 items-center justify-center rounded-md border border-border bg-bg text-emerald-500">
            <ShieldCheck className="h-4 w-4" strokeWidth={1.5} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-xs font-medium text-text">Sin alertas activas hoy</div>
            <div className="text-2xs text-muted">Tu hijo esta protegido y monitoreado en tiempo real.</div>
          </div>
        </Card>

        {/* Actions */}
        <div className="grid grid-cols-2 gap-2.5">
          <Button variant="primary" size="lg" className="w-full">
            <Phone className="h-3.5 w-3.5" strokeWidth={1.75} />
            Contactar direccion
          </Button>
          <Button variant="secondary" size="lg" className="w-full">
            <MessageCircle className="h-3.5 w-3.5" strokeWidth={1.75} />
            Chat con docente
          </Button>
        </div>

        {/* SMS / WhatsApp Preferences */}
        <Card className="overflow-hidden">
          <div className="border-b border-border px-4 py-2.5 text-xs font-semibold text-text">
            Preferencias de notificacion
          </div>
          <div className="divide-y divide-border">
            <div className="flex items-center justify-between px-4 py-3">
              <div className="flex items-center gap-3">
                <div className="flex size-8 flex-none items-center justify-center rounded-full bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
                  <Smartphone className="h-4 w-4" strokeWidth={1.75} />
                </div>
                <div>
                  <div className="text-xs font-medium text-text">Notificaciones SMS</div>
                  <div className="text-2xs text-muted">{guardianPhone}</div>
                </div>
              </div>
              <button
                role="switch"
                aria-checked={smsEnabled}
                onClick={() => setSmsEnabled(!smsEnabled)}
                className={`relative inline-flex h-6 w-11 flex-none items-center rounded-full transition-colors ${
                  smsEnabled ? 'bg-emerald-500' : 'bg-border'
                }`}
              >
                <span
                  className={`inline-block size-4 rounded-full bg-white shadow-sm transition-transform ${
                    smsEnabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
            <div className="flex items-center justify-between px-4 py-3">
              <div className="flex items-center gap-3">
                <div className="flex size-8 flex-none items-center justify-center rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
                  <MessageCircle className="h-4 w-4" strokeWidth={1.75} />
                </div>
                <div>
                  <div className="text-xs font-medium text-text">Notificaciones WhatsApp</div>
                  <div className="text-2xs text-muted">{guardianPhone}</div>
                </div>
              </div>
              <button
                role="switch"
                aria-checked={whatsappEnabled}
                onClick={() => setWhatsappEnabled(!whatsappEnabled)}
                className={`relative inline-flex h-6 w-11 flex-none items-center rounded-full transition-colors ${
                  whatsappEnabled ? 'bg-emerald-500' : 'bg-border'
                }`}
              >
                <span
                  className={`inline-block size-4 rounded-full bg-white shadow-sm transition-transform ${
                    whatsappEnabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </Card>

        <p className="pt-6 text-center text-2xs text-muted">
          &copy; 2026 ECOAVES Division de Ingenieria y Software - Built in Antofagasta
        </p>
      </main>
    </div>
  );
}
