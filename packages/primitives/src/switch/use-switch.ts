import { useCallback, useRef, type KeyboardEvent, type MouseEvent } from 'react';
import { useControllableState, useStableId } from '@acl/utils';

export interface UseSwitchOptions {
  checked?: boolean;
  defaultChecked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
  'aria-disabled'?: boolean;
  pending?: boolean;
  id?: string;
}

export function useSwitch({
  checked: controlledChecked,
  defaultChecked = false,
  onCheckedChange,
  disabled = false,
  'aria-disabled': ariaDisabled,
  pending = false,
  id,
}: UseSwitchOptions = {}) {
  const stableId = useStableId(id ?? 'switch');

  const [checked, setChecked] = useControllableState<boolean>({
    value: controlledChecked,
    defaultValue: defaultChecked,
    onChange: onCheckedChange,
  });

  const lastToggleTimeRef = useRef(0);

  const toggle = useCallback(() => {
    if (disabled || ariaDisabled || pending) return;

    // Prevent rapid double-toggle inconsistency (less than 200ms)
    const now = Date.now();
    if (now - lastToggleTimeRef.current < 200) return;
    lastToggleTimeRef.current = now;

    setChecked(!checked);
  }, [disabled, ariaDisabled, pending, checked, setChecked]);

  const getSwitchProps = useCallback(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (disabled || ariaDisabled || pending) return;
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        toggle();
      }
    };

    const handleClick = (e: MouseEvent) => {
      e.preventDefault();
      toggle();
    };

    return {
      id: stableId,
      role: 'switch',
      'aria-checked': checked,
      'aria-disabled': ariaDisabled ? true : undefined,
      'aria-busy': pending ? true : undefined,
      disabled: disabled ? true : undefined,
      tabIndex: disabled ? -1 : 0,
      onClick: handleClick,
      onKeyDown: handleKeyDown,
    };
  }, [stableId, checked, ariaDisabled, pending, disabled, toggle]);

  return {
    checked,
    setChecked,
    toggle,
    getSwitchProps,
  };
}

export type UseSwitchReturn = ReturnType<typeof useSwitch>;
