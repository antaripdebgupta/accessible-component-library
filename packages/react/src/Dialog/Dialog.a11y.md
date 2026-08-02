# Dialog — Accessibility Contract

Implements the WAI-ARIA APG Dialog (Modal) pattern. Content is
`role="dialog"` + `aria-modal="true"`, labelled by `DialogTitle` via
`aria-labelledby`, optionally described by `DialogDescription` via
`aria-describedby` (only set when a description is actually rendered).

## Behavior

- **Focus trap**: Tab/Shift+Tab cycle only through focusable elements
  inside the dialog panel while open. Implemented manually (queries
  focusable descendants on every Tab keypress) rather than via a shared
  hook, since this needed to be correct without an unverified API
  assumption — see "Known limitations" if you'd rather swap to
  `@acl/utils`'s `use-focus-trap`.
- **Initial focus**: moves to the dialog panel itself on open. Autofocus a
  specific element inside your content (e.g. a form's first input) if a
  different initial focus target is needed.
- **Focus restoration**: returns focus to whatever element had focus
  immediately before the dialog opened — not hardcoded to `DialogTrigger`,
  so this also works correctly for dialogs opened programmatically (e.g.
  from a keyboard shortcut or an async event).
- **Background inertness**: every sibling of the dialog's portal root gets
  the `inert` attribute while any dialog is open, removing the rest of the
  page from the tab order and from assistive-technology navigation
  entirely — a modal's contents must be the only reachable content.
- **Body scroll lock**: background scrolling is disabled while open, with
  scrollbar-width compensation (extra `padding-right`) so the page doesn't
  visibly shift when the scrollbar disappears.
- **Escape** closes the dialog (`closeOnEscape`, default on).
- **Overlay click** closes the dialog (`closeOnOverlayClick`, default on).

## Keyboard shortcuts

| Key                 | Action                             |
| ------------------- | ---------------------------------- |
| `Tab` / `Shift+Tab` | Cycle focus within the dialog only |
| `Escape`            | Closes the dialog                  |

## Known limitations

- **Nested dialogs**: Escape and the focus trap only consider the topmost
  dialog implicitly correct because each `DialogContent` instance traps
  independently and inertness stacks via a reference count — but two
  simultaneously open dialogs is an unusual pattern this library hasn't
  been deeply tested against. Prefer a single dialog at a time.
- **Manual focus trap**: works correctly for standard focusable elements
  (links, buttons, inputs, `[tabindex]`) but doesn't account for exotic
  custom widgets with non-standard focus behavior inside dialog content.
- **No `size="full"` / bottom-sheet variant** — only `sm`/`md`/`lg`/`xl`
  max-widths are provided; a true full-screen or mobile bottom-sheet
  layout would need a new `size` variant.
