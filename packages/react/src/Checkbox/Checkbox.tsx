import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { useCheckbox } from '@acl/primitives';
import { twMerge } from 'tailwind-merge';
import { Check, Minus } from 'lucide-react';

const checkboxStyles = cva(
  [
    'peer absolute inset-0 m-0 h-4 w-4 cursor-pointer appearance-none rounded border border-border outline-none focus-ring-safe bg-surface',
    'disabled:cursor-not-allowed disabled:opacity-50',
  ],
  {
    variants: {
      variant: {
        default: 'border-border focus:border-accent-default',
        error: 'border-danger-default focus:border-danger-default',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
);

export interface CheckboxProps
  extends
    Omit<InputHTMLAttributes<HTMLInputElement>, 'checked' | 'defaultChecked' | 'onChange'>,
    VariantProps<typeof checkboxStyles> {
  checked?: boolean | 'indeterminate';
  defaultChecked?: boolean | 'indeterminate';
  onCheckedChange?: (checked: boolean | 'indeterminate') => void;
  label?: ReactNode;
  description?: ReactNode;
  error?: ReactNode;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  (
    {
      className,
      checked: controlledChecked,
      defaultChecked,
      onCheckedChange,
      disabled,
      required,
      id,
      label,
      description,
      error,
      variant,
      'aria-describedby': ariaDescribedby,
      ...props
    },
    forwardedRef,
  ) => {
    const { checked, inputRef, getInputProps } = useCheckbox({
      checked: controlledChecked,
      defaultChecked,
      onCheckedChange,
      disabled,
      required,
      id,
    });

    const inputProps = getInputProps();
    const isIndeterminate = checked === 'indeterminate';
    const isChecked = checked === true;

    const descriptionId = description ? `${inputProps.id}-description` : undefined;
    const errorId = error ? `${inputProps.id}-error` : undefined;
    const combinedDescribedBy = [ariaDescribedby, descriptionId, errorId].filter(Boolean).join(' ');

    const handleInputClick = (e: React.MouseEvent<HTMLInputElement>) => {
      e.stopPropagation();
      props.onClick?.(e);
    };

    return (
      <div className="flex flex-col gap-1.5">
        <label
          htmlFor={inputProps.id}
          className={twMerge(
            'inline-flex cursor-pointer items-start gap-3 select-none',
            'min-h-[44px] py-3.5', // Touch target expansion
            disabled && 'cursor-not-allowed opacity-50',
            className,
          )}
        >
          <div className="relative mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center">
            <input
              ref={(node) => {
                inputRef.current = node;
                if (typeof forwardedRef === 'function') forwardedRef(node);
                else if (forwardedRef) forwardedRef.current = node;
              }}
              {...props}
              {...inputProps}
              onClick={handleInputClick}
              aria-invalid={error ? true : undefined}
              aria-describedby={combinedDescribedBy || undefined}
              className={twMerge(checkboxStyles({ variant: error ? 'error' : variant }))}
            />
            {/* Visual Custom Box */}
            <span
              aria-hidden="true"
              className={twMerge(
                'duration-fast pointer-events-none absolute inset-0 flex h-4 w-4 items-center justify-center rounded border transition-colors motion-reduce:transition-none',
                isChecked || isIndeterminate
                  ? error
                    ? 'border-danger-default bg-danger-default text-text-inverse'
                    : 'border-accent-default bg-accent-default text-text-inverse'
                  : error
                    ? 'border-danger-default bg-surface'
                    : 'border-border bg-surface',
              )}
            >
              {isIndeterminate ? (
                <Minus size={11} strokeWidth={3} className="shrink-0" />
              ) : isChecked ? (
                <Check size={11} strokeWidth={3} className="shrink-0" />
              ) : null}
            </span>
          </div>

          {label && (
            <span className="text-text-primary mt-1 text-sm leading-none font-medium">{label}</span>
          )}
        </label>

        {description && (
          <span id={descriptionId} className="text-text-secondary -mt-2 pl-8 text-xs">
            {description}
          </span>
        )}

        {error && (
          <span id={errorId} className="text-danger-default pl-8 text-xs font-medium">
            {error}
          </span>
        )}
      </div>
    );
  },
);

Checkbox.displayName = 'Checkbox';
