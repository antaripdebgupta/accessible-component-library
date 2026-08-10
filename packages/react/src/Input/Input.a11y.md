# Input Accessibility (`Input.a11y.md`)

## Overview

The `Input` component family (`Input`, `InputGroup`, `FieldGroup`, `FileInput`) provides enterprise-grade, accessible single-line text and file inputs complying with WCAG 2.2 AA. It features native `<input>` primitives, compound fieldset/legend groupings, accessible password visibility toggling with cursor preservation, inline decorative badges, drag-and-drop file inputs, and full RTL layout support.

---

## Accessibility Features

- **Native `<input>` Foundation**: Built directly on native form elements so browser autofill, password managers, IME input, and standard assistive technology behaviors remain uncompromised.
- **FileInput Accessibility**: Replaces native un-stylable file inputs with a custom drag-and-drop dropzone that wraps a visually hidden native `<input type="file" className="sr-only">`. Click-to-browse and drag-and-drop are first-class equal interactions, and keyboard activation (`Space`/`Enter` when focused) triggers native file selection.
- **Password Toggle Cursor Preservation**: Toggling between `type="password"` and `type="text"` uses layout frame scheduling to restore `selectionStart` and `selectionEnd` caret coordinates, preventing the caret from jumping to the end or discarding highlighted text selection.
- **Combined `aria-describedby`**: Concatenates external `aria-describedby` IDs with helper text and error message element IDs into a single space-separated attribute.
- **Required Indicator Access**: The visual required indicator (`*`) is accompanied by native `required` / `aria-required="true"` attributes and visually-hidden text (`(required)`), preventing non-standard announcements.
- **FieldGroup Fieldset & Legend**: Uses semantic `<fieldset>` and `<legend>` elements so screen readers announce group context ("Date of Birth") alongside each individual field label ("Day", "Month", "Year").
- **Inline Badges & Addons**: Decorative badges (e.g. `$`, `USD`) use `aria-hidden="true"` so they are not announced as part of the input's string value. Interactive addons (such as copy buttons) retain individual focusability and accessible names.

---

## Keyboard Shortcuts

| Key Combination   | Context                         | Action                                                                            |
| :---------------- | :------------------------------ | :-------------------------------------------------------------------------------- |
| `Tab`             | Input field                     | Focuses the input element.                                                        |
| `Tab`             | Password Toggle / Action Button | Moves focus to the action button following natural DOM tab order.                 |
| `Space` / `Enter` | Password Toggle                 | Toggles password mask state without stealing focus from the input.                |
| `Space` / `Enter` | FileInput                       | Opens native OS file selection dialog when file dropzone is focused via keyboard. |

---

## ARIA Attributes

| Attribute                | Element                   | Purpose                                                                      |
| :----------------------- | :------------------------ | :--------------------------------------------------------------------------- |
| `role="textbox"`         | `<input>`                 | Native role for text-based inputs.                                           |
| `aria-invalid="true"`    | `<input>`                 | Set when validation error is active.                                         |
| `aria-describedby="..."` | `<input>`                 | Programmatically links description and error helper elements.                |
| `aria-required="true"`   | `<input>`                 | Programmatically conveys required state.                                     |
| `aria-pressed="true      | false"`                   | Password Toggle Button                                                       | Communicates password visibility state. |
| `aria-hidden="true"`     | Asterisk / Badges / Icons | Prevents decorative visual cues from cluttering screen reader announcements. |

---

## WCAG 2.2 AA Mapping

| WCAG Criterion                   | Level | Compliance Implementation                                                                                       |
| :------------------------------- | :---- | :-------------------------------------------------------------------------------------------------------------- |
| **1.3.1 Info and Relationships** | A     | `label` association via `htmlFor`, `<fieldset>` / `<legend>` bindings for field groups, and `aria-describedby`. |
| **2.1.1 Keyboard**               | A     | File inputs, password toggles, and text inputs are fully operable via keyboard.                                 |
| **2.4.6 Headings and Labels**    | AA    | Explicit labels provided for all inputs; visually hidden SR text added for required indicators.                 |
| **2.4.7 Focus Visible**          | AA    | Focus outline rings applied consistently across text inputs, dropzones, and action buttons.                     |
| **3.3.1 Error Identification**   | A     | Error messages visually rendered and programmatically linked via `aria-invalid` and `aria-describedby`.         |
| **4.1.2 Name, Role, Value**      | A     | Correct roles and accessible names provided across all input variants.                                          |

---

## Known Limitations & Design Decisions

1. **RTL Field Group Tab Order**:
   In RTL mode, the visual reading order mirrors, but tab order follows natural DOM logical order (e.g. Day → Month → Year). This maintains predictable semantic sequence across locales while adjusting CSS layout alignment.
2. **Browser Autofill Overrides**:
   Browser autofill styles (`:-webkit-autofill`) attempt to force default yellow/blue background fills. Override shadow rules (`autofill:shadow-...`) are applied to maintain design system tokens.
3. **Cursor Preservation in Password Fields**:
   `setSelectionRange` is supported on `text` and `password` input types. On non-text input types (e.g., `email`), browsers ignore selection range calls gracefully.
