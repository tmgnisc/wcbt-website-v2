import type { AuthUser, Credentials } from '@/types/auth';
import { request, setTokens } from './client';

function extractTokens(data: Record<string, unknown>): { access: string; refresh: string } {
  const payload = (typeof data.data === 'object' && data.data !== null ? data.data : data) as Record<string, unknown>;

  const candidates = ['access', 'token', 'access_token'];
  const refreshCandidates = ['refresh', 'refresh_token'];

  let access = '';
  for (const key of candidates) {
    const val = payload[key];
    if (typeof val === 'string' && val.length > 0) {
      access = val;
      break;
    }
  }

  let refresh = '';
  for (const key of refreshCandidates) {
    const val = payload[key];
    if (typeof val === 'string' && val.length > 0) {
      refresh = val;
      break;
    }
  }

  return { access, refresh };
}

function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const base64 = parts[1];
    const json = atob(base64.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(json);
  } catch {
    return null;
  }
}

function buildUserFromJwt(payload: Record<string, unknown>): AuthUser {
  return {
    id: String(payload.user_id ?? payload.sub ?? payload.id ?? ''),
    name: String(payload.name ?? payload.full_name ?? payload.username ?? payload.email ?? ''),
    email: String(payload.email ?? ''),
    role: (['super_admin', 'admin', 'staff'].includes(String(payload.role ?? ''))
      ? payload.role
      : 'staff') as AuthUser['role'],
    avatarUrl: undefined,
    department: undefined,
  };
}

function buildUserFromIdentifier(identifier: string): AuthUser {
  return {
    id: '0',
    name: identifier.includes('@') ? identifier.split('@')[0] : identifier,
    email: identifier.includes('@') ? identifier : '',
    role: 'admin' as AuthUser['role'],
    avatarUrl: undefined,
    department: undefined,
  };
}

export interface LoginResult {
  user: AuthUser;
  refresh: string;
}

const BASE_URL = import.meta.env.VITE_API_URL ?? '/api';

export async function login({ identifier, password }: Credentials): Promise<LoginResult> {
  const res = await fetch(`${BASE_URL}/auth/login/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identifier, password }),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.detail ?? body.error ?? 'Invalid credentials. Please try again.');
  }

  const data = await res.json();
  const { access, refresh } = extractTokens(data);

  if (!access) {
    throw new Error(
      'Server returned a response without an access token. ' +
      'Response keys: ' + Object.keys(data).join(', ')
    );
  }

  setTokens(access, refresh);

  let user: AuthUser;
  const userData = data.data && typeof data.data === 'object' ? data.data as Record<string, unknown> : data;
  if (userData.user) {
    user = userData.user as AuthUser;
  } else {
    const payload = decodeJwtPayload(access);
    if (payload) {
      user = buildUserFromJwt(payload);
    } else {
      try {
        const meRes = await fetch(`${BASE_URL}/auth/me/`, {
          headers: { Authorization: `Bearer ${access}` },
        });
        if (meRes.ok) {
          user = await meRes.json();
        } else {
          user = buildUserFromIdentifier(identifier);
        }
      } catch {
        user = buildUserFromIdentifier(identifier);
      }
    }
  }

  return { user, refresh };
}

export async function verifySession(): Promise<AuthUser> {
  return request<AuthUser>('/auth/me/');
}

export async function requestPasswordReset(email: string): Promise<{ sent: boolean }> {
  return request<{ sent: boolean }>('/auth/forgot-password/', {
    method: 'POST',
    body: JSON.stringify({ email }),
  });
}
