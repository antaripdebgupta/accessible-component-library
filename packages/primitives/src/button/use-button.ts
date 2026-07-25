import type { ButtonHTMLAttributes } from "react";

export interface UseButtonOptions {
  disabled?: boolean;
  loading?: boolean;
}

/**
 * Headless button behavior. Returns props to spread onto a native <button>.
 *
 * Design decision: `disabled` uses `aria-disabled` instead of the native
 * `disabled` attribute so the element stays focusable and can still receive
 * a tooltip/announcement explaining *why* it's disabled. Click handling is
 * suppressed in JS instead. See Button.a11y.md "Known limitations" for the
 * trade-off this implies (no automatic removal from tab order).
 */
export function useButton({ disabled, loading }: UseButtonOptions) {
  const isDisabled = disabled || loading;

  const buttonProps: ButtonHTMLAttributes<HTMLButtonElement> = {
    type: "button",
    "aria-disabled": isDisabled || undefined,
    "aria-busy": loading || undefined,
    onClick: (e) => {
      if (isDisabled) {
        e.preventDefault();
        e.stopPropagation();
      }
    },
  };

  return { buttonProps, isDisabled };
}
