import type { ReactNode } from 'react';
import { useDataTableContext } from './DataTable';

export function DataTableEmpty({ children = 'No results found.' }: { children?: ReactNode }) {
  const { columns, selectable, expandable } = useDataTableContext();
  const colSpan = columns.length + (selectable ? 1 : 0) + (expandable ? 1 : 0);

  return (
    <tbody>
      <tr>
        <td colSpan={colSpan} className="px-3 py-10 text-center text-sm text-text-secondary">
          {children}
        </td>
      </tr>
    </tbody>
  );
}
DataTableEmpty.displayName = 'DataTableEmpty';
