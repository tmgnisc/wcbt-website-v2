import { useState, type KeyboardEvent } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TagInputProps {
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  id?: string;
}

/** Free-text multi-tag entry: Enter or comma commits, Backspace removes the last tag. */
export function TagInput({ value, onChange, placeholder = 'Type and press Enter', id }: TagInputProps) {
  const [draft, setDraft] = useState('');

  const commit = () => {
    const tag = draft.trim();
    if (tag && !value.includes(tag)) onChange([...value, tag]);
    setDraft('');
  };

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' || event.key === ',') {
      event.preventDefault();
      commit();
    } else if (event.key === 'Backspace' && draft === '' && value.length > 0) {
      onChange(value.slice(0, -1));
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-1.5 rounded-lg border border-black/10 bg-wcbt-surface p-2 focus-within:border-wcbt-maroon">
      {value.map((tag) => (
        <span
          key={tag}
          className="inline-flex items-center gap-1 rounded-full bg-wcbt-maroon/10 px-2.5 py-0.5 text-xs font-medium text-wcbt-maroon"
        >
          {tag}
          <button
            type="button"
            onClick={() => onChange(value.filter((item) => item !== tag))}
            aria-label={`Remove ${tag}`}
            className="rounded-full p-0.5 hover:bg-wcbt-maroon/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-wcbt-maroon"
          >
            <X className="h-3 w-3" />
          </button>
        </span>
      ))}
      <input
        id={id}
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        onKeyDown={onKeyDown}
        onBlur={commit}
        placeholder={value.length === 0 ? placeholder : ''}
        className="min-w-[8rem] flex-1 bg-transparent px-1 py-0.5 text-sm text-wcbt-ink placeholder:text-wcbt-muted/70 focus:outline-none"
      />
    </div>
  );
}

interface ChipSelectProps<T extends string> {
  options: readonly T[];
  value: T[];
  onChange: (value: T[]) => void;
  ariaLabel?: string;
}

/** Multi-select rendered as toggleable chips, used for notification audiences. */
export function ChipSelect<T extends string>({
  options,
  value,
  onChange,
  ariaLabel,
}: ChipSelectProps<T>) {
  return (
    <div className="flex flex-wrap gap-2" role="group" aria-label={ariaLabel}>
      {options.map((option) => {
        const active = value.includes(option);
        return (
          <button
            key={option}
            type="button"
            aria-pressed={active}
            onClick={() =>
              onChange(active ? value.filter((item) => item !== option) : [...value, option])
            }
            className={cn(
              'rounded-full border px-3 py-1 text-xs font-medium transition-colors',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-wcbt-maroon',
              active
                ? 'border-wcbt-maroon bg-wcbt-maroon text-white'
                : 'border-black/10 bg-wcbt-surface text-wcbt-muted hover:border-wcbt-maroon/40 hover:text-wcbt-ink',
            )}
          >
            {option}
          </button>
        );
      })}
    </div>
  );
}
