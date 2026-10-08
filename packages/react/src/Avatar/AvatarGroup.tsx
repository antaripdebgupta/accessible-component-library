import {
  Children,
  cloneElement,
  forwardRef,
  isValidElement,
  type HTMLAttributes,
  type ReactNode,
} from 'react';
import { twMerge } from 'tailwind-merge';
import { useAvatarGroup } from '@antarip/primitives';
import { Avatar, type AvatarProps } from './Avatar';

export interface AvatarGroupProps extends HTMLAttributes<HTMLDivElement> {
  max?: number;
  size?: AvatarProps['size'];
  /** Accessible label for the group as a whole, e.g. "Project collaborators". */
  'aria-label': string;
  children: ReactNode;
  /** Icon rendered inside the "+N" overflow avatar instead of the count text. */
  overflowIcon?: ReactNode;
  /** Called when the overflow "+N" avatar is activated — wire this to open a dropdown/list. */
  onOverflowClick?: () => void;
}

/**
 * Renders a horizontally-overlapping stack of avatars, collapsing anything
 * beyond `max` into a single "+N" summary avatar. The group itself carries
 * one accessible name/list semantics rather than relying on each avatar's
 * individual name alone, since the visual overlap can make focus order
 * confusing without a clear group boundary for AT users.
 */
export const AvatarGroup = forwardRef<HTMLDivElement, AvatarGroupProps>(
  ({ max, size = 'md', className, children, overflowIcon, onOverflowClick, ...props }, ref) => {
    const { visibleItems, overflowCount, total } = useAvatarGroup({ children, max });

    return (
      <div
        ref={ref}
        role="group"
        className={twMerge('flex items-center -space-x-2 rtl:space-x-0 rtl:[&>*]:-me-2', className)}
        {...props}
      >
        {visibleItems.map((child, i) =>
          isValidElement(child)
            ? cloneElement(child as React.ReactElement<AvatarProps>, {
                key: i,
                size,
                className: twMerge('ring-2 ring-surface', (child.props as AvatarProps).className),
              })
            : child,
        )}

        {overflowCount > 0 &&
          (onOverflowClick ? (
            <button
              type="button"
              onClick={onOverflowClick}
              aria-label={`Show ${overflowCount} more, ${total} total`}
              className={twMerge(
                'relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full',
                'bg-surface-raised font-medium text-text-secondary ring-2 ring-surface',
                'outline-none transition-[color,background-color,border-color,box-shadow,scale] duration-fast ease-out-soft focus-ring-safe hover:bg-border active:scale-[0.98] disabled:active:scale-100 aria-disabled:active:scale-100 motion-reduce:transition-none motion-reduce:active:scale-100',
                sizeClass(size),
              )}
            >
              {overflowIcon ?? `+${overflowCount}`}
            </button>
          ) : (
            <span
              role="img"
              aria-label={`${overflowCount} more, ${total} total`}
              className={twMerge(
                'relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full',
                'bg-surface-raised font-medium text-text-secondary ring-2 ring-surface',
                sizeClass(size),
              )}
            >
              <span aria-hidden="true">{overflowIcon ?? `+${overflowCount}`}</span>
            </span>
          ))}
      </div>
    );
  },
);
AvatarGroup.displayName = 'AvatarGroup';

function sizeClass(size: AvatarProps['size']) {
  switch (size) {
    case 'xs':
      return 'h-6 w-6 text-[10px]';
    case 'sm':
      return 'h-8 w-8 text-xs';
    case 'lg':
      return 'h-12 w-12 text-base';
    case 'xl':
      return 'h-16 w-16 text-lg';
    default:
      return 'h-10 w-10 text-sm';
  }
}
