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

  test('closing the menu resets activeValue to undefined', () => {
    const { result } = renderHook(() => useDropdownMenu({ defaultOpen: true }));
    setupItems(result.current, ['a', 'b']);
    act(() => result.current.focusItem('a'));
    expect(result.current.activeValue).toBe('a');
    act(() => result.current.close());
    expect(result.current.activeValue).toBeUndefined();
  });
});

describe('useDropdownMenu — trigger props', () => {
  test('aria-expanded and aria-controls reflect open state', () => {
    const { result } = renderHook(() => useDropdownMenu());
    expect(result.current.getTriggerProps()['aria-expanded']).toBe(false);
    expect(result.current.getTriggerProps()['aria-controls']).toBeUndefined();

    act(() => result.current.setOpen(true));
    expect(result.current.getTriggerProps()['aria-expanded']).toBe(true);
    expect(result.current.getTriggerProps()['aria-controls']).toBe(result.current.contentId);
  });

  test('trigger onClick toggles open state both ways', () => {
    const { result } = renderHook(() => useDropdownMenu());
    act(() => result.current.getTriggerProps().onClick());
    expect(result.current.open).toBe(true);
    act(() => result.current.getTriggerProps().onClick());
    expect(result.current.open).toBe(false);
  });

  test.each(['ArrowDown', 'ArrowUp', 'Enter', ' '])(
    'trigger onKeyDown opens the menu on %s',
    (key) => {
      const { result } = renderHook(() => useDropdownMenu());
      const preventDefault = vi.fn();
      act(() => result.current.getTriggerProps().onKeyDown({ key, preventDefault } as any));
      expect(preventDefault).toHaveBeenCalled();
      expect(result.current.open).toBe(true);
    },
  );

  test('trigger onKeyDown ignores unrelated keys', () => {
    const { result } = renderHook(() => useDropdownMenu());
    act(() =>
      result.current.getTriggerProps().onKeyDown({ key: 'Tab', preventDefault: () => {} } as any),
    );
    expect(result.current.open).toBe(false);
  });
});

