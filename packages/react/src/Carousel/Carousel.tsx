import {
  Children,
  createContext,
  useContext,
  useMemo,
  isValidElement,
  type HTMLAttributes,
  type ReactNode,
} from 'react';
import { twMerge } from 'tailwind-merge';
import { useCarousel, type UseCarouselReturn, type CarouselOrientation } from '@acl/primitives';

const CarouselContext = createContext<UseCarouselReturn | null>(null);
export function useCarouselContext(): UseCarouselReturn {
  const ctx = useContext(CarouselContext);
  if (!ctx) throw new Error('Carousel subcomponents must be used within <Carousel>');
  return ctx;
}

export type CarouselSize = 'sm' | 'md' | 'lg' | 'full';
export type CarouselSpacing = 'none' | 'sm' | 'md' | 'lg';

const CarouselConfigContext = createContext<{
  size: CarouselSize;
  spacing: CarouselSpacing;
  slidesPerView: number;
}>({ size: 'full', spacing: 'md', slidesPerView: 1 });
export function useCarouselConfig() {
  return useContext(CarouselConfigContext);
}

export interface CarouselProps extends HTMLAttributes<HTMLDivElement> {
  'aria-label': string; // a carousel must always have an accessible name
  index?: number;
  defaultIndex?: number;
  onIndexChange?: (index: number) => void;
  orientation?: CarouselOrientation;
  loop?: boolean;
  /** ms between auto-advances. Omit to disable autoplay. Ignored under prefers-reduced-motion. */
  autoplayInterval?: number;
  dir?: 'ltr' | 'rtl';
  /** How wide each slide renders relative to the viewport. Default "full" (one slide at a time). */
  size?: CarouselSize;
  /** Gap between slides. Default "md". */
  spacing?: CarouselSpacing;
  /** How many slides are visible at once. Default 1. */
  slidesPerView?: number;
  id?: string;
  children: ReactNode;
}

const SIZE_CLASS: Record<CarouselSize, string> = {
  sm: 'basis-1/3',
  md: 'basis-1/2',
  lg: 'basis-2/3',
  full: 'basis-full',
};

const SPACING_CLASS: Record<CarouselSpacing, string> = {
  none: 'gap-0',
  sm: 'gap-2',
  md: 'gap-4',
  lg: 'gap-6',
};

function countSlides(children: ReactNode): number {
  let count = 0;
  Children.forEach(children, (child) => {
    if (isValidElement(child)) {
      if ((child.type as any)?.displayName === 'CarouselSlide') {
        count++;
      } else {
        const props = child.props as any;
        if (props && props.children) {
          count += countSlides(props.children);
        }
      }
    }
  });
  return count;
}

export function Carousel({
  index,
  defaultIndex,
  onIndexChange,
  orientation = 'horizontal',
  loop = true,
  autoplayInterval,
  dir: dirProp,
  size = 'full',
  spacing = 'md',
  slidesPerView = 1,
  id,
  className,
  children,
  ...props
}: CarouselProps) {
  const slideCount = countSlides(children) || 1;
  const carousel = useCarousel({
    slideCount,
    index,
    defaultIndex,
    onIndexChange,
    orientation,
    loop,
    autoplayInterval,
    dir: dirProp,
    id,
  });
  const contextValue = useMemo(() => carousel, [carousel]);
  const configValue = useMemo(
    () => ({ size, spacing, slidesPerView }),
    [size, spacing, slidesPerView],
  );

  return (
    <CarouselContext.Provider value={contextValue}>
      <CarouselConfigContext.Provider value={configValue}>
        <div
          {...carousel.getRootProps()}
          dir={carousel.dir}
          className={twMerge('relative w-full', className)}
          {...props}
        >
          {children}
          {/* Visually hidden live region announcing "Slide N of M" on change */}
          <div ref={carousel.liveRegionRef} aria-live="polite" className="sr-only" />
        </div>
      </CarouselConfigContext.Provider>
    </CarouselContext.Provider>
  );
}
Carousel.displayName = 'Carousel';
