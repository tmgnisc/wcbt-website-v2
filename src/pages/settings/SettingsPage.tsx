import { useEffect, useState } from 'react';
import {
  Bell,
  Building2,
  Database,
  Download,
  Palette,
  ShieldCheck,
  Users,
} from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { SettingsSection } from '@/components/settings/SettingsSection';
import { UsersRolesPanel } from '@/components/settings/UsersRolesPanel';
import { CatalogPanel } from '@/components/settings/CatalogPanel';
import { DataTable, type Column } from '@/components/shared/DataTable';
import { WcbtCrest } from '@/components/layout/WcbtCrest';
import { Button } from '@/components/ui/Button';
import { Checkbox, Field, Input, Select, Switch } from '@/components/ui/Field';
import { ChipSelect } from '@/components/ui/TagInput';
import { Tabs } from '@/components/ui/Tabs';
import { Skeleton } from '@/components/ui/Skeleton';
import { useToast } from '@/context/ToastContext';
import { useSettingsStore } from '@/store/settings';
import { NOTIFICATION_AUDIENCES, type NotificationAudience } from '@/types/notification';
import type { AuditLogEntry } from '@/types/settings';
import { WCBT_COLORS } from '@/lib/theme';
import { downloadCsv, formatDateTime } from '@/lib/utils';

const TABS = [
  { value: 'general', label: 'General', icon: <Building2 className="h-4 w-4" aria-hidden="true" /> },
  { value: 'users', label: 'Users & Roles', icon: <Users className="h-4 w-4" aria-hidden="true" /> },
  { value: 'catalog', label: 'Programs & Departments', icon: <Building2 className="h-4 w-4" aria-hidden="true" /> },
  { value: 'notifications', label: 'Notifications', icon: <Bell className="h-4 w-4" aria-hidden="true" /> },
  { value: 'appearance', label: 'Appearance', icon: <Palette className="h-4 w-4" aria-hidden="true" /> },
  { value: 'security', label: 'Security', icon: <ShieldCheck className="h-4 w-4" aria-hidden="true" /> },
  { value: 'data', label: 'Data & Backup', icon: <Database className="h-4 w-4" aria-hidden="true" /> },
];

const SWATCHES: { name: string; value: string; token: string }[] = [
  { name: 'Maroon', value: WCBT_COLORS.maroon, token: 'wcbt-maroon' },
  { name: 'Maroon dark', value: WCBT_COLORS.maroonDark, token: 'wcbt-maroon-dark' },
  { name: 'Maroon light', value: WCBT_COLORS.maroonLight, token: 'wcbt-maroon-light' },
  { name: 'Cream', value: WCBT_COLORS.cream, token: 'wcbt-cream' },
  { name: 'Ink', value: WCBT_COLORS.ink, token: 'wcbt-ink' },
  { name: 'Success', value: WCBT_COLORS.success, token: 'wcbt-success' },
  { name: 'Warning', value: WCBT_COLORS.warning, token: 'wcbt-warning' },
  { name: 'Danger', value: WCBT_COLORS.danger, token: 'wcbt-danger' },
];

