# Contributing

## Setup

\`\`\`bash
pnpm install
pnpm dev
\`\`\`

## Before opening a PR

- [ ] `pnpm lint` passes (includes `eslint-plugin-jsx-a11y`)
- [ ] `pnpm typecheck` passes
- [ ] `pnpm test` passes (unit + jest-axe)
- [ ] `pnpm test:e2e` passes (Playwright + axe-core)
- [ ] New/changed component has a `.a11y.md` accessibility contract
- [ ] `pnpm changeset` added describing the change

## Versioning policy

This project follows semver via Changesets, with one addition specific to
accessibility:

- A change to **keyboard behavior, focus management, or ARIA
  attributes/roles** is at minimum a **minor** version bump — even if the
  public TypeScript prop API is unchanged. Accessibility behavior is part of
  the public contract.
- Breaking prop API changes are a **major** bump and should ship with a
  codemod where feasible.
- Visual/styling-only tweaks are a **patch**.

## Code style

- Headless logic goes in `packages/primitives`; visual styling goes in
  `packages/react`. Don't put Tailwind classes in primitives.
- Reuse shared hooks from `packages/utils` (focus trap, roving tabindex,
  etc.) — don't reimplement per component.
- Every interactive component needs a Storybook `play` function testing its
  keyboard flow, not just a visual story.

## Reporting an accessibility bug

See `ACCESSIBILITY.md` for how to file one.
