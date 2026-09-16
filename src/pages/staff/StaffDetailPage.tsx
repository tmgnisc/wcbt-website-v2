import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Download, FileText, Pencil, UserCheck, UserX } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Can } from '@/components/shared/Can';
import { EmptyState } from '@/components/shared/EmptyState';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { Tabs } from '@/components/ui/Tabs';
import { Skeleton } from '@/components/ui/Skeleton';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { useStaffStore } from '@/store/staff';
import { ROLE_LABELS } from '@/types/auth';
import { formatCurrency, formatDate, formatDateTime, formatFileSize, formatRelativeTime } from '@/lib/utils';

const TABS = [
  { value: 'overview', label: 'Overview' },
  { value: 'documents', label: 'Documents' },
  { value: 'activity', label: 'Activity Log' },
];

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <dt className="wcbt-label">{label}</dt>
      <dd className="mt-0.5 text-sm text-wcbt-ink">{value}</dd>
    </div>
  );
}

export function StaffDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [tab, setTab] = useState('overview');
  const [statusOpen, setStatusOpen] = useState(false);

  const items = useStaffStore((state) => state.items);
  const loaded = useStaffStore((state) => state.loaded);
  const load = useStaffStore((state) => state.load);
  const setStatus = useStaffStore((state) => state.setStatus);

  useEffect(() => {
    void load();
  }, [load]);

  const member = items.find((item) => item.id === id);
  const manager = items.find((item) => item.id === member?.reportingManagerId);

  if (!loaded) {
    return (
      <div className="wcbt-card space-y-4 p-6">
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (!member) {
    return (
      <div className="wcbt-card">
        <EmptyState
          title="Staff member not found"
          message="This record may have been deleted."
          action={
            <Link to="/staff">
              <Button>Back to staff list</Button>
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <>
      <PageHeader
        title={member.fullName}
        breadcrumb={[
          { label: 'Home', to: '/dashboard' },
          { label: 'Staff', to: '/staff' },
          { label: member.fullName },
        ]}
      />

      <section className="wcbt-card flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Avatar name={member.fullName} src={member.photoUrl} size="lg" />
          <div>
            <h2 className="text-lg font-semibold tracking-tight text-wcbt-ink">{member.fullName}</h2>
            <p className="text-sm text-wcbt-muted">
              {member.designation} · {member.department}
            </p>
            <div className="mt-1.5 flex items-center gap-2">
              <StatusBadge status={member.status} />
              <span className="font-mono text-xs text-wcbt-muted">{member.staffId}</span>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Can permission="staff:edit">
            <Button variant="outline" onClick={() => navigate(`/staff/${member.id}/edit`)}>
              <Pencil className="h-4 w-4" aria-hidden="true" /> Edit
            </Button>
          </Can>
          <Can permission="staff:edit">
            <Button variant="subtle" onClick={() => setStatusOpen(true)}>
              {member.status === 'Active' ? (
                <>
                  <UserX className="h-4 w-4" aria-hidden="true" /> Deactivate
                </>
              ) : (
                <>
                  <UserCheck className="h-4 w-4" aria-hidden="true" /> Activate
                </>
              )}
            </Button>
          </Can>
        </div>
      </section>

      <div className="mt-4 wcbt-card">
        <Tabs items={TABS} value={tab} onChange={setTab} ariaLabel="Staff profile sections" className="px-4" />

        <div className="p-5">
          {tab === 'overview' && (
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <section>
                <h3 className="wcbt-label mb-3">Contact</h3>
                <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <DetailRow label="Email" value={member.email} />
                  <DetailRow label="Phone" value={member.phone} />
                  <DetailRow label="Address" value={member.address} />
                  <DetailRow label="Date of birth" value={formatDate(member.dateOfBirth)} />
                  <DetailRow label="Gender" value={member.gender} />
                  <DetailRow label="Citizenship / ID" value={member.citizenshipNo} />
                </dl>
              </section>

              <section>
                <h3 className="wcbt-label mb-3">Employment</h3>
                <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <DetailRow label="Department" value={member.department} />
                  <DetailRow label="Designation" value={member.designation} />
                  <DetailRow label="Employment type" value={member.employmentType} />
                  <DetailRow label="Joined" value={formatDate(member.joiningDate)} />
                  <DetailRow label="Reporting manager" value={manager?.fullName ?? '—'} />
                  <DetailRow
                    label="Salary"
                    value={
                      <Can permission="staff:viewSalary" fallback={<span className="font-mono">••••••</span>}>
                        {formatCurrency(member.salary)}
                      </Can>
                    }
                  />
                  <DetailRow label="Portal role" value={ROLE_LABELS[member.role]} />
                  <DetailRow
                    label="Login"
                    value={member.loginEnabled ? 'Enabled' : 'Disabled'}
                  />
                </dl>
              </section>
            </div>
          )}

          {tab === 'documents' &&
            (member.documents.length === 0 ? (
              <EmptyState
                icon={<FileText className="h-6 w-6" aria-hidden="true" />}
                title="No documents uploaded"
                message="CV, citizenship and certificates added on the edit form appear here."
                action={
                  <Can permission="staff:edit">
                    <Button variant="outline" onClick={() => navigate(`/staff/${member.id}/edit`)}>
                      Upload documents
                    </Button>
                  </Can>
                }
              />
            ) : (
              <ul className="divide-y divide-black/5 rounded-xl border border-black/5">
                {member.documents.map((file) => (
                  <li key={file.id} className="flex items-center gap-3 px-4 py-3">
                    <FileText className="h-4 w-4 text-wcbt-maroon" aria-hidden="true" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm text-wcbt-ink">{file.name}</p>
                      <p className="text-xs text-wcbt-muted">
                        {formatFileSize(file.size)} · uploaded {formatDate(file.uploadedAt)}
                      </p>
                    </div>
                    <a
                      href={file.url ?? '#'}
                      download={file.name}
                      aria-label={`Download ${file.name}`}
                      className="rounded-lg p-1.5 text-wcbt-muted hover:bg-wcbt-cream hover:text-wcbt-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-wcbt-maroon"
                    >
                      <Download className="h-4 w-4" />
                    </a>
                  </li>
                ))}
              </ul>
            ))}

          {tab === 'activity' &&
            (member.activity.length === 0 ? (
              <EmptyState title="No activity yet" message="Profile changes will be recorded here." />
            ) : (
              <ol className="space-y-4">
                {member.activity.map((entry) => (
                  <li key={entry.id} className="flex gap-3">
                    <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-wcbt-maroon" aria-hidden="true" />
                    <div>
                      <p className="text-sm text-wcbt-ink">{entry.action}</p>
                      {entry.detail && <p className="text-xs text-wcbt-muted">{entry.detail}</p>}
                      <p className="text-xs text-wcbt-muted">
                        {entry.actor} · {formatDateTime(entry.timestamp)} ({formatRelativeTime(entry.timestamp)})
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            ))}
        </div>
      </div>

      <ConfirmDialog
        open={statusOpen}
        onClose={() => setStatusOpen(false)}
        tone="primary"
        confirmLabel={member.status === 'Active' ? 'Deactivate' : 'Activate'}
        title={member.status === 'Active' ? 'Deactivate staff member?' : 'Activate staff member?'}
        message={
          member.status === 'Active'
            ? `${member.fullName} will lose portal access. Their record and history are preserved.`
            : `${member.fullName} will regain portal access.`
        }
        onConfirm={async () => {
          const next = member.status === 'Active' ? 'Inactive' : 'Active';
          await setStatus(member.id, next, user?.name ?? 'Admin');
          toast({ title: `${member.fullName} is now ${next}` });
        }}
      />
    </>
  );
}
