import type { HTMLAttributes } from 'react';
import { twMerge } from 'tailwind-merge';
import { useCommandPaletteContext } from './CommandPalette';

export interface CommandEmptyProps extends HTMLAttributes<HTMLDivElement> {}

export function CommandEmpty({
  className,
  children = 'No results found.',
  ...props
}: CommandEmptyProps) {
  const { enabledOrder } = useCommandPaletteContext();
  if (enabledOrder().length > 0) return null;

  return (
    <div
      className={twMerge('text-text-secondary px-2 py-8 text-center text-sm', className)}
      {...props}
    >
      {children}
    </div>
  );
}
CommandEmpty.displayName = 'CommandEmpty';

export interface CommandLoadingProps extends HTMLAttributes<HTMLDivElement> {
  loading: boolean;
}

export function CommandLoading({
  loading,
  className,
  children = 'Searching...',
  ...props
}: CommandLoadingProps) {
  if (!loading) return null;
  return (
    <div
      className={twMerge('text-text-secondary px-2 py-4 text-center text-sm', className)}
      {...props}
    >
      {children}
    </div>
  );
}
CommandLoading.displayName = 'CommandLoading';

export function CommandShortcut({ className, ...props }: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={twMerge('text-text-secondary ml-auto pl-4 text-xs tracking-widest', className)}
      {...props}
    />
  );
}
CommandShortcut.displayName = 'CommandShortcut';
