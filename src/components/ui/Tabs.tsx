import { useRef, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

export interface TabItem {
  value: string;
  label: string;
  icon?: ReactNode;
  badge?: ReactNode;
}

interface TabsProps {
  items: TabItem[];
  value: string;
  onChange: (value: string) => void;
  orientation?: 'horizontal' | 'vertical';
  className?: string;
  ariaLabel?: string;
}

export function Tabs({
  items,
  value,
  onChange,
  orientation = 'horizontal',
  className,
  ariaLabel,
}: TabsProps) {
  const listRef = useRef<HTMLDivElement>(null);

  const onKeyDown = (event: React.KeyboardEvent) => {
    const forward = orientation === 'horizontal' ? 'ArrowRight' : 'ArrowDown';
    const backward = orientation === 'horizontal' ? 'ArrowLeft' : 'ArrowUp';
    if (event.key !== forward && event.key !== backward) return;

    event.preventDefault();
    const index = items.findIndex((item) => item.value === value);
    const delta = event.key === forward ? 1 : -1;
    const next = items[(index + delta + items.length) % items.length];
    onChange(next.value);
    listRef.current
      ?.querySelectorAll<HTMLButtonElement>('[role="tab"]')
      [items.indexOf(next)]?.focus();
  };

  return (
    <div
      ref={listRef}
      role="tablist"
      aria-label={ariaLabel}
      aria-orientation={orientation}
      onKeyDown={onKeyDown}
      className={cn(
        orientation === 'horizontal'
          ? 'flex items-center gap-1 overflow-x-auto border-b border-black/5'
          : 'flex flex-col gap-1',
        className,
      )}
    >
      {items.map((item) => {
        const active = item.value === value;
        return (
          <button
            key={item.value}
            type="button"
            role="tab"
            aria-selected={active}
            tabIndex={active ? 0 : -1}
            onClick={() => onChange(item.value)}
            className={cn(
              'inline-flex items-center gap-2 whitespace-nowrap text-sm font-medium transition-colors',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-wcbt-maroon',
              orientation === 'horizontal'
                ? cn(
                    'border-b-2 px-4 py-2.5 -mb-px',
                    active
                      ? 'border-wcbt-maroon text-wcbt-maroon'
                      : 'border-transparent text-wcbt-muted hover:text-wcbt-ink',
                  )
                : cn(
                    'rounded-lg px-3 py-2 text-left',
                    active
                      ? 'bg-wcbt-maroon/10 text-wcbt-maroon'
                      : 'text-wcbt-muted hover:bg-wcbt-cream hover:text-wcbt-ink',
                  ),
            )}
          >
            {item.icon && <span className="inline-flex shrink-0">{item.icon}</span>}
            {item.label}
            {item.badge}
          </button>
        );
      })}
    </div>
  );
}

export function TabPanel({
  value,
  active,
  children,
  className,
}: {
  value: string;
  active: boolean;
  children: ReactNode;
  className?: string;
}) {
  if (!active) return null;
  return (
    <div role="tabpanel" id={`panel-${value}`} className={className}>
      {children}
    </div>
  );
}
