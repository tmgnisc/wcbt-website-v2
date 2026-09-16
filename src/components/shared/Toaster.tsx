import { CheckCircle2, Info, X, XCircle } from 'lucide-react';
import { useToast, type ToastVariant } from '@/context/ToastContext';
import { cn } from '@/lib/utils';

const VARIANT_STYLES: Record<ToastVariant, { border: string; icon: typeof Info; iconClass: string }> = {
  success: { border: 'border-l-4 border-wcbt-success', icon: CheckCircle2, iconClass: 'text-wcbt-success' },
  error: { border: 'border-l-4 border-wcbt-danger', icon: XCircle, iconClass: 'text-wcbt-danger' },
  info: { border: 'border-l-4 border-wcbt-maroon', icon: Info, iconClass: 'text-wcbt-maroon' },
};

export function Toaster() {
  const { toasts, dismiss } = useToast();

  return (
    <div
      aria-live="polite"
      aria-atomic="false"
      className="pointer-events-none fixed bottom-4 right-4 z-[60] flex w-full max-w-sm flex-col gap-2"
    >
      {toasts.map((toast) => {
        const { border, icon: Icon, iconClass } = VARIANT_STYLES[toast.variant];
        return (
          <div
            key={toast.id}
            role="status"
            className={cn(
              'pointer-events-auto flex items-start gap-3 rounded-xl bg-wcbt-surface p-3 shadow-lg',
              border,
            )}
          >
            <Icon className={cn('mt-0.5 h-4.5 w-4.5 shrink-0', iconClass)} aria-hidden="true" />
            <div className="flex-1">
              <p className="text-sm font-medium text-wcbt-ink">{toast.title}</p>
              {toast.description && <p className="text-xs text-wcbt-muted">{toast.description}</p>}
            </div>
            <button
              type="button"
              onClick={() => dismiss(toast.id)}
              aria-label="Dismiss notification"
              className="rounded p-0.5 text-wcbt-muted transition-colors hover:text-wcbt-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-wcbt-maroon"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
