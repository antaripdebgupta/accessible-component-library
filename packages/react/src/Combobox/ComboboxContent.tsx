import {
  forwardRef,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type HTMLAttributes,
} from 'react';
import { createPortal } from 'react-dom';
import { twMerge } from 'tailwind-merge';
import { useComboboxContext } from './Combobox';

export interface ComboboxContentProps extends HTMLAttributes<HTMLDivElement> {}

const EXIT_DURATION_MS = 160;

export const ComboboxContent = forwardRef<HTMLDivElement, ComboboxContentProps>(
  ({ className, children, ...props }, ref) => {
    const { open, inputRef, contentRef, getListboxProps } = useComboboxContext();
    const [style, setStyle] = useState<CSSProperties>({});
    const [mounted, setMounted] = useState(open);
    const [visible, setVisible] = useState(false);
    const lastHeight = useRef(0);

    if (open && !mounted) {
      setMounted(true);
    }

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
      if (open && contentRef.current) lastHeight.current = contentRef.current.offsetHeight;
    });

    useLayoutEffect(() => {
      if (!mounted) return;
      const input = inputRef.current;
      if (!input) return;

      const updatePosition = () => {
        const anchor = (input.closest('[data-combobox-anchor]') as HTMLElement | null) ?? input;
        const rect = anchor.getBoundingClientRect();
        const viewportWidth = document.documentElement.clientWidth;
        const margin = 8;

        let left = rect.left;
        let width = rect.width;

        const maxLeft = viewportWidth - width - margin;
        if (left > maxLeft) {
          left = Math.max(margin, maxLeft);
        }

        const maxWidth = viewportWidth - margin * 2;
        if (width > maxWidth) {
          width = maxWidth;
        }

        setStyle({ position: 'fixed', top: rect.bottom + 6, left, width });
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
    }, [mounted, inputRef]);

    if (!mounted) return null;

    const listboxProps = getListboxProps();
    const exiting = mounted && !open;

    return createPortal(
      <div
        ref={(node) => {
          contentRef.current = node;
          if (typeof ref === 'function') ref(node);
          else if (ref) ref.current = node;
        }}
        {...listboxProps}
        data-state={visible ? 'open' : 'closed'}
        style={{
          ...style,
          transformOrigin: 'top',
          ...(exiting && lastHeight.current ? { minHeight: lastHeight.current } : null),
        }}
        className={twMerge(
          'popover-surface z-50 max-h-72 overflow-y-auto p-1',
          'transition-[opacity,scale,translate] motion-reduce:transition-none',
          'data-[state=open]:duration-base data-[state=open]:ease-out-soft',
          'data-[state=closed]:duration-fast data-[state=closed]:ease-in-quick',
          'data-[state=closed]:pointer-events-none',
          'data-[state=open]:motion-safe:animate-drop-in',
          visible ? 'scale-100 opacity-100' : 'scale-y-[0.9] opacity-0',
          className,
        )}
        onMouseDown={(e) => e.preventDefault()}
        {...props}
      >
        {children}
      </div>,
      document.body,
    );
  },
);
ComboboxContent.displayName = 'ComboboxContent';
