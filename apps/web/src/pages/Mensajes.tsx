import { useState } from 'react';
import {
  Mail,
  MessageSquare,
  Paperclip,
  Send,
  Smartphone,
  Users,
} from 'lucide-react';
import { toast } from 'sonner';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input, Label } from '@/components/ui/Input';

/* ------------------------------------------------------------------ */
/*  Mock data                                                          */
/* ------------------------------------------------------------------ */

const recipientOptions = [
  { value: 'all', label: 'Todos los apoderados', count: 1240 },
  { value: 'school-12634', label: 'Liceo A-12 Jeraldo Munoz Campos', count: 420 },
  { value: 'school-12636', label: 'Liceo A-14 Tecnico Profesional', count: 380 },
  { value: 'school-12640', label: 'Escuela D-68 Juan Sandoval Carrasco', count: 210 },
  { value: 'course-1basico', label: '1 Basico - Escuela D-68', count: 45 },
  { value: 'course-2basico', label: '2 Basico - Escuela D-68', count: 38 },
];

const mockHistory = [
  {
    id: 1,
    title: 'Reunion de apoderados 1 Basico',
    channels: ['SMS', 'WhatsApp'],
    time: 'hace 2 horas',
    recipients: 45,
  },
  {
    id: 2,
    title: 'Suspension de clases por emergencia',
    channels: ['SMS', 'WhatsApp', 'Email'],
    time: 'hace 1 dia',
    recipients: 1240,
  },
  {
    id: 3,
    title: 'Informacion protocolo Ley 21.809',
    channels: ['Email'],
    time: 'hace 3 dias',
    recipients: 1240,
  },
  {
    id: 4,
    title: 'Citacion individual',
    channels: ['WhatsApp'],
    time: 'hace 5 dias',
    recipients: 1,
  },
  {
    id: 5,
    title: 'Actividad extraprogramatica',
    channels: ['App'],
    time: 'hace 1 semana',
    recipients: 380,
  },
];

function channelBadge(channel: string) {
  switch (channel) {
    case 'SMS':
      return <Badge tone="accent" key={channel}>SMS</Badge>;
    case 'WhatsApp':
      return <Badge tone="success" key={channel}>WhatsApp</Badge>;
    case 'Email':
      return <Badge tone="warning" key={channel}>Email</Badge>;
    case 'App':
      return <Badge tone="default" key={channel}>App</Badge>;
    default:
      return <Badge key={channel}>{channel}</Badge>;
  }
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function Mensajes() {
  const [recipient, setRecipient] = useState('all');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [channels, setChannels] = useState({
    sms: true,
    whatsapp: true,
    email: true,
    app: true,
  });

  const selectedRecipient = recipientOptions.find((r) => r.value === recipient);

  function toggleChannel(key: keyof typeof channels) {
    setChannels((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  function handleSend() {
    if (!subject.trim() || !message.trim()) {
      toast.error('Completa el asunto y el mensaje antes de enviar');
      return;
    }
    toast.success(
      `Comunicado enviado a ${selectedRecipient?.count.toLocaleString('es-CL')} apoderados`,
    );
    setSubject('');
    setMessage('');
  }

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-text">Centro de Mensajes</h1>
        <p className="text-xs text-muted">
          Envia comunicados a apoderados por curso o establecimiento
        </p>
      </div>

      {/* Compose */}
      <Card className="overflow-hidden">
        <div className="border-b border-border px-4 py-2.5 text-xs font-semibold text-text">
          Nuevo comunicado
        </div>
        <div className="p-4 space-y-4">
          {/* Recipient */}
          <div className="space-y-1.5">
            <Label htmlFor="recipient">Destinatarios</Label>
            <select
              id="recipient"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              className="flex h-9 w-full rounded-md border border-border bg-surface px-3 py-1 text-sm text-text focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent/50 transition-[box-shadow,border-color] duration-150"
            >
              {recipientOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label} ({opt.count})
                </option>
              ))}
            </select>
          </div>

          {/* Channels */}
          <div className="space-y-1.5">
            <Label>Canales de envio</Label>
            <div className="flex flex-wrap gap-3">
              {([
                { key: 'sms' as const, label: 'SMS', icon: Smartphone },
                { key: 'whatsapp' as const, label: 'WhatsApp', icon: MessageSquare },
                { key: 'email' as const, label: 'Email', icon: Mail },
                { key: 'app' as const, label: 'App', icon: Users },
              ]).map(({ key, label, icon: Icon }) => (
                <label
                  key={key}
                  className="inline-flex items-center gap-2 cursor-pointer select-none"
                >
                  <input
                    type="checkbox"
                    checked={channels[key]}
                    onChange={() => toggleChannel(key)}
                    className="size-4 rounded border-border text-accent focus:ring-accent/30"
                  />
                  <Icon className="h-3.5 w-3.5 text-muted" strokeWidth={1.75} />
                  <span className="text-xs text-text">{label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Subject */}
          <div className="space-y-1.5">
            <Label htmlFor="subject">Asunto</Label>
            <Input
              id="subject"
              placeholder="Asunto del comunicado..."
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />
          </div>

          {/* Message */}
          <div className="space-y-1.5">
            <Label htmlFor="message">Mensaje</Label>
            <textarea
              id="message"
              rows={5}
              placeholder="Escribe el mensaje para los apoderados..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="flex w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-text placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent/50 transition-[box-shadow,border-color] duration-150 resize-y"
            />
          </div>

          {/* Actions */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            <Button variant="ghost" size="sm">
              <Paperclip className="h-3.5 w-3.5" strokeWidth={1.75} />
              Adjuntar archivo
            </Button>
            <Button variant="primary" size="md" onClick={handleSend}>
              <Send className="h-3.5 w-3.5" strokeWidth={1.75} />
              Enviar comunicado
            </Button>
          </div>
        </div>
      </Card>

      {/* History */}
      <Card className="overflow-hidden">
        <div className="border-b border-border px-4 py-2.5 text-xs font-semibold text-text">
          Historial de envios
        </div>
        <ul className="divide-y divide-border">
          {mockHistory.map((msg) => (
            <li key={msg.id} className="flex items-start justify-between gap-3 px-4 py-3">
              <div className="min-w-0 flex-1">
                <div className="text-xs font-medium text-text">{msg.title}</div>
                <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                  {msg.channels.map((ch) => channelBadge(ch))}
                </div>
              </div>
              <div className="flex-none text-right">
                <div className="text-2xs text-muted whitespace-nowrap">{msg.time}</div>
                <div className="mt-0.5 text-2xs text-muted tabular">
                  {msg.recipients.toLocaleString('es-CL')} {msg.recipients === 1 ? 'destinatario' : 'destinatarios'}
                </div>
              </div>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
