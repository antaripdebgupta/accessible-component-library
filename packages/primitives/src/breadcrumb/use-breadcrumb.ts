import { useCallback, useMemo } from 'react';

export interface BreadcrumbItemData {
  id?: string | number;
  label: string;
  href?: string;
  [key: string]: any;
}

export interface UseBreadcrumbOptions {
  items?: BreadcrumbItemData[];
  maxItems?: number;
  itemsBeforeCollapse?: number;
  itemsAfterCollapse?: number;
}

export function useBreadcrumb({
  items = [],
  maxItems,
  itemsBeforeCollapse = 1,
  itemsAfterCollapse = 1,
}: UseBreadcrumbOptions = {}) {
  const shouldCollapse = useMemo(() => {
    if (!maxItems || maxItems < 2) return false;
    return items.length > maxItems;
  }, [items.length, maxItems]);

  const { startItems, collapsedItems, endItems } = useMemo(() => {
    if (!shouldCollapse) {
      return {
        startItems: items,
        collapsedItems: [],
        endItems: [],
      };
    }

    const start = items.slice(0, Math.max(1, itemsBeforeCollapse));
    const endCount = Math.max(1, itemsAfterCollapse);
    const end = items.slice(items.length - endCount);
    const collapsed = items.slice(start.length, items.length - end.length);

    return {
      startItems: start,
      collapsedItems: collapsed,
      endItems: end,
    };
  }, [items, shouldCollapse, itemsBeforeCollapse, itemsAfterCollapse]);

  const getNavProps = useCallback(
    () => ({
      'aria-label': 'Breadcrumb',
    }),
    [],
  );

  const getItemProps = useCallback((index: number, total: number) => {
    const isLast = index === total - 1;
    return {
      'aria-current': isLast ? ('page' as const) : undefined,
    };
  }, []);

  return {
    shouldCollapse,
    startItems,
    collapsedItems,
    endItems,
    getNavProps,
    getItemProps,
  };
}

export type UseBreadcrumbReturn = ReturnType<typeof useBreadcrumb>;
