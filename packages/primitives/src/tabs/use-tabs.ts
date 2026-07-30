import {
    useCallback,
    useLayoutEffect,
    useMemo,
    useRef,
    useState,
    type KeyboardEvent,
    type RefObject,
} from "react";
import { useControllableState, useStableId, useDirection } from "@acl/utils";

export type TabsOrientation = "horizontal" | "vertical";
export type TabsActivationMode = "automatic" | "manual";

export interface UseTabsOptions {
    value?: string;
    defaultValue?: string;
    onValueChange?: (value: string) => void;
    orientation?: TabsOrientation;
    activationMode?: TabsActivationMode;
    /** Overrides the direction otherwise read from the DOM via useDirection(). */
    dir?: "ltr" | "rtl";
    /** Arrow navigation wraps from last -> first and vice versa. Default true. */
    loop?: boolean;
    id?: string;
}

interface TabRegistration {
    disabled: boolean;
    ref: RefObject<HTMLElement | null>;
}

export interface TabTriggerProps {
    id: string;
    role: "tab";
    "aria-selected": boolean;
    "aria-controls": string;
    "aria-disabled": true | undefined;
    tabIndex: 0 | -1;
    onClick: () => void;
    onFocus: () => void;
    onKeyDown: (e: KeyboardEvent) => void;
}

export interface TabContentProps {
    id: string;
    role: "tabpanel";
    "aria-labelledby": string;
    hidden: boolean;
    tabIndex: 0;
}

export function useTabs({
    value: controlledValue,
    defaultValue,
    onValueChange,
    orientation = "horizontal",
    activationMode = "automatic",
    dir: dirProp,
    loop = true,
    id,
}: UseTabsOptions) {
    const baseId = useStableId(id ?? "tabs");
    const detectedDir = useDirection();
    const dir = dirProp ?? detectedDir;

    const [selectedValue, setSelectedValue] =
        useControllableState<string | undefined>({
            value: controlledValue,
            defaultValue,
            onChange: (value) => {
                if (value !== undefined) {
                    onValueChange?.(value);
                }
            },
        });

    const [focusedValue, setFocusedValue] = useState<string | undefined>(
        controlledValue ?? defaultValue
    );

    const registry = useRef<Map<string, TabRegistration>>(new Map());
    const order = useRef<string[]>([]);

    const registerTab = useCallback(
        (tabValue: string, ref: RefObject<HTMLElement | null>, disabled: boolean) => {
            registry.current.set(tabValue, { ref, disabled });
            if (!order.current.includes(tabValue)) {
                order.current.push(tabValue);
            }
            return () => {
                registry.current.delete(tabValue);
                order.current = order.current.filter((v) => v !== tabValue);
            };
        },
        []
    );

    const setTabDisabled = useCallback((tabValue: string, disabled: boolean) => {
        const entry = registry.current.get(tabValue);
        if (entry) entry.disabled = disabled;
    }, []);

    useLayoutEffect(() => {
        if (selectedValue !== undefined) return;
        const first = order.current.find((v) => !registry.current.get(v)?.disabled);
        if (first) {
            setSelectedValue(first);
            setFocusedValue(first);
        }
    });

    const enabledOrder = useCallback(
        () => order.current.filter((v) => !registry.current.get(v)?.disabled),
        []
    );

    const focusTab = useCallback((tabValue: string) => {
        registry.current.get(tabValue)?.ref.current?.focus();
    }, []);

    const moveFocus = useCallback(
        (nextValue: string) => {
            setFocusedValue(nextValue);
            focusTab(nextValue);
            if (activationMode === "automatic") {
                setSelectedValue(nextValue);
            }
        },
        [activationMode, focusTab, setSelectedValue]
    );

    const selectTab = useCallback(
        (tabValue: string, disabled: boolean) => {
            if (disabled) return;
            setFocusedValue(tabValue);
            setSelectedValue(tabValue);
        },
        [setSelectedValue]
    );

    const handleKeyDown = useCallback(
        (currentValue: string, e: KeyboardEvent) => {
            const enabled = enabledOrder();
            if (enabled.length === 0) return;
            const currentIndex = enabled.indexOf(currentValue);

            const isHorizontal = orientation === "horizontal";
            const nextKey = isHorizontal ? (dir === "rtl" ? "ArrowLeft" : "ArrowRight") : "ArrowDown";
            const prevKey = isHorizontal ? (dir === "rtl" ? "ArrowRight" : "ArrowLeft") : "ArrowUp";

            let targetIndex: number | null = null;

            switch (e.key) {
                case nextKey:
                    targetIndex = currentIndex + 1;
                    if (targetIndex >= enabled.length) targetIndex = loop ? 0 : enabled.length - 1;
                    break;
                case prevKey:
                    targetIndex = currentIndex - 1;
                    if (targetIndex < 0) targetIndex = loop ? enabled.length - 1 : 0;
                    break;
                case "Home":
                    targetIndex = 0;
                    break;
                case "End":
                    targetIndex = enabled.length - 1;
                    break;
                case "Enter":
                case " ":
                    if (activationMode === "manual") {
                        e.preventDefault();
                        selectTab(currentValue, false);
                    }
                    return;
                default:
                    return;
            }

            e.preventDefault();
            const target = enabled[targetIndex];
            if (target) moveFocus(target);
        },
        [activationMode, dir, enabledOrder, loop, moveFocus, orientation, selectTab]
    );

    const getTriggerProps = useCallback(
        (tabValue: string, disabled = false): TabTriggerProps => ({
            id: `${baseId}-trigger-${tabValue}`,
            role: "tab",
            "aria-selected": selectedValue === tabValue,
            "aria-controls": `${baseId}-content-${tabValue}`,
            "aria-disabled": disabled || undefined,
            tabIndex: focusedValue === tabValue ? 0 : -1,
            onClick: () => selectTab(tabValue, disabled),
            onFocus: () => {
                if (!disabled) setFocusedValue(tabValue);
            },
            onKeyDown: (e) => handleKeyDown(tabValue, e),
        }),
        [baseId, focusedValue, handleKeyDown, selectTab, selectedValue]
    );

    const getContentProps = useCallback(
        (tabValue: string): TabContentProps => ({
            id: `${baseId}-content-${tabValue}`,
            role: "tabpanel",
            "aria-labelledby": `${baseId}-trigger-${tabValue}`,
            hidden: selectedValue !== tabValue,
            tabIndex: 0,
        }),
        [baseId, selectedValue]
    );

    const listProps = useMemo(
        () => ({ role: "tablist" as const, "aria-orientation": orientation }),
        [orientation]
    );

    return {
        selectedValue,
        focusedValue,
        orientation,
        activationMode,
        dir,
        registerTab,
        setTabDisabled,
        getTriggerProps,
        getContentProps,
        listProps,
    };
}

export type UseTabsReturn = ReturnType<typeof useTabs>;