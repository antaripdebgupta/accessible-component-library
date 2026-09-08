import { renderHook, act } from '@testing-library/react';
import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { useCarousel } from './use-carousel';

beforeEach(() => {
  vi.useFakeTimers();
});
afterEach(() => {
  vi.useRealTimers();
});

describe('useCarousel — navigation', () => {
  test('next/prev move the active index, wrapping by default (loop=true)', () => {
    const { result } = renderHook(() => useCarousel({ slideCount: 3 }));
    expect(result.current.activeIndex).toBe(0);
    act(() => result.current.next());
    expect(result.current.activeIndex).toBe(1);
    act(() => result.current.next());
    act(() => result.current.next());
    expect(result.current.activeIndex).toBe(0); // wrapped
  });

  test('prev wraps backward past index 0 when loop=true', () => {
    const { result } = renderHook(() => useCarousel({ slideCount: 3 }));
    act(() => result.current.prev());
    expect(result.current.activeIndex).toBe(2);
  });

  test('loop=false clamps at boundaries instead of wrapping', () => {
    const { result } = renderHook(() => useCarousel({ slideCount: 3, loop: false }));
    act(() => result.current.prev());
    expect(result.current.activeIndex).toBe(0); // clamped, not wrapped

    act(() => result.current.goTo(2));
    act(() => result.current.next());
    expect(result.current.activeIndex).toBe(2); // clamped at last
  });

  test('goTo jumps directly to a given index', () => {
    const { result } = renderHook(() => useCarousel({ slideCount: 5 }));
    act(() => result.current.goTo(3));
    expect(result.current.activeIndex).toBe(3);
  });

  test('goTo clamps/wraps out-of-range indices via loop rule', () => {
    const { result } = renderHook(() => useCarousel({ slideCount: 3, loop: true }));
    act(() => result.current.goTo(5)); // 5 % 3 === 2
    expect(result.current.activeIndex).toBe(2);
  });
});

describe('useCarousel — controlled/uncontrolled', () => {
  test('uncontrolled: internal state drives activeIndex', () => {
    const { result } = renderHook(() => useCarousel({ slideCount: 3, defaultIndex: 1 }));
    expect(result.current.activeIndex).toBe(1);
    act(() => result.current.next());
    expect(result.current.activeIndex).toBe(2);
  });

  test('controlled: external index prop drives activeIndex, onIndexChange fires on navigation', () => {
    const onIndexChange = vi.fn();
    const { result } = renderHook(() => useCarousel({ slideCount: 3, index: 1, onIndexChange }));
    expect(result.current.activeIndex).toBe(1);
    act(() => result.current.next());
    expect(onIndexChange).toHaveBeenCalledWith(2);
    // still controlled — external index prop unchanged, so activeIndex stays at 1
    expect(result.current.activeIndex).toBe(1);
  });
});

describe('useCarousel — autoplay', () => {
  test('autoplayInterval advances the slide automatically', () => {
    const { result } = renderHook(() => useCarousel({ slideCount: 3, autoplayInterval: 2000 }));
    expect(result.current.activeIndex).toBe(0);
    act(() => vi.advanceTimersByTime(2000));
    expect(result.current.activeIndex).toBe(1);
    act(() => vi.advanceTimersByTime(2000));
    expect(result.current.activeIndex).toBe(2);
  });

  test('pause() stops autoplay from advancing', () => {
    const { result } = renderHook(() => useCarousel({ slideCount: 3, autoplayInterval: 2000 }));
    act(() => result.current.pause());
    act(() => vi.advanceTimersByTime(6000));
    expect(result.current.activeIndex).toBe(0); // never advanced
  });

  test('play() resumes autoplay after a pause', () => {
    const { result } = renderHook(() => useCarousel({ slideCount: 3, autoplayInterval: 2000 }));
    act(() => result.current.pause());
    act(() => result.current.play());
    act(() => vi.advanceTimersByTime(2000));
    expect(result.current.activeIndex).toBe(1);
  });

  test('isPlaying reflects autoplay state', () => {
    const { result } = renderHook(() => useCarousel({ slideCount: 3, autoplayInterval: 2000 }));
    expect(result.current.isPlaying).toBe(true);
    act(() => result.current.pause());
    expect(result.current.isPlaying).toBe(false);
  });

  test('no autoplayInterval means isPlaying is false and no timer runs', () => {
    const { result } = renderHook(() => useCarousel({ slideCount: 3 }));
    expect(result.current.isPlaying).toBe(false);
    act(() => vi.advanceTimersByTime(10000));
    expect(result.current.activeIndex).toBe(0);
  });
});

describe('useCarousel — reduced motion disables autoplay', () => {
  test('autoplay never starts when prefers-reduced-motion is set', () => {
    const originalMatchMedia = window.matchMedia;
    window.matchMedia = ((query: string) => ({
      matches: query.includes('prefers-reduced-motion'),
      media: query,
      addEventListener: () => {},
      removeEventListener: () => {},
    })) as any;

    const { result } = renderHook(() => useCarousel({ slideCount: 3, autoplayInterval: 2000 }));
    expect(result.current.isPlaying).toBe(false);
    act(() => vi.advanceTimersByTime(6000));
    expect(result.current.activeIndex).toBe(0);

    window.matchMedia = originalMatchMedia;
  });

  test('play() remains a no-op under reduced motion even if called explicitly', () => {
    const originalMatchMedia = window.matchMedia;
    window.matchMedia = ((query: string) => ({
      matches: query.includes('prefers-reduced-motion'),
      media: query,
      addEventListener: () => {},
      removeEventListener: () => {},
    })) as any;

    const { result } = renderHook(() => useCarousel({ slideCount: 3, autoplayInterval: 2000 }));
    act(() => result.current.play());
    expect(result.current.isPlaying).toBe(false);

    window.matchMedia = originalMatchMedia;
  });
});

