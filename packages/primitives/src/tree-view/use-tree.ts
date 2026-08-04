import { useCallback, useRef, useState, type KeyboardEvent, type RefObject } from 'react';
import { useControllableState, useStableId } from '@acl/utils';

export type TreeSelectionMode = 'none' | 'single' | 'multiple';

export interface UseTreeOptions {
  selectionMode?: TreeSelectionMode;
  selected?: string | string[];
  defaultSelected?: string | string[];
  onSelectedChange?: (value: string | string[]) => void;
  expanded?: string[];
  defaultExpanded?: string[];
  onExpandedChange?: (value: string[]) => void;
  id?: string;
}

interface TreeItemEntry {
  value: string;
  parentValue: string | null;
  ref: RefObject<HTMLElement | null>;
  disabled: boolean;
  hasChildren: boolean;
  label: string;
}

/**
 * Headless state + keyboard logic for the Tree View pattern.
 * Implements the WAI-ARIA APG Tree View pattern:
 * https://www.w3.org/WAI/ARIA/apg/patterns/treeview/
 *
 * Layout-stability contract: every node stays mounted at all times,
 * regardless of its ancestors' expanded state (see TreeItem.tsx — the
 * group wrapper animates height via CSS Grid rather than unmounting).
 * This guarantees a node's own on-screen position never changes when it
 * or a sibling is expanded/collapsed — only content strictly below the
 * expanding node grows/shrinks. Keyboard navigation instead filters the
 * registration order down to only currently-*visible* items via
 * isVisible(), which walks each item's ancestor chain.
 */
