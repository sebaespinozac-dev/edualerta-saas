import { useState, type FormEvent } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { ArrowRight, Loader2, Shield, Bell, Users } from 'lucide-react';
import { Input, Label, FieldError } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/hooks/useAuth';

function AnimatedScene() {
  return (
    <div className="login-scene">
      {/* Sky gradient */}
      <div className="login-sky" />

      {/* Animated clouds */}
      <svg className="login-cloud login-cloud-1" viewBox="0 0 200 80" fill="white" fillOpacity="0.85">
        <ellipse cx="60" cy="50" rx="60" ry="25" />
        <ellipse cx="100" cy="35" rx="50" ry="30" />
        <ellipse cx="140" cy="50" rx="55" ry="22" />
      </svg>
      <svg className="login-cloud login-cloud-2" viewBox="0 0 180 70" fill="white" fillOpacity="0.7">
        <ellipse cx="50" cy="45" rx="50" ry="20" />
        <ellipse cx="90" cy="30" rx="45" ry="25" />
        <ellipse cx="130" cy="45" rx="48" ry="18" />
      </svg>
      <svg className="login-cloud login-cloud-3" viewBox="0 0 160 60" fill="white" fillOpacity="0.6">
        <ellipse cx="45" cy="38" rx="42" ry="18" />
        <ellipse cx="80" cy="25" rx="38" ry="22" />
        <ellipse cx="115" cy="38" rx="40" ry="16" />
      </svg>

      {/* Sun glow */}
      <div className="login-sun" />

      {/* School building centered */}
      <div className="login-school-wrapper">
        <img
          src="/logo-programa.jpg"
          alt="EduAlerta — Seguridad Escolar"
          className="login-school-img"
        />
      </div>

      {/* Green landscape that expands to edges */}
      <div className="login-ground" />
      <div className="login-ground-overlay" />

      {/* Animated trees left */}
      <svg className="login-tree login-tree-left-1" viewBox="0 0 60 100">
        <rect x="26" y="55" width="8" height="45" rx="3" fill="#5D4037" />
        <ellipse cx="30" cy="40" rx="25" ry="35" fill="#2E7D32" />
        <ellipse cx="22" cy="48" rx="15" ry="20" fill="#388E3C" />
        <ellipse cx="38" cy="44" rx="14" ry="18" fill="#43A047" />
      </svg>
      <svg className="login-tree login-tree-left-2" viewBox="0 0 50 80">
        <rect x="22" y="45" width="6" height="35" rx="2" fill="#5D4037" />
        <ellipse cx="25" cy="32" rx="20" ry="28" fill="#388E3C" />
        <ellipse cx="18" cy="38" rx="12" ry="16" fill="#43A047" />
      </svg>

      {/* Animated trees right */}
      <svg className="login-tree login-tree-right-1" viewBox="0 0 60 100">
        <rect x="26" y="55" width="8" height="45" rx="3" fill="#5D4037" />
        <ellipse cx="30" cy="40" rx="25" ry="35" fill="#2E7D32" />
        <ellipse cx="22" cy="48" rx="15" ry="20" fill="#388E3C" />
        <ellipse cx="38" cy="44" rx="14" ry="18" fill="#43A047" />
      </svg>
      <svg className="login-tree login-tree-right-2" viewBox="0 0 50 80">
        <rect x="22" y="45" width="6" height="35" rx="2" fill="#5D4037" />
        <ellipse cx="25" cy="32" rx="20" ry="28" fill="#388E3C" />
        <ellipse cx="18" cy="38" rx="12" ry="16" fill="#43A047" />
      </svg>

      {/* Small bushes */}
      <svg className="login-bush login-bush-1" viewBox="0 0 80 40">
        <ellipse cx="40" cy="30" rx="38" ry="18" fill="#43A047" />
        <ellipse cx="25" cy="28" rx="20" ry="14" fill="#4CAF50" />
        <ellipse cx="55" cy="28" rx="18" ry="12" fill="#66BB6A" />
      </svg>
      <svg className="login-bush login-bush-2" viewBox="0 0 70 35">
        <ellipse cx="35" cy="25" rx="33" ry="15" fill="#43A047" />
        <ellipse cx="22" cy="23" rx="18" ry="12" fill="#4CAF50" />
      </svg>

      {/* Animated flag */}
      <div className="login-flag-pole">
        <svg className="login-flag-svg" viewBox="0 0 60 40">
          <defs>
            <clipPath id="flagClip">
              <path className="login-flag-wave" d="M0,0 Q15,3 30,0 Q45,-3 60,0 L60,40 Q45,37 30,40 Q15,43 0,40 Z" />
            </clipPath>
          </defs>
          <g clipPath="url(#flagClip)">
            <rect x="0" y="0" width="60" height="13.3" fill="#D52B1E" />
            <rect x="0" y="13.3" width="60" height="13.3" fill="#FFFFFF" />
            <rect x="0" y="26.6" width="60" height="13.4" fill="#D52B1E" />
            <rect x="0" y="0" width="20" height="26.6" fill="#00209F" />
            <polygon points="10,5 11.5,10 17,10 12.5,13.5 14,18.5 10,15.5 6,18.5 7.5,13.5 3,10 8.5,10" fill="white" />
          </g>
        </svg>
      </div>

      {/* Animated bell */}
      <div className="login-bell-anim">
        <Bell className="h-7 w-7 text-amber-500 drop-shadow-md" strokeWidth={2} fill="#F59E0B" />
        <div className="login-bell-dot" />
      </div>
    </div>
  );
}

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
    if (!email || !password) {
      setError('Ingresa tu correo y contraseña.');
      return;
    }
    setSubmitting(true);
    const u = await signIn(email, password);
    setSubmitting(false);
    navigate(u.role === 'apoderado' ? '/apoderado' : '/dashboard', { replace: true });
  }

  return (
    <div className="grid min-h-screen grid-cols-1 lg:grid-cols-[1fr_minmax(0,480px)]">
      {/* Left panel — animated scene */}
      <div className="relative hidden overflow-hidden lg:block">
        <AnimatedScene />

        {/* Overlay content */}
        <div className="absolute inset-0 z-10 flex flex-col justify-between p-10">
          {/* Top logo */}
          <div className="flex items-center gap-3">
            <img src="/logo-programa.jpg" alt="EduAlerta" className="h-12 w-12 rounded-lg shadow-md" />
            <div>
              <div className="text-xl font-bold text-white drop-shadow-md">EduAlerta</div>
              <div className="text-xs text-white/80 drop-shadow-sm">Seguridad Escolar en Tiempo Real</div>
            </div>
          </div>

          {/* Bottom stats */}
          <div className="space-y-4">
            <div className="text-3xl font-bold leading-tight text-white drop-shadow-lg">
              Protegiendo a<br />nuestros estudiantes.
            </div>
            <p className="max-w-sm text-sm leading-relaxed text-white/85 drop-shadow-sm">
              Plataforma operativa para sostenedores y establecimientos.
              Cumplimiento integral de la Ley N° 21.809 antes de abril 2027.
            </p>
            <div className="flex items-center gap-5 pt-2">
              <div className="flex items-center gap-2 rounded-lg bg-white/15 px-3 py-2 backdrop-blur-sm">
                <Shield className="h-4 w-4 text-white" strokeWidth={2} />
                <div>
                  <div className="text-sm font-bold text-white">15</div>
                  <div className="text-[10px] text-white/80">Establecimientos</div>
                </div>
              </div>
              <div className="flex items-center gap-2 rounded-lg bg-white/15 px-3 py-2 backdrop-blur-sm">
                <Users className="h-4 w-4 text-white" strokeWidth={2} />
                <div>
                  <div className="text-sm font-bold text-white">8.420</div>
                  <div className="text-[10px] text-white/80">Alumnos protegidos</div>
                </div>
              </div>
              <div className="flex items-center gap-2 rounded-lg bg-white/15 px-3 py-2 backdrop-blur-sm">
                <Bell className="h-4 w-4 text-white" strokeWidth={2} />
                <div>
                  <div className="text-sm font-bold text-white">99.99%</div>
                  <div className="text-[10px] text-white/80">SLA operativo</div>
                </div>
              </div>
            </div>
            <div className="pt-2 text-[11px] text-white/60">
              © 2026 ECOAVES División de Ingeniería y Software · Built in Antofagasta
            </div>
          </div>
        </div>
      </div>

      {/* Right panel — login form */}
      <div className="flex items-center justify-center bg-white px-6 py-12 dark:bg-[hsl(var(--surface))]">
        <div className="w-full max-w-sm">
          {/* Mobile header */}
          <div className="mb-8 flex flex-col items-center gap-3 lg:hidden">
            <img src="/logo-programa.jpg" alt="EduAlerta" className="w-28 drop-shadow-md" />
            <div className="text-center">
              <div className="text-lg font-bold text-text">EduAlerta</div>
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
            Si tu correo empieza con <code className="text-text">apoderado</code>, ingresarás como
            apoderado.
          </div>
        </div>
      </div>
    </div>
  );
}
