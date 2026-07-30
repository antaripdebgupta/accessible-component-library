import { createContext, forwardRef, useContext, useMemo, type HTMLAttributes } from "react";
import { useTabs, type UseTabsReturn, type TabsOrientation, type TabsActivationMode } from "@acl/primitives";
import { twMerge } from "tailwind-merge";

const TabsContext = createContext<UseTabsReturn | null>(null);

export function useTabsContext(): UseTabsReturn {
    const ctx = useContext(TabsContext);
    if (!ctx) throw new Error("Tabs subcomponents must be used within <Tabs>");
    return ctx;
}

export interface TabsProps extends HTMLAttributes<HTMLDivElement> {
    value?: string;
    defaultValue?: string;
    onValueChange?: (value: string) => void;
    orientation?: TabsOrientation;
    activationMode?: TabsActivationMode;
    dir?: "ltr" | "rtl";
    loop?: boolean;
    id?: string;
}

/**
 * Root Tabs component. Provides shared state/keyboard logic via context to
 * TabsList, TabsTrigger, and TabsContent. Implements the WAI-ARIA APG Tabs
 * pattern — see Tabs.a11y.md for the full accessibility contract.
 */
export const Tabs = forwardRef<HTMLDivElement, TabsProps>(
    (
        {
            value,
            defaultValue,
            onValueChange,
            orientation = "horizontal",
            activationMode = "automatic",
            dir,
            loop = true,
            id,
            className,
            children,
            ...props
        },
        ref
    ) => {
        const tabs = useTabs({ value, defaultValue, onValueChange, orientation, activationMode, dir, loop, id });
        const contextValue = useMemo(() => tabs, [tabs]);

        return (
            <TabsContext.Provider value={contextValue}>
                <div
                    ref={ref}
                    dir={tabs.dir}
                    data-orientation={orientation}
                    className={twMerge(
                        orientation === "vertical" ? "flex gap-4" : "flex flex-col gap-2",
                        className
                    )}
                    {...props}
                >
                    {children}
                </div>
            </TabsContext.Provider>
        );
    }
);
Tabs.displayName = "Tabs";