# Accordion — Accessibility Contract

## Overview

Implements the WAI-ARIA APG Accordion pattern: each trigger is a `<button>`
wrapped in an `<h3>`, controlling an adjacent `role="region"` panel.

## Accessibility features

- Semantic heading + button structure (`<h3><button>...</button></h3>`) —
  screen readers can navigate the accordion via heading shortcuts even
  without ARIA.
- `aria-expanded` on the trigger, `aria-controls`/`aria-labelledby` linking
  trigger and panel by id.
- Panel uses `role="region"` with an accessible name from its trigger, per
  APG guidance for accordions with a small number of items.
- Collapsed panels use `inert` rather than unmounting — content stays
  readable in the DOM for consistent `aria-controls` targeting, but is
  removed from the tab order and AT interaction while closed.
- Smooth open/close animates via CSS Grid `grid-template-rows` (0fr → 1fr)
  rather than fixed pixel heights, so it works for dynamically-sized
  content without JS measurement, and respects `prefers-reduced-motion`
  (animation is fully disabled, not just shortened).
- Chevron rotation is `aria-hidden` — decorative only, expanded/collapsed
  state is conveyed via `aria-expanded`, not icon rotation.

## Keyboard shortcuts

| Key                 | Action                                               |
| ------------------- | ---------------------------------------------------- |
| `Tab` / `Shift+Tab` | Move focus to/from each trigger in document order    |
| `Enter` / `Space`   | Toggle the focused item (native `<button>` behavior) |
| `ArrowDown`         | Move focus to next trigger, wrapping                 |
| `ArrowUp`           | Move focus to previous trigger, wrapping             |
| `Home`              | Move focus to first trigger                          |
| `End`               | Move focus to last trigger                           |

## ARIA attributes used

| Attribute         | Element        | Purpose                                                         |
| ----------------- | -------------- | --------------------------------------------------------------- |
| `aria-expanded`   | trigger button | Open/closed state                                               |
| `aria-controls`   | trigger button | Points at its panel's id                                        |
| `aria-labelledby` | panel          | Points back at its trigger's id                                 |
| `role="region"`   | panel          | Landmark region, named by its trigger                           |
| `aria-disabled`   | trigger button | Non-interactive state                                           |
| `inert`           | panel          | Removes closed panel from AT/tab interaction without unmounting |

## WCAG criteria satisfied

- **2.1.1 Keyboard (A)** — full operability via native button + arrow nav.
- **2.4.6 Headings and Labels (AA)** — real `<h3>` headings, descriptive
  trigger text.
- **4.1.2 Name, Role, Value (A)** — explicit roles/states above.
- **1.4.1 Use of Color (A)** — expanded state conveyed via `aria-expanded`
  and chevron rotation together, not color alone.

## Known limitations

- Heading level is fixed at `h3` — does not yet accept a configurable
  heading level prop for accordions nested deeper in a page's heading
  hierarchy. Wrap in a custom heading level manually if needed.
- `role="region"` on every panel is per current APG guidance for a small,
  fixed number of items; for accordions with many items (10+), consider
  omitting the role to avoid landmark-list spam for screen reader users —
  not yet exposed as a variant.
