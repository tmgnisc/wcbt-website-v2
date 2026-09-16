import { useId, type ReactNode } from 'react';
import { X } from 'lucide-react';
import { Overlay } from '@/components/ui/Overlay';
import { cn } from '@/lib/utils';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const SIZES = {
  sm: 'max-w-sm',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
};

export function Modal({ open, onClose, title, description, children, footer, size = 'md' }: ModalProps) {
  const titleId = useId();

  return (
    <Overlay open={open} onClose={onClose} labelledBy={titleId} panelClassName={cn(SIZES[size])}>
      <header className="flex items-start justify-between gap-4 rounded-t-xl border-b border-black/5 bg-wcbt-cream/60 px-5 py-4">
        <div>
          <h2 id={titleId} className="text-base font-semibold tracking-tight text-wcbt-ink">
            {title}
          </h2>
          {description && <p className="mt-0.5 text-sm text-wcbt-muted">{description}</p>}
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close dialog"
          className="rounded-lg p-1 text-wcbt-muted transition-colors hover:bg-black/5 hover:text-wcbt-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-wcbt-maroon"
        >
          <X className="h-4 w-4" />
        </button>
      </header>

      <div className="flex-1 overflow-y-auto px-5 py-4">{children}</div>

      {footer && (
        <footer className="flex items-center justify-end gap-2 border-t border-black/5 px-5 py-3">
          {footer}
        </footer>
      )}
    </Overlay>
  );
}
