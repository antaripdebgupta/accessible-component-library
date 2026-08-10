import { forwardRef, type HTMLAttributes } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { twMerge } from 'tailwind-merge';

const statusDotStyles = cva('block h-full w-full rounded-full ring-2 ring-surface', {
  variants: {
    status: {
      online: 'bg-success-default',
      offline: 'bg-border-strong',
      away: 'bg-warning-default',
      busy: 'bg-danger-default',
    },
  },
  defaultVariants: { status: 'offline' },
});

export interface AvatarStatusBadgeProps
  extends HTMLAttributes<HTMLSpanElement>, VariantProps<typeof statusDotStyles> {
  label: string;
}

export const AvatarStatusBadge = forwardRef<HTMLSpanElement, AvatarStatusBadgeProps>(
  ({ status, label, className, ...props }, ref) => (
    // The outer span must fill its Avatar-provided container (h-full w-full)
    // so the inner dot's own h-full/w-full has something real to resolve
    // against — without this the dot collapses to near-zero size.
    <span ref={ref} className="relative block h-full w-full" {...props}>
      <span aria-hidden="true" className={twMerge(statusDotStyles({ status }), className)} />
      <span className="sr-only">{label}</span>
    </span>
  ),
);
AvatarStatusBadge.displayName = 'AvatarStatusBadge';
