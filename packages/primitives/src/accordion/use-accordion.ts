import { useCallback, useRef, type KeyboardEvent } from 'react';
import { useControllableState, useStableId } from '@acl/utils';

export type AccordionType = 'single' | 'multiple';

export interface UseAccordionOptions {
  type?: AccordionType;
  value?: string | string[];
  defaultValue?: string | string[];
  onValueChange?: (value: string | string[]) => void;
  /** For type="single": allow closing the open item by clicking it again. Default true. */
  collapsible?: boolean;
  id?: string;
}

/**
 * Headless state + keyboard logic for the Accordion pattern.
 * Implements the WAI-ARIA APG Accordion pattern:
 * https://www.w3.org/WAI/ARIA/apg/patterns/accordion/
 */
export function useAccordion({
  type = 'single',
  value,
  defaultValue,
  onValueChange,
  collapsible = true,
  id,
}: UseAccordionOptions) {
  const baseId = useStableId(id ?? 'accordion');
  const fallbackDefault = type === 'multiple' ? [] : undefined;

  const [openValue, setOpenValue] = useControllableState<string | string[] | undefined>({
    value,
    defaultValue: defaultValue ?? fallbackDefault,
    onChange: onValueChange as (v: string | string[] | undefined) => void,
  });

  // Registration order + disabled state, keyed by item value. Disabled
  // items are excluded from arrow-key/Home/End navigation via enabledOrder().
  const order = useRef<string[]>([]);
  const disabledMap = useRef<Map<string, boolean>>(new Map());

  const registerItem = useCallback((itemValue: string, disabled = false) => {
    if (!order.current.includes(itemValue)) order.current.push(itemValue);
    disabledMap.current.set(itemValue, disabled);
    return () => {
      order.current = order.current.filter((v) => v !== itemValue);
      disabledMap.current.delete(itemValue);
    };
  }, []);

  /** Keeps disabled state in sync when it changes after initial registration. */
  const setItemDisabled = useCallback((itemValue: string, disabled: boolean) => {
    disabledMap.current.set(itemValue, disabled);
  }, []);

  const enabledOrder = useCallback(
    () => order.current.filter((v) => !disabledMap.current.get(v)),
    [],
  );

  const isOpen = useCallback(
    (itemValue: string): boolean => {
      if (type === 'multiple') return Array.isArray(openValue) && openValue.includes(itemValue);
      return openValue === itemValue;
    },
    [openValue, type],
  );

  const toggle = useCallback(
    (itemValue: string, disabled: boolean) => {
      if (disabled) return;
      if (type === 'multiple') {
        const current = Array.isArray(openValue) ? openValue : [];
        const next = current.includes(itemValue)
          ? current.filter((v) => v !== itemValue)
          : [...current, itemValue];
        setOpenValue(next);
      } else {
        const next = openValue === itemValue ? (collapsible ? undefined : itemValue) : itemValue;
        setOpenValue(next);
      }
    },
    [collapsible, openValue, setOpenValue, type],
  );

  const focusItem = useCallback(
    (itemValue: string) => {
      document.getElementById(`${baseId}-trigger-${itemValue}`)?.focus();
    },
    [baseId],
  );

  const handleKeyDown = useCallback(
    (currentValue: string, e: KeyboardEvent) => {
      const enabled = enabledOrder();
      const i = enabled.indexOf(currentValue);
      if (i === -1 || enabled.length === 0) return;

      let target: number | null = null;
      switch (e.key) {
        case 'ArrowDown':
          target = (i + 1) % enabled.length;
          break;
        case 'ArrowUp':
          target = (i - 1 + enabled.length) % enabled.length;
          break;
        case 'Home':
          target = 0;
          break;
        case 'End':
          target = enabled.length - 1;
          break;
        default:
          return;
      }
      e.preventDefault();
      const t = enabled[target];
      if (t) focusItem(t);
    },
    [enabledOrder, focusItem],
  );

  const getTriggerProps = useCallback(
    (itemValue: string, disabled = false) => ({
      id: `${baseId}-trigger-${itemValue}`,
      'aria-expanded': isOpen(itemValue),
      'aria-controls': `${baseId}-panel-${itemValue}`,
      'aria-disabled': disabled || undefined,
      onClick: () => toggle(itemValue, disabled),
      onKeyDown: (e: KeyboardEvent) => handleKeyDown(itemValue, e),
    }),
    [baseId, handleKeyDown, isOpen, toggle],
  );

  const getPanelProps = useCallback(
    (itemValue: string) => ({
      id: `${baseId}-panel-${itemValue}`,
      role: 'region' as const,
      'aria-labelledby': `${baseId}-trigger-${itemValue}`,
    }),
    [baseId],
  );

  return {
    openValue,
    isOpen,
    registerItem,
    setItemDisabled,
    getTriggerProps,
    getPanelProps,
  };
}

export type UseAccordionReturn = ReturnType<typeof useAccordion>;
