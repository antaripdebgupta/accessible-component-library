# Accessible Component Library

A production-grade, WCAG 2.2 AA component library built with React,
TypeScript, and Tailwind CSS — designed the way a real design-systems team
would build one: headless accessibility primitives, a styled consumer
layer, and a testing pipeline that combines automated and manual
verification.

## Packages

- `packages/utils` — shared hooks (focus trap, roving tabindex, controllable state)
- `packages/primitives` — headless, unstyled, ARIA-correct component logic
- `packages/react` — styled components built on the primitives
- `packages/tailwind-preset` — shared design tokens
- `apps/storybook` — component workshop and living documentation
- `e2e/playwright` — keyboard and accessibility-tree end-to-end tests

## Getting started

\`\`\`bash
pnpm install
pnpm dev          # starts Storybook
\`\`\`

## Scripts

| Command | Description |
|---|---|
| `pnpm dev` | Run Storybook locally |
| `pnpm build` | Build all packages |
| `pnpm lint` | ESLint (incl. jsx-a11y) |
| `pnpm typecheck` | TypeScript project references check |
| `pnpm test` | Unit tests (Vitest + jest-axe) |
| `pnpm test:e2e` | Playwright E2E + axe-core audits |
| `pnpm changeset` | Record a changeset for release |

## Accessibility conformance

Every component targets WCAG 2.2 AA and is verified with axe-core
(automated), Playwright keyboard-navigation tests, and manual screen reader
testing (NVDA, VoiceOver) for core components. See each component's
`.a11y.md` file for its specific accessibility contract, keyboard shortcuts,
and known limitations.

## Contributing

Run `pnpm changeset` when your PR changes public behavior. Accessibility
behavior changes (keyboard handling, ARIA attributes) are treated as at
least a minor version bump, even without a public API change.