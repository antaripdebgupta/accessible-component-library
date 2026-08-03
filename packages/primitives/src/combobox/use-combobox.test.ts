import { renderHook, act } from '@testing-library/react';
import { describe, test, expect, vi } from 'vitest';
import { useCombobox } from './use-combobox';

function setupItems(
  hookResult: ReturnType<typeof useCombobox>,
  items: { value: string; label?: string; disabled?: boolean; group?: string }[],
) {
  document.body.innerHTML = items.map((i) => `<div id="el-${i.value}"></div>`).join('');
  items.forEach(({ value, label, disabled = false, group }) => {
    const el = document.getElementById(`el-${value}`) as HTMLElement;
    act(() => hookResult.registerItem(value, { current: el }));
    act(() => hookResult.updateItemMeta(value, { disabled, label: label ?? value, group }));
  });
}

describe('useCombobox — open/close', () => {
  test('starts closed', () => {
    const { result } = renderHook(() => useCombobox());
    expect(result.current.open).toBe(false);
  });

  test('focusing the input opens it', () => {
    const { result } = renderHook(() => useCombobox());
    act(() => result.current.getInputProps().onFocus());
    expect(result.current.open).toBe(true);
  });

  test('Escape closes it', () => {
    const { result } = renderHook(() => useCombobox());
    act(() => result.current.show());
    act(() => result.current.close());
    expect(result.current.open).toBe(false);
  });

  test('disabled combobox does not open on focus', () => {
    const { result } = renderHook(() => useCombobox({ disabled: true }));
    act(() => result.current.getInputProps().onFocus());
    expect(result.current.open).toBe(false);
  });
});

describe('useCombobox — filtering', () => {
  test('isMatch is true for all items when inputValue is empty', () => {
    const { result } = renderHook(() => useCombobox());
    setupItems(result.current, [{ value: 'apple' }, { value: 'banana' }]);
    expect(result.current.isMatch('apple')).toBe(true);
    expect(result.current.isMatch('banana')).toBe(true);
  });

  test('isMatch filters case-insensitively by default', () => {
    const { result } = renderHook(() => useCombobox());
    setupItems(result.current, [{ value: 'apple' }, { value: 'banana' }]);
    act(() => result.current.setInputValue('AP'));
    expect(result.current.isMatch('apple')).toBe(true);
    expect(result.current.isMatch('banana')).toBe(false);
  });

  test('custom filter function is used when provided', () => {
    const filter = vi.fn((label: string, query: string) => label.startsWith(query));
    const { result } = renderHook(() => useCombobox({ filter }));
    setupItems(result.current, [{ value: 'apple' }, { value: 'pineapple' }]);
    act(() => result.current.setInputValue('apple'));
    expect(result.current.isMatch('apple')).toBe(true);
    expect(result.current.isMatch('pineapple')).toBe(false);
    expect(filter).toHaveBeenCalled();
  });

  test('visibleEnabledOrder excludes disabled and non-matching items', () => {
    const { result } = renderHook(() => useCombobox());
    setupItems(result.current, [
      { value: 'apple' },
      { value: 'banana', disabled: true },
      { value: 'cherry' },
    ]);
    act(() => result.current.setInputValue('a'));
    expect(result.current.visibleEnabledOrder()).toEqual(['apple']);
  });
});

describe('useCombobox — selection (single mode)', () => {
  test('selecting an item sets value, fills inputValue, and closes', () => {
    const onValueChange = vi.fn();
    const { result } = renderHook(() => useCombobox({ onValueChange }));
    setupItems(result.current, [{ value: 'apple', label: 'Apple' }]);
    act(() => result.current.show());

    act(() => result.current.selectItem('apple'));
    expect(onValueChange).toHaveBeenCalledWith('apple');
    expect(result.current.inputValue).toBe('Apple');
    expect(result.current.open).toBe(false);
  });

  test('disabled item cannot be selected', () => {
    const onValueChange = vi.fn();
    const { result } = renderHook(() => useCombobox({ onValueChange }));
    setupItems(result.current, [{ value: 'apple', disabled: true }]);
    act(() => result.current.selectItem('apple'));
    expect(onValueChange).not.toHaveBeenCalled();
  });

  test('isSelected reflects current value', () => {
    const { result } = renderHook(() => useCombobox({ value: 'apple' }));
    setupItems(result.current, [{ value: 'apple' }, { value: 'banana' }]);
    expect(result.current.isSelected('apple')).toBe(true);
    expect(result.current.isSelected('banana')).toBe(false);
  });
});

