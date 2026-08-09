import type { ReactNode } from 'react';
import { useDataTableContext } from './DataTable';

export function DataTableEmpty({ children = 'No results found.' }: { children?: ReactNode }) {
  const { columns, selectable, expandable } = useDataTableContext();
  const colSpan = columns.length + (selectable ? 1 : 0) + (expandable ? 1 : 0);

  return (
    <tbody className="block md:table-row-group">
      <tr className="block md:table-row">
        <td
          colSpan={colSpan}
          className="text-text-secondary block px-3 py-10 text-center text-sm md:table-cell"
        >
          {children}
        </td>
      </tr>
    </tbody>
  );
}
DataTableEmpty.displayName = 'DataTableEmpty';
