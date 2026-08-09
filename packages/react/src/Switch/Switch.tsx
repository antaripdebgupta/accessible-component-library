import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { useSwitch } from '@acl/primitives';
import { twMerge } from 'tailwind-merge';

const switchTrackStyles = cva(
  [
    'relative inline-flex shrink-0 cursor-pointer items-center rounded-full border border-border transition-colors duration-fast focus-ring-safe outline-none select-none',
    'bg-border-strong data-[state=checked]:bg-accent-default data-[state=checked]:border-accent-default',
    'disabled:cursor-not-allowed disabled:opacity-50 aria-disabled:cursor-not-allowed aria-disabled:opacity-50',
    // 44x44px touch target via a pseudo-element expanding the click area
    "before:absolute before:top-1/2 before:left-1/2 before:h-11 before:w-11 before:-translate-x-1/2 before:-translate-y-1/2 before:content-['']",
  ],
  {
    variants: {
      size: {
        sm: 'h-5 w-9',
        md: 'h-6 w-11',
        lg: 'h-7 w-[3.25rem]',
      },
    },
    defaultVariants: {
      size: 'md',
    },
  },
);

const switchThumbStyles = cva(
  [
    'pointer-events-none flex items-center justify-center rounded-full bg-surface shadow-sm transition-transform duration-fast motion-reduce:transition-none',
    'data-[state=unchecked]:translate-x-0.5',
  ],
  {
    variants: {
      size: {
        sm: 'h-3.5 w-3.5 data-[state=checked]:translate-x-[1.125rem]',
        md: 'h-4.5 w-4.5 data-[state=checked]:translate-x-[1.375rem]',
        lg: 'h-5.5 w-5.5 data-[state=checked]:translate-x-[1.625rem]',
      },
    },
    defaultVariants: {
      size: 'md',
    },
  },
);

export interface SwitchProps
  extends
    Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'onChange'>,
    VariantProps<typeof switchTrackStyles> {
  checked?: boolean;
  defaultChecked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  pending?: boolean;
  label?: ReactNode;
}

export const Switch = forwardRef<HTMLButtonElement, SwitchProps>(
  (
    {
      className,
      size = 'md',
      checked: controlledChecked,
      defaultChecked,
      onCheckedChange,
      disabled,
      'aria-disabled': ariaDisabled,
      pending,
      label,
      id,
      ...props
    },
    ref,
  ) => {
    const { checked, getSwitchProps } = useSwitch({
      checked: controlledChecked,
      defaultChecked,
      onCheckedChange,
      disabled,
      'aria-disabled': !!ariaDisabled,
      pending,
      id,
    });

    const switchProps = getSwitchProps();
    const stateAttr = checked ? 'checked' : 'unchecked';

    const content = (
      <button
        ref={ref}
        {...props}
        {...switchProps}
        data-state={stateAttr}
        className={twMerge(switchTrackStyles({ size }), className)}
      >
        <span data-state={stateAttr} className={switchThumbStyles({ size })}>
          {pending && (
            <span
              aria-hidden="true"
              className="border-accent-default block h-2 w-2 animate-spin rounded-full border border-t-transparent"
            />
          )}
        </span>
      </button>
    );

    if (label) {
      return (
        <div className="flex items-center gap-3">
          {content}
          <label
            htmlFor={switchProps.id}
            className="text-text-primary cursor-pointer text-sm font-medium select-none"
          >
            {label}
          </label>
        </div>
      );
    }

    return content;
  },
);

Switch.displayName = 'Switch';
