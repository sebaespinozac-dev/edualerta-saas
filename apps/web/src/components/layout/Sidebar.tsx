import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Building2,
  Users,
  BellRing,
  MessageSquare,
  Map,
  FileText,
  Settings,
  ScanLine,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useRealtime } from '@/context/RealtimeContext';

export function Sidebar() {
  const { unreadAlerts, connected } = useRealtime();

  const items = [
    { to: '/dashboard', label: 'Overview', icon: LayoutDashboard },
    { to: '/scanner', label: 'Escáner QR', icon: ScanLine },
    { to: '/alumnos', label: 'Alumnos', icon: Users },
    {
      to: '/alertas',
      label: 'Alertas',
      icon: BellRing,
      badge: unreadAlerts > 0 ? unreadAlerts : undefined,
    },
    { to: '/mensajes', label: 'Mensajes', icon: MessageSquare },
    { to: '/mapa', label: 'Mapa', icon: Map },
    { to: '/reportes', label: 'Reportes', icon: FileText },
  ];

  const secondary = [
    { to: '/configuracion', label: 'Configuración', icon: Settings },
  ];

  return (
    <aside className="hidden h-[calc(100vh-49px)] w-56 flex-shrink-0 border-r border-border bg-surface md:block">
      <nav className="flex h-full flex-col px-3 py-4">
        <div className="mb-2 px-2 text-2xs font-medium uppercase tracking-wider text-muted">
          Operación
        </div>
        <ul className="space-y-0.5">
          {items.map(({ to, label, icon: Icon, badge }) => (
            <li key={to}>
              <NavLink
                to={to}
                className={({ isActive }) =>
                  cn(
                    'group flex items-center gap-2.5 rounded-md px-2 py-1.5 text-sm transition-colors',
                    isActive
                      ? 'bg-bg text-text font-medium'
                      : 'text-muted hover:bg-bg hover:text-text',
                  )
                }
              >
                <Icon className="h-4 w-4 flex-none" strokeWidth={1.75} />
                <span className="flex-1">{label}</span>
                {badge !== undefined && (
                  <span className="flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold leading-none text-white">
                    {badge > 99 ? '99+' : badge}
                  </span>
                )}
              </NavLink>
            </li>
          ))}
        </ul>

        <div className="mb-2 mt-6 flex items-center gap-2 px-2 text-2xs font-medium uppercase tracking-wider text-muted">
          <Building2 className="h-3 w-3" strokeWidth={1.75} />
          CMDS Antofagasta
        </div>
        <div className="rounded-md border border-border bg-bg/50 px-3 py-2">
          <div className="text-xs font-medium text-text">15 establecimientos</div>
          <div className="flex items-center gap-1.5 text-2xs text-muted tabular">
            8.420 alumnos activos
            <span
              className={cn(
                'ml-auto size-1.5 rounded-full',
                connected ? 'bg-emerald-500' : 'bg-muted',
              )}
              title={connected ? 'Conectado en tiempo real' : 'Sin conexión en vivo'}
            />
          </div>
        </div>

        <div className="mt-auto">
          <ul className="space-y-0.5">
            {secondary.map(({ to, label, icon: Icon }) => (
              <li key={to}>
                <NavLink
                  to={to}
                  className={({ isActive }) =>
                    cn(
                      'group flex items-center gap-2.5 rounded-md px-2 py-1.5 text-sm transition-colors',
                      isActive
                        ? 'bg-bg text-text font-medium'
                        : 'text-muted hover:bg-bg hover:text-text',
                    )
                  }
                >
                  <Icon className="h-4 w-4" strokeWidth={1.75} />
                  {label}
                </NavLink>
              </li>
            ))}
          </ul>
        </div>
      </nav>
    </aside>
  );
}
