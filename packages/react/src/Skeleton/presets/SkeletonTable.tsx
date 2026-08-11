import { Skeleton } from '../Skeleton';

export function SkeletonTable({ rows = 5, columns = 4 }: { rows?: number; columns?: number }) {
  return (
    <div className="rounded-popover border-border w-full overflow-hidden border">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-border bg-surface-raised border-b">
            {Array.from({ length: columns }, (_, i) => (
              <th key={i} className="px-3 py-2 text-left">
                <span className="sr-only">{`Column ${i + 1}`}</span>
                <Skeleton shape="text" width="70%" height={12} />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }, (_, r) => (
            <tr key={r} className="border-border border-b last:border-b-0">
              {Array.from({ length: columns }, (_, c) => (
                <td key={c} className="px-3 py-2">
                  <Skeleton shape="text" width={c === 0 ? '80%' : '60%'} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
SkeletonTable.displayName = 'SkeletonTable';
