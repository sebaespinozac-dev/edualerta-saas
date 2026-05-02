import { useState, type FormEvent } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { ArrowRight, Loader2, Shield, Bell, Users } from 'lucide-react';
import { Input, Label, FieldError } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/hooks/useAuth';

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
    <div className="grid min-h-screen grid-cols-1 lg:grid-cols-[1fr_minmax(0,460px)]">
      {/* Left — immersive scene */}
      <div className="login-scene-wrap relative hidden overflow-hidden lg:block">
        {/* Layered background */}
        <div className="login-bg" />

        {/* Subtle clouds */}
        <div className="login-cloud-a" />
        <div className="login-cloud-b" />
        <div className="login-cloud-c" />

        {/* School image — integrated, no white box */}
        <div className="login-hero-img">
          <img
            src="/logo-programa.png"
            alt="EduAlerta"
            draggable={false}
          />
        </div>

        {/* Content overlay */}
        <div className="absolute inset-0 z-10 flex flex-col justify-between p-10">
          {/* Top branding */}
          <div className="flex items-center gap-3">
            <img
              src="/logo-programa.png"
              alt=""
              className="h-11 w-11 rounded-xl bg-white/20 p-1 shadow-lg backdrop-blur-md"
            />
            <div>
              <div className="text-[22px] font-bold tracking-tight text-white drop-shadow-lg">
                EduAlerta
              </div>
              <div className="text-[11px] font-medium tracking-wide text-white/80">
                SEGURIDAD ESCOLAR EN TIEMPO REAL
              </div>
            </div>
          </div>

          {/* Bottom info */}
          <div className="space-y-5">
            <h2 className="text-[32px] font-bold leading-[1.15] tracking-tight text-white drop-shadow-lg">
              Protegiendo a nuestros<br />estudiantes, cada día.
            </h2>
            <p className="max-w-md text-[13px] leading-relaxed text-white/90 drop-shadow">
              Plataforma operativa para sostenedores y establecimientos educacionales.
              Cumplimiento integral de la Ley N° 21.809.
            </p>

            <div className="flex gap-3 pt-1">
              <div className="login-stat-card">
                <Shield className="h-4 w-4 text-white/90" strokeWidth={1.75} />
                <div>
                  <div className="text-[15px] font-bold text-white">15</div>
                  <div className="text-[10px] text-white/70">Establecimientos</div>
                </div>
              </div>
              <div className="login-stat-card">
                <Users className="h-4 w-4 text-white/90" strokeWidth={1.75} />
                <div>
                  <div className="text-[15px] font-bold text-white">8.420</div>
                  <div className="text-[10px] text-white/70">Alumnos protegidos</div>
                </div>
              </div>
              <div className="login-stat-card">
                <Bell className="h-4 w-4 text-white/90" strokeWidth={1.75} />
                <div>
                  <div className="text-[15px] font-bold text-white">99.99%</div>
                  <div className="text-[10px] text-white/70">Disponibilidad</div>
                </div>
              </div>
            </div>

            <div className="text-[11px] text-white/50">
              © 2026 ECOAVES División de Ingeniería y Software · Antofagasta, Chile
            </div>
          </div>
        </div>
      </div>

      {/* Right — form */}
      <div className="flex items-center justify-center bg-white px-6 py-12 dark:bg-[hsl(var(--surface))]">
        <div className="w-full max-w-sm">
          {/* Mobile header */}
          <div className="mb-8 flex flex-col items-center gap-4 lg:hidden">
            <div className="rounded-2xl bg-gradient-to-br from-[#87CEEB] to-[#4CAF50] p-4 shadow-lg">
              <img src="/logo-programa.png" alt="EduAlerta" className="w-24" />
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
            Si tu correo empieza con <code className="text-text">apoderado</code>, ingresarás como
            apoderado.
          </div>
        </div>
      </div>
    </div>
  );
}
