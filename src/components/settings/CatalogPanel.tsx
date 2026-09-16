import { useState } from 'react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { SettingsSection } from './SettingsSection';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Field';
import { useToast } from '@/context/ToastContext';
import type { CatalogSettings, Settings } from '@/types/settings';
import type { LookupItem } from '@/types/common';
import { createId } from '@/lib/utils';

type CatalogKey = keyof CatalogSettings;

const GROUPS: { key: CatalogKey; label: string; hint: string }[] = [
  { key: 'programs', label: 'Programs', hint: 'Feeds the program select on applications' },
  { key: 'departments', label: 'Departments', hint: 'Feeds the department select on staff records' },
  { key: 'designations', label: 'Designations', hint: 'Job titles available to staff records' },
  { key: 'testTypes', label: 'Admission test types', hint: 'Used when scheduling entrance tests' },
];

interface CatalogPanelProps {
  settings: Settings;
  onPatch: <K extends keyof Settings>(section: K, value: Settings[K]) => void;
  onSave: () => void;
  saving: boolean;
}

export function CatalogPanel({ settings, onPatch, onSave, saving }: CatalogPanelProps) {
  const { toast } = useToast();
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [editing, setEditing] = useState<{ group: CatalogKey; id: string } | null>(null);
  const [pendingDelete, setPendingDelete] = useState<{ group: CatalogKey; item: LookupItem } | null>(null);

  const updateGroup = (group: CatalogKey, items: LookupItem[]) => {
    onPatch('catalog', { ...settings.catalog, [group]: items });
  };

  return (
    <>
      <SettingsSection
        title="Programs & departments"
        description="These lists populate the selects used across Staff and Admissions."
        onSave={onSave}
        saving={saving}
      >
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {GROUPS.map(({ key, label, hint }) => (
            <div key={key} className="rounded-xl border border-black/5 p-4">
              <h3 className="text-sm font-medium text-wcbt-ink">{label}</h3>
              <p className="mb-3 text-xs text-wcbt-muted">{hint}</p>

              <ul className="mb-3 divide-y divide-black/5">
                {settings.catalog[key].map((item) => (
                  <li key={item.id} className="flex items-center gap-2 py-2">
                    {editing?.group === key && editing.id === item.id ? (
                      <Input
                        autoFocus
                        defaultValue={item.name}
                        aria-label={`Rename ${item.name}`}
                        onBlur={(event) => {
                          const name = event.target.value.trim();
                          if (name) {
                            updateGroup(
                              key,
                              settings.catalog[key].map((entry) =>
                                entry.id === item.id ? { ...entry, name } : entry,
                              ),
                            );
                          }
                          setEditing(null);
                        }}
                        onKeyDown={(event) => {
                          if (event.key === 'Enter') event.currentTarget.blur();
                          if (event.key === 'Escape') setEditing(null);
                        }}
                        className="h-8 py-1"
                      />
                    ) : (
                      <>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm text-wcbt-ink">{item.name}</p>
                          {item.description && (
                            <p className="truncate text-xs text-wcbt-muted">{item.description}</p>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => setEditing({ group: key, id: item.id })}
                          aria-label={`Rename ${item.name}`}
                          className="rounded-lg p-1.5 text-wcbt-muted transition-colors hover:bg-wcbt-cream hover:text-wcbt-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-wcbt-maroon"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setPendingDelete({ group: key, item })}
                          aria-label={`Delete ${item.name}`}
                          className="rounded-lg p-1.5 text-wcbt-muted transition-colors hover:bg-wcbt-danger/10 hover:text-wcbt-danger focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-wcbt-maroon"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </>
                    )}
                  </li>
                ))}
                {settings.catalog[key].length === 0 && (
                  <li className="py-3 text-center text-xs text-wcbt-muted">Nothing added yet.</li>
                )}
              </ul>

              <div className="flex items-center gap-2">
                <Input
                  value={drafts[key] ?? ''}
                  onChange={(event) => setDrafts({ ...drafts, [key]: event.target.value })}
                  placeholder={`Add ${label.toLowerCase().replace(/s$/, '')}`}
                  aria-label={`Add to ${label}`}
                  className="h-9 py-1"
                  onKeyDown={(event) => {
                    if (event.key !== 'Enter') return;
                    event.preventDefault();
                    const name = (drafts[key] ?? '').trim();
                    if (!name) return;
                    updateGroup(key, [...settings.catalog[key], { id: createId('lkp'), name }]);
                    setDrafts({ ...drafts, [key]: '' });
                  }}
                />
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    const name = (drafts[key] ?? '').trim();
                    if (!name) return;
                    updateGroup(key, [...settings.catalog[key], { id: createId('lkp'), name }]);
                    setDrafts({ ...drafts, [key]: '' });
                    toast({ title: `${name} added` });
                  }}
                >
                  <Plus className="h-3.5 w-3.5" aria-hidden="true" /> Add
                </Button>
              </div>
            </div>
          ))}
        </div>
      </SettingsSection>

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        onClose={() => setPendingDelete(null)}
        title="Delete entry?"
        message={
          <>
            <span className="font-medium text-wcbt-ink">{pendingDelete?.item.name}</span> will no longer
            be selectable on staff and admission forms. Existing records keep their current value.
          </>
        }
        onConfirm={() => {
          if (!pendingDelete) return;
          updateGroup(
            pendingDelete.group,
            settings.catalog[pendingDelete.group].filter((entry) => entry.id !== pendingDelete.item.id),
          );
          toast({ title: 'Entry deleted' });
        }}
      />
    </>
  );
}
