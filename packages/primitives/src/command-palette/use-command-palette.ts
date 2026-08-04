import {
  useCallback,
  useLayoutEffect,
  useReducer,
  useRef,
  useState,
  type KeyboardEvent,
  type RefObject,
} from 'react';
import { useControllableState, useStableId, useEscapeKey } from '@acl/utils';

export interface UseCommandPaletteOptions {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  inputValue?: string;
  defaultInputValue?: string;
  onInputValueChange?: (value: string) => void;
  loop?: boolean;
  id?: string;
}

interface ItemMeta {
  disabled: boolean;
  label: string;
  onSelect: () => void;
}

interface ItemRegistration extends ItemMeta {
  ref: RefObject<HTMLElement | null>;
}

export function useCommandPalette({
  open: controlledOpen,
  defaultOpen = false,
  onOpenChange,
  inputValue: controlledInputValue,
  defaultInputValue = '',
  onInputValueChange,
  loop = true,
  id,
}: UseCommandPaletteOptions = {}) {
  const baseId = useStableId(id ?? 'command-palette');
  const inputId = `${baseId}-input`;
  const listId = `${baseId}-list`;

  const [open, setOpen] = useControllableState<boolean>({
    value: controlledOpen,
    defaultValue: defaultOpen,
    onChange: onOpenChange,
  });

  const [inputValue, setInputValue] = useControllableState<string>({
    value: controlledInputValue,
    defaultValue: defaultInputValue,
    onChange: onInputValueChange,
  });

  const [highlightedValue, setHighlightedValueState] = useState<string | undefined>(undefined);
  const highlightedRef = useRef<string | undefined>(undefined);
  const setHighlighted = useCallback((v: string | undefined) => {
    highlightedRef.current = v;
    setHighlightedValueState(v);
  }, []);

  const registry = useRef<Map<string, ItemRegistration>>(new Map());
  const order = useRef<string[]>([]);
  // registerItem/updateItemMeta mutate refs, which doesn't trigger a
  // re-render on its own — this counter forces one, so consumers reading
  // the registry at render time (CommandEmpty) see up-to-date data.
  const [registryVersion, bumpRegistryVersion] = useReducer((c: number) => c + 1, 0);

  const registerItem = useCallback((value: string, ref: RefObject<HTMLElement | null>) => {
    if (!order.current.includes(value)) order.current.push(value);
    if (!registry.current.has(value)) {
      registry.current.set(value, { ref, disabled: false, label: value, onSelect: () => {} });
    } else {
      registry.current.get(value)!.ref = ref;
    }
    bumpRegistryVersion();
    return () => {
      registry.current.delete(value);
      order.current = order.current.filter((v) => v !== value);
      bumpRegistryVersion();
    };
  }, []);

  const updateItemMeta = useCallback((value: string, meta: ItemMeta) => {
    const entry = registry.current.get(value);
    if (entry) Object.assign(entry, meta);
    bumpRegistryVersion();
  }, []);

  const enabledOrder = useCallback(
    () => order.current.filter((v) => !registry.current.get(v)?.disabled),
    [],
  );

  useLayoutEffect(() => {
    const enabled = enabledOrder();
    const current = highlightedRef.current;
    setHighlighted(current && enabled.includes(current) ? current : enabled[0]);
  }, [registryVersion, inputValue]);

  const close = useCallback(() => setOpen(false), [setOpen]);
  const show = useCallback(() => setOpen(true), [setOpen]);

  useEscapeKey(close, { active: open });

  const selectItem = useCallback((value: string) => {
    const entry = registry.current.get(value);
    if (!entry || entry.disabled) return;
    entry.onSelect();
  }, []);

  const handleInputKeyDown = useCallback(
    (e: KeyboardEvent) => {
      const enabled = enabledOrder();
      if (enabled.length === 0) return;
      const idx = highlightedRef.current ? enabled.indexOf(highlightedRef.current) : -1;
      const fallbackValue = enabled[0];

      switch (e.key) {
        case 'ArrowDown': {
          e.preventDefault();
          let next = idx + 1;
          if (next >= enabled.length) next = loop ? 0 : enabled.length - 1;
          setHighlighted(enabled[next]);
          return;
        }
        case 'ArrowUp': {
          e.preventDefault();
          let prev = idx - 1;
          if (prev < 0) prev = loop ? enabled.length - 1 : 0;
          setHighlighted(enabled[prev]);
          return;
        }
        case 'Home':
          e.preventDefault();
          setHighlighted(enabled[0]);
          return;
        case 'End':
          e.preventDefault();
          setHighlighted(enabled[enabled.length - 1]);
          return;
        case 'Enter': {
          const selected = highlightedRef.current ?? fallbackValue;
          if (!selected) return;
          e.preventDefault();
          selectItem(selected);
          return;
        }
        default:
          return;
      }
    },
    [enabledOrder, loop, selectItem, setHighlighted],
  );

  const getInputProps = useCallback(
    () => ({
      id: inputId,
      role: 'combobox' as const,
      'aria-expanded': true as const,
      'aria-controls': listId,
      'aria-autocomplete': 'list' as const,
      'aria-activedescendant': highlightedValue ? `${baseId}-item-${highlightedValue}` : undefined,
      autoComplete: 'off' as const,
      value: inputValue,
      onChange: (e: { target: { value: string } }) => setInputValue(e.target.value),
      onKeyDown: handleInputKeyDown,
    }),
    [baseId, handleInputKeyDown, highlightedValue, inputId, inputValue, listId, setInputValue],
  );

  const getListProps = useCallback(() => ({ id: listId, role: 'listbox' as const }), [listId]);

  const getItemProps = useCallback(
    (value: string, disabled: boolean) => ({
      id: `${baseId}-item-${value}`,
      role: 'option' as const,
      'aria-selected': highlightedValue === value,
      'aria-disabled': disabled || undefined,
      onClick: () => selectItem(value),
      onMouseEnter: () => {
        if (!disabled) setHighlighted(value);
      },
    }),
    [baseId, highlightedValue, selectItem, setHighlighted],
  );

  return {
    open,
    setOpen,
    show,
    close,
    inputValue,
    setInputValue,
    highlightedValue,
    baseId,
    inputId,
    listId,
    registerItem,
    updateItemMeta,
    enabledOrder,
    selectItem,
    getInputProps,
    getListProps,
    getItemProps,
  };
}

export type UseCommandPaletteReturn = ReturnType<typeof useCommandPalette>;
