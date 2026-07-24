import { useState, useEffect } from "react";

export function useDirection(): "ltr" | "rtl" {
  const [dir, setDir] = useState<"ltr" | "rtl">(
    () => (document.documentElement.dir === "rtl" ? "rtl" : "ltr")
  );

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setDir(document.documentElement.dir === "rtl" ? "rtl" : "ltr");
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["dir"] });
    return () => observer.disconnect();
  }, []);

  return dir;
}