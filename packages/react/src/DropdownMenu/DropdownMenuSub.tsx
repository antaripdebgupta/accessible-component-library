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

interface DropdownMenuSubContextValue extends UseDropdownMenuReturn {
  triggerRef: RefObject<HTMLElement | null>;
  contentRef: RefObject<HTMLDivElement | null>;
}

const DropdownMenuSubContext = createContext<DropdownMenuSubContextValue | null>(null);

export function useDropdownMenuSubContext(): DropdownMenuSubContextValue {
  const ctx = useContext(DropdownMenuSubContext);
  if (!ctx)
    throw new Error('DropdownMenuSubTrigger/SubContent must be used within <DropdownMenuSub>');
  return ctx;
}

export interface DropdownMenuSubProps {
  children: ReactNode;
}

export function DropdownMenuSub({ children }: DropdownMenuSubProps) {
  const sub = useDropdownMenu();
  const triggerRef = useRef<HTMLElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);
  const wasOpen = useRef(sub.open);

  useEffect(() => {
    if (wasOpen.current && !sub.open) {
      triggerRef.current?.focus();
    }
    wasOpen.current = sub.open;
  }, [sub.open]);

  const contextValue = useMemo<DropdownMenuSubContextValue>(
    () => ({ ...sub, triggerRef, contentRef }),
    [sub],
  );

  return (
    <DropdownMenuSubContext.Provider value={contextValue}>
      {children}
    </DropdownMenuSubContext.Provider>
  );
}
DropdownMenuSub.displayName = 'DropdownMenuSub';
