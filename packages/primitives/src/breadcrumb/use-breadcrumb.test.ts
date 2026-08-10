import { renderHook } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useBreadcrumb } from './use-breadcrumb';

const sampleItems = [
  { label: 'Home', href: '/' },
  { label: 'Products', href: '/products' },
  { label: 'Electronics', href: '/products/electronics' },
  { label: 'Audio', href: '/products/electronics/audio' },
  { label: 'Headphones', href: '/products/electronics/audio/headphones' },
];

describe('useBreadcrumb primitive hook', () => {
  it('does not collapse when items.length <= maxItems', () => {
    const { result } = renderHook(() =>
      useBreadcrumb({ items: sampleItems.slice(0, 3), maxItems: 4 }),
    );

    expect(result.current.shouldCollapse).toBe(false);
    expect(result.current.startItems).toHaveLength(3);
    expect(result.current.collapsedItems).toHaveLength(0);
    expect(result.current.endItems).toHaveLength(0);
  });

  it('correctly splits start, collapsed, and end items when maxItems is exceeded', () => {
    const { result } = renderHook(() =>
      useBreadcrumb({
        items: sampleItems,
        maxItems: 3,
        itemsBeforeCollapse: 1,
        itemsAfterCollapse: 1,
      }),
    );

    expect(result.current.shouldCollapse).toBe(true);
    expect(result.current.startItems).toHaveLength(1);
    expect(result.current.startItems[0]?.label).toBe('Home');

    expect(result.current.endItems).toHaveLength(1);
    expect(result.current.endItems[0]?.label).toBe('Headphones');

    expect(result.current.collapsedItems).toHaveLength(3);
    expect(result.current.collapsedItems.map((i) => i.label)).toEqual([
      'Products',
      'Electronics',
      'Audio',
    ]);
  });

  it('provides aria-current="page" for the last item only', () => {
    const { result } = renderHook(() => useBreadcrumb({ items: sampleItems }));

    expect(result.current.getItemProps(0, 5)['aria-current']).toBeUndefined();
    expect(result.current.getItemProps(4, 5)['aria-current']).toBe('page');
  });
});
