# RadioGroup — Accessibility Contract

## Overview

Renders as a native `<fieldset role="radiogroup">` with `<legend>` for labeling, and native `<input type="radio">` children managed by roving tabindex.

## Accessibility features

- Uses native `<fieldset>` and `<legend>` to group and label controls semantically.
- Roving tabindex manages focus:
  - If a radio button is selected, it holds `tabIndex={0}` and other items hold `tabIndex={-1}`.
  - If no radio button is selected, the first enabled radio button holds `tabIndex={0}` (unless focus has moved to another specific item, in which case that item holds `tabIndex={0}`).
- Arrow-key navigation shifts focus and updates checked state programmatically, skipping disabled items.
- Supports `orientation` (horizontal/vertical) to alter arrow key focus shifting, and mirrors direction in horizontal orientation if `dir="rtl"` is provided.
- Minimum 44x44px touch targets on all item labels for mobile responsiveness.
- Supports `responsive` stacking: stacks items vertically on mobile viewports even if configured with `orientation="horizontal"`.

## Keyboard shortcuts

| Key                        | Action                                                      |
| -------------------------- | ----------------------------------------------------------- |
| `Tab` / `Shift+Tab`        | Move focus to/from the active radio item in the group       |
| `ArrowDown` / `ArrowRight` | Move focus and selection to the next enabled radio item     |
| `ArrowUp` / `ArrowLeft`    | Move focus and selection to the previous enabled radio item |
| `Home`                     | Move focus and selection to the first enabled radio item    |
| `End`                      | Move focus and selection to the last enabled radio item     |

## Rationale: Avoid Auto-selecting First Item

Unlike tabs (where one panel is always active and shown), a RadioGroup represents a form control selection. Auto-selecting the first option by default forces an implicit choice on the user and prevents mandatory fields from detecting if the user skipped the field. Therefore, if no `defaultValue` or `value` is provided, the RadioGroup remains unselected, but focus is still correctly directed to the first enabled option upon tabbing.

## ARIA attributes used

| Attribute           | Element      | Purpose                                             |
| ------------------- | ------------ | --------------------------------------------------- |
| `role="radiogroup"` | `<fieldset>` | Formally declares the container as a radio group    |
| `aria-describedby`  | `<input>`    | References the description message ID for each item |

## WCAG criteria satisfied

- **2.1.1 Keyboard (A)** — Full keyboard navigation via arrows, Home, and End keys.
- **2.4.7 Focus Visible (AA)** — Custom focus outline ring applied when focused.
- **2.5.8 Target Size (Minimum) (AA)** — 44x44px interactive target sizes on all items.
- **4.1.2 Name, Role, Value (A)** — Standard group/radio roles, labeling, and checked states.
