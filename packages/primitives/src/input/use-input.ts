import { useCallback, useRef, useState, type ChangeEvent } from 'react';
import { useControllableState, useStableId } from '@acl/utils';

export interface UseInputOptions {
  value?: string;
  defaultValue?: string;
  onChange?: (value: string, event: ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  required?: boolean;
  readOnly?: boolean;
  type?: string;
  id?: string;
}

export function useInput({
  value: controlledValue,
  defaultValue = '',
  onChange,
  disabled = false,
  required = false,
  readOnly = false,
  type = 'text',
  id,
}: UseInputOptions = {}) {
  const stableId = useStableId(id ?? 'input');
  const inputRef = useRef<HTMLInputElement | null>(null);

  const [value, setValue] = useControllableState<string>({
    value: controlledValue,
    defaultValue,
  });

  const [showPassword, setShowPassword] = useState(false);

  const handleChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      setValue(newValue);
      onChange?.(newValue, e);
    },
    [setValue, onChange],
  );

  const togglePasswordVisibility = useCallback(() => {
    const el = inputRef.current;
    const start = el?.selectionStart ?? null;
    const end = el?.selectionEnd ?? null;

    setShowPassword((prev) => !prev);

    // Preserve selection & cursor position across type change
    requestAnimationFrame(() => {
      if (el && start !== null && end !== null) {
        try {
          el.setSelectionRange(start, end);
        } catch {
          // Ignore if type doesn't support selection range
        }
      }
    });
  }, []);

  const effectiveType = type === 'password' ? (showPassword ? 'text' : 'password') : type;

  const getInputProps = useCallback(
    () => ({
      id: stableId,
      type: effectiveType,
      value,
      disabled,
      readOnly,
      required,
      onChange: handleChange,
    }),
    [stableId, effectiveType, value, disabled, readOnly, required, handleChange],
  );

  return {
    value,
    setValue,
    showPassword,
    setShowPassword,
    togglePasswordVisibility,
    effectiveType,
    inputRef,
    getInputProps,
  };
}

export type UseInputReturn = ReturnType<typeof useInput>;
