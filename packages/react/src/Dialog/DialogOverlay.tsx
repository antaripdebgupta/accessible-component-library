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
          'transition-opacity motion-reduce:transition-none',
          'data-[state=open]:opacity-100 data-[state=open]:duration-base data-[state=open]:ease-out-soft data-[state=open]:motion-safe:animate-fade-in',
          'data-[state=closed]:pointer-events-none data-[state=closed]:opacity-0 data-[state=closed]:duration-fast data-[state=closed]:ease-in-quick',
          className,
        )}
        {...props}
      />
    );
  },
);
DialogOverlay.displayName = 'DialogOverlay';
