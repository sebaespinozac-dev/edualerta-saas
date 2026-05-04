import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

// ─── Establishments ──────────────────────────────────────────────

interface EstablishmentRow {
  id: string;
  rbd: string;
  name: string;
  type: string;
  lat: number;
  lng: number;
  address: string | null;
  phone: string | null;
  principal_name: string | null;
}

export function useEstablishments() {
  return useQuery({
    queryKey: ['establishments'],
    queryFn: () => api<{ data: EstablishmentRow[]; total: number }>('/establishments'),
    select: (res) => res.data,
  });
}

// ─── Students ────────────────────────────────────────────────────

interface StudentRow {
  id: string;
  run: string;
  full_name: string;
  course: string;
  qr_code: string;
  status: string;
  risk_score: number | null;
  establishment_id: string;
  establishment_name: string;
}

interface StudentDetail extends StudentRow {
  birth_date: string | null;
  gender: string | null;
  photo_url: string | null;
  created_at: string;
}

interface StudentListResponse {
  data: StudentRow[];
  page: number;
  limit: number;
  total: number;
}

export function useStudents(params?: {
  search?: string;
  establishment_id?: string;
  page?: number;
  limit?: number;
}) {
  const qs = new URLSearchParams();
  if (params?.search) qs.set('search', params.search);
  if (params?.establishment_id) qs.set('establishment_id', params.establishment_id);
  if (params?.page) qs.set('page', String(params.page));
  if (params?.limit) qs.set('limit', String(params.limit));
  const query = qs.toString();

  return useQuery({
    queryKey: ['students', params],
    queryFn: () => api<StudentListResponse>(`/students${query ? `?${query}` : ''}`),
  });
}

export function useStudent(id: string | undefined) {
  return useQuery({
    queryKey: ['students', id],
    queryFn: () => api<StudentDetail>(`/students/${id}`),
    enabled: !!id,
  });
}

export function useCreateStudent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      establishment_id: string;
      run: string;
      full_name: string;
      course: string;
      birth_date?: string;
      gender?: string;
      photo_url?: string;
    }) => api('/students', { method: 'POST', body: JSON.stringify(data) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['students'] }),
  });
}

// ─── Attendance ──────────────────────────────────────────────────

interface AttendanceRow {
  id: string;
  timestamp: string;
  type: 'check_in' | 'check_out';
  method: string;
  student_id: string;
  student_name: string;
  establishment_id: string;
  establishment_name: string;
}

export function useAttendance(params?: {
  establishment_id?: string;
  date?: string;
  student_id?: string;
}) {
  return useQuery({
    queryKey: ['attendance', params],
    queryFn: () => {
      const qs = new URLSearchParams();
      if (params?.establishment_id) qs.set('establishment_id', params.establishment_id);
      if (params?.date) qs.set('date', params.date);
      if (params?.student_id) qs.set('student_id', params.student_id);
      const q = qs.toString();
      return api<{ data: AttendanceRow[] }>(`/attendance${q ? `?${q}` : ''}`);
    },
    select: (res) => res.data,
  });
}

export function useAttendanceStats() {
  return useQuery({
    queryKey: ['attendance', 'stats'],
    queryFn: () =>
      api<{ data: { day: string; check_ins: string; check_outs: string }[] }>('/attendance/stats'),
    select: (res) => res.data,
  });
}

export function useCheckIn() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      qr_code?: string;
      student_id?: string;
      type?: 'check_in' | 'check_out';
      method?: 'qr' | 'manual' | 'biometric';
      lat?: number;
      lng?: number;
    }) => api('/attendance/check-in', { method: 'POST', body: JSON.stringify(data) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['attendance'] }),
  });
}

// ─── Alerts ──────────────────────────────────────────────────────

interface AlertRow {
  id: string;
  establishment_id: string;
  establishment_name: string;
  type: string;
  level: string;
  status: string;
  message: string | null;
  created_at: string;
}

export function useAlerts(params?: { status?: string; establishment_id?: string }) {
  return useQuery({
    queryKey: ['alerts', params],
    queryFn: () => {
      const qs = new URLSearchParams();
      if (params?.status) qs.set('status', params.status);
      if (params?.establishment_id) qs.set('establishment_id', params.establishment_id);
      const q = qs.toString();
      return api<{ data: AlertRow[] }>(`/alerts${q ? `?${q}` : ''}`);
    },
    select: (res) => res.data,
  });
}

export function useTriggerAlert() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      establishment_id: string;
      student_id?: string;
      type: string;
      level?: string;
      message?: string;
    }) => api('/alerts', { method: 'POST', body: JSON.stringify(data) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['alerts'] }),
  });
}

// ─── Reports ─────────────────────────────────────────────────────

export function useGenerateReport() {
  return useMutation({
    mutationFn: (data: { type: string; establishment_id?: string; date_from?: string; date_to?: string }) =>
      api('/reports/generate', { method: 'POST', body: JSON.stringify(data) }),
  });
}
