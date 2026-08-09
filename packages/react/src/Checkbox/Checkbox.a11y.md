# Checkbox — Accessibility Contract

## Overview

Wraps a native `<input type="checkbox">` for accessible interaction and consistent styling.

## Accessibility features

- Uses native `<input type="checkbox">` to obtain native focus, keyboard navigation, and form submission support for free.
- Syncs the ref-based `indeterminate` property dynamically.
- Accessible name association via a native `<label htmlFor>` wrapper.
- Implements `aria-describedby` support for description text and error messages.
- Touch target of 44x44px minimum via padding of the wrapper element.
- Stops internal click event propagation to prevent duplicate toggle actions when input is clicked inside the label.

## Keyboard shortcuts

| Key                 | Action                             |
| ------------------- | ---------------------------------- |
| `Tab` / `Shift+Tab` | Move focus to/from the checkbox    |
| `Space`             | Toggle the checked/unchecked state |

## ARIA attributes used

| Attribute          | Element   | Purpose                                          |
| ------------------ | --------- | ------------------------------------------------ |
| `aria-invalid`     | `<input>` | Signals validation error states                  |
| `aria-describedby` | `<input>` | References the description and error message IDs |

## WCAG criteria satisfied

- **2.1.1 Keyboard (A)** — Operates natively with space key.
- **2.4.7 Focus Visible (AA)** — Focus ring applied using custom outline.
- **2.5.8 Target Size (Minimum) (AA)** — 44x44px target size via label padding.
- **4.1.2 Name, Role, Value (A)** — Standard input role with label name and checked value.

## Known limitations

- When the label contains interactive elements (such as links), screen readers may read the whole text as the accessible name, causing confusion. Keep label texts static.
