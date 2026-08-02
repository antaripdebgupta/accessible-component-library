import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type MouseEvent,
  type RefObject,
} from 'react';
import { flushSync } from 'react-dom';
import { useControllableState, useStableId, useEscapeKey } from '@acl/utils';

export interface UseDropdownMenuOptions {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  id?: string;
}

export type DropdownMenuItemRole = 'menuitem' | 'menuitemcheckbox' | 'menuitemradio';

interface ItemMeta {
  disabled: boolean;
  label: string;
  onSelect: () => void;
  closeOnSelect: boolean;
}

interface ItemRegistration extends ItemMeta {
  ref: RefObject<HTMLElement | null>;
}

export interface DropdownMenuItemProps {
  id: string;
  role: DropdownMenuItemRole;
  tabIndex: 0 | -1;
  'aria-disabled': true | undefined;
  onClick: () => void;
  onKeyDown: (e: KeyboardEvent) => void;
  onMouseEnter: (e: MouseEvent) => void;
  onMouseMove: (e: MouseEvent) => void;
}

export function useDropdownMenu({
  open: controlledOpen,
  defaultOpen = false,
  onOpenChange,
  id,
}: UseDropdownMenuOptions = {}) {
  const baseId = useStableId(id ?? 'dropdown-menu');
  const triggerId = `${baseId}-trigger`;
  const contentId = `${baseId}-content`;

  const [open, setOpen] = useControllableState<boolean>({
    value: controlledOpen,
    defaultValue: defaultOpen,
    onChange: onOpenChange,
  });

  const [activeValue, setActiveValue] = useState<string | undefined>(undefined);
  const activeValueRef = useRef<string | undefined>(undefined);
  const lastPointerRef = useRef<{ x: number; y: number } | null>(null);
  const setActive = useCallback((value: string | undefined) => {
    activeValueRef.current = value;
    setActiveValue(value);
  }, []);
  const registry = useRef<Map<string, ItemRegistration>>(new Map());
  const order = useRef<string[]>([]);
  const typeaheadBuffer = useRef('');
  const typeaheadTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Registers order + DOM ref only — mount/unmount, not per-render churn.
  const registerItem = useCallback((value: string, ref: RefObject<HTMLElement | null>) => {
    if (!order.current.includes(value)) order.current.push(value);
    if (!registry.current.has(value)) {
      registry.current.set(value, {
        ref,
        disabled: false,
        label: value,
        onSelect: () => {},
        closeOnSelect: true,
      });
    } else {
      registry.current.get(value)!.ref = ref;
    }
    return () => {
      registry.current.delete(value);
      order.current = order.current.filter((v) => v !== value);
    };
  }, []);

  // Updates mutable fields (disabled/label/callbacks) every render without
  // re-running registerItem's mount/unmount cleanup.
  const updateItemMeta = useCallback((value: string, meta: ItemMeta) => {
    const entry = registry.current.get(value);
    if (entry) Object.assign(entry, meta);
  }, []);

  const enabledOrder = useCallback(
    () => order.current.filter((v) => !registry.current.get(v)?.disabled),
    [],
  );

  const focusItem = useCallback(
    (value: string) => {
      //console.log("focusItem:", value, "ref:", registry.current.get(value)?.ref.current);
      flushSync(() => setActive(value));
      registry.current.get(value)?.ref.current?.focus();
    },
    [setActive],
  );

  const focusFirst = useCallback(() => {
    const enabled = enabledOrder();
    // console.log("focusFirst called, enabled:", enabled);
    if (enabled[0]) focusItem(enabled[0]);
  }, [enabledOrder, focusItem]);

  const focusLast = useCallback(() => {
    const enabled = enabledOrder();
    // console.log("focusLast called, enabled:", enabled);
    const last = enabled[enabled.length - 1];
    if (last) focusItem(last);
  }, [enabledOrder, focusItem]);

  // Reset active item and pointer ref when menu closes.
  useLayoutEffect(() => {
    if (!open) {
      setActive(undefined);
      lastPointerRef.current = null;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const close = useCallback(() => setOpen(false), [setOpen]);

  useEscapeKey(close, { active: open });

  const selectItem = useCallback(
    (value: string) => {
      const entry = registry.current.get(value);
      console.log('selectItem:', value, 'entry:', entry, 'closeOnSelect:', entry?.closeOnSelect);
      if (!entry || entry.disabled) return;
      entry.onSelect();
      if (entry.closeOnSelect) close();
    },
    [close],
  );

  const handleContentKeyDown = useCallback(
    (e: KeyboardEvent) => {
      console.log('handleContentKeyDown, key:', e.key, 'activeValueRef:', activeValueRef.current);
      const enabled = enabledOrder();
      if (enabled.length === 0) return;
      // Read from ref to avoid stale closure when activeValue was set
      // asynchronously (e.g. focusFirst via useEffect on mount).
      const currentIndex = activeValueRef.current ? enabled.indexOf(activeValueRef.current) : -1;

      switch (e.key) {
        case 'ArrowDown': {
          e.preventDefault();
          const next = enabled[(currentIndex + 1) % enabled.length];
          if (next) focusItem(next);
          return;
        }
        case 'ArrowUp': {
          e.preventDefault();
          const prev = enabled[(currentIndex - 1 + enabled.length) % enabled.length];
          if (prev) focusItem(prev);
          return;
        }
        case 'Home':
          e.preventDefault();
          focusFirst();
          return;
        case 'End':
          e.preventDefault();
          focusLast();
          return;
        case 'Tab':
          // Menus don't trap Tab — close and let focus move naturally.
          close();
          return;
        default:
          break;
      }

      if (e.key.length === 1 && /\S/.test(e.key)) {
        if (typeaheadTimeout.current) clearTimeout(typeaheadTimeout.current);
        typeaheadBuffer.current += e.key.toLowerCase();
        typeaheadTimeout.current = setTimeout(() => {
          typeaheadBuffer.current = '';
        }, 500);

        const match = enabled.find((v) => {
          const label = registry.current.get(v)?.label.toLowerCase() ?? '';
          return label.startsWith(typeaheadBuffer.current);
        });
        if (match) focusItem(match);
      }
    },
    [close, enabledOrder, focusFirst, focusItem, focusLast],
  );

  const getTriggerProps = useCallback(
    () => ({
      id: triggerId,
      'aria-haspopup': 'menu' as const,
      'aria-expanded': open,
      'aria-controls': open ? contentId : undefined,
      onClick: () => setOpen(!open),
      onKeyDown: (e: KeyboardEvent) => {
        if (e.key === 'ArrowDown' || e.key === 'ArrowUp' || e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          setOpen(true);
        }
      },
    }),
    [contentId, open, setOpen, triggerId],
  );

  const getContentProps = useCallback(
    () => ({
      id: contentId,
      role: 'menu' as const,
      'aria-labelledby': triggerId,
      tabIndex: -1 as const,
      onKeyDown: handleContentKeyDown,
    }),
    [contentId, handleContentKeyDown, triggerId],
  );

  const getItemProps = useCallback(
    (value: string, disabled: boolean, role: DropdownMenuItemRole): DropdownMenuItemProps => {
      const handlePointerMove = (e: MouseEvent) => {
        if (disabled) return;
        const currentPointer = { x: e.clientX, y: e.clientY };
        if (!lastPointerRef.current) {
          lastPointerRef.current = currentPointer;
          return;
        }
        if (
          currentPointer.x === lastPointerRef.current.x &&
          currentPointer.y === lastPointerRef.current.y
        ) {
          return;
        }
        lastPointerRef.current = currentPointer;
        setActive(value);
      };

      return {
        id: `${baseId}-item-${value}`,
        role,
        tabIndex: activeValue === value ? 0 : -1,
        'aria-disabled': disabled || undefined,
        onClick: () => selectItem(value),
        onKeyDown: (e: KeyboardEvent) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            selectItem(value);
          }
        },
        onMouseEnter: handlePointerMove,
        onMouseMove: handlePointerMove,
      };
    },
    [activeValue, baseId, selectItem, setActive],
  );

  return {
    open,
    setOpen,
    close,
    baseId,
    triggerId,
    contentId,
    activeValue,
    registerItem,
    updateItemMeta,
    focusItem,
    focusFirst,
    getTriggerProps,
    getContentProps,
    getItemProps,
  };
}

export type UseDropdownMenuReturn = ReturnType<typeof useDropdownMenu>;
