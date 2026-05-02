-- =====================================================================
-- EduAlerta SEED DATA
-- 1 organization (Antofagasta), 1 admin user, 15 real schools, 30 sample
-- students (2 per school), demo guardians + alerts.
-- Admin password = "admin123" -> bcrypt hash below.
-- =====================================================================

BEGIN;

-- 1) ORGANIZATION ------------------------------------------------------
INSERT INTO organizations (id, name, rut)
VALUES ('11111111-1111-1111-1111-111111111111',
        'Corporación Municipal de Desarrollo Social de Antofagasta',
        '70.123.456-7')
ON CONFLICT (rut) DO NOTHING;

-- 2) ADMIN USER --------------------------------------------------------
-- bcrypt hash of "admin123" (cost 10)
INSERT INTO users (id, organization_id, email, password_hash, full_name, role, status)
VALUES ('22222222-2222-2222-2222-222222222222',
        '11111111-1111-1111-1111-111111111111',
        'admin@edualerta.cl',
        '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
        'Administrador EduAlerta',
        'admin',
        'active')
ON CONFLICT (email) DO NOTHING;

-- Demo docente
INSERT INTO users (id, organization_id, email, password_hash, full_name, role, status)
VALUES ('33333333-3333-3333-3333-333333333333',
        '11111111-1111-1111-1111-111111111111',
        'docente@edualerta.cl',
        '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
        'María González (Docente Demo)',
        'docente',
        'active')
ON CONFLICT (email) DO NOTHING;

-- 3) ESTABLISHMENTS — 15 real Antofagasta schools --------------------
INSERT INTO establishments (organization_id, rbd, name, type, lat, lng, address, phone, principal_name) VALUES
  ('11111111-1111-1111-1111-111111111111','12634','Liceo A-12 Jeraldo Muñoz Campos',          'Media',   -23.6445,-70.3978,'Antofagasta','+56552201001','Director A-12'),
  ('11111111-1111-1111-1111-111111111111','12636','Liceo A-14 Técnico Profesional',           'Media',   -23.6489,-70.3961,'Antofagasta','+56552201002','Director A-14'),
  ('11111111-1111-1111-1111-111111111111','12637','Liceo A-15 Mario Bahamonde Silva',         'Media',   -23.6812,-70.4089,'Antofagasta','+56552201003','Director A-15'),
  ('11111111-1111-1111-1111-111111111111','12640','Escuela D-68 Juan Sandoval Carrasco',      'Basica',  -23.6521,-70.3994,'Antofagasta','+56552201004','Director D-68'),
  ('11111111-1111-1111-1111-111111111111','12642','Escuela D-73 República de Estados Unidos', 'Basica',  -23.6502,-70.3982,'Antofagasta','+56552201005','Director D-73'),
  ('11111111-1111-1111-1111-111111111111','12645','Escuela D-75 Japón',                       'Basica',  -23.7145,-70.4201,'Antofagasta','+56552201006','Director D-75'),
  ('11111111-1111-1111-1111-111111111111','12650','Escuela D-85 Arturo Prat Chacón',          'Basica',  -23.6678,-70.4045,'Antofagasta','+56552201007','Director D-85'),
  ('11111111-1111-1111-1111-111111111111','12655','Escuela D-90 República de Croacia',        'Basica',  -23.7023,-70.4178,'Antofagasta','+56552201008','Director D-90'),
  ('11111111-1111-1111-1111-111111111111','12660','Escuela D-94 Santiago Amengual',           'Basica',  -23.6934,-70.4134,'Antofagasta','+56552201009','Director D-94'),
  ('11111111-1111-1111-1111-111111111111','12665','Escuela D-97 República de Grecia',         'Basica',  -23.6534,-70.4001,'Antofagasta','+56552201010','Director D-97'),
  ('11111111-1111-1111-1111-111111111111','13001','Jardín Infantil Los Pollitos',             'Parvulo', -23.7089,-70.4189,'Antofagasta','+56552201011','Directora Pollitos'),
  ('11111111-1111-1111-1111-111111111111','13005','Jardín Infantil Caracolito',               'Parvulo', -23.6712,-70.4067,'Antofagasta','+56552201012','Directora Caracolito'),
  ('11111111-1111-1111-1111-111111111111','13010','Jardín Infantil Caballito de Mar',         'Parvulo', -23.6623,-70.4034,'Antofagasta','+56552201013','Directora Caballito'),
  ('11111111-1111-1111-1111-111111111111','13015','Jardín Infantil Semillita',                'Parvulo', -23.6756,-70.4078,'Antofagasta','+56552201014','Directora Semillita'),
  ('11111111-1111-1111-1111-111111111111','13020','Escuela Especial Arbolia',                 'Especial',-23.7201,-70.4234,'Antofagasta','+56552201015','Director Arbolia')
ON CONFLICT (rbd) DO NOTHING;

-- 4) SAMPLE STUDENTS — 2 per school ----------------------------------
INSERT INTO students (establishment_id, run, full_name, course, status, risk_score, gender)
SELECT e.id,
       'RUN-' || e.rbd || '-' || gs::text,
       'Alumno Demo ' || gs || ' — ' || e.rbd,
       CASE
         WHEN e.type='Media'    THEN (1 + (gs % 4))::text || 'º Medio'
         WHEN e.type='Basica'   THEN (1 + (gs % 8))::text || 'º Básico'
         WHEN e.type='Parvulo'  THEN 'Pre-Kínder'
         ELSE 'Diferencial'
       END,
       'active',
       (gs * 7) % 30,
       (CASE WHEN gs%2=0 THEN 'M' ELSE 'F' END)::student_gender
FROM establishments e
CROSS JOIN generate_series(1,2) gs
ON CONFLICT (run) DO NOTHING;

-- 5) Sample guardian linked to first student of first school -------
INSERT INTO guardians (id, run, full_name, phone, email)
VALUES ('44444444-4444-4444-4444-444444444444',
        '12345678-9','Juan Apoderado Demo','+56912345678','apoderado@demo.cl')
ON CONFLICT (run) DO NOTHING;

INSERT INTO student_guardians (student_id, guardian_id, relationship, is_primary)
SELECT s.id, '44444444-4444-4444-4444-444444444444', 'Padre', TRUE
FROM students s
WHERE s.run = 'RUN-12634-1'
ON CONFLICT DO NOTHING;

-- 6) One sample alert ---------------------------------------------
INSERT INTO alerts (establishment_id, type, level, status, message, triggered_by)
SELECT e.id, 'panic', 'critical', 'active',
       'Botón de pánico de demostración', '22222222-2222-2222-2222-222222222222'
FROM establishments e WHERE e.rbd = '12634';

COMMIT;
