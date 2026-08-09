import { ChevronRight } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import { useDataTableContext } from './DataTable';
import { DataTableCheckbox } from './DataTableCheckbox';

export interface DataTableRowProps<T> {
  row: T;
  rowIndex: number;
  renderExpanded?: (row: T, rowIndex: number) => React.ReactNode;
}

export function DataTableRow<T>({ row, rowIndex, renderExpanded }: DataTableRowProps<T>) {
  const {
    columns,
    selectable,
    expandable,
    getRowId,
    selectedIds,
    toggleRowSelection,
    expandedIds,
    toggleExpand,
  } = useDataTableContext<T>();

  const id = getRowId(row, rowIndex);
  const selected = selectedIds.has(id);
  const expanded = expandedIds.has(id);

  return (
    <>
      <tr
        aria-selected={selectable ? selected : undefined}
        className={twMerge(
          'rounded-control border-border mb-3 block border p-3 last:mb-0',
          'md:mb-0 md:table-row md:rounded-none md:border-0 md:border-b md:p-0 md:last:border-b-0',
          'duration-fast transition-colors motion-reduce:transition-none',
          selected ? 'bg-accent-subtle' : 'md:hover:bg-surface-raised',
        )}
      >
        {selectable && (
          <td className="border-border flex items-center justify-between border-b py-1.5 md:table-cell md:w-10 md:border-b-0 md:px-3 md:py-2.5">
            <span className="text-text-secondary text-xs font-medium md:hidden">Select</span>
            <DataTableCheckbox
              checked={selected}
              onChange={() => toggleRowSelection(id)}
              aria-label={`Select row ${rowIndex + 1}`}
              data-dt-row=""
              data-dt-col="select"
            />
          </td>
        )}
        {expandable && (
          <td className="border-border flex items-center justify-between border-b py-1.5 md:table-cell md:w-10 md:border-b-0 md:px-2 md:py-2.5">
            <span className="text-text-secondary text-xs font-medium md:hidden">Expand</span>
            <button
              type="button"
              data-dt-row
              data-dt-col="expand"
              onClick={() => toggleExpand(id)}
              aria-expanded={expanded}
              aria-label={expanded ? `Collapse row ${rowIndex + 1}` : `Expand row ${rowIndex + 1}`}
              className="rounded-control text-text-secondary hover:text-text-primary focus-ring-safe p-0.5 transition-transform outline-none"
            >
              <ChevronRight
                size={16}
                aria-hidden="true"
                className={twMerge('transition-transform', expanded && 'rotate-90')}
              />
            </button>
          </td>
        )}
        {columns.map((column) => (
          <td
            key={column.id}
            data-dt-col={`cell-${column.id}`}
            className={twMerge(
              'border-border flex items-center justify-between gap-3 border-b py-1.5 text-right',
              'md:table-cell md:border-b-0 md:px-3 md:py-2.5 md:text-left',
              column.align === 'center' && 'md:text-center',
              column.align === 'right' && 'md:text-right',
              column.className,
            )}
          >
            <span className="text-text-secondary shrink-0 text-xs font-medium md:hidden">
              {column.header}
            </span>
            <span className="text-text-primary min-w-0">{column.cell(row, rowIndex)}</span>
          </td>
        ))}
      </tr>
      {expandable && expanded && renderExpanded && (
        <tr className="block md:table-row">
          <td
            colSpan={columns.length + (selectable ? 1 : 0) + 1}
            className="bg-surface-raised text-text-secondary block px-3 py-2.5 text-sm md:table-cell"
          >
            {renderExpanded(row, rowIndex)}
          </td>
        </tr>
      )}
    </>
  );
}
DataTableRow.displayName = 'DataTableRow';
