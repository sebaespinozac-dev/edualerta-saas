import { useNavigate } from 'react-router-dom';
import { Bell, ChevronRight, MessageCircle, Phone, ShieldCheck, LogOut } from 'lucide-react';
import { Logo } from '@/components/layout/Logo';
import { Card } from '@/components/ui/Card';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/hooks/useAuth';

const child = {
  name: 'Sofía Espinosa González',
  grade: '4° Básico',
  school: 'Escuela D-68 Juan Sandoval Carrasco',
  status: 'En el colegio desde 07:58',
};

const timeline = [
  { time: '07:58', label: 'Ingreso registrado', kind: 'in' as const, ok: true },
  { time: '10:30', label: 'Recreo', kind: 'recess' as const, ok: true },
  { time: '13:00', label: 'Almuerzo', kind: 'lunch' as const, ok: true },
  { time: '15:30', label: 'Salida estimada', kind: 'pending' as const, ok: false },
];

export function Apoderado() {
  const { signOut } = useAuth();
  const navigate = useNavigate();

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
        {/* hero card */}
        <Card className="p-5">
          <div className="flex items-center gap-3">
            <Avatar name={child.name} size={44} />
            <div className="min-w-0 flex-1">
              <div className="text-sm font-semibold text-text">{child.name}</div>
              <div className="truncate text-2xs text-muted">
                {child.grade} · {child.school}
              </div>
            </div>
          </div>
          <div className="mt-4">
            <Badge tone="success" dot>
              {child.status}
            </Badge>
          </div>
        </Card>

        {/* timeline */}
        <Card className="overflow-hidden">
          <div className="border-b border-border px-4 py-2.5 text-xs font-semibold text-text">
            Hoy · Martes
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

        {/* alerts */}
        <Card className="flex items-center gap-3 p-4">
          <div className="flex size-9 items-center justify-center rounded-md border border-border bg-bg text-emerald-500">
            <ShieldCheck className="h-4 w-4" strokeWidth={1.5} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-xs font-medium text-text">Sin alertas activas hoy</div>
            <div className="text-2xs text-muted">Tu hijo está protegido y monitoreado en tiempo real.</div>
          </div>
        </Card>

        {/* actions */}
        <div className="grid grid-cols-2 gap-2.5">
          <Button variant="primary" size="lg" className="w-full">
            <Phone className="h-3.5 w-3.5" strokeWidth={1.75} />
            Contactar dirección
          </Button>
          <Button variant="secondary" size="lg" className="w-full">
            <MessageCircle className="h-3.5 w-3.5" strokeWidth={1.75} />
            Chat con docente
          </Button>
        </div>

        <p className="pt-6 text-center text-2xs text-muted">
          © 2026 ECOAVES División de Ingeniería y Software · Built in Antofagasta
        </p>
      </main>
    </div>
  );
}
