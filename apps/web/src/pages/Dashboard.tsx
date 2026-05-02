import { Calendar, Download } from 'lucide-react';
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

export function Dashboard() {
  const activeAlerts = 0;
  const operative = schools.filter((s) => s.status === 'operativo').length;

  return (
    <div className="space-y-6">
      {/* header */}
      <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-text">Overview</h1>
          <p className="text-xs text-muted">Resumen operativo · CMDS Antofagasta</p>
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

      {/* stats */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Alumnos totales"
          value={formatNumber(totalStudents)}
          delta={{ value: '+12 vs. ayer', positive: true }}
        />
        <StatCard
          label="Asistencia hoy"
          value={formatPercent(todayAttendance)}
          delta={{ value: '+0.4 pts vs. ayer', positive: true }}
          spark={sparklineSeries}
        />
        <StatCard
          label="Alertas activas"
          value={String(activeAlerts)}
          delta={{ value: 'Sin incidentes hoy' }}
          indicator="green"
        />
        <StatCard
          label="Establecimientos"
          value={`${operative}/${schools.length}`}
          delta={{ value: '100% operativos' }}
          indicator="green"
        />
      </div>

      {/* main grid */}
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-[1fr_320px]">
        <Card>
          <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
            <div>
              <div className="text-xs font-semibold tracking-tight text-text">Asistencia diaria</div>
              <div className="text-2xs text-muted">Últimos 5 días hábiles · todas las sedes</div>
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

        <ActivityFeed events={activityFeed} />
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
