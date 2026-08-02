import {
  forwardRef,
  useEffect,
  useLayoutEffect,
  useState,
  type CSSProperties,
  type HTMLAttributes,
} from 'react';
import { twMerge } from 'tailwind-merge';
import { useDropdownMenuContext } from './DropdownMenu';

export interface DropdownMenuContentProps extends HTMLAttributes<HTMLDivElement> {
  align?: 'start' | 'end';
  sideOffset?: number;
}

const EXIT_DURATION_MS = 100;

export const DropdownMenuContent = forwardRef<HTMLDivElement, DropdownMenuContentProps>(
  ({ align = 'start', sideOffset = 6, className, children, ...props }, ref) => {
    const { open, triggerRef, contentRef, getContentProps, focusFirst } = useDropdownMenuContext();
    const [style, setStyle] = useState<CSSProperties>({});
    const [mounted, setMounted] = useState(open);
    const [visible, setVisible] = useState(false);

    useEffect(() => {
      if (mounted) focusFirst();
    }, [mounted, focusFirst]);

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
        const top = rect.bottom + sideOffset;
        const left = align === 'end' ? rect.right : rect.left;
        setStyle({
          position: 'fixed',
          top,
          left,
          transform: align === 'end' ? 'translateX(-100%)' : undefined,
        });
      };

      updatePosition();
      const raf = requestAnimationFrame(updatePosition);

      window.addEventListener('scroll', updatePosition, true);
      window.addEventListener('resize', updatePosition);
      return () => {
        cancelAnimationFrame(raf);
        window.removeEventListener('scroll', updatePosition, true);
        window.removeEventListener('resize', updatePosition);
      };
    }, [align, mounted, sideOffset, triggerRef]);

    if (!mounted) return null;

    const contentProps = getContentProps();

    return (
      <div
        ref={(node) => {
          contentRef.current = node;
          if (typeof ref === 'function') ref(node);
          else if (ref) ref.current = node;
        }}
        {...contentProps}
        data-state={visible ? 'open' : 'closed'}
        style={{ ...style, transformOrigin: align === 'end' ? 'top right' : 'top left' }}
        className={twMerge(
          'rounded-popover border-border bg-surface z-50 min-w-[10rem] overflow-hidden border p-1 shadow-md',
          'focus:outline-none',
          'duration-fast ease-out-soft transition-[opacity,transform] motion-reduce:transition-none',
          visible ? 'scale-100 opacity-100' : 'scale-95 opacity-0',
          className,
        )}
        {...props}
      >
        {children}
      </div>
    );
  },
);
DropdownMenuContent.displayName = 'DropdownMenuContent';
