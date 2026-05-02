import { useState, type FormEvent } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { ArrowRight, Loader2 } from 'lucide-react';
import { Logo } from '@/components/layout/Logo';
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
    <div className="grid min-h-screen grid-cols-1 lg:grid-cols-[1fr_minmax(0,560px)]">
      <div className="hidden border-r border-border bg-bg lg:flex lg:flex-col lg:justify-between lg:p-12">
        <Logo />
        <div className="space-y-6">
          {/* Hero image */}
          <div className="flex justify-center">
            <img
              src="/logo-programa.jpg"
              alt="EduAlerta — Seguridad Escolar"
              className="w-80 drop-shadow-sm"
            />
          </div>
          <div className="text-3xl font-semibold tracking-tight text-text">
            Seguridad escolar<br />en tiempo real.
          </div>
          <p className="max-w-sm text-sm leading-relaxed text-muted">
            Plataforma operativa para sostenedores y establecimientos. Cumplimiento
            integral de la Ley N° 21.809 antes de abril de 2027.
          </p>
          <div className="flex items-center gap-6 pt-4 text-2xs text-muted">
            <div>
              <div className="text-text font-semibold tabular">15</div>
              <div>Establecimientos</div>
            </div>
            <div className="h-8 w-px bg-border" />
            <div>
              <div className="text-text font-semibold tabular">8.420</div>
              <div>Alumnos protegidos</div>
            </div>
            <div className="h-8 w-px bg-border" />
            <div>
              <div className="text-text font-semibold tabular">99.99%</div>
              <div>SLA operativo</div>
            </div>
          </div>
        </div>
        <div className="text-2xs text-muted">
          © 2026 ECOAVES División de Ingeniería y Software · Built in Antofagasta
        </div>
      </div>

      <div className="flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          {/* Logo visible en móvil */}
          <div className="mb-6 flex flex-col items-center gap-3 lg:hidden">
            <img
              src="/logo-programa.jpg"
              alt="EduAlerta"
              className="w-40 drop-shadow-sm"
            />
            <Logo />
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
