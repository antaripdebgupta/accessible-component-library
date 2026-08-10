import {
  forwardRef,
  type FieldsetHTMLAttributes,
  type HTMLAttributes,
  type ReactNode,
} from 'react';
import { twMerge } from 'tailwind-merge';

export interface InputGroupProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  className?: string;
  dir?: 'ltr' | 'rtl';
}

export const InputGroup = forwardRef<HTMLDivElement, InputGroupProps>(
  ({ children, className, dir = 'ltr', ...props }, ref) => {
    return (
      <div
        ref={ref}
        {...props}
        dir={dir}
        className={twMerge(
          'flex w-full items-stretch rounded-md shadow-xs focus-within:z-10',
          '[&>input]:rounded-none [&>input:first-child]:rounded-s-md [&>input:last-child]:rounded-e-md',
          '[&>button]:rounded-none [&>button:first-child]:rounded-s-md [&>button:last-child]:rounded-e-md',
          '[&>*:not(:first-child)]:-ms-px',
          className,
        )}
      >
        {children}
      </div>
    );
  },
);

InputGroup.displayName = 'InputGroup';

export interface FieldGroupProps extends FieldsetHTMLAttributes<HTMLFieldSetElement> {
  legend: ReactNode;
  description?: ReactNode;
  error?: ReactNode;
  children: ReactNode;
  className?: string;
  dir?: 'ltr' | 'rtl';
}

export const FieldGroup = forwardRef<HTMLFieldSetElement, FieldGroupProps>(
  ({ legend, description, error, children, className, dir = 'ltr', ...props }, ref) => {
    return (
      <fieldset
        ref={ref}
        {...props}
        dir={dir}
        className={twMerge(
          'border-border bg-surface flex flex-col gap-2 rounded-lg border p-4',
          className,
        )}
      >
        <legend className="text-text-primary px-1 text-sm font-semibold">{legend}</legend>
        {description && <p className="text-text-secondary -mt-1 mb-1 text-xs">{description}</p>}

        <div className="flex w-full flex-wrap items-center gap-3">{children}</div>

        {error && <p className="text-danger-default mt-1 text-xs font-medium">{error}</p>}
      </fieldset>
    );
  },
);

FieldGroup.displayName = 'FieldGroup';
