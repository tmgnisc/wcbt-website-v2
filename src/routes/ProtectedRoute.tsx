import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { isAdminRole } from '@/lib/permissions';

interface ProtectedRouteProps {
  /** When true, only `admin` and `super_admin` may enter. */
  adminOnly?: boolean;
}

export function ProtectedRoute({ adminOnly = false }: ProtectedRouteProps) {
  const { isAuthenticated, role } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (adminOnly && !isAdminRole(role)) {
    return <Navigate to="/dashboard" replace state={{ denied: location.pathname }} />;
  }

  return <Outlet />;
}
