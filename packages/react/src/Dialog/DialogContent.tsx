import {
  forwardRef,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type HTMLAttributes,
  type KeyboardEvent,
} from 'react';
import { createPortal } from 'react-dom';
import { twMerge } from 'tailwind-merge';
import { useDialogContext } from './Dialog';
import { DialogOverlay } from './DialogOverlay';

export interface DialogContentProps extends HTMLAttributes<HTMLDivElement> {
  /** Max width — matches this library's small/medium/large content sizes. Default "md". */
  size?: 'sm' | 'md' | 'lg' | 'xl';
  /** Shows the top-right "X" close button. Default true. */
  showCloseButton?: boolean;
}

const EXIT_DURATION_MS = 150;

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

function isVisible(el: HTMLElement): boolean {
  if (el.hidden) return false;
  const style = window.getComputedStyle(el);
  return style.display !== 'none' && style.visibility !== 'hidden';
}

const sizeClasses: Record<NonNullable<DialogContentProps['size']>, string> = {
  sm: 'sm:max-w-sm',
  md: 'sm:max-w-lg',
  lg: 'sm:max-w-2xl',
  xl: 'sm:max-w-4xl',
};

let scrollLockCount = 0;
let savedBodyOverflow = '';
let savedBodyPaddingRight = '';

function lockBodyScroll() {
  if (scrollLockCount === 0) {
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    savedBodyOverflow = document.body.style.overflow;
    savedBodyPaddingRight = document.body.style.paddingRight;
    document.body.style.overflow = 'hidden';
    if (scrollbarWidth > 0) {
      const currentPaddingRight = parseFloat(getComputedStyle(document.body).paddingRight) || 0;
      document.body.style.paddingRight = `${currentPaddingRight + scrollbarWidth}px`;
    }
  }
  scrollLockCount++;
}

function unlockBodyScroll() {
  scrollLockCount = Math.max(0, scrollLockCount - 1);
  if (scrollLockCount === 0) {
    document.body.style.overflow = savedBodyOverflow;
    document.body.style.paddingRight = savedBodyPaddingRight;
  }
}

const inertLockCounts = new WeakMap<Element, number>();

function lockBackgroundInert(excludeEl: Element) {
  const siblings = Array.from(document.body.children).filter(
    (el) => el !== excludeEl && !el.contains(excludeEl) && !excludeEl.contains(el),
  );
  for (const el of siblings) {
    const count = inertLockCounts.get(el) ?? 0;
    if (count === 0) el.setAttribute('inert', '');
    inertLockCounts.set(el, count + 1);
  }
  return () => {
    for (const el of siblings) {
      const count = inertLockCounts.get(el) ?? 0;
      const next = Math.max(0, count - 1);
      inertLockCounts.set(el, next);
      if (next === 0) el.removeAttribute('inert');
    }
  };
}

export const DialogContent = forwardRef<HTMLDivElement, DialogContentProps>(
  ({ size = 'md', showCloseButton = true, className, children, ...props }, ref) => {
    const { open, getContentProps, getCloseButtonProps, getOverlayProps } = useDialogContext();
    const [mounted, setMounted] = useState(open);
    const [visible, setVisible] = useState(false);
    const panelRef = useRef<HTMLDivElement>(null);
    const previouslyFocused = useRef<HTMLElement | null>(null);

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

    // Scroll lock + background inertness, scoped to the mounted lifetime
    // (covers the close animation too, so background can't scroll/be
    // reached mid-fade-out).
    useLayoutEffect(() => {
      if (!mounted) return;
      lockBodyScroll();
      const panel = panelRef.current;
      const unlockInert = panel ? lockBackgroundInert(panel) : () => {};
      return () => {
        unlockBodyScroll();
        unlockInert();
      };
    }, [mounted]);

    // Capture what had focus before opening; move focus into the panel;
    // restore focus once the dialog fully unmounts.
    useLayoutEffect(() => {
      if (!mounted) return;
      previouslyFocused.current = document.activeElement as HTMLElement | null;
      panelRef.current?.focus();
      return () => {
        previouslyFocused.current?.focus?.();
      };
    }, [mounted]);

    const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
      if (e.key !== 'Tab') return;
      const panel = panelRef.current;
      if (!panel) return;

      const focusable = Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter(
        isVisible,
      );
      if (focusable.length === 0) {
        e.preventDefault();
        return;
      }

      const first = focusable[0]!;
      const last = focusable[focusable.length - 1]!;
      const active = document.activeElement;

      if (e.shiftKey) {
        if (active === first || !panel.contains(active)) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (active === last || !panel.contains(active)) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    if (!mounted) return null;

    const contentProps = getContentProps();
    const closeButtonProps = getCloseButtonProps();

    return createPortal(
      <>
        <DialogOverlay visible={visible} />
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onKeyDown={handleKeyDown}
          onClick={(e) => {
            if (e.target === e.currentTarget) getOverlayProps().onClick();
          }}
        >
          <div
            ref={(node) => {
              panelRef.current = node;
              if (typeof ref === 'function') ref(node);
              else if (ref) ref.current = node;
            }}
            {...contentProps}
            data-state={visible ? 'open' : 'closed'}
            className={twMerge(
              'rounded-popover bg-surface relative flex max-h-[85vh] w-full flex-col overflow-hidden shadow-lg',
              'outline-none',
              'duration-fast ease-out-soft transition-[opacity,transform] motion-reduce:transition-none',
              visible ? 'scale-100 opacity-100' : 'scale-95 opacity-0',
              sizeClasses[size],
              className,
            )}
            {...props}
          >
            {showCloseButton && (
              <button
                {...closeButtonProps}
                className="rounded-control text-text-secondary hover:bg-surface-raised hover:text-text-primary focus-ring-safe absolute top-3 right-3 z-10 p-1 transition-colors outline-none"
              >
                <CloseIcon />
              </button>
            )}
            {children}
          </div>
        </div>
      </>,
      document.body,
    );
  },
);
DialogContent.displayName = 'DialogContent';

function CloseIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M18 6 6 18M6 6l12 12"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
