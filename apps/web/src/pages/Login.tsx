import { useState, type FormEvent } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { ArrowRight, Loader2, Building2, Users, Activity } from 'lucide-react';
import { Input, Label, FieldError } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/hooks/useAuth';

/* ── Static demo data for the monitoring widget ────────────────── */

const DEMO_SCHOOLS = [
  { name: 'Liceo A-13 Atacama',         students: 1240, status: 'ok'    as const },
  { name: 'Col. Pedro Lagos B-2',        students:  892, status: 'alert' as const },
  { name: 'Esc. Básica C-5 Lautaro',     students:  634, status: 'ok'    as const },
  { name: 'Col. Manuel Aracena D-1',     students:  578, status: 'ok'    as const },
];

const DEMO_EVENTS = [
  { time: '07:58', name: 'Ana García M.',    event: 'Ingreso registrado',  school: 'A-13' },
  { time: '07:56', name: 'Luis Pizarro T.',  event: 'Ingreso registrado',  school: 'B-2'  },
  { time: '07:54', name: 'María Rojas V.',   event: 'Retiro autorizado',   school: 'C-5'  },
  { time: '07:52', name: 'Carlos Mena R.',   event: 'Ingreso registrado',  school: 'D-1'  },
];

const STATS = [
  { icon: Building2, value: '15',      label: 'Establecimientos'  },
  { icon: Users,     value: '8.420',   label: 'Alumnos protegidos' },
  { icon: Activity,  value: '99.99%',  label: 'Disponibilidad'    },
];

/* ── Shield icon (inline SVG, no external asset) ───────────────── */

