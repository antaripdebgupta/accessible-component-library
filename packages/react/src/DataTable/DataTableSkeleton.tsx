import { useDataTableContext } from './DataTable';

export function DataTableSkeleton({ rows = 5 }: { rows?: number }) {
  const { columns, selectable, expandable } = useDataTableContext();
  const colCount = columns.length + (selectable ? 1 : 0) + (expandable ? 1 : 0);

  return (
    <tbody className="block md:table-row-group" aria-hidden="true">
      {Array.from({ length: rows }, (_, i) => (
        <tr
          key={i}
          className="rounded-control border-border mb-3 block border p-3 last:mb-0 md:mb-0 md:table-row md:border-0 md:border-b md:p-0 md:last:border-b-0"
        >
          <td colSpan={colCount} className="block px-3 py-2 md:table-cell">
            <div className="bg-surface-raised h-4 w-full animate-pulse rounded motion-reduce:animate-none" />
          </td>
        </tr>
      ))}
    </tbody>
  );
}
DataTableSkeleton.displayName = 'DataTableSkeleton';