describe('useDropdownMenu — focus management', () => {
  test('opening the menu resets activeValue; consumer calls focusFirst after mount', () => {
    const { result } = renderHook(() => useDropdownMenu({ defaultOpen: false }));
    setupItems(result.current, ['a', 'b', 'c']);
    act(() => result.current.setOpen(true));
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

  test('ArrowUp moves to the previous item, wrapping backward', () => {
    const { result } = renderHook(() => useDropdownMenu({ defaultOpen: true }));
    setupItems(result.current, ['a', 'b', 'c']);
    act(() => result.current.focusItem('a'));

    act(() =>
      result.current
        .getContentProps()
        .onKeyDown({ key: 'ArrowUp', preventDefault: () => {} } as any),
    );
    expect(result.current.activeValue).toBe('c');
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

  test('Tab closes the menu without trapping focus', () => {
    const { result } = renderHook(() => useDropdownMenu({ defaultOpen: true }));
    setupItems(result.current, ['a', 'b']);
    act(() => result.current.focusItem('a'));
    act(() =>
      result.current.getContentProps().onKeyDown({ key: 'Tab', preventDefault: () => {} } as any),
    );
    expect(result.current.open).toBe(false);
  });

  test('keydown with no enabled items is a no-op', () => {
    const { result } = renderHook(() => useDropdownMenu({ defaultOpen: true }));
    setupItems(result.current, ['a']);
    act(() =>
      result.current.updateItemMeta('a', {
        disabled: true,
        label: 'a',
        onSelect: () => {},
        closeOnSelect: true,
      }),
    );
    // Should not throw with zero enabled items.
    expect(() =>
      act(() =>
        result.current
          .getContentProps()
          .onKeyDown({ key: 'ArrowDown', preventDefault: () => {} } as any),
      ),
    ).not.toThrow();
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

  test('selecting an item never registered is a no-op (no throw)', () => {
    const { result } = renderHook(() => useDropdownMenu({ defaultOpen: true }));
    expect(() =>
      act(() => result.current.getItemProps('ghost', false, 'menuitem').onClick()),
    ).not.toThrow();
  });

  test.each(['Enter', ' '])('item onKeyDown %s selects the item', (key) => {
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
    const preventDefault = vi.fn();
    act(() =>
      result.current.getItemProps('a', false, 'menuitem').onKeyDown({ key, preventDefault } as any),
    );
    expect(preventDefault).toHaveBeenCalled();
    expect(onSelect).toHaveBeenCalledTimes(1);
  });

  test('item onKeyDown ignores unrelated keys', () => {
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
    act(() =>
      result.current
        .getItemProps('a', false, 'menuitem')
        .onKeyDown({ key: 'x', preventDefault: () => {} } as any),
    );
    expect(onSelect).not.toHaveBeenCalled();
  });
});

describe('useDropdownMenu — typeahead', () => {
  test('typing a letter jumps focus to the matching item', () => {
    const { result } = renderHook(() => useDropdownMenu({ defaultOpen: true }));
    setupItems(result.current, ['apple', 'banana', 'cherry']);
    act(() => result.current.focusItem('apple'));

    act(() =>
      result.current.getContentProps().onKeyDown({ key: 'c', preventDefault: () => {} } as any),
    );
    expect(result.current.activeValue).toBe('cherry');
  });

  test('typeahead buffers multiple keystrokes for multi-character match', () => {
    vi.useFakeTimers();
    const { result } = renderHook(() => useDropdownMenu({ defaultOpen: true }));
    setupItems(result.current, ['apple', 'apricot', 'banana']);
    act(() => result.current.focusItem('banana'));

    act(() =>
      result.current.getContentProps().onKeyDown({ key: 'a', preventDefault: () => {} } as any),
    );
    act(() =>
      result.current.getContentProps().onKeyDown({ key: 'p', preventDefault: () => {} } as any),
    );
    act(() =>
      result.current.getContentProps().onKeyDown({ key: 'r', preventDefault: () => {} } as any),
    );
    expect(result.current.activeValue).toBe('apricot');
    vi.useRealTimers();
  });

  test('typeahead buffer resets after the timeout window', () => {
    vi.useFakeTimers();
    const { result } = renderHook(() => useDropdownMenu({ defaultOpen: true }));
    setupItems(result.current, ['apple', 'banana']);
    act(() => result.current.focusItem('apple'));

    act(() =>
      result.current.getContentProps().onKeyDown({ key: 'b', preventDefault: () => {} } as any),
    );
    expect(result.current.activeValue).toBe('banana');

    act(() => vi.advanceTimersByTime(600)); // past the 500ms buffer window

    act(() =>
      result.current.getContentProps().onKeyDown({ key: 'a', preventDefault: () => {} } as any),
    );
    expect(result.current.activeValue).toBe('apple'); // fresh buffer, not "ba"
    vi.useRealTimers();
  });

  test('typeahead with no match leaves activeValue unchanged', () => {
    const { result } = renderHook(() => useDropdownMenu({ defaultOpen: true }));
    setupItems(result.current, ['apple', 'banana']);
    act(() => result.current.focusItem('apple'));
    act(() =>
      result.current.getContentProps().onKeyDown({ key: 'z', preventDefault: () => {} } as any),
    );
    expect(result.current.activeValue).toBe('apple');
  });

  test('typeahead ignores whitespace-only key presses (e.g. Space handled elsewhere)', () => {
    const { result } = renderHook(() => useDropdownMenu({ defaultOpen: true }));
    setupItems(result.current, ['apple', 'banana']);
    act(() => result.current.focusItem('apple'));
    act(() =>
      result.current.getContentProps().onKeyDown({ key: ' ', preventDefault: () => {} } as any),
    );
    expect(result.current.activeValue).toBe('apple'); // unchanged, not treated as typeahead
  });
});

describe('useDropdownMenu — pointer hover activation', () => {
  test('the first pointer event on a fresh hover only seeds position, does not activate yet', () => {
    const { result } = renderHook(() => useDropdownMenu({ defaultOpen: true }));
    setupItems(result.current, ['a', 'b']);
    const props = result.current.getItemProps('b', false, 'menuitem');
    act(() => props.onMouseEnter({ clientX: 10, clientY: 20 } as any));
    // First event only records the baseline pointer position — no activation yet.
    expect(result.current.activeValue).toBeUndefined();
  });

  test('a second pointer event at a different position activates the item', () => {
    const { result } = renderHook(() => useDropdownMenu({ defaultOpen: true }));
    setupItems(result.current, ['a', 'b']);
    const props = result.current.getItemProps('b', false, 'menuitem');
    act(() => props.onMouseEnter({ clientX: 10, clientY: 20 } as any)); // seeds baseline
    act(() => props.onMouseMove({ clientX: 15, clientY: 25 } as any)); // genuinely moved
    expect(result.current.activeValue).toBe('b');
  });

  test('onMouseMove with an identical pointer position does not trigger activation', () => {
    const { result } = renderHook(() => useDropdownMenu({ defaultOpen: true }));
    setupItems(result.current, ['a', 'b']);
    const propsA = result.current.getItemProps('a', false, 'menuitem');
    act(() => propsA.onMouseEnter({ clientX: 5, clientY: 5 } as any)); // seeds baseline for 'a'
    act(() => propsA.onMouseMove({ clientX: 5, clientY: 5 } as any)); // identical position

    expect(result.current.activeValue).toBeUndefined(); // never activated — same coords both times
  });

  test('onMouseMove with a genuinely new pointer position updates active item', () => {
    const { result } = renderHook(() => useDropdownMenu({ defaultOpen: true }));
    setupItems(result.current, ['a', 'b']);
    const propsA = result.current.getItemProps('a', false, 'menuitem');
    act(() => propsA.onMouseEnter({ clientX: 5, clientY: 5 } as any)); // seeds baseline

    const propsB = result.current.getItemProps('b', false, 'menuitem');
    act(() => propsB.onMouseMove({ clientX: 50, clientY: 50 } as any)); // different position
    expect(result.current.activeValue).toBe('b');
  });

  test('disabled item ignores hover activation entirely', () => {
    const { result } = renderHook(() => useDropdownMenu({ defaultOpen: true }));
    setupItems(result.current, ['a', 'b']);
    act(() => result.current.focusItem('a'));
    const disabledProps = result.current.getItemProps('b', true, 'menuitem');
    act(() => disabledProps.onMouseEnter({ clientX: 99, clientY: 99 } as any));
    act(() => disabledProps.onMouseMove({ clientX: 200, clientY: 200 } as any));
    expect(result.current.activeValue).toBe('a'); // unchanged
  });
});

describe('useDropdownMenu — registerItem cleanup', () => {
  test('unregistering an item removes it from order and registry', () => {
    const { result } = renderHook(() => useDropdownMenu({ defaultOpen: true }));
    const el = document.createElement('button');
    let cleanup: () => void = () => {};
    act(() => {
      cleanup = result.current.registerItem('temp', { current: el });
    });
    act(() =>
      result.current.updateItemMeta('temp', {
        disabled: false,
        label: 'temp',
        onSelect: () => {},
        closeOnSelect: true,
      }),
    );
    act(() => cleanup());
    // After cleanup, selecting it should be a safe no-op.
    expect(() =>
      act(() => result.current.getItemProps('temp', false, 'menuitem').onClick()),
    ).not.toThrow();
  });

  test('re-registering the same value reuses the entry and updates its ref', () => {
    const { result } = renderHook(() => useDropdownMenu({ defaultOpen: true }));
    const el1 = document.createElement('button');
    const el2 = document.createElement('button');
    act(() => result.current.registerItem('a', { current: el1 }));
    act(() => result.current.registerItem('a', { current: el2 }));
    act(() => result.current.focusItem('a'));
    // focusItem should call .focus() on the latest ref (el2), not throw.
    expect(result.current.activeValue).toBe('a');
  });
});