export function SettingsPage() {
  const { toast } = useToast();
  const [tab, setTab] = useState('general');

  const settings = useSettingsStore((state) => state.settings);
  const loading = useSettingsStore((state) => state.loading);
  const saving = useSettingsStore((state) => state.saving);
  const load = useSettingsStore((state) => state.load);
  const patch = useSettingsStore((state) => state.patch);
  const save = useSettingsStore((state) => state.save);

  useEffect(() => {
    void load();
  }, [load]);

  const handleSave = async () => {
    await save();
    toast({ title: 'Settings saved' });
  };

  const auditColumns: Column<AuditLogEntry>[] = [
    { key: 'user', header: 'User', sortable: true, accessor: (row) => row.user },
    { key: 'action', header: 'Action', accessor: (row) => row.action },
    { key: 'module', header: 'Module', sortable: true, accessor: (row) => row.module },
    {
      key: 'timestamp',
      header: 'Timestamp',
      sortable: true,
      accessor: (row) => row.timestamp,
      render: (row) => <span className="text-xs text-wcbt-muted">{formatDateTime(row.timestamp)}</span>,
    },
    {
      key: 'ip',
      header: 'IP',
      accessor: (row) => row.ip,
      render: (row) => <span className="font-mono text-xs text-wcbt-muted">{row.ip}</span>,
    },
  ];

  if (loading || !settings) {
    return (
      <>
        <PageHeader title="Settings" breadcrumb={[{ label: 'Home', to: '/dashboard' }, { label: 'Settings' }]} />
        <div className="wcbt-card space-y-4 p-6">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-64 w-full" />
        </div>
      </>
    );
  }

  const { general, notifications, security, auditLog } = settings;

  return (
    <>
      <PageHeader
        title="Settings"
        description="Campus profile, access control and portal configuration."
        breadcrumb={[{ label: 'Home', to: '/dashboard' }, { label: 'Settings' }]}
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[220px_1fr]">
        <aside className="wcbt-card p-2">
          <Tabs items={TABS} value={tab} onChange={setTab} orientation="vertical" ariaLabel="Settings sections" />
        </aside>

        <div>
          {tab === 'general' && (
            <SettingsSection
              title="General"
              description="Identity shown across the portal and public site."
              onSave={handleSave}
              saving={saving}
            >
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Field label="College name" htmlFor="collegeName" className="md:col-span-2">
                  <Input
                    id="collegeName"
                    value={general.collegeName}
                    onChange={(event) => patch('general', { ...general, collegeName: event.target.value })}
                  />
                </Field>
                <Field label="Tagline" htmlFor="tagline">
                  <Input
                    id="tagline"
                    value={general.tagline}
                    onChange={(event) => patch('general', { ...general, tagline: event.target.value })}
                  />
                </Field>
                <Field label="Campus" htmlFor="campusName">
                  <Input
                    id="campusName"
                    value={general.campusName}
                    onChange={(event) => patch('general', { ...general, campusName: event.target.value })}
                  />
                </Field>
                <Field label="Address" htmlFor="address" className="md:col-span-2">
                  <Input
                    id="address"
                    value={general.address}
                    onChange={(event) => patch('general', { ...general, address: event.target.value })}
                  />
                </Field>
                <Field label="Phone" htmlFor="phone">
                  <Input
                    id="phone"
                    value={general.phone}
                    onChange={(event) => patch('general', { ...general, phone: event.target.value })}
                  />
                </Field>
                <Field label="Email" htmlFor="contactEmail">
                  <Input
                    id="contactEmail"
                    type="email"
                    value={general.email}
                    onChange={(event) => patch('general', { ...general, email: event.target.value })}
                  />
                </Field>
                <Field label="Website" htmlFor="website">
                  <Input
                    id="website"
                    value={general.website}
                    onChange={(event) => patch('general', { ...general, website: event.target.value })}
                  />
                </Field>
                <Field label="Academic session" htmlFor="academicSession">
                  <Select
                    id="academicSession"
                    value={general.academicSession}
                    onChange={(event) => patch('general', { ...general, academicSession: event.target.value })}
                  >
                    {['2025 / 2026', '2026 / 2027', '2027 / 2028'].map((session) => (
                      <option key={session} value={session}>
                        {session}
                      </option>
                    ))}
                  </Select>
                </Field>
              </div>

              <div className="mt-6">
                <p className="wcbt-label mb-2">Logo preview</p>
                <div className="flex flex-wrap gap-3">
                  <div className="flex h-24 w-40 items-center justify-center rounded-xl bg-wcbt-cream">
                    <WcbtCrest className="h-12 w-12 text-wcbt-maroon" />
                  </div>
                  <div className="flex h-24 w-40 items-center justify-center rounded-xl bg-wcbt-maroon">
                    <WcbtCrest className="h-12 w-12 text-white" />
                  </div>
                </div>
              </div>
            </SettingsSection>
          )}

          {tab === 'users' && (
            <UsersRolesPanel settings={settings} onPatch={patch} onSave={handleSave} saving={saving} />
          )}

          {tab === 'catalog' && (
            <CatalogPanel settings={settings} onPatch={patch} onSave={handleSave} saving={saving} />
          )}

          {tab === 'notifications' && (
            <SettingsSection
              title="Notification settings"
              description="Defaults applied when a new notice is created."
              onSave={handleSave}
              saving={saving}
            >
              <div className="space-y-5">
                <Field label="Default audience">
                  <ChipSelect
                    options={NOTIFICATION_AUDIENCES}
                    value={notifications.defaultAudience as NotificationAudience[]}
                    onChange={(value) => patch('notifications', { ...notifications, defaultAudience: value })}
                    ariaLabel="Default audience"
                  />
                </Field>

                <div className="space-y-3 rounded-xl border border-black/5 p-4">
                  <Switch
                    id="emailAlerts"
                    checked={notifications.emailAlerts}
                    onChange={(value) => patch('notifications', { ...notifications, emailAlerts: value })}
                    label="Email auto-alerts"
                    description="Email the audience whenever a notice is published."
                  />
                  <Switch
                    id="smsAlerts"
                    checked={notifications.smsAlerts}
                    onChange={(value) => patch('notifications', { ...notifications, smsAlerts: value })}
                    label="SMS auto-alerts"
                    description="Send an SMS for Urgent priority notices only."
                  />
                </div>

                <Field label="Digest frequency" htmlFor="digest">
                  <Select
                    id="digest"
                    value={notifications.digestFrequency}
                    onChange={(event) =>
                      patch('notifications', {
                        ...notifications,
                        digestFrequency: event.target.value as typeof notifications.digestFrequency,
                      })
                    }
                    className="sm:w-48"
                  >
                    {['Instant', 'Daily', 'Weekly'].map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </Select>
                </Field>
              </div>
            </SettingsSection>
          )}

          {tab === 'appearance' && (
            <SettingsSection
              title="Appearance"
              description="The WCBT palette is fixed by brand guidelines and cannot be edited here."
            >
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {SWATCHES.map((swatch) => (
                  <div key={swatch.token} className="rounded-xl border border-black/5 p-3">
                    <div
                      className="h-12 w-full rounded-lg border border-black/5"
                      style={{ backgroundColor: swatch.value }}
                    />
                    <p className="mt-2 text-sm font-medium text-wcbt-ink">{swatch.name}</p>
                    <p className="font-mono text-[11px] text-wcbt-muted">{swatch.value}</p>
                    <p className="font-mono text-[11px] text-wcbt-muted">{swatch.token}</p>
                  </div>
                ))}
              </div>

              <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="overflow-hidden rounded-xl border border-black/5">
                  <div className="flex h-10 items-center gap-2 bg-wcbt-maroon px-3 text-white">
                    <WcbtCrest className="h-5 w-5" />
                    <span className="text-sm font-semibold">WCBT Admin</span>
                  </div>
                  <p className="p-3 text-xs text-wcbt-muted">Sidebar logo placement</p>
                </div>
                <div className="overflow-hidden rounded-xl border border-black/5">
                  <div className="flex h-10 items-center justify-center bg-wcbt-cream">
                    <WcbtCrest className="h-5 w-5 text-wcbt-maroon" />
                  </div>
                  <p className="p-3 text-xs text-wcbt-muted">Login panel logo placement</p>
                </div>
              </div>
            </SettingsSection>
          )}

          {tab === 'security' && (
            <SettingsSection
              title="Security"
              description="Password policy and session rules for portal accounts."
              onSave={handleSave}
              saving={saving}
            >
              <div className="space-y-5">
                <Field label="Minimum password length" htmlFor="minLength">
                  <Input
                    id="minLength"
                    type="number"
                    min={6}
                    max={32}
                    value={security.minPasswordLength}
                    onChange={(event) =>
                      patch('security', { ...security, minPasswordLength: Number(event.target.value) })
                    }
                    className="sm:w-32"
                  />
                </Field>

                <fieldset className="space-y-2 rounded-xl border border-black/5 p-4">
                  <legend className="wcbt-label px-1">Complexity requirements</legend>
                  <Checkbox
                    id="requireUppercase"
                    label="Require an uppercase letter"
                    checked={security.requireUppercase}
                    onChange={(event) =>
                      patch('security', { ...security, requireUppercase: event.target.checked })
                    }
                  />
                  <Checkbox
                    id="requireNumber"
                    label="Require a number"
                    checked={security.requireNumber}
                    onChange={(event) => patch('security', { ...security, requireNumber: event.target.checked })}
                  />
                  <Checkbox
                    id="requireSymbol"
                    label="Require a symbol"
                    checked={security.requireSymbol}
                    onChange={(event) => patch('security', { ...security, requireSymbol: event.target.checked })}
                  />
                </fieldset>

                <Field label="Session timeout" htmlFor="sessionTimeout">
                  <Select
                    id="sessionTimeout"
                    value={String(security.sessionTimeout)}
                    onChange={(event) =>
                      patch('security', {
                        ...security,
                        sessionTimeout: Number(event.target.value) as 15 | 30 | 60,
                      })
                    }
                    className="sm:w-48"
                  >
                    {[15, 30, 60].map((minutes) => (
                      <option key={minutes} value={minutes}>
                        {minutes} minutes
                      </option>
                    ))}
                  </Select>
                </Field>

                <div className="rounded-xl border border-black/5 p-4">
                  <Switch
                    id="twoFactor"
                    checked={security.twoFactorEnabled}
                    onChange={(value) => patch('security', { ...security, twoFactorEnabled: value })}
                    label="Two-factor authentication"
                    description="Require a one-time code for Admin and Super Admin sign-ins."
                  />
                </div>
              </div>
            </SettingsSection>
          )}

          {tab === 'data' && (
            <SettingsSection title="Data & backup" description="Export records and review the audit trail.">
              <Button
                variant="outline"
                onClick={() => {
                  downloadCsv(
                    `wcbt-audit-log-${new Date().toISOString().slice(0, 10)}.csv`,
                    auditLog.map((entry) => ({
                      User: entry.user,
                      Action: entry.action,
                      Module: entry.module,
                      Timestamp: entry.timestamp,
                      IP: entry.ip,
                    })),
                  );
                  toast({ title: 'Export started' });
                }}
              >
                <Download className="h-4 w-4" aria-hidden="true" /> Export all data
              </Button>

              <div className="mt-5">
                <p className="wcbt-label mb-2">Activity / audit log</p>
                <DataTable
                  columns={auditColumns}
                  data={auditLog}
                  rowKey={(row) => row.id}
                  searchable
                  searchPlaceholder="Search the audit log…"
                  pageSize={8}
                  caption="Audit log"
                  empty={{ title: 'No activity recorded' }}
                />
              </div>
            </SettingsSection>
          )}
        </div>
      </div>
    </>
  );
}
