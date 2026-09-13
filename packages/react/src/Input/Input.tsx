import { forwardRef, useImperativeHandle, type InputHTMLAttributes, type ReactNode } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { useInput, type UseInputOptions } from '@acl/primitives';
import { twMerge } from 'tailwind-merge';
import { Eye, EyeOff } from 'lucide-react';

const inputVariants = cva(
  [
    'w-full h-10 rounded-md border border-border bg-surface px-3 py-2 text-sm text-text-primary placeholder:text-text-secondary',
    'outline-none focus:border-2  focus:border-accent-default transition-colors duration-150',
    'disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-surface-raised',
    'autofill:shadow-[0_0_0_30px_var(--color-surface,#fff)_inset] autofill:[-webkit-text-fill-color:var(--color-text-primary,#000)]',
  ],
  {
    variants: {
      variant: {
        default: 'border-border focus:border-accent-default',
        invalid: 'border-danger-default text-danger-default focus:border-danger-default',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
);

export interface InputProps
  extends
    Omit<
      InputHTMLAttributes<HTMLInputElement>,
      'value' | 'defaultValue' | 'onChange' | 'type' | 'prefix'
    >,
    VariantProps<typeof inputVariants>,
    UseInputOptions {
  label?: ReactNode;
  description?: ReactNode;
  error?: ReactNode;
  required?: boolean;
  showRequiredIndicator?: boolean;
  badge?: ReactNode;
  prefix?: ReactNode;
  suffix?: ReactNode;
  actionButton?: ReactNode;
  layout?: 'stacked' | 'inline';
  dir?: 'ltr' | 'rtl';
  wrapperClassName?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      wrapperClassName,
      variant: variantProp,
      label,
      description,
      error,
      value: controlledValue,
      defaultValue,
      onChange,
      disabled,
      required,
      showRequiredIndicator = required,
      readOnly,
      type = 'text',
      id,
      badge,
      prefix,
      suffix,
      actionButton,
      layout = 'stacked',
      dir = 'ltr',
      'aria-describedby': ariaDescribedby,
      ...props
    },
    forwardedRef,
  ) => {
    const isInvalid = Boolean(error) || variantProp === 'invalid';
    const computedVariant = isInvalid ? 'invalid' : (variantProp ?? 'default');

    const {
      value,
      effectiveType,
      showPassword,
      togglePasswordVisibility,
      inputRef,
      getInputProps,
    } = useInput({
      value: controlledValue,
      defaultValue,
      onChange,
      disabled,
      required,
      readOnly,
      type,
      id,
    });

    useImperativeHandle(forwardedRef, () => inputRef.current as HTMLInputElement);

    const inputProps = getInputProps();
    const inputId = inputProps.id;
    const descriptionId = description ? `${inputId}-description` : undefined;
    const errorId = error ? `${inputId}-error` : undefined;

    const combinedDescribedBy = [ariaDescribedby, descriptionId, errorId].filter(Boolean).join(' ');

    const isPasswordType = type === 'password';

    const renderInputContent = () => (
      <div className="relative flex w-full items-center">
        {/* Leading Addon / Prefix Icon */}
        {prefix && (
          <div
            className={twMerge(
              'text-text-secondary pointer-events-none absolute flex items-center text-sm',
              dir === 'rtl' ? 'right-3' : 'left-3',
            )}
          >
            {prefix}
          </div>
        )}

        {/* Inline Decorative Badge (e.g., $ or USD) */}
        {badge && (
          <span
            aria-hidden="true"
            className={twMerge(
              'bg-surface-raised text-text-secondary border-border pointer-events-none absolute flex items-center rounded border px-2 py-0.5 text-xs font-semibold select-none',
              dir === 'rtl' ? 'right-2' : 'left-2',
            )}
          >
            {badge}
          </span>
        )}

        <input
          ref={inputRef}
          {...props}
          {...inputProps}
          aria-invalid={isInvalid ? true : undefined}
          aria-describedby={combinedDescribedBy || undefined}
          className={twMerge(
            inputVariants({ variant: computedVariant }),
            prefix && (dir === 'rtl' ? 'pr-9' : 'pl-9'),
            badge && (dir === 'rtl' ? 'pr-12' : 'pl-12'),
            (suffix || isPasswordType || actionButton) && (dir === 'rtl' ? 'pl-10' : 'pr-10'),
            dir === 'rtl' && 'text-right',
            className,
          )}
        />

        {/* Trailing Addon / Suffix Icon */}
        {suffix && !isPasswordType && !actionButton && (
          <div
            className={twMerge(
              'text-text-secondary pointer-events-none absolute flex items-center text-sm',
              dir === 'rtl' ? 'left-3' : 'right-3',
            )}
          >
            {suffix}
          </div>
        )}

        {/* Password Visibility Toggle */}
        {isPasswordType && (
          <button
            type="button"
            tabIndex={disabled ? -1 : 0}
            disabled={disabled}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            aria-pressed={showPassword}
            onMouseDown={(e) => {
              // Prevent mouse down from moving focus to the button so
              // the input keeps focus and the selection/caret is preserved.
              e.preventDefault();
            }}
            onClick={(e) => {
              e.preventDefault();
              togglePasswordVisibility();
            }}
            className={twMerge(
              'text-text-secondary hover:text-text-primary focus-ring-safe absolute flex items-center justify-center rounded p-1',
              dir === 'rtl' ? 'left-2' : 'right-2',
              disabled && 'cursor-not-allowed opacity-50',
            )}
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        )}

        {/* Custom Action Button */}
        {actionButton && !isPasswordType && (
          <div
            className={twMerge('absolute flex items-center', dir === 'rtl' ? 'left-2' : 'right-2')}
          >
            {actionButton}
          </div>
        )}
      </div>
    );

    return (
      <div
        className={twMerge(
          'w-full',
          layout === 'inline' ? 'flex items-center gap-4' : 'flex flex-col gap-1.5',
          wrapperClassName,
        )}
        dir={dir}
      >
        {label && (
          <label
            htmlFor={inputId}
            className={twMerge(
              'text-text-primary text-sm font-medium select-none',
              layout === 'inline' && 'min-w-[100px] shrink-0',
            )}
          >
            {label}
            {showRequiredIndicator && (
              <span className="text-danger-default ms-1" aria-hidden="true">
                *<span className="sr-only"> (required)</span>
              </span>
            )}
          </label>
        )}

        <div className="flex w-full flex-col gap-1">
          {renderInputContent()}

          {description && (
            <span id={descriptionId} className="text-text-secondary text-xs">
              {description}
            </span>
          )}

          {error && (
            <span id={errorId} className="text-danger-default text-xs font-medium">
              {error}
            </span>
          )}
        </div>
      </div>
    );
  },
);

Input.displayName = 'Input';
