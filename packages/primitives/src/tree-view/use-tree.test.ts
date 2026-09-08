import { renderHook, act } from '@testing-library/react';
import { describe, test, expect, vi } from 'vitest';
import { createRef } from 'react';
import { useTree } from './use-tree';

function setupTree() {
  const { result } = renderHook(() => useTree({ defaultExpanded: ['src'] }));

  act(() => {
    result.current.registerItem('src', null, createRef<HTMLElement>(), false, true, 'src');
    result.current.registerItem(
      'index.ts',
      'src',
      createRef<HTMLElement>(),
      false,
      false,
      'index.ts',
    );
    result.current.registerItem('app.ts', 'src', createRef<HTMLElement>(), false, false, 'app.ts');
    result.current.registerItem(
      'package.json',
      null,
      createRef<HTMLElement>(),
      false,
      false,
      'package.json',
    );
  });

  return result;
}

function setupWithDom() {
  const result = setupTree(); // src expanded by default, contains index.ts + app.ts
  document.body.innerHTML = `
    <button id="${result.current.getItemProps('src', { hasChildren: true }).id}"></button>
    <button id="${result.current.getItemProps('index.ts', {}).id}"></button>
    <button id="${result.current.getItemProps('app.ts', {}).id}"></button>
    <button id="${result.current.getItemProps('package.json', {}).id}"></button>
  `;
  return result;
}

describe('useTree — registration & ARIA wiring', () => {
  test('root tree props include role=tree', () => {
    const result = setupTree();
    expect(result.current.getTreeProps().role).toBe('tree');
  });

  test('multiselectable is only set when selectionMode=multiple', () => {
    const { result } = renderHook(() => useTree({ selectionMode: 'multiple' }));
    expect(result.current.getTreeProps()['aria-multiselectable']).toBe(true);

    const { result: single } = renderHook(() => useTree({ selectionMode: 'single' }));
    expect(single.current.getTreeProps()['aria-multiselectable']).toBeUndefined();
  });

  test('item props expose level, setsize, posinset correctly', () => {
    const result = setupTree();
    const indexProps = result.current.getItemProps('index.ts', { hasChildren: false, level: 2 });
    expect(indexProps['aria-level']).toBe(2);
    expect(indexProps['aria-setsize']).toBe(2); // index.ts + app.ts under src
    expect(indexProps['aria-posinset']).toBe(1);

    const appProps = result.current.getItemProps('app.ts', { hasChildren: false, level: 2 });
    expect(appProps['aria-posinset']).toBe(2);
  });

  test('branch node exposes aria-expanded, leaf node does not', () => {
    const result = setupTree();
    const srcProps = result.current.getItemProps('src', { hasChildren: true, level: 1 });
    expect(srcProps['aria-expanded']).toBe(true); // defaultExpanded includes "src"

    const leafProps = result.current.getItemProps('package.json', { hasChildren: false, level: 1 });
    expect(leafProps['aria-expanded']).toBeUndefined();
  });
});

describe('useTree — expand/collapse', () => {
  test('toggleExpanded flips expanded state', () => {
    const { result } = renderHook(() => useTree({}));
    act(() => result.current.registerItem('a', null, createRef<HTMLElement>(), false, true, 'a'));

    expect(result.current.isExpanded('a')).toBe(false);
    act(() => result.current.toggleExpanded('a'));
    expect(result.current.isExpanded('a')).toBe(true);
    act(() => result.current.toggleExpanded('a'));
    expect(result.current.isExpanded('a')).toBe(false);
  });

  test('controlled expanded prop drives state and calls onExpandedChange', () => {
    const onExpandedChange = vi.fn();
    const { result } = renderHook(() => useTree({ expanded: ['a'], onExpandedChange }));
    act(() => result.current.registerItem('a', null, createRef<HTMLElement>(), false, true, 'a'));
    expect(result.current.isExpanded('a')).toBe(true);

    act(() => result.current.toggleExpanded('a'));
    expect(onExpandedChange).toHaveBeenCalledWith([]);
  });
});

