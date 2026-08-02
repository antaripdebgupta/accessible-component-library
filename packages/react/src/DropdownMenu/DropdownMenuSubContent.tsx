import {
  forwardRef,
  useEffect,
  useLayoutEffect,
  useState,
  type CSSProperties,
  type HTMLAttributes,
  type KeyboardEvent,
} from 'react';
import { createPortal } from 'react-dom';
import { twMerge } from 'tailwind-merge';
import { useDropdownMenuSubContext } from './DropdownMenuSub';
import { DropdownMenuContext } from './DropdownMenu';

export interface DropdownMenuSubContentProps extends HTMLAttributes<HTMLDivElement> {}

export const DropdownMenuSubContent = forwardRef<HTMLDivElement, DropdownMenuSubContentProps>(
  ({ className, children, ...props }, ref) => {
    const subContext = useDropdownMenuSubContext();
    const { open, triggerRef, contentRef, getContentProps, close, focusFirst } = subContext;
    const [style, setStyle] = useState<CSSProperties>({});
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
      setMounted(true);
    }, []);

    useEffect(() => {
      if (open) focusFirst();
    }, [open, focusFirst]);

    useLayoutEffect(() => {
      if (!open) return;
      const trigger = triggerRef.current;
      if (!trigger) return;

      const updatePosition = () => {
        const rect = trigger.getBoundingClientRect();
        setStyle({ position: 'fixed', top: rect.top, left: rect.right + 2 });
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
    }, [open, triggerRef]);

    if (!open || !mounted) return null;

    const contentProps = getContentProps();

    const content = (
      <DropdownMenuContext.Provider value={subContext as any}>
        <div
          ref={(node) => {
            contentRef.current = node;
            if (typeof ref === 'function') ref(node);
            else if (ref) ref.current = node;
          }}
          {...contentProps}
          style={style}
          className={twMerge(
            'rounded-popover border-border bg-surface z-50 min-w-[10rem] overflow-hidden border p-1 shadow-md',
            'focus:outline-none',
            className,
          )}
          onKeyDown={(e: KeyboardEvent) => {
            e.stopPropagation();
            contentProps.onKeyDown(e);
            if (e.key === 'ArrowLeft') {
              e.preventDefault();
              close();
            }
          }}
          {...props}
        >
          {children}
        </div>
      </DropdownMenuContext.Provider>
    );

    return createPortal(content, document.body);
  },
);
DropdownMenuSubContent.displayName = 'DropdownMenuSubContent';
