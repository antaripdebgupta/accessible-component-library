import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { useDialogContext } from './Dialog';

export interface DialogCloseProps extends ButtonHTMLAttributes<HTMLButtonElement> {}

/** A plain button that closes the dialog on click — for footer
 * "Cancel"/"Close" buttons, distinct from DialogContent's built-in "X". */
export const DialogClose = forwardRef<HTMLButtonElement, DialogCloseProps>(
  ({ onClick, type = 'button', ...props }, ref) => {
    const { close } = useDialogContext();
    return (
      <button
        ref={ref}
        type={type}
        onClick={(e) => {
          onClick?.(e);
          close();
        }}
        {...props}
      />
    );
  },
);
DialogClose.displayName = 'DialogClose';
