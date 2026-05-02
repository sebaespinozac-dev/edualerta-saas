import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Check, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input, Label } from '@/components/ui/Input';
import { schools } from '@/lib/mock-data';
import { cn } from '@/lib/utils';

const steps = [
  { id: 1, label: 'Datos del alumno' },
  { id: 2, label: 'Apoderado y contactos' },
  { id: 3, label: 'Confirmación' },
];

export function NuevoAlumno() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    run: '',
    name: '',
    grade: '',
    schoolRbd: schools[0].rbd,
    guardianName: '',
    guardianPhone: '',
    guardianEmail: '',
    emergencyName: '',
    emergencyPhone: '',
  });

  function update<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function submit() {
    toast.success('Alumno creado y código QR generado.');
    navigate('/alumnos');
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <button
        onClick={() => navigate('/alumnos')}
        className="inline-flex items-center gap-1.5 text-2xs text-muted hover:text-text"
      >
        <ArrowLeft className="h-3 w-3" strokeWidth={1.75} />
        Volver a alumnos
      </button>

      <div>
        <h1 className="text-xl font-semibold tracking-tight text-text">Nuevo alumno</h1>
        <p className="text-xs text-muted">Completa los 3 pasos para emitir el código QR único.</p>
      </div>

      {/* stepper */}
      <ol className="flex items-center gap-2">
        {steps.map((s, idx) => (
          <li key={s.id} className="flex flex-1 items-center gap-2">
            <div
              className={cn(
                'flex size-6 flex-none items-center justify-center rounded-full text-2xs font-medium tabular',
                step >= s.id
                  ? 'bg-accent text-white'
                  : 'border border-border bg-surface text-muted',
              )}
            >
              {step > s.id ? <Check className="h-3 w-3" strokeWidth={2} /> : s.id}
            </div>
            <span
              className={cn(
                'text-2xs font-medium',
                step >= s.id ? 'text-text' : 'text-muted',
              )}
            >
              {s.label}
            </span>
            {idx < steps.length - 1 && (
              <div className="ml-1 h-px flex-1 bg-border" />
            )}
          </li>
        ))}
      </ol>

      <Card className="p-6">
        {step === 1 && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="RUN del alumno">
              <Input value={form.run} onChange={(e) => update('run', e.target.value)} placeholder="22.123.456-7" />
            </Field>
            <Field label="Nombre completo">
              <Input value={form.name} onChange={(e) => update('name', e.target.value)} />
            </Field>
            <Field label="Curso">
              <Input value={form.grade} onChange={(e) => update('grade', e.target.value)} placeholder="4° Básico" />
            </Field>
            <Field label="Establecimiento">
              <select
                value={form.schoolRbd}
                onChange={(e) => update('schoolRbd', Number(e.target.value))}
                className="h-9 w-full rounded-md border border-border bg-surface px-3 text-sm focus:outline-none focus:ring-2 focus:ring-accent/30"
              >
                {schools.map((s) => (
                  <option key={s.rbd} value={s.rbd}>
                    {s.name}
                  </option>
                ))}
              </select>
            </Field>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <div>
              <div className="mb-3 text-2xs font-medium uppercase tracking-wider text-muted">
                Apoderado principal
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label="Nombre completo">
                  <Input
                    value={form.guardianName}
                    onChange={(e) => update('guardianName', e.target.value)}
                  />
                </Field>
                <Field label="Teléfono">
                  <Input
                    value={form.guardianPhone}
                    onChange={(e) => update('guardianPhone', e.target.value)}
                    placeholder="+56 9 …"
                  />
                </Field>
                <Field label="Correo electrónico" className="sm:col-span-2">
                  <Input
                    type="email"
                    value={form.guardianEmail}
                    onChange={(e) => update('guardianEmail', e.target.value)}
                  />
                </Field>
              </div>
            </div>
            <div>
              <div className="mb-3 text-2xs font-medium uppercase tracking-wider text-muted">
                Contacto de emergencia
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label="Nombre">
                  <Input
                    value={form.emergencyName}
                    onChange={(e) => update('emergencyName', e.target.value)}
                  />
                </Field>
                <Field label="Teléfono">
                  <Input
                    value={form.emergencyPhone}
                    onChange={(e) => update('emergencyPhone', e.target.value)}
                  />
                </Field>
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <div className="text-xs text-muted">Revisa la información antes de confirmar.</div>
            <dl className="divide-y divide-border rounded-md border border-border">
              {[
                ['Alumno', form.name || '—'],
                ['RUN', form.run || '—'],
                ['Curso', form.grade || '—'],
                [
                  'Establecimiento',
                  schools.find((s) => s.rbd === form.schoolRbd)?.name ?? '—',
                ],
                ['Apoderado', form.guardianName || '—'],
                ['Teléfono apoderado', form.guardianPhone || '—'],
                ['Correo apoderado', form.guardianEmail || '—'],
                ['Contacto emergencia', form.emergencyName || '—'],
              ].map(([k, v]) => (
                <div key={k} className="flex items-center justify-between px-4 py-2.5 text-xs">
                  <dt className="text-muted">{k}</dt>
                  <dd className="text-text">{v}</dd>
                </div>
              ))}
            </dl>
            <div className="flex items-center gap-2 rounded-md border border-border bg-bg/50 p-3 text-2xs text-muted">
              <Check className="h-3.5 w-3.5 text-emerald-500" strokeWidth={2} />
              Al confirmar se generará automáticamente el código QR único del alumno.
            </div>
          </div>
        )}
      </Card>

      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="md"
          disabled={step === 1}
          onClick={() => setStep((s) => s - 1)}
        >
          Atrás
        </Button>
        {step < 3 ? (
          <Button variant="primary" size="md" onClick={() => setStep((s) => s + 1)}>
            Continuar
            <ChevronRight className="h-3.5 w-3.5" strokeWidth={1.75} />
          </Button>
        ) : (
          <Button variant="primary" size="md" onClick={submit}>
            Crear alumno y emitir QR
          </Button>
        )}
      </div>
    </div>
  );
}

function Field({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('space-y-1.5', className)}>
      <Label>{label}</Label>
      {children}
    </div>
  );
}
