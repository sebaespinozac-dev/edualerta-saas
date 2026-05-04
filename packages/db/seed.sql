-- =====================================================================
-- EduAlerta SEED DATA
-- 1 organization (CMDS Antofagasta), 3 users (admin, docente, apoderado),
-- 15 schools with corrected coordinates, 48 students, guardians, attendance.
-- All passwords = "admin123" -> bcrypt hash below.
-- =====================================================================

BEGIN;

-- 1) ORGANIZATION ------------------------------------------------------
INSERT INTO organizations (id, name, rut)
VALUES ('11111111-1111-1111-1111-111111111111',
        'Corporación Municipal de Desarrollo Social de Antofagasta',
        '70.123.456-7')
ON CONFLICT (rut) DO NOTHING;

-- 2) USERS -------------------------------------------------------------
-- bcrypt hash of "admin123" (cost 10)
INSERT INTO users (id, organization_id, email, password_hash, full_name, role, status)
VALUES ('22222222-2222-2222-2222-222222222222',
        '11111111-1111-1111-1111-111111111111',
        'admin@edualerta.cl',
        '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
        'Sebastián Espinosa',
        'super_admin',
        'active')
ON CONFLICT (email) DO NOTHING;

INSERT INTO users (id, organization_id, email, password_hash, full_name, role, status)
VALUES ('33333333-3333-3333-3333-333333333333',
        '11111111-1111-1111-1111-111111111111',
        'docente@edualerta.cl',
        '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
        'María González Soto',
        'docente',
        'active')
ON CONFLICT (email) DO NOTHING;

INSERT INTO users (id, organization_id, email, password_hash, full_name, role, status)
VALUES ('55555555-5555-5555-5555-555555555555',
        '11111111-1111-1111-1111-111111111111',
        'apoderado@edualerta.cl',
        '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
        'Patricia Rojas Muñoz',
        'apoderado',
        'active')
ON CONFLICT (email) DO NOTHING;

-- 3) ESTABLISHMENTS — corrected coordinates for Antofagasta -----------
INSERT INTO establishments (organization_id, rbd, name, type, lat, lng, address, phone, principal_name) VALUES
  ('11111111-1111-1111-1111-111111111111','12634','Liceo A-12 Jeraldo Muñoz Campos',          'Media',   -23.6348,-70.3882,'Av. Argentina 1800, Antofagasta','+56552201001','Carlos Morales Díaz'),
  ('11111111-1111-1111-1111-111111111111','12636','Liceo A-14 Técnico Profesional',           'Media',   -23.6512,-70.3955,'Av. Pedro Aguirre Cerda 7500, Antofagasta','+56552201002','Ana Sepúlveda Torres'),
  ('11111111-1111-1111-1111-111111111111','12637','Liceo A-15 Mario Bahamonde Silva',         'Media',   -23.6425,-70.3960,'Calle Sucre 854, Antofagasta','+56552201003','Roberto Tapia Vega'),
  ('11111111-1111-1111-1111-111111111111','12640','Escuela D-68 Juan Sandoval Carrasco',      'Basica',  -23.6280,-70.3920,'La Chimba s/n, Antofagasta','+56552201004','Patricia Contreras Rojas'),
  ('11111111-1111-1111-1111-111111111111','12642','Escuela D-73 República de Estados Unidos', 'Basica',  -23.6570,-70.3975,'Calle Bolívar 1200, Antofagasta','+56552201005','Fernando Castro Silva'),
  ('11111111-1111-1111-1111-111111111111','12645','Escuela D-75 Japón',                       'Basica',  -23.6190,-70.3895,'Sector Norte 3500, Antofagasta','+56552201006','Marcela Reyes González'),
  ('11111111-1111-1111-1111-111111111111','12650','Escuela D-85 Arturo Prat Chacón',          'Basica',  -23.6480,-70.3940,'Av. Grecia 1000, Antofagasta','+56552201007','Diego Morales Pérez'),
  ('11111111-1111-1111-1111-111111111111','12655','Escuela D-90 República de Croacia',        'Basica',  -23.7010,-70.4050,'Gran Vía Sur 4200, Antofagasta','+56552201008','Lorena Díaz Contreras'),
  ('11111111-1111-1111-1111-111111111111','12660','Escuela D-94 Santiago Amengual',           'Basica',  -23.6155,-70.3870,'Av. Argentina Norte 6800, Antofagasta','+56552201009','Julio Soto Martínez'),
  ('11111111-1111-1111-1111-111111111111','12665','Escuela D-97 República de Grecia',         'Basica',  -23.6650,-70.3985,'Av. Pedro Aguirre Cerda 3500, Antofagasta','+56552201010','Isabel Muñoz Tapia'),
  ('11111111-1111-1111-1111-111111111111','13001','Jardín Infantil Los Pollitos',             'Parvulo', -23.6100,-70.3855,'Sector La Chimba 1200, Antofagasta','+56552201011','Rosa Vega Reyes'),
  ('11111111-1111-1111-1111-111111111111','13005','Jardín Infantil Caracolito',               'Parvulo', -23.6320,-70.3900,'Calle Copiapó 450, Antofagasta','+56552201012','Francisca Silva Morales'),
  ('11111111-1111-1111-1111-111111111111','13010','Jardín Infantil Caballito de Mar',         'Parvulo', -23.6720,-70.4010,'Gran Vía 2800, Antofagasta','+56552201013','Claudia Pérez Castro'),
  ('11111111-1111-1111-1111-111111111111','13015','Jardín Infantil Semillita',                'Parvulo', -23.6900,-70.4030,'Coviefi Sur 1500, Antofagasta','+56552201014','Daniela González Rojas'),
  ('11111111-1111-1111-1111-111111111111','13020','Escuela Especial Arbolia',                 'Especial',-23.6460,-70.3965,'Av. Brasil 900, Antofagasta','+56552201015','Andrea Martínez Díaz')
