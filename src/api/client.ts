const BASE_URL = import.meta.env.VITE_API_URL ?? '/api';

let accessToken: string | null = null;
let refreshToken: string | null = null;

function unwrap<T>(json: unknown): T {
  if (json && typeof json === 'object') {
    const obj = json as Record<string, unknown>;
    if ('results' in obj && Array.isArray(obj.results)) {
      return obj.results as T;
    }
    if ('data' in obj && typeof obj.data === 'object') {
      return obj.data as T;
    }
  }
  return json as T;
}

export function setTokens(access: string, refresh: string) {
  accessToken = access;
  refreshToken = refresh;
}

export function clearTokens() {
  accessToken = null;
  refreshToken = null;
}

export function getAccessToken(): string | null {
  return accessToken;
}

async function refreshAccessToken(): Promise<boolean> {
  if (!refreshToken) return false;
  try {
    const res = await fetch(`${BASE_URL}/auth/refresh/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh: refreshToken }),
    });
    if (!res.ok) return false;
    const data = await res.json();
    const unwrapped = unwrap<{ access?: string; token?: string }>(data);
    accessToken = unwrapped.access ?? unwrapped.token ?? null;
    return Boolean(accessToken);
  } catch {
    return false;
  }
}

export async function request<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    ...(init.headers as Record<string, string>),
  };

  const response = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers,
  });

  if (response.status === 401 && refreshToken) {
    const refreshed = await refreshAccessToken();
    if (refreshed) {
      headers.Authorization = `Bearer ${accessToken}`;
      const retryResponse = await fetch(`${BASE_URL}${path}`, {
        ...init,
        headers,
      });
      if (!retryResponse.ok) {
        const body = await retryResponse.json().catch(() => ({}));
        throw new Error(body.detail ?? 'Something went wrong. Please try again.');
      }
      return retryResponse.status === 204
        ? (undefined as T)
        : unwrap<T>(await retryResponse.json());
    }
  }

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.detail ?? 'Something went wrong. Please try again.');
  }

  return response.status === 204 ? (undefined as T) : unwrap<T>(await response.json());
}

export async function requestRaw(
  path: string,
  init: RequestInit = {},
): Promise<unknown> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    ...(init.headers as Record<string, string>),
  };
  const response = await fetch(`${BASE_URL}${path}`, { ...init, headers });
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.detail ?? 'Something went wrong.');
  }
  return response.json();
}

export async function uploadFile(file: File): Promise<{
  id: string;
  name: string;
  size: number;
  mimeType: string;
  uploadedAt: string;
  url: string;
}> {
  const formData = new FormData();
  formData.append('file', file);

  const headers: Record<string, string> = accessToken
    ? { Authorization: `Bearer ${accessToken}` }
    : {};

  const response = await fetch(`${BASE_URL}/files/`, {
    method: 'POST',
    headers,
    body: formData,
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.detail ?? 'File upload failed.');
  }

  return response.json();
}
