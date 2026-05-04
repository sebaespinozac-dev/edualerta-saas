const TOKEN_KEY = 'edualerta:access_token';
const REFRESH_KEY = 'edualerta:refresh_token';

export function getAccessToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function getRefreshToken() {
  return localStorage.getItem(REFRESH_KEY);
}

export function setTokens(access: string, refresh: string) {
  localStorage.setItem(TOKEN_KEY, access);
  localStorage.setItem(REFRESH_KEY, refresh);
}

export function clearTokens() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_KEY);
}

let refreshPromise: Promise<string> | null = null;

async function refreshAccessToken(): Promise<string> {
  const refresh = getRefreshToken();
  if (!refresh) throw new Error('No refresh token');

  const res = await fetch('/api/v1/auth/refresh', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refresh_token: refresh }),
  });

  if (!res.ok) {
    clearTokens();
    window.location.href = '/login';
    throw new Error('Session expired');
  }

  const data = await res.json();
  localStorage.setItem(TOKEN_KEY, data.access_token);
  return data.access_token;
}

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public code?: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const token = getAccessToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(init?.headers as Record<string, string> ?? {}),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  let res = await fetch(`/api/v1${path}`, { ...init, headers });

  if (res.status === 401 && token) {
    if (!refreshPromise) refreshPromise = refreshAccessToken();
    try {
      const newToken = await refreshPromise;
      headers['Authorization'] = `Bearer ${newToken}`;
      res = await fetch(`/api/v1${path}`, { ...init, headers });
    } finally {
      refreshPromise = null;
    }
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new ApiError(res.status, body.message ?? res.statusText, body.code);
  }

  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}
