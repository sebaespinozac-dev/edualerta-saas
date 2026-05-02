import { ArrowDownRight, ArrowUpRight, LogOut, UserCheck } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { Card } from '@/components/ui/Card';
import type { ActivityEvent } from '@/types';

const iconFor: Record<ActivityEvent['type'], React.ReactNode> = {
  entrada: <ArrowDownRight className="h-3.5 w-3.5" strokeWidth={1.75} />,
  salida: <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={1.75} />,
  retiro: <LogOut className="h-3.5 w-3.5" strokeWidth={1.75} />,
  visita: <UserCheck className="h-3.5 w-3.5" strokeWidth={1.75} />,
};

const labelFor: Record<ActivityEvent['type'], string> = {
  entrada: 'Ingreso registrado',
  salida: 'Salida registrada',
  retiro: 'Retiro autorizado',
  visita: 'Visita ingresada',
};

export function ActivityFeed({ events }: { events: ActivityEvent[] }) {
  return (
    <Card className="overflow-hidden">
      <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
        <div className="text-xs font-semibold tracking-tight text-text">Actividad reciente</div>
        <div className="flex items-center gap-1.5 text-2xs text-muted">
          <span className="inline-block size-1.5 animate-pulse-dot rounded-full bg-emerald-500" />
          En vivo
        </div>
      </div>
      <ul className="max-h-[480px] overflow-y-auto scrollbar-thin">
        {events.map((e) => (
          <li
            key={e.id}
            className="flex items-start gap-3 border-b border-border px-4 py-2.5 last:border-b-0"
          >
            <div className="mt-0.5 flex size-7 flex-none items-center justify-center rounded border border-border bg-bg text-muted">
              {iconFor[e.type]}
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-xs text-text">
                <span className="font-medium">{e.studentName}</span>
                <span className="text-muted"> · {labelFor[e.type]}</span>
              </div>
              <div className="truncate text-2xs text-muted">{e.schoolName}</div>
            </div>
            <div className="flex-none whitespace-nowrap text-2xs text-muted tabular">
              {formatDistanceToNow(new Date(e.at), { locale: es, addSuffix: false })}
            </div>
          </li>
        ))}
      </ul>
    </Card>
  );
}
