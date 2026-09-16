import type { LucideIcon } from 'lucide-react';
import { TrendingDown, TrendingUp } from 'lucide-react';
import { Skeleton } from '@/components/ui/Skeleton';
import { cn } from '@/lib/utils';

interface StatCardProps {
  label: string;
  value: number | string;
  icon: LucideIcon;
  delta?: { value: string; direction: 'up' | 'down' };
  loading?: boolean;
}

export function StatCard({ label, value, icon: Icon, delta, loading }: StatCardProps) {
  return (
    <article className="wcbt-card flex items-center justify-between p-5">
      <div>
        <p className="wcbt-label">{label}</p>
        {loading ? (
          <Skeleton className="mt-2 h-7 w-16" />
        ) : (
          <p className="mt-1 text-2xl font-bold text-wcbt-ink">{value}</p>
        )}
        {delta && !loading && (
          <span
            className={cn(
              'mt-1.5 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium',
              delta.direction === 'up'
                ? 'bg-wcbt-success/10 text-wcbt-success'
                : 'bg-wcbt-danger/10 text-wcbt-danger',
            )}
          >
            {delta.direction === 'up' ? (
              <TrendingUp className="h-3 w-3" aria-hidden="true" />
            ) : (
              <TrendingDown className="h-3 w-3" aria-hidden="true" />
            )}
            {delta.value}
          </span>
        )}
      </div>
      <span className="rounded-lg bg-wcbt-maroon/10 p-2 text-wcbt-maroon">
        <Icon className="h-5 w-5" aria-hidden="true" />
      </span>
    </article>
  );
}
