import { act, renderHook } from '@testing-library/react';
import { expect, test, vi } from 'vitest';
import { useSwitch } from './use-switch';
import type { KeyboardEvent, MouseEvent } from 'react';

test('uncontrolled switch toggles state', () => {
  const { result } = renderHook(() => useSwitch());
  expect(result.current.checked).toBe(false);

  act(() => {
    result.current.toggle();
  });
  expect(result.current.checked).toBe(true);

  // Wait 250ms to allow toggling again due to double-click prevention
  vi.useFakeTimers();
  vi.advanceTimersByTime(250);

  act(() => {
    result.current.toggle();
  });
  expect(result.current.checked).toBe(false);
  vi.useRealTimers();
});

test('controlled switch respects parent state and triggers onCheckedChange', () => {
  const onCheckedChange = vi.fn();
  const { result } = renderHook(() => useSwitch({ checked: true, onCheckedChange }));

  expect(result.current.checked).toBe(true);

  act(() => {
    result.current.toggle();
  });

  expect(onCheckedChange).toHaveBeenCalledWith(false);
  expect(result.current.checked).toBe(true); // remains true since controlled
});

test('disabled and aria-disabled options prevent toggle', () => {
  const onCheckedChange = vi.fn();
  const { result: disabledResult } = renderHook(() =>
    useSwitch({ disabled: true, onCheckedChange }),
  );

  act(() => {
    disabledResult.current.toggle();
  });
  expect(onCheckedChange).not.toHaveBeenCalled();

  const { result: ariaDisabledResult } = renderHook(() =>
    useSwitch({ 'aria-disabled': true, onCheckedChange }),
  );

  act(() => {
    ariaDisabledResult.current.toggle();
  });
  expect(onCheckedChange).not.toHaveBeenCalled();
});

test('pending state prevents toggle and sets aria-busy', () => {
  const onCheckedChange = vi.fn();
  const { result } = renderHook(() => useSwitch({ pending: true, onCheckedChange }));

  const props = result.current.getSwitchProps();
  expect(props['aria-busy']).toBe(true);

  act(() => {
    result.current.toggle();
  });
  expect(onCheckedChange).not.toHaveBeenCalled();
});

test('rapid double toggles are ignored', () => {
  const onCheckedChange = vi.fn();
  const { result } = renderHook(() => useSwitch({ onCheckedChange }));

  vi.useFakeTimers();
  const now = Date.now();
  vi.setSystemTime(now);

  act(() => {
    result.current.toggle();
  });

  vi.setSystemTime(now + 100); // 100ms later (less than 200ms)

  act(() => {
    result.current.toggle();
  });

  expect(onCheckedChange).toHaveBeenCalledTimes(1);
  vi.useRealTimers();
});

test('getSwitchProps returns correct ARIA attributes and handles events', () => {
  const { result } = renderHook(() => useSwitch({ id: 'test-switch' }));
  const props = result.current.getSwitchProps();

  expect(props.id).toContain('test-switch');
  expect(props.role).toBe('switch');
  expect(props['aria-checked']).toBe(false);

  const mockPreventDefault = vi.fn();
  const clickEvent = { preventDefault: mockPreventDefault } as unknown as MouseEvent;

  act(() => {
    props.onClick(clickEvent);
  });
  expect(mockPreventDefault).toHaveBeenCalled();
  expect(result.current.checked).toBe(true);
});
