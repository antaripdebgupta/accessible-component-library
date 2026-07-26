# Alert — Accessibility Contract

## Overview
Static, always-visible alert for information the user must know immediately
(e.g. form submission errors). Not for transient notifications — use Toast
for those.

## Accessibility features
- `role="alert"` is an implicit assertive live region — the browser
  announces it as soon as it's added to the DOM, with no extra wiring.
- `urgency` prop lets you downgrade to `aria-live="polite"` for less urgent
  cases while keeping the `alert` role, or turn live-region behavior off
  entirely for alerts rendered as static page content on load (nothing to
  "announce" if it was already there before the page finished loading).
- Icon is `aria-hidden` — meaning is carried by the `variant`-driven color
  AND the text content together, never color alone (WCAG 1.4.1).
- Optional `closable` renders a real `<button aria-label="Close alert">` —
  icon-only, but always programmatically labeled, never relying on the ✕
  glyph alone for its accessible name.

## Keyboard shortcuts
None — this is not an interactive widget.

## ARIA attributes used
| Attribute | Element | Purpose |
|---|---|---|
| `role="alert"` | container | Implicit assertive live region |
| `aria-live` | container | Overridable urgency (polite/assertive/off) |
| `aria-atomic="true"` | container | Announces the whole message, not just the diff |

## WCAG criteria satisfied
- **4.1.3 Status Messages (AA)** — announced without requiring focus to move.
- **1.4.1 Use of Color (A)** — icon + text convey meaning, not color alone.

## Known limitations
- Overusing `role="alert"` for non-urgent info is a common misuse — this
  component does not stop a consumer from doing that; it's a documented
  usage guideline, not an enforced one.
- No built-in dismiss button — add one manually if the alert should be
  closeable; it isn't auto-focus-managed on dismiss.

### E2E
pnpm exec playwright test \
  -c e2e/playwright/playwright.config.ts \
  e2e/playwright/tests/alert.spec.ts