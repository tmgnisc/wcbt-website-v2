import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Bell, Download, GraduationCap, MoreVertical, Pencil, Plus, Trash2, UserCheck } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { DataTable, type Column } from '@/components/shared/DataTable';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Can } from '@/components/shared/Can';
import { NotificationPanel } from '@/components/notifications/NotificationPanel';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { Dropdown, DropdownDivider, DropdownItem } from '@/components/ui/Dropdown';
import { Input, Select } from '@/components/ui/Field';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { useAdmissionsStore } from '@/store/admissions';
import { useNotificationsStore } from '@/store/notifications';
import { useProgramsStore, activeProgramCodes } from '@/store/programs';
import {
  ADMISSION_STAGES_WITH_REJECTED,
  type Admission,
  type AdmissionStage,
} from '@/types/admission';
import type { NotificationRecipient } from '@/types/notification';
import { downloadCsv, formatDate } from '@/lib/utils';

export function AdmissionsPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { toast } = useToast();
  const { user } = useAuth();

  const items = useAdmissionsStore((state) => state.items);
  const loading = useAdmissionsStore((state) => state.loading);
  const load = useAdmissionsStore((state) => state.load);
  const setStatusMany = useAdmissionsStore((state) => state.setStatusMany);
  const convertToStudent = useAdmissionsStore((state) => state.convertToStudent);
  const remove = useAdmissionsStore((state) => state.remove);
  const createNotification = useNotificationsStore((state) => state.create);
  const programItems = useProgramsStore((state) => state.items);
  const loadPrograms = useProgramsStore((state) => state.load);
  const programs = useMemo(() => activeProgramCodes(programItems), [programItems]);

  const [program, setProgram] = useState('all');
  const [status, setStatusFilter] = useState('all');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [selected, setSelected] = useState<string[]>([]);
  const [bulkStage, setBulkStage] = useState<AdmissionStage>('Document Verification');
  const [pendingDelete, setPendingDelete] = useState<Admission | null>(null);
  const [notifyRecipient, setNotifyRecipient] = useState<NotificationRecipient | null>(null);

  useEffect(() => {
    void load();
    void loadPrograms();
  }, [load, loadPrograms]);

  useEffect(() => {
    if (searchParams.get('new') === 'true') {
      searchParams.delete('new');
      setSearchParams(searchParams, { replace: true });
      navigate('/admissions/new');
    }
  }, [searchParams, setSearchParams, navigate]);

  const filtered = useMemo(
    () =>
      items.filter((item) => {
        if (program !== 'all' && item.program !== program) return false;
        if (status !== 'all' && item.status !== status) return false;
        if (from && item.appliedDate < from) return false;
        if (to && item.appliedDate > to) return false;
        return true;
      }),
    [items, program, status, from, to],
  );

  const columns: Column<Admission>[] = [
    {
      key: 'applicant',
      header: 'Applicant',
      sortable: true,
      accessor: (row) => `${row.fullName} ${row.applicationId}`,
      render: (row) => (
        <div className="flex items-center gap-3">
          <Avatar name={row.fullName} src={row.photoUrl} size="sm" />
          <div className="min-w-0">
            <Link
              to={`/admissions/${row.id}`}
              className="block truncate font-medium text-wcbt-ink hover:text-wcbt-maroon"
            >
              {row.fullName}
            </Link>
            <p className="font-mono text-xs text-wcbt-muted">{row.applicationId}</p>
          </div>
        </div>
      ),
    },
    { key: 'program', header: 'Program', sortable: true, accessor: (row) => row.program },
    {
      key: 'appliedDate',
      header: 'Applied',
      sortable: true,
      accessor: (row) => row.appliedDate,
      render: (row) => <span className="text-sm text-wcbt-muted">{formatDate(row.appliedDate)}</span>,
    },
    {
      key: 'testStatus',
      header: 'Test',
      sortable: true,
      accessor: (row) => row.testStatus,
      render: (row) => (
        <div className="flex items-center gap-2">
          <StatusBadge status={row.testStatus} />
          {typeof row.testScore === 'number' && (
            <span className="text-xs text-wcbt-muted">{row.testScore}/100</span>
          )}
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      accessor: (row) => row.status,
      render: (row) => <StatusBadge status={row.status} />,
    },
  ];

  const exportCsv = () => {
    downloadCsv(
      `wcbt-applicants-${new Date().toISOString().slice(0, 10)}.csv`,
      filtered.map((item) => ({
        ApplicationID: item.applicationId,
        Name: item.fullName,
        Program: item.program,
        Applied: item.appliedDate,
        TestStatus: item.testStatus,
        TestScore: item.testScore ?? '',
        Status: item.status,
        Phone: item.phone,
        Email: item.email,
      })),
    );
    toast({ title: 'Applicant list exported' });
  };

  return (
    <>
      <PageHeader
        title="Admissions"
        description="Applications for BIT and B.Tech Ed IT, from enquiry to enrolment."
        breadcrumb={[{ label: 'Home', to: '/dashboard' }, { label: 'Admissions' }]}
        actions={
          <>
            <Button variant="subtle" onClick={exportCsv} disabled={filtered.length === 0}>
              <Download className="h-4 w-4" aria-hidden="true" /> Export
            </Button>
            <Can permission="admissions:add">
              <Link to="/admissions/new">
                <Button>
                  <Plus className="h-4 w-4" aria-hidden="true" /> New Application
                </Button>
              </Link>
            </Can>
          </>
        }
      />

      <DataTable
        columns={columns}
        data={filtered}
        rowKey={(row) => row.id}
        loading={loading}
        searchable
        searchPlaceholder="Search applicants…"
        caption="Admission applications"
        selectable
        selectedIds={selected}
        onSelectionChange={setSelected}
        onRowClick={(row) => navigate(`/admissions/${row.id}`)}
        filters={
          <>
            <Select
              value={program}
              onChange={(event) => setProgram(event.target.value)}
              aria-label="Filter by program"
              className="w-full sm:w-44"
            >
              <option value="all">All programs</option>
              {programs.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </Select>
            <Select
              value={status}
              onChange={(event) => setStatusFilter(event.target.value)}
              aria-label="Filter by status"
              className="w-full sm:w-48"
            >
              <option value="all">All statuses</option>
              {ADMISSION_STAGES_WITH_REJECTED.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </Select>
            <div className="flex items-center gap-1">
              <Input
                type="date"
                value={from}
                onChange={(event) => setFrom(event.target.value)}
                aria-label="Applied from"
                className="w-full sm:w-36"
              />
              <span className="text-xs text-wcbt-muted">to</span>
              <Input
                type="date"
                value={to}
                onChange={(event) => setTo(event.target.value)}
                aria-label="Applied to"
                className="w-full sm:w-36"
              />
            </div>
          </>
        }
        bulkActions={(ids) => (
          <>
            <Select
              value={bulkStage}
              onChange={(event) => setBulkStage(event.target.value as AdmissionStage)}
              aria-label="Bulk status"
              className="h-8 w-44 py-1 text-xs"
            >
              {ADMISSION_STAGES_WITH_REJECTED.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </Select>
            <Button
              variant="subtle"
              size="sm"
              onClick={async () => {
                await setStatusMany(ids, bulkStage);
                toast({ title: `${ids.length} applications moved to ${bulkStage}` });
                setSelected([]);
              }}
            >
              Apply
            </Button>
          </>
        )}
        empty={{
          icon: <GraduationCap className="h-6 w-6" aria-hidden="true" />,
          title: 'No applications found',
          message: 'Adjust the filters, or record a walk-in application.',
          action: (
            <Can permission="admissions:add">
              <Link to="/admissions/new">
                <Button>
                  <Plus className="h-4 w-4" aria-hidden="true" /> New Application
                </Button>
              </Link>
            </Can>
          ),
        }}
        rowActions={(row) => (
          <Dropdown
            menuLabel={`Actions for ${row.fullName}`}
            trigger={({ toggle }) => (
              <button
                type="button"
                onClick={toggle}
                aria-label={`Actions for ${row.fullName}`}
                className="rounded-lg p-1.5 text-wcbt-muted transition-colors hover:bg-wcbt-cream hover:text-wcbt-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-wcbt-maroon"
              >
                <MoreVertical className="h-4 w-4" />
              </button>
            )}
          >
            <DropdownItem icon={<Pencil className="h-4 w-4" />} onSelect={() => navigate(`/admissions/${row.id}`)}>
              View / Edit
            </DropdownItem>
            <DropdownItem
              icon={<Bell className="h-4 w-4" />}
              onSelect={() =>
                setNotifyRecipient({ type: 'applicant', id: row.id, name: row.fullName })
              }
            >
              Send notice
            </DropdownItem>
            <DropdownItem
              icon={<UserCheck className="h-4 w-4" />}
              disabled={row.status !== 'Enrolled' || row.convertedToStudent}
              onSelect={async () => {
                await convertToStudent(row.id);
                toast({ title: `${row.fullName} converted to student` });
              }}
            >
              {row.convertedToStudent ? 'Already a student' : 'Convert to student'}
            </DropdownItem>
            <DropdownDivider />
            <DropdownItem icon={<Trash2 className="h-4 w-4" />} danger onSelect={() => setPendingDelete(row)}>
              Delete
            </DropdownItem>
          </Dropdown>
        )}
      />

      <NotificationPanel
        open={Boolean(notifyRecipient)}
        onClose={() => setNotifyRecipient(null)}
        recipient={notifyRecipient}
        onSubmit={async (draft) => {
          await createNotification(draft, user?.name ?? 'Admin');
          toast({ title: 'Notice sent to applicant' });
        }}
      />

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        onClose={() => setPendingDelete(null)}
        title="Delete application?"
        message={
          <>
            <span className="font-medium text-wcbt-ink">{pendingDelete?.fullName}</span>&apos;s application
            ({pendingDelete?.applicationId}) will be removed permanently.
          </>
        }
        onConfirm={async () => {
          if (!pendingDelete) return;
          await remove(pendingDelete.id);
          toast({ title: 'Application deleted' });
        }}
      />
    </>
  );
}
