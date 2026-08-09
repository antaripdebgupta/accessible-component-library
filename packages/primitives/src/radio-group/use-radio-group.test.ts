import { act, renderHook } from '@testing-library/react';
import { expect, test, vi } from 'vitest';
import { useRadioGroup } from './use-radio-group';
import type { KeyboardEvent } from 'react';

test('initial uncontrolled state does not auto-select first item', () => {
  const { result } = renderHook(() => useRadioGroup());
  expect(result.current.value).toBeUndefined();
});

test('registering items and selecting updates state', () => {
  const { result } = renderHook(() => useRadioGroup());

  const ref1 = { current: null };
  const ref2 = { current: null };

  act(() => {
    result.current.registerItem('option-1', { disabled: false, ref: ref1 });
    result.current.registerItem('option-2', { disabled: false, ref: ref2 });
  });

  act(() => {
    result.current.selectValue('option-1');
  });

  expect(result.current.value).toBe('option-1');
});

test('skips disabled options when navigating', () => {
  const { result } = renderHook(() => useRadioGroup({ orientation: 'vertical' }));
  const ref1 = { current: { focus: vi.fn() } as unknown as HTMLInputElement };
  const ref2 = { current: { focus: vi.fn() } as unknown as HTMLInputElement };
  const ref3 = { current: { focus: vi.fn() } as unknown as HTMLInputElement };

  act(() => {
    result.current.registerItem('a', { disabled: false, ref: ref1 });
    result.current.registerItem('b', { disabled: true, ref: ref2 });
    result.current.registerItem('c', { disabled: false, ref: ref3 });
  });

  const preventDefault = vi.fn();
  const event = { key: 'ArrowDown', preventDefault } as unknown as KeyboardEvent<HTMLInputElement>;

  // Trigger from a -> should skip b and select/focus c
  act(() => {
    result.current.handleKeyDown(event, 'a');
  });

  expect(result.current.value).toBe('c');
  expect(ref3.current.focus).toHaveBeenCalled();
});

test('respects orientation and RTL settings', () => {
  // Horizontal with RTL
  const { result } = renderHook(() => useRadioGroup({ orientation: 'horizontal', dir: 'rtl' }));
  const ref1 = { current: { focus: vi.fn() } as unknown as HTMLInputElement };
  const ref2 = { current: { focus: vi.fn() } as unknown as HTMLInputElement };

  act(() => {
    result.current.registerItem('a', { disabled: false, ref: ref1 });
    result.current.registerItem('b', { disabled: false, ref: ref2 });
  });

  const preventDefault = vi.fn();
  const event = { key: 'ArrowRight', preventDefault } as unknown as KeyboardEvent<HTMLInputElement>;

  // ArrowRight in RTL should move LEFT (wrap backwards to last option)
  act(() => {
    result.current.handleKeyDown(event, 'a');
  });

  expect(result.current.value).toBe('b');
});
