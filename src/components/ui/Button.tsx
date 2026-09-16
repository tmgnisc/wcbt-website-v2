import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export type ButtonVariant = 'primary' | 'outline' | 'ghost' | 'danger' | 'subtle';
export type ButtonSize = 'sm' | 'md' | 'icon';

const VARIANTS: Record<ButtonVariant, string> = {
  primary: 'bg-wcbt-maroon text-white hover:bg-wcbt-maroon-dark shadow-sm',
  outline:
    'border border-wcbt-maroon text-wcbt-maroon hover:bg-wcbt-maroon hover:text-white bg-transparent',
  ghost: 'text-wcbt-ink hover:bg-wcbt-cream',
  danger: 'bg-wcbt-danger text-white hover:bg-wcbt-danger/90 shadow-sm',
  subtle: 'bg-wcbt-cream text-wcbt-ink hover:bg-wcbt-cream/70 border border-black/5',
};

const SIZES: Record<ButtonSize, string> = {
  sm: 'h-8 px-3 text-xs gap-1.5',
  md: 'h-10 px-4 text-sm gap-2',
  icon: 'h-9 w-9 justify-center',
};

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { className, variant = 'primary', size = 'md', loading = false, disabled, children, ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={cn(
        'inline-flex items-center rounded-lg font-medium transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-wcbt-maroon focus-visible:ring-offset-2',
        'disabled:opacity-60 disabled:pointer-events-none',
        VARIANTS[variant],
        SIZES[size],
        className,
      )}
      {...props}
    >
      {loading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
      {children}
    </button>
  );
});
