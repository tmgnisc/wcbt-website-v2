import { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from '@/components/layout/Sidebar';
import { Topbar } from '@/components/layout/Topbar';
import { useNotificationsStore } from '@/store/notifications';
import { useStaffStore } from '@/store/staff';
import { useAdmissionsStore } from '@/store/admissions';
import { cn } from '@/lib/utils';

export function DashboardLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const loadNotifications = useNotificationsStore((state) => state.load);
  const loadStaff = useStaffStore((state) => state.load);
  const loadAdmissions = useAdmissionsStore((state) => state.load);

  // Module data is loaded once for the whole shell so sidebar badges, the bell dropdown and
  // global search are populated regardless of which page the user lands on first.
  useEffect(() => {
    void loadNotifications();
    void loadStaff();
    void loadAdmissions();
  }, [loadNotifications, loadStaff, loadAdmissions]);

  return (
    <div className="min-h-screen bg-wcbt-cream">
      <Sidebar
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed((current) => !current)}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
      />
      <div className={cn('transition-[padding] duration-200', collapsed ? 'lg:pl-16' : 'lg:pl-64')}>
        <Topbar onOpenMobileSidebar={() => setMobileOpen(true)} />
        <main className="px-4 py-6 sm:px-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
