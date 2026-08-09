# Switch — Accessibility Contract

## Overview

Renders as a native `<button role="switch">` following the WAI-ARIA APG Switch pattern.

## Accessibility features

- Real `<button>` element is used to obtain native focus and event handling for free.
- Uses `role="switch"` and `aria-checked` to communicate state to assistive technologies.
- Rapid double-toggle prevention prevents async race conditions.
- Uses an invisible pseudo-element to guarantee a minimum 44×44px interactive touch target, exceeding the WCAG 2.2 AA target size requirements.
- Supports `pending` state using `aria-busy="true"` to signal background operations.

## Keyboard shortcuts

| Key                 | Action                        |
| ------------------- | ----------------------------- |
| `Tab` / `Shift+Tab` | Move focus to/from the switch |
| `Enter`             | Toggle the checked state      |
| `Space`             | Toggle the checked state      |

## ARIA attributes used

| Attribute       | Element    | Purpose                                                       |
| --------------- | ---------- | ------------------------------------------------------------- |
| `role="switch"` | `<button>` | Sets the component role to switch                             |
| `aria-checked`  | `<button>` | Communicates the on/off state ('true' or 'false')             |
| `aria-disabled` | `<button>` | Marks the switch as non-interactive while remaining focusable |
| `aria-busy`     | `<button>` | Signals in-progress state during async actions                |

## WCAG criteria satisfied

- **2.1.1 Keyboard (A)** — Fully operable via Space and Enter.
- **2.4.7 Focus Visible (AA)** — `.focus-ring-safe` utility applied to the track.
- **2.5.8 Target Size (Minimum) (AA)** — 44x44px touch target implemented via pseudo-element.
- **4.1.2 Name, Role, Value (A)** — Uses standard role, name from label/children, and checked value.

## Known limitations

- When the switch is rendered without a label element, the consumer must manually specify an `aria-label` or `aria-labelledby` attribute to ensure proper name computation.
