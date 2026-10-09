import type { ThemeMode, ResolvedTheme } from './ThemeProvider';

export interface ThemeScriptOptions {
  storageKey?: string;
  defaultMode?: ThemeMode;
  enableSystem?: boolean;
  forcedTheme?: ResolvedTheme;
}

/** Returns JS source to inline in <head>. It must run before the page paints. */
export function getThemeScript({
  storageKey = 'antarip-theme',
  defaultMode,
  enableSystem = true,
  forcedTheme,
}: ThemeScriptOptions = {}): string {
  const d = defaultMode ?? (enableSystem ? 'system' : 'light');
  return `(function(){var f=${JSON.stringify(forcedTheme ?? null)},k=${JSON.stringify(
    storageKey,
  )},d=${JSON.stringify(d)},s=${enableSystem},m=null;try{m=localStorage.getItem(k)}catch(e){}
if(m!=='light'&&m!=='dark'&&m!=='system')m=d;
if(m==='system'&&!s)m=d==='system'?'light':d;
var t=f||(m==='system'?(matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'):m);
var r=document.documentElement;r.classList.remove('light','dark');r.classList.add(t);r.style.colorScheme=t;})();`;
}
