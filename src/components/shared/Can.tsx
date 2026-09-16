import type { ReactNode } from 'react';
import { useAuth } from '@/context/AuthContext';
import type { Permission } from '@/lib/permissions';

interface CanProps {
  permission: Permission;
  children: ReactNode;
  /** Rendered instead of `children` when the current role lacks the permission. */
  fallback?: ReactNode;
}

export function Can({ permission, children, fallback = null }: CanProps) {
  const { can } = useAuth();
  return <>{can(permission) ? children : fallback}</>;
}
