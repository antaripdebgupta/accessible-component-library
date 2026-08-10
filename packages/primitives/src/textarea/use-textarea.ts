import { useCallback, useRef, type ChangeEvent, type KeyboardEvent } from 'react';
import { useControllableState, useStableId } from '@acl/utils';

export function getGraphemeCount(str: string): number {
  if (!str) return 0;
  if (typeof Intl !== 'undefined' && 'Segmenter' in Intl) {
    try {
      const segmenter = new Intl.Segmenter(undefined, { granularity: 'grapheme' });
      return Array.from(segmenter.segment(str)).length;
    } catch {
      // Fallback if Segmenter is not supported or throws
    }
  }
  return Array.from(str).length;
}

export interface UseTextareaOptions {
  value?: string;
  defaultValue?: string;
  onChange?: (value: string, event: ChangeEvent<HTMLTextAreaElement>) => void;
  disabled?: boolean;
  required?: boolean;
  readOnly?: boolean;
  maxLength?: number;
  maxCount?: number;
  submitOnEnter?: boolean;
  onSubmit?: (value: string, event: KeyboardEvent<HTMLTextAreaElement>) => void;
  id?: string;
}

export function useTextarea({
  value: controlledValue,
  defaultValue = '',
  onChange,
  disabled = false,
  required = false,
  readOnly = false,
  maxLength,
  maxCount,
  submitOnEnter = false,
  onSubmit,
  id,
}: UseTextareaOptions = {}) {
  const stableId = useStableId(id ?? 'textarea');
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const [value, setValue] = useControllableState<string>({
    value: controlledValue,
    defaultValue,
  });

  const characterCount = getGraphemeCount(value ?? '');
  const limit = maxCount ?? maxLength;
  const isOverCount = limit !== undefined ? characterCount > limit : false;
  const remainingCount = limit !== undefined ? limit - characterCount : undefined;

  const isNearLimit =
    limit !== undefined
      ? remainingCount !== undefined &&
        remainingCount >= 0 &&
        (remainingCount <= 10 || remainingCount <= limit * 0.1)
      : false;

  const handleChange = useCallback(
    (e: ChangeEvent<HTMLTextAreaElement>) => {
      const newValue = e.target.value;
      setValue(newValue);
      onChange?.(newValue, e);
    },
    [setValue, onChange],
  );

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLTextAreaElement>) => {
      if (submitOnEnter && e.key === 'Enter' && !e.shiftKey) {
        if (!e.nativeEvent.isComposing) {
          e.preventDefault();
          onSubmit?.(value, e);
          const form = textareaRef.current?.form;
          if (form && typeof form.requestSubmit === 'function') {
            form.requestSubmit();
          }
        }
      }
    },
    [submitOnEnter, onSubmit, value],
  );

  const getTextareaProps = useCallback(
    () => ({
      id: stableId,
      value,
      disabled,
      readOnly,
      required,
      maxLength,
      onChange: handleChange,
      onKeyDown: handleKeyDown,
    }),
    [stableId, value, disabled, readOnly, required, maxLength, handleChange, handleKeyDown],
  );

  return {
    value,
    setValue,
    characterCount,
    remainingCount,
    isOverCount,
    isNearLimit,
    textareaRef,
    getTextareaProps,
  };
}

export type UseTextareaReturn = ReturnType<typeof useTextarea>;
