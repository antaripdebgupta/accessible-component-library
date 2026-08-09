import { renderHook, act } from '@testing-library/react';
import { describe, test, expect, vi } from 'vitest';
import { usePagination } from './use-pagination';

describe('usePagination', () => {
  test('initializes default values correctly', () => {
    const { result } = renderHook(() => usePagination({ pageCount: 10 }));
    expect(result.current.currentPage).toBe(1);
    expect(result.current.pageCount).toBe(10);
  });

  test('controlled value works and respects changes', () => {
    const onPageChange = vi.fn();
    const { result, rerender } = renderHook(
      ({ currentPage }) =>
        usePagination({
          pageCount: 10,
          currentPage,
          onPageChange,
        }),
      { initialProps: { currentPage: 3 } },
    );

    expect(result.current.currentPage).toBe(3);
    act(() => result.current.next());
    expect(onPageChange).toHaveBeenCalledWith(4);
  });

  test('clamped to page count boundaries', () => {
    const { result } = renderHook(() => usePagination({ pageCount: 5, defaultCurrentPage: 5 }));
    expect(result.current.currentPage).toBe(5);

    act(() => result.current.next());
    expect(result.current.currentPage).toBe(5);

    act(() => result.current.prev());
    expect(result.current.currentPage).toBe(4);

    act(() => result.current.goTo(1));
    expect(result.current.currentPage).toBe(1);

    act(() => result.current.prev());
    expect(result.current.currentPage).toBe(1);
  });

  test('correctly calculates pages with ellipses', () => {
    const { result } = renderHook(() =>
      usePagination({ pageCount: 10, defaultCurrentPage: 5, siblingCount: 1, boundaryCount: 1 }),
    );
    // pages should be [1, 'ellipsis', 4, 5, 6, 'ellipsis', 10]
    expect(result.current.pages).toEqual([1, 'ellipsis', 4, 5, 6, 'ellipsis', 10]);
  });

  test('renders all pages when pageCount is small', () => {
    const { result } = renderHook(() =>
      usePagination({ pageCount: 5, defaultCurrentPage: 3, siblingCount: 1, boundaryCount: 1 }),
    );
    expect(result.current.pages).toEqual([1, 2, 3, 4, 5]);
  });

  test('button prop getters return correct properties', () => {
    const { result } = renderHook(() => usePagination({ pageCount: 5, defaultCurrentPage: 1 }));

    const rootProps = result.current.getRootProps();
    expect(rootProps.role).toBe('navigation');
    expect(rootProps['aria-label']).toBe('Pagination');

    const prevProps = result.current.getPrevButtonProps();
    expect(prevProps.disabled).toBe(true);
    expect(prevProps['aria-disabled']).toBe('true');

    const nextProps = result.current.getNextButtonProps();
    expect(nextProps.disabled).toBe(false);
    expect(nextProps['aria-disabled']).toBeUndefined();

    const page1Props = result.current.getPageButtonProps(1);
    expect(page1Props['aria-current']).toBe('page');
    expect(page1Props['aria-label']).toBe('Page 1');

    const page2Props = result.current.getPageButtonProps(2);
    expect(page2Props['aria-current']).toBeUndefined();
  });
});
