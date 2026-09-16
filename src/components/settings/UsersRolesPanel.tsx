import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { SettingsSection } from './SettingsSection';
import { DataTable, type Column } from '@/components/shared/DataTable';
import { Modal } from '@/components/shared/Modal';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Button } from '@/components/ui/Button';
import { Field, Input, Select } from '@/components/ui/Field';
import { useToast } from '@/context/ToastContext';
import { PERMISSION_ACTIONS, PERMISSION_MODULES } from '@/data/settings';
import { ROLE_LABELS, type Role } from '@/types/auth';
import type { AdminUser, PermissionMatrix, Settings } from '@/types/settings';
import { createId, formatDateTime } from '@/lib/utils';

interface UsersRolesPanelProps {
  settings: Settings;
  onPatch: <K extends keyof Settings>(section: K, value: Settings[K]) => void;
  onSave: () => void;
  saving: boolean;
}

export function UsersRolesPanel({ settings, onPatch, onSave, saving }: UsersRolesPanelProps) {
  const { toast } = useToast();
  const [addOpen, setAddOpen] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<AdminUser | null>(null);
  const [draft, setDraft] = useState({ name: '', email: '', role: 'staff' as Role });

  const columns: Column<AdminUser>[] = [
    { key: 'name', header: 'Name', sortable: true, accessor: (row) => row.name },
    { key: 'email', header: 'Email', accessor: (row) => row.email },
    {
      key: 'role',
      header: 'Role',
      accessor: (row) => ROLE_LABELS[row.role],
      render: (row) => <StatusBadge status={ROLE_LABELS[row.role]} />,
    },
    {
      key: 'status',
      header: 'Status',
      accessor: (row) => row.status,
      render: (row) => <StatusBadge status={row.status} />,
    },
    {
      key: 'lastLogin',
      header: 'Last login',
      accessor: (row) => row.lastLogin ?? '',
      render: (row) => <span className="text-xs text-wcbt-muted">{formatDateTime(row.lastLogin)}</span>,
    },
  ];

  const togglePermission = (role: Role, module: (typeof PERMISSION_MODULES)[number], action: (typeof PERMISSION_ACTIONS)[number]) => {
    const next: PermissionMatrix = {
      ...settings.permissions,
      [role]: {
        ...settings.permissions[role],
        [module]: {
          ...settings.permissions[role][module],
          [action]: !settings.permissions[role][module][action],
        },
      },
    };
    onPatch('permissions', next);
  };

  return (
    <div className="space-y-4">
      <SettingsSection
        title="Admin users"
        description="People with access to this portal."
      >
        <DataTable
          columns={columns}
          data={settings.users}
          rowKey={(row) => row.id}
          searchable
          searchPlaceholder="Search users…"
          pageSize={5}
          caption="Admin users"
          toolbarActions={
            <Button size="sm" onClick={() => setAddOpen(true)}>
              <Plus className="h-4 w-4" aria-hidden="true" /> Add User
            </Button>
          }
          empty={{ title: 'No admin users', message: 'Add the first portal user.' }}
          rowActions={(row) => (
            <button
              type="button"
              onClick={() => setPendingDelete(row)}
              aria-label={`Remove ${row.name}`}
              className="rounded-lg p-1.5 text-wcbt-muted transition-colors hover:bg-wcbt-danger/10 hover:text-wcbt-danger focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-wcbt-maroon"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        />
      </SettingsSection>

      <SettingsSection
        title="Role permissions"
        description="Module access per role. Changes apply the next time a user signs in."
        onSave={onSave}
        saving={saving}
      >
        <div className="space-y-6">
          {(Object.keys(ROLE_LABELS) as Role[]).map((role) => (
            <div key={role}>
              <h3 className="mb-2 text-sm font-medium text-wcbt-ink">{ROLE_LABELS[role]}</h3>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[520px] text-left text-sm">
                  <thead>
                    <tr className="bg-wcbt-cream text-xs uppercase tracking-wide text-wcbt-muted">
                      <th scope="col" className="px-4 py-2 font-medium">
                        Module
                      </th>
                      {PERMISSION_ACTIONS.map((action) => (
                        <th key={action} scope="col" className="px-4 py-2 font-medium capitalize">
                          {action}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {PERMISSION_MODULES.map((module) => (
                      <tr key={module} className="border-b border-black/5 last:border-0">
                        <th scope="row" className="px-4 py-2 font-normal capitalize text-wcbt-ink">
                          {module}
                        </th>
                        {PERMISSION_ACTIONS.map((action) => (
                          <td key={action} className="px-4 py-2">
                            <input
                              type="checkbox"
                              className="h-4 w-4 rounded border-black/20 accent-wcbt-maroon"
                              checked={settings.permissions[role][module][action]}
                              onChange={() => togglePermission(role, module, action)}
                              disabled={role === 'super_admin'}
                              aria-label={`${ROLE_LABELS[role]} can ${action} ${module}`}
                            />
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      </SettingsSection>

      <Modal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        title="Add admin user"
        footer={
          <>
            <Button variant="ghost" onClick={() => setAddOpen(false)}>
              Cancel
            </Button>
            <Button
              disabled={!draft.name.trim() || !draft.email.includes('@')}
              onClick={() => {
                onPatch('users', [
                  ...settings.users,
                  { id: createId('usr'), name: draft.name, email: draft.email, role: draft.role, status: 'Active' },
                ]);
                setDraft({ name: '', email: '', role: 'staff' });
                setAddOpen(false);
                toast({ title: 'User added' });
              }}
            >
              Add user
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Field label="Full name" htmlFor="user-name" required>
            <Input
              id="user-name"
              value={draft.name}
              onChange={(event) => setDraft({ ...draft, name: event.target.value })}
            />
          </Field>
          <Field label="Email" htmlFor="user-email" required>
            <Input
              id="user-email"
              type="email"
              value={draft.email}
              onChange={(event) => setDraft({ ...draft, email: event.target.value })}
            />
          </Field>
          <Field label="Role" htmlFor="user-role" required>
            <Select
              id="user-role"
              value={draft.role}
              onChange={(event) => setDraft({ ...draft, role: event.target.value as Role })}
            >
              {(Object.keys(ROLE_LABELS) as Role[]).map((role) => (
                <option key={role} value={role}>
                  {ROLE_LABELS[role]}
                </option>
              ))}
            </Select>
          </Field>
        </div>
      </Modal>

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        onClose={() => setPendingDelete(null)}
        title="Remove admin user?"
        message={`${pendingDelete?.name} will immediately lose access to the portal.`}
        confirmLabel="Remove"
        onConfirm={() => {
          onPatch('users', settings.users.filter((user) => user.id !== pendingDelete?.id));
          toast({ title: 'User removed' });
        }}
      />
    </div>
  );
}
