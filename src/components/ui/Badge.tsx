import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export type BadgeTone = 'maroon' | 'success' | 'warning' | 'danger' | 'neutral' | 'info';

const TONES: Record<BadgeTone, string> = {
  maroon: 'bg-wcbt-maroon/10 text-wcbt-maroon',
  success: 'bg-wcbt-success/10 text-wcbt-success',
  warning: 'bg-wcbt-warning/10 text-wcbt-warning',
  danger: 'bg-wcbt-danger/10 text-wcbt-danger',
  info: 'bg-wcbt-maroon-light/10 text-wcbt-maroon-light',
  neutral: 'bg-wcbt-muted/10 text-wcbt-muted',
};

export function Badge({
  tone = 'neutral',
  children,
  className,
}: {
  tone?: BadgeTone;
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium whitespace-nowrap',
        TONES[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
