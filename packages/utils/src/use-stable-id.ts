import { useId } from "react";

/** Wraps useId with a readable prefix, e.g. useStableId("dialog") -> "dialog-:r1:" */
export function useStableId(prefix: string): string {
  const id = useId();
  return `${prefix}-${id}`;
}