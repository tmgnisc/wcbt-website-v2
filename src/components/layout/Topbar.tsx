import { useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Bell, ChevronDown, LogOut, Menu, Search, Settings, User } from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';
import { Dropdown, DropdownDivider, DropdownItem } from '@/components/ui/Dropdown';
import { Input } from '@/components/ui/Field';
import { useAuth } from '@/context/AuthContext';
import { useNotificationsStore, selectUnreadCount } from '@/store/notifications';
import { useStaffStore } from '@/store/staff';
import { useAdmissionsStore } from '@/store/admissions';
import { ROLE_LABELS } from '@/types/auth';
import { cn, formatRelativeTime } from '@/lib/utils';
import { htmlToText } from '@/lib/sanitize';

const TITLES: { match: RegExp; title: string }[] = [
  { match: /^\/dashboard/, title: 'Dashboard' },
  { match: /^\/notifications/, title: 'Notifications' },
  { match: /^\/staff\/new/, title: 'Add Staff Member' },
  { match: /^\/staff\/[^/]+\/edit/, title: 'Edit Staff Member' },
  { match: /^\/staff\/[^/]+/, title: 'Staff Profile' },
  { match: /^\/staff/, title: 'Staff' },
  { match: /^\/admissions\/[^/]+/, title: 'Application' },
  { match: /^\/admissions/, title: 'Admissions' },
  { match: /^\/programs/, title: 'Programs' },
  { match: /^\/settings/, title: 'Settings' },
];

interface TopbarProps {
  onOpenMobileSidebar: () => void;
}