function ShieldIcon({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden>
      <path
        d="M16 3L4.5 8.75v7.75c0 6.5 4.85 12.583 11.5 14.25C22.65 29.083 27.5 23 27.5 16.5V8.75L16 3z"
        fill="rgba(16,185,129,0.15)"
        stroke="#10b981"
        strokeWidth="1.25"
        strokeLinejoin="round"
      />
      <path
        d="M11 16.5l3.5 3.5 6.5-7"
        stroke="#10b981"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/* ── Live monitoring dashboard widget ──────────────────────────── */

function MonitoringWidget() {
  return (
    <div className="login-dashboard">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/[0.07] px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[11px] font-semibold uppercase tracking-wider text-white/60">
            Monitoreo en vivo
          </span>
        </div>
        <span className="text-[10px] tabular-nums text-white/25">05/05/2026 · 08:01 hrs</span>
      </div>

      {/* School status rows */}
      <div className="border-b border-white/[0.07] px-4 py-2">
        {DEMO_SCHOOLS.map((s) => (
          <div key={s.name} className="flex items-center justify-between py-1.5">
            <div className="flex min-w-0 items-center gap-2.5">
              <span
                className={`size-1.5 flex-none rounded-full ${
                  s.status === 'ok' ? 'bg-emerald-400' : 'bg-red-400 animate-pulse'
                }`}
              />
              <span className="truncate text-[12px] text-white/70">{s.name}</span>
            </div>
            <div className="ml-4 flex flex-none items-center gap-3">
              <span className="tabular-nums text-[11px] text-white/30">
                {s.students.toLocaleString('es-CL')} alumnos
              </span>
              {s.status === 'ok' ? (
                <span className="text-[10px] font-semibold text-emerald-400">Normal</span>
              ) : (
                <span className="text-[10px] font-semibold text-red-400">Alerta</span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Recent events */}
      <div className="px-4 py-2.5">
        <div className="mb-2 text-[10px] font-medium uppercase tracking-wider text-white/25">
          Actividad reciente
        </div>
        {DEMO_EVENTS.map((e, i) => (
          <div key={i} className="flex items-center gap-2.5 py-1.5">
            <span className="flex-none tabular-nums text-[11px] text-white/30">{e.time}</span>
            <span className="flex-none size-1 rounded-full bg-emerald-500/50" />
            <span className="truncate text-[12px] text-white/55">{e.name}</span>
            <span className="ml-auto flex-none text-[10px] text-white/25">{e.school}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Left hero panel ────────────────────────────────────────────── */

function HeroPanel() {
  return (
    <div className="login-panel relative hidden flex-col overflow-hidden lg:flex">
      {/* Background layers */}
      <div className="absolute inset-0 login-panel-bg" />
      <div className="absolute inset-0 login-dot-grid" />
      <div className="absolute inset-0 login-glow" />

      <div className="relative z-10 flex h-full flex-col px-12 py-10">

        {/* Branding */}
        <div className="flex items-center gap-3">
          <ShieldIcon size={32} />
          <div>
            <div className="text-[21px] font-bold tracking-tight text-white">EduAlerta</div>
            <div className="text-[10px] font-medium uppercase tracking-widest text-emerald-400/70">
              Seguridad Escolar en Tiempo Real
            </div>
          </div>
        </div>

        {/* Hero copy + CTAs */}
        <div className="mt-12 space-y-5">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1">
            <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[11px] font-medium text-emerald-300">
              Sistema operativo · Ley N° 21.809
            </span>
          </div>

          <h1 className="text-[36px] font-bold leading-[1.1] tracking-tight text-white">
            Protegiendo a nuestros<br />
            <span className="text-emerald-400">estudiantes</span>, cada día.
          </h1>

          <p className="max-w-[400px] text-[13.5px] leading-relaxed text-white/55">
            Plataforma operativa para sostenedores y establecimientos educacionales.
            Trazabilidad de asistencia, alertas en tiempo real y cumplimiento integral.
          </p>

          <div className="flex items-center gap-3 pt-1">
            <button className="login-cta-primary">
              Solicitar demo
              <ArrowRight className="h-3.5 w-3.5" strokeWidth={2} />
            </button>
            <button className="login-cta-secondary">
              Ver módulos
            </button>
          </div>
        </div>

        {/* Dashboard preview */}
        <div className="mt-10 flex-1">
          <MonitoringWidget />
        </div>

        {/* Stat cards */}
        <div className="mt-6 grid grid-cols-3 gap-3">
          {STATS.map(({ icon: Icon, value, label }) => (
            <div key={label} className="login-stat-card">
              <Icon className="h-3.5 w-3.5 text-emerald-400/60" strokeWidth={1.5} />
              <div className="text-[18px] font-bold text-white">{value}</div>
              <div className="text-[10px] leading-tight text-white/40">{label}</div>
            </div>
          ))}
        </div>

        <div className="mt-6 text-[11px] text-white/20">
          © 2026 ECOAVES División de Ingeniería y Software · Antofagasta, Chile
        </div>
      </div>
    </div>
  );
}

/* ── Login form ─────────────────────────────────────────────────── */

export function Login() {
  const { user, signIn } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (user) return <Navigate to={user.role === 'apoderado' ? '/apoderado' : '/dashboard'} replace />;

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (!email || !password) { setError('Ingresa tu correo y contraseña.'); return; }
    setSubmitting(true);
    const u = await signIn(email, password);
    setSubmitting(false);
    navigate(u.role === 'apoderado' ? '/apoderado' : '/dashboard', { replace: true });
  }

  return (
    <div className="grid min-h-screen grid-cols-1 lg:grid-cols-[1fr_minmax(0,460px)]">
      <HeroPanel />

      {/* Right — form panel */}
      <div className="flex items-center justify-center bg-white px-6 py-12 dark:bg-[hsl(var(--surface))]">
        <div className="w-full max-w-sm">

          {/* Mobile-only branding */}
          <div className="mb-8 flex flex-col items-center gap-3 lg:hidden">
            <div className="flex size-14 items-center justify-center rounded-2xl bg-[#030c17]">
              <ShieldIcon size={28} />
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-text">EduAlerta</div>
              <div className="text-xs text-muted">Seguridad Escolar en Tiempo Real</div>
            </div>
          </div>

          <h1 className="text-xl font-semibold tracking-tight text-text">Iniciar sesión</h1>
          <p className="mt-1 text-xs text-muted">
            Ingresa con tu cuenta institucional CMDS Antofagasta.
          </p>

          <form onSubmit={onSubmit} className="mt-8 space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email">Correo electrónico</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="nombre@cmds.cl"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={submitting}
              />
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Contraseña</Label>
                <button
                  type="button"
                  className="text-2xs text-muted hover:text-text"
                  onClick={() => alert('Contacta al administrador del sistema.')}
                >
                  ¿Olvidaste tu contraseña?
                </button>
              </div>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={submitting}
              />
            </div>
            <FieldError>{error}</FieldError>
            <Button type="submit" variant="primary" size="lg" className="w-full" disabled={submitting}>
              {submitting ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" strokeWidth={1.75} />
              ) : (
                <>
                  Continuar
                  <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.75} />
                </>
              )}
            </Button>
          </form>

          <div className="mt-6 rounded-md border border-border bg-bg/50 p-3 text-2xs text-muted">
            <span className="font-medium text-text">Demo:</span> usa cualquier correo y contraseña.
            Si tu correo empieza con <code className="text-text">apoderado</code>, ingresarás como apoderado.
          </div>
        </div>
      </div>
    </div>
  );
}
