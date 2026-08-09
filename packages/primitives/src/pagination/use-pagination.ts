import { useCallback } from 'react';
import { useControllableState } from '@acl/utils';

export interface UsePaginationOptions {
  pageCount: number;
  currentPage?: number;
  defaultCurrentPage?: number;
  onPageChange?: (page: number) => void;
  siblingCount?: number;
  boundaryCount?: number;
}

export function usePagination({
  pageCount,
  currentPage: controlledCurrentPage,
  defaultCurrentPage = 1,
  onPageChange,
  siblingCount = 1,
  boundaryCount = 1,
}: UsePaginationOptions) {
  const [currentPage, setCurrentPage] = useControllableState<number>({
    value: controlledCurrentPage,
    defaultValue: defaultCurrentPage,
    onChange: onPageChange,
  });

  const goTo = useCallback(
    (page: number) => {
      const clamped = Math.min(Math.max(page, 1), pageCount);
      setCurrentPage(clamped);
    },
    [pageCount, setCurrentPage],
  );

  const next = useCallback(() => goTo(currentPage + 1), [currentPage, goTo]);
  const prev = useCallback(() => goTo(currentPage - 1), [currentPage, goTo]);

  const range = (start: number, end: number) => {
    const length = end - start + 1;
    return Array.from({ length }, (_, i) => start + i);
  };

  const pages = (() => {
    const totalNumbers = siblingCount * 2 + 3 + boundaryCount * 2;
    const totalBlocks = totalNumbers + 2;

    if (pageCount <= totalBlocks) {
      return range(1, pageCount);
    }

    const startPages = range(1, boundaryCount);
    const endPages = range(pageCount - boundaryCount + 1, pageCount);

    const leftSiblingIndex = Math.max(currentPage - siblingCount, boundaryCount + 2);
    const rightSiblingIndex = Math.min(currentPage + siblingCount, pageCount - boundaryCount - 1);

    const shouldShowLeftDots = leftSiblingIndex > boundaryCount + 2;
    const shouldShowRightDots = rightSiblingIndex < pageCount - boundaryCount - 1;

    if (!shouldShowLeftDots && shouldShowRightDots) {
      const leftItemCount = 3 + 2 * siblingCount;
      const leftRange = range(1, leftItemCount);
      return [...leftRange, 'ellipsis' as const, ...endPages];
    }

    if (shouldShowLeftDots && !shouldShowRightDots) {
      const rightItemCount = 3 + 2 * siblingCount;
      const rightRange = range(pageCount - rightItemCount + 1, pageCount);
      return [...startPages, 'ellipsis' as const, ...rightRange];
    }

    if (shouldShowLeftDots && shouldShowRightDots) {
      const middleRange = range(leftSiblingIndex, rightSiblingIndex);
      return [...startPages, 'ellipsis' as const, ...middleRange, 'ellipsis' as const, ...endPages];
    }

    return range(1, pageCount);
  })();

  const getRootProps = useCallback(
    () => ({
      role: 'navigation' as const,
      'aria-label': 'Pagination',
    }),
    [],
  );

  const getPrevButtonProps = useCallback(
    () => ({
      'aria-label': 'Previous page',
      disabled: currentPage <= 1,
      'aria-disabled': currentPage <= 1 ? ('true' as const) : undefined,
      onClick: prev,
    }),
    [currentPage, prev],
  );

  const getNextButtonProps = useCallback(
    () => ({
      'aria-label': 'Next page',
      disabled: currentPage >= pageCount,
      'aria-disabled': currentPage >= pageCount ? ('true' as const) : undefined,
      onClick: next,
    }),
    [currentPage, pageCount, next],
  );

  const getPageButtonProps = useCallback(
    (pageNumber: number) => ({
      'aria-label': `Page ${pageNumber}`,
      'aria-current': pageNumber === currentPage ? ('page' as const) : undefined,
      onClick: () => goTo(pageNumber),
    }),
    [currentPage, goTo],
  );

  return {
    currentPage,
    pageCount,
    pages,
    goTo,
    next,
    prev,
    getRootProps,
    getPrevButtonProps,
    getNextButtonProps,
    getPageButtonProps,
  };
}

export type UsePaginationReturn = ReturnType<typeof usePagination>;
