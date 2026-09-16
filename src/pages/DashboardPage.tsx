import { useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Bar,
  BarChart,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Bell, FileCheck2, GraduationCap, UserPlus, Users } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { StatCard } from '@/components/dashboard/StatCard';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { useAuth } from '@/context/AuthContext';
import { useNotificationsStore, selectPendingCount } from '@/store/notifications';
import { useStaffStore } from '@/store/staff';
import { useAdmissionsStore, selectNewThisMonth } from '@/store/admissions';
import { CHART_SEQUENCE, WCBT_COLORS } from '@/lib/theme';
import { formatRelativeTime } from '@/lib/utils';

export function DashboardPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const staff = useStaffStore((state) => state.items);
  const staffLoading = useStaffStore((state) => state.loading);
  const admissions = useAdmissionsStore((state) => state.items);
  const admissionsLoading = useAdmissionsStore((state) => state.loading);
  const trend = useAdmissionsStore((state) => state.trend);
  const newThisMonth = useAdmissionsStore(selectNewThisMonth);
  const notifications = useNotificationsStore((state) => state.items);
  const pendingNotifications = useNotificationsStore(selectPendingCount);

  const enrolledStudents = admissions.filter((item) => item.status === 'Enrolled').length;

  const departmentData = useMemo(() => {
    const counts = new Map<string, number>();
    for (const member of staff) {
      counts.set(member.department, (counts.get(member.department) ?? 0) + 1);
    }
    return Array.from(counts, ([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
  }, [staff]);

  const activity = useMemo(() => {
    const notificationEvents = notifications.slice(0, 4).map((item) => ({
      id: `ntf-${item.id}`,
      icon: Bell,
      text: `${item.status === 'Published' ? 'Published' : 'Drafted'} notice “${item.title}”`,
      meta: item.createdBy,
      timestamp: item.createdAt,
      to: '/notifications',
    }));

    const admissionEvents = admissions.slice(0, 4).map((item) => ({
      id: `adm-${item.id}`,
      icon: GraduationCap,
      text: `${item.fullName} — ${item.program} application at ${item.status}`,
      meta: item.applicationId,
      timestamp: `${item.appliedDate}T09:00:00Z`,
      to: `/admissions/${item.id}`,
    }));

    const staffEvents = staff
      .flatMap((member) =>
        member.activity.slice(0, 1).map((entry) => ({
          id: `stf-${entry.id}`,
          icon: Users,
          text: `${member.fullName} — ${entry.action}`,
          meta: entry.actor,
          timestamp: entry.timestamp,
          to: `/staff/${member.id}`,
        })),
      )
      .slice(0, 4);

    return [...notificationEvents, ...admissionEvents, ...staffEvents]
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 7);
  }, [notifications, admissions, staff]);

  const upcomingTests = admissions
    .filter((item) => item.testStatus === 'Scheduled')
    .slice(0, 4);

  return (
    <>
      <PageHeader
        title={`Welcome back, ${user?.name?.split(' ').slice(-1)[0] ?? 'Admin'}`}
        description="Campus activity across admissions, staff and notices at a glance."
        breadcrumb={[{ label: 'Home', to: '/dashboard' }, { label: 'Dashboard' }]}
        actions={
          <>
            <Button variant="outline" size="sm" onClick={() => navigate('/staff/new')}>
              <UserPlus className="h-4 w-4" aria-hidden="true" /> Add Staff
            </Button>
            <Button variant="outline" size="sm" onClick={() => navigate('/notifications?new=true')}>
              <Bell className="h-4 w-4" aria-hidden="true" /> New Notification
            </Button>
            <Button variant="outline" size="sm" onClick={() => navigate('/admissions?new=true')}>
              <GraduationCap className="h-4 w-4" aria-hidden="true" /> New Admission
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total Staff" value={staff.length} icon={Users} loading={staffLoading} />
        <StatCard
          label="Total Students"
          value={enrolledStudents}
          icon={GraduationCap}
          loading={admissionsLoading}
        />
        <StatCard
          label="New Admissions (this month)"
          value={newThisMonth}
          icon={UserPlus}
          delta={{ value: '+12%', direction: 'up' }}
          loading={admissionsLoading}
        />
        <StatCard label="Pending Notifications" value={pendingNotifications} icon={Bell} />
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-3">
        <section className="wcbt-card p-5 xl:col-span-2">
          <header className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="font-semibold tracking-tight text-wcbt-ink">Admissions Trend</h2>
              <p className="text-xs text-wcbt-muted">Applications vs. enrolments, last 6 months</p>
            </div>
            <Link to="/admissions" className="text-xs font-medium text-wcbt-maroon hover:underline">
              View all
            </Link>
          </header>
          {trend.length === 0 ? (
            <Skeleton className="h-64 w-full" />
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={trend} barGap={4}>
                  <XAxis
                    dataKey="month"
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: WCBT_COLORS.muted, fontSize: 12 }}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: WCBT_COLORS.muted, fontSize: 12 }}
                    width={32}
                  />
                  <Tooltip
                    cursor={{ fill: WCBT_COLORS.cream }}
                    contentStyle={{
                      borderRadius: 12,
                      border: '1px solid rgba(0,0,0,0.05)',
                      fontSize: 12,
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Bar
                    dataKey="applications"
                    name="Applications"
                    fill={WCBT_COLORS.maroon}
                    radius={[4, 4, 0, 0]}
                    isAnimationActive={false}
                  />
                  <Bar
                    dataKey="enrolled"
                    name="Enrolled"
                    fill={WCBT_COLORS.maroonLight}
                    radius={[4, 4, 0, 0]}
                    isAnimationActive={false}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </section>

        <section className="wcbt-card p-5">
          <header className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="font-semibold tracking-tight text-wcbt-ink">Staff by Department</h2>
              <p className="text-xs text-wcbt-muted">{staff.length} members</p>
            </div>
            <Link to="/staff" className="text-xs font-medium text-wcbt-maroon hover:underline">
              View all
            </Link>
          </header>
          {departmentData.length === 0 ? (
            <Skeleton className="h-64 w-full" />
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={departmentData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={48}
                    outerRadius={78}
                    paddingAngle={2}
                    isAnimationActive={false}
                  >
                    {departmentData.map((entry, index) => (
                      <Cell key={entry.name} fill={CHART_SEQUENCE[index % CHART_SEQUENCE.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: 12, fontSize: 12 }} />
                  <Legend
                    layout="vertical"
                    align="right"
                    verticalAlign="middle"
                    wrapperStyle={{ fontSize: 11 }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </section>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <section className="wcbt-card p-5 lg:col-span-2">
          <h2 className="mb-4 font-semibold tracking-tight text-wcbt-ink">Recent Activity</h2>
          <ol className="space-y-4">
            {activity.map((entry) => (
              <li key={entry.id} className="flex gap-3">
                <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-wcbt-maroon/10 text-wcbt-maroon">
                  <entry.icon className="h-4 w-4" aria-hidden="true" />
                </span>
                <div className="min-w-0 flex-1">
                  <Link to={entry.to} className="block truncate text-sm text-wcbt-ink hover:text-wcbt-maroon">
                    {entry.text}
                  </Link>
                  <p className="text-xs text-wcbt-muted">
                    {entry.meta} · {formatRelativeTime(entry.timestamp)}
                  </p>
                </div>
              </li>
            ))}
            {activity.length === 0 && (
              <li className="py-6 text-center text-sm text-wcbt-muted">No activity recorded yet.</li>
            )}
          </ol>
        </section>

        <section className="wcbt-card p-5">
          <header className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold tracking-tight text-wcbt-ink">Upcoming Tests</h2>
            <Link to="/admissions" className="text-xs font-medium text-wcbt-maroon hover:underline">
              View all
            </Link>
          </header>
          <ul className="space-y-3">
            {upcomingTests.map((item) => (
              <li key={item.id} className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <Link
                    to={`/admissions/${item.id}`}
                    className="block truncate text-sm text-wcbt-ink hover:text-wcbt-maroon"
                  >
                    {item.fullName}
                  </Link>
                  <p className="text-xs text-wcbt-muted">{item.program}</p>
                </div>
                <StatusBadge status={item.testStatus} />
              </li>
            ))}
            {upcomingTests.length === 0 && (
              <li className="flex flex-col items-center gap-2 py-6 text-center text-sm text-wcbt-muted">
                <FileCheck2 className="h-5 w-5 text-wcbt-maroon" aria-hidden="true" />
                No entrance tests scheduled.
              </li>
            )}
          </ul>
        </section>
      </div>
    </>
  );
}
