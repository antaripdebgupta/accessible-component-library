import { useEffect, useLayoutEffect, useRef, useState } from 'react';
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

  const navRef = useRef<HTMLElement>(null);
  const [indicator, setIndicator] = useState<{ x: number; w: number } | null>(null);
  const [armed, setArmed] = useState(false); // no animation for the very first placement
  const pagesKey = pages.join(',');

  useLayoutEffect(() => {
    const nav = navRef.current;
    if (!nav) return;
    const measure = () => {
      const el = nav.querySelector<HTMLElement>('[aria-current="page"]');
      setIndicator(el ? { x: el.offsetLeft, w: el.offsetWidth } : null);
    };
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [activePage, pagesKey]);

  useEffect(() => {
    if (!indicator || armed) return;
    const raf = requestAnimationFrame(() => setArmed(true));
    return () => cancelAnimationFrame(raf);
  }, [indicator, armed]);

  return (
    <nav
      ref={navRef}
      className={twMerge('relative flex items-center gap-1', className)}
      {...getRootProps()}
    >
      {indicator && (
        <span
          aria-hidden="true"
          className={twMerge(
            'pointer-events-none absolute left-0 top-0 h-ctl-sm rounded-control bg-accent-default',
            armed
              ? 'transition-[transform,width] duration-base ease-out-soft motion-reduce:transition-none'
              : 'transition-none',
          )}
          style={{ width: indicator.w, transform: `translateX(${indicator.x}px)` }}
        />
      )}

      <button
        type="button"
        {...getPrevButtonProps()}
        className="flex h-ctl-sm min-w-ctl-sm items-center justify-center rounded-control text-text-secondary outline-none transition-[color,background-color,border-color,box-shadow,scale] duration-fast ease-out-soft focus-ring-safe hover:bg-surface-raised hover:text-text-primary active:scale-[0.97] disabled:pointer-events-none disabled:opacity-50 disabled:active:scale-100 aria-disabled:active:scale-100 motion-reduce:transition-none motion-reduce:active:scale-100"
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
              'relative flex h-ctl-sm min-w-ctl-sm items-center justify-center rounded-control px-1.5 text-sm font-medium tabular-nums outline-none focus-ring-safe',
              'transition-[color,background-color,scale] duration-fast ease-out-soft active:scale-[0.97] motion-reduce:transition-none motion-reduce:active:scale-100',
              isCurrent
                ? twMerge('text-text-inverse', !indicator && 'bg-accent-default') // fallback before first measure
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
        className="flex h-ctl-sm min-w-ctl-sm items-center justify-center rounded-control text-text-secondary outline-none transition-[color,background-color,border-color,box-shadow,scale] duration-fast ease-out-soft focus-ring-safe hover:bg-surface-raised hover:text-text-primary active:scale-[0.97] disabled:pointer-events-none disabled:opacity-50 disabled:active:scale-100 aria-disabled:active:scale-100 motion-reduce:transition-none motion-reduce:active:scale-100"
      >
        <ChevronRight aria-hidden="true" size={16} />
      </button>
    </nav>
  );
}

Pagination.displayName = 'Pagination';
