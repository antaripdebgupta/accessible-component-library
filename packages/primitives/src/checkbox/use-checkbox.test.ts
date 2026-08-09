import { act, renderHook } from '@testing-library/react';
import { expect, test, vi } from 'vitest';
import { useCheckbox } from './use-checkbox';
import type { ChangeEvent } from 'react';

test('uncontrolled checkbox default state and checking', () => {
  const { result } = renderHook(() => useCheckbox({ defaultChecked: false }));
  expect(result.current.checked).toBe(false);

  const inputProps = result.current.getInputProps();
  expect(inputProps.checked).toBe(false);

  const mockEvent = {
    target: { checked: true },
  } as ChangeEvent<HTMLInputElement>;

  act(() => {
    inputProps.onChange(mockEvent);
  });

  expect(result.current.checked).toBe(true);
});

test('controlled checkbox reflects value and calls onCheckedChange', () => {
  const onCheckedChange = vi.fn();
  const { result } = renderHook(() => useCheckbox({ checked: false, onCheckedChange }));

  const inputProps = result.current.getInputProps();
  const mockEvent = {
    target: { checked: true },
  } as ChangeEvent<HTMLInputElement>;

  act(() => {
    inputProps.onChange(mockEvent);
  });

  expect(onCheckedChange).toHaveBeenCalledWith(true);
  expect(result.current.checked).toBe(false); // remains false since controlled
});

test('indeterminate checkbox turns into fully checked on click/change', () => {
  const onCheckedChange = vi.fn();
  const { result } = renderHook(() => useCheckbox({ checked: 'indeterminate', onCheckedChange }));

  const inputProps = result.current.getInputProps();
  expect(inputProps.checked).toBe(false);

  const mockEvent = {
    target: { checked: true },
  } as ChangeEvent<HTMLInputElement>;

  act(() => {
    inputProps.onChange(mockEvent);
  });

  expect(onCheckedChange).toHaveBeenCalledWith(true);
});

test('disabled state does not trigger onCheckedChange', () => {
  const onCheckedChange = vi.fn();
  const { result } = renderHook(() => useCheckbox({ disabled: true, onCheckedChange }));

  const inputProps = result.current.getInputProps();
  const mockEvent = {
    target: { checked: true },
  } as ChangeEvent<HTMLInputElement>;

  act(() => {
    inputProps.onChange(mockEvent);
  });

  expect(onCheckedChange).not.toHaveBeenCalled();
});
