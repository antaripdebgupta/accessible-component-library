import { act, renderHook } from "@testing-library/react";
import { expect, test, vi } from "vitest";
import { useControllableState } from "./use-controllable-state";

test("uncontrolled mode updates internal state", () => {
  const { result } = renderHook(() => useControllableState({ defaultValue: "a" }));
  expect(result.current[0]).toBe("a");
  act(() => result.current[1]("b"));
  expect(result.current[0]).toBe("b");
});

test("controlled mode ignores internal state, calls onChange", () => {
  const onChange = vi.fn();
  const { result } = renderHook(() =>
    useControllableState({ value: "x", defaultValue: "a", onChange })
  );
  expect(result.current[0]).toBe("x");
  act(() => result.current[1]("y"));
  expect(onChange).toHaveBeenCalledWith("y");
  expect(result.current[0]).toBe("x"); // unchanged — parent controls it
});