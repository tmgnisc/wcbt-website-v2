import { useMemo, useState, type ReactNode } from 'react';
import { ArrowDown, ArrowUp, ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { EmptyState } from './EmptyState';
import { Input } from '@/components/ui/Field';
import { SkeletonRows } from '@/components/ui/Skeleton';
import { cn } from '@/lib/utils';

export interface Column<T> {
  key: string;
  header: ReactNode;
  render?: (row: T) => ReactNode;
  /** Plain value used for sorting and the built-in search index. */
  accessor?: (row: T) => string | number;
  sortable?: boolean;
  className?: string;
  headerClassName?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  rowKey: (row: T) => string;
  loading?: boolean;
  searchable?: boolean;
  searchPlaceholder?: string;
  /** Extra filter controls rendered next to the search box. */
  filters?: ReactNode;
  toolbarActions?: ReactNode;
  pageSize?: number;
  onRowClick?: (row: T) => void;
  rowActions?: (row: T) => ReactNode;
  selectable?: boolean;
  selectedIds?: string[];
  onSelectionChange?: (ids: string[]) => void;
  bulkActions?: (ids: string[]) => ReactNode;
  empty?: { icon?: ReactNode; title: string; message?: string; action?: ReactNode };
  caption?: string;
}

type SortState = { key: string; direction: 'asc' | 'desc' } | null;

export function DataTable<T>({
  columns,
  data,
  rowKey,
  loading = false,
  searchable = false,
  searchPlaceholder = 'Search…',
  filters,
  toolbarActions,
  pageSize = 10,
  onRowClick,
  rowActions,
  selectable = false,
  selectedIds = [],
  onSelectionChange,
  bulkActions,
  empty,
  caption,
}: DataTableProps<T>) {
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<SortState>(null);
  const [page, setPage] = useState(1);

  const searchIndex = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return data;
    return data.filter((row) =>
      columns.some((column) => {
        const value = column.accessor?.(row);
        return value !== undefined && String(value).toLowerCase().includes(term);
      }),
    );
  }, [data, search, columns]);

  const sorted = useMemo(() => {
    if (!sort) return searchIndex;
    const column = columns.find((item) => item.key === sort.key);
    if (!column?.accessor) return searchIndex;

    return [...searchIndex].sort((a, b) => {
      const left = column.accessor!(a);
      const right = column.accessor!(b);
      const comparison =
        typeof left === 'number' && typeof right === 'number'
          ? left - right
          : String(left).localeCompare(String(right));
      return sort.direction === 'asc' ? comparison : -comparison;
    });
  }, [searchIndex, sort, columns]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  // Derived rather than stored, so deleting the last row of a page falls back gracefully.
  const currentPage = Math.min(page, totalPages);
  const pageRows = sorted.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const pageIds = pageRows.map(rowKey);
  const allOnPageSelected = pageIds.length > 0 && pageIds.every((id) => selectedIds.includes(id));

  const toggleSort = (column: Column<T>) => {
    if (!column.sortable || !column.accessor) return;
    setSort((current) => {
      if (current?.key !== column.key) return { key: column.key, direction: 'asc' };
      return current.direction === 'asc'
        ? { key: column.key, direction: 'desc' }
        : null;
    });
  };

  const toggleRow = (id: string) => {
    if (!onSelectionChange) return;
    onSelectionChange(
      selectedIds.includes(id) ? selectedIds.filter((item) => item !== id) : [...selectedIds, id],
    );
  };

  const togglePage = () => {
    if (!onSelectionChange) return;
    onSelectionChange(
      allOnPageSelected
        ? selectedIds.filter((id) => !pageIds.includes(id))
        : Array.from(new Set([...selectedIds, ...pageIds])),
    );
  };

  const columnCount = columns.length + (selectable ? 1 : 0) + (rowActions ? 1 : 0);
  const rangeStart = sorted.length === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const rangeEnd = Math.min(currentPage * pageSize, sorted.length);

  return (
    <section className="wcbt-card overflow-hidden">
      {(searchable || filters || toolbarActions) && (
        <div className="flex flex-col gap-3 border-b border-black/5 p-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
            {searchable && (
              <div className="relative">
                <Search
                  className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-wcbt-muted"
                  aria-hidden="true"
                />
                <Input
                  type="search"
                  value={search}
                  onChange={(event) => {
                    setSearch(event.target.value);
                    setPage(1);
                  }}
                  placeholder={searchPlaceholder}
                  aria-label={searchPlaceholder}
                  className="w-full pl-9 sm:w-64"
                />
              </div>
            )}
            {filters}
          </div>
          {toolbarActions && <div className="flex flex-wrap items-center gap-2">{toolbarActions}</div>}
        </div>
      )}

      {selectable && selectedIds.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-black/5 bg-wcbt-maroon/5 px-4 py-2.5">
          <p className="text-sm font-medium text-wcbt-maroon">{selectedIds.length} selected</p>
          <div className="flex items-center gap-2">{bulkActions?.(selectedIds)}</div>
        </div>
      )}

      {loading ? (
        <SkeletonRows rows={Math.min(pageSize, 6)} columns={Math.min(columnCount, 5)} />
      ) : sorted.length === 0 ? (
        <EmptyState
          icon={empty?.icon}
          title={empty?.title ?? 'Nothing to show yet'}
          message={empty?.message}
          action={empty?.action}
        />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] border-collapse text-left text-sm">
            {caption && <caption className="sr-only">{caption}</caption>}
            <thead>
              <tr className="bg-wcbt-cream text-xs uppercase tracking-wide text-wcbt-muted">
                {selectable && (
                  <th scope="col" className="w-10 px-4 py-3">
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-black/20 accent-wcbt-maroon"
                      checked={allOnPageSelected}
                      onChange={togglePage}
                      aria-label="Select all rows on this page"
                    />
                  </th>
                )}
                {columns.map((column) => (
                  <th
                    key={column.key}
                    scope="col"
                    className={cn('px-4 py-3 font-medium', column.headerClassName)}
                    aria-sort={
                      sort?.key === column.key
                        ? sort.direction === 'asc'
                          ? 'ascending'
                          : 'descending'
                        : undefined
                    }
                  >
                    {column.sortable && column.accessor ? (
                      <button
                        type="button"
                        onClick={() => toggleSort(column)}
                        className="inline-flex items-center gap-1 uppercase transition-colors hover:text-wcbt-maroon focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-wcbt-maroon"
                      >
                        {column.header}
                        {sort?.key === column.key ? (
                          sort.direction === 'asc' ? (
                            <ArrowUp className="h-3 w-3" aria-hidden="true" />
                          ) : (
                            <ArrowDown className="h-3 w-3" aria-hidden="true" />
                          )
                        ) : null}
                      </button>
                    ) : (
                      column.header
                    )}
                  </th>
                ))}
                {rowActions && (
                  <th scope="col" className="w-20 px-4 py-3 text-right font-medium">
                    Actions
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {pageRows.map((row) => {
                const id = rowKey(row);
                return (
                  <tr
                    key={id}
                    onClick={onRowClick ? () => onRowClick(row) : undefined}
                    className={cn(
                      'border-b border-black/5 transition-colors last:border-0',
                      onRowClick && 'cursor-pointer hover:bg-wcbt-cream/50',
                      selectedIds.includes(id) && 'bg-wcbt-maroon/5',
                    )}
                  >
                    {selectable && (
                      <td className="px-4 py-3" onClick={(event) => event.stopPropagation()}>
                        <input
                          type="checkbox"
                          className="h-4 w-4 rounded border-black/20 accent-wcbt-maroon"
                          checked={selectedIds.includes(id)}
                          onChange={() => toggleRow(id)}
                          aria-label={`Select row ${id}`}
                        />
                      </td>
                    )}
                    {columns.map((column) => (
                      <td key={column.key} className={cn('px-4 py-3 align-middle', column.className)}>
                        {column.render ? column.render(row) : String(column.accessor?.(row) ?? '')}
                      </td>
                    ))}
                    {rowActions && (
                      <td className="px-4 py-3 text-right" onClick={(event) => event.stopPropagation()}>
                        {rowActions(row)}
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {!loading && sorted.length > 0 && (
        <div className="flex flex-col items-center justify-between gap-3 border-t border-black/5 px-4 py-3 sm:flex-row">
          <p className="text-xs text-wcbt-muted">
            Showing {rangeStart}–{rangeEnd} of {sorted.length} results
          </p>
          <nav className="flex items-center gap-1" aria-label="Pagination">
            <button
              type="button"
              onClick={() => setPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="inline-flex h-8 items-center gap-1 rounded-lg px-2 text-xs text-wcbt-muted transition-colors hover:bg-wcbt-cream disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-wcbt-maroon"
            >
              <ChevronLeft className="h-3.5 w-3.5" aria-hidden="true" /> Prev
            </button>
            {Array.from({ length: totalPages }).map((_, index) => {
              const pageNumber = index + 1;
              const visible =
                totalPages <= 7 ||
                pageNumber === 1 ||
                pageNumber === totalPages ||
                Math.abs(pageNumber - currentPage) <= 1;
              if (!visible) {
                return pageNumber === 2 || pageNumber === totalPages - 1 ? (
                  <span key={pageNumber} className="px-1 text-xs text-wcbt-muted">
                    …
                  </span>
                ) : null;
              }
              return (
                <button
                  key={pageNumber}
                  type="button"
                  onClick={() => setPage(pageNumber)}
                  aria-current={pageNumber === currentPage ? 'page' : undefined}
                  className={cn(
                    'h-8 min-w-8 rounded-lg px-2 text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-wcbt-maroon',
                    pageNumber === currentPage
                      ? 'bg-wcbt-maroon text-white'
                      : 'text-wcbt-muted hover:bg-wcbt-cream',
                  )}
                >
                  {pageNumber}
                </button>
              );
            })}
            <button
              type="button"
              onClick={() => setPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="inline-flex h-8 items-center gap-1 rounded-lg px-2 text-xs text-wcbt-muted transition-colors hover:bg-wcbt-cream disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-wcbt-maroon"
            >
              Next <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          </nav>
        </div>
      )}
    </section>
  );
}
