import type { AuthUser, Credentials } from '@/types/auth';
import { request, setTokens } from './client';

interface LoginResponse {
  user: AuthUser;
  access: string;
  refresh: string;
}

export async function login({ identifier, password }: Credentials): Promise<LoginResponse> {
  const data = await request<LoginResponse>('/auth/login/', {
    method: 'POST',
    body: JSON.stringify({ identifier, password }),
  });
  setTokens(data.access, data.refresh);
  return data;
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
