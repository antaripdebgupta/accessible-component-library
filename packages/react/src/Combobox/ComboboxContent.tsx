import {
  forwardRef,
  useEffect,
  useLayoutEffect,
  useState,
  type CSSProperties,
  type HTMLAttributes,
} from 'react';
import { createPortal } from 'react-dom';
import { twMerge } from 'tailwind-merge';
import { useComboboxContext } from './Combobox';

export interface ComboboxContentProps extends HTMLAttributes<HTMLDivElement> {}

const EXIT_DURATION_MS = 100;

export const ComboboxContent = forwardRef<HTMLDivElement, ComboboxContentProps>(
  ({ className, children, ...props }, ref) => {
    const { open, inputRef, contentRef, getListboxProps } = useComboboxContext();
    const [style, setStyle] = useState<CSSProperties>({});
    const [mounted, setMounted] = useState(open);
    const [visible, setVisible] = useState(false);

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
      if (!mounted) return;
      const input = inputRef.current;
      if (!input) return;

      const updatePosition = () => {
        const rect = input.getBoundingClientRect();
        setStyle({ position: 'fixed', top: rect.bottom + 12, left: rect.left, width: rect.width });
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

    return createPortal(
      <div
        ref={(node) => {
          contentRef.current = node;
          if (typeof ref === 'function') ref(node);
          else if (ref) ref.current = node;
        }}
        {...listboxProps}
        data-state={visible ? 'open' : 'closed'}
        style={{ ...style, transformOrigin: 'top' }}
        className={twMerge(
          'rounded-popover border-border bg-surface z-50 max-h-72 overflow-y-auto border p-1 shadow-md',
          'duration-fast ease-out-soft transition-[opacity,transform] motion-reduce:transition-none',
          visible ? 'scale-100 opacity-100' : 'scale-95 opacity-0',
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
