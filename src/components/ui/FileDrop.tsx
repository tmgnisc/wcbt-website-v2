import { useRef, useState } from 'react';
import { Download, FileText, Trash2, UploadCloud } from 'lucide-react';
import { Button } from './Button';
import type { FileRecord } from '@/types/common';
import { cn, createId, formatFileSize } from '@/lib/utils';

interface FileDropProps {
  files: FileRecord[];
  onChange: (files: FileRecord[]) => void;
  accept?: string;
  multiple?: boolean;
  label?: string;
  hint?: string;
  disabled?: boolean;
}

function toRecord(file: File): FileRecord {
  return {
    id: createId('file'),
    name: file.name,
    size: file.size,
    mimeType: file.type || 'application/octet-stream',
    uploadedAt: new Date().toISOString(),
    url: URL.createObjectURL(file),
  };
}

export function FileDrop({
  files,
  onChange,
  accept = '.pdf,image/*',
  multiple = true,
  label = 'Drag and drop files here',
  hint = 'PDF or image, up to 10 MB each',
  disabled,
}: FileDropProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const addFiles = (list: FileList | null) => {
    if (!list || list.length === 0) return;
    const records = Array.from(list).map(toRecord);
    onChange(multiple ? [...files, ...records] : records.slice(0, 1));
  };

  return (
    <div className="space-y-3">
      <div
        onDragOver={(event) => {
          event.preventDefault();
          if (!disabled) setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(event) => {
          event.preventDefault();
          setDragging(false);
          if (!disabled) addFiles(event.dataTransfer.files);
        }}
        className={cn(
          'rounded-xl border-2 border-dashed p-6 text-center transition-colors',
          dragging ? 'border-wcbt-maroon bg-wcbt-maroon/5' : 'border-wcbt-maroon/30 bg-wcbt-cream/40',
          disabled && 'opacity-60',
        )}
      >
        <UploadCloud className="mx-auto h-6 w-6 text-wcbt-maroon" aria-hidden="true" />
        <p className="mt-2 text-sm font-medium text-wcbt-ink">{label}</p>
        <p className="text-xs text-wcbt-muted">{hint}</p>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="mt-3"
          disabled={disabled}
          onClick={() => inputRef.current?.click()}
        >
          Browse files
        </Button>
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          className="sr-only"
          onChange={(event) => {
            addFiles(event.target.files);
            event.target.value = '';
          }}
        />
      </div>

      {files.length > 0 && (
        <ul className="divide-y divide-black/5 rounded-xl border border-black/5">
          {files.map((file) => (
            <li key={file.id} className="flex items-center gap-3 px-3 py-2.5">
              <FileText className="h-4 w-4 shrink-0 text-wcbt-maroon" aria-hidden="true" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm text-wcbt-ink">{file.name}</p>
                <p className="text-xs text-wcbt-muted">{formatFileSize(file.size)}</p>
              </div>
              {file.url && (
                <a
                  href={file.url}
                  download={file.name}
                  aria-label={`Download ${file.name}`}
                  className="rounded-lg p-1.5 text-wcbt-muted transition-colors hover:bg-wcbt-cream hover:text-wcbt-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-wcbt-maroon"
                >
                  <Download className="h-4 w-4" />
                </a>
              )}
              <button
                type="button"
                onClick={() => onChange(files.filter((item) => item.id !== file.id))}
                aria-label={`Remove ${file.name}`}
                className="rounded-lg p-1.5 text-wcbt-muted transition-colors hover:bg-wcbt-danger/10 hover:text-wcbt-danger focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-wcbt-maroon"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

interface PhotoDropProps {
  value?: string;
  onChange: (url?: string) => void;
  name: string;
  shape?: 'circle' | 'square';
}

export function PhotoDrop({ value, onChange, name, shape = 'circle' }: PhotoDropProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="flex items-center gap-4">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        onDragOver={(event) => event.preventDefault()}
        onDrop={(event) => {
          event.preventDefault();
          const file = event.dataTransfer.files?.[0];
          if (file) onChange(URL.createObjectURL(file));
        }}
        className={cn(
          'flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden border-2 border-dashed border-wcbt-maroon/30 bg-wcbt-cream/40 text-xs text-wcbt-muted transition-colors hover:border-wcbt-maroon focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-wcbt-maroon',
          shape === 'circle' ? 'rounded-full' : 'rounded-xl',
        )}
        aria-label={`Upload photo for ${name || 'this record'}`}
      >
        {value ? (
          <img src={value} alt="" className="h-full w-full object-cover" />
        ) : (
          <span className="px-2 text-center">Drop photo</span>
        )}
      </button>
      <div className="space-y-2">
        <Button type="button" variant="outline" size="sm" onClick={() => inputRef.current?.click()}>
          Choose photo
        </Button>
        {value && (
          <Button type="button" variant="ghost" size="sm" onClick={() => onChange(undefined)}>
            Remove
          </Button>
        )}
        <p className="text-xs text-wcbt-muted">Square JPG or PNG, at least 400×400.</p>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="sr-only"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) onChange(URL.createObjectURL(file));
          event.target.value = '';
        }}
      />
    </div>
  );
}
