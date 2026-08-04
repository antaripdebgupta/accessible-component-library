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
