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

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(readStoredUser);

  useEffect(() => {
    const storedRefresh = readStoredRefresh();
    if (!storedRefresh) return;

    setTokens('', storedRefresh);
    authApi
      .verifySession()
      .then((freshUser) => {
        setUser(freshUser);
        const storage = localStorage.getItem(REFRESH_KEY)
          ? localStorage
          : sessionStorage;
        storage.setItem(USER_KEY, JSON.stringify(freshUser));
      })
      .catch(() => {
        clearTokens();
        localStorage.removeItem(USER_KEY);
        localStorage.removeItem(REFRESH_KEY);
        sessionStorage.removeItem(USER_KEY);
        sessionStorage.removeItem(REFRESH_KEY);
        setUser(null);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = useCallback(async (credentials: Credentials) => {
    const { user, access, refresh } = await authApi.login(credentials);

    const store = credentials.remember ? localStorage : sessionStorage;
    store.setItem(USER_KEY, JSON.stringify(user));
    store.setItem(REFRESH_KEY, refresh);

    setTokens(access, refresh);
    setUser(user);
    return user;
  }, []);

  const logout = useCallback(() => {
    clearTokens();
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(REFRESH_KEY);
    sessionStorage.removeItem(USER_KEY);
    sessionStorage.removeItem(REFRESH_KEY);
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
