import type { LookupItem } from './common';
import type { Role } from './auth';

export interface GeneralSettings {
  collegeName: string;
  tagline: string;
  campusName: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  logoUrl: string;
  academicSession: string;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  status: 'Active' | 'Inactive';
  lastLogin?: string;
}

export type PermissionModule = 'notifications' | 'staff' | 'admissions' | 'programs' | 'settings';
export type PermissionAction = 'view' | 'add' | 'edit' | 'delete';

export type PermissionMatrix = Record<Role, Record<PermissionModule, Record<PermissionAction, boolean>>>;

/** Programs are managed in their own module; these lists only feed selects. */
export interface CatalogSettings {
  departments: LookupItem[];
  designations: LookupItem[];
  testTypes: LookupItem[];
}

export interface NotificationSettings {
  defaultAudience: string[];
  emailAlerts: boolean;
  smsAlerts: boolean;
  digestFrequency: 'Instant' | 'Daily' | 'Weekly';
}

export interface SecuritySettings {
  minPasswordLength: number;
  requireUppercase: boolean;
  requireNumber: boolean;
  requireSymbol: boolean;
  sessionTimeout: 15 | 30 | 60;
  twoFactorEnabled: boolean;
}

export interface AuditLogEntry {
  id: string;
  user: string;
  action: string;
  module: string;
  timestamp: string;
  ip: string;
}

export interface Settings {
  general: GeneralSettings;
  users: AdminUser[];
  permissions: PermissionMatrix;
  catalog: CatalogSettings;
  notifications: NotificationSettings;
  security: SecuritySettings;
  auditLog: AuditLogEntry[];
}
