import { cn, initialsOf } from '@/lib/utils';

interface AvatarProps {
  name: string;
  src?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const SIZES = {
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-14 w-14 text-base',
  xl: 'h-24 w-24 text-2xl',
};

export function Avatar({ name, src, size = 'md', className }: AvatarProps) {
  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className={cn('rounded-full object-cover', SIZES[size], className)}
      />
    );
  }

  return (
    <span
      aria-hidden="true"
      className={cn(
        'inline-flex items-center justify-center rounded-full bg-wcbt-maroon/10 font-semibold text-wcbt-maroon',
        SIZES[size],
        className,
      )}
    >
      {initialsOf(name)}
    </span>
  );
}
