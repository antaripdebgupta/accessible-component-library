import { useDataTableContext } from './DataTable';

export function DataTableSkeleton({ rows = 5 }: { rows?: number }) {
  const { columns, selectable, expandable } = useDataTableContext();
  const colCount = columns.length + (selectable ? 1 : 0) + (expandable ? 1 : 0);

  return (
    <tbody aria-hidden="true">
      {Array.from({ length: rows }, (_, i) => (
        <tr key={i} className="border-b border-border last:border-b-0">
          <td colSpan={colCount} className="px-3 py-2">
            <div className="relative h-4 w-full overflow-hidden rounded-control bg-surface-sunken before:absolute before:inset-0 before:-translate-x-full before:animate-shimmer before:bg-gradient-to-r before:from-transparent before:via-border/60 before:to-transparent motion-reduce:before:hidden motion-reduce:before:animate-none" />
          </td>
        </tr>
      ))}
    </tbody>
  );
}
DataTableSkeleton.displayName = 'DataTableSkeleton';
