import {
  createContext,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from 'react';
import { createPortal } from 'react-dom';
import { twMerge } from 'tailwind-merge';
import { useCommandPalette, type UseCommandPaletteReturn } from '@antarip/primitives';

interface CommandPaletteContextValue extends UseCommandPaletteReturn {
  inputRef: RefObject<HTMLInputElement | null>;
  panelRef: RefObject<HTMLDivElement | null>;
}

const CommandPaletteContext = createContext<CommandPaletteContextValue | null>(null);

export function useCommandPaletteContext(): CommandPaletteContextValue {
  const ctx = useContext(CommandPaletteContext);
  if (!ctx) throw new Error('Command subcomponents must be used within <CommandPalette>');
  return ctx;
}

export interface CommandPaletteProps {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  inputValue?: string;
  defaultInputValue?: string;
  onInputValueChange?: (value: string) => void;
  loop?: boolean;
  hotkey?: string | null;
  id?: string;
  className?: string;
  children: ReactNode;
}

const EXIT_DURATION_MS = 150;

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

function matchesHotkey(e: KeyboardEvent, hotkey: string): boolean {
  const parts = hotkey.toLowerCase().split('+');
  const key = parts[parts.length - 1];
  const needsMod = parts.includes('mod');
  const needsShift = parts.includes('shift');
  const modPressed = e.metaKey || e.ctrlKey;
  if (needsMod !== modPressed) return false;
  if (needsShift !== e.shiftKey) return false;
  return e.key.toLowerCase() === key;
}

export function CommandPalette({
  open,
  defaultOpen,
  onOpenChange,
  inputValue,
  defaultInputValue,
  onInputValueChange,
  loop,
  hotkey = 'mod+k',
  id,
  className,
  children,
}: CommandPaletteProps) {
  const command = useCommandPalette({
    open,
    defaultOpen,
    onOpenChange,
    inputValue,
    defaultInputValue,
    onInputValueChange,
    loop,
    id,
  });
  const inputRef = useRef<HTMLInputElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);
  const openRef = useRef(command.open);
  const lastHeight = useRef(0);
  const [mounted, setMounted] = useState(command.open);
  const [visible, setVisible] = useState(false);

  if (command.open && !mounted) {
    setMounted(true);
  }

  const contextValue = useMemo<CommandPaletteContextValue>(
    () => ({ ...command, inputRef, panelRef }),
    [command],
  );

  useEffect(() => {
    openRef.current = command.open;
  }, [command.open]);

  // Global hotkey to toggle open, from anywhere on the page.
  useEffect(() => {
    if (!hotkey) return;
    const handler = (e: KeyboardEvent) => {
      if (!matchesHotkey(e, hotkey)) return;
      e.preventDefault();
      if (openRef.current) command.close();
      else command.show();
    };
    document.addEventListener('keydown', handler, { capture: true });
    return () => document.removeEventListener('keydown', handler, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hotkey]);

  useEffect(() => {
    if (command.open) {
      setMounted(true);
      return;
    }
    setVisible(false);
    const timeout = setTimeout(() => setMounted(false), EXIT_DURATION_MS);
    return () => clearTimeout(timeout);
  }, [command.open]);

  useEffect(() => {
    if (!mounted || !command.open) return;
    const raf = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(raf);
  }, [mounted, command.open]);

  useLayoutEffect(() => {
    if (command.open && panelRef.current) lastHeight.current = panelRef.current.offsetHeight;
  });

  useLayoutEffect(() => {
    if (!mounted) return;
    lockBodyScroll();
    return () => unlockBodyScroll();
  }, [mounted]);

  useLayoutEffect(() => {
    if (!mounted) return;
    previouslyFocused.current = document.activeElement as HTMLElement | null;
    inputRef.current?.focus();
    return () => {
      previouslyFocused.current?.focus?.();
    };
  }, [mounted]);

  if (!mounted) return null;

  const exiting = mounted && !command.open;

  return (
    <CommandPaletteContext.Provider value={contextValue}>
      {createPortal(
        <>
          <div
            aria-hidden="true"
            onClick={() => command.close()}
            data-state={visible ? 'open' : 'closed'}
            className={twMerge(
              'fixed inset-0 z-40 bg-overlay',
              'transition-opacity motion-reduce:transition-none',
              'data-[state=open]:opacity-100 data-[state=open]:duration-base data-[state=open]:ease-out-soft data-[state=open]:motion-safe:animate-fade-in',
              'data-[state=closed]:pointer-events-none data-[state=closed]:opacity-0 data-[state=closed]:duration-fast data-[state=closed]:ease-in-quick',
            )}
          />
          <div
            className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-[15vh]"
            onClick={(e) => {
              if (e.target === e.currentTarget) command.close();
            }}
          >
            <div
              ref={panelRef}
              role="dialog"
              aria-modal="true"
              aria-label="Command palette"
              data-state={visible ? 'open' : 'closed'}
              style={exiting && lastHeight.current ? { minHeight: lastHeight.current } : undefined}
              className={twMerge(
                'flex max-h-[70vh] w-full max-w-lg origin-top flex-col overflow-hidden rounded-popover bg-surface shadow-lg',
                'transition-[opacity,scale,translate] motion-reduce:transition-none',
                'data-[state=open]:duration-base data-[state=open]:ease-out-soft data-[state=open]:motion-safe:animate-pop-in',
                'data-[state=closed]:pointer-events-none data-[state=closed]:duration-fast data-[state=closed]:ease-in-quick',
                visible ? 'scale-100 opacity-100' : 'scale-[0.97] opacity-0',
                className,
              )}
            >
              {children}
            </div>
          </div>
        </>,
        document.body,
      )}
    </CommandPaletteContext.Provider>
  );
}
CommandPalette.displayName = 'CommandPalette';