describe('useTree — selection', () => {
  test('single selection mode allows only one selected item', () => {
    const { result } = renderHook(() => useTree({ selectionMode: 'single' }));
    act(() => {
      result.current.registerItem('a', null, createRef<HTMLElement>(), false, false, 'a');
      result.current.registerItem('b', null, createRef<HTMLElement>(), false, false, 'b');
    });

    act(() => result.current.getItemProps('a', {}).onClick());
    expect(result.current.isSelected('a')).toBe(true);

    act(() => result.current.getItemProps('b', {}).onClick());
    expect(result.current.isSelected('a')).toBe(false);
    expect(result.current.isSelected('b')).toBe(true);
  });

  test('multiple selection mode toggles independently', () => {
    const { result } = renderHook(() => useTree({ selectionMode: 'multiple' }));
    act(() => {
      result.current.registerItem('a', null, createRef<HTMLElement>(), false, false, 'a');
      result.current.registerItem('b', null, createRef<HTMLElement>(), false, false, 'b');
    });

    act(() => result.current.getItemProps('a', {}).onClick());
    act(() => result.current.getItemProps('b', {}).onClick());
    expect(result.current.isSelected('a')).toBe(true);
    expect(result.current.isSelected('b')).toBe(true);

    act(() => result.current.getItemProps('a', {}).onClick());
    expect(result.current.isSelected('a')).toBe(false);
    expect(result.current.isSelected('b')).toBe(true);
  });

  test('selectionMode=none never marks anything selected', () => {
    const { result } = renderHook(() => useTree({ selectionMode: 'none' }));
    act(() => result.current.registerItem('a', null, createRef<HTMLElement>(), false, false, 'a'));
    act(() => result.current.getItemProps('a', {}).onClick());
    expect(result.current.isSelected('a')).toBe(false);
    expect(result.current.getItemProps('a', {})['aria-selected']).toBeUndefined();
  });

  test('disabled item cannot be selected', () => {
    const { result } = renderHook(() => useTree({}));
    act(() => result.current.registerItem('a', null, createRef<HTMLElement>(), true, false, 'a'));
    act(() => result.current.getItemProps('a', { disabled: true }).onClick());
    expect(result.current.isSelected('a')).toBe(false);
  });
});

