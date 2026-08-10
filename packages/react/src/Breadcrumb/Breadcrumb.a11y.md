# Breadcrumb Accessibility (`Breadcrumb.a11y.md`)

## Overview

The `Breadcrumb` component hierarchy provides a semantic navigation trail adhering strictly to WCAG 2.2 AA. It utilizes `<nav aria-label="Breadcrumb"><ol><li>` structure, ensures the current page item is non-interactive with `aria-current="page"`, hides visual separators from screen readers via `aria-hidden="true"`, reuses `DropdownMenu` for collapsed path segments with full keyboard focus management, and mirrors directional separators in RTL locales without altering semantic sequence.

---

## Accessibility Features

- **Semantic `<nav>` and `<ol>` Structure**: Built with ordered list `<ol>` elements inside `<nav aria-label="Breadcrumb">` to correctly express the sequential structural hierarchy of ancestor pages.
- **Non-Link Current Item**: The final breadcrumb segment representing the active page is rendered as a plain text `<span aria-current="page">`, preventing duplicate navigation links to the currently active URL.
- **Hidden Visual Separators**: Separator glyphs (chevrons, slashes) carry `aria-hidden="true"` so screen reader users are not distracted by redundant character announcements between items (since list boundaries are announced natively).
- **Interactive Ellipsis Trigger**: When paths exceed `maxItems`, middle items collapse into a real, keyboard-focusable button trigger with `aria-label="Show hidden breadcrumb items"`.
- **DropdownMenu Focus Contract**: Collapsed items expand via the built-in `DropdownMenu` component. Opening moves focus into the popup list; closing returns focus directly to the ellipsis trigger.
- **Custom Link Integration**: Supports custom router components (e.g. Next.js `Link`) via `as` / `LinkComponent` props without losing focusability or landmark semantic guarantees.
- **RTL Support & Separator Mirroring**: Directional separator glyphs (e.g., chevrons) rotate 180° when `dir="rtl"` is active. The structural DOM order of breadcrumb items remains unchanged because breadcrumbs convey logical hierarchy rather than text direction.

---

## Keyboard Shortcuts

| Key Combination         | Context           | Action                                                                                 |
| :---------------------- | :---------------- | :------------------------------------------------------------------------------------- |
| `Tab`                   | Navigation trail  | Moves focus sequentially through ancestor links and the ellipsis trigger.              |
| `Shift + Tab`           | Navigation trail  | Moves focus backward through ancestor links.                                           |
| `Space` / `Enter`       | Ellipsis trigger  | Opens the collapsed breadcrumbs dropdown menu and shifts focus to the first menu item. |
| `ArrowDown` / `ArrowUp` | Ellipsis Dropdown | Navigates through collapsed items inside the dropdown.                                 |
| `Escape`                | Ellipsis Dropdown | Closes the dropdown menu and restores focus to the ellipsis button trigger.            |

---

## ARIA Attributes

| Attribute                                   | Element               | Purpose                                                                     |
| :------------------------------------------ | :-------------------- | :-------------------------------------------------------------------------- |
| `role="navigation"`                         | `<nav>`               | Landmarking container for page navigation.                                  |
| `aria-label="Breadcrumb"`                   | `<nav>`               | Distinguishes this navigation landmark from other page navigation sections. |
| `aria-current="page"`                       | `<span>` (last item)  | Programmatically indicates the active page item in the navigation trail.    |
| `aria-hidden="true"`                        | `<li>` (separator)    | Prevents screen readers from announcing decorative separators.              |
| `aria-label="Show hidden breadcrumb items"` | `<button>` (ellipsis) | Accessible name for the collapsed items trigger.                            |
| `aria-haspopup="menu"`                      | `<button>` (ellipsis) | Communicates that activating the ellipsis opens a dropdown menu.            |

---

## WCAG 2.2 AA Mapping

| WCAG Criterion                      | Level | Compliance Implementation                                                                  |
| :---------------------------------- | :---- | :----------------------------------------------------------------------------------------- |
| **1.3.1 Info and Relationships**    | A     | Implemented with `<nav>`, `<ol>`, `<li>`, `aria-current="page"`, and `aria-hidden="true"`. |
| **2.1.1 Keyboard**                  | A     | All ancestor links and the ellipsis dropdown trigger are 100% keyboard navigable.          |
| **2.4.4 Link Purpose (In Context)** | A     | Link text clearly states page target; current page is explicitly marked and non-clickable. |
| **2.4.6 Headings and Labels**       | AA    | Explicit `aria-label="Breadcrumb"` provided on `<nav>`.                                    |
| **2.4.7 Focus Visible**             | AA    | Consistent `focus-ring-safe` outline applied to links and ellipsis triggers.               |
| **4.1.2 Name, Role, Value**         | A     | Full ARIA landmark, current item state, and menu triggers properly declared.               |

---

## Known Limitations & Design Decisions

1. **RTL Item Order vs Separator Mirroring**:
   A common mistake in RTL design is reversing the item list order. Breadcrumbs represent a logical hierarchy (Root → Category → Subcategory → Item). Therefore, list order is NOT reversed in RTL; only directional separator glyphs are mirrored visually using `rtl:rotate-180`.
2. **Deterministic Collapse Strategy**:
   Collapse is calculated deterministically via props (`maxItems`, `itemsBeforeCollapse`, `itemsAfterCollapse`) to guarantee server-side rendering safety and zero layout flash during client hydration.
3. **Text Truncation**:
   Long segment labels truncate visually with `text-overflow: ellipsis` (`max-w-[200px]`). The complete untruncated text is exposed via standard `title` attributes and remains fully accessible to assistive technology.
