import { ChevronLeft, ChevronRight } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import { usePagination } from '@acl/primitives';

export interface PaginationProps {
  currentPage?: number;
  defaultCurrentPage?: number;
  pageCount: number;
  onPageChange?: (page: number) => void;
  siblingCount?: number;
  boundaryCount?: number;
  className?: string;
}

export function Pagination({
  currentPage,
  defaultCurrentPage,
  pageCount,
  onPageChange,
  siblingCount,
  boundaryCount,
  className,
}: PaginationProps) {
  const {
    pages,
    currentPage: activePage,
    getRootProps,
    getPrevButtonProps,
    getNextButtonProps,
    getPageButtonProps,
  } = usePagination({
    currentPage,
    defaultCurrentPage,
    pageCount,
    onPageChange,
    siblingCount,
    boundaryCount,
  });

  return (
    <nav className={twMerge('flex items-center gap-1', className)} {...getRootProps()}>
      <button
        type="button"
        {...getPrevButtonProps()}
        className="rounded-control focus-ring-safe hover:bg-surface-raised duration-fast flex h-8 w-8 items-center justify-center transition-all outline-none active:scale-90 disabled:pointer-events-none disabled:opacity-30 motion-reduce:transition-none"
      >
        <ChevronLeft aria-hidden="true" size={16} />
      </button>

      {pages.map((p, index) => {
        if (p === 'ellipsis') {
          return (
            <span
              key={`ellipsis-${index}`}
              className="text-text-disabled flex h-8 w-8 items-center justify-center text-sm"
              aria-hidden="true"
            >
              &hellip;
            </span>
          );
        }

        const isCurrent = p === activePage;

        return (
          <button
            key={p}
            type="button"
            {...getPageButtonProps(p)}
            className={twMerge(
              'rounded-control focus-ring-safe duration-fast flex h-8 w-8 items-center justify-center text-sm transition-all outline-none active:scale-90 motion-reduce:transition-none',
              isCurrent
                ? 'bg-accent-default text-text-inverse scale-105 font-medium shadow-sm'
                : 'text-text-secondary hover:bg-surface-raised hover:text-text-primary hover:scale-105',
            )}
          >
            {p}
          </button>
        );
      })}

      <button
        type="button"
        {...getNextButtonProps()}
        className="rounded-control focus-ring-safe hover:bg-surface-raised duration-fast flex h-8 w-8 items-center justify-center transition-all outline-none active:scale-90 disabled:pointer-events-none disabled:opacity-30 motion-reduce:transition-none"
      >
        <ChevronRight aria-hidden="true" size={16} />
      </button>
    </nav>
  );
}

Pagination.displayName = 'Pagination';
