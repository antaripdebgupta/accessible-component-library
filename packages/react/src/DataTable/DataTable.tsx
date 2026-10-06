import { createContext, useContext, useMemo, type HTMLAttributes, type ReactNode } from 'react';
import { twMerge } from 'tailwind-merge';
import {
  useDataTable,
  type UseDataTableOptions,
  type UseDataTableReturn,
} from '@antarip/primitives';
import { Pagination } from '../Pagination';

const DataTableContext = createContext<UseDataTableReturn<any> | null>(null);

export function useDataTableContext<T>(): UseDataTableReturn<T> {
  const ctx = useContext(DataTableContext);
  if (!ctx) throw new Error('DataTable subcomponents must be used within <DataTable>');
  return ctx;
}

export interface DataTableProps<T>
  extends UseDataTableOptions<T>, Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  caption: string;
  children: ReactNode;
}

export function DataTable<T>({
  data,
  columns,
  getRowId,
  selectable,
  expandable,
  pageSize,
  defaultSort,
  loading,
  caption,
  className,
  children,
  ...props
}: DataTableProps<T>) {
  const table = useDataTable({
    data,
    columns,
    getRowId,
    selectable,
    expandable,
    pageSize,
    defaultSort,
    loading,
  });
  const contextValue = useMemo(() => table, [table]);
  const { page, setPage, totalPages } = table;

  return (
    <DataTableContext.Provider value={contextValue}>
      <div className={twMerge('w-full', className)} {...props}>
        <div
          role="region"
          aria-label={caption}
          tabIndex={0}
          className="shadow-xs w-full overflow-x-auto rounded-popover border border-border bg-surface focus:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-inset"
        >
          <table className="w-full min-w-[36rem] border-collapse text-sm">
            <caption className="sr-only">{caption}</caption>
            {children}
          </table>
        </div>
        {pageSize && totalPages > 1 && (
          <div className="mt-3 flex justify-end">
            <Pagination
              currentPage={page + 1}
              pageCount={totalPages}
              onPageChange={(p) => setPage(p - 1)}
            />
          </div>
        )}
      </div>
    </DataTableContext.Provider>
  );
}
DataTable.displayName = 'DataTable';
