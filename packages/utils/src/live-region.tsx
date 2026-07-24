import { createContext, useContext, useRef, useState, useCallback, type ReactNode } from "react";

type Announce = (message: string, politeness?: "polite" | "assertive") => void;
const LiveRegionContext = createContext<Announce | null>(null);

export function LiveRegionProvider({ children }: { children: ReactNode }) {
  const [polite, setPolite] = useState("");
  const [assertive, setAssertive] = useState("");
  const clearTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const announce = useCallback<Announce>((message, politeness = "polite") => {
    clearTimeout(clearTimer.current);
    if (politeness === "assertive") setAssertive(message);
    else setPolite(message);
    // Clear after announcement so the same message can be re-announced later.
    clearTimer.current = setTimeout(() => {
      politeness === "assertive" ? setAssertive("") : setPolite("");
    }, 1000);
  }, []);

  return (
    <LiveRegionContext.Provider value={announce}>
      {children}
      <div aria-live="polite" role="status" style={visuallyHidden}>{polite}</div>
      <div aria-live="assertive" role="alert" style={visuallyHidden}>{assertive}</div>
    </LiveRegionContext.Provider>
  );
}

export function useAnnounce(): Announce {
  const ctx = useContext(LiveRegionContext);
  if (!ctx) throw new Error("useAnnounce must be used within a LiveRegionProvider");
  return ctx;
}

const visuallyHidden: React.CSSProperties = {
  position: "absolute", width: 1, height: 1, padding: 0, margin: -1,
  overflow: "hidden", clip: "rect(0,0,0,0)", whiteSpace: "nowrap", border: 0,
};