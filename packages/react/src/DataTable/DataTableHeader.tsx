import { ChevronsUpDown, ChevronUp, ChevronDown } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import { useDataTableContext } from './DataTable';
import { DataTableCheckbox } from './DataTableCheckbox';

export function DataTableHeader<T>() {
  const {
    columns,
    selectable,
    expandable,
    toggleSort,
    getSortState,
    isAllOnPageSelected,
    isSomeOnPageSelected,
    toggleSelectAllOnPage,
  } = useDataTableContext<T>();

  return (
    <thead className="hidden md:table-header-group">
      <tr className="border-border bg-surface-raised border-b">
        {selectable && (
          <th scope="col" className="w-10 px-3 py-2.5 text-left">
            <DataTableCheckbox
              checked={isAllOnPageSelected}
              indeterminate={isSomeOnPageSelected && !isAllOnPageSelected}
              onChange={toggleSelectAllOnPage}
              aria-label="Select all rows on this page"
            />
          </th>
        )}
        {expandable && <th scope="col" className="w-10 px-2 py-2.5" aria-hidden="true" />}
        {columns.map((column) => {
          const sortState = getSortState(column.id);
          return (
            <th
              key={column.id}
              scope="col"
              aria-sort={
                sortState === 'asc'
                  ? 'ascending'
                  : sortState === 'desc'
                    ? 'descending'
                    : column.sortable
                      ? 'none'
                      : undefined
              }
              style={{ width: column.width }}
              className={twMerge(
                'text-text-secondary px-3 py-2.5 text-left text-sm font-medium',
                column.align === 'center' && 'text-center',
                column.align === 'right' && 'text-right',
              )}
            >
              {column.sortable ? (
                <button
                  type="button"
                  onClick={() => toggleSort(column.id)}
                  className="focus-ring-safe rounded-control hover:text-text-primary inline-flex items-center gap-1 outline-none"
                >
                  {column.header}
                  {sortState === 'asc' && <ChevronUp size={14} aria-hidden="true" />}
                  {sortState === 'desc' && <ChevronDown size={14} aria-hidden="true" />}
                  {sortState === null && (
                    <ChevronsUpDown size={14} aria-hidden="true" className="opacity-50" />
                  )}
                </button>
              ) : (
                column.header
              )}
            </th>
          );
        })}
      </tr>
    </thead>
  );
}
DataTableHeader.displayName = 'DataTableHeader';
