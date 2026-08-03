import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useReducer,
  useRef,
  useState,
  type KeyboardEvent,
  type RefObject,
} from 'react';
import { useControllableState, useStableId, useEscapeKey } from '@acl/utils';

export interface ComboboxItemData {
  disabled: boolean;
  label: string;
  group?: string;
}

interface ItemRegistration extends ComboboxItemData {
  ref: RefObject<HTMLElement | null>;
}

export interface UseComboboxOptions {
  /** Single-select value, or array of values in multiple mode. */
  value?: string | string[];
  defaultValue?: string | string[];
  onValueChange?: (value: string | string[]) => void;
  multiple?: boolean;
  inputValue?: string;
  defaultInputValue?: string;
  onInputValueChange?: (value: string) => void;
  disabled?: boolean;
  invalid?: boolean;
  /** Auto-highlights the first matching item whenever the filtered list changes. Default true. */
  autoHighlight?: boolean;
  /** Custom filter — default is case-insensitive substring match on label. */
  filter?: (label: string, query: string) => boolean;
  id?: string;
}

const defaultFilter = (label: string, query: string) =>
  label.toLowerCase().includes(query.toLowerCase());

export function useCombobox({
  value: controlledValue,
  defaultValue,
  onValueChange,
  multiple = false,
  inputValue: controlledInputValue,
  defaultInputValue = '',
  onInputValueChange,
  disabled = false,
  invalid = false,
  autoHighlight = true,
  filter = defaultFilter,
  id,
}: UseComboboxOptions = {}) {
  const baseId = useStableId(id ?? 'combobox');
  const inputId = `${baseId}-input`;
  const listboxId = `${baseId}-listbox`;

  const [value, setValue] = useControllableState<string | string[] | undefined>({
    value: controlledValue,
    defaultValue: defaultValue ?? (multiple ? [] : undefined),
    onChange: onValueChange as (v: string | string[] | undefined) => void,
  });

  const [inputValue, setInputValue] = useControllableState<string>({
    value: controlledInputValue,
    defaultValue:
      defaultInputValue !== ''
        ? defaultInputValue
        : !multiple && typeof (controlledValue ?? defaultValue) === 'string'
          ? ((controlledValue ?? defaultValue) as string)
          : defaultInputValue,
    onChange: onInputValueChange,
  });

  const [open, setOpen] = useState(false);
  const openRef = useRef(false);
  const [highlightedValue, setHighlightedValue] = useState<string | undefined>(undefined);
  const highlightedValueRef = useRef<string | undefined>(undefined);
  const userHighlightedRef = useRef(false);

  const registry = useRef<Map<string, ItemRegistration>>(new Map());
  const order = useRef<string[]>([]);

  const [, bumpRegistryVersion] = useReducer((c: number) => c + 1, 0);

  const registerItem = useCallback((itemValue: string, ref: RefObject<HTMLElement | null>) => {
    if (!order.current.includes(itemValue)) order.current.push(itemValue);
    if (!registry.current.has(itemValue)) {
      registry.current.set(itemValue, { ref, disabled: false, label: itemValue });
    } else {
      registry.current.get(itemValue)!.ref = ref;
    }
    bumpRegistryVersion();
    return () => {
      registry.current.delete(itemValue);
      order.current = order.current.filter((v) => v !== itemValue);
      bumpRegistryVersion();
    };
  }, []);

  const updateItemMeta = useCallback((itemValue: string, meta: ComboboxItemData) => {
    const entry = registry.current.get(itemValue);
    if (entry) Object.assign(entry, meta);
    bumpRegistryVersion();
  }, []);

  const isMatch = useCallback(
    (itemValue: string) => {
      const entry = registry.current.get(itemValue);
      if (!entry) return false;
      if (!inputValue) return true;
      return filter(entry.label, inputValue);
    },
    [filter, inputValue],
  );

  const visibleEnabledOrder = useCallback(
    () =>
      order.current.filter((v) => {
        const entry = registry.current.get(v);
        return entry && !entry.disabled && isMatch(v);
      }),
    [isMatch],
  );

  const isSelected = useCallback(
    (itemValue: string) =>
      multiple ? Array.isArray(value) && value.includes(itemValue) : value === itemValue,
    [multiple, value],
  );

  const highlightItem = useCallback((itemValue: string | undefined, fromUser = true) => {
    if (fromUser) userHighlightedRef.current = true;
    highlightedValueRef.current = itemValue;
    setHighlightedValue(itemValue);
  }, []);

  const close = useCallback(() => {
    openRef.current = false;
    setOpen(false);
    userHighlightedRef.current = false;
    highlightedValueRef.current = undefined;
    setHighlightedValue(undefined);
  }, []);

  const show = useCallback(() => {
    if (disabled) return;
    openRef.current = true;
    setOpen(true);
  }, [disabled]);

  useEscapeKey(close, { active: open });

  useEffect(() => {
    if (!open || !autoHighlight) return;
    if (userHighlightedRef.current) return;
    const visible = visibleEnabledOrder();
    const next = visible[0];
    highlightedValueRef.current = next;
    setHighlightedValue(next);
  }, [open, inputValue, autoHighlight, visibleEnabledOrder]);

  // Keep the ref in sync whenever state changes (covers the auto-highlight path).
  useEffect(() => {
    highlightedValueRef.current = highlightedValue;
  }, [highlightedValue]);

  useEffect(() => {
    userHighlightedRef.current = false;
  }, [inputValue]);

  const selectItem = useCallback(
    (itemValue: string) => {
      const entry = registry.current.get(itemValue);
      if (!entry || entry.disabled) return;

      if (multiple) {
        const current = Array.isArray(value) ? value : [];
        const next = current.includes(itemValue)
          ? current.filter((v) => v !== itemValue)
          : [...current, itemValue];
        setValue(next);
        setInputValue('');
      } else {
        setValue(itemValue);
        setInputValue(entry.label);
        close();
      }
    },
    [close, multiple, setInputValue, setValue, value],
  );

  const clear = useCallback(() => {
    setValue(multiple ? [] : undefined);
    setInputValue('');
  }, [multiple, setInputValue, setValue]);

  const removeValue = useCallback(
    (itemValue: string) => {
      if (!multiple) return;
      const current = Array.isArray(value) ? value : [];
      setValue(current.filter((v) => v !== itemValue));
    },
    [multiple, setValue, value],
  );

  const handleInputKeyDown = useCallback(
    (e: KeyboardEvent) => {
      const visible = visibleEnabledOrder();

      switch (e.key) {
        case 'ArrowDown': {
          e.preventDefault();
          if (!openRef.current) {
            show();
            return;
          }
          if (visible.length === 0) return;
          const currentDown = highlightedValueRef.current;
          // If the highlight was set by autoHighlight (not by the user),
          // treat the starting index as -1 so ArrowDown lands on visible[0].
          const idx =
            !userHighlightedRef.current && currentDown
              ? -1
              : currentDown
                ? visible.indexOf(currentDown)
                : -1;
          highlightItem(visible[(idx + 1) % visible.length]);
          return;
        }
        case 'ArrowUp': {
          e.preventDefault();
          if (!openRef.current || visible.length === 0) return;
          const currentUp = highlightedValueRef.current;
          const idx =
            !userHighlightedRef.current && currentUp
              ? visible.length
              : currentUp
                ? visible.indexOf(currentUp)
                : visible.length;
          highlightItem(visible[(idx - 1 + visible.length) % visible.length]);
          return;
        }
        case 'Home':
          if (!openRef.current) return;
          e.preventDefault();
          highlightItem(visible[0]);
          return;
        case 'End':
          if (!openRef.current) return;
          e.preventDefault();
          highlightItem(visible[visible.length - 1]);
          return;
        case 'Enter': {
          const currentEnter = highlightedValueRef.current;
          if (!openRef.current || !currentEnter) return;
          e.preventDefault();
          selectItem(currentEnter);
          return;
        }
        case 'Backspace':
          if (multiple && inputValue === '' && Array.isArray(value) && value.length > 0) {
            removeValue(value[value.length - 1]!);
          }
          return;
        default:
          return;
      }
    },
    [
      highlightItem,
      inputValue,
      multiple,
      removeValue,
      selectItem,
      show,
      value,
      visibleEnabledOrder,
    ],
  );

  const getInputProps = useCallback(
    () => ({
      id: inputId,
      role: 'combobox' as const,
      'aria-expanded': open,
      'aria-controls': listboxId,
      'aria-autocomplete': 'list' as const,
      'aria-activedescendant': highlightedValue ? `${baseId}-item-${highlightedValue}` : undefined,
      'aria-invalid': invalid || undefined,
      'aria-disabled': disabled || undefined,
      disabled,
      autoComplete: 'off' as const,
      value: inputValue,
      onChange: (e: { target: { value: string } }) => {
        setInputValue(e.target.value);
        if (!open) show();
      },
      onFocus: () => show(),
      onKeyDown: handleInputKeyDown,
    }),
    [
      baseId,
      disabled,
      handleInputKeyDown,
      highlightedValue,
      inputId,
      inputValue,
      invalid,
      listboxId,
      open,
      setInputValue,
      show,
    ],
  );

  const getListboxProps = useCallback(
    () => ({
      id: listboxId,
      role: 'listbox' as const,
      'aria-multiselectable': multiple || undefined,
    }),
    [listboxId, multiple],
  );

  const getItemProps = useCallback(
    (itemValue: string, disabledItem: boolean) => ({
      id: `${baseId}-item-${itemValue}`,
      role: 'option' as const,
      'aria-selected': isSelected(itemValue),
      'aria-disabled': disabledItem || undefined,
      onClick: () => selectItem(itemValue),
      onMouseEnter: () => {
        if (!disabledItem) highlightItem(itemValue);
      },
    }),
    [baseId, highlightItem, isSelected, selectItem],
  );

  const getClearButtonProps = useCallback(
    () => ({
      type: 'button' as const,
      'aria-label': 'Clear',
      tabIndex: -1 as const,
      onClick: () => clear(),
    }),
    [clear],
  );

  return {
    open,
    setOpen,
    show,
    close,
    value,
    setValue,
    inputValue,
    setInputValue,
    highlightedValue,
    disabled,
    invalid,
    multiple,
    baseId,
    inputId,
    listboxId,
    registerItem,
    updateItemMeta,
    isMatch,
    isSelected,
    visibleEnabledOrder,
    highlightItem,
    selectItem,
    removeValue,
    clear,
    getInputProps,
    getListboxProps,
    getItemProps,
    getClearButtonProps,
  };
}

export type UseComboboxReturn = ReturnType<typeof useCombobox>;
