import { useCallback, useRef, useState, type KeyboardEvent } from 'react';
import { useControllableState, useStableId } from '@acl/utils';

export interface UseRadioGroupOptions {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  disabled?: boolean;
  name?: string;
  orientation?: 'horizontal' | 'vertical';
  dir?: 'ltr' | 'rtl';
}

interface RadioItemMeta {
  value: string;
  disabled: boolean;
  ref: React.RefObject<HTMLInputElement | null>;
}

export function useRadioGroup({
  value: controlledValue,
  defaultValue,
  onValueChange,
  disabled: groupDisabled = false,
  name,
  orientation = 'vertical',
  dir = 'ltr',
}: UseRadioGroupOptions = {}) {
  const stableName = useStableId(name ?? 'radio-group-name');

  const [value, setValue] = useControllableState<string | undefined>({
    value: controlledValue,
    defaultValue,
    onChange: (val) => {
      if (val !== undefined) onValueChange?.(val);
    },
  });

  const registry = useRef<Map<string, RadioItemMeta>>(new Map());
  const order = useRef<string[]>([]);
  const [focusedValue, setFocusedValue] = useState<string | undefined>(undefined);

  const registerItem = useCallback((val: string, itemMeta: Omit<RadioItemMeta, 'value'>) => {
    if (!order.current.includes(val)) {
      order.current.push(val);
    }
    registry.current.set(val, { value: val, ...itemMeta });
    return () => {
      registry.current.delete(val);
      order.current = order.current.filter((v) => v !== val);
    };
  }, []);

  const enabledOrder = useCallback(() => {
    return order.current.filter((val) => {
      const item = registry.current.get(val);
      return item && !item.disabled && !groupDisabled;
    });
  }, [groupDisabled]);

  const selectValue = useCallback(
    (val: string) => {
      const item = registry.current.get(val);
      if (!item || item.disabled || groupDisabled) return;
      setValue(val);
    },
    [groupDisabled, setValue],
  );

  const focusValue = useCallback((val: string) => {
    const item = registry.current.get(val);
    if (item && item.ref.current) {
      item.ref.current.focus();
      setFocusedValue(val);
    }
  }, []);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>, currentVal: string) => {
      const enabled = enabledOrder();
      if (enabled.length === 0) return;

      const currentIndex = enabled.indexOf(currentVal);
      if (currentIndex === -1) return;

      const isVertical = orientation === 'vertical';
      const isRtl = dir === 'rtl';

      let nextIndex = currentIndex;
      let handled = false;

      if (isVertical) {
        if (e.key === 'ArrowDown') {
          nextIndex = (currentIndex + 1) % enabled.length;
          handled = true;
        } else if (e.key === 'ArrowUp') {
          nextIndex = (currentIndex - 1 + enabled.length) % enabled.length;
          handled = true;
        }
      } else {
        if (e.key === 'ArrowRight') {
          nextIndex = isRtl
            ? (currentIndex - 1 + enabled.length) % enabled.length
            : (currentIndex + 1) % enabled.length;
          handled = true;
        } else if (e.key === 'ArrowLeft') {
          nextIndex = isRtl
            ? (currentIndex + 1) % enabled.length
            : (currentIndex - 1 + enabled.length) % enabled.length;
          handled = true;
        }
      }

      if (e.key === 'Home') {
        nextIndex = 0;
        handled = true;
      } else if (e.key === 'End') {
        nextIndex = enabled.length - 1;
        handled = true;
      }

      if (handled) {
        e.preventDefault();
        const targetVal = enabled[nextIndex];
        if (targetVal) {
          selectValue(targetVal);
          focusValue(targetVal);
        }
      }
    },
    [enabledOrder, orientation, dir, selectValue, focusValue],
  );

  return {
    value,
    setValue,
    name: stableName,
    orientation,
    dir,
    groupDisabled,
    registerItem,
    selectValue,
    focusValue,
    handleKeyDown,
    focusedValue,
    setFocusedValue,
    order,
  };
}

export type UseRadioGroupReturn = ReturnType<typeof useRadioGroup>;
