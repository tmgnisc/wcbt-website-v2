import type { Settings } from '@/types/settings';
import { requestRaw } from './client';

/* eslint-disable @typescript-eslint/no-explicit-any */
function normalizeSettings(raw: any): Settings {
  const data = raw && typeof raw === 'object' && 'data' in raw ? raw.data : raw;
  const d = data && typeof data === 'object' ? data : {};
  return {
    general: {
      collegeName: d.collegeName ?? '',
      tagline: d.tagline ?? '',
      campusName: d.campusName ?? '',
      address: d.address ?? '',
      phone: d.phone ?? '',
      email: d.email ?? '',
      website: d.website ?? '',
      logoUrl: d.logoUrl ?? '',
      academicSession: d.academicSession ?? '',
    },
    users: Array.isArray(d.users) ? d.users : [],
    permissions: d.permissions ?? {},
    catalog: {
      departments: Array.isArray(d.catalog?.departments) ? d.catalog.departments : [],
      designations: Array.isArray(d.catalog?.designations) ? d.catalog.designations : [],
      testTypes: Array.isArray(d.catalog?.testTypes) ? d.catalog.testTypes : [],
    },
    notifications: {
      defaultAudience: Array.isArray(d.notifications?.defaultAudience) ? d.notifications.defaultAudience : ['All'],
      emailAlerts: d.notifications?.emailAlerts ?? true,
      smsAlerts: d.notifications?.smsAlerts ?? false,
      digestFrequency: d.notifications?.digestFrequency ?? 'Instant',
    },
    security: {
      minPasswordLength: d.security?.minPasswordLength ?? 8,
      requireUppercase: d.security?.requireUppercase ?? true,
      requireNumber: d.security?.requireNumber ?? true,
      requireSymbol: d.security?.requireSymbol ?? false,
      sessionTimeout: d.security?.sessionTimeout ?? 30,
      twoFactorEnabled: d.security?.twoFactorEnabled ?? false,
    },
    auditLog: Array.isArray(d.auditLog) ? d.auditLog : [],
  };
}
/* eslint-enable @typescript-eslint/no-explicit-any */

export async function fetchSettings(): Promise<Settings> {
  const raw = await requestRaw('/settings/');
  return normalizeSettings(raw);
}

export async function saveSettings(settings: Settings): Promise<Settings> {
  const raw = await requestRaw('/settings/', {
    method: 'PUT',
    body: JSON.stringify(settings),
  });
  return normalizeSettings(raw);
}
