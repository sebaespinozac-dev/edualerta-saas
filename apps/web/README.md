# EduAlerta Web

UI premium estilo Linear / Stripe. React 18 + Vite 6 + TypeScript + Tailwind.

## Páginas

- `/login` — autenticación
- `/dashboard` — overview admin con KPIs, chart asistencia, feed live, tabla establecimientos
- `/alumnos` — lista paginada con búsqueda
- `/alumnos/nuevo` — wizard 3 pasos + emisión QR
- `/alertas` — empty state + activar alerta general
- `/mapa` — placeholder Google Maps + lista establecimientos
- `/apoderado` — vista mobile-first para apoderados
- `/reportes` — plantillas PDF/Excel
- `/configuracion` — perfil, equipo, integraciones, facturación

## Dev

```bash
npm install
npm run dev   # http://localhost:5173
```

Proxy `/api → http://localhost:4000` configurado en `vite.config.ts`.

## Variables de entorno

```
VITE_GOOGLE_MAPS_API_KEY=  # opcional, para activar el mapa
```
