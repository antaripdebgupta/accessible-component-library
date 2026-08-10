import { renderHook, waitFor } from '@testing-library/react';
import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { useAvatar, useAvatarImage, getInitials } from './use-avatar';
import { useAvatarGroup } from './use-avatar-group';
import { createElement } from 'react';

describe('getInitials', () => {
  test('derives initials from first and last name', () => {
    expect(getInitials('Ada Lovelace')).toBe('AL');
  });

  test('single-word name uses first two characters', () => {
    expect(getInitials('Cher')).toBe('CH');
  });

  test('multi-word name uses first and last word only', () => {
    expect(getInitials('Mary Jane Watson')).toBe('MW');
  });

  test('handles extra whitespace', () => {
    expect(getInitials('  Ada   Lovelace  ')).toBe('AL');
  });

  test('returns empty string for undefined/empty name', () => {
    expect(getInitials(undefined)).toBe('');
    expect(getInitials('')).toBe('');
    expect(getInitials('   ')).toBe('');
  });

  test('uppercases lowercase input', () => {
    expect(getInitials('ada lovelace')).toBe('AL');
  });
});

describe('useAvatarImage', () => {
  let originalImage: typeof Image;

  beforeEach(() => {
    originalImage = global.Image;
  });

  afterEach(() => {
    global.Image = originalImage;
    vi.restoreAllMocks();
  });

  function mockImage(outcome: 'load' | 'error') {
    class MockImage {
      onload: (() => void) | null = null;
      onerror: (() => void) | null = null;
      _src = '';
      set src(value: string) {
        this._src = value;
        queueMicrotask(() => {
          if (outcome === 'load') this.onload?.();
          else this.onerror?.();
        });
      }
      get src() {
        return this._src;
      }
    }
    // @ts-expect-error test mock
    global.Image = MockImage;
  }

  test('status is idle when no src is provided', () => {
    const { result } = renderHook(() => useAvatarImage(undefined));
    expect(result.current).toBe('idle');
  });

  test('status is loading immediately after a src is set', () => {
    mockImage('load');
    const { result } = renderHook(() => useAvatarImage('https://example.com/a.png'));
    expect(result.current).toBe('loading');
  });

  test('status becomes loaded on successful image load', async () => {
    mockImage('load');
    const { result } = renderHook(() => useAvatarImage('https://example.com/a.png'));
    await waitFor(() => expect(result.current).toBe('loaded'));
  });

  test('status becomes error on failed image load', async () => {
    mockImage('error');
    const { result } = renderHook(() => useAvatarImage('https://example.com/broken.png'));
    await waitFor(() => expect(result.current).toBe('error'));
  });

  test('changing src resets status and re-evaluates', async () => {
    mockImage('load');
    const { result, rerender } = renderHook(({ src }) => useAvatarImage(src), {
      initialProps: { src: 'https://example.com/a.png' },
    });
    await waitFor(() => expect(result.current).toBe('loaded'));

    mockImage('error');
    rerender({ src: 'https://example.com/b.png' });
    expect(result.current).toBe('loading'); // reset immediately on src change
    await waitFor(() => expect(result.current).toBe('error'));
  });

  test('clearing src resets status to idle', async () => {
    mockImage('load');
    const { result, rerender } = renderHook(({ src }: { src?: string }) => useAvatarImage(src), {
      initialProps: { src: 'https://example.com/a.png' } as { src?: string },
    });
    await waitFor(() => expect(result.current).toBe('loaded'));

    rerender({ src: undefined });
    expect(result.current).toBe('idle');
  });
});

describe('useAvatar', () => {
  test('shows initials when no src is provided but name is', () => {
    const { result } = renderHook(() => useAvatar({ name: 'Ada Lovelace' }));
    expect(result.current.showInitials).toBe(true);
    expect(result.current.initials).toBe('AL');
    expect(result.current.showImage).toBe(false);
    expect(result.current.showIconFallback).toBe(false);
  });

  test('shows icon fallback when neither src nor name is provided', () => {
    const { result } = renderHook(() => useAvatar({}));
    expect(result.current.showIconFallback).toBe(true);
    expect(result.current.showInitials).toBe(false);
    expect(result.current.showImage).toBe(false);
  });
});

describe('useAvatarGroup', () => {
  function makeChildren(count: number) {
    return Array.from({ length: count }, (_, i) => createElement('div', { key: i }));
  }

  test('returns all items visible when under max', () => {
    const { result } = renderHook(() => useAvatarGroup({ children: makeChildren(3), max: 5 }));
    expect(result.current.visibleItems).toHaveLength(3);
    expect(result.current.overflowCount).toBe(0);
    expect(result.current.total).toBe(3);
  });

  test('truncates visible items and computes overflow when over max', () => {
    const { result } = renderHook(() => useAvatarGroup({ children: makeChildren(6), max: 3 }));
    expect(result.current.visibleItems).toHaveLength(3);
    expect(result.current.overflowCount).toBe(3);
    expect(result.current.total).toBe(6);
  });

  test('no max shows all items with zero overflow', () => {
    const { result } = renderHook(() => useAvatarGroup({ children: makeChildren(10) }));
    expect(result.current.visibleItems).toHaveLength(10);
    expect(result.current.overflowCount).toBe(0);
  });

  test('max greater than item count produces zero overflow', () => {
    const { result } = renderHook(() => useAvatarGroup({ children: makeChildren(2), max: 5 }));
    expect(result.current.visibleItems).toHaveLength(2);
    expect(result.current.overflowCount).toBe(0);
  });
});
