import type { ActivityEvent, School, Student } from '@/types';

const now = Date.now();
const minutes = (m: number) => new Date(now - m * 60_000).toISOString();

export const schools: School[] = [
  { rbd: 12634, name: 'Liceo A-12 Jeraldo Muñoz Campos', type: 'Media', students: 1240, lat: -23.6348, lng: -70.3882, attendance: 95.1, status: 'operativo', lastActivity: minutes(2) },
  { rbd: 12636, name: 'Liceo A-14 Técnico Profesional', type: 'Media', students: 980, lat: -23.6512, lng: -70.3955, attendance: 93.4, status: 'operativo', lastActivity: minutes(5) },
  { rbd: 12637, name: 'Liceo A-15 Mario Bahamonde Silva', type: 'Media', students: 870, lat: -23.6425, lng: -70.3960, attendance: 91.8, status: 'operativo', lastActivity: minutes(8) },
  { rbd: 12640, name: 'Escuela D-68 Juan Sandoval Carrasco', type: 'Básica', students: 560, lat: -23.6280, lng: -70.3920, attendance: 96.2, status: 'operativo', lastActivity: minutes(3) },
  { rbd: 12642, name: 'Escuela D-73 República de Estados Unidos', type: 'Básica', students: 490, lat: -23.6570, lng: -70.3975, attendance: 94.7, status: 'operativo', lastActivity: minutes(11) },
  { rbd: 12645, name: 'Escuela D-75 Japón', type: 'Básica', students: 410, lat: -23.6190, lng: -70.3895, attendance: 95.5, status: 'operativo', lastActivity: minutes(14) },
  { rbd: 12650, name: 'Escuela D-85 Arturo Prat Chacón', type: 'Básica', students: 380, lat: -23.6480, lng: -70.3940, attendance: 92.9, status: 'operativo', lastActivity: minutes(17) },
  { rbd: 12655, name: 'Escuela D-90 República de Croacia', type: 'Básica', students: 340, lat: -23.7010, lng: -70.4050, attendance: 93.8, status: 'operativo', lastActivity: minutes(22) },
  { rbd: 12660, name: 'Escuela D-94 Santiago Amengual', type: 'Básica', students: 310, lat: -23.6155, lng: -70.3870, attendance: 94.1, status: 'operativo', lastActivity: minutes(28) },
  { rbd: 12665, name: 'Escuela D-97 República de Grecia', type: 'Básica', students: 290, lat: -23.6650, lng: -70.3985, attendance: 95.0, status: 'operativo', lastActivity: minutes(31) },
  { rbd: 13001, name: 'Jardín Infantil Los Pollitos', type: 'Párvulo', students: 180, lat: -23.6100, lng: -70.3855, attendance: 89.3, status: 'operativo', lastActivity: minutes(35) },
  { rbd: 13005, name: 'Jardín Infantil Caracolito', type: 'Párvulo', students: 160, lat: -23.6320, lng: -70.3900, attendance: 90.6, status: 'operativo', lastActivity: minutes(40) },
  { rbd: 13010, name: 'Jardín Infantil Caballito de Mar', type: 'Párvulo', students: 140, lat: -23.6720, lng: -70.4010, attendance: 91.2, status: 'operativo', lastActivity: minutes(44) },
  { rbd: 13015, name: 'Jardín Infantil Semillita', type: 'Párvulo', students: 130, lat: -23.6900, lng: -70.4030, attendance: 88.4, status: 'operativo', lastActivity: minutes(48) },
  { rbd: 13020, name: 'Escuela Especial Arbolia', type: 'Especial', students: 120, lat: -23.6460, lng: -70.3965, attendance: 92.0, status: 'operativo', lastActivity: minutes(52) },
];

export const totalStudents = schools.reduce((acc, s) => acc + s.students, 0);
export const todayAttendance =
  schools.reduce((acc, s) => acc + (s.attendance * s.students) / 100, 0) /
  schools.reduce((acc, s) => acc + s.students, 0) *
  100;

export const attendanceLast7Days = [
  { day: 'Lun', value: 92.8 },
  { day: 'Mar', value: 93.5 },
  { day: 'Mié', value: 94.1 },
  { day: 'Jue', value: 93.9 },
  { day: 'Vie', value: 94.6 },
  { day: 'Sáb', value: 0 },
  { day: 'Dom', value: 0 },
].map((d) => ({ ...d }));

