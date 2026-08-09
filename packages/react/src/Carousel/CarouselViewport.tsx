import { forwardRef, type HTMLAttributes } from 'react';
import { twMerge } from 'tailwind-merge';
import { useCarouselContext } from './Carousel';

export interface CarouselViewportProps extends HTMLAttributes<HTMLDivElement> {}

export const CarouselViewport = forwardRef<HTMLDivElement, CarouselViewportProps>(
  ({ className, children, ...props }, ref) => {
    const { getViewportProps, orientation } = useCarouselContext();

    return (
      <div
        ref={ref}
        tabIndex={0}
        aria-label="Slides"
        {...getViewportProps()}
        className={twMerge(
          'rounded-popover focus-ring-safe overflow-hidden outline-none',
          orientation === 'vertical' && 'h-full',
          className,
        )}
        {...props}
      >
        {children}
      </div>
    );
  },
);
CarouselViewport.displayName = 'CarouselViewport';
