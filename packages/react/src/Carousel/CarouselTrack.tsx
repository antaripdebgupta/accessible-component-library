import {
  forwardRef,
  Children,
  cloneElement,
  isValidElement,
  useRef,
  useEffect,
  useState,
  type HTMLAttributes,
} from 'react';
import { twMerge } from 'tailwind-merge';
import { useCarouselContext, useCarouselConfig } from './Carousel';

export interface CarouselTrackProps extends HTMLAttributes<HTMLDivElement> {}

const SPACING_PX: Record<string, number> = { none: 0, sm: 8, md: 16, lg: 24 };
const SIZE_PERCENT: Record<string, number> = { sm: 33.333, md: 50, lg: 66.667, full: 100 };

export const CarouselTrack = forwardRef<HTMLDivElement, CarouselTrackProps>(
  ({ className, children, ...props }, ref) => {
    const { activeIndex, orientation, dir } = useCarouselContext();
    const { size, spacing, slidesPerView } = useCarouselConfig();
    const innerRef = useRef<HTMLDivElement>(null);
    const [slideHeightPx, setSlideHeightPx] = useState(0);

    const isHorizontal = orientation === 'horizontal';
    const gap = SPACING_PX[spacing] ?? 16;

    // For vertical: measure the first slide's rendered height so the translate
    // is always pixel-accurate regardless of the viewport height.
    useEffect(() => {
      if (isHorizontal) return;
      const track = (ref as React.RefObject<HTMLDivElement>)?.current ?? innerRef.current;
      if (!track) return;
      const firstSlide = track.children[0] as HTMLElement | undefined;
      if (!firstSlide) return;
      const measure = () => setSlideHeightPx(firstSlide.offsetHeight);
      measure();
      const ro = new ResizeObserver(measure);
      ro.observe(firstSlide);
      return () => ro.disconnect();
    }, [isHorizontal, ref]);

    let transform: string;
    if (isHorizontal) {
      const sign = dir === 'rtl' ? 1 : -1;
      const step = slidesPerView > 1 ? 100 / slidesPerView : (SIZE_PERCENT[size] ?? 100);
      transform = `translateX(${sign * activeIndex * step}%)`;
    } else {
      // Use px so the offset is independent of the track's own height.
      const stepPx = slideHeightPx + gap;
      transform = `translateY(${-activeIndex * stepPx}px)`;
    }

    return (
      <div
        ref={(node) => {
          innerRef.current = node;
          if (typeof ref === 'function') ref(node);
          else if (ref) (ref as React.MutableRefObject<HTMLDivElement | null>).current = node;
        }}
        className={twMerge(
          'duration-slow ease-out-soft flex transition-transform motion-reduce:transition-none',
          isHorizontal ? 'flex-row' : 'flex-col',
          className,
        )}
        style={{ transform, gap: `${gap}px` }}
        {...props}
      >
        {Children.map(children, (child, i) =>
          isValidElement(child) ? cloneElement(child as any, { 'data-slide-index': i }) : child,
        )}
      </div>
    );
  },
);
CarouselTrack.displayName = 'CarouselTrack';
