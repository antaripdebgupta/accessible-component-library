import { forwardRef, type ButtonHTMLAttributes, type MouseEvent } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { useButton } from '@antarip/primitives';
import { twMerge } from 'tailwind-merge';

const buttonStyles = cva(
  [
    'inline-flex items-center justify-center gap-2 rounded-control font-medium whitespace-nowrap',
    'transition-colors duration-fast motion-reduce:transition-none',
    'focus-ring-safe',
    'disabled:opacity-50 disabled:cursor-not-allowed',
    'aria-disabled:opacity-50 aria-disabled:cursor-not-allowed',
    'active:scale-[0.98] disabled:active:scale-100 aria-disabled:active:scale-100',
  ],
  {
    variants: {
      variant: {
        primary: [
          'bg-accent-default text-text-inverse shadow-xs',
          'hover:bg-accent-hover active:bg-accent-active',
          'shadow-[inset_0_1px_0_0_rgba(255,255,255,0.12)]',
        ],
        secondary: [
          'bg-surface text-text-primary border border-border-strong shadow-xs',
          'hover:bg-surface-raised',
        ],
        danger: [
          'bg-danger-default text-text-inverse shadow-xs',
          'hover:bg-[#991b1b] active:bg-[#7f1d1d]',
        ],
      },
      size: {
        sm: 'h-ctl-sm px-control-sm text-sm',
        md: 'h-ctl-md px-control-md text-sm',
        lg: 'h-ctl-lg px-control-lg text-base',
      },
    },
    defaultVariants: { variant: 'primary', size: 'md' },
  },
);

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonStyles> {
  loading?: boolean;
  /** Visible while loading; accessible name stays stable via aria-busy, not label swap. */
  loadingText?: string;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, loading, loadingText, disabled, children, ...props }, ref) => {
    const { buttonProps, isDisabled } = useButton({ disabled, loading });

    const handleClick = (e: MouseEvent<HTMLButtonElement>) => {
      if (isDisabled) {
        e.preventDefault();
        e.stopPropagation();
        return;
      }
      props.onClick?.(e);
    };

    return (
      <button
        ref={ref}
        className={twMerge(buttonStyles({ variant, size }), className)}
        {...props}
        {...buttonProps}
        onClick={handleClick}
      >
        {loading && (
          <span
            aria-hidden="true"
            className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent motion-reduce:animate-none"
          />
        )}
        {loading && loadingText ? loadingText : children}
      </button>
    );
  },
);

Button.displayName = 'Button';
