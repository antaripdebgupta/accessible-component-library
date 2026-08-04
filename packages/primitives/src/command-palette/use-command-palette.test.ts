import { renderHook, act } from '@testing-library/react';
import { describe, test, expect, vi } from 'vitest';
import { useCommandPalette } from './use-command-palette';

function setupItems(
  hookResult: ReturnType<typeof useCommandPalette>,
  items: { value: string; label?: string; disabled?: boolean; onSelect?: () => void }[],
) {
  document.body.innerHTML = items.map((i) => `<div id="el-${i.value}"></div>`).join('');
  items.forEach(({ value, label, disabled = false, onSelect = () => {} }) => {
    const el = document.getElementById(`el-${value}`) as HTMLElement;
    act(() => hookResult.registerItem(value, { current: el }));
    act(() => hookResult.updateItemMeta(value, { disabled, label: label ?? value, onSelect }));
  });
}

describe('useCommandPalette — open/close', () => {
  test('starts closed by default', () => {
    const { result } = renderHook(() => useCommandPalette());
    expect(result.current.open).toBe(false);
  });

  test('show()/close() toggle open state', () => {
    const { result } = renderHook(() => useCommandPalette());
    act(() => result.current.show());
    expect(result.current.open).toBe(true);
    act(() => result.current.close());
    expect(result.current.open).toBe(false);
  });

  test('controlled open drives state; onOpenChange fires', () => {
    const onOpenChange = vi.fn();
    const { result } = renderHook(() => useCommandPalette({ open: false, onOpenChange }));
    act(() => result.current.show());
    expect(onOpenChange).toHaveBeenCalledWith(true);
  });
});

describe('useCommandPalette — highlight defaults', () => {
  test('highlight defaults to the first enabled item once items register', () => {
    const { result } = renderHook(() => useCommandPalette());
    setupItems(result.current, [{ value: 'a' }, { value: 'b' }]);
    expect(result.current.highlightedValue).toBe('a');
  });

  test('disabled items are excluded from the default highlight', () => {
    const { result } = renderHook(() => useCommandPalette());
    setupItems(result.current, [{ value: 'a', disabled: true }, { value: 'b' }]);
    expect(result.current.highlightedValue).toBe('b');
  });

  test('highlight resets to a valid item when the registry changes shape', () => {
    const { result } = renderHook(() => useCommandPalette());
    let unregisterA: () => void = () => {};
    act(() => {
      unregisterA = result.current.registerItem('a', { current: document.createElement('div') });
    });
    act(() =>
      result.current.updateItemMeta('a', { disabled: false, label: 'a', onSelect: () => {} }),
    );
    expect(result.current.highlightedValue).toBe('a');

    act(() => unregisterA());
    expect(result.current.highlightedValue).toBeUndefined();
  });
});

describe('useCommandPalette — keyboard navigation', () => {
  test('ArrowDown/ArrowUp move the highlight, wrapping', () => {
    const { result } = renderHook(() => useCommandPalette());
    setupItems(result.current, [{ value: 'a' }, { value: 'b' }, { value: 'c' }]);

    act(() =>
      result.current
        .getInputProps()
        .onKeyDown({ key: 'ArrowDown', preventDefault: () => {} } as any),
    );
    expect(result.current.highlightedValue).toBe('b');

    act(() =>
      result.current
        .getInputProps()
        .onKeyDown({ key: 'ArrowDown', preventDefault: () => {} } as any),
    );
    expect(result.current.highlightedValue).toBe('c');

    act(() =>
      result.current
        .getInputProps()
        .onKeyDown({ key: 'ArrowDown', preventDefault: () => {} } as any),
    );
    expect(result.current.highlightedValue).toBe('a');

    act(() =>
      result.current.getInputProps().onKeyDown({ key: 'ArrowUp', preventDefault: () => {} } as any),
    );
    expect(result.current.highlightedValue).toBe('c');
  });

  test('loop=false clamps at the first/last item instead of wrapping', () => {
    const { result } = renderHook(() => useCommandPalette({ loop: false }));
    setupItems(result.current, [{ value: 'a' }, { value: 'b' }]);

    act(() =>
      result.current.getInputProps().onKeyDown({ key: 'ArrowUp', preventDefault: () => {} } as any),
    );
    expect(result.current.highlightedValue).toBe('a');
  });

  test('Home/End highlight the first/last item', () => {
    const { result } = renderHook(() => useCommandPalette());
    setupItems(result.current, [{ value: 'a' }, { value: 'b' }, { value: 'c' }]);

    act(() =>
      result.current.getInputProps().onKeyDown({ key: 'End', preventDefault: () => {} } as any),
    );
    expect(result.current.highlightedValue).toBe('c');

    act(() =>
      result.current.getInputProps().onKeyDown({ key: 'Home', preventDefault: () => {} } as any),
    );
    expect(result.current.highlightedValue).toBe('a');
  });

  test('Enter selects the highlighted item', () => {
    const onSelect = vi.fn();
    const { result } = renderHook(() => useCommandPalette());
    setupItems(result.current, [{ value: 'a', onSelect }]);

    act(() =>
      result.current.getInputProps().onKeyDown({ key: 'Enter', preventDefault: () => {} } as any),
    );
    expect(onSelect).toHaveBeenCalledTimes(1);
  });

  test('Enter falls back to the first enabled item when nothing is highlighted yet', () => {
    const onSelect = vi.fn();
    const { result } = renderHook(() => useCommandPalette());
    setupItems(result.current, [{ value: 'a', onSelect }, { value: 'b' }]);

    act(() =>
      result.current.getInputProps().onKeyDown({ key: 'Enter', preventDefault: () => {} } as any),
    );
    expect(onSelect).toHaveBeenCalledTimes(1);
  });

  test("disabled item's onSelect is never called via selectItem", () => {
    const onSelect = vi.fn();
    const { result } = renderHook(() => useCommandPalette());
    setupItems(result.current, [{ value: 'a', disabled: true, onSelect }]);

    act(() => result.current.selectItem('a'));
    expect(onSelect).not.toHaveBeenCalled();
  });
});

describe('useCommandPalette — aria wiring', () => {
  test("aria-activedescendant tracks the highlighted item's id", () => {
    const { result } = renderHook(() => useCommandPalette());
    setupItems(result.current, [{ value: 'a' }]);
    expect(result.current.getInputProps()['aria-activedescendant']).toBe(
      `${result.current.baseId}-item-a`,
    );
  });

  test('aria-expanded is always true regardless of open state', () => {
    const { result } = renderHook(() => useCommandPalette());
    expect(result.current.getInputProps()['aria-expanded']).toBe(true);
  });
});
