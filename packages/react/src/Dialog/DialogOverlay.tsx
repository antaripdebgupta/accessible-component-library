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
          'fixed inset-0 z-40 bg-black/10 backdrop-blur-[2px]',
          'duration-fast ease-out-soft transition-opacity motion-reduce:transition-none',
          visible ? 'opacity-100' : 'opacity-0',
          className,
        )}
        {...props}
      />
    );
  },
);
DialogOverlay.displayName = 'DialogOverlay';
