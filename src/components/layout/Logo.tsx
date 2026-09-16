import crestBrand from '@/assets/brand/wcbt-crest.png';
import crestLight from '@/assets/brand/wcbt-crest-light.png';
import lockupBrand from '@/assets/brand/wcbt-logo.png';
import lockupLight from '@/assets/brand/wcbt-logo-light.png';
import { cn } from '@/lib/utils';

const SOURCES = {
  crest: { brand: crestBrand, light: crestLight },
  lockup: { brand: lockupBrand, light: lockupLight },
} as const;

type LogoProps = {
  /** `crest` is the shield alone, `lockup` adds the WCBT wordmark and tagline. */
  variant?: keyof typeof SOURCES;
  /** `light` is the reversed artwork; its counters are knocked out so maroon shows through. */
  tone?: 'brand' | 'light';
  /** Leave empty where adjacent copy already names the college. */
  alt?: string;
  className?: string;
};

export function Logo({ variant = 'crest', tone = 'brand', alt = '', className }: LogoProps) {
  return (
    <img
      src={SOURCES[variant][tone]}
      alt={alt}
      aria-hidden={alt === '' || undefined}
      draggable={false}
      className={cn('w-auto select-none object-contain', variant === 'crest' ? 'h-8' : 'h-9', className)}
    />
  );
}
