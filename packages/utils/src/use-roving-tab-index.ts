import { useState, useCallback, type RefObject } from "react";

export function useRovingTabIndex({
  itemRefs,
  orientation = "vertical",
}: {
  itemRefs: RefObject<(HTMLElement | null)[]>;
  orientation?: "vertical" | "horizontal";
}) {
  const [activeIndex, setActiveIndex] = useState(0);

  const getTabIndex = useCallback((index: number) => (index === activeIndex ? 0 : -1), [activeIndex]);

  const onKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      const items = itemRefs.current ?? [];
      if (items.length === 0) return;

      const nextKey = orientation === "vertical" ? "ArrowDown" : "ArrowRight";
      const prevKey = orientation === "vertical" ? "ArrowUp" : "ArrowLeft";

      let next = activeIndex;
      if (e.key === nextKey) next = (activeIndex + 1) % items.length;
      else if (e.key === prevKey) next = (activeIndex - 1 + items.length) % items.length;
      else if (e.key === "Home") next = 0;
      else if (e.key === "End") next = items.length - 1;
      else return;

      e.preventDefault();
      setActiveIndex(next);
      items[next]?.focus();
    },
    [activeIndex, itemRefs, orientation]
  );

  return { activeIndex, setActiveIndex, getTabIndex, onKeyDown };
}