describe('useCarousel — keyboard handling', () => {
  function key(k: string) {
    return { key: k, preventDefault: () => {} } as any;
  }

  test('ArrowRight moves to next slide (horizontal, LTR)', () => {
    const { result } = renderHook(() => useCarousel({ slideCount: 3 }));
    act(() => result.current.getViewportProps().onKeyDown(key('ArrowRight')));
    expect(result.current.activeIndex).toBe(1);
  });

  test('ArrowLeft moves to previous slide (horizontal, LTR)', () => {
    const { result } = renderHook(() => useCarousel({ slideCount: 3, defaultIndex: 1 }));
    act(() => result.current.getViewportProps().onKeyDown(key('ArrowLeft')));
    expect(result.current.activeIndex).toBe(0);
  });

  test('ArrowLeft/ArrowRight are mirrored under dir=rtl', () => {
    const { result } = renderHook(() => useCarousel({ slideCount: 3, dir: 'rtl' }));
    act(() => result.current.getViewportProps().onKeyDown(key('ArrowLeft')));
    expect(result.current.activeIndex).toBe(1); // mirrored: Left advances under RTL
  });

  test('ArrowDown/ArrowUp control vertical orientation', () => {
    const { result } = renderHook(() => useCarousel({ slideCount: 3, orientation: 'vertical' }));
    act(() => result.current.getViewportProps().onKeyDown(key('ArrowDown')));
    expect(result.current.activeIndex).toBe(1);
    act(() => result.current.getViewportProps().onKeyDown(key('ArrowUp')));
    expect(result.current.activeIndex).toBe(0);
  });

  test('Home/End jump to first/last slide', () => {
    const { result } = renderHook(() => useCarousel({ slideCount: 5, defaultIndex: 2 }));
    act(() => result.current.getViewportProps().onKeyDown(key('End')));
    expect(result.current.activeIndex).toBe(4);
    act(() => result.current.getViewportProps().onKeyDown(key('Home')));
    expect(result.current.activeIndex).toBe(0);
  });

  test('onKeyDown pauses autoplay via onFocus/onBlur handlers on the viewport', () => {
    const { result } = renderHook(() => useCarousel({ slideCount: 3, autoplayInterval: 2000 }));
    const viewportProps = result.current.getViewportProps();
    act(() => viewportProps.onFocus());
    act(() => vi.advanceTimersByTime(6000));
    expect(result.current.activeIndex).toBe(0); // paused via focus
    act(() => viewportProps.onBlur());
    act(() => vi.advanceTimersByTime(2000));
    expect(result.current.activeIndex).toBe(1); // resumed via blur
  });
});

describe('useCarousel — control props', () => {
  test('prev/next buttons are disabled at boundaries only when loop=false', () => {
    const { result } = renderHook(() => useCarousel({ slideCount: 3, loop: false }));
    expect(result.current.getPrevButtonProps().disabled).toBe(true);
    expect(result.current.getNextButtonProps().disabled).toBe(false);

    act(() => result.current.goTo(2));
    expect(result.current.getNextButtonProps().disabled).toBe(true);
  });

  test('prev/next buttons are never disabled when loop=true', () => {
    const { result } = renderHook(() => useCarousel({ slideCount: 3, loop: true }));
    expect(result.current.getPrevButtonProps().disabled).toBe(false);
    act(() => result.current.goTo(2));
    expect(result.current.getNextButtonProps().disabled).toBe(false);
  });

  test('dot props expose aria-current only for the active slide', () => {
    const { result } = renderHook(() => useCarousel({ slideCount: 3, defaultIndex: 1 }));
    expect(result.current.getDotProps(0)['aria-current']).toBeUndefined();
    expect(result.current.getDotProps(1)['aria-current']).toBe('true');
  });

  test('dot onClick navigates to that slide', () => {
    const { result } = renderHook(() => useCarousel({ slideCount: 3 }));
    act(() => result.current.getDotProps(2).onClick());
    expect(result.current.activeIndex).toBe(2);
  });

  test('play/pause button label reflects current isPlaying state', () => {
    const { result } = renderHook(() => useCarousel({ slideCount: 3, autoplayInterval: 2000 }));
    expect(result.current.getPlayPauseButtonProps()['aria-label']).toBe('Pause autoplay');
    act(() => result.current.pause());
    expect(result.current.getPlayPauseButtonProps()['aria-label']).toBe('Play autoplay');
  });
});

describe('useCarousel — live region announcement', () => {
  test('liveRegionRef updates its text content on slide change', () => {
    const { result } = renderHook(() => useCarousel({ slideCount: 3 }));
    const div = document.createElement('div');
    result.current.liveRegionRef.current = div;

    act(() => result.current.next());
    expect(div.textContent).toBe('Slide 2 of 3');
  });
});