ON CONFLICT (rbd) DO NOTHING;

-- 4) STUDENTS — realistic Chilean names, 3+ per school ----------------
DO $$
DECLARE
  names text[] := ARRAY[
    'Sofía González Muñoz','Matías Rojas Díaz','Valentina Pérez Soto',
    'Benjamín Contreras Silva','Antonia Martínez Sepúlveda','Vicente Morales Castro',
    'Isidora Vega Tapia','Lucas Reyes González','Florencia Díaz Contreras',
    'Joaquín Silva Martínez','Catalina Muñoz Pérez','Tomás Castro Rojas',
    'Emilia Soto Vega','Diego Tapia Reyes','Amanda Sepúlveda Morales',
    'Agustín González Díaz','Maite Rojas Contreras','Nicolás Pérez Castro',
    'Renata Silva Muñoz','Martín Morales Tapia','Isabella Vega Soto',
    'Felipe Reyes Díaz','Josefa Contreras González','Sebastián Muñoz Silva',
    'Trinidad Castro Pérez','Maximiliano Soto Rojas','Fernanda Díaz Morales',
    'Gabriel Tapia Vega','Constanza Martínez Reyes','Alonso Sepúlveda Castro',
    'Antonella González Contreras','Santiago Rojas Martínez','Julieta Pérez Tapia',
    'Ignacio Silva Reyes','Camila Morales González','Mateo Castro Díaz',
    'Francisca Vega Contreras','Daniel Muñoz Soto','Isidora Díaz Pérez',
    'Tomás Tapia Morales','Valentina Reyes Silva','Benjamín Contreras Muñoz',
    'Emilia González Castro','Lucas Rojas Vega','Amanda Soto Tapia',
    'Vicente Pérez Reyes','Catalina Silva Díaz','Joaquín Morales Contreras'
  ];
  runs text[] := ARRAY[
    '21.456.789-0','21.567.890-1','21.678.901-2','21.789.012-3','21.890.123-4',
    '21.901.234-5','22.012.345-6','22.123.456-7','22.234.567-8','22.345.678-9',
    '22.456.789-K','22.567.890-0','22.678.901-1','22.789.012-2','22.890.123-3',
    '22.901.234-4','23.012.345-5','23.123.456-6','23.234.567-7','23.345.678-8',
    '23.456.789-9','23.567.890-K','23.678.901-0','23.789.012-1','23.890.123-2',
    '23.901.234-3','24.012.345-4','24.123.456-5','24.234.567-6','24.345.678-7',
    '24.456.789-8','24.567.890-9','24.678.901-K','24.789.012-0','24.890.123-1',
    '24.901.234-2','25.012.345-3','25.123.456-4','25.234.567-5','25.345.678-6',
    '25.456.789-7','25.567.890-8','25.678.901-9','25.789.012-K','25.890.123-0',
    '25.901.234-1','26.012.345-2','26.123.456-3'
  ];
  courses_media text[] := ARRAY['1° Medio','2° Medio','3° Medio','4° Medio'];
  courses_basica text[] := ARRAY['1° Básico','2° Básico','3° Básico','4° Básico','5° Básico','6° Básico','7° Básico','8° Básico'];
  courses_parvulo text[] := ARRAY['Pre-Kínder','Kínder'];
  est_row RECORD;
  i int := 1;
  students_per int;
  course_val text;
