import { cn } from '@/lib/utils';

/**
 * Shield/crest motif from the WCBT logo — book, bar chart and circuit nodes — drawn inline so
 * it inherits `currentColor` on both the maroon sidebar and the cream login panel.
 */
export function WcbtCrest({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 64 72"
      fill="none"
      aria-hidden="true"
      className={cn('h-8 w-8', className)}
    >
      <path
        d="M32 2 60 11v27c0 16-11.6 26.5-28 32C15.6 64.5 4 54 4 38V11L32 2Z"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinejoin="round"
      />
      <path d="M17 44V32M27 44V25M37 44V29M47 44V21" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      <path d="M15 52h34" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      <circle cx="27" cy="25" r="3" fill="currentColor" />
      <circle cx="47" cy="21" r="3" fill="currentColor" />
    </svg>
  );
}
