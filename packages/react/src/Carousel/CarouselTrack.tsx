import { forwardRef, Children, cloneElement, isValidElement, type HTMLAttributes } from 'react';
import { twMerge } from 'tailwind-merge';
import { useCarouselContext, useCarouselConfig } from './Carousel';

export interface CarouselTrackProps extends HTMLAttributes<HTMLDivElement> {}

const SPACING_PX: Record<string, number> = { none: 0, sm: 8, md: 16, lg: 24 };

export const CarouselTrack = forwardRef<HTMLDivElement, CarouselTrackProps>(
  ({ className, children, ...props }, ref) => {
    const { activeIndex, orientation, dir } = useCarouselContext();
    const { size, spacing, slidesPerView } = useCarouselConfig();

    const isHorizontal = orientation === 'horizontal';
    const gap = SPACING_PX[spacing];
    const sign = isHorizontal && dir === 'rtl' ? 1 : -1;
    const step = 100 / slidesPerView;
    const translate = `${sign * activeIndex * step}%`;

    return (
      <div
        ref={ref}
        className={twMerge(
          'duration-slow ease-out-soft flex transition-transform motion-reduce:transition-none',
          isHorizontal ? 'flex-row' : 'flex-col',
          className,
        )}
        style={{
          transform: isHorizontal ? `translateX(${translate})` : `translateY(${translate})`,
          gap: `${gap}px`,
        }}
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
