# Create a Fresh Test App — Full Steps (tarball method, `@accessly-ui` scope)

```bash
rm -rf ~/workspace/acl-release-test
```

---

## 1. Build and pack all 4 packages

```bash
cd ~/workspace/accessible-component-library

pnpm --filter @accessly-ui/utils build
pnpm --filter @accessly-ui/primitives build
pnpm --filter @accessly-ui/react build

cd packages/utils && pnpm pack && cd ../..
cd packages/primitives && pnpm pack && cd ../..
cd packages/react && pnpm pack && cd ../..
cd packages/tailwind-preset && pnpm pack && cd ../..
```

> `tailwind-preset` has no build step but still needs `pnpm pack`.
> Confirm all 4 tarballs now exist:

```bash
ls packages/*/accessly-ui-*.tgz
```

You should see 4 files, e.g. `accessly-ui-react-1.0.0.tgz`, `accessly-ui-primitives-1.0.0.tgz`,
`accessly-ui-utils-1.0.0.tgz`, `accessly-ui-tailwind-preset-1.0.0.tgz`.

---

## 2. Scaffold the new app

```bash
cd ~/workspace
pnpm create vite@latest acl-release-test -- --template react-ts
cd acl-release-test
pnpm install
pnpm add -D @tailwindcss/vite
```

---

## 3. Pin workspace overrides (prevents the 404-against-real-npm bug)

`react`'s packed `package.json` lists `@accessly-ui/utils` / `@accessly-ui/primitives`
as real semver ranges (not `file:` paths), because `pnpm pack` converts
`workspace:*` on export. Without an override, pnpm tries to fetch those from the
real npm registry and 404s, since the scope was never published there.

Create `~/workspace/acl-release-test/pnpm-workspace.yaml`:

```yaml
overrides:
  '@accessly-ui/utils': 'file:../accessible-component-library/packages/utils/accessly-ui-utils-1.0.0.tgz'
  '@accessly-ui/primitives': 'file:../accessible-component-library/packages/primitives/accessly-ui-primitives-1.0.0.tgz'
  '@accessly-ui/react': 'file:../accessible-component-library/packages/react/accessly-ui-react-1.0.0.tgz'
  '@accessly-ui/tailwind-preset': 'file:../accessible-component-library/packages/tailwind-preset/accessly-ui-tailwind-preset-1.0.0.tgz'
```

(Match the exact filenames from `ls packages/*/accessly-ui-*.tgz` above — the
version numbers must line up exactly or the override silently fails to match.)

Do **not** put `overrides` under a `"pnpm"` key in `package.json` — pnpm 10+
ignores that location and only reads `pnpm-workspace.yaml`.

---

## 4. Install all 4 packages from the tarballs

```bash
cd ~/workspace/acl-release-test

pnpm add ~/workspace/accessible-component-library/packages/utils/accessly-ui-utils-1.0.0.tgz
pnpm add ~/workspace/accessible-component-library/packages/primitives/accessly-ui-primitives-1.0.0.tgz
pnpm add ~/workspace/accessible-component-library/packages/react/accessly-ui-react-1.0.0.tgz
pnpm add ~/workspace/accessible-component-library/packages/tailwind-preset/accessly-ui-tailwind-preset-1.0.0.tgz
```

Install all 4 explicitly — `react` alone won't pull `utils`/`primitives` correctly
from tarballs the way it would from the real registry.

Verify:

```bash
ls node_modules/@accessly-ui/
# expect: primitives  react  tailwind-preset  utils
```

---

## 5. Wire up Tailwind v4

**`src/index.css`:**

```css
@import 'tailwindcss';
@import '@accessly-ui/tailwind-preset/theme.css';
@source '../node_modules/@accessly-ui/react/dist/**/*.js';
```

**`vite.config.ts`:**

```ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
});
```

Don't add a `tailwind.config.js` with `content`/`presets` — v4's `@import` ignores
v3-style config files unless referenced with `@config`.

---

## 6. Add a typecheck script

**`package.json`:**

```json
"scripts": {
  "typecheck": "tsc --noEmit"
}
```

---

## 7. Build the test page

Wrap the app in the library's own providers and use real composed sub-components
(not raw `<h3>`/`<p>` tags). Minimal skeleton:

```tsx
import { ThemeProvider, ThemeToggle, ToastProvider } from '@accessly-ui/react';

export default function App() {
  return (
    <ThemeProvider defaultMode="system">
      <ToastProvider>
        <ThemeToggle />
        {/* one section per component below */}
      </ToastProvider>
    </ThemeProvider>
  );
}
```

For any component whose props don't typecheck, check the real `.d.ts` first:

```bash
cat node_modules/@accessly-ui/react/dist/<Component>/<Component>.d.ts
```

Don't guess the prop shape twice — read it once.

---

## 8. Run the checks

```bash
pnpm typecheck
pnpm dev
```

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

---

## 10. Re-running after a library change

Every loop below is a **fresh pack + reinstall**, not a patch — simplest to reason
about even though it repeats step 1/4.

```bash
# In the library
cd ~/workspace/accessible-component-library
pnpm --filter @accessly-ui/utils build && cd packages/utils && pnpm pack && cd ../..
pnpm --filter @accessly-ui/primitives build && cd packages/primitives && pnpm pack && cd ../..
pnpm --filter @accessly-ui/react build && cd packages/react && pnpm pack && cd ../..
cd packages/tailwind-preset && pnpm pack && cd ../..

# In the test app
cd ~/workspace/acl-release-test
pnpm add ../accessible-component-library/packages/utils/*.tgz --force
pnpm add ../accessible-component-library/packages/primitives/*.tgz --force
pnpm add ../accessible-component-library/packages/react/*.tgz --force
pnpm add ../accessible-component-library/packages/tailwind-preset/*.tgz --force
rm -rf node_modules/.vite

pnpm typecheck
pnpm dev
```

**If changes still don't show up** (pnpm skipped re-reading a same-version tarball):

```bash
pnpm remove @accessly-ui/react   # or whichever package is stale
pnpm store prune
pnpm add ../accessible-component-library/packages/react/*.tgz
```

**Better long-term fix:** bump the patch version (`1.0.0` → `1.0.1`) in the
changed package's `package.json` before every pack, and update the matching
line in `pnpm-workspace.yaml`. Then pnpm always treats it as new content and
`--force`/`remove`/`store prune` are never needed.
