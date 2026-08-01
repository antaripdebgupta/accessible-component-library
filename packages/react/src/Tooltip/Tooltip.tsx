import { createContext, useContext, useMemo, useRef, type ReactNode, type RefObject } from 'react';
import { useTooltip, type UseTooltipReturn, type TooltipPlacement } from '@acl/primitives';

interface TooltipContextValue extends UseTooltipReturn {
  triggerRef: RefObject<HTMLElement | null>;
  placement: TooltipPlacement;
  showArrow: boolean;
}

const TooltipContext = createContext<TooltipContextValue | null>(null);

export function useTooltipContext(): TooltipContextValue {
  const ctx = useContext(TooltipContext);
  if (!ctx) throw new Error('TooltipTrigger/TooltipContent must be used within <Tooltip>');
  return ctx;
}

export interface TooltipProps {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Delay (ms) before showing on hover. Default 300. */
  delayDuration?: number;
  disabled?: boolean;
  placement?: TooltipPlacement;
  /** Renders a small pointer arrow linking the tooltip to its trigger. Default true. */
  showArrow?: boolean;
  id?: string;
  children: ReactNode;
}

export function Tooltip({
  open,
  defaultOpen,
  onOpenChange,
  delayDuration,
  disabled,
  placement = 'top',
  showArrow = true,
  id,
  children,
}: TooltipProps) {
  const tooltip = useTooltip({ open, defaultOpen, onOpenChange, delayDuration, disabled, id });
  const triggerRef = useRef<HTMLElement | null>(null);
  const contextValue = useMemo<TooltipContextValue>(
    () => ({ ...tooltip, triggerRef, placement, showArrow }),
    [tooltip, placement, showArrow],
  );

  return <TooltipContext.Provider value={contextValue}>{children}</TooltipContext.Provider>;
}
Tooltip.displayName = 'Tooltip';
