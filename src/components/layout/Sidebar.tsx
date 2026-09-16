import { NavLink, useNavigate } from 'react-router-dom';
import {
  Bell,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  Settings,
  Users,
  X,
  type LucideIcon,
} from 'lucide-react';
import { Logo } from './Logo';
import { useAuth } from '@/context/AuthContext';
import { useNotificationsStore, selectUnreadCount } from '@/store/notifications';
import { useAdmissionsStore, selectPendingApplications } from '@/store/admissions';
import { cn } from '@/lib/utils';

interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
  badge?: number;
}

interface SidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

export function Sidebar({ collapsed, onToggleCollapse, mobileOpen, onCloseMobile }: SidebarProps) {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const unread = useNotificationsStore(selectUnreadCount);
  const pendingApplications = useAdmissionsStore(selectPendingApplications);

  const items: NavItem[] = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/notifications', label: 'Notifications', icon: Bell, badge: unread },
    { to: '/staff', label: 'Staff', icon: Users },
    { to: '/admissions', label: 'Admissions', icon: GraduationCap, badge: pendingApplications },
    { to: '/programs', label: 'Programs', icon: BookOpen },
    { to: '/settings', label: 'Settings', icon: Settings },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const content = (
    <div className="flex h-full flex-col bg-wcbt-maroon text-white">
      <div
        className={cn(
          'flex h-16 items-center border-b border-white/10',
          collapsed ? 'justify-center px-2' : 'justify-between px-4',
        )}
      >
        <NavLink
          to="/dashboard"
          onClick={onCloseMobile}
          className="flex items-center gap-2 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
        >
          {/* The crest alone: the lockup's tagline is unreadable at sidebar scale. */}
          <Logo variant="crest" tone="light" alt="WCBT Admin Portal" className="h-8" />
          {!collapsed && (
            <span className="text-lg font-semibold tracking-tight">
              WCBT
              <span className="ml-1 text-xs font-normal text-white/70">Admin</span>
            </span>
          )}
        </NavLink>
        <button
          type="button"
          onClick={onCloseMobile}
          className="rounded-lg p-1 text-white/80 hover:bg-white/10 lg:hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
          aria-label="Close navigation"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto py-3" aria-label="Main navigation">
        {items.map(({ to, label, icon: Icon, badge }) => (
          <NavLink
            key={to}
            to={to}
            onClick={onCloseMobile}
            title={collapsed ? label : undefined}
            className={({ isActive }) =>
              cn(
                'relative mx-2 flex items-center gap-3 rounded-lg py-2.5 text-sm transition-colors',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white',
                collapsed ? 'justify-center px-2' : 'px-4',
                isActive
                  ? 'border-l-4 border-white bg-white/15 font-medium'
                  : 'border-l-4 border-transparent text-white/85 hover:bg-white/10',
              )
            }
          >
            <Icon className="h-4.5 w-4.5 shrink-0" aria-hidden="true" />
            {!collapsed && <span className="flex-1">{label}</span>}
            {!collapsed && badge ? (
              <span className="rounded-full bg-white px-1.5 text-xs font-semibold text-wcbt-maroon">
                {badge}
              </span>
            ) : null}
            {collapsed && badge ? (
              <span className="absolute ml-6 -mt-5 h-2 w-2 rounded-full bg-white" aria-hidden="true" />
            ) : null}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-white/10 p-2">
        <button
          type="button"
          onClick={handleLogout}
          className={cn(
            'flex w-full items-center gap-3 rounded-lg py-2.5 text-sm text-white/85 transition-colors hover:bg-white/10',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white',
            collapsed ? 'justify-center px-2' : 'px-4',
          )}
        >
          <LogOut className="h-4.5 w-4.5 shrink-0" aria-hidden="true" />
          {!collapsed && <span>Logout</span>}
        </button>
        <button
          type="button"
          onClick={onToggleCollapse}
          className={cn(
            'mt-1 hidden w-full items-center gap-3 rounded-lg py-2 text-xs text-white/70 transition-colors hover:bg-white/10 lg:flex',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white',
            collapsed ? 'justify-center px-2' : 'px-4',
          )}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" aria-hidden="true" />
          ) : (
            <>
              <ChevronLeft className="h-4 w-4" aria-hidden="true" />
              <span>Collapse</span>
            </>
          )}
        </button>
      </div>
    </div>
  );

  return (
    <>
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-30 hidden transition-[width] duration-200 lg:block',
          collapsed ? 'w-16' : 'w-64',
        )}
      >
        {content}
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-wcbt-ink/40" onClick={onCloseMobile} aria-hidden="true" />
          <div className="absolute inset-y-0 left-0 w-64">{content}</div>
        </div>
      )}
    </>
  );
}
