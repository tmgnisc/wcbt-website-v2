import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Download, KeyRound, MoreVertical, Pencil, Plus, Trash2, UserCheck, UserRound, UserX } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { DataTable, type Column } from '@/components/shared/DataTable';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Can } from '@/components/shared/Can';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { Dropdown, DropdownDivider, DropdownItem } from '@/components/ui/Dropdown';
import { Select } from '@/components/ui/Field';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { useStaffStore } from '@/store/staff';
import { useSettingsStore } from '@/store/settings';
import { STAFF_STATUSES, type StaffMember } from '@/types/staff';
import { downloadCsv, formatDate } from '@/lib/utils';

export function StaffListPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();

  const items = useStaffStore((state) => state.items);
  const loading = useStaffStore((state) => state.loading);
  const load = useStaffStore((state) => state.load);
  const setStatus = useStaffStore((state) => state.setStatus);
  const remove = useStaffStore((state) => state.remove);

  const settings = useSettingsStore((state) => state.settings);
  const loadSettings = useSettingsStore((state) => state.load);

  const [department, setDepartment] = useState('all');
  const [designation, setDesignation] = useState('all');
  const [status, setStatusFilter] = useState('all');
  const [pendingDelete, setPendingDelete] = useState<StaffMember | null>(null);
  const [pendingStatus, setPendingStatus] = useState<StaffMember | null>(null);

  useEffect(() => {
    void load();
    void loadSettings();
  }, [load, loadSettings]);

  const filtered = useMemo(
    () =>
      items.filter((member) => {
        if (department !== 'all' && member.department !== department) return false;
        if (designation !== 'all' && member.designation !== designation) return false;
        if (status !== 'all' && member.status !== status) return false;
        return true;
      }),
    [items, department, designation, status],
  );

  const columns: Column<StaffMember>[] = [
    {
      key: 'member',
      header: 'Staff',
      sortable: true,
      accessor: (row) => `${row.fullName} ${row.staffId}`,
      render: (row) => (
        <div className="flex items-center gap-3">
          <Avatar name={row.fullName} src={row.photoUrl} size="sm" />
          <div className="min-w-0">
            <Link
              to={`/staff/${row.id}`}
              className="block truncate font-medium text-wcbt-ink hover:text-wcbt-maroon"
            >
              {row.fullName}
            </Link>
            <p className="font-mono text-xs text-wcbt-muted">{row.staffId}</p>
          </div>
        </div>
      ),
    },
    { key: 'department', header: 'Department', sortable: true, accessor: (row) => row.department },
    { key: 'designation', header: 'Designation', sortable: true, accessor: (row) => row.designation },
    {
      key: 'contact',
      header: 'Contact',
      accessor: (row) => `${row.phone} ${row.email}`,
      render: (row) => (
        <div className="text-xs text-wcbt-muted">
          <p>{row.phone}</p>
          <p className="truncate">{row.email}</p>
        </div>
      ),
    },
    {
      key: 'joiningDate',
      header: 'Joined',
      sortable: true,
      accessor: (row) => row.joiningDate,
      render: (row) => <span className="text-sm text-wcbt-muted">{formatDate(row.joiningDate)}</span>,
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
      `wcbt-staff-${new Date().toISOString().slice(0, 10)}.csv`,
      filtered.map((member) => ({
        StaffID: member.staffId,
        Name: member.fullName,
        Department: member.department,
        Designation: member.designation,
        Phone: member.phone,
        Email: member.email,
        Status: member.status,
        Joined: member.joiningDate,
      })),
    );
    toast({ title: 'Staff list exported' });
  };

  return (
    <>
      <PageHeader
        title="Staff"
        description="Personnel records, departments and portal access."
        breadcrumb={[{ label: 'Home', to: '/dashboard' }, { label: 'Staff' }]}
        actions={
          <>
            <Button variant="subtle" onClick={exportCsv} disabled={filtered.length === 0}>
              <Download className="h-4 w-4" aria-hidden="true" /> Export CSV
            </Button>
            <Can permission="staff:add">
              <Link to="/staff/new">
                <Button>
                  <Plus className="h-4 w-4" aria-hidden="true" /> Add Staff
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
        searchPlaceholder="Search by name or staff ID…"
        caption="Staff directory"
        onRowClick={(row) => navigate(`/staff/${row.id}`)}
        filters={
          <>
            <Select
              value={department}
              onChange={(event) => setDepartment(event.target.value)}
              aria-label="Filter by department"
              className="w-full sm:w-48"
            >
              <option value="all">All departments</option>
              {settings?.catalog.departments.map((item) => (
                <option key={item.id} value={item.name}>
                  {item.name}
                </option>
              ))}
            </Select>
            <Select
              value={designation}
              onChange={(event) => setDesignation(event.target.value)}
              aria-label="Filter by designation"
              className="w-full sm:w-48"
            >
              <option value="all">All designations</option>
              {settings?.catalog.designations.map((item) => (
                <option key={item.id} value={item.name}>
                  {item.name}
                </option>
              ))}
            </Select>
            <Select
              value={status}
              onChange={(event) => setStatusFilter(event.target.value)}
              aria-label="Filter by status"
              className="w-full sm:w-36"
            >
              <option value="all">All statuses</option>
              {STAFF_STATUSES.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </Select>
          </>
        }
        empty={{
          icon: <UserRound className="h-6 w-6" aria-hidden="true" />,
          title: 'No staff records found',
          message: 'Try a different filter, or add the first staff member.',
          action: (
            <Can permission="staff:add">
              <Link to="/staff/new">
                <Button>
                  <Plus className="h-4 w-4" aria-hidden="true" /> Add Staff
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
            <DropdownItem icon={<UserRound className="h-4 w-4" />} onSelect={() => navigate(`/staff/${row.id}`)}>
              View profile
            </DropdownItem>
            <DropdownItem icon={<Pencil className="h-4 w-4" />} onSelect={() => navigate(`/staff/${row.id}/edit`)}>
              Edit
            </DropdownItem>
            <DropdownItem
              icon={row.status === 'Active' ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
              onSelect={() => setPendingStatus(row)}
            >
              {row.status === 'Active' ? 'Deactivate' : 'Activate'}
            </DropdownItem>
            <DropdownItem
              icon={<KeyRound className="h-4 w-4" />}
              onSelect={() => toast({ title: `Reset link sent to ${row.email}`, variant: 'info' })}
            >
              Reset password
            </DropdownItem>
            <DropdownDivider />
            <DropdownItem icon={<Trash2 className="h-4 w-4" />} danger onSelect={() => setPendingDelete(row)}>
              Delete
            </DropdownItem>
          </Dropdown>
        )}
      />

      <ConfirmDialog
        open={Boolean(pendingStatus)}
        onClose={() => setPendingStatus(null)}
        tone="primary"
        confirmLabel={pendingStatus?.status === 'Active' ? 'Deactivate' : 'Activate'}
        title={pendingStatus?.status === 'Active' ? 'Deactivate staff member?' : 'Activate staff member?'}
        message={
          pendingStatus?.status === 'Active'
            ? `${pendingStatus?.fullName} will lose portal access but the record and history stay intact.`
            : `${pendingStatus?.fullName} will regain portal access.`
        }
        onConfirm={async () => {
          if (!pendingStatus) return;
          const next = pendingStatus.status === 'Active' ? 'Inactive' : 'Active';
          await setStatus(pendingStatus.id, next, user?.name ?? 'Admin');
          toast({ title: `${pendingStatus.fullName} is now ${next}` });
        }}
      />

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        onClose={() => setPendingDelete(null)}
        title="Delete staff record?"
        message={
          <>
            <span className="font-medium text-wcbt-ink">{pendingDelete?.fullName}</span> will be removed
            permanently. Staff records with linked history should be deactivated instead of deleted.
          </>
        }
        onConfirm={async () => {
          if (!pendingDelete) return;
          await remove(pendingDelete.id);
          toast({ title: 'Staff record deleted' });
        }}
      />
    </>
  );
}
