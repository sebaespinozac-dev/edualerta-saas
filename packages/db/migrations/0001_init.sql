-- Migration 0001 — initial schema for EduAlerta
-- Generated: 2026-05-01
-- This file MUST be idempotent (safe to re-run).

\i ../schema.sql

-- A trivial migrations table so future migrations know what's applied.
CREATE TABLE IF NOT EXISTS schema_migrations (
  version     VARCHAR(40) PRIMARY KEY,
  applied_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO schema_migrations (version) VALUES ('0001_init')
ON CONFLICT (version) DO NOTHING;
