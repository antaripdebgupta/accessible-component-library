# Project Setup Guide

Complete instructions for getting this repo running locally, from a fresh
clone through to a fully passing test suite. Covers both direct package
commands and Turbo-orchestrated equivalents.

---

## 1. Prerequisites

| Tool    | Version                          | Check           |
| ------- | -------------------------------- | --------------- |
| Node.js | 20+ (24 recommended, matches CI) | `node -v`       |
| pnpm    | 11.x                             | `pnpm -v`       |
| Git     | any recent                       | `git --version` |

Install pnpm if missing:

```bash
npm install -g pnpm
```

---

## 2. Clone and install

```bash
git clone <repo-url> accessible-component-library
cd accessible-component-library
pnpm install
```

This installs dependencies for every workspace package (`packages/*`,
`apps/*`, `e2e/*`) in one pass via pnpm workspaces, and triggers `husky`
git hooks setup via the root `prepare` script.

**Verify the workspace is linked correctly:**

```bash
ls -la packages/react/node_modules/@acl/primitives
```

Should show a symlink pointing to `../../../primitives`. If missing, rerun
`pnpm install` from the repo root (not from inside a package folder).

---

## 3. Build everything once

Before running Storybook or tests, build every package so cross-package
type declarations and compiled output exist.

**Turbo (recommended — parallelizes and caches):**

```bash
pnpm build
```

This runs `turbo run build`, which builds `packages/utils` →
`packages/primitives` → `packages/tailwind-preset` → `packages/react` in
correct dependency order automatically (Turbo reads each package's
`dependsOn: ["^build"]` config).

**Manual equivalent (build order matters — do it in this sequence):**

```bash
pnpm --filter @acl/utils build
pnpm --filter @acl/primitives build
pnpm --filter @acl/tailwind-preset build   # if it has a build step; otherwise skip
pnpm --filter @acl/react build
```

---

## 4. Run Storybook (local dev)

**Turbo:**

```bash
pnpm dev
```

Runs `turbo run storybook`, starting Storybook at `http://localhost:6006`.

**Manual equivalent:**

```bash
pnpm --filter @acl/storybook storybook
```

If you're actively editing `packages/primitives` or `packages/utils` while
Storybook is running, rebuild them in a separate terminal so changes are
picked up (Storybook doesn't watch source outside `packages/react` by
default):

```bash
pnpm --filter @acl/primitives dev   # tsc --watch, if configured
```

Otherwise, just rerun `pnpm build` after each change to those packages and
refresh the browser.

---

## 5. Linting and type checking

**Turbo (runs across every package):**

```bash
pnpm lint
pnpm typecheck
```

**Manual, single package:**

```bash
pnpm --filter @acl/react lint
pnpm --filter @acl/react typecheck
```

Both should return clean before opening a PR — `lint` includes
`eslint-plugin-jsx-a11y`, so accessibility anti-patterns are caught at
write-time, not just at test-time.

---

## 6. Unit tests (Vitest + Testing Library + jest-axe)

**Turbo (all packages):**

```bash
pnpm test
```

Runs `turbo run test`, executing Vitest in `@acl/utils`, `@acl/primitives`,
and `@acl/react` in parallel with caching.

**Manual, single package:**

```bash
pnpm --filter @acl/primitives test
pnpm --filter @acl/react test
```

**Single test file (fastest iteration loop while developing):**

```bash
pnpm --filter @acl/react exec vitest run src/Button/Button.test.tsx
```

**Watch mode (reruns on save):**

```bash
pnpm --filter @acl/react exec vitest
```

**With coverage:**

```bash
pnpm --filter @acl/react exec vitest run --coverage
```

---

## 7. Storybook interaction tests (`play` functions, headless)

Requires a built Storybook static output first.

```bash
pnpm --filter @acl/storybook build-storybook
pnpm --filter @acl/storybook test-storybook
```

This headlessly runs every component's `play` function (keyboard
interaction scripts) via Playwright under the hood, across all stories at
once.

---

## 8. End-to-end tests (Playwright + axe-core)

**Turbo (all e2e specs):**

```bash
pnpm test:e2e
```

