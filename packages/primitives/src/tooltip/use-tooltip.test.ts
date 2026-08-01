import { renderHook, act } from '@testing-library/react';
import { describe, test, expect, vi } from 'vitest';
import { useTooltip } from './use-tooltip';

describe('useTooltip — hover timing', () => {
  test('show is delayed by delayDuration on hover', () => {
    vi.useFakeTimers();
    const { result } = renderHook(() => useTooltip({ delayDuration: 300 }));

    act(() => result.current.getTriggerProps().onMouseEnter({} as any));
    expect(result.current.open).toBe(false);

    act(() => vi.advanceTimersByTime(300));
    expect(result.current.open).toBe(true);
    vi.useRealTimers();
  });

  test('focus shows immediately, ignoring delayDuration', () => {
    vi.useFakeTimers();
    const { result } = renderHook(() => useTooltip({ delayDuration: 300 }));
    act(() => result.current.getTriggerProps().onFocus({} as any));
    expect(result.current.open).toBe(true);
    vi.useRealTimers();
  });

  test('disabled never opens', () => {
    vi.useFakeTimers();
    const { result } = renderHook(() => useTooltip({ delayDuration: 0, disabled: true }));
    act(() => result.current.getTriggerProps().onFocus({} as any));
    expect(result.current.open).toBe(false);
    vi.useRealTimers();
  });
});

describe('useTooltip — hoverable content (WCAG 1.4.13)', () => {
  test('entering the content cancels a pending hide', () => {
    vi.useFakeTimers();
    const { result } = renderHook(() => useTooltip({ delayDuration: 0, hideDelay: 100 }));

    act(() => result.current.getTriggerProps().onFocus({} as any));
    expect(result.current.open).toBe(true);

    act(() => result.current.getTriggerProps().onBlur({} as any));
    act(() => result.current.getContentProps().onMouseEnter({} as any));
    act(() => vi.advanceTimersByTime(200));

    expect(result.current.open).toBe(true);
    vi.useRealTimers();
  });

  test('leaving the content hides after hideDelay', () => {
    vi.useFakeTimers();
    const { result } = renderHook(() => useTooltip({ delayDuration: 0, hideDelay: 100 }));

    act(() => result.current.getTriggerProps().onFocus({} as any));
    act(() => result.current.getContentProps().onMouseLeave({} as any));
    expect(result.current.open).toBe(true);

    act(() => vi.advanceTimersByTime(100));
    expect(result.current.open).toBe(false);
    vi.useRealTimers();
  });
});

describe('useTooltip — ids', () => {
  test('aria-describedby is only set while open', () => {
    const { result } = renderHook(() => useTooltip({ delayDuration: 0 }));
    expect(result.current.getTriggerProps()['aria-describedby']).toBeUndefined();

    act(() => result.current.getTriggerProps().onFocus({} as any));
    expect(result.current.getTriggerProps()['aria-describedby']).toBe(result.current.contentId);
  });
});
