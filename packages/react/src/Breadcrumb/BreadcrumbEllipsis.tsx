import { forwardRef, type ElementType, type HTMLAttributes } from 'react';
import { twMerge } from 'tailwind-merge';
import { MoreHorizontal } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '../DropdownMenu';
import type { BreadcrumbItemData } from '@acl/primitives';

export interface BreadcrumbEllipsisProps extends HTMLAttributes<HTMLLIElement> {
  items?: BreadcrumbItemData[];
  as?: ElementType;
  className?: string;
  ariaLabel?: string;
}

export const BreadcrumbEllipsis = forwardRef<HTMLLIElement, BreadcrumbEllipsisProps>(
  (
    {
      items = [],
      as: Component = 'a',
      className,
      ariaLabel = 'Show hidden breadcrumb items',
      ...props
    },
    ref,
  ) => {
    return (
      <li ref={ref} {...props} className={twMerge('inline-flex items-center', className)}>
        <DropdownMenu>
          <DropdownMenuTrigger>
            <button
              type="button"
              aria-label={ariaLabel}
              className="hover:bg-surface-raised text-text-secondary hover:text-text-primary focus-ring-safe inline-flex items-center justify-center rounded p-1 transition-colors"
            >
              <MoreHorizontal size={16} />
            </button>
          </DropdownMenuTrigger>

          {items.length > 0 && (
            <DropdownMenuContent align="start" className="min-w-[160px]">
              {items.map((item, idx) => (
                <DropdownMenuItem
                  key={item.href || item.label || idx}
                  onSelect={() => {
                    if (item.href && typeof window !== 'undefined') {
                      window.location.href = item.href;
                    }
                  }}
                >
                  {item.href ? (
                    <Component
                      href={item.href}
                      className="text-text-primary w-full text-xs font-medium no-underline"
                    >
                      {item.label}
                    </Component>
                  ) : (
                    <span className="text-text-primary text-xs">{item.label}</span>
                  )}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          )}
        </DropdownMenu>
      </li>
    );
  },
);

BreadcrumbEllipsis.displayName = 'BreadcrumbEllipsis';
