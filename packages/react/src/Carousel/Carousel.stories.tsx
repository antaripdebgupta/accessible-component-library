import type { Meta, StoryObj } from '@storybook/react';
import {
  Carousel,
  CarouselViewport,
  CarouselTrack,
  CarouselSlide,
  CarouselPrevButton,
  CarouselNextButton,
  CarouselDots,
  CarouselPlayPauseButton,
} from './index';

const meta: Meta<typeof Carousel> = {
  title: 'Components/Carousel',
  component: Carousel,
  parameters: { layout: 'padded' },
};
export default meta;
type Story = StoryObj<typeof Carousel>;

const COLORS = [
  'bg-accent-subtle',
  'bg-success-subtle',
  'bg-warning-subtle',
  'bg-danger-subtle',
  'bg-surface-raised',
];

function DemoSlide({
  i,
  orientation = 'horizontal',
}: {
  i: number;
  orientation?: 'horizontal' | 'vertical';
}) {
  return (
    <div
      className={`rounded-popover border-border text-text-primary flex items-center justify-center border text-lg font-medium ${COLORS[i % COLORS.length]}`}
      style={{ height: orientation === 'horizontal' ? 240 : 100 }}
    >
      Slide {i + 1}
    </div>
  );
}

export const Default: Story = {
  render: () => (
    <Carousel aria-label="Featured content" className="mx-auto max-w-xl">
      <CarouselViewport>
        <CarouselTrack>
          {Array.from({ length: 5 }, (_, i) => (
            <CarouselSlide key={i}>
              <DemoSlide i={i} />
            </CarouselSlide>
          ))}
        </CarouselTrack>
      </CarouselViewport>
      <div className="mt-4 flex items-center justify-between">
        <CarouselPrevButton />
        <CarouselDots slideCount={5} />
        <CarouselNextButton />
      </div>
    </Carousel>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div className="space-y-8">
      {(['sm', 'md', 'lg', 'full'] as const).map((size) => (
        <div key={size}>
          <p className="text-text-secondary mb-2 text-sm font-medium">size=&quot;{size}&quot;</p>
          <Carousel aria-label={`${size} sized carousel`} size={size} className="max-w-2xl">
            <CarouselViewport>
              <CarouselTrack>
                {Array.from({ length: 5 }, (_, i) => (
                  <CarouselSlide key={i}>
                    <DemoSlide i={i} />
                  </CarouselSlide>
                ))}
              </CarouselTrack>
            </CarouselViewport>
            <div className="mt-4 flex items-center justify-between">
              <CarouselPrevButton />
              <CarouselDots slideCount={5} />
              <CarouselNextButton />
            </div>
          </Carousel>
        </div>
      ))}
    </div>
  ),
};

export const Spacing: Story = {
  render: () => (
    <div className="space-y-8">
      {(['none', 'sm', 'md', 'lg'] as const).map((spacing) => (
        <div key={spacing}>
          <p className="text-text-secondary mb-2 text-sm font-medium">
            spacing=&quot;{spacing}&quot;
          </p>
          <Carousel
            aria-label={`${spacing} spacing carousel`}
            size="md"
            spacing={spacing}
            slidesPerView={2}
            className="max-w-2xl"
          >
            <CarouselViewport>
              <CarouselTrack>
                {Array.from({ length: 5 }, (_, i) => (
                  <CarouselSlide key={i}>
                    <DemoSlide i={i} />
                  </CarouselSlide>
                ))}
              </CarouselTrack>
            </CarouselViewport>
            <div className="mt-4 flex items-center justify-between">
              <CarouselPrevButton />
              <CarouselDots slideCount={5} />
              <CarouselNextButton />
            </div>
          </Carousel>
        </div>
      ))}
    </div>
  ),
};

export const MultipleSlidesPerView: Story = {
  render: () => (
    <Carousel
      aria-label="Product grid carousel"
      slidesPerView={3}
      spacing="md"
      className="mx-auto max-w-3xl"
    >
      <CarouselViewport>
        <CarouselTrack>
          {Array.from({ length: 9 }, (_, i) => (
            <CarouselSlide key={i}>
              <DemoSlide i={i} />
            </CarouselSlide>
          ))}
        </CarouselTrack>
      </CarouselViewport>
      <div className="mt-4 flex items-center justify-between">
        <CarouselPrevButton />
        <CarouselDots slideCount={9} />
        <CarouselNextButton />
      </div>
    </Carousel>
  ),
};

export const VerticalOrientation: Story = {
  render: () => (
    <div className="flex justify-center">
      <Carousel aria-label="Vertical carousel" orientation="vertical" className="max-w-xs">
        <div className="flex items-center gap-4">
          <div className="flex flex-col items-center gap-4"></div>
          <CarouselViewport className="h-72">
            <CarouselTrack>
              {Array.from({ length: 4 }, (_, i) => (
                <CarouselSlide key={i}>
                  <DemoSlide i={i} orientation="vertical" />
                </CarouselSlide>
              ))}
            </CarouselTrack>
          </CarouselViewport>
        </div>
        <div className="mt-3 flex justify-center gap-3">
          <CarouselPrevButton />
          <CarouselNextButton />
        </div>
      </Carousel>
    </div>
  ),
};

export const RTL: Story = {
  render: () => (
    <Carousel aria-label="دائري تجريبي" dir="rtl" className="mx-auto max-w-xl">
      <CarouselViewport>
        <CarouselTrack>
          {Array.from({ length: 5 }, (_, i) => (
            <CarouselSlide key={i}>
              <DemoSlide i={i} />
            </CarouselSlide>
          ))}
        </CarouselTrack>
      </CarouselViewport>
      <div className="mt-4 flex items-center justify-between">
        <CarouselPrevButton />
        <CarouselDots slideCount={5} />
        <CarouselNextButton />
      </div>
    </Carousel>
  ),
};

export const WithAutoplay: Story = {
  render: () => (
    <Carousel
      aria-label="Autoplaying carousel"
      autoplayInterval={3000}
      className="mx-auto max-w-xl"
    >
      <CarouselViewport>
        <CarouselTrack>
          {Array.from({ length: 5 }, (_, i) => (
            <CarouselSlide key={i}>
              <DemoSlide i={i} />
            </CarouselSlide>
          ))}
        </CarouselTrack>
      </CarouselViewport>
      <div className="mt-4 flex items-center justify-between">
        <CarouselPrevButton />
        <div className="flex items-center gap-3">
          <CarouselPlayPauseButton />
          <CarouselDots slideCount={5} />
        </div>
        <CarouselNextButton />
      </div>
    </Carousel>
  ),
};
