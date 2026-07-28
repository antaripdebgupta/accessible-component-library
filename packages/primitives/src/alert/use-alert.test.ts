import { describe, expect, it, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useAlert } from "./use-alert";

describe("useAlert", () => {
    it("returns default values and accessibility attributes", () => {
        const { result } = renderHook(() => useAlert());

        expect(result.current.visible).toBe(true);
        expect(result.current.closable).toBe(false);
        expect(result.current.alertProps.role).toBe("alert");
        expect(result.current.alertProps["aria-live"]).toBe("assertive");
        expect(result.current.alertProps["aria-atomic"]).toBe(true);
    });

    it("respects polite urgency", () => {
        const { result } = renderHook(() => useAlert({ urgency: "polite" }));

        expect(result.current.alertProps.role).toBe("alert");
        expect(result.current.alertProps["aria-live"]).toBe("polite");
        expect(result.current.alertProps["aria-atomic"]).toBe(true);
    });

    it("handles off urgency (no live region attributes)", () => {
        const { result } = renderHook(() => useAlert({ urgency: "off" }));

        expect(result.current.alertProps.role).toBeUndefined();
        expect(result.current.alertProps["aria-live"]).toBeUndefined();
        expect(result.current.alertProps["aria-atomic"]).toBeUndefined();
    });

    it("supports closable option", () => {
        const { result } = renderHook(() => useAlert({ closable: true }));

        expect(result.current.closable).toBe(true);
    });

    it("dismisses the alert and triggers onClose when calling close()", () => {
        const onClose = vi.fn();
        const { result } = renderHook(() => useAlert({ onClose }));

        expect(result.current.visible).toBe(true);

        act(() => {
            result.current.close();
        });

        expect(result.current.visible).toBe(false);
        expect(onClose).toHaveBeenCalledTimes(1);
    });
});