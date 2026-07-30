import { renderHook, act } from "@testing-library/react";
import { describe, test, expect, vi } from "vitest";
import { useTabs } from "./use-tabs";
import { createRef } from "react";

function setupBasicTabs(overrides: Partial<Parameters<typeof useTabs>[0]> = {}) {
    const { result } = renderHook(() => useTabs({ defaultValue: "a", ...overrides }));

    act(() => {
        result.current.registerTab("a", createRef<HTMLElement>(), false);
        result.current.registerTab("b", createRef<HTMLElement>(), false);
        result.current.registerTab("c", createRef<HTMLElement>(), false);
    });

    return result;
}

describe("useTabs — selection", () => {
    test("defaultValue sets initial selected tab", () => {
        const result = setupBasicTabs();
        expect(result.current.getTriggerProps("a")["aria-selected"]).toBe(true);
        expect(result.current.getTriggerProps("b")["aria-selected"]).toBe(false);
    });

    test("controlled value overrides internal state and calls onValueChange", () => {
        const onValueChange = vi.fn();
        const { result } = renderHook(() =>
            useTabs({ value: "b", onValueChange })
        );
        expect(result.current.getTriggerProps("b")["aria-selected"]).toBe(true);

        act(() => result.current.getTriggerProps("a").onClick());
        expect(onValueChange).toHaveBeenCalledWith("a");
        // still controlled — external value hasn't changed, so "b" stays selected
        expect(result.current.getTriggerProps("b")["aria-selected"]).toBe(true);
    });

    test("uncontrolled: clicking a tab selects it", () => {
        const result = setupBasicTabs();
        act(() => result.current.getTriggerProps("c").onClick());
        expect(result.current.getTriggerProps("c")["aria-selected"]).toBe(true);
    });

    test("disabled tab does not get selected on click", () => {
        const result = setupBasicTabs();
        act(() => result.current.getTriggerProps("b", true).onClick());
        expect(result.current.getTriggerProps("b")["aria-selected"]).toBe(false);
    });
});

describe("useTabs — roving tabindex", () => {
    test("only the focused tab has tabIndex 0", () => {
        const result = setupBasicTabs();
        expect(result.current.getTriggerProps("a").tabIndex).toBe(0);
        expect(result.current.getTriggerProps("b").tabIndex).toBe(-1);
        expect(result.current.getTriggerProps("c").tabIndex).toBe(-1);
    });
});

describe("useTabs — keyboard navigation (automatic activation)", () => {
    test("ArrowRight moves focus and selection to next tab", () => {
        const result = setupBasicTabs();
        act(() =>
            result.current.getTriggerProps("a").onKeyDown({
                key: "ArrowRight",
                preventDefault: () => { },
            } as any)
        );
        expect(result.current.getTriggerProps("b")["aria-selected"]).toBe(true);
        expect(result.current.getTriggerProps("b").tabIndex).toBe(0);
    });

    test("ArrowLeft from first tab wraps to last when loop=true", () => {
        const result = setupBasicTabs({ loop: true });
        act(() =>
            result.current.getTriggerProps("a").onKeyDown({
                key: "ArrowLeft",
                preventDefault: () => { },
            } as any)
        );
        expect(result.current.getTriggerProps("c")["aria-selected"]).toBe(true);
    });

    test("ArrowLeft from first tab stays put when loop=false", () => {
        const result = setupBasicTabs({ loop: false });
        act(() =>
            result.current.getTriggerProps("a").onKeyDown({
                key: "ArrowLeft",
                preventDefault: () => { },
            } as any)
        );
        expect(result.current.getTriggerProps("a")["aria-selected"]).toBe(true);
    });

    test("Home jumps to first tab, End jumps to last", () => {
        const result = setupBasicTabs();
        act(() =>
            result.current.getTriggerProps("a").onKeyDown({ key: "End", preventDefault: () => { } } as any)
        );
        expect(result.current.getTriggerProps("c")["aria-selected"]).toBe(true);

        act(() =>
            result.current.getTriggerProps("c").onKeyDown({ key: "Home", preventDefault: () => { } } as any)
        );
        expect(result.current.getTriggerProps("a")["aria-selected"]).toBe(true);
    });

    test("skips disabled tabs when navigating", () => {
        const { result } = renderHook(() => useTabs({ defaultValue: "a" }));
        act(() => {
            result.current.registerTab("a", createRef<HTMLElement>(), false);
            result.current.registerTab("b", createRef<HTMLElement>(), true);
            result.current.registerTab("c", createRef<HTMLElement>(), false);
        });
        act(() =>
            result.current.getTriggerProps("a").onKeyDown({
                key: "ArrowRight",
                preventDefault: () => { },
            } as any)
        );
        expect(result.current.getTriggerProps("c")["aria-selected"]).toBe(true);
    });
});