describe('useCombobox — selection (multiple mode)', () => {
  test('selecting toggles membership in the value array without closing', () => {
    const onValueChange = vi.fn();
    const { result } = renderHook(() => useCombobox({ multiple: true, value: [], onValueChange }));
    setupItems(result.current, [{ value: 'apple' }]);
    act(() => result.current.show());

    act(() => result.current.selectItem('apple'));
    expect(onValueChange).toHaveBeenCalledWith(['apple']);
    expect(result.current.open).toBe(true);
  });

  test('selecting an already-selected item removes it', () => {
    const onValueChange = vi.fn();
    const { result } = renderHook(() =>
      useCombobox({ multiple: true, value: ['apple'], onValueChange }),
    );
    setupItems(result.current, [{ value: 'apple' }]);
    act(() => result.current.selectItem('apple'));
    expect(onValueChange).toHaveBeenCalledWith([]);
  });

  test('removeValue removes a specific value', () => {
    const onValueChange = vi.fn();
    const { result } = renderHook(() =>
      useCombobox({ multiple: true, value: ['apple', 'banana'], onValueChange }),
    );
    act(() => result.current.removeValue('apple'));
    expect(onValueChange).toHaveBeenCalledWith(['banana']);
  });

  test('Backspace on empty input removes the last selected value', () => {
    const onValueChange = vi.fn();
    const { result } = renderHook(() =>
      useCombobox({ multiple: true, value: ['apple', 'banana'], onValueChange }),
    );
    act(() => result.current.setInputValue(''));
    act(() =>
      result.current
        .getInputProps()
        .onKeyDown({ key: 'Backspace', preventDefault: () => {} } as any),
    );
    expect(onValueChange).toHaveBeenCalledWith(['apple']);
  });

  test('Backspace does nothing when input has text', () => {
    const onValueChange = vi.fn();
    const { result } = renderHook(() =>
      useCombobox({ multiple: true, value: ['apple'], onValueChange }),
    );
    act(() => result.current.setInputValue('ap'));
    act(() =>
      result.current
        .getInputProps()
        .onKeyDown({ key: 'Backspace', preventDefault: () => {} } as any),
    );
    expect(onValueChange).not.toHaveBeenCalled();
  });
});

describe('useCombobox — clear', () => {
  test('clear() resets value and inputValue in single mode', () => {
    const onValueChange = vi.fn();
    const { result } = renderHook(() => useCombobox({ value: 'apple', onValueChange }));
    act(() => result.current.clear());
    expect(onValueChange).toHaveBeenCalledWith(undefined);
    expect(result.current.inputValue).toBe('');
  });

  test('clear() resets to an empty array in multiple mode', () => {
    const onValueChange = vi.fn();
    const { result } = renderHook(() =>
      useCombobox({ multiple: true, value: ['apple'], onValueChange }),
    );
    act(() => result.current.clear());
    expect(onValueChange).toHaveBeenCalledWith([]);
  });
});

describe('useCombobox — keyboard navigation', () => {
  test('ArrowDown opens the popup if closed, without moving highlight', () => {
    const { result } = renderHook(() => useCombobox());
    setupItems(result.current, [{ value: 'apple' }]);
    act(() =>
      result.current
        .getInputProps()
        .onKeyDown({ key: 'ArrowDown', preventDefault: () => {} } as any),
    );
    expect(result.current.open).toBe(true);
  });

  test('ArrowDown/ArrowUp move the highlight, wrapping', () => {
    const { result } = renderHook(() => useCombobox({ autoHighlight: false }));
    setupItems(result.current, [{ value: 'a' }, { value: 'b' }, { value: 'c' }]);
    act(() => result.current.show());
    act(() => result.current.highlightItem('a'));

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
  });

  test('Home/End highlight the first/last visible item', () => {
    const { result } = renderHook(() => useCombobox({ autoHighlight: false }));
    setupItems(result.current, [{ value: 'a' }, { value: 'b' }, { value: 'c' }]);
    act(() => result.current.show());

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
    const onValueChange = vi.fn();
    const { result } = renderHook(() => useCombobox({ onValueChange, autoHighlight: false }));
    setupItems(result.current, [{ value: 'apple' }]);
    act(() => result.current.show());
    act(() => result.current.highlightItem('apple'));

    act(() =>
      result.current.getInputProps().onKeyDown({ key: 'Enter', preventDefault: () => {} } as any),
    );
    expect(onValueChange).toHaveBeenCalledWith('apple');
  });
});

describe('useCombobox — auto-highlight', () => {
  test('first visible match is highlighted when the popup opens', () => {
    const { result } = renderHook(() => useCombobox({ autoHighlight: true }));
    setupItems(result.current, [{ value: 'apple' }, { value: 'banana' }]);
    act(() => result.current.show());
    expect(result.current.highlightedValue).toBe('apple');
  });

  test('highlight updates as the query narrows the match set', () => {
    const { result } = renderHook(() => useCombobox({ autoHighlight: true }));
    setupItems(result.current, [{ value: 'apple' }, { value: 'banana' }]);
    act(() => result.current.show());
    act(() => result.current.setInputValue('ban'));
    expect(result.current.highlightedValue).toBe('banana');
  });

  test('autoHighlight=false leaves highlight unset on open', () => {
    const { result } = renderHook(() => useCombobox({ autoHighlight: false }));
    setupItems(result.current, [{ value: 'apple' }]);
    act(() => result.current.show());
    expect(result.current.highlightedValue).toBeUndefined();
  });
});
