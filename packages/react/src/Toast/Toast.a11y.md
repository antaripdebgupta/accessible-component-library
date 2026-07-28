# Toast — Accessibility Contract

## Overview
Transient notification system: `ToastProvider` (wrap your app once) +
`useToast()` hook + internal queue. For persistent, must-see-on-load
messaging, use Alert instead.

## Accessibility features
- Each toast uses `role="status"` (implicit polite live region) — doesn't
  interrupt whatever the user is currently doing, unlike `role="alert"`.
- Auto-dismiss timer pauses on hover **and** keyboard focus (`onFocus`),
  resuming on `blur`/`mouseleave` — a screen reader or keyboard user
  actively reading the toast never has it vanish mid-read.
- A visible, labeled dismiss button (`aria-label="Dismiss notification"`)
  is always present, regardless of `duration` — auto-dismiss is never the
  only way to close it.
- `duration: 0` disables auto-dismiss entirely for toasts that require
  explicit acknowledgment.
- The toast viewport is a single labeled region (`aria-label="Notifications"`)
  so AT users can find it as a landmark rather than stumbling on it mid-page.
- Icon is `aria-hidden` — variant meaning is carried by icon shape + text,
  not color alone.

## Keyboard shortcuts
| Key | Action |
|---|---|
| `Tab` | Move focus to the dismiss button (pauses the timer) |
| `Enter` / `Space` | Dismiss (when dismiss button focused) |

## ARIA attributes used
| Attribute | Element | Purpose |
|---|---|---|
| `role="status"` | toast container | Polite live-region announcement |
| `aria-atomic="true"` | toast container | Announces full message, not partial diffs |
| `aria-label` | viewport container | Landmark label for the notification region |
| `aria-label="Dismiss notification"` | close button | Programmatic name for icon-only button |

## WCAG criteria satisfied
- **4.1.3 Status Messages (AA)** — announced without moving focus.
- **2.2.1 Timing Adjustable (A)** — timer pauses on hover/focus; always
  dismissible manually; `duration: 0` opts out of timing entirely.
- **1.4.13 Content on Hover or Focus (AA)** — dismissible, and persists
  while hovered/focused instead of disappearing underneath the pointer.
- **1.4.1 Use of Color (A)** — variant conveyed via icon + text, not color alone.

## Known limitations
- Multiple toasts pushed in rapid succession are not yet throttled at the
  announcement level — concurrent polite announcements may overlap or get
  cut off by some screen readers.
- No `assertive` variant for critical/urgent toasts yet — use Alert for
  anything that must interrupt immediately.
- `placement` is provider-wide only; per-toast placement overrides aren't
  supported.