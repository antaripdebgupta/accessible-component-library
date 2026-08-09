import { useCallback, useEffect, useRef, type ChangeEvent } from 'react';
import { useControllableState, useStableId } from '@acl/utils';

export interface UseCheckboxOptions {
  checked?: boolean | 'indeterminate';
  defaultChecked?: boolean | 'indeterminate';
  onCheckedChange?: (checked: boolean | 'indeterminate') => void;
  disabled?: boolean;
  required?: boolean;
  id?: string;
}

export function useCheckbox({
  checked: controlledChecked,
  defaultChecked = false,
  onCheckedChange,
  disabled = false,
  required = false,
  id,
}: UseCheckboxOptions = {}) {
  const stableId = useStableId(id ?? 'checkbox');

  const [checked, setChecked] = useControllableState<boolean | 'indeterminate'>({
    value: controlledChecked,
    defaultValue: defaultChecked,
    onChange: onCheckedChange,
  });

  const inputRef = useRef<HTMLInputElement | null>(null);

  // Sync HTMLInputElement's native indeterminate property
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.indeterminate = checked === 'indeterminate';
    }
  }, [checked]);

  const handleChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      if (disabled) return;

      // Indeterminate + click moves to fully checked, not unchecked.
      if (checked === 'indeterminate') {
        setChecked(true);
      } else {
        setChecked(e.target.checked);
      }
    },
    [checked, disabled, setChecked],
  );

  const getInputProps = useCallback(() => {
    return {
      id: stableId,
      type: 'checkbox' as const,
      checked: checked === 'indeterminate' ? false : checked,
      disabled: disabled ? true : undefined,
      required: required ? true : undefined,
      onChange: handleChange,
    };
  }, [stableId, checked, disabled, required, handleChange]);

  return {
    checked,
    setChecked,
    inputRef,
    getInputProps,
  };
}

export type UseCheckboxReturn = ReturnType<typeof useCheckbox>;
