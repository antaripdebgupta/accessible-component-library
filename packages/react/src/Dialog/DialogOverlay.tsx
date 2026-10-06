import { forwardRef, type HTMLAttributes } from 'react';
import { twMerge } from 'tailwind-merge';
import { useDialogContext } from './Dialog';

export interface DialogOverlayProps extends HTMLAttributes<HTMLDivElement> {
  visible: boolean;
}

export const DialogOverlay = forwardRef<HTMLDivElement, DialogOverlayProps>(
  ({ visible, className, ...props }, ref) => {
    const { getOverlayProps } = useDialogContext();
    const overlayProps = getOverlayProps();

    return (
      <div
        ref={ref}
        {...overlayProps}
        data-state={visible ? 'open' : 'closed'}
        className={twMerge(
          'fixed inset-0 z-40 bg-overlay',
          'transition-opacity duration-fast ease-out-soft motion-reduce:transition-none',
          'data-[state=closed]:pointer-events-none data-[state=closed]:opacity-0',
          'data-[state=open]:opacity-100',
          className,
        )}
        {...props}
      />
    );
  },
);
DialogOverlay.displayName = 'DialogOverlay';
