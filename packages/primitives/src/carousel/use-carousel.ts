import { useCallback, useEffect, useRef, useState } from 'react';
import { useControllableState, useStableId, useReducedMotion, useDirection } from '@acl/utils';

export type CarouselOrientation = 'horizontal' | 'vertical';

export interface UseCarouselOptions {
  slideCount: number;
  index?: number;
  defaultIndex?: number;
  onIndexChange?: (index: number) => void;
  orientation?: CarouselOrientation;
  loop?: boolean;
  autoplayInterval?: number;
  dir?: 'ltr' | 'rtl';
  id?: string;
}

export function useCarousel({
  slideCount,
  index: controlledIndex,
  defaultIndex = 0,
  onIndexChange,
  orientation = 'horizontal',
  loop = true,
  autoplayInterval = 0,
  dir: dirProp,
  id,
}: UseCarouselOptions) {
  const baseId = useStableId(id ?? 'carousel');
  const detectedDir = useDirection();
  const dir = dirProp ?? detectedDir;
  const prefersReducedMotion = useReducedMotion();

  const [activeIndex, setActiveIndex] = useControllableState<number>({
    value: controlledIndex,
    defaultValue: defaultIndex,
    onChange: onIndexChange,
  });

  const [isPlaying, setIsPlaying] = useState(!!autoplayInterval && !prefersReducedMotion);
  const timerRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined);
  const liveRegionRef = useRef<HTMLDivElement>(null);

  const clampIndex = useCallback(
    (i: number) => {
      if (loop) return (i + slideCount) % slideCount;
      return Math.min(Math.max(i, 0), slideCount - 1);
    },
    [loop, slideCount],
  );

  const goTo = useCallback(
    (i: number) => setActiveIndex(clampIndex(i)),
    [clampIndex, setActiveIndex],
  );

  const next = useCallback(() => goTo(activeIndex + 1), [activeIndex, goTo]);
  const prev = useCallback(() => goTo(activeIndex - 1), [activeIndex, goTo]);

  const play = useCallback(() => {
    if (autoplayInterval && !prefersReducedMotion) setIsPlaying(true);
  }, [autoplayInterval, prefersReducedMotion]);

  const pause = useCallback(() => setIsPlaying(false), []);

  useEffect(() => {
    if (!isPlaying || !autoplayInterval) return;
    timerRef.current = setInterval(() => {
      setActiveIndex(clampIndex(activeIndex + 1));
    }, autoplayInterval);
    return () => clearInterval(timerRef.current);
  }, [isPlaying, autoplayInterval, clampIndex, setActiveIndex, activeIndex]);

  useEffect(() => {
    if (liveRegionRef.current) {
      liveRegionRef.current.textContent = `Slide ${activeIndex + 1} of ${slideCount}`;
    }
  }, [activeIndex, slideCount]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      const isHorizontal = orientation === 'horizontal';
      const nextKey = isHorizontal ? (dir === 'rtl' ? 'ArrowLeft' : 'ArrowRight') : 'ArrowDown';
      const prevKey = isHorizontal ? (dir === 'rtl' ? 'ArrowRight' : 'ArrowLeft') : 'ArrowUp';

      if (e.key === nextKey) {
        e.preventDefault();
        next();
      } else if (e.key === prevKey) {
        e.preventDefault();
        prev();
      } else if (e.key === 'Home') {
        e.preventDefault();
        goTo(0);
      } else if (e.key === 'End') {
        e.preventDefault();
        goTo(slideCount - 1);
      }
    },
    [dir, goTo, next, orientation, prev, slideCount],
  );

  const getRootProps = useCallback(
    () => ({
      role: 'region' as const,
      'aria-roledescription': 'carousel',
    }),
    [],
  );

  const getViewportProps = useCallback(
    () => ({
      onMouseEnter: pause,
      onMouseLeave: play,
      onFocus: pause,
      onBlur: play,
      onKeyDown: handleKeyDown,
    }),
    [handleKeyDown, pause, play],
  );

  const getSlideProps = useCallback(
    (slideIndex: number) => ({
      id: `${baseId}-slide-${slideIndex}`,
      role: 'group' as const,
      'aria-roledescription': 'slide',
      'aria-label': `${slideIndex + 1} of ${slideCount}`,
      'aria-hidden': slideIndex !== activeIndex && !loop ? undefined : undefined, // visibility handled via CSS transform, not aria-hidden, so off-screen slides remain in reading order
    }),
    [activeIndex, baseId, slideCount, loop],
  );

  const getPrevButtonProps = useCallback(
    () => ({
      'aria-label': 'Previous slide',
      onClick: prev,
      disabled: !loop && activeIndex === 0,
    }),
    [activeIndex, loop, prev],
  );

  const getNextButtonProps = useCallback(
    () => ({
      'aria-label': 'Next slide',
      onClick: next,
      disabled: !loop && activeIndex === slideCount - 1,
    }),
    [activeIndex, loop, next, slideCount],
  );

  const getDotProps = useCallback(
    (slideIndex: number) => ({
      'aria-label': `Go to slide ${slideIndex + 1}`,
      'aria-current': slideIndex === activeIndex ? ('true' as const) : undefined,
      onClick: () => goTo(slideIndex),
    }),
    [activeIndex, goTo],
  );

  const getPlayPauseButtonProps = useCallback(
    () => ({
      'aria-label': isPlaying ? 'Pause autoplay' : 'Play autoplay',
      onClick: () => (isPlaying ? pause() : play()),
    }),
    [isPlaying, pause, play],
  );

  return {
    activeIndex,
    slideCount,
    goTo,
    next,
    prev,
    isPlaying,
    play,
    pause,
    orientation,
    dir,
    liveRegionRef,
    getRootProps,
    getViewportProps,
    getSlideProps,
    getPrevButtonProps,
    getNextButtonProps,
    getDotProps,
    getPlayPauseButtonProps,
  };
}

export type UseCarouselReturn = ReturnType<typeof useCarousel>;
