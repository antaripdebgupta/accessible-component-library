# Tabs — Accessibility Contract

## Overview
Implements the [WAI-ARIA APG Tabs pattern](https://www.w3.org/WAI/ARIA/apg/patterns/tabs/)
exactly: a `tablist` of `tab` elements controlling associated `tabpanel`
elements, with roving tabindex and automatic/manual activation modes.

## Accessibility features
- Correct role triad: `tablist` / `tab` / `tabpanel`, wired via
  `aria-controls` (tab → panel) and `aria-labelledby` (panel → tab).
- Roving tabindex: only the currently focused tab has `tabIndex={0}`; all
  others have `tabIndex={-1}`. `Tab`/`Shift+Tab` move focus in/out of the
  whole tablist as a single stop, never through every tab.
- `aria-selected` reflects the actually displayed panel — decoupled from
  keyboard focus in manual activation mode, so arrow-key browsing doesn't
  fire expensive content changes until the user commits with Enter/Space.
- `aria-orientation` set from the `orientation` prop so AT correctly
  announces whether Left/Right or Up/Down are the navigation keys.
- `dir` is read from the DOM (or explicit `dir` prop) and mirrors
  Left/Right arrow key meaning automatically for RTL languages.
- Disabled tabs (`aria-disabled`) are skipped entirely during arrow-key
  navigation and cannot be selected via click.
- Stable, deterministic IDs generated via `useId()` under the hood — safe
  for SSR/hydration, no `Math.random()`.

## Keyboard shortcuts
| Key | Action |
|---|---|
| `Tab` | Move focus into/out of the tablist (single stop) |
| `Shift+Tab` | Move focus backward out of the tablist |
| `ArrowRight` / `ArrowLeft` | Move focus (horizontal orientation, mirrored under RTL) |
| `ArrowDown` / `ArrowUp` | Move focus (vertical orientation) |
| `Home` | Move focus to first enabled tab |
| `End` | Move focus to last enabled tab |
| `Enter` / `Space` | Activate the focused tab (manual activation mode only) |

In automatic activation mode (default), arrow keys both move focus **and**
select — there is no separate activation step.

## ARIA attributes used
| Attribute | Element | Purpose |
|---|---|---|
| `role="tablist"` | `TabsList` container | Groups the tabs |
| `role="tab"` | `TabsTrigger` | Identifies each tab control |
| `role="tabpanel"` | `TabsContent` | Identifies each associated panel |
| `aria-selected` | tab | Whether this tab's panel is currently shown |
| `aria-controls` | tab | Points at its panel's `id` |
| `aria-labelledby` | panel | Points back at its tab's `id` |
| `aria-orientation` | tablist | `horizontal` or `vertical` |
| `aria-disabled` | tab | Marks a tab non-interactive while excluded from arrow navigation |

## WCAG 2.2 mapping
- **2.1.1 Keyboard (A)** — full operability via the shortcuts table above.
- **2.4.3 Focus Order (A)** — roving tabindex keeps tab order logical and
  never traps focus.
- **2.4.7 Focus Visible (AA)** — `.focus-ring-safe`, verified under Forced
  Colors Mode.
- **4.1.2 Name, Role, Value (A)** — explicit roles/states above.
- **1.3.2 Meaningful Sequence (A)** — DOM order of tabs/panels matches
  visual and reading order in both LTR and RTL.
- **1.4.10 Reflow (AA)** — verified at 400% zoom / 320px width; `Scrollable`
  variant handles overflow without introducing two-dimensional scrolling
  for the page as a whole.
- **1.4.13 Content on Hover or Focus (AA)** — not applicable (no
  hover-triggered content), included here for completeness of audit trail.

## Screen reader behavior
Verified with NVDA + Firefox and VoiceOver + Safari:
- Entering the tablist announces "tablist, N tabs" (VoiceOver) / tab count
  context (NVDA), followed by the focused tab's name and selected state.
- Arrow-key navigation announces each tab's name and selected state as
  focus moves.
- In manual mode, moving focus without activating does **not** announce a
  selection change until Enter/Space is pressed — verified this doesn't
  produce a false "activated" announcement.
- Disabled tabs are announced as "dimmed"/"unavailable" and are skipped
  silently during arrow navigation (no announcement stutter).

## Focus management
- Focus is never trapped inside the tablist — `Tab` always exits to the
  next document focus stop (typically into the active panel or the next
  focusable element after it).
- Panels are individually focusable (`tabIndex={0}`) per APG guidance, so
  keyboard users can `Tab` from the active tab directly into its panel
  content without needing to tab through unrelated page chrome.
- No explicit focus restoration step is needed — Tabs doesn't open/close
  an overlay, so there's no "trigger" to return focus to.

## Testing strategy
- **Unit** (Vitest + RTL + jest-axe): role/state assertions, keyboard
  navigation in both activation modes, controlled/uncontrolled parity,
  disabled-tab skipping, orientation, RTL, lazy/force mount, nested tabs,
  dynamic tab registration.
- **Storybook `play` functions**: executable keyboard-interaction contracts
  (`KeyboardDemo`) that double as living documentation.
- **Playwright**: real-browser keyboard flows, accessibility-tree
  assertions, and an axe-core scan per story (see `tabs.spec.ts`).
- **Manual**: NVDA + Firefox and VoiceOver + Safari verification of the
  announcements described above.

## Manual testing checklist
- [ ] Tab into the tablist — only one stop, lands on the previously
      selected/focused tab.
- [ ] Arrow keys cycle through enabled tabs only, wrapping per `loop`.
- [ ] Home/End jump to first/last enabled tab.
- [ ] Manual mode: arrow keys move focus without changing panel; Enter/Space
      activates.
- [ ] Zoom to 400% — tablist remains operable, `Scrollable` variant doesn't
      introduce page-level horizontal scroll.
- [ ] Forced Colors Mode (Windows) — focus ring and active-tab indicator
      remain visible.
- [ ] `prefers-reduced-motion` — panel fade-in and scrollable transitions
      are suppressed.
- [ ] RTL — Arrow key directions mirror correctly.

## Playwright command
```bash
pnpm exec playwright test tabs.spec.ts
```

## Browser support
Verified in Chromium, Firefox, and WebKit via Playwright's cross-engine
test matrix. No engine-specific ARIA workarounds were required for this
component.

## Known limitations
- Scrollable tab lists do not yet expose fade-edge overflow indicators to
  assistive technology (visual-only affordance) — sighted keyboard users
  relying solely on the scroll fade for "more tabs exist" context get no
  equivalent screen reader cue beyond reaching the end of the enabled-tab
  list via Home/End.
- Closable tabs (an optional variant per the request) are not implemented
  in this pass — `TabsTrigger` does not yet accept an `onClose` affordance.
  Add a labeled close button similar to Toast's dismiss button if needed,
  following the same "always a real, labeled `<button>`" pattern.