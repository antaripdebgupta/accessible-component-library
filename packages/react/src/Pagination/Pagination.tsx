import { ChevronLeft, ChevronRight } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import { usePagination } from '@antarip/primitives';

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
        className="flex h-8 w-8 items-center justify-center rounded-control outline-none transition-all duration-fast focus-ring-safe hover:bg-surface-raised active:scale-90 disabled:pointer-events-none disabled:opacity-30 motion-reduce:transition-none"
      >
        <ChevronLeft aria-hidden="true" size={16} />
      </button>

      {pages.map((p, index) => {
        if (p === 'ellipsis') {
          return (
            <span
              key={`ellipsis-${index}`}
              className="flex h-8 w-8 items-center justify-center text-sm text-text-disabled"
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
              'flex h-8 w-8 items-center justify-center rounded-control text-sm outline-none transition-all duration-fast focus-ring-safe active:scale-90 motion-reduce:transition-none',
              isCurrent
                ? 'scale-105 bg-accent-default font-medium text-text-inverse shadow-sm'
                : 'text-text-secondary hover:scale-105 hover:bg-surface-raised hover:text-text-primary',
            )}
          >
            {p}
          </button>
        );
      })}

      <button
        type="button"
        {...getNextButtonProps()}
        className="flex h-8 w-8 items-center justify-center rounded-control outline-none transition-all duration-fast focus-ring-safe hover:bg-surface-raised active:scale-90 disabled:pointer-events-none disabled:opacity-30 motion-reduce:transition-none"
      >
        <ChevronRight aria-hidden="true" size={16} />
      </button>
    </nav>
  );
}

Pagination.displayName = 'Pagination';
