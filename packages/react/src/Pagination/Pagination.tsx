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
        className="flex h-ctl-sm min-w-ctl-sm items-center justify-center rounded-control text-text-secondary outline-none transition-colors duration-fast focus-ring-safe hover:bg-surface-raised hover:text-text-primary active:scale-[0.97] disabled:pointer-events-none disabled:opacity-50 motion-reduce:transition-none"
      >
        <ChevronLeft aria-hidden="true" size={16} />
      </button>

      {pages.map((p, index) => {
        if (p === 'ellipsis') {
          return (
            <span
              key={`ellipsis-${index}`}
              className="flex h-ctl-sm min-w-ctl-sm items-center justify-center text-sm tabular-nums text-text-secondary"
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
              'flex h-ctl-sm min-w-ctl-sm items-center justify-center rounded-control px-1.5 text-sm font-medium tabular-nums outline-none transition-colors duration-fast focus-ring-safe active:scale-[0.97] motion-reduce:transition-none',
              isCurrent
                ? 'bg-accent-default text-text-inverse'
                : 'text-text-secondary hover:bg-surface-raised hover:text-text-primary',
            )}
          >
            {p}
          </button>
        );
      })}

      <button
        type="button"
        {...getNextButtonProps()}
        className="flex h-ctl-sm min-w-ctl-sm items-center justify-center rounded-control text-text-secondary outline-none transition-colors duration-fast focus-ring-safe hover:bg-surface-raised hover:text-text-primary active:scale-[0.97] disabled:pointer-events-none disabled:opacity-50 motion-reduce:transition-none"
      >
        <ChevronRight aria-hidden="true" size={16} />
      </button>
    </nav>
  );
}

Pagination.displayName = 'Pagination';