describe('useTree — keyboard navigation (visible items only)', () => {
  function setupWithDom() {
    const result = setupTree(); // src expanded by default, contains index.ts + app.ts
    document.body.innerHTML = `
      <button id="${result.current.getItemProps('src', { hasChildren: true }).id}"></button>
      <button id="${result.current.getItemProps('index.ts', {}).id}"></button>
      <button id="${result.current.getItemProps('app.ts', {}).id}"></button>
      <button id="${result.current.getItemProps('package.json', {}).id}"></button>
    `;
    return result;
  }

  test('ArrowDown moves from src into its first expanded child', () => {
    const result = setupWithDom();
    act(() =>
      result.current.getItemProps('src', { hasChildren: true }).onKeyDown({
        key: 'ArrowDown',
        preventDefault: () => {},
      } as any),
    );
    const indexEl = document.getElementById(result.current.getItemProps('index.ts', {}).id)!;
    expect(document.activeElement).toBe(indexEl);
  });

  test("collapsed branch's children are skipped during ArrowDown", () => {
    const { result } = renderHook(() => useTree({})); // nothing expanded
    act(() => {
      result.current.registerItem('src', null, createRef<HTMLElement>(), false, true, 'src');
      result.current.registerItem(
        'hidden.ts',
        'src',
        createRef<HTMLElement>(),
        false,
        false,
        'hidden.ts',
      );
      result.current.registerItem(
        'package.json',
        null,
        createRef<HTMLElement>(),
        false,
        false,
        'package.json',
      );
    });
    document.body.innerHTML = `
      <button id="${result.current.getItemProps('src', { hasChildren: true }).id}"></button>
      <button id="${result.current.getItemProps('package.json', {}).id}"></button>
    `;
    act(() =>
      result.current.getItemProps('src', { hasChildren: true }).onKeyDown({
        key: 'ArrowDown',
        preventDefault: () => {},
      } as any),
    );
    const pkgEl = document.getElementById(result.current.getItemProps('package.json', {}).id)!;
    expect(document.activeElement).toBe(pkgEl); // skipped hidden.ts entirely
  });

  test('ArrowRight on collapsed branch expands it', () => {
    const { result } = renderHook(() => useTree({}));
    act(() => {
      result.current.registerItem('src', null, createRef<HTMLElement>(), false, true, 'src');
      result.current.registerItem('child', 'src', createRef<HTMLElement>(), false, false, 'child');
    });
    document.body.innerHTML = `
      <button id="${result.current.getItemProps('src', { hasChildren: true }).id}"></button>
      <button id="${result.current.getItemProps('child', {}).id}"></button>
    `;
    expect(result.current.isExpanded('src')).toBe(false);
    act(() =>
      result.current.getItemProps('src', { hasChildren: true }).onKeyDown({
        key: 'ArrowRight',
        preventDefault: () => {},
      } as any),
    );
    expect(result.current.isExpanded('src')).toBe(true);
  });

  test('ArrowLeft on expanded branch collapses it; on leaf/collapsed moves to parent', () => {
    const result = setupWithDom();
    act(() =>
      result.current.getItemProps('src', { hasChildren: true }).onKeyDown({
        key: 'ArrowLeft',
        preventDefault: () => {},
      } as any),
    );
    expect(result.current.isExpanded('src')).toBe(false);
  });

  test('Home/End jump to first/last visible item', () => {
    const result = setupWithDom();
    act(() =>
      result.current.getItemProps('src', { hasChildren: true }).onKeyDown({
        key: 'End',
        preventDefault: () => {},
      } as any),
    );
    const pkgEl = document.getElementById(result.current.getItemProps('package.json', {}).id)!;
    expect(document.activeElement).toBe(pkgEl);

    act(() =>
      result.current.getItemProps('package.json', {}).onKeyDown({
        key: 'Home',
        preventDefault: () => {},
      } as any),
    );
    const srcEl = document.getElementById(
      result.current.getItemProps('src', { hasChildren: true }).id,
    )!;
    expect(document.activeElement).toBe(srcEl);
  });

  test('Enter/Space selects and toggles a branch', () => {
    const result = setupWithDom();
    act(() =>
      result.current.getItemProps('src', { hasChildren: true }).onKeyDown({
        key: 'Enter',
        preventDefault: () => {},
      } as any),
    );
    expect(result.current.isSelected('src')).toBe(true);
    expect(result.current.isExpanded('src')).toBe(false); // was expanded, Enter toggles it
  });

  test('asterisk key expands all sibling branches', () => {
    const { result } = renderHook(() => useTree({}));
    act(() => {
      result.current.registerItem('a', null, createRef<HTMLElement>(), false, true, 'a');
      result.current.registerItem('b', null, createRef<HTMLElement>(), false, true, 'b');
      result.current.registerItem('c', null, createRef<HTMLElement>(), false, false, 'c');
    });
    act(() =>
      result.current.getItemProps('a', { hasChildren: true }).onKeyDown({
        key: '*',
        preventDefault: () => {},
      } as any),
    );
    expect(result.current.isExpanded('a')).toBe(true);
    expect(result.current.isExpanded('b')).toBe(true);
  });
});

