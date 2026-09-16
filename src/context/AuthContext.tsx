import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import * as authApi from '@/api/auth';
import { hasPermission, isAdminRole, type Permission } from '@/lib/permissions';
import type { AuthUser, Credentials, Role } from '@/types/auth';

const STORAGE_KEY = 'wcbt.auth.user';

interface AuthContextValue {
  user: AuthUser | null;
  role: Role | undefined;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (credentials: Credentials) => Promise<AuthUser>;
  logout: () => void;
  can: (permission: Permission) => boolean;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function readStoredUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY) ?? sessionStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as AuthUser) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  // Read the persisted session during initialisation so protected routes never flash the
  // login redirect on a hard refresh.
  const [user, setUser] = useState<AuthUser | null>(readStoredUser);

  const login = useCallback(async (credentials: Credentials) => {
    const authenticated = await authApi.login(credentials);
    const store = credentials.remember ? localStorage : sessionStorage;
    store.setItem(STORAGE_KEY, JSON.stringify(authenticated));
    setUser(authenticated);
    return authenticated;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    sessionStorage.removeItem(STORAGE_KEY);
    setUser(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      role: user?.role,
      isAuthenticated: Boolean(user),
      isAdmin: isAdminRole(user?.role),
      login,
      logout,
      can: (permission: Permission) => hasPermission(user?.role, permission),
    }),
    [user, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an <AuthProvider />');
  }
  return context;
}
