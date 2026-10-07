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
          'block border-b border-border last:border-b-0 md:table-row',
          'transition-colors duration-fast motion-reduce:transition-none',
          selected ? 'bg-accent-subtle' : 'hover:bg-surface-raised',
        )}
      >
        {selectable && (
          <td className="flex w-full items-center px-3 py-2.5 md:table-cell md:w-10">
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
          <td className="flex w-full items-center px-2 py-2.5 md:table-cell md:w-10">
            <button
              type="button"
              data-dt-row
              data-dt-col="expand"
              onClick={() => toggleExpand(id)}
              aria-expanded={expanded}
              aria-label={expanded ? `Collapse row ${rowIndex + 1}` : `Expand row ${rowIndex + 1}`}
              className="flex h-6 w-6 items-center justify-center rounded-control text-text-secondary outline-none focus-ring-safe hover:text-text-primary"
            >
              <ChevronRight
                size={16}
                aria-hidden="true"
                className={twMerge('transition-transform', expanded && 'rotate-90')}
              />
            </button>
          </td>
        )}
        {columns.map((column) => {
          const label = typeof column.header === 'string' ? column.header : String(column.header);
          return (
            <td
              key={column.id}
              data-dt-col={`cell-${column.id}`}
              data-label={label}
              className={twMerge(
                'flex items-center justify-between gap-3 px-3 py-2.5 text-left md:table-cell',
                column.align === 'center' && 'text-center',
                column.align === 'right' && 'text-right',
                column.className,
              )}
            >
              <span className="text-xs font-medium text-text-secondary md:hidden">{label}</span>
              <span className="min-w-0 text-text-primary">{column.cell(row, rowIndex)}</span>
            </td>
          );
        })}
      </tr>
      {expandable && expanded && renderExpanded && (
        <tr className="">
          <td
            colSpan={columns.length + (selectable ? 1 : 0) + 1}
            className="bg-surface-raised px-3 py-2.5 text-sm text-text-secondary"
          >
            {renderExpanded(row, rowIndex)}
          </td>
        </tr>
      )}
    </>
  );
}
DataTableRow.displayName = 'DataTableRow';
