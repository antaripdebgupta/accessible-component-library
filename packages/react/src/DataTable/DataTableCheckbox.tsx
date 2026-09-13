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
          'relative inline-flex h-4 w-4 shrink-0 cursor-pointer items-center justify-center',
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
          className="peer border-border bg-surface focus-visible:ring-accent-default/40 absolute inset-0 m-0 h-4 w-4 cursor-pointer appearance-none rounded border outline-none focus-visible:ring-2"
          {...props}
        />
        <span
          aria-hidden="true"
          className={twMerge(
            'duration-fast pointer-events-none absolute inset-0 flex items-center justify-center rounded border transition-colors motion-reduce:transition-none',
            checked || indeterminate
              ? 'border-accent-default bg-accent-default text-text-inverse'
              : 'border-border bg-surface',
          )}
        >
          {indeterminate && !checked ? (
            <Minus size={11} strokeWidth={3} />
          ) : checked ? (
            <Check size={11} strokeWidth={3} />
          ) : null}
        </span>
      </label>
    );
  },
);
DataTableCheckbox.displayName = 'DataTableCheckbox';
