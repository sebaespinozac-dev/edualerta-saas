import { Search, Sun, Moon, LogOut, ChevronDown, Bell } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { Logo } from './Logo';
import { Kbd } from '@/components/ui/Kbd';
import { Avatar } from '@/components/ui/Avatar';
import { useAuth } from '@/hooks/useAuth';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/DropdownMenu';
import { useTheme } from '@/hooks/useTheme';
import { useRealtime } from '@/context/RealtimeContext';

export function TopNav() {
  const { theme, toggle } = useTheme();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { unreadAlerts, clearUnread } = useRealtime();

  return (
    <header className="sticky top-0 z-20 flex h-12 items-center justify-between border-b border-border bg-surface/80 px-4 backdrop-blur">
      <div className="flex items-center gap-3">
        <Logo />
        <span className="hidden text-2xs text-muted md:inline">/ Antofagasta</span>
      </div>

      <div className="hidden flex-1 px-8 md:block">
        <div className="relative mx-auto max-w-md">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted" strokeWidth={1.75} />
          <input
            type="text"
            placeholder="Buscar alumno, establecimiento o reporte"
            className="h-8 w-full rounded-md border border-border bg-bg pl-8 pr-12 text-xs placeholder:text-muted focus:border-accent/40 focus:outline-none focus:ring-2 focus:ring-accent/20"
          />
          <Kbd className="absolute right-2 top-1/2 -translate-y-1/2">⌘ K</Kbd>
        </div>
      </div>

      <div className="flex items-center gap-1.5">
        {/* Alert bell */}
        <Link
          to="/alertas"
          onClick={clearUnread}
          className="relative inline-flex h-8 w-8 items-center justify-center rounded-md text-muted transition-colors hover:bg-bg hover:text-text"
          aria-label="Ver alertas"
        >
          <Bell className="h-4 w-4" strokeWidth={1.75} />
          {unreadAlerts > 0 && (
            <span className="absolute right-1 top-1 flex h-3.5 min-w-[14px] items-center justify-center rounded-full bg-red-500 px-0.5 text-[9px] font-bold leading-none text-white">
              {unreadAlerts > 9 ? '9+' : unreadAlerts}
            </span>
          )}
        </Link>

        <button
          onClick={toggle}
          aria-label="Cambiar tema"
          className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted transition-colors hover:bg-bg hover:text-text"
        >
          {theme === 'dark' ? <Sun className="h-4 w-4" strokeWidth={1.75} /> : <Moon className="h-4 w-4" strokeWidth={1.75} />}
        </button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="ml-1 inline-flex items-center gap-1.5 rounded-md px-1.5 py-1 hover:bg-bg">
              <Avatar name={user?.name ?? 'EA'} size={24} />
              <span className="hidden text-xs font-medium text-text md:inline">{user?.name}</span>
              <ChevronDown className="h-3.5 w-3.5 text-muted" strokeWidth={1.75} />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <div className="px-2 py-1.5">
              <div className="text-xs font-medium">{user?.name}</div>
              <div className="text-2xs text-muted">{user?.email}</div>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={() => navigate('/configuracion')}>
              Configuración
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onSelect={() => {
                signOut();
                navigate('/login');
              }}
            >
              <LogOut className="mr-2 h-3.5 w-3.5" strokeWidth={1.75} />
              Cerrar sesión
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
