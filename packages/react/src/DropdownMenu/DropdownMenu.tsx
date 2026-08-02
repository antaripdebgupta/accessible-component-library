import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  type ReactNode,
  type RefObject,
} from 'react';
import { useDropdownMenu, type UseDropdownMenuReturn } from '@acl/primitives';

interface DropdownMenuContextValue extends UseDropdownMenuReturn {
  triggerRef: RefObject<HTMLElement | null>;
  contentRef: RefObject<HTMLDivElement | null>;
}

export const DropdownMenuContext = createContext<DropdownMenuContextValue | null>(null);

export function useDropdownMenuContext(): DropdownMenuContextValue {
  const ctx = useContext(DropdownMenuContext);
  if (!ctx) throw new Error('DropdownMenu subcomponents must be used within <DropdownMenu>');
  return ctx;
}

export interface DropdownMenuProps {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  id?: string;
  children: ReactNode;
}

export function DropdownMenu({ open, defaultOpen, onOpenChange, id, children }: DropdownMenuProps) {
  const menu = useDropdownMenu({ open, defaultOpen, onOpenChange, id });
  const triggerRef = useRef<HTMLElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);
  const wasOpen = useRef(menu.open);

  // Return focus to the trigger whenever the menu closes.
  useEffect(() => {
    if (wasOpen.current && !menu.open) {
      triggerRef.current?.focus();
    }
    wasOpen.current = menu.open;
  }, [menu.open]);

  // Close on outside click/tap.
  useEffect(() => {
    if (!menu.open) return;
    const handlePointerDown = (e: PointerEvent) => {
      const target = e.target as Node;
      if (contentRef.current?.contains(target)) return;
      if (triggerRef.current?.contains(target)) return;
      menu.close();
    };
    document.addEventListener('pointerdown', handlePointerDown);
    return () => document.removeEventListener('pointerdown', handlePointerDown);
  }, [menu, menu.open]);

  const contextValue = useMemo<DropdownMenuContextValue>(
    () => ({ ...menu, triggerRef, contentRef }),
    [menu],
  );

  return (
    <DropdownMenuContext.Provider value={contextValue}>{children}</DropdownMenuContext.Provider>
  );
}
DropdownMenu.displayName = 'DropdownMenu';
