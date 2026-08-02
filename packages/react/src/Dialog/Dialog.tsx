import { createContext, useContext, useMemo, useRef, type ReactNode, type RefObject } from 'react';
import { useDialog, type UseDialogReturn } from '@acl/primitives';

interface DialogContextValue extends UseDialogReturn {
  triggerRef: RefObject<HTMLElement | null>;
}

const DialogContext = createContext<DialogContextValue | null>(null);

export function useDialogContext(): DialogContextValue {
  const ctx = useContext(DialogContext);
  if (!ctx) throw new Error('Dialog subcomponents must be used within <Dialog>');
  return ctx;
}

export interface DialogProps {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
  id?: string;
  children: ReactNode;
}

export function Dialog({
  open,
  defaultOpen,
  onOpenChange,
  closeOnOverlayClick,
  closeOnEscape,
  id,
  children,
}: DialogProps) {
  const dialog = useDialog({
    open,
    defaultOpen,
    onOpenChange,
    closeOnOverlayClick,
    closeOnEscape,
    id,
  });
  const triggerRef = useRef<HTMLElement | null>(null);
  const contextValue = useMemo<DialogContextValue>(() => ({ ...dialog, triggerRef }), [dialog]);

  return <DialogContext.Provider value={contextValue}>{children}</DialogContext.Provider>;
}
Dialog.displayName = 'Dialog';