describe('useTree — ArrowRight on an already-expanded branch moves into first child', () => {
  test('focuses the first child instead of re-toggling expansion', () => {
    const result = setupWithDom();
    act(() =>
      result.current.getItemProps('src', { hasChildren: true }).onKeyDown({
        key: 'ArrowRight',
        preventDefault: () => {},
      } as any),
    );
    const indexEl = document.getElementById(result.current.getItemProps('index.ts', {}).id)!;
    expect(document.activeElement).toBe(indexEl);
    expect(result.current.isExpanded('src')).toBe(true); // stayed expanded, didn't toggle
  });
});

describe('useTree — typeahead', () => {
  test('typing jumps focus to the next visible item whose label matches', () => {
    const result = setupWithDom();
    act(() =>
      result.current.getItemProps('src', { hasChildren: true }).onKeyDown({
        key: 'a',
        preventDefault: () => {},
      } as any),
    );
    const appEl = document.getElementById(result.current.getItemProps('app.ts', {}).id)!;
    expect(document.activeElement).toBe(appEl);
  });

  test('modifier-held key presses are ignored by typeahead', () => {
    const result = setupWithDom();
    act(() =>
      result.current.getItemProps('src', { hasChildren: true }).onKeyDown({
        key: 'a',
        ctrlKey: true,
        preventDefault: () => {},
      } as any),
    );
    // Ctrl+a should not trigger typeahead navigation.
    const srcEl = document.getElementById(
      result.current.getItemProps('src', { hasChildren: true }).id,
    )!;
    expect(document.activeElement).not.toBe(
      document.getElementById(result.current.getItemProps('app.ts', {}).id)!,
    );
  });
});

describe('useTree — asterisk expands only branch siblings', () => {
  test('leaf siblings are unaffected by asterisk expansion', () => {
    const { result } = renderHook(() => useTree({}));
    act(() => {
      result.current.registerItem('a', null, createRef<HTMLElement>(), false, true, 'a');
      result.current.registerItem('leaf', null, createRef<HTMLElement>(), false, false, 'leaf');
      result.current.registerItem('b', null, createRef<HTMLElement>(), false, true, 'b');
    });
    act(() =>
      result.current.getItemProps('a', { hasChildren: true }).onKeyDown({
        key: '*',
        preventDefault: () => {},
      } as any),
    );
    expect(result.current.isExpanded('a')).toBe(true);
    expect(result.current.isExpanded('b')).toBe(true);
    // "leaf" has no expanded concept — isExpanded should just be false/no-op.
    expect(result.current.isExpanded('leaf')).toBe(false);
  });
});

describe('useTree — click interactions', () => {
  test('clicking a leaf selects it via onClick', () => {
    const result = setupWithDom();
    act(() => result.current.getItemProps('index.ts', {}).onClick());
    expect(result.current.isSelected('index.ts')).toBe(true);
  });

  test('clicking a branch selects and toggles it via onClick', () => {
    const result = setupWithDom();
    act(() => result.current.getItemProps('src', { hasChildren: true }).onClick());
    expect(result.current.isSelected('src')).toBe(true);
    expect(result.current.isExpanded('src')).toBe(false); // was expanded, click toggled it closed
  });

  test('clicking a disabled item is a no-op', () => {
    const { result } = renderHook(() => useTree({}));
    act(() => result.current.registerItem('a', null, createRef<HTMLElement>(), true, false, 'a'));
    act(() => result.current.getItemProps('a', { disabled: true }).onClick());
    expect(result.current.isSelected('a')).toBe(false);
  });

  test('onFocus sets focusedValue for an enabled item', () => {
    const result = setupWithDom();
    act(() => result.current.getItemProps('package.json', {}).onFocus());
    expect(result.current.getItemProps('package.json', {}).tabIndex).toBe(0);
  });

  test('onFocus does not update focusedValue for a disabled item', () => {
    const { result } = renderHook(() => useTree({}));
    act(() => {
      result.current.registerItem('a', null, createRef<HTMLElement>(), false, false, 'a');
      result.current.registerItem('b', null, createRef<HTMLElement>(), true, false, 'b');
    });
    act(() => result.current.getItemProps('b', { disabled: true }).onFocus());
    expect(result.current.getItemProps('b', { disabled: true }).tabIndex).toBe(-1);
  });
});

