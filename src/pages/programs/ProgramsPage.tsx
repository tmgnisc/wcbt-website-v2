import { useEffect, useMemo, useState } from 'react';
import { BookOpen, GraduationCap, MoreVertical, Pencil, Plus, Power, Trash2, Users } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { StatCard } from '@/components/dashboard/StatCard';
import { DataTable, type Column } from '@/components/shared/DataTable';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Can } from '@/components/shared/Can';
import { ProgramPanel } from '@/components/programs/ProgramPanel';
import { Button } from '@/components/ui/Button';
import { Dropdown, DropdownDivider, DropdownItem } from '@/components/ui/Dropdown';
import { Select } from '@/components/ui/Field';
import { useToast } from '@/context/ToastContext';
import { useProgramsStore, selectTotalSeats } from '@/store/programs';
import { useAdmissionsStore } from '@/store/admissions';
import { PROGRAM_LEVELS, PROGRAM_STATUSES, type Program } from '@/types/program';
import { formatCurrency, formatDate } from '@/lib/utils';

export function ProgramsPage() {
  const { toast } = useToast();

  const items = useProgramsStore((state) => state.items);
  const loading = useProgramsStore((state) => state.loading);
  const load = useProgramsStore((state) => state.load);
  const createProgram = useProgramsStore((state) => state.create);
  const updateProgram = useProgramsStore((state) => state.update);
  const removeProgram = useProgramsStore((state) => state.remove);
  const toggleStatus = useProgramsStore((state) => state.toggleStatus);
  const totalSeats = useProgramsStore(selectTotalSeats);

  const applications = useAdmissionsStore((state) => state.items);
  const loadAdmissions = useAdmissionsStore((state) => state.load);

  const [panelOpen, setPanelOpen] = useState(false);
  const [editing, setEditing] = useState<Program | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Program | null>(null);
  const [level, setLevel] = useState('all');
  const [status, setStatus] = useState('all');

  useEffect(() => {
    void load();
    void loadAdmissions();
  }, [load, loadAdmissions]);

  // Applications per program code, so a program is never deleted blindly.
  const applicationCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const application of applications) {
      counts.set(application.program, (counts.get(application.program) ?? 0) + 1);
    }
    return counts;
  }, [applications]);

  const filtered = useMemo(
    () =>
      items.filter((item) => {
        if (level !== 'all' && item.level !== level) return false;
        if (status !== 'all' && item.status !== status) return false;
        return true;
      }),
    [items, level, status],
  );

  const activeCount = items.filter((item) => item.status === 'Active').length;

  const openCreate = () => {
    setEditing(null);
    setPanelOpen(true);
  };

  const columns: Column<Program>[] = [
    {
      key: 'name',
      header: 'Program',
      sortable: true,
      accessor: (row) => row.name,
      className: 'max-w-[320px]',
      render: (row) => (
        <div className="max-w-[320px]">
          <p className="flex items-center gap-2 font-medium text-wcbt-ink">
            {row.code}
            <span className="rounded bg-wcbt-cream px-1.5 py-0.5 text-[11px] font-normal text-wcbt-muted">
              {row.level}
            </span>
          </p>
          <p className="truncate text-xs text-wcbt-muted" title={row.name}>
            {row.name}
          </p>
        </div>
      ),
    },
    {
      key: 'department',
      header: 'Department',
      sortable: true,
      accessor: (row) => row.department,
      render: (row) => (
        <div>
          <p className="text-sm text-wcbt-ink">{row.department}</p>
          <p className="text-xs text-wcbt-muted">{row.affiliation}</p>
        </div>
      ),
    },
    {
      key: 'duration',
      header: 'Duration',
      sortable: true,
      accessor: (row) => row.durationYears,
      render: (row) => (
        <span className="text-sm text-wcbt-muted">
          {row.durationYears} yrs · {row.semesters} sem
        </span>
      ),
    },
    {
      key: 'seats',
      header: 'Seats',
      sortable: true,
      accessor: (row) => row.seats,
      render: (row) => (
        <div>
          <p className="text-sm text-wcbt-ink">{row.seats}</p>
          <p className="text-xs text-wcbt-muted">
            {applicationCounts.get(row.code) ?? 0} applications
          </p>
        </div>
      ),
    },
    {
      key: 'feePerYear',
      header: 'Annual fee',
      sortable: true,
      accessor: (row) => row.feePerYear,
      render: (row) => <span className="text-sm text-wcbt-ink">{formatCurrency(row.feePerYear)}</span>,
    },
    {
      key: 'coordinator',
      header: 'Coordinator',
      sortable: true,
      accessor: (row) => row.coordinator,
      render: (row) => (
        <div>
          <p className="text-sm text-wcbt-ink">{row.coordinator}</p>
          <p className="text-xs text-wcbt-muted">Updated {formatDate(row.updatedAt)}</p>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      accessor: (row) => row.status,
      render: (row) => <StatusBadge status={row.status} />,
    },
  ];

  return (
    <>
      <PageHeader
        title="Programs"
        description="Courses offered by the campus, their intake capacity and fees."
        breadcrumb={[{ label: 'Home', to: '/dashboard' }, { label: 'Programs' }]}
        actions={
          <Can permission="programs:add">
            <Button onClick={openCreate}>
              <Plus className="h-4 w-4" aria-hidden="true" /> Add Program
            </Button>
          </Can>
        }
      />

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Programs offered" value={items.length} icon={BookOpen} loading={loading} />
        <StatCard label="Currently running" value={activeCount} icon={GraduationCap} loading={loading} />
        <StatCard label="Seats per intake" value={totalSeats} icon={Users} loading={loading} />
      </div>

      <DataTable
        columns={columns}
        data={filtered}
        rowKey={(row) => row.id}
        loading={loading}
        searchable
        searchPlaceholder="Search programs…"
        caption="Academic programs"
        filters={
          <>
            <Select
              value={level}
              onChange={(event) => setLevel(event.target.value)}
              aria-label="Filter by level"
              className="w-full sm:w-40"
            >
              <option value="all">All levels</option>
              {PROGRAM_LEVELS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </Select>
            <Select
              value={status}
              onChange={(event) => setStatus(event.target.value)}
              aria-label="Filter by status"
              className="w-full sm:w-36"
            >
              <option value="all">All statuses</option>
              {PROGRAM_STATUSES.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </Select>
          </>
        }
        empty={{
          icon: <BookOpen className="h-6 w-6" aria-hidden="true" />,
          title: 'No programs found',
          message: 'Adjust the filters, or add the first program offered by the campus.',
          action: (
            <Can permission="programs:add">
              <Button onClick={openCreate}>
                <Plus className="h-4 w-4" aria-hidden="true" /> Add Program
              </Button>
            </Can>
          ),
        }}
        rowActions={(row) => (
          <Dropdown
            menuLabel={`Actions for ${row.code}`}
            trigger={({ toggle }) => (
              <button
                type="button"
                onClick={toggle}
                aria-label={`Actions for ${row.code}`}
                className="rounded-lg p-1.5 text-wcbt-muted transition-colors hover:bg-wcbt-cream hover:text-wcbt-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-wcbt-maroon"
              >
                <MoreVertical className="h-4 w-4" />
              </button>
            )}
          >
            <DropdownItem
              icon={<Pencil className="h-4 w-4" />}
              onSelect={() => {
                setEditing(row);
                setPanelOpen(true);
              }}
            >
              Edit
            </DropdownItem>
            <DropdownItem
              icon={<Power className="h-4 w-4" />}
              onSelect={async () => {
                await toggleStatus(row.id);
                toast({
                  title:
                    row.status === 'Active'
                      ? `${row.code} closed for new applications`
                      : `${row.code} is open for applications`,
                });
              }}
            >
              {row.status === 'Active' ? 'Mark inactive' : 'Mark active'}
            </DropdownItem>
            <DropdownDivider />
            <DropdownItem icon={<Trash2 className="h-4 w-4" />} danger onSelect={() => setPendingDelete(row)}>
              Delete
            </DropdownItem>
          </Dropdown>
        )}
      />

      <ProgramPanel
        open={panelOpen}
        onClose={() => {
          setPanelOpen(false);
          setEditing(null);
        }}
        editing={editing}
        takenCodes={items.map((item) => item.code)}
        onSubmit={async (draft) => {
          if (editing) {
            await updateProgram(editing.id, draft);
            toast({ title: `${draft.code} updated` });
          } else {
            await createProgram(draft);
            toast({ title: `${draft.code} added to the program list` });
          }
        }}
      />

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        onClose={() => setPendingDelete(null)}
        onConfirm={async () => {
          if (!pendingDelete) return;
          await removeProgram(pendingDelete.id);
          toast({ title: `${pendingDelete.code} deleted` });
        }}
        title="Delete program?"
        message={
          <>
            <span className="font-medium text-wcbt-ink">{pendingDelete?.name}</span> will no longer be
            selectable on applications.{' '}
            {(applicationCounts.get(pendingDelete?.code ?? '') ?? 0) > 0
              ? `${applicationCounts.get(pendingDelete?.code ?? '')} existing applications keep this program on record — mark it inactive instead if the intake is only paused.`
              : 'Mark it inactive instead if the intake is only paused.'}
          </>
        }
      />
    </>
  );
}