describe("useTabs — manual activation mode", () => {
    test("ArrowRight moves focus but does not change selection", () => {
        const result = setupBasicTabs({ activationMode: "manual" });
        act(() =>
            result.current.getTriggerProps("a").onKeyDown({
                key: "ArrowRight",
                preventDefault: () => { },
            } as any)
        );
        expect(result.current.getTriggerProps("a")["aria-selected"]).toBe(true); // unchanged
        expect(result.current.getTriggerProps("b").tabIndex).toBe(0); // focus moved
    });

    test("Enter selects the focused tab in manual mode", () => {
        const result = setupBasicTabs({ activationMode: "manual" });
        act(() =>
            result.current.getTriggerProps("a").onKeyDown({
                key: "ArrowRight",
                preventDefault: () => { },
            } as any)
        );
        act(() =>
            result.current.getTriggerProps("b").onKeyDown({ key: "Enter", preventDefault: () => { } } as any)
        );
        expect(result.current.getTriggerProps("b")["aria-selected"]).toBe(true);
    });

    test("Space selects the focused tab in manual mode", () => {
        const result = setupBasicTabs({ activationMode: "manual" });
        act(() =>
            result.current.getTriggerProps("a").onKeyDown({
                key: "ArrowRight",
                preventDefault: () => { },
            } as any)
        );
        act(() =>
            result.current.getTriggerProps("b").onKeyDown({ key: " ", preventDefault: () => { } } as any)
        );
        expect(result.current.getTriggerProps("b")["aria-selected"]).toBe(true);
    });
});

describe("useTabs — orientation", () => {
    test("vertical orientation uses ArrowDown/ArrowUp instead of Left/Right", () => {
        const result = setupBasicTabs({ orientation: "vertical" });
        expect(result.current.listProps["aria-orientation"]).toBe("vertical");

        act(() =>
            result.current.getTriggerProps("a").onKeyDown({
                key: "ArrowDown",
                preventDefault: () => { },
            } as any)
        );
        expect(result.current.getTriggerProps("b")["aria-selected"]).toBe(true);
    });
});

describe("useTabs — RTL", () => {
    test("ArrowLeft moves to next tab when dir=rtl (mirrored)", () => {
        const result = setupBasicTabs({ dir: "rtl" });
        act(() =>
            result.current.getTriggerProps("a").onKeyDown({
                key: "ArrowLeft",
                preventDefault: () => { },
            } as any)
        );
        expect(result.current.getTriggerProps("b")["aria-selected"]).toBe(true);
    });
});

describe("useTabs — content props", () => {
    test("only selected panel is not hidden", () => {
        const result = setupBasicTabs();
        expect(result.current.getContentProps("a").hidden).toBe(false);
        expect(result.current.getContentProps("b").hidden).toBe(true);
    });

    test("trigger and content ids are linked via aria-controls / aria-labelledby / id", () => {
        const result = setupBasicTabs();
        const trigger = result.current.getTriggerProps("a");
        const content = result.current.getContentProps("a");
        expect(trigger["aria-controls"]).toBe(content.id);
        expect(content["aria-labelledby"]).toBe(trigger.id);
    });
});

describe("useTabs — dynamic tabs", () => {
    test("registering a new tab makes it navigable, unregistering removes it", () => {
        const result = setupBasicTabs();
        const dRef = createRef<HTMLElement>();
        let unregister: () => void;

        act(() => {
            unregister = result.current.registerTab("d", dRef, false);
        });
        act(() =>
            result.current.getTriggerProps("c").onKeyDown({
                key: "ArrowRight",
                preventDefault: () => { },
            } as any)
        );
        expect(result.current.getTriggerProps("d")["aria-selected"]).toBe(true);

        act(() => unregister());
        act(() =>
            result.current.getTriggerProps("c").onKeyDown({
                key: "ArrowRight",
                preventDefault: () => { },
            } as any)
        );
        // "d" no longer registered, wraps back to "a"
        expect(result.current.getTriggerProps("a")["aria-selected"]).toBe(true);
    });
});