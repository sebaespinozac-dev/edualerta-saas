import { Siren, ShieldCheck } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { Card } from '@/components/ui/Card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/Dialog';
import { Button } from '@/components/ui/Button';

export function Alertas() {
  const [open, setOpen] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-text">Alertas</h1>
          <p className="text-xs text-muted">Activaciones de protocolo y eventos críticos</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button variant="danger" size="md">
              <Siren className="h-3.5 w-3.5" strokeWidth={1.75} />
              Activar alerta general
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Activar alerta general</DialogTitle>
              <DialogDescription>
                Esta acción notificará a los 15 establecimientos, al equipo directivo y a los apoderados.
                ¿Confirmas la activación?
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setOpen(false)}>Cancelar</Button>
              <Button
                variant="danger"
                onClick={() => {
                  setOpen(false);
                  toast.error('Alerta general activada · Notificación enviada');
                }}
              >
                Activar ahora
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="flex flex-col items-center justify-center gap-3 px-6 py-20 text-center">
        <div className="flex size-12 items-center justify-center rounded-full border border-border bg-bg/50 text-emerald-500">
          <ShieldCheck className="h-5 w-5" strokeWidth={1.5} />
        </div>
        <div>
          <h2 className="text-sm font-semibold text-text">Sin alertas activas</h2>
          <p className="mt-1 max-w-sm text-2xs text-muted">
            Todos los establecimientos operando con normalidad. La última alerta fue hace 14 días y
            se resolvió en 3 minutos.
          </p>
        </div>
      </Card>
    </div>
  );
}
