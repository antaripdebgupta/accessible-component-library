import { forwardRef, Fragment, type ElementType, type HTMLAttributes, type ReactNode } from 'react';
import { useBreadcrumb, type BreadcrumbItemData } from '@acl/primitives';
import { twMerge } from 'tailwind-merge';
import { BreadcrumbItem } from './BreadcrumbItem';
import { BreadcrumbSeparator } from './BreadcrumbSeparator';
import { BreadcrumbEllipsis } from './BreadcrumbEllipsis';

export interface BreadcrumbProps extends HTMLAttributes<HTMLElement> {
  items?: BreadcrumbItemData[];
  separator?: ReactNode;
  maxItems?: number;
  itemsBeforeCollapse?: number;
  itemsAfterCollapse?: number;
  as?: ElementType;
  dir?: 'ltr' | 'rtl';
  children?: ReactNode;
  className?: string;
  listClassName?: string;
}

export const Breadcrumb = forwardRef<HTMLElement, BreadcrumbProps>(
  (
    {
      items,
      separator,
      maxItems,
      itemsBeforeCollapse = 1,
      itemsAfterCollapse = 1,
      as: LinkComponent = 'a',
      dir = 'ltr',
      children,
      className,
      listClassName,
      'aria-label': ariaLabel = 'Breadcrumb',
      ...props
    },
    ref,
  ) => {
    const { shouldCollapse, startItems, collapsedItems, endItems, getNavProps, getItemProps } =
      useBreadcrumb({
        items,
        maxItems,
        itemsBeforeCollapse,
        itemsAfterCollapse,
      });

    const navProps = getNavProps();

    // If explicit children are passed, render primitive composable structure directly
    if (!items && children) {
      return (
        <nav
          ref={ref}
          {...props}
          {...navProps}
          aria-label={ariaLabel}
          dir={dir}
          className={className}
        >
          <ol
            className={twMerge(
              'm-0 flex list-none flex-wrap items-center gap-1 p-0',
              listClassName,
            )}
          >
            {children}
          </ol>
        </nav>
      );
    }

    // Data-driven rendering mode with auto-collapse support
    const allItems = items ?? [];
    if (allItems.length === 0) return null;

    const totalCount = allItems.length;

    return (
      <nav
        ref={ref}
        {...props}
        {...navProps}
        aria-label={ariaLabel}
        dir={dir}
        className={className}
      >
        <ol
          className={twMerge(
            'm-0 flex list-none flex-wrap items-center gap-1 p-0 text-sm',
            listClassName,
          )}
        >
          {!shouldCollapse ? (
            allItems.map((item, index) => {
              const isLast = index === totalCount - 1;
              const itemProps = getItemProps(index, totalCount);

              return (
                <Fragment key={item.id || item.href || item.label || index}>
                  <BreadcrumbItem
                    href={item.href}
                    isCurrent={isLast}
                    as={LinkComponent}
                    {...itemProps}
                  >
                    {item.label}
                  </BreadcrumbItem>

                  {!isLast && <BreadcrumbSeparator dir={dir}>{separator}</BreadcrumbSeparator>}
                </Fragment>
              );
            })
          ) : (
            <>
              {/* Start Items */}
              {startItems.map((item, index) => (
                <Fragment key={item.id || item.href || item.label || index}>
                  <BreadcrumbItem href={item.href} as={LinkComponent}>
                    {item.label}
                  </BreadcrumbItem>
                  <BreadcrumbSeparator dir={dir}>{separator}</BreadcrumbSeparator>
                </Fragment>
              ))}

              {/* Ellipsis Dropdown for Middle Items */}
              <BreadcrumbEllipsis items={collapsedItems} as={LinkComponent} />
              <BreadcrumbSeparator dir={dir}>{separator}</BreadcrumbSeparator>

              {/* End Items */}
              {endItems.map((item, index) => {
                const globalIndex = startItems.length + collapsedItems.length + index;
                const isLast = globalIndex === totalCount - 1;
                const itemProps = getItemProps(globalIndex, totalCount);

                return (
                  <Fragment key={item.id || item.href || item.label || globalIndex}>
                    <BreadcrumbItem
                      href={item.href}
                      isCurrent={isLast}
                      as={LinkComponent}
                      {...itemProps}
                    >
                      {item.label}
                    </BreadcrumbItem>

                    {!isLast && <BreadcrumbSeparator dir={dir}>{separator}</BreadcrumbSeparator>}
                  </Fragment>
                );
              })}
            </>
          )}
        </ol>
      </nav>
    );
  },
);

Breadcrumb.displayName = 'Breadcrumb';
