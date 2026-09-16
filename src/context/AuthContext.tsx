import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import * as authApi from '@/api/auth';
import { clearTokens, setTokens } from '@/api/client';
import { hasPermission, isAdminRole, type Permission } from '@/lib/permissions';
import type { AuthUser, Credentials, Role } from '@/types/auth';

const USER_KEY = 'wcbt.auth.user';
const REFRESH_KEY = 'wcbt.auth.refresh';

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
    const raw = localStorage.getItem(USER_KEY) ?? sessionStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as AuthUser) : null;
  } catch {
    return null;
  }
}

function readStoredRefresh(): string | null {
  try {
    return localStorage.getItem(REFRESH_KEY) ?? sessionStorage.getItem(REFRESH_KEY);
  } catch {
    return null;
  }
}

function clearAllAuth() {
  clearTokens();
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem(REFRESH_KEY);
  sessionStorage.removeItem(USER_KEY);
  sessionStorage.removeItem(REFRESH_KEY);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(readStoredUser);

  useEffect(() => {
    const storedRefresh = readStoredRefresh();
    if (!storedRefresh) return;

    const BASE_URL = import.meta.env.VITE_API_URL ?? '/api';
    fetch(`${BASE_URL}/auth/refresh/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh: storedRefresh }),
    })
      .then((res) => {
        if (!res.ok) throw new Error('Refresh failed');
        return res.json();
      })
      .then((data) => {
        setTokens(data.access, storedRefresh);
        return fetch(`${BASE_URL}/auth/me/`, {
          headers: { Authorization: `Bearer ${data.access}` },
        });
      })
      .then((res) => {
        if (!res.ok) throw new Error('Session verify failed');
        return res.json();
      })
      .then((freshUser) => {
        setUser(freshUser);
        const storage = localStorage.getItem(REFRESH_KEY)
          ? localStorage
          : sessionStorage;
        storage.setItem(USER_KEY, JSON.stringify(freshUser));
      })
      .catch(() => {
        clearAllAuth();
        setUser(null);
      });
  }, []);

  const login = useCallback(async (credentials: Credentials) => {
    const { user, refresh } = await authApi.login(credentials);

    const store = credentials.remember ? localStorage : sessionStorage;
    store.setItem(USER_KEY, JSON.stringify(user));
    store.setItem(REFRESH_KEY, refresh);

    setUser(user);
    return user;
  }, []);

  const logout = useCallback(() => {
    clearAllAuth();
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
