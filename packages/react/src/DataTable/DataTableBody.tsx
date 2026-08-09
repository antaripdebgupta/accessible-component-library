import { useEffect, useRef, useState, type KeyboardEvent, type ReactNode } from 'react';
import { twMerge } from 'tailwind-merge';
import { useDataTableContext } from './DataTable';
import { DataTableRow } from './DataTableRow';
import { DataTableEmpty } from './DataTableEmpty';
import { DataTableSkeleton } from './DataTableSkeleton';

export interface DataTableBodyProps<T> {
  renderExpanded?: (row: T, rowIndex: number) => ReactNode;
  emptyMessage?: ReactNode;
}

export function DataTableBody<T>({ renderExpanded, emptyMessage }: DataTableBodyProps<T>) {
  const { pagedData, loading, getRowId } = useDataTableContext<T>();
  const bodyRef = useRef<HTMLTableSectionElement>(null);

  const [displayData, setDisplayData] = useState<T[]>(pagedData);
  const [visible, setVisible] = useState(true);

  // Smooth pagination/sort transition: fade out, swap data, fade in.
  useEffect(() => {
    setVisible(false);
    const timer = setTimeout(() => {
      setDisplayData(pagedData);
      setVisible(true);
    }, 120); // matches --transition-duration-fast (120ms)
    return () => clearTimeout(timer);
  }, [pagedData]);

  // Sync data immediately on loading or initial empty data
  useEffect(() => {
    if (loading || pagedData.length === 0) {
      setDisplayData(pagedData);
      setVisible(true);
    }
  }, [loading, pagedData]);

  const handleKeyDown = (e: KeyboardEvent<HTMLTableSectionElement>) => {
    if (!['ArrowUp', 'ArrowDown', 'Home', 'End'].includes(e.key)) return;
    const target = e.target as HTMLElement;
    const col = target.getAttribute('data-dt-col');
    if (col === null) return;

    const body = bodyRef.current;
    if (!body) return;

    const allInColumn = Array.from(body.querySelectorAll<HTMLElement>(`[data-dt-col="${col}"]`));
    const currentIndex = allInColumn.indexOf(target);
    if (currentIndex === -1) return;

    let nextIndex = currentIndex;
    if (e.key === 'ArrowDown') nextIndex = Math.min(currentIndex + 1, allInColumn.length - 1);
    else if (e.key === 'ArrowUp') nextIndex = Math.max(currentIndex - 1, 0);
    else if (e.key === 'Home') nextIndex = 0;
    else if (e.key === 'End') nextIndex = allInColumn.length - 1;

    if (nextIndex !== currentIndex) {
      e.preventDefault();
      allInColumn[nextIndex]?.focus();
    }
  };

  if (loading) return <DataTableSkeleton />;
  if (displayData.length === 0) return <DataTableEmpty>{emptyMessage}</DataTableEmpty>;

  return (
    <tbody
      ref={bodyRef}
      onKeyDown={handleKeyDown}
      className={twMerge(
        'block md:table-row-group',
        'duration-fast ease-out-soft transition-opacity motion-reduce:transition-none',
        visible ? 'opacity-100' : 'opacity-0',
      )}
    >
      {displayData.map((row, rowIndex) => (
        <DataTableRow
          key={getRowId(row, rowIndex)}
          row={row}
          rowIndex={rowIndex}
          renderExpanded={renderExpanded}
        />
      ))}
    </tbody>
  );
}
DataTableBody.displayName = 'DataTableBody';
