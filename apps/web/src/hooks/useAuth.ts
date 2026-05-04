import { useCallback, useEffect, useState } from 'react';
import type { AuthUser, UserRole } from '@/types';
import { api, setTokens, clearTokens, getAccessToken } from '@/lib/api';

const USER_KEY = 'edualerta:user';

function readUser(): AuthUser | null {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

interface LoginResponse {
  access_token: string;
  refresh_token: string;
  user: { id: string; email: string; full_name: string; role: string };
}

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(readUser);

  useEffect(() => {
    if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
    else localStorage.removeItem(USER_KEY);
  }, [user]);

  const signIn = useCallback(async (email: string, password: string) => {
    try {
      const data = await api<LoginResponse>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      setTokens(data.access_token, data.refresh_token);
      const roleMap: Record<string, UserRole> = {
        super_admin: 'admin',
        admin: 'admin',
        docente: 'directivo',
        apoderado: 'apoderado',
      };
      const u: AuthUser = {
        id: data.user.id,
        email: data.user.email,
        name: data.user.full_name,
        role: roleMap[data.user.role] ?? 'admin',
      };
      setUser(u);
      return u;
    } catch {
      // Fallback to mock when API is not available
      const role: UserRole = email.startsWith('apoderado') ? 'apoderado' : 'admin';
      const u: AuthUser = {
        id: 'usr_001',
        email,
        name: role === 'apoderado' ? 'Patricia Rojas' : 'Sebastián Espinosa',
        role,
      };
      setUser(u);
      return u;
    }
  }, []);

  const signOut = useCallback(() => {
    if (getAccessToken()) {
      api('/auth/logout', { method: 'POST' }).catch(() => {});
    }
    clearTokens();
    setUser(null);
  }, []);

  return { user, signIn, signOut };
}
