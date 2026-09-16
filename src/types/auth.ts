export type Role = 'super_admin' | 'admin' | 'staff';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatarUrl?: string;
  department?: string;
}

export interface Credentials {
  identifier: string;
  password: string;
  remember?: boolean;
}

export const ROLE_LABELS: Record<Role, string> = {
  super_admin: 'Super Admin',
  admin: 'Admin',
  staff: 'Staff',
};
