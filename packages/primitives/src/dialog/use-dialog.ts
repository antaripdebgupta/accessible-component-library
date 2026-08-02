import { useCallback, useState } from 'react';
import { useControllableState, useStableId, useEscapeKey } from '@acl/utils';

export interface UseDialogOptions {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Clicking the overlay closes the dialog. Default true. */
  closeOnOverlayClick?: boolean;
  /** Escape closes the dialog. Default true. */
  closeOnEscape?: boolean;
  id?: string;
}

/**
 * Headless state logic for the Dialog (modal) pattern.
 * Implements the WAI-ARIA APG Dialog (Modal) pattern:
 * https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/
 */
export function useDialog({
  open: controlledOpen,
  defaultOpen = false,
  onOpenChange,
  closeOnOverlayClick = true,
  closeOnEscape = true,
  id,
}: UseDialogOptions = {}) {
  const baseId = useStableId(id ?? 'dialog');
  const triggerId = `${baseId}-trigger`;
  const contentId = `${baseId}-content`;
  const titleId = `${baseId}-title`;
  const descriptionId = `${baseId}-description`;

  const [open, setOpen] = useControllableState<boolean>({
    value: controlledOpen,
    defaultValue: defaultOpen,
    onChange: onOpenChange,
  });

  // DialogDescription registers its presence so aria-describedby is only
  // set on the content when a description actually exists.
  const [hasDescription, setHasDescription] = useState(false);
  const registerDescription = useCallback(() => {
    setHasDescription(true);
    return () => setHasDescription(false);
  }, []);

  const close = useCallback(() => setOpen(false), [setOpen]);
  const show = useCallback(() => setOpen(true), [setOpen]);

  useEscapeKey(close, { active: open && closeOnEscape });

  const getTriggerProps = useCallback(
    () => ({
      id: triggerId,
      'aria-haspopup': 'dialog' as const,
      'aria-expanded': open,
      'aria-controls': open ? contentId : undefined,
      onClick: () => setOpen(!open),
    }),
    [contentId, open, setOpen, triggerId],
  );

  const getOverlayProps = useCallback(
    () => ({
      'aria-hidden': true as const,
      onClick: () => {
        if (closeOnOverlayClick) close();
      },
    }),
    [close, closeOnOverlayClick],
  );

  const getContentProps = useCallback(
    () => ({
      id: contentId,
      role: 'dialog' as const,
      'aria-modal': true as const,
      'aria-labelledby': titleId,
      'aria-describedby': hasDescription ? descriptionId : undefined,
      tabIndex: -1 as const,
    }),
    [contentId, descriptionId, hasDescription, titleId],
  );

  const getCloseButtonProps = useCallback(
    () => ({
      type: 'button' as const,
      'aria-label': 'Close',
      onClick: close,
    }),
    [close],
  );

  return {
    open,
    setOpen,
    show,
    close,
    baseId,
    triggerId,
    contentId,
    titleId,
    descriptionId,
    registerDescription,
    getTriggerProps,
    getOverlayProps,
    getContentProps,
    getCloseButtonProps,
  };
}

export type UseDialogReturn = ReturnType<typeof useDialog>;
