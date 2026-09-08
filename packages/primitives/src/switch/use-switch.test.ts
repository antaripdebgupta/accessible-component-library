import { act, renderHook } from '@testing-library/react';
import { expect, test, describe, vi } from 'vitest';
import { useSwitch } from './use-switch';
import type { KeyboardEvent, MouseEvent } from 'react';

test('uncontrolled switch toggles state', () => {
  const { result } = renderHook(() => useSwitch());
  expect(result.current.checked).toBe(false);

  act(() => {
    result.current.toggle();
  });
  expect(result.current.checked).toBe(true);

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
  expect(result.current.checked).toBe(true);
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

  vi.setSystemTime(now + 100);

  act(() => {
    result.current.toggle();
  });

  expect(onCheckedChange).toHaveBeenCalledTimes(1);
  vi.useRealTimers();
});

test('a toggle after the 200ms window succeeds', () => {
  const onCheckedChange = vi.fn();
  const { result } = renderHook(() => useSwitch({ onCheckedChange }));

  vi.useFakeTimers();
  const now = Date.now();
  vi.setSystemTime(now);
  act(() => result.current.toggle());

  vi.setSystemTime(now + 250); // past the 200ms guard
  act(() => result.current.toggle());

  expect(onCheckedChange).toHaveBeenCalledTimes(2);
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

describe('useSwitch — disabled/tabIndex props', () => {
  test('tabIndex is -1 when disabled, 0 otherwise', () => {
    const { result: enabled } = renderHook(() => useSwitch());
    expect(enabled.current.getSwitchProps().tabIndex).toBe(0);

    const { result: disabled } = renderHook(() => useSwitch({ disabled: true }));
    expect(disabled.current.getSwitchProps().tabIndex).toBe(-1);
  });

  test('disabled attribute is undefined when not disabled', () => {
    const { result } = renderHook(() => useSwitch());
    expect(result.current.getSwitchProps().disabled).toBeUndefined();
  });

  test('aria-disabled attribute is undefined when ariaDisabled is false', () => {
    const { result } = renderHook(() => useSwitch());
    expect(result.current.getSwitchProps()['aria-disabled']).toBeUndefined();
  });

  test('aria-busy is undefined when not pending', () => {
    const { result } = renderHook(() => useSwitch());
    expect(result.current.getSwitchProps()['aria-busy']).toBeUndefined();
  });
});

describe('useSwitch — keyboard handling', () => {
  test.each([' ', 'Enter'])('%s toggles the switch', (key) => {
    const { result } = renderHook(() => useSwitch());
    const preventDefault = vi.fn();
    act(() =>
      result.current
        .getSwitchProps()
        .onKeyDown({ key, preventDefault } as unknown as KeyboardEvent),
    );
    expect(preventDefault).toHaveBeenCalled();
    expect(result.current.checked).toBe(true);
  });

  test('unrelated keys are ignored', () => {
    const { result } = renderHook(() => useSwitch());
    const preventDefault = vi.fn();
    act(() =>
      result.current
        .getSwitchProps()
        .onKeyDown({ key: 'Tab', preventDefault } as unknown as KeyboardEvent),
    );
    expect(preventDefault).not.toHaveBeenCalled();
    expect(result.current.checked).toBe(false);
  });

  test('keydown is a no-op while disabled/pending', () => {
    const { result: disabled } = renderHook(() => useSwitch({ disabled: true }));
    act(() =>
      disabled.current
        .getSwitchProps()
        .onKeyDown({ key: 'Enter', preventDefault: () => {} } as unknown as KeyboardEvent),
    );
    expect(disabled.current.checked).toBe(false);

    const { result: pending } = renderHook(() => useSwitch({ pending: true }));
    act(() =>
      pending.current
        .getSwitchProps()
        .onKeyDown({ key: 'Enter', preventDefault: () => {} } as unknown as KeyboardEvent),
    );
    expect(pending.current.checked).toBe(false);
  });
});

describe('useSwitch — setChecked direct API', () => {
  test('setChecked can set state directly, bypassing toggle()', () => {
    const { result } = renderHook(() => useSwitch());
    act(() => result.current.setChecked(true));
    expect(result.current.checked).toBe(true);
  });
});
