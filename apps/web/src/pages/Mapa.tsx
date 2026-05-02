import { Map as MapIcon, MapPin } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { schools } from '@/lib/mock-data';

export function Mapa() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-text">Mapa operativo</h1>
        <p className="text-xs text-muted">Geolocalización en tiempo real y geofencing por establecimiento</p>
      </div>

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-[280px_1fr]">
        <Card className="overflow-hidden">
          <div className="border-b border-border px-4 py-2.5 text-xs font-semibold text-text">
            Establecimientos ({schools.length})
          </div>
          <ul className="max-h-[560px] overflow-y-auto scrollbar-thin">
            {schools.map((s) => (
              <li
                key={s.rbd}
                className="flex items-center justify-between gap-3 border-b border-border px-4 py-2.5 last:border-b-0 hover:bg-bg/40"
              >
                <div className="min-w-0">
                  <div className="truncate text-xs font-medium text-text">{s.name}</div>
                  <div className="truncate text-2xs text-muted tabular">
                    {s.lat.toFixed(4)}, {s.lng.toFixed(4)}
                  </div>
                </div>
                <Badge tone="success" dot>{s.type}</Badge>
              </li>
            ))}
          </ul>
        </Card>

        <Card className="relative overflow-hidden">
          <div
            className="relative grid h-[600px] w-full place-items-center bg-bg"
            style={{
              backgroundImage:
                'radial-gradient(circle at 1px 1px, hsl(var(--border)) 1px, transparent 0)',
              backgroundSize: '24px 24px',
            }}
          >
            <div className="flex max-w-md flex-col items-center gap-3 px-6 text-center">
              <div className="flex size-12 items-center justify-center rounded-md border border-border bg-surface text-muted">
                <MapIcon className="h-5 w-5" strokeWidth={1.5} />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-text">Integración Google Maps lista</h3>
                <p className="mt-1 text-2xs text-muted">
                  Configura <code className="text-text">VITE_GOOGLE_MAPS_API_KEY</code> en tu archivo
                  <code className="text-text"> .env</code> para activar el mapa interactivo con
                  geofencing y heatmap de incidencias.
                </p>
              </div>
            </div>

            {/* Floating school pins for visual */}
            {schools.slice(0, 8).map((s, i) => (
              <div
                key={s.rbd}
                className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2"
                style={{
                  left: `${15 + (i * 11) % 70}%`,
                  top: `${20 + (i * 17) % 60}%`,
                }}
              >
                <MapPin className="h-4 w-4 text-accent" strokeWidth={2} fill="#1a2e5a" />
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
