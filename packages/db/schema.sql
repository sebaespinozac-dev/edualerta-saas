-- =====================================================================
-- EduAlerta SaaS — PostgreSQL DDL
-- Schools safety platform. Multi-tenant by organization.
-- Target: PostgreSQL 16+
-- =====================================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";   -- gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS "citext";     -- case-insensitive emails
CREATE EXTENSION IF NOT EXISTS "pg_trgm";    -- fuzzy search on names

-- ---------------------------------------------------------------------
-- ENUM TYPES
-- ---------------------------------------------------------------------
DO $$ BEGIN
  CREATE TYPE user_role        AS ENUM ('super_admin','admin','docente','apoderado');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE user_status      AS ENUM ('active','inactive','pending');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE establishment_type AS ENUM ('Media','Basica','Parvulo','Especial');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE student_status   AS ENUM ('active','inactive','transferred');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE student_gender   AS ENUM ('M','F','X');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE attendance_type  AS ENUM ('check_in','check_out','late','absent');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE attendance_method AS ENUM ('qr','manual','biometric');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE alert_type       AS ENUM ('panic','medical','evacuation','intruder','missing_student','late_pickup');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE alert_level      AS ENUM ('info','warning','critical');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE alert_status     AS ENUM ('active','acknowledged','resolved');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE geo_event_type   AS ENUM ('geofence_enter','geofence_exit','sos','anomaly');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ---------------------------------------------------------------------
-- ORGANIZATIONS  (tenant root)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS organizations (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  name        VARCHAR(255) NOT NULL,
  rut         VARCHAR(20)  UNIQUE NOT NULL,
  created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);
COMMENT ON TABLE organizations IS 'Tenant root (e.g. a municipality, holding, sostenedor)';

-- ---------------------------------------------------------------------
-- USERS
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID        NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  email           CITEXT      UNIQUE NOT NULL,
  password_hash   VARCHAR(255) NOT NULL,
  full_name       VARCHAR(255) NOT NULL,
  role            user_role    NOT NULL DEFAULT 'docente',
  status          user_status  NOT NULL DEFAULT 'pending',
  last_login_at   TIMESTAMPTZ,
  created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_users_org        ON users(organization_id);
CREATE INDEX IF NOT EXISTS idx_users_role       ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_status     ON users(status);
COMMENT ON TABLE users IS 'Application users — RBAC by role enum';

