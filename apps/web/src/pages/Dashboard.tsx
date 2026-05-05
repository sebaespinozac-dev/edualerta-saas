import { Calendar, Download, Wifi, WifiOff } from 'lucide-react';
import { StatCard } from '@/components/features/StatCard';
import { ActivityFeed } from '@/components/features/ActivityFeed';
import { SchoolTable } from '@/components/features/SchoolTable';
import { AttendanceLineChart } from '@/components/charts/AttendanceLineChart';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import {
  schools,
  totalStudents,
  todayAttendance,
  attendanceWeekdays,
  sparklineSeries,
  activityFeed,
} from '@/lib/mock-data';
import { formatNumber, formatPercent } from '@/lib/utils';
import { useRealtime } from '@/context/RealtimeContext';

export function Dashboard() {
  const { connected, unreadAlerts, todayCheckIns, recentAttendance, alerts } = useRealtime();

  const operative = schools.filter((s) => s.status === 'operativo').length;
  const activeAlerts = unreadAlerts;

  const liveActivity = recentAttendance.map((a) => ({
    id: a.id,
    type: a.type === 'check_in' ? ('entrada' as const) : ('salida' as const),
    studentName: a.student.full_name,
    schoolName: '—',
    at: a.timestamp,
  }));

  const feedEvents = liveActivity.length > 0
    ? [...liveActivity, ...activityFeed].slice(0, 14)
    : activityFeed;

  return (
    <div className="space-y-6">
      {/* header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <img
            src="/logo-programa.png"
            alt="EduAlerta"
            className="hidden h-16 w-auto drop-shadow-sm sm:block"
          />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-semibold tracking-tight text-text">Overview</h1>
              {connected ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-2xs font-medium text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">
                  <Wifi className="h-2.5 w-2.5" strokeWidth={2} />
                  En vivo
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-2xs font-medium text-muted dark:bg-white/5">
                  <WifiOff className="h-2.5 w-2.5" strokeWidth={2} />
                  Sin API
                </span>
              )}
            </div>
            <p className="text-xs text-muted">Resumen operativo - CMDS Antofagasta</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm">
            <Calendar className="h-3.5 w-3.5" strokeWidth={1.75} />
            Últimos 7 días
          </Button>
          <Button variant="secondary" size="sm">
            <Download className="h-3.5 w-3.5" strokeWidth={1.75} />
            Exportar
          </Button>
        </div>
      </div>

      {/* live alert strip */}
      {alerts.length > 0 && (
        <div className="flex items-start gap-3 rounded-md border border-red-200 bg-red-50 px-4 py-3 dark:border-red-500/20 dark:bg-red-500/5">
          <span className="mt-0.5 size-2 flex-none rounded-full bg-red-500 animate-pulse" />
          <div className="min-w-0">
            <p className="text-xs font-semibold text-red-700 dark:text-red-400">
              {alerts[0].type.replace(/_/g, ' ').toUpperCase()} — {alerts[0].establishment_name ?? 'Establecimiento'}
            </p>
            {alerts[0].message && (
              <p className="mt-0.5 text-2xs text-red-600/80 dark:text-red-400/70">{alerts[0].message}</p>
            )}
          </div>
          <span className="ml-auto flex-none text-2xs text-muted tabular whitespace-nowrap">
            {new Date(alerts[0].created_at).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      )}

      {/* stats */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Alumnos totales"
          value={formatNumber(totalStudents)}
          delta={{ value: '+12 vs. ayer', positive: true }}
          tint="blue"
        />
        <StatCard
          label="Entradas hoy"
          value={formatNumber(todayCheckIns > 0 ? todayCheckIns : Math.round(totalStudents * todayAttendance / 100))}
          delta={{ value: todayCheckIns > 0 ? 'En tiempo real' : formatPercent(todayAttendance), positive: true }}
          spark={sparklineSeries}
          tint="green"
        />
        <StatCard
          label="Alertas activas"
          value={String(activeAlerts)}
          delta={{ value: activeAlerts > 0 ? 'Requieren atención' : 'Sin incidentes hoy' }}
          indicator={activeAlerts > 0 ? 'red' : 'green'}
          tint={activeAlerts > 0 ? 'red' : 'amber'}
        />
        <StatCard
          label="Establecimientos"
          value={`${operative}/${schools.length}`}
          delta={{ value: '100% operativos' }}
          indicator="green"
          tint="purple"
        />
      </div>

      {/* main grid */}
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-[1fr_320px]">
        <Card className="overflow-hidden">
          <div className="flex items-center justify-between border-b border-border bg-gradient-to-r from-blue-50/80 via-indigo-50/50 to-purple-50/30 px-4 py-2.5 dark:from-blue-500/5 dark:via-indigo-500/5 dark:to-purple-500/5">
            <div>
              <div className="text-xs font-semibold tracking-tight text-text">Asistencia diaria</div>
              <div className="text-2xs text-muted">Últimos 5 días hábiles - todas las sedes</div>
            </div>
            <div className="flex items-center gap-1.5 text-2xs text-muted">
              <span className="size-1.5 rounded-full bg-accent" />
              CMDS Total
            </div>
          </div>
          <div className="p-4">
            <AttendanceLineChart data={attendanceWeekdays} />
          </div>
        </Card>

        <ActivityFeed events={feedEvents} />
      </div>

      {/* schools */}
      <div>
        <div className="mb-2 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold tracking-tight text-text">Establecimientos</h2>
            <p className="text-2xs text-muted">Estado operativo en tiempo real</p>
          </div>
          <Button variant="ghost" size="sm">Ver todos</Button>
        </div>
        <SchoolTable schools={schools} />
      </div>
    </div>
  );
}
