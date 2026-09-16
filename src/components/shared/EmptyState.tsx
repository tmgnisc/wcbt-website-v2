import type { ReactNode } from 'react';
import { Inbox } from 'lucide-react';

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  message?: string;
  action?: ReactNode;
}

export function EmptyState({ icon, title, message, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 px-6 py-14 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-wcbt-maroon/10 text-wcbt-maroon">
        {icon ?? <Inbox className="h-6 w-6" aria-hidden="true" />}
      </span>
      <div>
        <p className="font-semibold tracking-tight text-wcbt-ink">{title}</p>
        {message && <p className="mt-1 max-w-sm text-sm text-wcbt-muted">{message}</p>}
      </div>
      {action}
    </div>
  );
}
