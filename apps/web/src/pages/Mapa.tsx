import { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { schools } from '@/lib/mock-data';
import { formatPercent } from '@/lib/utils';

const ANTOFAGASTA_CENTER: [number, number] = [-23.6735, -70.4090];

const pinIcon = new L.DivIcon({
  className: '',
  html: `<div style="
    width:28px;height:28px;border-radius:50%;background:#1a2e5a;border:3px solid #fff;
    box-shadow:0 2px 8px rgba(0,0,0,.3);display:flex;align-items:center;justify-content:center;
  "><div style="width:8px;height:8px;border-radius:50%;background:#4ade80"></div></div>`,
  iconSize: [28, 28],
  iconAnchor: [14, 14],
});

const selectedIcon = new L.DivIcon({
  className: '',
  html: `<div style="
    width:36px;height:36px;border-radius:50%;background:#2563eb;border:3px solid #fff;
    box-shadow:0 2px 12px rgba(37,99,235,.5);display:flex;align-items:center;justify-content:center;
  "><div style="width:10px;height:10px;border-radius:50%;background:#fff"></div></div>`,
  iconSize: [36, 36],
  iconAnchor: [18, 18],
});

export function Mapa() {
  const [selected, setSelected] = useState<number | null>(null);

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
          <ul className="max-h-[600px] overflow-y-auto scrollbar-thin">
            {schools.map((s) => (
              <li
                key={s.rbd}
                onClick={() => setSelected(s.rbd === selected ? null : s.rbd)}
                className={`flex cursor-pointer items-center justify-between gap-3 border-b border-border px-4 py-2.5 last:border-b-0 transition-colors ${
                  selected === s.rbd ? 'bg-accent/10' : 'hover:bg-bg/40'
                }`}
              >
                <div className="min-w-0">
                  <div className="truncate text-xs font-medium text-text">{s.name}</div>
                  <div className="flex items-center gap-2 text-2xs text-muted">
                    <span className="tabular">{s.students} alumnos</span>
                    <span>·</span>
                    <span className="tabular">{formatPercent(s.attendance)}</span>
                  </div>
                </div>
                <Badge tone="success" dot>{s.type}</Badge>
              </li>
            ))}
          </ul>
        </Card>

        <Card className="overflow-hidden">
          <MapContainer
            center={ANTOFAGASTA_CENTER}
            zoom={13}
            style={{ height: 600, width: '100%' }}
            className="z-0 rounded-md"
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {schools.map((s) => (
              <Marker
                key={s.rbd}
                position={[s.lat, s.lng]}
                icon={selected === s.rbd ? selectedIcon : pinIcon}
                eventHandlers={{
                  click: () => setSelected(s.rbd),
                }}
              >
                <Popup>
                  <div className="min-w-[180px]">
                    <div className="text-sm font-semibold">{s.name}</div>
                    <div className="mt-1 text-xs text-gray-500">RBD: {s.rbd}</div>
                    <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                      <span className="text-gray-500">Alumnos:</span>
                      <span className="font-medium">{s.students}</span>
                      <span className="text-gray-500">Asistencia:</span>
                      <span className="font-medium">{formatPercent(s.attendance)}</span>
                      <span className="text-gray-500">Tipo:</span>
                      <span className="font-medium">{s.type}</span>
                      <span className="text-gray-500">Estado:</span>
                      <span className="font-medium text-green-600">Operativo</span>
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}
            {selected && (() => {
              const s = schools.find((x) => x.rbd === selected);
              if (!s) return null;
              return (
                <Circle
                  center={[s.lat, s.lng]}
                  radius={300}
                  pathOptions={{
                    color: '#2563eb',
                    fillColor: '#2563eb',
                    fillOpacity: 0.08,
                    weight: 2,
                    dashArray: '6 4',
                  }}
                />
              );
            })()}
          </MapContainer>
        </Card>
      </div>
    </div>
  );
}
