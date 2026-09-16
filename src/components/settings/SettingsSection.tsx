import type { ReactNode } from 'react';
import { Button } from '@/components/ui/Button';

interface SettingsSectionProps {
  title: string;
  description?: string;
  children: ReactNode;
  onSave?: () => void;
  saving?: boolean;
  saveLabel?: string;
}

export function SettingsSection({
  title,
  description,
  children,
  onSave,
  saving,
  saveLabel = 'Save changes',
}: SettingsSectionProps) {
  return (
    <section className="wcbt-card p-6">
      <header className="mb-4">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-wcbt-muted">{title}</h2>
        {description && <p className="mt-1 text-sm text-wcbt-muted">{description}</p>}
      </header>

      {children}

      {onSave && (
        <div className="mt-6 flex justify-end border-t border-black/5 pt-4">
          <Button onClick={onSave} loading={saving}>
            {saveLabel}
          </Button>
        </div>
      )}
    </section>
  );
}
