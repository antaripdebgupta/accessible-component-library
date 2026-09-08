import { renderHook, act } from '@testing-library/react';
import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { useToastQueue } from './use-toast';

beforeEach(() => {
  vi.useFakeTimers();
});
afterEach(() => {
  vi.useRealTimers();
});

describe('useToastQueue — push/dismiss', () => {
  test('push adds a toast with a generated id and default duration', () => {
    const { result } = renderHook(() => useToastQueue());
    act(() => result.current.push({ description: 'Saved' }));
    expect(result.current.toasts).toHaveLength(1);
    const toast = result.current.toasts[0]!;
    expect(toast.description).toBe('Saved');
    expect(toast.duration).toBe(4500);
    expect(typeof toast.id).toBe('string');
  });

  test('push respects a custom duration', () => {
    const { result } = renderHook(() => useToastQueue());
    act(() => result.current.push({ description: 'Custom', duration: 1000 }));
    expect(result.current.toasts[0]!.duration).toBe(1000);
  });

  test('multiple pushes queue multiple toasts with unique ids', () => {
    const { result } = renderHook(() => useToastQueue());
    act(() => {
      result.current.push({ description: 'A' });
      result.current.push({ description: 'B' });
    });
    expect(result.current.toasts).toHaveLength(2);
    const [first, second] = result.current.toasts;
    expect(first!.id).not.toBe(second!.id);
  });

  test('dismiss removes the toast by id', () => {
    const { result } = renderHook(() => useToastQueue());
    let id = '';
    act(() => {
      id = result.current.push({ description: 'Dismiss me' });
    });
    act(() => result.current.dismiss(id));
    expect(result.current.toasts).toHaveLength(0);
  });

  test('dismissing an unknown id is a no-op', () => {
    const { result } = renderHook(() => useToastQueue());
    act(() => result.current.push({ description: 'Stays' }));
    act(() => result.current.dismiss('nonexistent-id'));
    expect(result.current.toasts).toHaveLength(1);
  });
});

describe('useToastQueue — scheduleDismiss / pause', () => {
  test('scheduleDismiss auto-dismisses the toast after the given ms', () => {
    const { result } = renderHook(() => useToastQueue());
    let id = '';
    act(() => {
      id = result.current.push({ description: 'Timed' });
    });
    act(() => result.current.scheduleDismiss(id, 3000));
    expect(result.current.toasts).toHaveLength(1);
    act(() => vi.advanceTimersByTime(3000));
    expect(result.current.toasts).toHaveLength(0);
  });

  test('scheduleDismiss with ms=0 never auto-dismisses', () => {
    const { result } = renderHook(() => useToastQueue());
    let id = '';
    act(() => {
      id = result.current.push({ description: 'Persistent' });
    });
    act(() => result.current.scheduleDismiss(id, 0));
    act(() => vi.advanceTimersByTime(60000));
    expect(result.current.toasts).toHaveLength(1);
  });

  test('pause cancels a pending scheduled dismiss', () => {
    const { result } = renderHook(() => useToastQueue());
    let id = '';
    act(() => {
      id = result.current.push({ description: 'Pausable' });
    });
    act(() => result.current.scheduleDismiss(id, 2000));
    act(() => result.current.pause(id));
    act(() => vi.advanceTimersByTime(5000));
    expect(result.current.toasts).toHaveLength(1); // never dismissed
  });

  test('re-calling scheduleDismiss resets the timer (hover-out resume behavior)', () => {
    const { result } = renderHook(() => useToastQueue());
    let id = '';
    act(() => {
      id = result.current.push({ description: 'Reschedule' });
    });
    act(() => result.current.scheduleDismiss(id, 3000));
    act(() => vi.advanceTimersByTime(2000)); // 1s remaining on original timer
    act(() => result.current.pause(id)); // simulate hover-in
    act(() => vi.advanceTimersByTime(5000)); // would have fired if not paused
    expect(result.current.toasts).toHaveLength(1);

    act(() => result.current.scheduleDismiss(id, 3000)); // simulate hover-out, fresh 3s
    act(() => vi.advanceTimersByTime(2999));
    expect(result.current.toasts).toHaveLength(1);
    act(() => vi.advanceTimersByTime(1));
    expect(result.current.toasts).toHaveLength(0);
  });

  test('dismissing a toast clears its pending timer (no stale dismiss on a reused id)', () => {
    const { result } = renderHook(() => useToastQueue());
    let id = '';
    act(() => {
      id = result.current.push({ description: 'Manual dismiss' });
    });
    act(() => result.current.scheduleDismiss(id, 5000));
    act(() => result.current.dismiss(id));
    expect(result.current.toasts).toHaveLength(0);
    act(() => vi.advanceTimersByTime(5000));
    expect(result.current.toasts).toHaveLength(0);
  });
});

describe('useToastQueue — variant/title passthrough', () => {
  test('preserves title and variant on the pushed toast', () => {
    const { result } = renderHook(() => useToastQueue());
    act(() =>
      result.current.push({ title: 'Error', description: 'Something failed', variant: 'danger' }),
    );
    const toast = result.current.toasts[0]!;
    expect(toast.title).toBe('Error');
    expect(toast.variant).toBe('danger');
  });
});