Runs `turbo run test:e2e`.

**Manual, full suite:**

```bash
pnpm exec playwright test -c e2e/playwright/playwright.config.ts
```

**Manual, single spec file (fastest iteration loop):**

```bash
pnpm exec playwright test \
  -c e2e/playwright/playwright.config.ts \
  e2e/playwright/tests/button.spec.ts
```

**Single spec, single browser (fastest possible loop):**

```bash
pnpm exec playwright test \
  -c e2e/playwright/playwright.config.ts \
  e2e/playwright/tests/button.spec.ts \
  --project=chromium
```

**Debug mode (opens Playwright Inspector, steps through the test live):**

```bash
pnpm exec playwright test \
  -c e2e/playwright/playwright.config.ts \
  e2e/playwright/tests/button.spec.ts \
  --debug
```

**View the HTML report after a run:**

```bash
pnpm exec playwright show-report
```

**First-time Playwright browser install (if not already installed):**

```bash
pnpm exec playwright install --with-deps
```

Note: Playwright's `webServer` config in `playwright.config.ts` typically
auto-starts Storybook for you — confirm this before manually starting
`pnpm dev` in parallel, to avoid a port conflict on `6006`.

---

## 9. Full verification pass (what CI actually runs)

Run this full sequence before opening a PR to catch everything CI will
catch, locally:

```bash
pnpm install --frozen-lockfile
pnpm build
pnpm lint
pnpm typecheck
pnpm test
pnpm --filter @acl/storybook build-storybook
pnpm --filter @acl/storybook test-storybook
pnpm test:e2e
```

If every step above is green, your branch matches CI's `quality`,
`unit-test`, `build`, `storybook`, and `e2e` jobs.

---

## 10. Common issues

**`Cannot find module '@acl/primitives'`**
The workspace symlink or build output is missing/stale. Fix:

```bash
rm -rf packages/*/dist
pnpm install
pnpm build
```

**Storybook shows unstyled components (no Tailwind)**
Confirm `apps/storybook/.storybook/preview.ts` imports
`packages/react/src/styles.css`, and that `apps/storybook/tailwind.config.js`
presets from `@acl/tailwind-preset` with a `content` glob covering
`packages/react/src/**/*.{ts,tsx}`.

**`window.matchMedia is not a function` in Vitest**
Confirm both `packages/primitives/vitest.setup.ts` and
`packages/react/vitest.setup.ts` include the `matchMedia` polyfill (see
those files — required by `useReducedMotion`).

**Playwright `wait-on`/`http-server` fails with `EBADDEVENGINES` in CI**
Use `pnpm dlx <package>` instead of `npx <package>` anywhere in CI scripts
or local one-offs — this repo's `devEngines` field forbids npm-based
package execution.

**A single component's tests hang or time out**
Check for a missing `await` around `userEvent` calls, or a
`act(...)` warning in the console — these usually indicate a state update
happening outside the awaited interaction.

---

## Quick reference — Turbo vs manual

| Task                        | Turbo (root)          | Manual (single package)                                            |
| --------------------------- | --------------------- | ------------------------------------------------------------------ |
| Install                     | `pnpm install`        | —                                                                  |
| Build all                   | `pnpm build`          | `pnpm --filter <pkg> build`                                        |
| Dev/Storybook               | `pnpm dev`            | `pnpm --filter @acl/storybook storybook`                           |
| Lint                        | `pnpm lint`           | `pnpm --filter <pkg> lint`                                         |
| Typecheck                   | `pnpm typecheck`      | `pnpm --filter <pkg> typecheck`                                    |
| Unit tests                  | `pnpm test`           | `pnpm --filter <pkg> test`                                         |
| E2E tests                   | `pnpm test:e2e`       | `pnpm exec playwright test -c e2e/playwright/playwright.config.ts` |
| Storybook interaction tests | —                     | `pnpm --filter @acl/storybook test-storybook`                      |
| Changeset                   | `pnpm changeset`      | —                                                                  |
| Contrast check              | `pnpm check-contrast` | —                                                                  |
| Bundle size                 | `pnpm size`           | —                                                                  |
