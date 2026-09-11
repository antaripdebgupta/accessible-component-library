# Testing Philosophy

Layered, not redundant — each layer catches what the others can't:

1. **Unit (Vitest + RTL + jest-axe)** — fast, catches regressions in hook
   logic and basic ARIA wiring before anything else runs.
2. **Storybook play functions** — executable keyboard-interaction docs,
   double as living examples for consumers.
3. **Storybook a11y addon** — live axe-core feedback during development.
4. **Playwright e2e** — real browser engines, real keyboard events, real
   accessibility tree. Catches engine-specific bugs unit tests can't.
5. **Manual screen reader testing** — NVDA+Firefox, VoiceOver+Safari for
   the 5 most complex components. Automated tools catch ~30-50% of real
   issues; this catches the rest.

We do not treat automated 0-violations as proof of accessibility — it's
proof of the absence of _detectable_ violations. Manual testing findings
are recorded in each component's `.a11y.md`.
