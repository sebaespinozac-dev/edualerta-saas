import { useCallback, useEffect, useState } from 'react';
import type { AuthUser, UserRole } from '@/types';

const KEY = 'edualerta:auth';

function read(): AuthUser | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem(KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(read);

  useEffect(() => {
    if (user) localStorage.setItem(KEY, JSON.stringify(user));
    else localStorage.removeItem(KEY);
  }, [user]);

  const signIn = useCallback(async (email: string, _password: string) => {
    // Mock sign-in: derive role from local part hint.
    const role: UserRole = email.startsWith('apoderado') ? 'apoderado' : 'admin';
    const u: AuthUser = {
      id: 'usr_001',
      email,
      name: role === 'apoderado' ? 'Patricia Rojas' : 'Sebastián Espinosa',
      role,
    };
    setUser(u);
    return u;
  }, []);

  const signOut = useCallback(() => setUser(null), []);

  return { user, signIn, signOut };
}
