import type { HTMLAttributes } from 'react';
import { twMerge } from 'tailwind-merge';
import { useComboboxContext } from './Combobox';

export interface ComboboxEmptyProps extends HTMLAttributes<HTMLDivElement> {}

export function ComboboxEmpty({
  className,
  children = 'No results found.',
  ...props
}: ComboboxEmptyProps) {
  const { visibleEnabledOrder } = useComboboxContext();
  if (visibleEnabledOrder().length > 0) return null;

  return (
    <div
      className={twMerge('text-text-secondary px-2 py-4 text-center text-sm', className)}
      {...props}
    >
      {children}
    </div>
  );
}
ComboboxEmpty.displayName = 'ComboboxEmpty';
