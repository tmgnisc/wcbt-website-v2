import type { Settings } from '@/types/settings';
import { request } from './client';

export function fetchSettings(): Promise<Settings> {
  return request<Settings>('/settings/');
}

export function saveSettings(settings: Settings): Promise<Settings> {
  return request<Settings>('/settings/', {
    method: 'PUT',
    body: JSON.stringify(settings),
  });
}
