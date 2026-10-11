# Local Testing Guide — accessible-component-library

This guide walks through creating a standalone test app to verify `@antarip/primitives`,
`@antarip/react`, and `@antarip/tailwind-preset` before publishing a release. Use this
instead of testing only inside Storybook — Storybook tests components in isolation,
this tests them the way a real consumer will actually install and use them.

## Why a separate test app

Storybook stories run against your source code directly. They don't catch:

- Packaging bugs (wrong `exports` field, missing files in the npm package, broken `main`/`types` paths)
- Peer dependency issues
- Real install/import behavior as a consumer would experience it
- Tailwind config issues (content scanning, preset wiring, dark mode)

A separate app, installing your library the same way an npm package would be installed,
catches all of this.

---

## 1. Build and pack the library

From the library repo root:

```bash
cd ~/workspace/accessible-component-library

pnpm --filter @antarip/primitives build
pnpm --filter @antarip/react build

cd packages/primitives && pnpm pack && cd ../..
cd packages/react && pnpm pack && cd ../..
cd packages/tailwind-preset && pnpm pack && cd ../..
```

> `@antarip/tailwind-preset` has no build step — it ships `theme.css` and `tokens.js`
> directly — but it still needs to be **packed** every time you change it. This is easy
> to forget since it's not grouped with the build step mentally.

Each `pnpm pack` creates a `.tgz` in that package's folder, e.g.:

```
packages/primitives/antarip-primitives-1.0.0.tgz
packages/react/antarip-react-2.0.0.tgz
packages/tailwind-preset/antarip-tailwind-preset-1.0.0.tgz
```

Note the exact filenames — each package can be on a different version.

---

## 2. Scaffold the test app

Create it **outside** the monorepo, as a sibling folder:

```bash
cd ~/workspace
pnpm create vite@latest acl-release-test -- --template react-ts
cd acl-release-test
pnpm install
pnpm add -D @tailwindcss/vite
```

---

## 3. Install the library from the tarballs

Don't use `file:` links — a `file:` reference from outside the monorepo can't resolve
your packages' internal `workspace:*` dependencies. Install from the packed tarballs
instead, which is also closer to the real publish experience:

```bash
cd ~/workspace/acl-release-test

pnpm add ~/workspace/accessible-component-library/packages/primitives/antarip-primitives-1.0.0.tgz
pnpm add ~/workspace/accessible-component-library/packages/react/antarip-react-2.0.0.tgz
pnpm add ~/workspace/accessible-component-library/packages/tailwind-preset/antarip-tailwind-preset-1.0.0.tgz
```

(Or use a glob to skip typing exact filenames: `pnpm add ../accessible-component-library/packages/react/*.tgz`)

---

## 4. Wire up Tailwind v4

**`src/index.css`:**

```css
@import 'tailwindcss';
@import '@antarip/tailwind-preset/theme.css';
@source '../node_modules/@antarip/react/dist/**/*.js';
```

`@source` is Tailwind v4's replacement for the old `content: [...]` array — it tells
Tailwind to also scan your library's compiled JS for class names, otherwise none of
your component styles will generate.

**`vite.config.ts`:**

```ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
});
```

A `tailwind.config.js` with `content`/`presets` is **v3 syntax** and is silently ignored
by `@import "tailwindcss"` (v4) unless referenced with `@config`. Don't mix the two —
use the CSS-first `@import`/`@source` approach above.

---

## 5. Add a typecheck script

Vite's scaffold doesn't include one by default.

**`package.json`:**

```json
"scripts": {
  "typecheck": "tsc --noEmit"
}
```

---

## 6. Add a theme toggle

Tests that dark/light/system mode actually works end-to-end, not just in isolated CSS.

```tsx
import { useState, useEffect } from 'react';

function ThemeToggle() {
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('system');

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('light', 'dark');
    if (theme !== 'system') root.classList.add(theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  return (
    <select value={theme} onChange={(e) => setTheme(e.target.value as any)}>
      <option value="system">System</option>
      <option value="light">Light</option>
      <option value="dark">Dark</option>
    </select>
  );
}
```

If the library exports its own `ThemeProvider`/`ThemeToggle`, use those instead and wrap
the app in `<ThemeProvider defaultMode="system">`.

---

## 7. Build the test page

One page, one section per component, each using the component the same way a real
consumer would — including its proper composed sub-components (e.g. `Dialog` uses
`DialogHeader`/`DialogTitle`/`DialogBody`/`DialogFooter`, not raw `<h3>`/`<p>` tags).
Reference the component's real `.d.ts` files under `node_modules/@antarip/react/dist/`
if a prop doesn't typecheck — don't guess twice.

Wrap the whole app in `<ToastProvider>` (and `<ThemeProvider>` if used) since several
components depend on that context.

---

## 8. Run the checks

```bash
pnpm typecheck
pnpm dev
```

Fix any type errors against the real `.d.ts` files before moving to manual testing.

---

## 9. Manual test checklist (per component)

| Check           | How                                                    |
| --------------- | ------------------------------------------------------ |
| Visual — light  | Default page load                                      |
| Visual — dark   | Toggle to Dark                                         |
| Visual — system | Toggle to System, flip OS theme, confirm it follows    |
| Mouse           | Click every interactive element                        |
| Keyboard-only   | Tab from top to bottom — no traps, no skipped elements |
| Screen reader   | NVDA + Firefox pass                                    |
| RTL             | Add `dir="rtl"` to `<html>`, re-check layout           |

Repeat for all components before treating a release as ready.

---

## 10. Updating the test app after a library change

Every time you change library source, repeat this loop — pnpm does **not** auto-detect
tarball content changes if the version number stays the same.

```bash
# In the library repo
cd ~/workspace/accessible-component-library
pnpm --filter @antarip/primitives build && cd packages/primitives && pnpm pack && cd ../..
pnpm --filter @antarip/react build && cd packages/react && pnpm pack && cd ../..
cd packages/tailwind-preset && pnpm pack && cd ../..

# In the test app
cd ~/workspace/acl-release-test
pnpm add ../accessible-component-library/packages/primitives/*.tgz --force
pnpm add ../accessible-component-library/packages/react/*.tgz --force
pnpm add ../accessible-component-library/packages/tailwind-preset/*.tgz --force

rm -rf node_modules/.vite
pnpm dev
```

**If changes still don't show up** (same package version reused, pnpm skips re-reading
the tarball):

```bash
pnpm remove @antarip/tailwind-preset  # or whichever package is stale
pnpm store prune
pnpm add ../accessible-component-library/packages/tailwind-preset/*.tgz
```

**To avoid this entirely:** bump the patch version (`1.0.0` → `1.0.1`) in the changed
package's `package.json` before every pack — pnpm then always treats it as new content
and `--force` is never needed.

---

## Quick reference — full update + verify loop

```bash
cd ~/workspace/accessible-component-library
pnpm --filter @antarip/primitives build && cd packages/primitives && pnpm pack && cd ../..
pnpm --filter @antarip/react build && cd packages/react && pnpm pack && cd ../..
cd packages/tailwind-preset && pnpm pack && cd ../..

cd ~/workspace/acl-release-test
pnpm add ../accessible-component-library/packages/primitives/*.tgz --force
pnpm add ../accessible-component-library/packages/react/*.tgz --force
pnpm add ../accessible-component-library/packages/tailwind-preset/*.tgz --force
rm -rf node_modules/.vite

pnpm typecheck
pnpm dev
```
