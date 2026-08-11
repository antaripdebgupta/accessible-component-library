import { forwardRef, type HTMLAttributes } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { twMerge } from 'tailwind-merge';
import { useSkeleton } from '@acl/primitives';

const skeletonStyles = cva(
  [
    'relative overflow-hidden bg-surface-raised',
    "before:content-[''] before:absolute before:inset-0 before:-translate-x-full",
    'before:bg-gradient-to-r before:from-transparent before:via-border/60 before:to-transparent',
    'before:animate-shimmer',
    'motion-reduce:before:animate-none motion-reduce:before:hidden motion-reduce:opacity-70',
  ],
  {
    variants: {
      shape: {
        text: 'rounded-control h-4 w-full',
        circle: 'rounded-full',
        rect: 'rounded-control',
      },
    },
    defaultVariants: { shape: 'rect' },
  },
);

export interface SkeletonProps
  extends HTMLAttributes<HTMLDivElement>, VariantProps<typeof skeletonStyles> {
  width?: string | number;
  height?: string | number;
}

export const Skeleton = forwardRef<HTMLDivElement, SkeletonProps>(
  ({ shape, width, height, className, style, ...props }, ref) => {
    const { getSkeletonProps } = useSkeleton();

    return (
      <div
        ref={ref}
        {...getSkeletonProps()}
        className={twMerge(skeletonStyles({ shape }), className)}
        style={{ width, height, ...style }}
        {...props}
      />
    );
  },
);
Skeleton.displayName = 'Skeleton';
