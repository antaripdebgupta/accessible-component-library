import { Skeleton } from '../Skeleton';
import { SkeletonAvatar } from './SkeletonAvatar';
import { SkeletonText } from './SkeletonText';

export function SkeletonCard() {
  return (
    <div className="shadow-xs w-full max-w-sm rounded-popover border border-border bg-surface p-4">
      <Skeleton shape="rect" className="mb-4 h-40 w-full" />
      <div className="mb-3 flex items-center gap-3">
        <SkeletonAvatar size="sm" />
        <div className="flex-1 space-y-2">
          <Skeleton shape="text" width="50%" />
          <Skeleton shape="text" width="30%" height={12} />
        </div>
      </div>
      <SkeletonText lines={2} lastLineWidth="80%" />
    </div>
  );
}
SkeletonCard.displayName = 'SkeletonCard';