export function Topbar({ onOpenMobileSidebar }: TopbarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [query, setQuery] = useState('');

  const notifications = useNotificationsStore((state) => state.items);
  const markAllRead = useNotificationsStore((state) => state.markAllRead);
  const unread = useNotificationsStore(selectUnreadCount);
  const staff = useStaffStore((state) => state.items);
  const admissions = useAdmissionsStore((state) => state.items);

  const title = TITLES.find((entry) => entry.match.test(location.pathname))?.title ?? 'WCBT Admin';

  const results = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (term.length < 2) return [];

    return [
      ...staff
        .filter((member) => `${member.fullName} ${member.staffId}`.toLowerCase().includes(term))
        .slice(0, 3)
        .map((member) => ({ id: member.id, label: member.fullName, group: 'Staff', to: `/staff/${member.id}` })),
      ...admissions
        .filter((item) => `${item.fullName} ${item.applicationId}`.toLowerCase().includes(term))
        .slice(0, 3)
        .map((item) => ({ id: item.id, label: item.fullName, group: 'Admissions', to: `/admissions/${item.id}` })),
      ...notifications
        .filter((item) => item.title.toLowerCase().includes(term))
        .slice(0, 3)
        .map((item) => ({ id: item.id, label: item.title, group: 'Notifications', to: '/notifications' })),
    ];
  }, [query, staff, admissions, notifications]);

  const latest = [...notifications]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between gap-3 border-b border-black/5 bg-wcbt-surface px-4 sm:px-6">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onOpenMobileSidebar}
          className="rounded-lg p-2 text-wcbt-muted transition-colors hover:bg-wcbt-cream lg:hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-wcbt-maroon"
          aria-label="Open navigation"
        >
          <Menu className="h-5 w-5" />
        </button>
        <h2 className="text-base font-semibold tracking-tight text-wcbt-ink">{title}</h2>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative hidden md:block">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-wcbt-muted"
            aria-hidden="true"
          />
          <Input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search staff, applicants, notices…"
            aria-label="Global search"
            className="w-64 bg-wcbt-cream py-1.5 pl-9 text-sm"
          />
          {results.length > 0 && (
            <div className="absolute left-0 top-11 z-30 w-80 overflow-hidden rounded-xl border border-black/5 bg-wcbt-surface p-1 shadow-lg">
              {results.map((result) => (
                <Link
                  key={`${result.group}-${result.id}`}
                  to={result.to}
                  onClick={() => setQuery('')}
                  className="flex items-center justify-between gap-2 rounded-lg px-3 py-2 text-sm text-wcbt-ink transition-colors hover:bg-wcbt-cream"
                >
                  <span className="truncate">{result.label}</span>
                  <span className="shrink-0 text-xs text-wcbt-muted">{result.group}</span>
                </Link>
              ))}
            </div>
          )}
        </div>

        <Dropdown
          menuLabel="Recent notifications"
          widthClassName="w-80"
          trigger={({ toggle }) => (
            <button
              type="button"
              onClick={toggle}
              className="relative rounded-lg p-2 text-wcbt-muted transition-colors hover:bg-wcbt-cream focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-wcbt-maroon"
              aria-label={`Notifications${unread > 0 ? `, ${unread} unread` : ''}`}
            >
              <Bell className="h-5 w-5" />
              {unread > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-wcbt-danger px-1 text-[10px] font-semibold text-white">
                  {unread}
                </span>
              )}
            </button>
          )}
        >
          <div className="flex items-center justify-between px-3 py-2">
            <p className="text-xs font-medium uppercase tracking-wide text-wcbt-muted">Latest</p>
            <button
              type="button"
              onClick={markAllRead}
              className="text-xs text-wcbt-maroon hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-wcbt-maroon"
            >
              Mark all read
            </button>
          </div>
          <div className="max-h-80 overflow-y-auto">
            {latest.length === 0 ? (
              <p className="px-3 py-6 text-center text-sm text-wcbt-muted">No notifications yet.</p>
            ) : (
              latest.map((item) => (
                <Link
                  key={item.id}
                  to="/notifications"
                  className={cn(
                    'block rounded-lg px-3 py-2 transition-colors hover:bg-wcbt-cream',
                    !item.read && 'bg-wcbt-maroon/5',
                  )}
                >
                  <p className="truncate text-sm font-medium text-wcbt-ink">{item.title}</p>
                  <p className="truncate text-xs text-wcbt-muted">{htmlToText(item.message)}</p>
                  <p className="mt-0.5 text-[11px] text-wcbt-muted">
                    {formatRelativeTime(item.createdAt)}
                  </p>
                </Link>
              ))
            )}
          </div>
          <DropdownDivider />
          <Link
            to="/notifications"
            className="block rounded-lg px-3 py-2 text-center text-sm font-medium text-wcbt-maroon hover:bg-wcbt-cream"
          >
            View all notifications
          </Link>
        </Dropdown>

        <Dropdown
          menuLabel="Account"
          trigger={({ toggle }) => (
            <button
              type="button"
              onClick={toggle}
              className="flex items-center gap-2 rounded-lg p-1 pr-2 transition-colors hover:bg-wcbt-cream focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-wcbt-maroon"
            >
              <Avatar name={user?.name ?? 'WCBT'} src={user?.avatarUrl} size="sm" />
              <span className="hidden text-left sm:block">
                <span className="block text-sm font-medium leading-tight text-wcbt-ink">
                  {user?.name}
                </span>
                <span className="block text-[11px] leading-tight text-wcbt-muted">
                  {user ? ROLE_LABELS[user.role] : ''}
                </span>
              </span>
              <ChevronDown className="h-4 w-4 text-wcbt-muted" aria-hidden="true" />
            </button>
          )}
        >
          <DropdownItem icon={<User className="h-4 w-4" />} onSelect={() => navigate(`/staff/${user?.id}`)}>
            Profile
          </DropdownItem>
          <DropdownItem icon={<Settings className="h-4 w-4" />} onSelect={() => navigate('/settings')}>
            Settings
          </DropdownItem>
          <DropdownDivider />
          <DropdownItem icon={<LogOut className="h-4 w-4" />} danger onSelect={handleLogout}>
            Logout
          </DropdownItem>
        </Dropdown>
      </div>
    </header>
  );
}
