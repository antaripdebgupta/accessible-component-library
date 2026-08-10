# Textarea Accessibility (`Textarea.a11y.md`)

## Overview

The `Textarea` component provides a fully accessible multi-line text input adhering to WCAG 2.2 AA standards. It supports native `<textarea>` keyboard interactions, auto-resizing via hidden shadow measurement, label association, helper and error text integration via `aria-describedby`, character count announcements via polite live regions, integrated submit buttons, and full RTL layout support.

---

## Accessibility Features

- **Native Semantic Primitive**: Built directly on top of `<textarea>` to preserve native browser text editing, focus management, spellcheck, and screen reader behaviors.
- **Combined `aria-describedby`**: Integrates helper text, error messages, and character counters into a space-separated `aria-describedby` string without overwriting individual descriptions.
- **Selective Live Region Announcements**: The character counter uses `aria-live="polite"` only when approaching or exceeding character limits (`isNearLimit` or `isOverCount`), avoiding keystroke notification spam for screen reader users.
- **Auto-Resize Shadow Mirror**: Calculates layout height dynamically using an offscreen shadow mirror `<div>` matching calculated computed styles rather than relying solely on `scrollHeight`, which behaves inconsistently across browsers when shrinking text. Height animations are gated during active typing to avoid input latency.
- **Grapheme Cluster Counting**: Character counting utilizes `Intl.Segmenter` (with fallback to `[...value]`) to accurately count multi-code-point emoji and surrogate pairs as single visual characters.
- **RTL & Logical Properties**: Layout spacing, resize handle positioning, text alignment, and action button coordinates use logical properties and direction checks.

---

## Keyboard Shortcuts

| Key Combination       | Context                  | Action                                                                                                  |
| :-------------------- | :----------------------- | :------------------------------------------------------------------------------------------------------ |
| `Tab`                 | Textarea / Action button | Focuses into textarea or shifts focus to next interactive element (including integrated action button). |
| `Shift + Tab`         | Textarea                 | Moves focus to the previous focusable element.                                                          |
| `Enter`               | `submitOnEnter={true}`   | Submits the parent form or invokes `onSubmit` callback.                                                 |
| `Shift + Enter`       | `submitOnEnter={true}`   | Inserts a new line character without submitting.                                                        |
| Standard editing keys | Textarea                 | Native arrow keys, `Home`, `End`, `PageUp`, `PageDown` navigate caret within text.                      |

---

## ARIA Attributes

| Attribute                | Element                          | Purpose                                                                           |
| :----------------------- | :------------------------------- | :-------------------------------------------------------------------------------- |
| `role="textbox"`         | `<textarea>`                     | Native ARIA role for multi-line text input.                                       |
| `aria-multiline="true"`  | `<textarea>`                     | Implicit native attribute for textareas.                                          |
| `aria-invalid="true"`    | `<textarea>`                     | Communicates an error state when error message or invalid prop is passed.         |
| `aria-describedby="..."` | `<textarea>`                     | Links associated helper description, error message, and character count elements. |
| `aria-live="polite"`     | `<span>` (counter)               | Announces remaining character counts when near or over character limits.          |
| `aria-hidden="true"`     | Shadow mirror `<div>` / Asterisk | Hides decorative required asterisks and mirror elements from accessibility tree.  |

---

## WCAG 2.2 AA Mapping

| WCAG Criterion                   | Level | Compliance Implementation                                                                               |
| :------------------------------- | :---- | :------------------------------------------------------------------------------------------------------ |
| **1.3.1 Info and Relationships** | A     | Native `<label htmlFor="...">` association, `<fieldset>` integration, and `aria-describedby` bindings.  |
| **2.1.1 Keyboard**               | A     | All interactive elements (textarea, integrated buttons) are fully keyboard operable.                    |
| **2.4.6 Headings and Labels**    | AA    | Clear visual and programmatic labels associated with text fields.                                       |
| **2.4.7 Focus Visible**          | AA    | Standard focus ring with high-contrast indicator (`focus-ring-safe`).                                   |
| **3.3.1 Error Identification**   | A     | Errors visually highlighted and programmatically linked via `aria-invalid` and `aria-describedby`.      |
| **3.3.2 Labels or Instructions** | A     | Inputs explicitly present visible labels and instructions.                                              |
| **4.1.2 Name, Role, Value**      | A     | Programmatic name provided by `<label>`, role provided by `<textarea>`, value exposed via DOM property. |

---

## Known Limitations & Design Decisions

1. **Native `disabled` Attribute**:
   Unlike `Button` which uses `aria-disabled` to retain focusability for tooltips, `Textarea` uses native `disabled`. Disabled form inputs are explicitly excluded from tab order as specified by standard form patterns.
2. **Auto-Resize Height Transitions**:
   CSS height transition is disabled during active typing (`isTyping` state) to prevent lag or jittery caret position during rapid key presses.
3. **Resize Handle in RTL**:
   Native browser resize handles stay anchored to bottom-right in some WebKit browsers. When `dir="rtl"` is active, `resize-none` or logical mirror handling is enforced to prevent visual misalignment.
