# Pagination — Accessibility Contract

## Overview

Implements the WAI-ARIA APG Pagination pattern: a `<nav>` container containing page links and controls for navigating multi-page datasets.

## Accessibility features

- Navigation Landmark: Container is structured using `<nav>` with `aria-label="Pagination"` to differentiate it from other navigation blocks on the page.
- Current Page Indicator: The active page button is explicitly announced using `aria-current="page"`.
- Textual Equivalence: Previous/Next buttons use explicit `aria-label` properties ("Previous page" / "Next page") instead of relying on icon labels.
- Disable State: Prev/Next buttons are disabled at boundary pages (page 1 and pageCount) using the standard `disabled` attribute and `aria-disabled="true"`.
- Informative Ellipsis: Dot range separators (ellipses) are marked with `aria-hidden="true"` to prevent screen readers from reading them out as plain text content, as they are purely decorative visual cues.

## Keyboard shortcuts

| Key                 | Action                                        |
| ------------------- | --------------------------------------------- |
| `Tab` / `Shift+Tab` | Move focus to/from pagination control buttons |
| `Enter` / `Space`   | Trigger the focused page button               |

## ARIA attributes used

| Attribute           | Element          | Purpose                                               |
| ------------------- | ---------------- | ----------------------------------------------------- |
| `role="navigation"` | `nav`            | Landmark role (implied by `<nav>` but enforced)       |
| `aria-label`        | `nav`, buttons   | Labeling the navigation block and icon buttons        |
| `aria-current`      | active button    | Indicates the current active page in the set ('page') |
| `aria-disabled`     | boundary buttons | Indicates disabled state to screen readers            |
| `aria-hidden`       | ellipsis span    | Hides decoration (dots) from assistive technologies   |

## WCAG criteria satisfied

- **2.1.1 Keyboard (A)** — full operability via native buttons and standard tab navigation.
- **2.4.4 Link Purpose (In Context) (A)** — descriptive labels for page navigation buttons.
- **4.1.2 Name, Role, Value (A)** — clear state announcements via `aria-current`.
