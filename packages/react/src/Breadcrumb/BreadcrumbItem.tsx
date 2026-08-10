import { forwardRef, type ElementType, type HTMLAttributes, type ReactNode } from 'react';
import { twMerge } from 'tailwind-merge';

export interface BreadcrumbItemProps extends HTMLAttributes<HTMLLIElement> {
  children: ReactNode;
  href?: string;
  isCurrent?: boolean;
  as?: ElementType;
  className?: string;
  linkClassName?: string;
}

export const BreadcrumbItem = forwardRef<HTMLLIElement, BreadcrumbItemProps>(
  (
    { children, href, isCurrent = false, as: Component = 'a', className, linkClassName, ...props },
    ref,
  ) => {
    return (
      <li
        ref={ref}
        {...props}
        className={twMerge('inline-flex items-center gap-1.5 text-sm', className)}
      >
        {isCurrent || !href ? (
          <span
            aria-current="page"
            className={twMerge(
              'text-text-primary max-w-[200px] truncate font-semibold',
              linkClassName,
            )}
            title={typeof children === 'string' ? children : undefined}
          >
            {children}
          </span>
        ) : (
          <Component
            href={href}
            className={twMerge(
              'text-text-secondary hover:text-text-primary focus-ring-safe max-w-[200px] truncate rounded px-1 py-0.5 transition-colors',
              linkClassName,
            )}
            title={typeof children === 'string' ? children : undefined}
          >
            {children}
          </Component>
        )}
      </li>
    );
  },
);

BreadcrumbItem.displayName = 'BreadcrumbItem';
