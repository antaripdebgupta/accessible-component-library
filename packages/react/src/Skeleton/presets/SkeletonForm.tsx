import { Skeleton } from '../Skeleton';

export function SkeletonForm({ fields = 4 }: { fields?: number }) {
  return (
    <div className="w-full max-w-md space-y-5">
      {Array.from({ length: fields }, (_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton shape="text" width="30%" height={12} />
          <Skeleton shape="rect" className="h-10 w-full" />
        </div>
      ))}
      <Skeleton shape="rect" className="h-10 w-28" />
    </div>
  );
}
SkeletonForm.displayName = 'SkeletonForm';
