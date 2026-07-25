# Button — Accessibility Contract

## Overview
Native `<button>` element. No custom ARIA role needed — this is the
"prefer native semantics" case from the ARIA First Rule.

## Accessibility features
- Native `<button type="button">` — full keyboard support and accessible
  name computation come for free.
- Disabled state uses `aria-disabled` (not the native `disabled` attribute)
  so the button remains focusable and reachable by screen reader/keyboard
  users, at the cost of not being auto-removed from the tab order — see
  Known Limitations.
- Loading state uses `aria-busy="true"` and an optional `loadingText` prop
  so the accessible name doesn't silently change without the visible label
  keeping pace with it.

## Keyboard shortcuts
| Key | Action |
|---|---|
| `Tab` / `Shift+Tab` | Move focus to/from the button |
| `Enter` | Activate |
| `Space` | Activate |

## ARIA attributes used
| Attribute | Element | Purpose |
|---|---|---|
| `aria-disabled` | `<button>` | Marks non-interactive state while staying focusable |
| `aria-busy` | `<button>` | Announces in-progress state during async actions |

## WCAG criteria satisfied
- **2.1.1 Keyboard (A)** — fully operable via Enter/Space, native behavior.
- **2.4.7 Focus Visible (AA)** — `.focus-ring-safe` utility, verified in forced-colors mode.
- **4.1.2 Name, Role, Value (A)** — native role; name from children or `aria-label`.
- **1.4.1 Use of Color (A)** — disabled state is not color-only (also non-interactive).

## Known limitations
- `aria-disabled` keeps the button in the tab order even when disabled.
  This is an intentional trade-off (see APG guidance on disabled controls)
  but means keyboard users will tab onto a non-functional control. If your
  use case requires full removal from the tab order, pass `tabIndex={-1}`
  manually — this is not yet exposed as a first-class prop.
- Icon-only buttons are not yet covered by a dedicated variant; consumers
  must supply `aria-label` manually when passing only an icon as children.
