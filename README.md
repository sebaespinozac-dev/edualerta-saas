# EduAlerta

> Plataforma SaaS de seguridad escolar en tiempo real para sostenedores municipales en Chile.
> Cumplimiento integral de la Ley N° 21.809 (plazo abril 2027).

**Construido en 2026 por ECOAVES División de Ingeniería y Software · Built in Antofagasta.**

---

## Estructura

```
edualerta-saas/
├── apps/
│   ├── web/           # React + Vite + TypeScript + Tailwind (UI)
│   └── api/           # Node.js + Express + TypeScript + Socket.io
├── packages/
│   └── db/            # PostgreSQL schema, migrations, seed
├── docker-compose.yml # Postgres 16 + Redis 7 + Adminer
└── docs/
```

## Stack

| Capa        | Tecnología                                                    |
|-------------|---------------------------------------------------------------|
| Frontend    | React 18, Vite 6, TypeScript, Tailwind, Radix UI, TanStack    |
| Backend     | Node.js 20, Express 4, TypeScript, Socket.io 4                |
| DB          | PostgreSQL 16 (multi-tenant, normalizada, RLS-ready)          |
| Auth        | JWT (access 15min + refresh 7d), bcrypt, RBAC                 |
| Realtime    | Socket.io con namespace `/realtime`                           |
| Observ.     | pino + pino-http + request IDs + audit logs                   |
| Cache/Queue | Redis 7                                                       |

## Quick start

```bash
# 1. Levanta Postgres + Redis + Adminer
docker compose up -d

# 2. Backend
cd apps/api
cp .env.example .env
npm install
npm run dev          # http://localhost:4000

# 3. Frontend (en otra terminal)
cd apps/web
npm install
npm run dev          # http://localhost:5173
```

Adminer en `http://localhost:8080` (server: `postgres`, user/pass/db: `edualerta`).

## Módulos del producto

1. **Botón de pánico en tiempo real** (Socket.io)
2. **Control de acceso QR** (UUID por alumno, escaneo móvil/cámara)
3. **App apoderado** (estado del hijo en vivo)
4. **Panel directivo** (KPIs y reportes MINEDUC)
5. **Administración multi-establecimiento** (DAEM/CMDS)
6. **Alertas masivas** (notificación + integración Carabineros)

## Endpoints principales

```
POST   /api/v1/auth/login
POST   /api/v1/auth/refresh
GET    /api/v1/auth/me
GET    /api/v1/establishments
GET    /api/v1/students?establishment_id=&search=&page=&limit=
POST   /api/v1/students
GET    /api/v1/students/:id/qr        (PNG/SVG)
POST   /api/v1/attendance/check-in
GET    /api/v1/attendance/stats
POST   /api/v1/alerts                 (trigger panic)
POST   /api/v1/alerts/:id/acknowledge
POST   /api/v1/alerts/:id/resolve
POST   /api/v1/reports/generate
GET    /health
```

## Roadmap inmediato

- [ ] Conectar frontend a API real (reemplazar mock-data)
- [ ] Integración Google Maps (geofencing + heatmap)
- [ ] Generación PDF/XLSX (pdfkit + exceljs)
- [ ] Tests E2E (Playwright)
- [ ] CI/CD (GitHub Actions)
- [ ] Deploy: API en Render, Web en Vercel

---

## Contacto

**ECOAVES División de Ingeniería y Software**
Sebastián Espinosa · sebastian.espinosa@ecoaves.cl · +56 9 8299 7453
Av. Argentina, Antofagasta · RUT 78.294.861-K
