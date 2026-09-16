import { useEffect, useRef, useState } from 'react';
import { Bold, Italic, Link2, List, ListOrdered } from 'lucide-react';
import { cn } from '@/lib/utils';
import { sanitizeHtml } from '@/lib/sanitize';

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  invalid?: boolean;
  id?: string;
  ariaLabel?: string;
}

const TOOLBAR = [
  { command: 'bold', label: 'Bold', icon: Bold },
  { command: 'italic', label: 'Italic', icon: Italic },
  { command: 'insertUnorderedList', label: 'Bullet list', icon: List },
  { command: 'insertOrderedList', label: 'Numbered list', icon: ListOrdered },
] as const;

/**
 * Lightweight contentEditable editor covering the bold/italic/list/link needs of notices.
 * Output is sanitised on both write and render.
 */
export function RichTextEditor({
  value,
  onChange,
  placeholder = 'Write the notice…',
  invalid,
  id,
  ariaLabel = 'Notification message',
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [empty, setEmpty] = useState(!value);

  useEffect(() => {
    const editor = editorRef.current;
    if (editor && editor.innerHTML !== value) {
      editor.innerHTML = sanitizeHtml(value);
      setEmpty(!editor.textContent?.trim());
    }
  }, [value]);

  const exec = (command: string, argument?: string) => {
    editorRef.current?.focus();
    document.execCommand(command, false, argument);
    emit();
  };

  const emit = () => {
    const editor = editorRef.current;
    if (!editor) return;
    setEmpty(!editor.textContent?.trim());
    onChange(sanitizeHtml(editor.innerHTML));
  };

  return (
    <div
      className={cn(
        'overflow-hidden rounded-lg border border-black/10 bg-wcbt-surface focus-within:border-wcbt-maroon',
        invalid && 'border-wcbt-danger',
      )}
    >
      <div className="flex items-center gap-0.5 border-b border-black/5 bg-wcbt-cream/60 px-1.5 py-1">
        {TOOLBAR.map(({ command, label, icon: Icon }) => (
          <button
            key={command}
            type="button"
            title={label}
            aria-label={label}
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => exec(command)}
            className="rounded-md p-1.5 text-wcbt-muted transition-colors hover:bg-wcbt-maroon/10 hover:text-wcbt-maroon focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-wcbt-maroon"
          >
            <Icon className="h-4 w-4" />
          </button>
        ))}
        <button
          type="button"
          title="Insert link"
          aria-label="Insert link"
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => {
            const url = window.prompt('Link URL (https://…)');
            if (url && /^https?:\/\//i.test(url)) exec('createLink', url);
          }}
          className="rounded-md p-1.5 text-wcbt-muted transition-colors hover:bg-wcbt-maroon/10 hover:text-wcbt-maroon focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-wcbt-maroon"
        >
          <Link2 className="h-4 w-4" />
        </button>
      </div>

      <div className="relative">
        {empty && (
          <span className="pointer-events-none absolute left-3 top-3 text-sm text-wcbt-muted/70">
            {placeholder}
          </span>
        )}
        <div
          id={id}
          ref={editorRef}
          role="textbox"
          aria-label={ariaLabel}
          aria-multiline="true"
          contentEditable
          suppressContentEditableWarning
          onInput={emit}
          onBlur={emit}
          className="min-h-[9rem] px-3 py-2.5 text-sm leading-relaxed text-wcbt-ink focus:outline-none [&_a]:text-wcbt-maroon [&_a]:underline [&_ol]:list-decimal [&_ol]:pl-5 [&_ul]:list-disc [&_ul]:pl-5"
        />
      </div>
    </div>
  );
}

export function RichText({ html, className }: { html: string; className?: string }) {
  return (
    <div
      className={cn(
        'text-sm leading-relaxed text-wcbt-ink [&_a]:text-wcbt-maroon [&_a]:underline [&_ol]:list-decimal [&_ol]:pl-5 [&_ul]:list-disc [&_ul]:pl-5',
        className,
      )}
      dangerouslySetInnerHTML={{ __html: sanitizeHtml(html) }}
    />
  );
}
