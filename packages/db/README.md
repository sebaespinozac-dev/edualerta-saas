# `@edualerta/db` — PostgreSQL schema & migrations

This package owns the source of truth for the EduAlerta database.

## Layout

```
packages/db/
├── schema.sql              # Full DDL (tables, enums, indexes, triggers)
├── migrations/
│   └── 0001_init.sql       # Versioned migration (applies schema.sql)
├── seed.sql                # Demo data (1 org, admin user, 15 schools)
└── README.md               # this file
```

## Quick start (Docker)

From the repo root:

```bash
docker compose up -d postgres
# wait ~3 seconds for the container to be healthy

# 1) apply schema
docker compose exec -T postgres psql -U edualerta -d edualerta < packages/db/schema.sql

# 2) seed demo data (15 Antofagasta schools, admin/admin123)
docker compose exec -T postgres psql -U edualerta -d edualerta < packages/db/seed.sql
```

## Quick start (local psql)

```bash
createdb edualerta
psql -d edualerta -f schema.sql
psql -d edualerta -f seed.sql
```

## Migrations

We keep migrations as plain numbered SQL files (`NNNN_name.sql`). The first
file applies `schema.sql` so a fresh database is set up in one command:

```bash
psql -d edualerta -f migrations/0001_init.sql
```

A `schema_migrations(version)` table tracks what's been applied — every new
migration must `INSERT ... ON CONFLICT DO NOTHING` its own version row.

## Default credentials (seed)

| Email                  | Password   | Role    |
|------------------------|------------|---------|
| `admin@edualerta.cl`   | `admin123` | admin   |
| `docente@edualerta.cl` | `admin123` | docente |

> Change these immediately in any non-local environment.

## Notes

- UUIDs everywhere via `gen_random_uuid()` (`pgcrypto`).
- Emails stored as `CITEXT` for case-insensitive lookups.
- Fuzzy student-name search uses `pg_trgm` GIN index.
- All mutable tables auto-bump `updated_at` via the `set_updated_at` trigger.
- Alerts have a partial index on `status='active'` to keep the dashboard query
  cheap even with millions of historical alerts.
