import { forwardRef, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

const CONTROL_BASE =
  'w-full rounded-lg border border-black/10 bg-wcbt-surface px-3 py-2 text-sm text-wcbt-ink placeholder:text-wcbt-muted/70 transition-colors focus:border-wcbt-maroon focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-wcbt-maroon/40 disabled:bg-wcbt-cream disabled:text-wcbt-muted';

interface FieldProps {
  label?: string;
  htmlFor?: string;
  error?: string;
  hint?: ReactNode;
  required?: boolean;
  className?: string;
  children: ReactNode;
}

export function Field({ label, htmlFor, error, hint, required, className, children }: FieldProps) {
  return (
    <div className={cn('space-y-1.5', className)}>
      {label && (
        <div className="flex items-center justify-between gap-2">
          <label htmlFor={htmlFor} className="text-sm font-medium text-wcbt-ink">
            {label}
            {required && <span className="text-wcbt-danger"> *</span>}
          </label>
          {hint}
        </div>
      )}
      {children}
      {error && (
        <p className="text-xs text-wcbt-danger" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement> & { invalid?: boolean }>(
  function Input({ className, invalid, ...props }, ref) {
    return (
      <input
        ref={ref}
        aria-invalid={invalid || undefined}
        className={cn(CONTROL_BASE, invalid && 'border-wcbt-danger', className)}
        {...props}
      />
    );
  },
);

export const Textarea = forwardRef<
  HTMLTextAreaElement,
  TextareaHTMLAttributes<HTMLTextAreaElement> & { invalid?: boolean }
>(function Textarea({ className, invalid, rows = 4, ...props }, ref) {
  return (
    <textarea
      ref={ref}
      rows={rows}
      aria-invalid={invalid || undefined}
      className={cn(CONTROL_BASE, 'resize-y', invalid && 'border-wcbt-danger', className)}
      {...props}
    />
  );
});

export const Select = forwardRef<
  HTMLSelectElement,
  SelectHTMLAttributes<HTMLSelectElement> & { invalid?: boolean }
>(function Select({ className, invalid, children, ...props }, ref) {
  return (
    <select
      ref={ref}
      aria-invalid={invalid || undefined}
      className={cn(CONTROL_BASE, 'pr-8', invalid && 'border-wcbt-danger', className)}
      {...props}
    >
      {children}
    </select>
  );
});

interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: ReactNode;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(function Checkbox(
  { className, label, id, ...props },
  ref,
) {
  const input = (
    <input
      ref={ref}
      id={id}
      type="checkbox"
      className={cn(
        'h-4 w-4 rounded border-black/20 accent-wcbt-maroon',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-wcbt-maroon',
        className,
      )}
      {...props}
    />
  );

  if (!label) return input;

  return (
    <label htmlFor={id} className="inline-flex cursor-pointer items-center gap-2 text-sm text-wcbt-ink">
      {input}
      {label}
    </label>
  );
});

interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  description?: string;
  disabled?: boolean;
  id?: string;
}

export function Switch({ checked, onChange, label, description, disabled, id }: SwitchProps) {
  return (
    <div className="flex items-center justify-between gap-4">
      {(label || description) && (
        <div>
          {label && (
            <label htmlFor={id} className="text-sm font-medium text-wcbt-ink">
              {label}
            </label>
          )}
          {description && <p className="text-xs text-wcbt-muted">{description}</p>}
        </div>
      )}
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={cn(
          'relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-wcbt-maroon focus-visible:ring-offset-2',
          checked ? 'bg-wcbt-maroon' : 'bg-black/15',
          disabled && 'opacity-50 cursor-not-allowed',
        )}
      >
        <span
          className={cn(
            'inline-block h-4.5 w-4.5 transform rounded-full bg-white shadow transition-transform',
            checked ? 'translate-x-6' : 'translate-x-1',
          )}
        />
      </button>
    </div>
  );
}

interface SegmentedProps<T extends string> {
  value: T;
  options: { label: string; value: T; dotClassName?: string }[];
  onChange: (value: T) => void;
  className?: string;
  ariaLabel?: string;
}

export function Segmented<T extends string>({
  value,
  options,
  onChange,
  className,
  ariaLabel,
}: SegmentedProps<T>) {
  return (
    <div
      role="radiogroup"
      aria-label={ariaLabel}
      className={cn('inline-flex rounded-lg border border-black/10 bg-wcbt-cream p-1', className)}
    >
      {options.map((option) => {
        const active = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(option.value)}
            className={cn(
              'inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-xs font-medium transition-colors',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-wcbt-maroon',
              active ? 'bg-wcbt-maroon text-white shadow-sm' : 'text-wcbt-muted hover:text-wcbt-ink',
            )}
          >
            {option.dotClassName && (
              <span className={cn('h-2 w-2 rounded-full', option.dotClassName)} aria-hidden="true" />
            )}
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