describe('useTree — visibility across nested ancestors', () => {
  test('a deeply nested item is invisible if any ancestor is collapsed', () => {
    const { result } = renderHook(() => useTree({ defaultExpanded: ['a'] })); // only "a" expanded, not "b"
    act(() => {
      result.current.registerItem('a', null, createRef<HTMLElement>(), false, true, 'a');
      result.current.registerItem('b', 'a', createRef<HTMLElement>(), false, true, 'b');
      result.current.registerItem('c', 'b', createRef<HTMLElement>(), false, false, 'c');
    });
    document.body.innerHTML = `
      <button id="${result.current.getItemProps('a', { hasChildren: true }).id}"></button>
      <button id="${result.current.getItemProps('b', { hasChildren: true }).id}"></button>
      <button id="${result.current.getItemProps('c', {}).id}"></button>
    `;
    // "c"'s parent "b" is not expanded, so ArrowDown from "a" should land on "b", not "c".
    act(() =>
      result.current.getItemProps('a', { hasChildren: true }).onKeyDown({
        key: 'ArrowDown',
        preventDefault: () => {},
      } as any),
    );
    const bEl = document.getElementById(
      result.current.getItemProps('b', { hasChildren: true }).id,
    )!;
    expect(document.activeElement).toBe(bEl);
  });
});

describe('useTree — cleanup resets focusedValue when the focused item unregisters', () => {
  test('focusedValue falls back to the next root item after the focused one unmounts', () => {
    const { result } = renderHook(() => useTree({}));
    let unregisterA: () => void = () => {};
    act(() => {
      unregisterA = result.current.registerItem(
        'a',
        null,
        createRef<HTMLElement>(),
        false,
        false,
        'a',
      );
      result.current.registerItem('b', null, createRef<HTMLElement>(), false, false, 'b');
    });
    document.body.innerHTML = `
      <button id="${result.current.getItemProps('a', {}).id}"></button>
      <button id="${result.current.getItemProps('b', {}).id}"></button>
    `;
    expect(result.current.getItemProps('a', {}).tabIndex).toBe(0);
    act(() => unregisterA());
    expect(result.current.getItemProps('b', {}).tabIndex).toBe(0);
  });
});

describe('useTree — Enter/Space on a leaf item does not toggle expansion', () => {
  test('selecting a leaf via Enter does not call toggleExpanded (no hasChildren)', () => {
    const result = setupWithDom();
    act(() =>
      result.current.getItemProps('index.ts', {}).onKeyDown({
        key: 'Enter',
        preventDefault: () => {},
      } as any),
    );
    expect(result.current.isSelected('index.ts')).toBe(true);
  });
});

