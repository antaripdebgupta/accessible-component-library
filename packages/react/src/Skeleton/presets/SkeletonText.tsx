import { Skeleton } from '../Skeleton';

export interface SkeletonTextProps {
  /** Number of lines to render. Default 3. */
  lines?: number;
  lastLineWidth?: string;
  className?: string;
}

export function SkeletonText({ lines = 3, lastLineWidth = '60%', className }: SkeletonTextProps) {
  return (
    <div className={className} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
      {Array.from({ length: lines }, (_, i) => (
        <Skeleton key={i} shape="text" width={i === lines - 1 ? lastLineWidth : '100%'} />
      ))}
    </div>
  );
}
SkeletonText.displayName = 'SkeletonText';
