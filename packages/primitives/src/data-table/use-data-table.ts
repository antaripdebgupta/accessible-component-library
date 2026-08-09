import { useCallback, useMemo, useState, type ReactNode } from 'react';

export type SortDirection = 'asc' | 'desc' | null;

export interface DataTableColumn<T> {
  id: string;
  header: ReactNode;
  cell: (row: T, rowIndex: number) => ReactNode;
  sortable?: boolean;
  sortValue?: (row: T) => string | number;
  align?: 'left' | 'center' | 'right';
  width?: string;
  className?: string;
}

export interface UseDataTableOptions<T> {
  data: T[];
  columns: DataTableColumn<T>[];
  getRowId: (row: T, index: number) => string;
  selectable?: boolean;
  expandable?: boolean;
  pageSize?: number;
  defaultSort?: { columnId: string; direction: SortDirection };
  loading?: boolean;
}

export function useDataTable<T>({
  data,
  columns,
  getRowId,
  selectable = false,
  expandable = false,
  pageSize,
  defaultSort,
  loading = false,
}: UseDataTableOptions<T>) {
  const [sortColumnId, setSortColumnId] = useState<string | undefined>(defaultSort?.columnId);
  const [sortDirection, setSortDirection] = useState<SortDirection>(defaultSort?.direction ?? null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [page, setPage] = useState(0);

  const toggleSort = useCallback(
    (columnId: string) => {
      const column = columns.find((c) => c.id === columnId);
      if (!column?.sortable) return;

      if (sortColumnId !== columnId) {
        setSortColumnId(columnId);
        setSortDirection('asc');
        return;
      }
      // asc -> desc -> unsorted, cycling.
      setSortDirection((current) =>
        current === 'asc' ? 'desc' : current === 'desc' ? null : 'asc',
      );
    },
    [columns, sortColumnId],
  );

  const sortedData = useMemo(() => {
    if (!sortColumnId || !sortDirection) return data;
    const column = columns.find((c) => c.id === sortColumnId);
    if (!column?.sortValue) return data;

    const sorted = [...data].sort((a, b) => {
      const av = column.sortValue!(a);
      const bv = column.sortValue!(b);
      if (av < bv) return -1;
      if (av > bv) return 1;
      return 0;
    });
    return sortDirection === 'desc' ? sorted.reverse() : sorted;
  }, [data, sortColumnId, sortDirection, columns]);

  const totalPages = pageSize ? Math.max(1, Math.ceil(sortedData.length / pageSize)) : 1;
  const clampedPage = Math.min(page, totalPages - 1);

  const pagedData = useMemo(() => {
    if (!pageSize) return sortedData;
    const start = clampedPage * pageSize;
    return sortedData.slice(start, start + pageSize);
  }, [sortedData, pageSize, clampedPage]);

  const pagedIds = useMemo(
    () => pagedData.map((row, i) => getRowId(row, i)),
    [pagedData, getRowId],
  );

  const toggleRowSelection = useCallback((id: string) => {
    setSelectedIds((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const isAllOnPageSelected = pagedIds.length > 0 && pagedIds.every((id) => selectedIds.has(id));
  const isSomeOnPageSelected = pagedIds.some((id) => selectedIds.has(id));

  const toggleSelectAllOnPage = useCallback(() => {
    setSelectedIds((current) => {
      const next = new Set(current);
      const allSelected = pagedIds.every((id) => next.has(id));
      if (allSelected) {
        pagedIds.forEach((id) => next.delete(id));
      } else {
        pagedIds.forEach((id) => next.add(id));
      }
      return next;
    });
  }, [pagedIds]);

  const toggleExpand = useCallback((id: string) => {
    setExpandedIds((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const getSortState = useCallback(
    (columnId: string): SortDirection => (sortColumnId === columnId ? sortDirection : null),
    [sortColumnId, sortDirection],
  );

  return {
    columns,
    pagedData,
    sortedData,
    totalRows: data.length,
    loading,
    selectable,
    expandable,
    page: clampedPage,
    setPage,
    totalPages,
    pageSize,
    getRowId,
    toggleSort,
    getSortState,
    selectedIds,
    toggleRowSelection,
    isAllOnPageSelected,
    isSomeOnPageSelected,
    toggleSelectAllOnPage,
    expandedIds,
    toggleExpand,
  };
}

export type UseDataTableReturn<T> = ReturnType<typeof useDataTable<T>>;
