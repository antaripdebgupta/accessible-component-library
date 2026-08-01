import { useCallback, useEffect, useRef, type FocusEvent, type MouseEvent } from 'react';
import { useControllableState, useStableId, useEscapeKey } from '@acl/utils';

export type TooltipPlacement = 'top' | 'right' | 'bottom' | 'left';

export interface UseTooltipOptions {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Delay (ms) before showing on hover. Focus shows immediately per APG. Default 300. */
  delayDuration?: number;
  /** Grace period (ms) before hiding, so the pointer can move onto the tooltip content (WCAG 1.4.13 hoverable). Default 100. */
  hideDelay?: number;
  disabled?: boolean;
  id?: string;
}

export interface TooltipTriggerProps {
  id: string;
  'aria-describedby': string | undefined;
  onMouseEnter: (e: MouseEvent) => void;
  onMouseLeave: (e: MouseEvent) => void;
  onFocus: (e: FocusEvent) => void;
  onBlur: (e: FocusEvent) => void;
}

export interface TooltipContentProps {
  id: string;
  role: 'tooltip';
  onMouseEnter: (e: MouseEvent) => void;
  onMouseLeave: (e: MouseEvent) => void;
}

export function useTooltip({
  open: controlledOpen,
  defaultOpen = false,
  onOpenChange,
  delayDuration = 300,
  hideDelay = 100,
  disabled = false,
  id,
}: UseTooltipOptions = {}) {
  const baseId = useStableId(id ?? 'tooltip');
  const triggerId = `${baseId}-trigger`;
  const contentId = `${baseId}-content`;

  const [open, setOpen] = useControllableState<boolean>({
    value: controlledOpen,
    defaultValue: defaultOpen,
    onChange: onOpenChange,
  });

  const openTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const closeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearOpenTimer = useCallback(() => {
    if (openTimeoutRef.current) {
      clearTimeout(openTimeoutRef.current);
      openTimeoutRef.current = null;
    }
  }, []);

  const clearCloseTimer = useCallback(() => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      clearOpenTimer();
      clearCloseTimer();
    };
  }, [clearOpenTimer, clearCloseTimer]);

  const show = useCallback(
    (immediate: boolean) => {
      if (disabled) return;
      clearCloseTimer();
      if (open) return;
      if (immediate || delayDuration <= 0) {
        setOpen(true);
      } else {
        openTimeoutRef.current = setTimeout(() => setOpen(true), delayDuration);
      }
    },
    [clearCloseTimer, delayDuration, disabled, open, setOpen],
  );

  const hide = useCallback(
    (immediate: boolean) => {
      clearOpenTimer();
      if (immediate || hideDelay <= 0) {
        setOpen(false);
      } else {
        closeTimeoutRef.current = setTimeout(() => setOpen(false), hideDelay);
      }
    },
    [clearOpenTimer, hideDelay, setOpen],
  );

  // Dismissible on Escape (WCAG 1.4.13) — only while open, only closes the tooltip.
  useEscapeKey(() => hide(true), { active: open });

  const getTriggerProps = useCallback(
    (): TooltipTriggerProps => ({
      id: triggerId,
      'aria-describedby': open ? contentId : undefined,
      onMouseEnter: () => show(false),
      onMouseLeave: () => hide(false),
      onFocus: () => show(true),
      onBlur: () => hide(false),
    }),
    [contentId, hide, open, show, triggerId],
  );

  const getContentProps = useCallback(
    (): TooltipContentProps => ({
      id: contentId,
      role: 'tooltip',
      onMouseEnter: () => clearCloseTimer(),
      onMouseLeave: () => hide(false),
    }),
    [clearCloseTimer, contentId, hide],
  );

  return {
    open,
    triggerId,
    contentId,
    getTriggerProps,
    getContentProps,
  };
}

export type UseTooltipReturn = ReturnType<typeof useTooltip>;
