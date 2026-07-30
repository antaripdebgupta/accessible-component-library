import { forwardRef, useRef, useState, useEffect, type HTMLAttributes } from "react";
import { twMerge } from "tailwind-merge";
import { useTabsContext } from "./Tabs";

export interface TabsContentProps extends HTMLAttributes<HTMLDivElement> {
    value: string;
    /** Keep the panel mounted (with visibility toggled) even before first selection. */
    forceMount?: boolean;
    /** Defer mounting panel contents until first selected. Default true. */
    lazyMount?: boolean;
}

export const TabsContent = forwardRef<HTMLDivElement, TabsContentProps>(
    ({ value, forceMount = false, lazyMount = true, className, children, ...props }, ref) => {
        const { getContentProps } = useTabsContext();
        const contentProps = getContentProps(value);
        const hasBeenSelected = useRef(!lazyMount);

        if (!contentProps.hidden) hasBeenSelected.current = true;

        const shouldRenderChildren = forceMount || hasBeenSelected.current;

        return (
            <div
                ref={ref}
                className={twMerge(
                    "focus-ring-safe",
                    "motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-1 motion-safe:duration-base",
                    className
                )}
                {...contentProps}
                {...props}
            >
                {shouldRenderChildren ? children : null}
            </div>
        );
    }
);
TabsContent.displayName = "TabsContent";