describe('useTree — registerItem DOM-order insertion', () => {
  test('re-registering the same value does not duplicate it in order', () => {
    const { result } = renderHook(() => useTree({}));
    const ref = createRef<HTMLElement>();
    act(() => {
      result.current.registerItem('a', null, ref, false, false, 'a');
      result.current.registerItem('a', null, ref, false, false, 'a'); // re-register
    });
    const props = result.current.getItemProps('a', {});
    expect(props['aria-posinset']).toBe(1);
    expect(props['aria-setsize']).toBe(1); // not duplicated
  });

  test('inserts a new item before an existing DOM-later sibling using compareDocumentPosition', () => {
    const { result } = renderHook(() => useTree({}));

    // Create real DOM elements in a specific order so compareDocumentPosition works.
    const container = document.createElement('div');
    document.body.appendChild(container);
    const elB = document.createElement('button');
    const elA = document.createElement('button');
    container.appendChild(elA); // a comes first in the DOM
    container.appendChild(elB); // b comes second

    act(() => {
      result.current.registerItem('b', null, { current: elB }, false, false, 'b');
    });
    act(() => {
      result.current.registerItem('a', null, { current: elA }, false, false, 'a');
    });

    // "a" is earlier in the DOM than "b", so it should be inserted before "b" in order.
    const propsA = result.current.getItemProps('a', {});
    const propsB = result.current.getItemProps('b', {});
    expect(propsA['aria-posinset']).toBe(1);
    expect(propsB['aria-posinset']).toBe(2);

    document.body.removeChild(container);
  });

  test('appends to the end when no ref/element is available for position comparison', () => {
    const { result } = renderHook(() => useTree({}));
    // No ref.current and no matching element in the DOM at all.
    act(() => {
      result.current.registerItem('x', null, { current: null }, false, false, 'x');
      result.current.registerItem('y', null, { current: null }, false, false, 'y');
    });
    const propsX = result.current.getItemProps('x', {});
    const propsY = result.current.getItemProps('y', {});
    expect(propsX['aria-posinset']).toBe(1);
    expect(propsY['aria-posinset']).toBe(2);
  });
});

describe('useTree — focus fallback on unregister for non-root items', () => {
  test('unregistering a non-focused item does not change focusedValue', () => {
    const result = setupTree();
    act(() => result.current.getItemProps('src', { hasChildren: true }).onFocus());

    let unregisterApp: () => void = () => {};
    act(() => {
      unregisterApp = result.current.registerItem(
        'app.ts',
        'src',
        createRef<HTMLElement>(),
        false,
        false,
        'app.ts',
      );
    });
    act(() => unregisterApp());
    // "src" was focused, unregistering an unrelated item shouldn't disturb it.
    expect(result.current.getItemProps('src', { hasChildren: true }).tabIndex).toBe(0);
  });

  test('unregistering the currently-focused non-root item falls back to the first root item', () => {
    const { result } = renderHook(() => useTree({ defaultExpanded: ['src'] }));
    act(() => {
      result.current.registerItem('src', null, createRef<HTMLElement>(), false, true, 'src');
      result.current.registerItem('child', 'src', createRef<HTMLElement>(), false, false, 'child');
    });
    act(() => result.current.getItemProps('child', {}).onFocus());
    expect(result.current.getItemProps('child', {}).tabIndex).toBe(0);

    let unregisterChild: () => void = () => {};
    act(() => {
      unregisterChild = result.current.registerItem(
        'child',
        'src',
        createRef<HTMLElement>(),
        false,
        false,
        'child',
      );
    });
    act(() => unregisterChild());
    // Falls back to the first root item ("src"), not another non-root item.
    expect(result.current.getItemProps('src', { hasChildren: true }).tabIndex).toBe(0);
  });
});

describe('useTree — tabIndex default before any focus/registration order is settled', () => {
  test('first root item defaults to tabIndex 0 even when focusedValue is still undefined', () => {
    const { result } = renderHook(() => useTree({}));
    act(() => {
      result.current.registerItem('first', null, createRef<HTMLElement>(), false, false, 'first');
      result.current.registerItem('second', null, createRef<HTMLElement>(), false, false, 'second');
    });
    // Neither item has been focused yet — tabIndex should fall back to the
    // first registered root item via the (focusedValue ?? firstRoot) branch.
    expect(result.current.getItemProps('first', {}).tabIndex).toBe(0);
    expect(result.current.getItemProps('second', {}).tabIndex).toBe(-1);
  });
});

describe("useTree — ArrowRight on a branch whose children haven't registered yet", () => {
  test('does not throw when hasChildren is true but no child is actually registered', () => {
    const { result } = renderHook(() => useTree({}));
    act(() => {
      result.current.registerItem(
        'empty-branch',
        null,
        createRef<HTMLElement>(),
        false,
        true,
        'empty-branch',
      );
    });
    expect(() =>
      act(() =>
        result.current.getItemProps('empty-branch', { hasChildren: true }).onKeyDown({
          key: 'ArrowRight',
          preventDefault: () => {},
        } as any),
      ),
    ).not.toThrow();
    expect(result.current.isExpanded('empty-branch')).toBe(true); // still expands even with no children yet
  });
});

