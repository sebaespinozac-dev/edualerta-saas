import { useState, useCallback, useRef } from 'react';
import {
  GoogleMap,
  useJsApiLoader,
  Marker,
  InfoWindow,
  Circle,
} from '@react-google-maps/api';
import { MapPin, Loader2 } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { schools } from '@/lib/mock-data';
import { formatPercent } from '@/lib/utils';

const ANTOFAGASTA_CENTER = { lat: -23.6735, lng: -70.4090 };
const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

const mapContainerStyle = { width: '100%', height: '600px' };

const mapOptions: google.maps.MapOptions = {
  disableDefaultUI: false,
  zoomControl: true,
  mapTypeControl: true,
  streetViewControl: false,
  fullscreenControl: true,
  styles: [
    { featureType: 'poi', elementType: 'labels', stylers: [{ visibility: 'off' }] },
    { featureType: 'transit', stylers: [{ visibility: 'off' }] },
  ],
};

function MapFallback() {
  return (
    <Card className="overflow-hidden">
      <div className="flex h-[600px] flex-col items-center justify-center gap-4 bg-bg p-8 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
          <MapPin className="h-7 w-7" strokeWidth={1.5} />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-text">Google Maps</h3>
          <p className="mt-1 max-w-sm text-2xs text-muted">
            Configura <code className="rounded bg-gray-100 px-1 py-0.5 text-xs text-text">VITE_GOOGLE_MAPS_API_KEY</code> en
            tu archivo <code className="rounded bg-gray-100 px-1 py-0.5 text-xs text-text">.env</code> para activar
            el mapa interactivo con geofencing.
          </p>
        </div>
        <div className="mt-4 grid grid-cols-3 gap-4 text-2xs text-muted">
          {schools.slice(0, 6).map((s) => (
            <div key={s.rbd} className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-green-500" />
              <span className="truncate">{s.name.split(' ').slice(0, 3).join(' ')}</span>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}

function GoogleMapView({
  selected,
  onSelect,
}: {
  selected: number | null;
  onSelect: (rbd: number | null) => void;
}) {
  const mapRef = useRef<google.maps.Map | null>(null);
  const [infoOpen, setInfoOpen] = useState<number | null>(null);

  const onLoad = useCallback((map: google.maps.Map) => {
    mapRef.current = map;
    const bounds = new google.maps.LatLngBounds();
    schools.forEach((s) => bounds.extend({ lat: s.lat, lng: s.lng }));
    map.fitBounds(bounds, 60);
  }, []);

  const handleMarkerClick = (rbd: number) => {
    onSelect(rbd);
    setInfoOpen(rbd);
    const school = schools.find((s) => s.rbd === rbd);
    if (school && mapRef.current) {
      mapRef.current.panTo({ lat: school.lat, lng: school.lng });
      mapRef.current.setZoom(15);
    }
  };

  return (
    <Card className="overflow-hidden">
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={ANTOFAGASTA_CENTER}
        zoom={13}
        onLoad={onLoad}
        options={mapOptions}
        onClick={() => { onSelect(null); setInfoOpen(null); }}
      >
        {schools.map((s) => (
          <Marker
            key={s.rbd}
            position={{ lat: s.lat, lng: s.lng }}
            onClick={() => handleMarkerClick(s.rbd)}
            icon={{
              path: google.maps.SymbolPath.CIRCLE,
              scale: selected === s.rbd ? 12 : 9,
              fillColor: selected === s.rbd ? '#2563eb' : '#1a2e5a',
              fillOpacity: 1,
              strokeColor: '#ffffff',
              strokeWeight: selected === s.rbd ? 3 : 2,
            }}
          />
        ))}

        {infoOpen && (() => {
          const s = schools.find((x) => x.rbd === infoOpen);
          if (!s) return null;
          return (
            <InfoWindow
              position={{ lat: s.lat, lng: s.lng }}
              onCloseClick={() => setInfoOpen(null)}
            >
              <div className="min-w-[200px] p-1">
                <div className="text-sm font-bold text-gray-900">{s.name}</div>
                <div className="mt-0.5 text-xs text-gray-500">RBD: {s.rbd}</div>
                <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs">
                  <span className="text-gray-500">Alumnos:</span>
                  <span className="font-semibold text-gray-900">{s.students}</span>
                  <span className="text-gray-500">Asistencia:</span>
                  <span className="font-semibold text-green-700">{formatPercent(s.attendance)}</span>
                  <span className="text-gray-500">Tipo:</span>
                  <span className="font-semibold text-gray-900">{s.type}</span>
                  <span className="text-gray-500">Estado:</span>
                  <span className="font-semibold text-green-600">Operativo</span>
                </div>
              </div>
            </InfoWindow>
          );
        })()}

        {selected && (() => {
          const s = schools.find((x) => x.rbd === selected);
          if (!s) return null;
          return (
            <Circle
              center={{ lat: s.lat, lng: s.lng }}
              radius={300}
              options={{
                strokeColor: '#2563eb',
                strokeOpacity: 0.6,
                strokeWeight: 2,
                fillColor: '#2563eb',
                fillOpacity: 0.06,
              }}
            />
          );
        })()}
      </GoogleMap>
    </Card>
  );
}

export function Mapa() {
  const [selected, setSelected] = useState<number | null>(null);

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: API_KEY,
  });

  const showGoogleMap = API_KEY && isLoaded && !loadError;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-text">Mapa operativo</h1>
          <p className="text-xs text-muted">Geolocalización en tiempo real y geofencing por establecimiento</p>
        </div>
        {!API_KEY && (
          <Badge tone="warning" dot>Sin API Key</Badge>
        )}
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
                  selected === s.rbd ? 'bg-blue-50 dark:bg-blue-500/10' : 'hover:bg-bg/40'
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

        {showGoogleMap ? (
          <GoogleMapView selected={selected} onSelect={setSelected} />
        ) : API_KEY && !isLoaded ? (
          <Card className="flex h-[600px] items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-muted" />
          </Card>
        ) : (
          <MapFallback />
        )}
      </div>
    </div>
  );
}
