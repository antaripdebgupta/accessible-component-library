import { renderHook, act } from '@testing-library/react';
import { describe, test, expect } from 'vitest';
import { useDataTable, type DataTableColumn } from './use-data-table';

interface Row {
  id: string;
  name: string;
}

const columns: DataTableColumn<Row>[] = [
  {
    id: 'name',
    header: 'Name',
    cell: (row) => row.name,
    sortable: true,
    sortValue: (row) => row.name,
  },
];

const data: Row[] = [
  { id: '1', name: 'Charlie' },
  { id: '2', name: 'Alice' },
  { id: '3', name: 'Bob' },
];

describe('useDataTable — sorting', () => {
  test('toggleSort cycles asc -> desc -> unsorted', () => {
    const { result } = renderHook(() => useDataTable({ data, columns, getRowId: (r) => r.id }));

    act(() => result.current.toggleSort('name'));
    expect(result.current.getSortState('name')).toBe('asc');
    expect(result.current.pagedData.map((r) => r.name)).toEqual(['Alice', 'Bob', 'Charlie']);

    act(() => result.current.toggleSort('name'));
    expect(result.current.getSortState('name')).toBe('desc');
    expect(result.current.pagedData.map((r) => r.name)).toEqual(['Charlie', 'Bob', 'Alice']);

    act(() => result.current.toggleSort('name'));
    expect(result.current.getSortState('name')).toBeNull();
    expect(result.current.pagedData.map((r) => r.name)).toEqual(['Charlie', 'Alice', 'Bob']);
  });

  test('non-sortable column is unaffected by toggleSort', () => {
    const nonSortableColumns: DataTableColumn<Row>[] = [
      { id: 'name', header: 'Name', cell: (row) => row.name },
    ];
    const { result } = renderHook(() =>
      useDataTable({ data, columns: nonSortableColumns, getRowId: (r) => r.id }),
    );
    act(() => result.current.toggleSort('name'));
    expect(result.current.getSortState('name')).toBeNull();
  });

  test('defaultSort applies on initial render', () => {
    const { result } = renderHook(() =>
      useDataTable({
        data,
        columns,
        getRowId: (r) => r.id,
        defaultSort: { columnId: 'name', direction: 'asc' },
      }),
    );
    expect(result.current.pagedData.map((r) => r.name)).toEqual(['Alice', 'Bob', 'Charlie']);
  });
});

describe('useDataTable — selection', () => {
  test('toggleRowSelection adds/removes a single row', () => {
    const { result } = renderHook(() =>
      useDataTable({ data, columns, getRowId: (r) => r.id, selectable: true }),
    );
    act(() => result.current.toggleRowSelection('1'));
    expect(result.current.selectedIds.has('1')).toBe(true);
    act(() => result.current.toggleRowSelection('1'));
    expect(result.current.selectedIds.has('1')).toBe(false);
  });

  test('isAllOnPageSelected / isSomeOnPageSelected reflect partial and full selection', () => {
    const { result } = renderHook(() =>
      useDataTable({ data, columns, getRowId: (r) => r.id, selectable: true }),
    );
    expect(result.current.isAllOnPageSelected).toBe(false);
    expect(result.current.isSomeOnPageSelected).toBe(false);

    act(() => result.current.toggleRowSelection('1'));
    expect(result.current.isAllOnPageSelected).toBe(false);
    expect(result.current.isSomeOnPageSelected).toBe(true);

    act(() => result.current.toggleRowSelection('2'));
    act(() => result.current.toggleRowSelection('3'));
    expect(result.current.isAllOnPageSelected).toBe(true);
  });

  test('toggleSelectAllOnPage selects all when none/some selected, clears when all selected', () => {
    const { result } = renderHook(() =>
      useDataTable({ data, columns, getRowId: (r) => r.id, selectable: true }),
    );
    act(() => result.current.toggleSelectAllOnPage());
    expect(result.current.selectedIds.size).toBe(3);

    act(() => result.current.toggleSelectAllOnPage());
    expect(result.current.selectedIds.size).toBe(0);
  });

  test('select-all only affects rows on the current page', () => {
    const { result } = renderHook(() =>
      useDataTable({ data, columns, getRowId: (r) => r.id, selectable: true, pageSize: 2 }),
    );
    act(() => result.current.toggleSelectAllOnPage());
    expect(result.current.selectedIds.size).toBe(2);
    expect(result.current.selectedIds.has('3')).toBe(false);
  });
});

describe('useDataTable — pagination', () => {
  test('paginates data according to pageSize', () => {
    const { result } = renderHook(() =>
      useDataTable({ data, columns, getRowId: (r) => r.id, pageSize: 2 }),
    );
    expect(result.current.pagedData).toHaveLength(2);
    expect(result.current.totalPages).toBe(2);
  });

  test('setPage moves to the requested page', () => {
    const { result } = renderHook(() =>
      useDataTable({ data, columns, getRowId: (r) => r.id, pageSize: 2 }),
    );
    act(() => result.current.setPage(1));
    expect(result.current.pagedData).toHaveLength(1);
    expect(result.current.pagedData[0]?.id).toBe('3');
  });

  test('page clamps to the last valid page if data shrinks', () => {
    const { result, rerender } = renderHook(
      ({ rows }) => useDataTable({ data: rows, columns, getRowId: (r) => r.id, pageSize: 2 }),
      { initialProps: { rows: data } },
    );
    act(() => result.current.setPage(1));
    expect(result.current.page).toBe(1);

    rerender({ rows: data.slice(0, 1) });
    expect(result.current.page).toBe(0);
  });

  test('no pageSize returns all rows on a single page', () => {
    const { result } = renderHook(() => useDataTable({ data, columns, getRowId: (r) => r.id }));
    expect(result.current.pagedData).toHaveLength(3);
    expect(result.current.totalPages).toBe(1);
  });
});

describe('useDataTable — expansion', () => {
  test('toggleExpand adds/removes a row id', () => {
    const { result } = renderHook(() =>
      useDataTable({ data, columns, getRowId: (r) => r.id, expandable: true }),
    );
    act(() => result.current.toggleExpand('1'));
    expect(result.current.expandedIds.has('1')).toBe(true);
    act(() => result.current.toggleExpand('1'));
    expect(result.current.expandedIds.has('1')).toBe(false);
  });
});
