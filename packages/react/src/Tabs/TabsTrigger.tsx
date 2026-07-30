import { forwardRef, useEffect, useRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { twMerge } from "tailwind-merge";
import { useTabsContext } from "./Tabs";

const triggerStyles = cva(
    [
        "relative inline-flex items-center gap-2 whitespace-nowrap px-control-md py-control-sm text-sm font-medium",
        "outline-none",
        "text-text-secondary transition-all duration-base motion-reduce:transition-none", // ← changed from transition-colors duration-fast
        "hover:text-text-primary focus-ring-safe",
        "disabled:pointer-events-none disabled:opacity-50",
        "aria-disabled:pointer-events-none aria-disabled:opacity-50",
        "data-[state=active]:text-accent-default",
    ],
    {
        variants: {
            orientation: {
                horizontal:
                    "",
                vertical:
                    "justify-start",
            },
        },
    }
);

export interface TabsTriggerProps
    extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "value">,
    VariantProps<typeof triggerStyles> {
    value: string;
    disabled?: boolean;
    icon?: ReactNode;
    badge?: ReactNode;
}

export const TabsTrigger = forwardRef<HTMLButtonElement, TabsTriggerProps>(
    ({ value, disabled = false, icon, badge, className, children, ...props }, forwardedRef) => {
        const { registerTab, setTabDisabled, getTriggerProps, orientation } = useTabsContext();
        const innerRef = useRef<HTMLButtonElement>(null);

        useEffect(() => registerTab(value, innerRef, disabled), [registerTab, value, disabled]);
        useEffect(() => setTabDisabled(value, disabled), [setTabDisabled, value, disabled]);

        const triggerProps = getTriggerProps(value, disabled);
        const isSelected = triggerProps["aria-selected"];

        return (
            <button
                ref={(node) => {
                    innerRef.current = node;
                    if (typeof forwardedRef === "function") forwardedRef(node);
                    else if (forwardedRef) forwardedRef.current = node;
                }}
                type="button"
                data-state={isSelected ? "active" : "inactive"}
                disabled={disabled}
                className={twMerge(triggerStyles({ orientation }), className)}
                {...triggerProps}
                {...props}
            >
                {icon && <span aria-hidden="true" className="shrink-0">{icon}</span>}
                {children}
                {badge && (
                    <span className="ml-1 bg-accent-subtle px-1.5 py-0.5 text-xs text-accent-default">
                        {badge}
                    </span>
                )}
            </button>
        );
    }
);
TabsTrigger.displayName = "TabsTrigger";