import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import { useSkeleton } from '@acl/primitives';

export interface SkeletonGroupProps extends HTMLAttributes<HTMLDivElement> {
  loading: boolean;
  label?: string;
  fallback: ReactNode;
  children: ReactNode;
}

export const SkeletonGroup = forwardRef<HTMLDivElement, SkeletonGroupProps>(
  ({ loading, label = 'Loading', fallback, children, ...props }, ref) => {
    const { getContainerProps } = useSkeleton({ loading });

    return (
      <div ref={ref} {...getContainerProps(label)} {...props}>
        {loading ? fallback : children}
      </div>
    );
  },
);
SkeletonGroup.displayName = 'SkeletonGroup';
