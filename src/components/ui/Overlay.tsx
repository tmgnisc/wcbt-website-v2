import { useEffect, useRef, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/lib/utils';

const FOCUSABLE =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

interface OverlayProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  /** `center` renders a dialog, `right` renders a slide-over panel. */
  placement?: 'center' | 'right';
  labelledBy?: string;
  panelClassName?: string;
}

/**
 * Shared modal surface: portal, backdrop, escape handling, scroll lock and focus trap.
 * Dialog and SidePanel both build on this so behaviour stays identical across modules.
 */
export function Overlay({
  open,
  onClose,
  children,
  placement = 'center',
  labelledBy,
  panelClassName,
}: OverlayProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const restoreFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return;

    restoreFocusRef.current = document.activeElement as HTMLElement | null;
    const { overflow } = document.body.style;
    document.body.style.overflow = 'hidden';

    const panel = panelRef.current;
    const firstFocusable = panel?.querySelector<HTMLElement>(FOCUSABLE);
    (firstFocusable ?? panel)?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.stopPropagation();
        onClose();
        return;
      }
      if (event.key !== 'Tab' || !panelRef.current) return;

      const focusable = Array.from(panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
        (element) => element.offsetParent !== null,
      );
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = overflow;
      restoreFocusRef.current?.focus?.();
    };
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div
      className={cn(
        'fixed inset-0 z-50 flex',
        placement === 'center' ? 'items-center justify-center p-4' : 'justify-end',
      )}
    >
      <div
        className="absolute inset-0 bg-wcbt-ink/40 backdrop-blur-[1px]"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        tabIndex={-1}
        className={cn(
          'relative z-10 bg-wcbt-surface shadow-xl flex flex-col',
          placement === 'center'
            ? 'rounded-xl w-full max-h-[90vh] animate-[fadeIn_120ms_ease-out]'
            : 'h-full w-full max-w-xl border-l border-black/5',
          panelClassName,
        )}
      >
        {children}
      </div>
    </div>,
    document.body,
  );
}
