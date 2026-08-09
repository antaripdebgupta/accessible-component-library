# DataTable — Accessibility Contract

Renders a real `<table>` with `<thead>`/`<tbody>`/`<th scope="col">`/`<td>` —
native table semantics carry most of the accessibility for free. Sortable
headers use `aria-sort` on the `<th>`; row selection uses native
`<input type="checkbox">` with a select-all in the header (indeterminate
when some-but-not-all rows on the page are selected).

## Keyboard support

| Key                                                                     | Action                                                                                                                                                            |
| ----------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Tab` / `Shift+Tab`                                                     | Normal document tab order through sort buttons, checkboxes, expand buttons, and any interactive cell content                                                      |
| `Enter` / `Space` on a sort button                                      | Cycles that column: unsorted → ascending → descending → unsorted                                                                                                  |
| `Space` on a row checkbox                                               | Toggles that row's selection                                                                                                                                      |
| `Enter` / `Space` on an expand button                                   | Toggles that row's expanded content                                                                                                                               |
| `ArrowUp` / `ArrowDown` (while focus is on a checkbox or expand button) | Moves focus to the same control in the previous/next row — a convenience shortcut, not required for full keyboard operability (Tab already reaches every control) |
| `Home` / `End` (same context)                                           | Jumps to the first/last row's control in that column                                                                                                              |

## Responsive strategy

Below the `md` breakpoint, the table switches to a stacked "card" layout:
each `<tr>` becomes a block-level card, each `<td>` becomes a flex row
showing its column's header as an inline label next to the value
(`<thead>` itself is hidden via `hidden md:table-header-group`, since its
content is now repeated per-cell instead). This is a `display` property
change only — the underlying DOM stays a real `<table>`/`<tr>`/`<td>`
structure throughout, so screen reader table semantics remain intact at
every viewport width; only the visual presentation changes.

## Known limitations

- **Not a full ARIA grid.** This implements a standard HTML table with
  keyboard-operable controls inside it (WAI-ARIA APG "Table" pattern), not
  the more complex APG "Grid" pattern with 2D roving-tabindex arrow-key
  navigation between every cell. The ArrowUp/Down convenience above only
  covers checkbox/expand-button columns, not free navigation across data
  cells — sufficient for operability (Tab reaches everything) but not a
  spreadsheet-like navigation experience.
- **Sorting is client-side only** and re-sorts the full `data` array passed
  in; there's no built-in server-side/async sort integration. Combine with
  `useAsyncSearch`-style patterns externally if needed.
- **Expanded row content isn't part of keyboard grid navigation** — it's
  reachable via normal Tab order once the row is expanded, but arrow-key
  shortcuts don't traverse into it.
