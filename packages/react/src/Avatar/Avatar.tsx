import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { twMerge } from 'tailwind-merge';
import { User } from 'lucide-react';
import { useAvatar } from '@acl/primitives';

const avatarStyles = cva(
  'relative inline-flex shrink-0 items-center justify-center overflow-visible rounded-full bg-surface-raised text-text-secondary font-medium select-none',
  {
    variants: {
      size: {
        xs: 'h-6 w-6 text-[10px]',
        sm: 'h-8 w-8 text-xs',
        md: 'h-10 w-10 text-sm',
        lg: 'h-12 w-12 text-base',
        xl: 'h-16 w-16 text-lg',
      },
    },
    defaultVariants: { size: 'md' },
  },
);

export interface AvatarProps
  extends Omit<HTMLAttributes<HTMLSpanElement>, 'children'>, VariantProps<typeof avatarStyles> {
  src?: string;
  name?: string;
  alt?: string;
  badge?: ReactNode;
  badgeIcon?: ReactNode;
}

export const Avatar = forwardRef<HTMLSpanElement, AvatarProps>(
  ({ src, name, alt, size, badge, badgeIcon, className, ...props }, ref) => {
    const { showImage, showInitials, showIconFallback, initials } = useAvatar({ src, name });
    const accessibleName = alt ?? name ?? 'User avatar';

    return (
      <span
        ref={ref}
        role="img"
        aria-label={accessibleName}
        className={twMerge(avatarStyles({ size }), className)}
        {...props}
      >
        {/* Inner circle clips the image; outer span stays overflow-visible so the badge can sit on the rim */}
        <span className="flex h-full w-full items-center justify-center overflow-hidden rounded-full">
          {showImage && (
            <img src={src} alt="" aria-hidden="true" className="h-full w-full object-cover" />
          )}
          {showInitials && <span aria-hidden="true">{initials}</span>}
          {showIconFallback && (
            <User aria-hidden="true" className="text-text-secondary h-1/2 w-1/2" />
          )}
        </span>

        {(badge || badgeIcon) && (
          <span
            className={twMerge(
              'ring-surface absolute flex items-center justify-center rounded-full ring-[3px]',
              'end-[-6%] bottom-[-6%]',
              badgeIcon
                ? 'bg-surface-inverse text-text-inverse h-[36%] w-[36%]'
                : 'h-[26%] w-[26%]',
            )}
          >
            {badgeIcon ?? badge}
          </span>
        )}
      </span>
    );
  },
);
Avatar.displayName = 'Avatar';