// Use only weekdays for chart display.
export const attendanceWeekdays = attendanceLast7Days.filter((d) => d.value > 0);

export const sparklineSeries = [93.1, 93.8, 92.9, 94.0, 94.2, 93.7, 94.4, 94.1, 94.5, 94.2];

const firstNames = ['Sofía', 'Matías', 'Valentina', 'Benjamín', 'Antonia', 'Vicente', 'Isidora', 'Lucas', 'Florencia', 'Joaquín', 'Catalina', 'Tomás', 'Emilia', 'Diego', 'Amanda'];
const lastNames = ['González', 'Muñoz', 'Rojas', 'Díaz', 'Pérez', 'Soto', 'Contreras', 'Silva', 'Martínez', 'Sepúlveda', 'Morales', 'Castro', 'Vega', 'Tapia', 'Reyes'];
const grades = ['1° Básico', '2° Básico', '3° Básico', '4° Básico', '5° Básico', '6° Básico', '7° Básico', '8° Básico', '1° Medio', '2° Medio', '3° Medio', '4° Medio'];

function pad(n: number, len: number) {
  return n.toString().padStart(len, '0');
}

function genRun(seed: number) {
  const body = 10_000_000 + (seed * 37) % 12_000_000;
  const dv = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'K'][body % 11];
  return `${body.toString().slice(0, 2)}.${body.toString().slice(2, 5)}.${body.toString().slice(5)}-${dv}`;
}

export const students: Student[] = Array.from({ length: 48 }).map((_, i) => {
  const fn = firstNames[i % firstNames.length];
  const ln1 = lastNames[(i * 3) % lastNames.length];
  const ln2 = lastNames[(i * 5 + 1) % lastNames.length];
  const grade = grades[i % grades.length];
  const school = schools[i % schools.length];
  const guardianFn = firstNames[(i * 7) % firstNames.length];
  const guardianLn = lastNames[(i * 11) % lastNames.length];
  return {
    id: pad(i + 1, 4),
    run: genRun(i + 1),
    name: `${fn} ${ln1} ${ln2}`,
    grade,
    schoolRbd: school.rbd,
    guardianName: `${guardianFn} ${guardianLn}`,
    guardianPhone: `+56 9 ${pad(((i * 1234567) % 90000000) + 10000000, 8).slice(0, 4)} ${pad(((i * 1234567) % 90000000) + 10000000, 8).slice(4)}`,
    status: i % 9 === 0 ? 'ausente' : 'presente',
    photoUrl: `https://i.pravatar.cc/150?u=${pad(i + 1, 4)}`,
  };
});

const eventTypes: ActivityEvent['type'][] = ['entrada', 'salida', 'retiro', 'visita'];

export const activityFeed: ActivityEvent[] = Array.from({ length: 14 }).map((_, i) => {
  const s = students[(i * 3) % students.length];
  const school = schools.find((x) => x.rbd === s.schoolRbd)!;
  return {
    id: `evt-${i}`,
    type: eventTypes[i % eventTypes.length],
    studentName: s.name,
    schoolName: school.name,
    at: minutes(i * 4 + 1),
  };
});

export const reportTemplates = [
  {
    id: 'asistencia-mensual',
    title: 'Asistencia Mensual',
    description: 'Resumen consolidado de asistencia por curso y establecimiento.',
  },
  {
    id: 'ley-21809',
    title: 'Cumplimiento Ley 21.809',
    description: 'Evidencia de retiro autorizado por apoderados acreditados.',
  },
  {
    id: 'incidentes',
    title: 'Incidentes y Alertas',
    description: 'Histórico de alertas activadas y tiempo de respuesta.',
  },
  {
    id: 'acceso-apoderado',
    title: 'Acceso por Apoderado',
    description: 'Trazabilidad de ingresos y retiros por persona autorizada.',
  },
  {
    id: 'asistencia-curso',
    title: 'Asistencia por Curso',
    description: 'Detalle de asistencia diaria por sala de clases.',
  },
  {
    id: 'auditoria-acceso',
    title: 'Auditoría de Accesos',
    description: 'Bitácora completa de quién entró y salió en cada portería.',
  },
];
