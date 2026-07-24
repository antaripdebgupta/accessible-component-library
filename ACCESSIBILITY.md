# Accessibility

## Conformance target

This library targets **WCAG 2.2 Level AA** for every component. Each
component's specific conformance details, keyboard shortcuts, ARIA
attributes, and known limitations are documented in its colocated
`.a11y.md` file (e.g. `packages/react/src/Dialog/Dialog.a11y.md`).

## How we verify it

- **Automated**: axe-core via `@storybook/addon-a11y` (dev-time) and
  `@axe-core/playwright` (CI, every story/route). Critical and serious
  violations fail the build.
- **Interaction**: Storybook `play` functions and Playwright specs script
  real keyboard navigation per component.
- **Manual**: NVDA + Firefox and VoiceOver + Safari verification for the
  core components (Dialog, Menu, Combobox, Tabs, Data Table). Findings are
  recorded in each component's `.a11y.md`.

Automated tools catch a meaningful share of issues but not all of them —
manual verification is not optional for the core set.

## Known gaps

We document limitations honestly rather than claiming blanket compliance.
Check each component's `.a11y.md` "Known limitations" section before relying
on it in a context with strict accessibility requirements.

## Reporting an issue

Open a GitHub issue with:
1. Component name
2. Assistive technology + browser combination (if applicable)
3. Steps to reproduce
4. Expected vs. actual behavior

Accessibility bugs are treated as high priority and, per `CONTRIBUTING.md`,
any fix that changes keyboard/ARIA behavior ships as at least a minor
version bump.
