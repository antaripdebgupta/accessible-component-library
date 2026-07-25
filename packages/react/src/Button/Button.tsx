import { forwardRef, type ButtonHTMLAttributes, type MouseEvent } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { useButton } from "@acl/primitives";
import { twMerge } from "tailwind-merge";

const buttonStyles = cva(
  [
    "inline-flex items-center justify-center gap-2 rounded-control font-medium",
    "transition-colors duration-fast motion-reduce:transition-none",
    "focus-ring-safe",
    "disabled:opacity-50",
  ],
  {
    variants: {
      variant: {
        primary: "bg-accent-default text-text-inverse hover:bg-accent-hover active:bg-accent-active",
        secondary: "bg-surface-raised text-text-primary border border-border hover:border-border-strong",
        danger: "bg-danger-default text-text-inverse hover:opacity-90",
      },
      size: {
        sm: "h-8 px-control-sm text-sm",
        md: "h-10 px-control-md text-base",
        lg: "h-12 px-control-lg text-lg",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  }
);

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonStyles> {
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
          <span aria-hidden="true" className="animate-spin motion-reduce:animate-none">
            ⟳
          </span>
        )}
        {loading && loadingText ? loadingText : children}
      </button>
    );
  }
);

Button.displayName = "Button";