BEGIN
  FOR est_row IN SELECT id, rbd, type FROM establishments WHERE organization_id = '11111111-1111-1111-1111-111111111111' ORDER BY rbd LOOP
    students_per := CASE
      WHEN est_row.type = 'Media' THEN 4
      WHEN est_row.type = 'Basica' THEN 4
      WHEN est_row.type = 'Parvulo' THEN 2
      ELSE 2
    END;
    FOR j IN 1..students_per LOOP
      IF i > array_length(names, 1) THEN EXIT; END IF;
      course_val := CASE
        WHEN est_row.type = 'Media' THEN courses_media[1 + ((j-1) % array_length(courses_media, 1))]
        WHEN est_row.type = 'Basica' THEN courses_basica[1 + ((j-1) % array_length(courses_basica, 1))]
        WHEN est_row.type = 'Parvulo' THEN courses_parvulo[1 + ((j-1) % array_length(courses_parvulo, 1))]
        ELSE 'Diferencial'
      END;
      INSERT INTO students (establishment_id, run, full_name, course, status, risk_score, gender, photo_url)
      VALUES (
        est_row.id,
        runs[i],
        names[i],
        course_val,
        'active',
        (i * 7) % 30,
        CASE WHEN i % 2 = 0 THEN 'M' ELSE 'F' END,
        'https://i.pravatar.cc/150?u=' || lpad(i::text, 4, '0')
      )
      ON CONFLICT (run) DO NOTHING;
      i := i + 1;
    END LOOP;
  END LOOP;
END $$;

-- 5) GUARDIAN for demo apoderado login --------------------------------
INSERT INTO guardians (id, run, full_name, phone, email)
VALUES ('44444444-4444-4444-4444-444444444444',
        '12.345.678-9','Patricia Rojas Muñoz','+56912345678','apoderado@edualerta.cl')
ON CONFLICT (run) DO NOTHING;

-- Link guardian to first 2 students
INSERT INTO student_guardians (student_id, guardian_id, relationship, is_primary)
SELECT s.id, '44444444-4444-4444-4444-444444444444', 'Madre', TRUE
FROM students s
ORDER BY s.created_at
LIMIT 2
ON CONFLICT DO NOTHING;

-- 6) EMERGENCY CONTACTS ------------------------------------------------
INSERT INTO emergency_contacts (student_id, full_name, phone, relationship)
SELECT s.id, 'Ana Martínez Soto', '+56987654321', 'Tía'
FROM students s
ORDER BY s.created_at
LIMIT 5
ON CONFLICT DO NOTHING;

-- 7) SAMPLE ATTENDANCE (today's records) ------------------------------
INSERT INTO attendance (student_id, establishment_id, timestamp, type, method, recorded_by)
SELECT s.id, s.establishment_id,
       NOW() - (interval '1 minute' * (row_number() OVER ())),
       'check_in', 'biometric',
       '22222222-2222-2222-2222-222222222222'
FROM students s
WHERE s.status = 'active'
ORDER BY random()
LIMIT 30;

-- 8) SAMPLE ALERTS ----------------------------------------------------
INSERT INTO alerts (establishment_id, type, level, status, message, triggered_by)
SELECT e.id, 'late_pickup', 'warning', 'active',
       'Retiro tardío detectado - alumno sin recoger después de las 17:00',
       '22222222-2222-2222-2222-222222222222'
FROM establishments e WHERE e.rbd = '12634';

INSERT INTO alerts (establishment_id, type, level, status, message, triggered_by)
SELECT e.id, 'missing_student', 'critical', 'active',
       'Alumno no registra entrada en el día',
       '22222222-2222-2222-2222-222222222222'
FROM establishments e WHERE e.rbd = '12642';

COMMIT;
