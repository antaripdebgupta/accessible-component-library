# Combobox — Accessibility Contract

Implements the WAI-ARIA APG Combobox (list-autocomplete, single/multi-select)
pattern. The input carries `role="combobox"` with `aria-expanded`,
`aria-controls`, `aria-autocomplete="list"`, and `aria-activedescendant`
(rather than moving DOM focus into the popup — focus always stays on the
input, per the "manages active descendant" APG variant).

## Keyboard shortcuts

| Key                                      | Action                                                                                      |
| ---------------------------------------- | ------------------------------------------------------------------------------------------- |
| Typing                                   | Filters the list, opens the popup                                                           |
| `ArrowDown`                              | Opens the popup if closed; otherwise moves the highlight to the next visible item, wrapping |
| `ArrowUp`                                | Moves the highlight to the previous visible item, wrapping                                  |
| `Home`/`End`                             | Highlights the first/last visible item                                                      |
| `Enter`                                  | Selects the highlighted item                                                                |
| `Escape`                                 | Closes the popup                                                                            |
| `Backspace` (multiple mode, empty input) | Removes the last selected tag                                                               |

## Screen reader behavior

Tested with NVDA + Firefox.

- Focusing the input announces "[Label], combo box, collapsed" (or
  "expanded" if already open).
- Typing to filter announces the updated result count via the polite live
  region: "4 results available" — confirmed this doesn't interrupt typing.
- Arrowing through results announces each option's text plus position:
  "[Option], 2 of 4" via `aria-activedescendant` tracking.
- Selecting an option announces the new input value and collapses the
  listbox, confirmed via "[Label], combo box, collapsed, [value]".
- Empty results state announces "No results found" through the same live
  region used for the count.

## Known limitations

- **No collision/flip detection** — same manual-positioning caveat as
  Tooltip/DropdownMenu; a combobox near the bottom of the viewport can have
  its popup render off-screen or get clipped.
- **Filtering is client-side only** — `filter` runs against already-
  registered `ComboboxItem` children; there's no async/remote-data loading
  state built in. Wrap fetching logic around the `value`/`inputValue`
  controlled props if you need it.
- **`ComboboxItem` needs a string child or `textValue`** for filtering to
  work correctly, same caveat as DropdownMenu's typeahead.
- **Groups don't affect keyboard order** — `ComboboxGroup` is a visual/AT
  grouping only; Arrow key navigation moves through all visible items in
  DOM order regardless of group boundaries.
