import { useId, type HTMLAttributes, type ReactNode } from 'react';
import { twMerge } from 'tailwind-merge';

export interface ComboboxGroupProps extends HTMLAttributes<HTMLDivElement> {
  heading: ReactNode;
}

export function ComboboxGroup({ heading, className, children, ...props }: ComboboxGroupProps) {
  const headingId = useId();
  return (
    <div role="group" aria-labelledby={headingId} className={className} {...props}>
      <div id={headingId} className="text-text-secondary px-2 py-1.5 text-xs font-semibold">
        {heading}
      </div>
      <div className={twMerge('flex flex-col', className)}>{children}</div>
    </div>
  );
}
ComboboxGroup.displayName = 'ComboboxGroup';