export function useTree({
  selectionMode = 'single',
  selected,
  defaultSelected,
  onSelectedChange,
  expanded,
  defaultExpanded,
  onExpandedChange,
  id,
}: UseTreeOptions) {
  const baseId = useStableId(id ?? 'tree');

  const [selectedValue, setSelectedValue] = useControllableState<string | string[] | undefined>({
    value: selected,
    defaultValue: defaultSelected ?? (selectionMode === 'multiple' ? [] : undefined),
    onChange: onSelectedChange as (v: string | string[] | undefined) => void,
  });

  const [expandedValues, setExpandedValues] = useControllableState<string[]>({
    value: expanded,
    defaultValue: defaultExpanded ?? [],
    onChange: onExpandedChange,
  });
  const expandedValuesRef = useRef<string[]>(expandedValues);
  expandedValuesRef.current = expandedValues;

  const [focusedValue, setFocusedValue] = useState<string | undefined>(undefined);

  // Full registration order (depth-first, as rendered) — stable across
  // expand/collapse since every node stays mounted.
  const order = useRef<string[]>([]);
  const registry = useRef<Map<string, TreeItemEntry>>(new Map());
  const typeaheadBuffer = useRef('');
  const typeaheadTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const registerItem = useCallback(
    (
      value: string,
      parentValue: string | null,
      ref: RefObject<HTMLElement | null>,
      disabled: boolean,
      hasChildren: boolean,
      label: string,
    ) => {
      registry.current.set(value, { value, parentValue, ref, disabled, hasChildren, label });

      // Insert in DOM order by comparing element positions.
      if (!order.current.includes(value)) {
        const el = ref.current ?? document.getElementById(`${baseId}-item-${value}`);
        if (el) {
          const insertIdx = order.current.findIndex((v) => {
            const other =
              registry.current.get(v)?.ref.current ??
              document.getElementById(`${baseId}-item-${v}`);
            return other
              ? el.compareDocumentPosition(other) & Node.DOCUMENT_POSITION_FOLLOWING
              : false;
          });
          if (insertIdx === -1) order.current.push(value);
          else order.current.splice(insertIdx, 0, value);
        } else {
          order.current.push(value);
        }
      }

      // Only root items (parentValue === null) are candidates for the
      // initial roving-tabindex target — children may be inert/collapsed.
      if (parentValue === null) {
        setFocusedValue((prev) => {
          if (prev !== undefined) return prev;
          const firstRoot = order.current.find(
            (v) => registry.current.get(v)?.parentValue === null,
          );
          return firstRoot;
        });
      }

      return () => {
        order.current = order.current.filter((v) => v !== value);
        registry.current.delete(value);
        setFocusedValue((prev) => {
          if (prev !== value) return prev;
          return order.current.find((v) => registry.current.get(v)?.parentValue === null);
        });
      };
    },
    [baseId],
  );

  const isExpanded = useCallback((value: string) => expandedValuesRef.current.includes(value), []);

  const setExpanded = useCallback(
    (value: string, next: boolean) => {
      const cur = expandedValuesRef.current;
      setExpandedValues(next ? [...cur, value] : cur.filter((v) => v !== value));
    },
    [setExpandedValues],
  );

  const toggleExpanded = useCallback(
    (value: string) => setExpanded(value, !isExpanded(value)),
    [isExpanded, setExpanded],
  );

  /** True only if every ancestor of `value` is currently expanded (or it's a root item). */
  const isVisible = useCallback((value: string): boolean => {
    let current = registry.current.get(value);
    while (current?.parentValue) {
      if (!expandedValuesRef.current.includes(current.parentValue)) return false;
      current = registry.current.get(current.parentValue);
    }
    return true;
  }, []);

  const visibleOrder = useCallback(() => order.current.filter((v) => isVisible(v)), [isVisible]);

  const isSelected = useCallback(
    (value: string) =>
      selectionMode === 'multiple'
        ? Array.isArray(selectedValue) && selectedValue.includes(value)
        : selectedValue === value,
    [selectedValue, selectionMode],
  );

  const selectItem = useCallback(
    (value: string, disabled: boolean) => {
      if (disabled || selectionMode === 'none') return;
      if (selectionMode === 'multiple') {
        const current = Array.isArray(selectedValue) ? selectedValue : [];
        setSelectedValue(
          current.includes(value) ? current.filter((v) => v !== value) : [...current, value],
        );
      } else {
        setSelectedValue(value);
      }
    },
    [selectedValue, selectionMode, setSelectedValue],
  );

  const focusItem = useCallback(
    (value: string) => {
      setFocusedValue(value);
      const el =
        registry.current.get(value)?.ref.current ??
        document.getElementById(`${baseId}-item-${value}`);
      (el as HTMLElement | null)?.focus({ preventScroll: true });
    },
    [baseId],
  );

  const siblingsOf = useCallback((value: string) => {
    const entry = registry.current.get(value);
    if (!entry) return [];
    return order.current.filter((v) => registry.current.get(v)?.parentValue === entry.parentValue);
  }, []);

  const runTypeahead = useCallback(
    (key: string) => {
      typeaheadBuffer.current += key.toLowerCase();
      clearTimeout(typeaheadTimer.current);
      typeaheadTimer.current = setTimeout(() => (typeaheadBuffer.current = ''), 500);

      const visible = visibleOrder();
      const match = visible.find((v) =>
        registry.current.get(v)?.label.toLowerCase().startsWith(typeaheadBuffer.current),
      );
      if (match) focusItem(match);
    },
    [focusItem, visibleOrder],
  );

  const handleKeyDown = useCallback(
    (currentValue: string, e: KeyboardEvent) => {
      const entry = registry.current.get(currentValue);
      if (!entry) return;
      const visible = visibleOrder();
      const i = visible.indexOf(currentValue);

      switch (e.key) {
        case 'ArrowDown': {
          e.preventDefault();
          const next = visible[i + 1];
          if (next) focusItem(next);
          break;
        }
        case 'ArrowUp': {
          e.preventDefault();
          const prev = visible[i - 1];
          if (prev) focusItem(prev);
          break;
        }
        case 'ArrowRight': {
          e.preventDefault();
          if (entry.hasChildren) {
            if (!isExpanded(currentValue)) {
              setExpanded(currentValue, true);
              // Children are already mounted (just collapsed) — focus the
              // first one immediately, no need to wait a tick.
              const firstChild = order.current.find(
                (v) => registry.current.get(v)?.parentValue === currentValue,
              );
              if (firstChild) focusItem(firstChild);
            } else {
              const firstChild = order.current.find(
                (v) => registry.current.get(v)?.parentValue === currentValue,
              );
              if (firstChild) focusItem(firstChild);
            }
          }
          break;
        }
        case 'ArrowLeft': {
          e.preventDefault();
          if (entry.hasChildren && isExpanded(currentValue)) {
            setExpanded(currentValue, false);
          } else if (entry.parentValue) {
            focusItem(entry.parentValue);
          }
          break;
        }
        case 'Home': {
          e.preventDefault();
          const first = visible[0];
          if (first) focusItem(first);
          break;
        }
        case 'End': {
          e.preventDefault();
          const last = visible[visible.length - 1];
          if (last) focusItem(last);
          break;
        }
        case 'Enter':
        case ' ': {
          e.preventDefault();
          selectItem(currentValue, entry.disabled);
          if (entry.hasChildren) toggleExpanded(currentValue);
          break;
        }
        case '*': {
          e.preventDefault();
          const branchSibs = siblingsOf(currentValue).filter(
            (sib) => registry.current.get(sib)?.hasChildren,
          );
          const next = [...expandedValuesRef.current];
          branchSibs.forEach((sib) => {
            if (!next.includes(sib)) next.push(sib);
          });
          setExpandedValues(next);
          break;
        }
        default: {
          if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
            runTypeahead(e.key);
          }
        }
      }
    },
    [
      baseId,
      focusItem,
      isExpanded,
      runTypeahead,
      selectItem,
      setExpanded,
      setExpandedValues,
      siblingsOf,
      toggleExpanded,
      visibleOrder,
    ],
  );

  const getTreeProps = useCallback(
    () => ({
      role: 'tree' as const,
      'aria-multiselectable': selectionMode === 'multiple' || undefined,
    }),
    [selectionMode],
  );

  const getItemProps = useCallback(
    (
      value: string,
      {
        disabled = false,
        hasChildren = false,
        level = 1,
      }: { disabled?: boolean; hasChildren?: boolean; level?: number },
    ) => {
      const siblings = siblingsOf(value);
      const posinset = siblings.indexOf(value) + 1;

      return {
        id: `${baseId}-item-${value}`,
        role: 'treeitem' as const,
        tabIndex:
          (focusedValue ??
            order.current.find((v) => registry.current.get(v)?.parentValue === null)) === value
            ? (0 as const)
            : (-1 as const),
        'aria-expanded': hasChildren ? isExpanded(value) : undefined,
        'aria-selected': selectionMode === 'none' ? undefined : isSelected(value),
        'aria-disabled': disabled || undefined,
        'aria-level': level,
        'aria-setsize': siblings.length || 1,
        'aria-posinset': posinset || 1,
        onClick: () => {
          if (disabled) return;
          setFocusedValue(value);
          selectItem(value, disabled);
          if (hasChildren) toggleExpanded(value);
        },
        onFocus: () => {
          if (!disabled) setFocusedValue(value);
        },
        onKeyDown: (e: KeyboardEvent) => handleKeyDown(value, e),
      };
    },
    [
      baseId,
      focusedValue,
      handleKeyDown,
      isExpanded,
      isSelected,
      selectItem,
      selectionMode,
      siblingsOf,
      toggleExpanded,
    ],
  );

  const getGroupProps = useCallback(
    (parentValue: string) => ({
      role: 'group' as const,
      id: `${baseId}-group-${parentValue}`,
    }),
    [baseId],
  );

  return {
    registerItem,
    isExpanded,
    toggleExpanded,
    isSelected,
    getTreeProps,
    getItemProps,
    getGroupProps,
  };
}

export type UseTreeReturn = ReturnType<typeof useTree>;
