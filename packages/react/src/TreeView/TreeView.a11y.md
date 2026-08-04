# TreeView — Accessibility Contract

## Overview

Implements the WAI-ARIA APG Tree View pattern: a `role="tree"` container of
`role="treeitem"` nodes, with `role="group"` wrapping any expanded node's
children.

## Accessibility features

- Collapsed subtrees are unmounted (not just hidden), keeping
  `aria-posinset`/`aria-setsize`/`aria-level` always accurate without extra
  bookkeeping and limiting keyboard traversal to what's actually reachable.
- Roving tabindex: only the focused node has `tabIndex={0}`; `Tab` enters
  and exits the tree as a single stop.
- Typeahead: typing jumps focus to the next visible node whose label starts
  with the typed characters, buffered over 500ms for multi-character match.
- `aria-multiselectable` set only when `selectionMode="multiple"`.
- Disabled nodes are excluded from selection and click activation, but
  remain visible/navigable per APG guidance (skipping them entirely from
  the tab sequence would hide their existence from screen reader users
  browsing the tree structure).

## Keyboard shortcuts

| Key                 | Action                                                                            |
| ------------------- | --------------------------------------------------------------------------------- |
| `Tab` / `Shift+Tab` | Move focus into/out of the tree (single stop)                                     |
| `ArrowDown`         | Move focus to next visible node                                                   |
| `ArrowUp`           | Move focus to previous visible node                                               |
| `ArrowRight`        | Expand a collapsed branch, or move focus into its first child if already expanded |
| `ArrowLeft`         | Collapse an expanded branch, or move focus to its parent                          |
| `Home`              | Move focus to first visible node                                                  |
| `End`               | Move focus to last visible node                                                   |
| `Enter` / `Space`   | Select the focused node; toggles expansion if it's a branch                       |
| `*` (asterisk)      | Expand all sibling branches at the current level                                  |
| Character keys      | Typeahead — jump to next node whose label matches                                 |

## ARIA attributes used

| Attribute              | Element          | Purpose                                              |
| ---------------------- | ---------------- | ---------------------------------------------------- |
| `role="tree"`          | root container   | Identifies the tree widget                           |
| `role="treeitem"`      | each node        | Identifies a selectable/navigable node               |
| `role="group"`         | nested container | Groups a branch's children                           |
| `aria-expanded`        | branch node      | Open/closed state (absent on leaf nodes)             |
| `aria-selected`        | node             | Selection state (absent when `selectionMode="none"`) |
| `aria-level`           | node             | Depth in the tree, 1-indexed                         |
| `aria-setsize`         | node             | Number of siblings at this level                     |
| `aria-posinset`        | node             | This node's 1-indexed position among its siblings    |
| `aria-multiselectable` | root             | Present only for `selectionMode="multiple"`          |
| `aria-disabled`        | node             | Non-interactive state                                |

## WCAG criteria satisfied

- **2.1.1 Keyboard (A)** — full operability via the shortcuts table above.
- **2.4.3 Focus Order (A)** — roving tabindex keeps a single logical stop.
- **2.4.7 Focus Visible (AA)** — `.focus-ring-safe`.
- **4.1.2 Name, Role, Value (A)** — explicit roles/states/level/setsize/posinset.
- **1.3.1 Info and Relationships (A)** — hierarchy conveyed via
  `aria-level`/`role="group"`, not just visual indentation.

## Known limitations

- No built-in virtualization — very large trees (thousands of nodes) will
  register/unregister every visible node on each expand/collapse. For huge
  datasets, a virtualized variant recomputing `aria-posinset`/`aria-setsize`
  from the full data model (not just the rendered window) would be needed;
  not implemented here.
- Drag-and-drop reordering is not implemented.
- `aria-label` is required on `TreeView` (not optional) since a tree with
  no accessible name is a common real-world failure — there's currently no
  `aria-labelledby` alternative exposed as a prop.
