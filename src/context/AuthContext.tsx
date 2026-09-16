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
import { clearTokens, getAccessToken, setTokens } from '@/api/client';
import { hasPermission, isAdminRole, type Permission } from '@/lib/permissions';
import type { AuthUser, Credentials, Role } from '@/types/auth';

const USER_KEY = 'wcbt.auth.user';
const REFRESH_KEY = 'wcbt.auth.refresh';
const ACCESS_KEY = 'wcbt.auth.access';

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
  localStorage.removeItem(ACCESS_KEY);
  sessionStorage.removeItem(USER_KEY);
  sessionStorage.removeItem(REFRESH_KEY);
  sessionStorage.removeItem(ACCESS_KEY);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(readStoredUser);

  useEffect(() => {
    const storedRefresh = readStoredRefresh();
    const storedAccess = localStorage.getItem(ACCESS_KEY) ?? sessionStorage.getItem(ACCESS_KEY);

    if (storedAccess) {
      setTokens(storedAccess, storedRefresh ?? '');
    }

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
      .then((json) => {
        const raw = json?.data ?? json;
        const newAccess = raw?.access ?? raw?.token ?? raw?.access_token ?? '';
        if (!newAccess) throw new Error('No access token in refresh response');
        setTokens(newAccess, storedRefresh);
        const storage = localStorage.getItem(REFRESH_KEY) ? localStorage : sessionStorage;
        storage.setItem(ACCESS_KEY, newAccess);
        return fetch(`${BASE_URL}/auth/me/`, {
          headers: { Authorization: `Bearer ${newAccess}` },
        });
      })
      .then((res) => {
        if (!res.ok) throw new Error('Session verify failed');
        return res.json();
      })
      .then((json) => {
        const freshUser = json?.data ?? json;
        if (!freshUser || typeof freshUser !== 'object' || !freshUser.id) {
          throw new Error('Invalid user data');
        }
        setUser(freshUser as AuthUser);
        const storage = localStorage.getItem(REFRESH_KEY) ? localStorage : sessionStorage;
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

    const access = getAccessToken();
    if (access) store.setItem(ACCESS_KEY, access);

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
