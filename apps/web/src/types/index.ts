export type SchoolType = 'Media' | 'Básica' | 'Párvulo' | 'Especial';
export type SchoolStatus = 'operativo' | 'alerta' | 'mantenimiento';

export interface School {
  rbd: number;
  name: string;
  type: SchoolType;
  students: number;
  lat: number;
  lng: number;
  attendance: number;
  status: SchoolStatus;
  lastActivity: string; // ISO
}

export interface Student {
  id: string;
  run: string;
  name: string;
  grade: string;
  schoolRbd: number;
  guardianName: string;
  guardianPhone: string;
  status: 'presente' | 'ausente' | 'retirado';
  photoUrl: string;
}

export interface ActivityEvent {
  id: string;
  type: 'entrada' | 'salida' | 'retiro' | 'visita';
  studentName: string;
  schoolName: string;
  at: string; // ISO
}

export type UserRole = 'admin' | 'apoderado' | 'directivo';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}
