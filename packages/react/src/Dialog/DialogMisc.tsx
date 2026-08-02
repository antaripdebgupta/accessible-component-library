import { useEffect, type HTMLAttributes } from 'react';
import { twMerge } from 'tailwind-merge';
import { useDialogContext } from './Dialog';

export function DialogHeader({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={twMerge(
        'border-border flex shrink-0 flex-col gap-1.5 border-b px-6 py-4',
        className,
      )}
      {...props}
    />
  );
}
DialogHeader.displayName = 'DialogHeader';

export function DialogTitle({ className, ...props }: HTMLAttributes<HTMLHeadingElement>) {
  const { titleId } = useDialogContext();
  return (
    <h2
      id={titleId}
      className={twMerge('text-text-primary text-lg font-semibold', className)}
      {...props}
    />
  );
}
DialogTitle.displayName = 'DialogTitle';

export function DialogDescription({ className, ...props }: HTMLAttributes<HTMLParagraphElement>) {
  const { descriptionId, registerDescription } = useDialogContext();

  // Registers presence so DialogContent only sets aria-describedby when a
  // description is actually rendered.
  useEffect(() => registerDescription(), [registerDescription]);

  return (
    <p
      id={descriptionId}
      className={twMerge('text-text-secondary text-sm', className)}
      {...props}
    />
  );
}
DialogDescription.displayName = 'DialogDescription';

export function DialogBody({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={twMerge('flex-1 overflow-y-auto px-6 py-4', className)} {...props} />;
}
DialogBody.displayName = 'DialogBody';

export function DialogFooter({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={twMerge(
        'border-border bg-surface flex shrink-0 flex-col-reverse gap-2 border-t px-6 py-4 sm:flex-row sm:justify-end',
        className,
      )}
      {...props}
    />
  );
}
DialogFooter.displayName = 'DialogFooter';
