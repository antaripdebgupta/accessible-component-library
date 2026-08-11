import { Skeleton } from '../Skeleton';

export type SkeletonAvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

const SIZE_PX: Record<SkeletonAvatarSize, number> = { xs: 24, sm: 32, md: 40, lg: 48, xl: 64 };

export function SkeletonAvatar({ size = 'md' }: { size?: SkeletonAvatarSize }) {
  const px = SIZE_PX[size];
  return <Skeleton shape="circle" width={px} height={px} />;
}
SkeletonAvatar.displayName = 'SkeletonAvatar';
