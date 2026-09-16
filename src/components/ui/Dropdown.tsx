import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/lib/utils';

interface DropdownProps {
  trigger: (props: { open: boolean; toggle: () => void }) => ReactNode;
  children: ReactNode | ((close: () => void) => ReactNode);
  align?: 'left' | 'right';
  widthClassName?: string;
  menuLabel?: string;
}

/**
 * Menus are portalled and positioned against the trigger rect so they are never clipped by
 * the horizontally scrolling table container they are rendered inside.
 */
export function Dropdown({
  trigger,
  children,
  align = 'right',
  widthClassName = 'w-48',
  menuLabel,
}: DropdownProps) {
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const close = () => setOpen(false);

  useLayoutEffect(() => {
    if (!open || !triggerRef.current || !menuRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const menuRect = menuRef.current.getBoundingClientRect();
    const left = align === 'right' ? rect.right - menuRect.width : rect.left;
    const overflowsBottom = rect.bottom + menuRect.height + 8 > window.innerHeight;

    setPosition({
      top: overflowsBottom ? rect.top - menuRect.height - 6 : rect.bottom + 6,
      left: Math.max(8, Math.min(left, window.innerWidth - menuRect.width - 8)),
    });
  }, [open, align]);

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (!menuRef.current?.contains(target) && !triggerRef.current?.contains(target)) {
        setOpen(false);
      }
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };

    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    window.addEventListener('scroll', close, true);
    window.addEventListener('resize', close);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('scroll', close, true);
      window.removeEventListener('resize', close);
    };
  }, [open]);

  return (
    <>
      <div ref={triggerRef} className="inline-flex">
        {trigger({ open, toggle: () => setOpen((current) => !current) })}
      </div>
      {open &&
        createPortal(
          <div
            ref={menuRef}
            role="menu"
            aria-label={menuLabel}
            style={{ top: position.top, left: position.left }}
            className={cn(
              'fixed z-50 rounded-xl border border-black/5 bg-wcbt-surface p-1 shadow-lg',
              widthClassName,
            )}
            onClick={() => setOpen(false)}
          >
            {typeof children === 'function' ? children(close) : children}
          </div>,
          document.body,
        )}
    </>
  );
}

interface DropdownItemProps {
  onSelect?: () => void;
  icon?: ReactNode;
  danger?: boolean;
  disabled?: boolean;
  children: ReactNode;
}

export function DropdownItem({ onSelect, icon, danger, disabled, children }: DropdownItemProps) {
  return (
    <button
      type="button"
      role="menuitem"
      disabled={disabled}
      onClick={onSelect}
      className={cn(
        'flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-wcbt-maroon',
        disabled && 'cursor-not-allowed opacity-50',
        danger ? 'text-wcbt-danger hover:bg-wcbt-danger/10' : 'text-wcbt-ink hover:bg-wcbt-cream',
      )}
    >
      {icon}
      {children}
    </button>
  );
}

export function DropdownDivider() {
  return <div className="my-1 h-px bg-black/5" role="separator" />;
}
