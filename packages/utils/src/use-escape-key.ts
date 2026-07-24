import { useEffect } from "react";

// Module-level stack shared across all instances so only the topmost layer responds to Escape.
const layerStack: symbol[] = [];

export function useEscapeKey(handler: () => void, { active }: { active: boolean }) {
  useEffect(() => {
    if (!active) return;
    const id = Symbol();
    layerStack.push(id);

    function onKeyDown(e: KeyboardEvent) {
      if (e.key !== "Escape") return;
      if (layerStack[layerStack.length - 1] !== id) return; // not the topmost layer
      handler();
    }

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      const i = layerStack.indexOf(id);
      if (i > -1) layerStack.splice(i, 1);
    };
  }, [active, handler]);
}