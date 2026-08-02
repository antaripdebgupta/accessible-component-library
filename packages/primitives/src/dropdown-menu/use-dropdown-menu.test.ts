import { renderHook, act } from '@testing-library/react';
import { describe, test, expect, vi } from 'vitest';
import { useDropdownMenu } from './use-dropdown-menu';

function setupItems(hookResult: ReturnType<typeof useDropdownMenu>, values: string[]) {
  document.body.innerHTML = values.map((v) => `<button id="btn-${v}"></button>`).join('');
  values.forEach((v) => {
    const el = document.getElementById(`btn-${v}`) as HTMLButtonElement;
    act(() => hookResult.registerItem(v, { current: el }));
    act(() =>
      hookResult.updateItemMeta(v, {
        disabled: false,
        label: v,
        onSelect: () => {},
        closeOnSelect: true,
      }),
    );
  });
}

describe('useDropdownMenu — open/close', () => {
  test('starts closed by default', () => {
    const { result } = renderHook(() => useDropdownMenu());
    expect(result.current.open).toBe(false);
  });

  test('trigger click opens the menu', () => {
    const { result } = renderHook(() => useDropdownMenu());
    act(() => result.current.getTriggerProps().onClick());
    expect(result.current.open).toBe(true);
  });

  test('Escape closes the menu', () => {
    const { result } = renderHook(() => useDropdownMenu({ defaultOpen: true }));
    act(() => result.current.close());
    expect(result.current.open).toBe(false);
  });
});

describe('useDropdownMenu — focus management', () => {
  test('opening the menu resets activeValue; consumer calls focusFirst after mount', () => {
    const { result } = renderHook(() => useDropdownMenu({ defaultOpen: false }));
    setupItems(result.current, ['a', 'b', 'c']);
    act(() => result.current.setOpen(true));
    // The hook no longer auto-focuses on open — DropdownMenuContent calls
    // focusFirst() after its children mount so refs are populated.
    // Calling it explicitly here mirrors what the consumer does.
    act(() => result.current.focusFirst());
    expect(result.current.activeValue).toBe('a');
  });

  test('ArrowDown moves to the next item, wrapping', () => {
    const { result } = renderHook(() => useDropdownMenu({ defaultOpen: true }));
    setupItems(result.current, ['a', 'b', 'c']);
    act(() => result.current.focusItem('a'));

    act(() =>
      result.current
        .getContentProps()
        .onKeyDown({ key: 'ArrowDown', preventDefault: () => {} } as any),
    );
    expect(result.current.activeValue).toBe('b');

    act(() =>
      result.current
        .getContentProps()
        .onKeyDown({ key: 'ArrowDown', preventDefault: () => {} } as any),
    );
    expect(result.current.activeValue).toBe('c');

    act(() =>
      result.current
        .getContentProps()
        .onKeyDown({ key: 'ArrowDown', preventDefault: () => {} } as any),
    );
    expect(result.current.activeValue).toBe('a');
  });

  test('Home/End move to first/last item', () => {
    const { result } = renderHook(() => useDropdownMenu({ defaultOpen: true }));
    setupItems(result.current, ['a', 'b', 'c']);
    act(() => result.current.focusItem('b'));

    act(() =>
      result.current.getContentProps().onKeyDown({ key: 'End', preventDefault: () => {} } as any),
    );
    expect(result.current.activeValue).toBe('c');

    act(() =>
      result.current.getContentProps().onKeyDown({ key: 'Home', preventDefault: () => {} } as any),
    );
    expect(result.current.activeValue).toBe('a');
  });

  test('disabled items are skipped during ArrowDown navigation', () => {
    const { result } = renderHook(() => useDropdownMenu({ defaultOpen: true }));
    setupItems(result.current, ['a', 'b', 'c']);
    act(() =>
      result.current.updateItemMeta('b', {
        disabled: true,
        label: 'b',
        onSelect: () => {},
        closeOnSelect: true,
      }),
    );
    act(() => result.current.focusItem('a'));

    act(() =>
      result.current
        .getContentProps()
        .onKeyDown({ key: 'ArrowDown', preventDefault: () => {} } as any),
    );
    expect(result.current.activeValue).toBe('c');
  });
});

describe('useDropdownMenu — selection', () => {
  test('selecting an item calls onSelect and closes by default', () => {
    const onSelect = vi.fn();
    const { result } = renderHook(() => useDropdownMenu({ defaultOpen: true }));
    setupItems(result.current, ['a']);
    act(() =>
      result.current.updateItemMeta('a', {
        disabled: false,
        label: 'a',
        onSelect,
        closeOnSelect: true,
      }),
    );

    act(() => result.current.getItemProps('a', false, 'menuitem').onClick());
    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(result.current.open).toBe(false);
  });

  test('closeOnSelect=false keeps the menu open (checkbox/radio behavior)', () => {
    const onSelect = vi.fn();
    const { result } = renderHook(() => useDropdownMenu({ defaultOpen: true }));
    setupItems(result.current, ['a']);
    act(() =>
      result.current.updateItemMeta('a', {
        disabled: false,
        label: 'a',
        onSelect,
        closeOnSelect: false,
      }),
    );

    act(() => result.current.getItemProps('a', false, 'menuitemcheckbox').onClick());
    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(result.current.open).toBe(true);
  });

  test("disabled item's onClick does not call onSelect", () => {
    const onSelect = vi.fn();
    const { result } = renderHook(() => useDropdownMenu({ defaultOpen: true }));
    setupItems(result.current, ['a']);
    act(() =>
      result.current.updateItemMeta('a', {
        disabled: true,
        label: 'a',
        onSelect,
        closeOnSelect: true,
      }),
    );

    act(() => result.current.getItemProps('a', true, 'menuitem').onClick());
    expect(onSelect).not.toHaveBeenCalled();
  });
});

describe('useDropdownMenu — typeahead', () => {
  test('typing a letter jumps focus to the matching item', () => {
    const { result } = renderHook(() => useDropdownMenu({ defaultOpen: true }));
    setupItems(result.current, ['apple', 'banana', 'cherry']);
    act(() =>
      result.current.updateItemMeta('apple', {
        disabled: false,
        label: 'apple',
        onSelect: () => {},
        closeOnSelect: true,
      }),
    );
    act(() =>
      result.current.updateItemMeta('banana', {
        disabled: false,
        label: 'banana',
        onSelect: () => {},
        closeOnSelect: true,
      }),
    );
    act(() =>
      result.current.updateItemMeta('cherry', {
        disabled: false,
        label: 'cherry',
        onSelect: () => {},
        closeOnSelect: true,
      }),
    );
    act(() => result.current.focusItem('apple'));

    act(() =>
      result.current.getContentProps().onKeyDown({ key: 'c', preventDefault: () => {} } as any),
    );
    expect(result.current.activeValue).toBe('cherry');
  });
});
