import { createContext, useContext, useMemo, type HTMLAttributes, type ReactNode } from 'react';
import { twMerge } from 'tailwind-merge';
import { useDataTable, type UseDataTableOptions, type UseDataTableReturn } from '@acl/primitives';
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
        <div className="rounded-popover border-border w-full overflow-x-auto border">
          <table className="block w-full border-collapse text-sm md:table">
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
