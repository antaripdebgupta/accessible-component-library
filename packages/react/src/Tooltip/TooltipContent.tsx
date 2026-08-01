import {
  forwardRef,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type HTMLAttributes,
} from 'react';
import { twMerge } from 'tailwind-merge';
import { useTooltipContext } from './Tooltip';

export interface TooltipContentProps extends HTMLAttributes<HTMLDivElement> {}

const OFFSET = 10;
// Must match the CSS transition duration below (duration-fast). If your
// tailwind-preset's `duration-fast` token differs from ~150ms, update both.
const EXIT_DURATION_MS = 150;

const TRANSFORM_ORIGIN: Record<string, string> = {
  top: 'bottom center',
  bottom: 'top center',
  left: 'center right',
  right: 'center left',
};

export const TooltipContent = forwardRef<HTMLDivElement, TooltipContentProps>(
  ({ className, children, ...props }, ref) => {
    const { open, triggerRef, placement, showArrow, getContentProps } = useTooltipContext();
    const [style, setStyle] = useState<CSSProperties>({});
    const [mounted, setMounted] = useState(open);
    const [visible, setVisible] = useState(false);
    const contentRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
      if (open) {
        setMounted(true);
        return;
      }
      setVisible(false);
      const timeout = setTimeout(() => setMounted(false), EXIT_DURATION_MS);
      return () => clearTimeout(timeout);
    }, [open]);

    useEffect(() => {
      if (!mounted || !open) return;
      const raf = requestAnimationFrame(() => setVisible(true));
      return () => cancelAnimationFrame(raf);
    }, [mounted, open]);

    useLayoutEffect(() => {
      if (!mounted) return;
      const trigger = triggerRef.current;
      if (!trigger) return;

      const updatePosition = () => {
        const rect = trigger.getBoundingClientRect();
        let top = 0;
        let left = 0;

        switch (placement) {
          case 'top':
            top = rect.top - OFFSET;
            left = rect.left + rect.width / 2;
            break;
          case 'bottom':
            top = rect.bottom + OFFSET;
            left = rect.left + rect.width / 2;
            break;
          case 'left':
            top = rect.top + rect.height / 2;
            left = rect.left - OFFSET;
            break;
          case 'right':
            top = rect.top + rect.height / 2;
            left = rect.right + OFFSET;
            break;
        }

        setStyle({ position: 'fixed', top, left });
      };

      updatePosition();

      const raf1 = requestAnimationFrame(() => {
        const raf2 = requestAnimationFrame(updatePosition);
        return () => cancelAnimationFrame(raf2);
      });
      const node = contentRef.current;
      node?.addEventListener('transitionend', updatePosition);

      window.addEventListener('scroll', updatePosition, true);
      window.addEventListener('resize', updatePosition);
      return () => {
        cancelAnimationFrame(raf1);
        node?.removeEventListener('transitionend', updatePosition);
        window.removeEventListener('scroll', updatePosition, true);
        window.removeEventListener('resize', updatePosition);
      };
    }, [mounted, placement, triggerRef]);

    if (!mounted) return null;

    const contentProps = getContentProps();

    const translate =
      placement === 'top'
        ? '-translate-x-1/2 -translate-y-full'
        : placement === 'bottom'
          ? '-translate-x-1/2'
          : placement === 'left'
            ? '-translate-x-full -translate-y-1/2'
            : '-translate-y-1/2';

    return (
      <div
        ref={(node) => {
          contentRef.current = node;
          if (typeof ref === 'function') ref(node);
          else if (ref) ref.current = node;
        }}
        {...contentProps}
        data-placement={placement}
        data-state={visible ? 'open' : 'closed'}
        style={{ ...style, transformOrigin: TRANSFORM_ORIGIN[placement] }}
        className={twMerge(
          'rounded-control bg-surface-inverse text-text-inverse pointer-events-auto z-50 max-w-xs px-2.5 py-1.5 text-xs shadow-md',
          'duration-fast ease-out-soft transition-[opacity,transform] motion-reduce:transition-none',
          visible ? 'scale-100 opacity-100' : 'scale-95 opacity-0',
          translate,
          className,
        )}
        {...props}
      >
        {children}
        {showArrow && (
          <span
            aria-hidden="true"
            className={twMerge(
              'bg-surface-inverse absolute h-2 w-2 rotate-45',
              placement === 'top' && '-bottom-1 left-1/2 -translate-x-1/2',
              placement === 'bottom' && '-top-1 left-1/2 -translate-x-1/2',
              placement === 'left' && 'top-1/2 -right-1 -translate-y-1/2',
              placement === 'right' && 'top-1/2 -left-1 -translate-y-1/2',
            )}
          />
        )}
      </div>
    );
  },
);
TooltipContent.displayName = 'TooltipContent';
