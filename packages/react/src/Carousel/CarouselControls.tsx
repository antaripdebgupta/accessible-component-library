import { ChevronLeft, ChevronRight, ChevronUp, ChevronDown, Play, Pause } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import { useCarouselContext } from './Carousel';

export function CarouselPrevButton({ className }: { className?: string }) {
  const { getPrevButtonProps, orientation } = useCarouselContext();
  const Icon = orientation === 'horizontal' ? ChevronLeft : ChevronUp;
  return (
    <button
      type="button"
      {...getPrevButtonProps()}
      className={twMerge(
        'shadow-xs flex h-ctl-md w-ctl-md items-center justify-center rounded-full border border-border-strong bg-surface text-text-primary',
        'outline-none transition-colors duration-fast focus-ring-safe hover:bg-surface-raised motion-reduce:transition-none',
        'disabled:pointer-events-none disabled:opacity-40',
        className,
      )}
    >
      <Icon aria-hidden="true" size={18} />
    </button>
  );
}

export function CarouselNextButton({ className }: { className?: string }) {
  const { getNextButtonProps, orientation } = useCarouselContext();
  const Icon = orientation === 'horizontal' ? ChevronRight : ChevronDown;
  return (
    <button
      type="button"
      {...getNextButtonProps()}
      className={twMerge(
        'shadow-xs flex h-ctl-md w-ctl-md items-center justify-center rounded-full border border-border-strong bg-surface text-text-primary',
        'outline-none transition-colors duration-fast focus-ring-safe hover:bg-surface-raised motion-reduce:transition-none',
        'disabled:pointer-events-none disabled:opacity-40',
        className,
      )}
    >
      <Icon aria-hidden="true" size={18} />
    </button>
  );
}

export function CarouselDots({
  slideCount,
  className,
}: {
  slideCount: number;
  className?: string;
}) {
  const { getDotProps, activeIndex } = useCarouselContext();
  return (
    <div
      className={twMerge('flex items-center justify-center gap-1', className)}
      role="tablist"
      aria-label="Slide navigation"
    >
      {Array.from({ length: slideCount }, (_, i) => (
        <button
          key={i}
          type="button"
          {...getDotProps(i)}
          className="flex h-6 w-6 items-center justify-center rounded-full outline-none focus-ring-safe"
        >
          <span
            className={twMerge(
              'block h-2 rounded-full transition-all duration-fast motion-reduce:transition-none',
              i === activeIndex
                ? 'w-5 bg-accent-default'
                : 'w-2 bg-border-control hover:bg-text-secondary',
            )}
          />
        </button>
      ))}
    </div>
  );
}

/**
 * Required whenever autoplay is enabled — WCAG 2.2.2 (Pause, Stop, Hide)
 * mandates a visible mechanism to stop auto-advancing content.
 */
export function CarouselPlayPauseButton({ className }: { className?: string }) {
  const { getPlayPauseButtonProps, isPlaying } = useCarouselContext();
  return (
    <button
      type="button"
      {...getPlayPauseButtonProps()}
      className={twMerge(
        'shadow-xs flex h-ctl-md w-ctl-md items-center justify-center rounded-full border border-border-strong bg-surface text-text-primary',
        'outline-none transition-colors duration-fast focus-ring-safe hover:bg-surface-raised motion-reduce:transition-none',
        className,
      )}
    >
      {isPlaying ? <Pause aria-hidden="true" size={16} /> : <Play aria-hidden="true" size={16} />}
    </button>
  );
}
