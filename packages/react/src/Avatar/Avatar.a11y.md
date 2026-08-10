# Avatar — Accessibility Contract

## Overview

Displays a user image with graceful fallback to initials, then to a
generic person icon. The avatar element itself carries the accessible
name — its image content is always decorative to avoid double-announcing.

## Accessibility features

- The `<span role="img" aria-label>` on the outer element carries the one
  accessible name for the whole avatar (from `alt`, then `name`, then a
  generic "User avatar" default) — the inner `<img>`, initials text, and
  icon fallback are all `aria-hidden`/`alt=""` to prevent duplicate or
  conflicting announcements.
- Status badges (`AvatarStatusBadge`) require an explicit `label` prop —
  color alone (green/red/yellow dot) is never the sole conveyor of status,
  a visually-hidden text label always accompanies the dot.
- `AvatarGroup` wraps its avatars in `role="group"` with a required
  `aria-label` describing the group as a whole (e.g. "Project
  collaborators"), since the visual overlapping stack can otherwise read
  as an ambiguous sequence of unrelated images.
- The "+N" overflow avatar is either a real labeled `<button>` (when
  `onOverflowClick` is provided, e.g. to open a full member list) or a
  `role="img"` with a descriptive label ("3 more, 6 total") — never a bare
  unlabeled "+3" text node.
- `AvatarDropdown` composes the existing `DropdownMenu` component and
  requires an explicit `triggerLabel` — the avatar image inside the
  trigger button is marked decorative since the button itself carries the
  accessible name.

## Keyboard shortcuts

| Key               | Action                                                                                                          |
| ----------------- | --------------------------------------------------------------------------------------------------------------- |
| `Tab`             | Move focus to the overflow button or dropdown trigger (plain avatars are not focusable — they're static images) |
| `Enter` / `Space` | Activate the overflow button or open the dropdown trigger                                                       |

## ARIA attributes used

| Attribute                     | Element                   | Purpose                                     |
| ----------------------------- | ------------------------- | ------------------------------------------- |
| `role="img"` + `aria-label`   | Avatar root               | Single accessible name for the whole avatar |
| `alt=""` / `aria-hidden`      | inner image/initials/icon | Prevents duplicate announcement             |
| `role="group"` + `aria-label` | AvatarGroup               | Names the collection as a whole             |
| `aria-label`                  | overflow avatar/button    | States hidden and total count               |

## WCAG criteria satisfied

- **1.1.1 Non-text Content (A)** — every avatar has a text alternative,
  whether from a real name or a generic fallback.
- **1.4.1 Use of Color (A)** — status badges always pair color with a text
  label, never color alone.
- **4.1.2 Name, Role, Value (A)** — explicit roles and labels throughout,
  including the overflow summary avatar.

## Known limitations

- Image load failure detection uses a JS `Image()` probe rather than the
  native `<img onError>` alone, to avoid a flash of broken-image iconography
  before the fallback renders — this means a fallback may appear ~1 frame
  later than a naive `onError` approach on very fast connections, an
  acceptable trade-off for the flash it prevents.
- `AvatarGroup`'s overlap spacing (`-space-x-2`) does not yet expose a
  configurable overlap-amount prop — only the default spacing is available.
- Initials are derived from the first and last whitespace-separated name
  segments only; names in scripts without word-initial letter concepts (e.g.
  some CJK naming conventions) will fall back to the icon rather than
  meaningful initials — not specially handled in this version.
