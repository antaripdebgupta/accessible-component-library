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

Verified with NVDA + Firefox and VoiceOver + Safari:

- **Combobox role**: Focus on input announces "combo box, edit, has auto-complete, expanded/collapsed".
- **Active descendant**: Navigating option list with Arrow keys updates `aria-activedescendant`, announcing the highlighted option's label and position (e.g. "Option 2 of 5").
- **Selection announcement**: Pressing Enter commits selection and announces the selected item value.
- **Tag management**: In multi-select mode, Backspace on empty input removes and announces the removed tag label.

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
