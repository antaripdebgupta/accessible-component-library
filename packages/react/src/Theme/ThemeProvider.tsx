import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

export type ThemeMode = 'light' | 'dark' | 'system';
export type ResolvedTheme = 'light' | 'dark';

export interface ThemeProviderProps {
  children: ReactNode;
  /** Used when nothing valid is stored. Default: "system" (or "light" if enableSystem is false). */
  defaultMode?: ThemeMode;
  storageKey?: string;
  /** false removes the "system" option (light/dark only). Default true. */
  enableSystem?: boolean;
  /** Locks the whole app to one theme (light-only / dark-only products). */
  forcedTheme?: ResolvedTheme;
  /** Stop color transitions for one frame while switching. Default true. */
  disableTransitionOnChange?: boolean;
}

export interface ThemeContextValue {
  /** What the user chose. */
  mode: ThemeMode;
  /** What is actually shown. */
  resolvedTheme: ResolvedTheme;
  /** What the OS prefers right now. */
  systemTheme: ResolvedTheme;
  setMode: (mode: ThemeMode) => void;
  /** True when forcedTheme is set: hide your toggle. */
  forced: boolean;
  enableSystem: boolean;
  /** False during SSR and the first client render (avoid hydration mismatches in toggles). */
  ready: boolean;
}

const MEDIA = '(prefers-color-scheme: dark)';
const isMode = (v: unknown): v is ThemeMode => v === 'light' || v === 'dark' || v === 'system';
const useIsoLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

function readStored(key: string): ThemeMode | null {
  try {
    const v = window.localStorage.getItem(key);
    return isMode(v) ? v : null;
  } catch {
    return null;
  }
}

function getSystemTheme(): ResolvedTheme {
  return typeof window !== 'undefined' && window.matchMedia(MEDIA).matches ? 'dark' : 'light';
}

function applyTheme(theme: ResolvedTheme, suppressTransitions: boolean) {
  const root = document.documentElement;
  let style: HTMLStyleElement | undefined;
  if (suppressTransitions) {
    style = document.createElement('style');
    style.textContent = '*,*::before,*::after{transition:none!important}';
    document.head.appendChild(style);
  }
  root.classList.remove('light', 'dark');
  root.classList.add(theme);
  root.style.colorScheme = theme;
  if (style) {
    void window.getComputedStyle(document.body).opacity; // force a style flush
    setTimeout(() => style!.remove(), 1);
  }
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({
  children,
  defaultMode,
  storageKey = 'antarip-theme',
  enableSystem = true,
  forcedTheme,
  disableTransitionOnChange = true,
}: ThemeProviderProps) {
  const fallback: ThemeMode = defaultMode ?? (enableSystem ? 'system' : 'light');

  const normalize = useCallback(
    (m: ThemeMode | null): ThemeMode => {
      const v = m ?? fallback;
      if (v === 'system' && !enableSystem) return fallback === 'system' ? 'light' : fallback;
      return v;
    },
    [fallback, enableSystem],
  );

  const [mode, setModeState] = useState<ThemeMode>(() =>
    typeof window === 'undefined' ? normalize(null) : normalize(readStored(storageKey)),
  );
  const [systemTheme, setSystemTheme] = useState<ResolvedTheme>(getSystemTheme);
  const [ready, setReady] = useState(false);

  // Live OS changes (only matter when mode === "system", but cheap to always track)
  useEffect(() => {
    const mql = window.matchMedia(MEDIA);
    const onChange = (e?: MediaQueryListEvent) => {
      const matches = e ? e.matches : mql.matches;
      setSystemTheme(matches ? 'dark' : 'light');
    };
    onChange();
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  }, []);

  // Other tabs
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key !== null && e.key !== storageKey) return;
      setModeState(normalize(isMode(e.newValue) ? e.newValue : null));
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [storageKey, normalize]);

  const resolvedTheme: ResolvedTheme = forcedTheme ?? (mode === 'system' ? systemTheme : mode);

  // Apply to <html>. The inline script already did this for first paint.
  useIsoLayoutEffect(() => {
    applyTheme(resolvedTheme, disableTransitionOnChange && ready);
  }, [resolvedTheme, disableTransitionOnChange, ready]);

  useEffect(() => setReady(true), []);

  const setMode = useCallback(
    (next: ThemeMode) => {
      const value = normalize(next);
      setModeState(value);
      try {
        window.localStorage.setItem(storageKey, value);
      } catch {
        /* storage blocked: the choice still works for this session */
      }
    },
    [normalize, storageKey],
  );

  const value = useMemo<ThemeContextValue>(
    () => ({
      mode,
      resolvedTheme,
      systemTheme,
      setMode,
      forced: forcedTheme !== undefined,
      enableSystem,
      ready,
    }),
    [mode, resolvedTheme, systemTheme, setMode, forcedTheme, enableSystem, ready],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within <ThemeProvider>');
  return ctx;
}
