import { MessageCircle, Siren, ShieldCheck, Smartphone } from 'lucide-react';
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
  const [smsChannel, setSmsChannel] = useState(true);
  const [whatsappChannel, setWhatsappChannel] = useState(true);

  function triggerAlert() {
    setOpen(false);
    toast.error('Alerta general activada - Notificacion enviada');
    if (smsChannel) {
      setTimeout(() => {
        toast.success('SMS enviados a 1.240 apoderados', {
          icon: <Smartphone className="h-4 w-4" />,
        });
      }, 600);
    }
    if (whatsappChannel) {
      setTimeout(() => {
        toast.success('WhatsApp enviados a 1.240 apoderados', {
          icon: <MessageCircle className="h-4 w-4" />,
        });
      }, 1200);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-text">Alertas</h1>
          <p className="text-xs text-muted">Activaciones de protocolo y eventos criticos</p>
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
                Esta accion notificara a los 15 establecimientos, al equipo directivo y a los apoderados.
                ¿Confirmas la activacion?
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setOpen(false)}>Cancelar</Button>
              <Button variant="danger" onClick={triggerAlert}>
                Activar ahora
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Notification channels */}
      <Card className="overflow-hidden">
        <div className="border-b border-border px-4 py-2.5 text-xs font-semibold text-text">
          Canales de notificacion
        </div>
        <div className="divide-y divide-border">
          <label className="flex cursor-pointer items-center gap-3 px-4 py-3 hover:bg-bg/40 transition-colors">
            <input
              type="checkbox"
              checked={smsChannel}
              onChange={(e) => setSmsChannel(e.target.checked)}
              className="h-4 w-4 rounded border-border text-accent focus:ring-accent/30"
            />
            <div className="flex size-8 flex-none items-center justify-center rounded-full bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
              <Smartphone className="h-4 w-4" strokeWidth={1.75} />
            </div>
            <div className="flex-1">
              <div className="text-xs font-medium text-text">SMS</div>
              <div className="text-2xs text-muted">Enviar SMS a todos los apoderados registrados</div>
            </div>
          </label>
          <label className="flex cursor-pointer items-center gap-3 px-4 py-3 hover:bg-bg/40 transition-colors">
            <input
              type="checkbox"
              checked={whatsappChannel}
              onChange={(e) => setWhatsappChannel(e.target.checked)}
              className="h-4 w-4 rounded border-border text-accent focus:ring-accent/30"
            />
            <div className="flex size-8 flex-none items-center justify-center rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
              <MessageCircle className="h-4 w-4" strokeWidth={1.75} />
            </div>
            <div className="flex-1">
              <div className="text-xs font-medium text-text">WhatsApp</div>
              <div className="text-2xs text-muted">Enviar mensajes WhatsApp a todos los apoderados</div>
            </div>
          </label>
        </div>
      </Card>

      <Card className="flex flex-col items-center justify-center gap-3 px-6 py-20 text-center">
        <div className="flex size-12 items-center justify-center rounded-full border border-border bg-bg/50 text-emerald-500">
          <ShieldCheck className="h-5 w-5" strokeWidth={1.5} />
        </div>
        <div>
          <h2 className="text-sm font-semibold text-text">Sin alertas activas</h2>
          <p className="mt-1 max-w-sm text-2xs text-muted">
            Todos los establecimientos operando con normalidad. La ultima alerta fue hace 14 dias y
            se resolvio en 3 minutos.
          </p>
        </div>
      </Card>
    </div>
  );
}
