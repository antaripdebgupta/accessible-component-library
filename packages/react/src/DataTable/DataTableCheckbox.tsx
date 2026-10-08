import { forwardRef, useEffect, useRef, type InputHTMLAttributes } from 'react';
import { Check, Minus } from 'lucide-react';
import { twMerge } from 'tailwind-merge';

export interface DataTableCheckboxProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'type' | 'size'
> {
  indeterminate?: boolean;
}

export const DataTableCheckbox = forwardRef<HTMLInputElement, DataTableCheckboxProps>(
  ({ checked, indeterminate = false, className, ...props }, forwardedRef) => {
    const innerRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
      if (innerRef.current) innerRef.current.indeterminate = indeterminate && !checked;
    }, [indeterminate, checked]);

    return (
      <label
        className={twMerge(
          "relative inline-flex h-6 w-6 shrink-0 cursor-pointer items-center justify-center before:absolute before:-inset-1 before:content-['']",
          className,
        )}
      >
        <input
          ref={(node) => {
            innerRef.current = node;
            if (typeof forwardedRef === 'function') forwardedRef(node);
            else if (forwardedRef) forwardedRef.current = node;
          }}
          type="checkbox"
          checked={checked}
          className="peer absolute inset-0 m-0 h-4 w-4 cursor-pointer appearance-none rounded-control border border-border-control bg-surface outline-none focus-ring-safe"
          {...props}
        />
        <span
          aria-hidden="true"
          className={twMerge(
            'pointer-events-none absolute inset-0 flex h-4 w-4 items-center justify-center rounded-control border transition-colors duration-fast motion-reduce:transition-none',
            checked || indeterminate
              ? 'border-accent-default bg-accent-default text-text-inverse'
              : 'border-border-control bg-surface',
          )}
        >
          {indeterminate && !checked ? (
            <Minus
              size={11}
              strokeWidth={3}
              className="shrink-0 motion-safe:animate-scale-in motion-reduce:animate-none"
            />
          ) : checked ? (
            <Check
              size={11}
              strokeWidth={3}
              className="shrink-0 motion-safe:animate-scale-in motion-reduce:animate-none"
            />
          ) : null}
        </span>
      </label>
    );
  },
);
DataTableCheckbox.displayName = 'DataTableCheckbox';
