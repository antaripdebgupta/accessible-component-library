# Command Palette — Accessibility Contract

A Dialog (modal, portal, scroll lock) containing an always-open Combobox-
style listbox. The input carries `role="combobox"` with `aria-expanded`
always `true` while mounted, `aria-controls`, and `aria-activedescendant` —
keyboard focus never leaves the input; the "selected" row is communicated
via `aria-activedescendant` + `aria-selected`, not real DOM focus movement,
per the WAI-ARIA APG Combobox pattern.

## Behavior

- **Global hotkey** (`mod+k` by default) opens/closes from anywhere on the
  page via a `window` keydown listener.
- **Initial focus** moves to the search input on open; **focus restoration**
  returns to whatever had focus before opening, once fully closed.
- **Background inertness is intentionally NOT applied** here, unlike
  Dialog — because focus never leaves the input in the first place (no
  Tab-based focus trap is needed), there's nothing for a background element
  to be reached via keyboard navigation while the palette is open. Overlay
  click-to-close and Escape still fully cover dismissal.
- **Async-safe results**: `useAsyncSearch` guards against out-of-order
  responses via a request-sequence number — see its own doc comment.
- **Body scroll lock**, with scrollbar-width compensation, same as Dialog.

## Keyboard shortcuts

| Key                   | Action                                       |
| --------------------- | -------------------------------------------- |
| `mod+k` (global)      | Opens/closes the palette                     |
| Typing                | Updates the query (drives your async search) |
| `ArrowDown`/`ArrowUp` | Moves the highlight, wrapping                |
| `Home`/`End`          | Highlights first/last item                   |
| `Enter`               | Selects the highlighted item                 |
| `Escape`              | Closes the palette                           |

## Known limitations

- **No focus trap in the Dialog sense** — by design (see above), but this
  means if you render genuinely focusable elements inside `CommandItem`
  children (e.g. a nested button), Tab could move real focus there and
  then escape the palette's DOM entirely, since there's no Tab-cycling
  guard. Keep `CommandItem` children non-focusable (icons, text, badges).
- **`CommandItem` needs a string child or `textValue`** for any future
  typeahead/label-based features, same caveat as DropdownMenu/Combobox.
- **Groups are visual/AT grouping only** — Arrow key navigation moves
  through all visible items in DOM order regardless of group boundaries.