describe('useTree — ArrowLeft on a root leaf with no parent and not expanded', () => {
  test('is a no-op when the item has no children and no parent', () => {
    const { result } = renderHook(() => useTree({}));
    act(() => {
      result.current.registerItem('lonely', null, createRef<HTMLElement>(), false, false, 'lonely');
    });
    expect(() =>
      act(() =>
        result.current.getItemProps('lonely', {}).onKeyDown({
          key: 'ArrowLeft',
          preventDefault: () => {},
        } as any),
      ),
    ).not.toThrow();
  });
});

describe('useTree — asterisk with zero branch siblings', () => {
  test('does nothing when no siblings have children', () => {
    const { result } = renderHook(() => useTree({}));
    act(() => {
      result.current.registerItem('a', null, createRef<HTMLElement>(), false, false, 'a');
      result.current.registerItem('b', null, createRef<HTMLElement>(), false, false, 'b');
    });
    expect(() =>
      act(() =>
        result.current.getItemProps('a', {}).onKeyDown({
          key: '*',
          preventDefault: () => {},
        } as any),
      ),
    ).not.toThrow();
  });

  test('does not duplicate already-expanded siblings in the expanded list', () => {
    const { result } = renderHook(() => useTree({ defaultExpanded: ['a'] }));
    act(() => {
      result.current.registerItem('a', null, createRef<HTMLElement>(), false, true, 'a');
      result.current.registerItem('b', null, createRef<HTMLElement>(), false, true, 'b');
    });
    expect(result.current.isExpanded('a')).toBe(true);
    act(() =>
      result.current.getItemProps('a', { hasChildren: true }).onKeyDown({
        key: '*',
        preventDefault: () => {},
      } as any),
    );
    // "a" was already expanded — asterisk should leave it expanded (no toggle-off) and expand "b".
    expect(result.current.isExpanded('a')).toBe(true);
    expect(result.current.isExpanded('b')).toBe(true);
  });
});

describe('useTree — handleKeyDown on an unregistered item', () => {
  test("is a no-op when the entry doesn't exist in the registry", () => {
    const { result } = renderHook(() => useTree({}));
    expect(() =>
      act(() =>
        result.current.getItemProps('ghost', {}).onKeyDown({
          key: 'ArrowDown',
          preventDefault: () => {},
        } as any),
      ),
    ).not.toThrow();
  });
});

describe('useTree — ArrowUp/ArrowDown at the boundaries of the visible list', () => {
  test('ArrowDown on the last visible item does not move (no wrap)', () => {
    const result = setupWithDom();
    act(() => result.current.getItemProps('package.json', {}).onFocus());
    const pkgEl = document.getElementById(result.current.getItemProps('package.json', {}).id)!;
    pkgEl.focus();

    act(() =>
      result.current.getItemProps('package.json', {}).onKeyDown({
        key: 'ArrowDown',
        preventDefault: () => {},
      } as any),
    );
    expect(document.activeElement).toBe(pkgEl); // stayed put, no wrap
  });

  test('ArrowUp on the first visible item does not move (no wrap)', () => {
    const result = setupWithDom();
    const srcEl = document.getElementById(
      result.current.getItemProps('src', { hasChildren: true }).id,
    )!;
    srcEl.focus(); // establish starting focus before testing the boundary

    act(() =>
      result.current.getItemProps('src', { hasChildren: true }).onKeyDown({
        key: 'ArrowUp',
        preventDefault: () => {},
      } as any),
    );
    expect(document.activeElement).toBe(srcEl);
  });
});
