import { settingsSeed } from '@/data/settings';
import type { Settings } from '@/types/settings';
import { clone, request } from './client';

export function fetchSettings(): Promise<Settings> {
  return request(clone(settingsSeed));
}

export function saveSettings(settings: Settings): Promise<Settings> {
  return request(settings);
}
