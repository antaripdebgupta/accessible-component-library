import { forwardRef, type HTMLAttributes } from 'react';
import { twMerge } from 'tailwind-merge';
import { useCarouselContext, useCarouselConfig } from './Carousel';

export interface CarouselSlideProps extends HTMLAttributes<HTMLDivElement> {
  'data-slide-index'?: number;
}

const SIZE_BASIS: Record<string, string> = {
  sm: '33.333%',
  md: '50%',
  lg: '66.667%',
  full: '100%',
};

export const CarouselSlide = forwardRef<HTMLDivElement, CarouselSlideProps>(
  ({ className, children, 'data-slide-index': slideIndex = 0, ...props }, ref) => {
    const { getSlideProps, orientation } = useCarouselContext();
    const { size, slidesPerView } = useCarouselConfig();
    const slideProps = getSlideProps(slideIndex);

    const basis = slidesPerView > 1 ? `${100 / slidesPerView}%` : SIZE_BASIS[size];

    return (
      <div
        ref={ref}
        {...slideProps}
        className={twMerge('shrink-0 grow-0', className)}
        style={{
          [orientation === 'horizontal' ? 'width' : 'height']: basis,
        }}
        {...props}
      >
        {children}
      </div>
    );
  },
);
CarouselSlide.displayName = 'CarouselSlide';
