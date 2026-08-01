# Tooltip — Accessibility Contract

## Overview

Implements the WAI-ARIA APG Tooltip pattern: a trigger element with
`aria-describedby` pointing at a `role="tooltip"` bubble, shown on hover
(with a delay) or focus (immediately), and dismissible without side effects.

## Accessibility features

- Shows on **both** hover and keyboard focus — hover is never the only way
  to reveal the content (WCAG 2.1.1 Keyboard).
- Focus shows the tooltip immediately (no delay); hover uses a configurable
  delay (default 300ms) to avoid noisy tooltips on incidental mouse movement.
- **Dismissible** (WCAG 1.4.13): Escape closes the tooltip without
  dismissing anything else on the page or moving focus.
- **Hoverable** (WCAG 1.4.13): moving the pointer from the trigger onto the
  tooltip content itself cancels the pending hide, via a short grace period
  (default 100ms) plus a cancel-on-enter handler on the content.
- **Persistent** (WCAG 1.4.13): the tooltip does not disappear on a fixed
  timeout — only on blur, mouse-leave (past the grace period), or Escape.
- `aria-describedby` is only present on the trigger while the tooltip is
  open, so assistive tech announces it exactly when sighted users see it.
- Content unmounts entirely while closed (unlike Accordion's `inert`
  panels) since tooltip content is supplementary, not essential state.

## Keyboard shortcuts

| Key                    | Action                                                 |
| ---------------------- | ------------------------------------------------------ |
| `Tab`                  | Moves focus to the trigger — tooltip shows immediately |
| `Shift+Tab` / any blur | Moves focus away — tooltip hides                       |
| `Escape`               | Dismisses the open tooltip only                        |

## ARIA attributes used

| Attribute          | Element | Purpose                                             |
| ------------------ | ------- | --------------------------------------------------- |
| `aria-describedby` | trigger | Points at the tooltip content's id, only while open |
| `role="tooltip"`   | content | Identifies the bubble's role to AT                  |

## WCAG criteria satisfied

- **2.1.1 Keyboard (A)** — reachable and dismissible via keyboard alone.
- **1.4.13 Content on Hover or Focus (AA)** — dismissible, hoverable, persistent.
- **4.1.2 Name, Role, Value (A)** — explicit role, description linkage.

## Known limitations

- **No collision/flip detection.** Positioning is computed manually from
  `getBoundingClientRect()` with a fixed offset per `placement`; if the
  trigger is near a viewport edge, the tooltip can render partially
  off-screen. A floating-ui/popper integration would be needed to fix this
  properly — not yet implemented.
- **Disabled triggers need a wrapper.** Native `disabled` buttons fire no
  hover or focus events in any browser and aren't focusable, so a tooltip
  cannot attach to one directly. Wrap the disabled element in a focusable
  `<span tabIndex={0}>` and put `TooltipTrigger` around the span instead —
  see the `DisabledButton` story for the pattern.
- **`TooltipTrigger` requires exactly one real element child** (via
  `cloneElement`) — it cannot wrap plain text or multiple children.
