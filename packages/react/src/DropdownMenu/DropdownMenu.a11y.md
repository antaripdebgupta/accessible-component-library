# DropdownMenu — Accessibility Contract

Implements the WAI-ARIA APG Menu Button pattern. Trigger has
`aria-haspopup="menu"`/`aria-expanded`; content is `role="menu"`; items are
`menuitem`/`menuitemcheckbox`/`menuitemradio` with a single roving `tabIndex`.

## Keyboard shortcuts

| Key                                              | Action                                                                    |
| ------------------------------------------------ | ------------------------------------------------------------------------- |
| `Enter`/`Space`/`ArrowDown`/`ArrowUp` on trigger | Opens menu, focuses first item                                            |
| `ArrowDown`/`ArrowUp`                            | Move focus between items, wrapping                                        |
| `Home`/`End`                                     | Move focus to first/last enabled item                                     |
| Typing letters                                   | Typeahead — jumps to the next item whose label starts with the typed text |
| `Enter`/`Space` on item                          | Activates it                                                              |
| `ArrowRight` on a submenu trigger                | Opens the submenu, focuses its first item                                 |
| `ArrowLeft` inside a submenu                     | Closes the submenu, returns focus to its trigger                          |
| `Escape`                                         | Closes the menu, returns focus to the trigger                             |
| `Tab`                                            | Closes the menu, lets focus move naturally                                |

## Known limitations

- **Escape closes all open levels at once**, not just the innermost
  submenu, since each submenu is an independent hook instance and both are
  listening while nested. A full fix requires the parent to suppress its
  own Escape handler while a child submenu is open.
- **No collision/flip detection** — same manual-positioning caveat as
  Tooltip; a submenu or dropdown near a viewport edge can render off-screen.
- **Typeahead needs a string child or `textValue`** — items whose children
  are JSX (icon + text, text + shortcut) won't match typed letters unless
  `textValue` is supplied explicitly.
