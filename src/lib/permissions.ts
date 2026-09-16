import type { Role } from '@/types/auth';

export const PERMISSIONS = [
  'dashboard:view',
  'notifications:view',
  'notifications:add',
  'notifications:edit',
  'notifications:delete',
  'staff:view',
  'staff:add',
  'staff:edit',
  'staff:delete',
  'staff:viewSalary',
  'admissions:view',
  'admissions:add',
  'admissions:edit',
  'admissions:delete',
  'admissions:test',
  'settings:view',
  'settings:edit',
] as const;

export type Permission = (typeof PERMISSIONS)[number];

const ADMIN_PERMISSIONS: Permission[] = PERMISSIONS.filter(
  (permission) => permission !== 'staff:delete' && permission !== 'staff:viewSalary',
);

const STAFF_PERMISSIONS: Permission[] = [
  'dashboard:view',
  'notifications:view',
  'staff:view',
  'admissions:view',
];

export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  super_admin: [...PERMISSIONS],
  admin: ADMIN_PERMISSIONS,
  staff: STAFF_PERMISSIONS,
};

export function hasPermission(role: Role | undefined, permission: Permission): boolean {
  if (!role) return false;
  return ROLE_PERMISSIONS[role].includes(permission);
}

/** Roles allowed into admin-only routes such as /staff/new and /settings. */
export function isAdminRole(role: Role | undefined): boolean {
  return role === 'admin' || role === 'super_admin';
}
