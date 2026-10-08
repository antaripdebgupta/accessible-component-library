import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import { twMerge } from 'tailwind-merge';
import { ChevronRight } from 'lucide-react';

export interface BreadcrumbSeparatorProps extends HTMLAttributes<HTMLLIElement> {
  children?: ReactNode;
  className?: string;
  dir?: 'ltr' | 'rtl';
}

export const BreadcrumbSeparator = forwardRef<HTMLLIElement, BreadcrumbSeparatorProps>(
  ({ children, className, dir = 'ltr', ...props }, ref) => {
    return (
      <li
        ref={ref}
        aria-hidden="true"
        {...props}
        className={twMerge(
          'inline-flex select-none items-center text-xs text-text-secondary',
          className,
        )}
      >
        {children ?? (
          <ChevronRight size={14} className={twMerge('shrink-0', dir === 'rtl' && 'rotate-180')} />
        )}
      </li>
    );
  },
);

BreadcrumbSeparator.displayName = 'BreadcrumbSeparator';
