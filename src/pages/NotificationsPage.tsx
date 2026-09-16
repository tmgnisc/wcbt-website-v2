import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Archive, Bell, Copy, Eye, MoreVertical, Pencil, Plus, Send, Trash2 } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { DataTable, type Column } from '@/components/shared/DataTable';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { Modal } from '@/components/shared/Modal';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Can } from '@/components/shared/Can';
import { NotificationPanel } from '@/components/notifications/NotificationPanel';
import { Button } from '@/components/ui/Button';
import { Dropdown, DropdownDivider, DropdownItem } from '@/components/ui/Dropdown';
import { Input, Select } from '@/components/ui/Field';
import { RichText } from '@/components/ui/RichTextEditor';
import { useToast } from '@/context/ToastContext';
import { useAuth } from '@/context/AuthContext';
import { useNotificationsStore } from '@/store/notifications';
import {
  NOTIFICATION_AUDIENCES,
  NOTIFICATION_CATEGORIES,
  NOTIFICATION_STATUSES,
  type Notification,
} from '@/types/notification';
import { formatDate } from '@/lib/utils';
import { htmlToText } from '@/lib/sanitize';

export function NotificationsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { toast } = useToast();
  const { user } = useAuth();

  const items = useNotificationsStore((state) => state.items);
  const loading = useNotificationsStore((state) => state.loading);
  const load = useNotificationsStore((state) => state.load);
  const createNotification = useNotificationsStore((state) => state.create);
  const updateNotification = useNotificationsStore((state) => state.update);
  const removeNotification = useNotificationsStore((state) => state.remove);
  const removeMany = useNotificationsStore((state) => state.removeMany);
  const archiveMany = useNotificationsStore((state) => state.archiveMany);
  const togglePublish = useNotificationsStore((state) => state.togglePublish);
  const duplicate = useNotificationsStore((state) => state.duplicate);

  // `/notifications?new=true` (used by the dashboard quick action) opens the panel on arrival.
  const [panelOpen, setPanelOpen] = useState(() => searchParams.get('new') === 'true');
  const [editing, setEditing] = useState<Notification | null>(null);
  const [viewing, setViewing] = useState<Notification | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Notification | null>(null);
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);

  const [category, setCategory] = useState('all');
  const [audience, setAudience] = useState('all');
  const [status, setStatus] = useState('all');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (searchParams.get('new') !== 'true') return;
    const next = new URLSearchParams(searchParams);
    next.delete('new');
    setSearchParams(next, { replace: true });
  }, [searchParams, setSearchParams]);

  const filtered = useMemo(
    () =>
      items.filter((item) => {
        if (category !== 'all' && item.category !== category) return false;
        if (audience !== 'all' && !item.audience.includes(audience as never)) return false;
        if (status !== 'all' && item.status !== status) return false;
        if (from && item.publishDate < from) return false;
        if (to && item.publishDate > to) return false;
        return true;
      }),
    [items, category, audience, status, from, to],
  );

  const openCreate = () => {
    setEditing(null);
    setPanelOpen(true);
  };

  const columns: Column<Notification>[] = [
    {
      key: 'title',
      header: 'Title',
      sortable: true,
      accessor: (row) => row.title,
      className: 'max-w-[280px]',
      render: (row) => (
        <div className="max-w-[280px]">
          <p className="truncate font-medium text-wcbt-ink" title={row.title}>
            {row.title}
          </p>
          <p className="truncate text-xs text-wcbt-muted">{htmlToText(row.message)}</p>
        </div>
      ),
    },
    {
      key: 'category',
      header: 'Category',
      accessor: (row) => row.category,
      render: (row) => <StatusBadge status={row.category} />,
    },
    {
      key: 'audience',
      header: 'Audience',
      accessor: (row) => row.audience.join(', '),
      render: (row) => <span className="text-xs text-wcbt-muted">{row.audience.join(', ')}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      accessor: (row) => row.status,
      render: (row) => <StatusBadge status={row.status} />,
    },
    {
      key: 'publishDate',
      header: 'Published',
      sortable: true,
      accessor: (row) => row.publishDate,
      render: (row) => <span className="text-sm text-wcbt-muted">{formatDate(row.publishDate)}</span>,
    },
    {
      key: 'expiryDate',
      header: 'Expires',
      sortable: true,
      accessor: (row) => row.expiryDate ?? '',
      render: (row) => <span className="text-sm text-wcbt-muted">{formatDate(row.expiryDate)}</span>,
    },
  ];

  return (
    <>
      <PageHeader
        title="Notices"
        description="Create, publish and archive campus notices."
        breadcrumb={[{ label: 'Home', to: '/dashboard' }, { label: 'Notices' }]}
        actions={
          <Can permission="notifications:add">
            <Button onClick={openCreate}>
              <Plus className="h-4 w-4" aria-hidden="true" /> Add Notice
            </Button>
          </Can>
        }
      />

      <DataTable
        columns={columns}
        data={filtered}
        rowKey={(row) => row.id}
        loading={loading}
        searchable
        searchPlaceholder="Search notices…"
        caption="Campus notices"
        selectable
        selectedIds={selected}
        onSelectionChange={setSelected}
        filters={
          <>
            <Select
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              aria-label="Filter by category"
              className="w-full sm:w-40"
            >
              <option value="all">All categories</option>
              {NOTIFICATION_CATEGORIES.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </Select>
            <Select
              value={audience}
              onChange={(event) => setAudience(event.target.value)}
              aria-label="Filter by audience"
              className="w-full sm:w-36"
            >
              <option value="all">All audiences</option>
              {NOTIFICATION_AUDIENCES.map((option) => (
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
              {NOTIFICATION_STATUSES.map((option) => (
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
                aria-label="Published from"
                className="w-full sm:w-36"
              />
              <span className="text-xs text-wcbt-muted">to</span>
              <Input
                type="date"
                value={to}
                onChange={(event) => setTo(event.target.value)}
                aria-label="Published to"
                className="w-full sm:w-36"
              />
            </div>
          </>
        }
        bulkActions={(ids) => (
          <>
            <Button
              variant="subtle"
              size="sm"
              onClick={async () => {
                await archiveMany(ids);
                setSelected([]);
                toast({ title: `${ids.length} notices archived` });
              }}
            >
              <Archive className="h-3.5 w-3.5" aria-hidden="true" /> Archive
            </Button>
            <Can permission="notifications:delete">
              <Button variant="danger" size="sm" onClick={() => setBulkDeleteOpen(true)}>
                <Trash2 className="h-3.5 w-3.5" aria-hidden="true" /> Delete
              </Button>
            </Can>
          </>
        )}
        empty={{
          icon: <Bell className="h-6 w-6" aria-hidden="true" />,
          title: 'No notices found',
          message: 'Adjust the filters, or publish the first notice for this session.',
          action: (
            <Can permission="notifications:add">
              <Button onClick={openCreate}>
                <Plus className="h-4 w-4" aria-hidden="true" /> Add Notice
              </Button>
            </Can>
          ),
        }}
        rowActions={(row) => (
          <Dropdown
            menuLabel={`Actions for ${row.title}`}
            trigger={({ toggle }) => (
              <button
                type="button"
                onClick={toggle}
                aria-label={`Actions for ${row.title}`}
                className="rounded-lg p-1.5 text-wcbt-muted transition-colors hover:bg-wcbt-cream hover:text-wcbt-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-wcbt-maroon"
              >
                <MoreVertical className="h-4 w-4" />
              </button>
            )}
          >
            <DropdownItem icon={<Eye className="h-4 w-4" />} onSelect={() => setViewing(row)}>
              View
            </DropdownItem>
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
              icon={<Send className="h-4 w-4" />}
              onSelect={async () => {
                await togglePublish(row.id);
                toast({
                  title: row.status === 'Published' ? 'Notice unpublished' : 'Notice published',
                });
              }}
            >
              {row.status === 'Published' ? 'Unpublish' : 'Publish'}
            </DropdownItem>
            <DropdownItem
              icon={<Copy className="h-4 w-4" />}
              onSelect={async () => {
                await duplicate(row.id);
                toast({ title: 'Duplicated as draft' });
              }}
            >
              Duplicate
            </DropdownItem>
            <DropdownDivider />
            <DropdownItem icon={<Trash2 className="h-4 w-4" />} danger onSelect={() => setPendingDelete(row)}>
              Delete
            </DropdownItem>
          </Dropdown>
        )}
      />

      <NotificationPanel
        open={panelOpen}
        onClose={() => {
          setPanelOpen(false);
          setEditing(null);
        }}
        editing={editing}
        onSubmit={async (draft) => {
          if (editing) {
            await updateNotification(editing.id, draft);
            toast({ title: 'Notice updated' });
          } else {
            await createNotification(draft, user?.name ?? 'Admin');
            toast({ title: 'Notice created' });
          }
        }}
      />

      <Modal
        open={Boolean(viewing)}
        onClose={() => setViewing(null)}
        title={viewing?.title ?? ''}
        size="lg"
        footer={
          <Button variant="ghost" onClick={() => setViewing(null)}>
            Close
          </Button>
        }
      >
        {viewing && (
          <article className="border-l-4 border-wcbt-maroon pl-4">
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge status={viewing.category} />
              <StatusBadge status={viewing.priority} />
              <StatusBadge status={viewing.status} />
            </div>
            <RichText html={viewing.message} className="mt-3" />
            <dl className="mt-4 grid grid-cols-2 gap-3 text-xs text-wcbt-muted">
              <div>
                <dt className="wcbt-label">Audience</dt>
                <dd>{viewing.audience.join(', ')}</dd>
              </div>
              <div>
                <dt className="wcbt-label">Created by</dt>
                <dd>{viewing.createdBy}</dd>
              </div>
              <div>
                <dt className="wcbt-label">Published</dt>
                <dd>{formatDate(viewing.publishDate)}</dd>
              </div>
              <div>
                <dt className="wcbt-label">Expires</dt>
                <dd>{formatDate(viewing.expiryDate)}</dd>
              </div>
            </dl>
          </article>
        )}
      </Modal>

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        onClose={() => setPendingDelete(null)}
        onConfirm={async () => {
          if (!pendingDelete) return;
          await removeNotification(pendingDelete.id);
          toast({ title: 'Notice deleted' });
        }}
        title="Delete notice?"
        message={
          <>
            <span className="font-medium text-wcbt-ink">{pendingDelete?.title}</span> will be removed
            permanently. Published notices disappear from the public site immediately.
          </>
        }
      />

      <ConfirmDialog
        open={bulkDeleteOpen}
        onClose={() => setBulkDeleteOpen(false)}
        onConfirm={async () => {
          await removeMany(selected);
          toast({ title: `${selected.length} notices deleted` });
          setSelected([]);
        }}
        title="Delete selected notices?"
        message={`${selected.length} notices will be removed permanently.`}
      />
    </>
  );
}