-- ---------------------------------------------------------------------
-- ESTABLISHMENTS  (schools)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS establishments (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID        NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  rbd             VARCHAR(20) UNIQUE NOT NULL,
  name            VARCHAR(255) NOT NULL,
  type            establishment_type NOT NULL,
  lat             NUMERIC(10,7),
  lng             NUMERIC(10,7),
  address         VARCHAR(500),
  phone           VARCHAR(40),
  principal_name  VARCHAR(255),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_establishments_org   ON establishments(organization_id);
CREATE INDEX IF NOT EXISTS idx_establishments_type  ON establishments(type);
CREATE INDEX IF NOT EXISTS idx_establishments_geo   ON establishments(lat, lng);
COMMENT ON TABLE establishments IS 'Schools — RBD is Chilean Rol Base de Datos';

-- ---------------------------------------------------------------------
-- STUDENTS
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS students (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  establishment_id UUID       NOT NULL REFERENCES establishments(id) ON DELETE CASCADE,
  run             VARCHAR(20) UNIQUE NOT NULL,
  full_name       VARCHAR(255) NOT NULL,
  course          VARCHAR(60),
  qr_code         UUID        UNIQUE NOT NULL DEFAULT gen_random_uuid(),
  status          student_status NOT NULL DEFAULT 'active',
  risk_score      INT         NOT NULL DEFAULT 0 CHECK (risk_score BETWEEN 0 AND 100),
  photo_url       VARCHAR(1024),
  birth_date      DATE,
  gender          student_gender,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_students_establishment ON students(establishment_id);
CREATE INDEX IF NOT EXISTS idx_students_status        ON students(status);
CREATE INDEX IF NOT EXISTS idx_students_course        ON students(course);
CREATE INDEX IF NOT EXISTS idx_students_qr            ON students(qr_code);
CREATE INDEX IF NOT EXISTS idx_students_name_trgm     ON students USING gin (full_name gin_trgm_ops);
COMMENT ON TABLE students IS 'Pupils. qr_code is the badge identifier scanned at gate';

-- ---------------------------------------------------------------------
-- GUARDIANS  (apoderados)  +  M:N  STUDENT_GUARDIANS
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS guardians (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  run         VARCHAR(20) UNIQUE NOT NULL,
  full_name   VARCHAR(255) NOT NULL,
  phone       VARCHAR(40),
  email       CITEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_guardians_email ON guardians(email);

CREATE TABLE IF NOT EXISTS student_guardians (
  student_id   UUID NOT NULL REFERENCES students(id)   ON DELETE CASCADE,
  guardian_id  UUID NOT NULL REFERENCES guardians(id)  ON DELETE CASCADE,
  relationship VARCHAR(60) NOT NULL,
  is_primary   BOOLEAN     NOT NULL DEFAULT FALSE,
  PRIMARY KEY (student_id, guardian_id)
);
CREATE INDEX IF NOT EXISTS idx_sg_guardian ON student_guardians(guardian_id);

-- ---------------------------------------------------------------------
-- EMERGENCY_CONTACTS
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS emergency_contacts (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id   UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  full_name    VARCHAR(255) NOT NULL,
  phone        VARCHAR(40)  NOT NULL,
  relationship VARCHAR(60)
);
CREATE INDEX IF NOT EXISTS idx_emerg_student ON emergency_contacts(student_id);

-- ---------------------------------------------------------------------
-- ATTENDANCE
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS attendance (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id       UUID NOT NULL REFERENCES students(id),
  establishment_id UUID NOT NULL REFERENCES establishments(id),
  timestamp        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  type             attendance_type   NOT NULL,
  method           attendance_method NOT NULL DEFAULT 'qr',
  lat              NUMERIC(10,7),
  lng              NUMERIC(10,7),
  recorded_by      UUID REFERENCES users(id)
);
CREATE INDEX IF NOT EXISTS idx_attendance_student      ON attendance(student_id);
CREATE INDEX IF NOT EXISTS idx_attendance_establishment ON attendance(establishment_id, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_attendance_ts           ON attendance(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_attendance_type         ON attendance(type);

-- ---------------------------------------------------------------------
-- ALERTS  (panic / medical / evacuation ...)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS alerts (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  establishment_id  UUID NOT NULL REFERENCES establishments(id) ON DELETE CASCADE,
  student_id        UUID REFERENCES students(id) ON DELETE SET NULL,
  type              alert_type    NOT NULL,
  level             alert_level   NOT NULL DEFAULT 'warning',
  status            alert_status  NOT NULL DEFAULT 'active',
  message           TEXT,
  triggered_by      UUID REFERENCES users(id),
  acknowledged_by   UUID REFERENCES users(id),
  resolved_at       TIMESTAMPTZ,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_alerts_establishment ON alerts(establishment_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_alerts_status        ON alerts(status);
CREATE INDEX IF NOT EXISTS idx_alerts_type          ON alerts(type);
CREATE INDEX IF NOT EXISTS idx_alerts_active        ON alerts(status) WHERE status = 'active';

-- ---------------------------------------------------------------------
-- GEO_EVENTS  (geofencing, sos, anomalies)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS geo_events (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id       UUID REFERENCES students(id) ON DELETE SET NULL,
  establishment_id UUID REFERENCES establishments(id) ON DELETE SET NULL,
  lat              NUMERIC(10,7) NOT NULL,
  lng              NUMERIC(10,7) NOT NULL,
  type             geo_event_type NOT NULL,
  metadata         JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_geo_student   ON geo_events(student_id);
CREATE INDEX IF NOT EXISTS idx_geo_estab     ON geo_events(establishment_id);
CREATE INDEX IF NOT EXISTS idx_geo_type      ON geo_events(type);
CREATE INDEX IF NOT EXISTS idx_geo_created   ON geo_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_geo_metadata  ON geo_events USING gin (metadata);

-- ---------------------------------------------------------------------
-- AUDIT_LOGS
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS audit_logs (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID REFERENCES users(id) ON DELETE SET NULL,
  action        VARCHAR(80)  NOT NULL,
  resource_type VARCHAR(80)  NOT NULL,
  resource_id   UUID,
  ip_address    INET,
  user_agent    TEXT,
  metadata      JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_audit_user      ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_resource  ON audit_logs(resource_type, resource_id);
CREATE INDEX IF NOT EXISTS idx_audit_created   ON audit_logs(created_at DESC);

-- ---------------------------------------------------------------------
-- REPORTS
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS reports (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  type            VARCHAR(80) NOT NULL,
  generated_by    UUID REFERENCES users(id) ON DELETE SET NULL,
  file_url        VARCHAR(1024),
  parameters      JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_reports_org    ON reports(organization_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reports_type   ON reports(type);

-- ---------------------------------------------------------------------
-- updated_at TRIGGERS
-- ---------------------------------------------------------------------
CREATE OR REPLACE FUNCTION set_updated_at() RETURNS trigger AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$ BEGIN
  CREATE TRIGGER trg_org_uat        BEFORE UPDATE ON organizations  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE TRIGGER trg_users_uat      BEFORE UPDATE ON users          FOR EACH ROW EXECUTE FUNCTION set_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE TRIGGER trg_estab_uat      BEFORE UPDATE ON establishments FOR EACH ROW EXECUTE FUNCTION set_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE TRIGGER trg_students_uat   BEFORE UPDATE ON students       FOR EACH ROW EXECUTE FUNCTION set_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE TRIGGER trg_guardians_uat  BEFORE UPDATE ON guardians      FOR EACH ROW EXECUTE FUNCTION set_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
