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
import { useDropdownMenuContext } from './DropdownMenu';

export interface DropdownMenuContentProps extends HTMLAttributes<HTMLDivElement> {
  align?: 'start' | 'end';
  sideOffset?: number;
}

const EXIT_DURATION_MS = 160;

export const DropdownMenuContent = forwardRef<HTMLDivElement, DropdownMenuContentProps>(
  ({ align = 'start', sideOffset = 4, className, children, ...props }, ref) => {
    const { open, triggerRef, contentRef, getContentProps, focusFirst } = useDropdownMenuContext();
    const [style, setStyle] = useState<CSSProperties>({ position: 'fixed', visibility: 'hidden' });
    const [mounted, setMounted] = useState(false);
    const [visible, setVisible] = useState(false);
    const hasFocusedRef = useRef(false);

    useEffect(() => {
      if (open && mounted && !hasFocusedRef.current) {
        hasFocusedRef.current = true;
        const timer = setTimeout(() => focusFirst(), 0);
        return () => clearTimeout(timer);
      }
      if (!mounted) {
        hasFocusedRef.current = false;
      }
    }, [open, mounted, focusFirst]);

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

      window.addEventListener('scroll', updatePosition, true);
      window.addEventListener('resize', updatePosition);
      return () => {
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
          'popover-surface z-50 min-w-[10rem] overflow-hidden p-1',
          'focus:outline-none',
          'transition-[opacity,scale,translate] motion-reduce:transition-none',
          'data-[state=open]:duration-base data-[state=open]:ease-out-soft',
          'data-[state=closed]:duration-fast data-[state=closed]:ease-in-quick',
          'data-[state=closed]:pointer-events-none',
          'data-[state=open]:motion-safe:animate-drop-in',
          visible ? 'scale-100 opacity-100' : 'scale-y-[0.9] opacity-0',
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
