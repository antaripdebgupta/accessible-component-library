import { useRef, useCallback } from "react";

export function useTypeahead({
  labels,
  onMatch,
}: {
  labels: string[];
  onMatch: (index: number) => void;
}) {
  const buffer = useRef("");
  const timeout = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const onKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key.length !== 1) return;
      buffer.current += e.key.toLowerCase();
      clearTimeout(timeout.current);
      timeout.current = setTimeout(() => (buffer.current = ""), 500);

      const match = labels.findIndex((label) => label.toLowerCase().startsWith(buffer.current));
      if (match > -1) onMatch(match);
    },
    [labels, onMatch]
  );

  return { onKeyDown };
}