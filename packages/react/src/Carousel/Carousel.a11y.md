# Carousel — Accessibility Contract

## Overview

Implements the WAI-ARIA APG Carousel pattern: a `role="region"` wrapping
`aria-roledescription="carousel"`, containing slides marked
`aria-roledescription="slide"`, with real labeled `<button>` controls for
navigation — never icon-only unlabeled affordances.

## Accessibility features

- `role="region"` + `aria-roledescription="carousel"` on the root, and a
  required `aria-label` (enforced by the TypeScript prop type) — a
  carousel with no accessible name is one of the most common real-world
  carousel accessibility failures.
- Each slide is `aria-roledescription="slide"` with `aria-label="N of M"`.
- A visually-hidden polite live region announces "Slide N of M" whenever
  the active slide changes, so screen reader users get the same context
  sighted users get from watching the transition.
- Autoplay always ships with a visible, labeled pause/play control
  (`CarouselPlayPauseButton`) — required per WCAG 2.2.2, not optional.
- Autoplay pauses automatically on hover **and** keyboard focus, resuming
  only when both are cleared — consistent with Toast's pause behavior.
- Autoplay is disabled entirely (not just paused) when
  `prefers-reduced-motion: reduce` is set — the carousel opens already
  paused for those users rather than requiring them to find the pause
  button first.
- Slide transitions animate via `transform`, and that transition is fully
  removed (not shortened) under `motion-reduce:` — slide changes become
  instant rather than animated.
- Previous/Next buttons carry explicit `aria-label`s ("Previous slide" /
  "Next slide"), and are disabled (with `aria-disabled` semantics via
  native `disabled`) at the boundaries when `loop={false}`.
- Dot indicators use `aria-current="true"` on the active dot and
  `aria-label="Go to slide N"` on each — never bare unlabeled dots.
- RTL: arrow key meaning mirrors automatically (Left/Right swap) matching
  the same convention used in Tabs and Menu, and the slide track's
  transform direction is inverted so "next" still advances toward
  reading-start under `dir="rtl"`.

## Keyboard shortcuts

| Key                        | Action                                                                                                     |
| -------------------------- | ---------------------------------------------------------------------------------------------------------- |
| `Tab`                      | Move focus into the slide viewport (single stop), then to Prev/Next/dots/play-pause buttons                |
| `ArrowRight` / `ArrowLeft` | Next/previous slide (horizontal orientation, mirrored under RTL) — active only when the viewport has focus |
| `ArrowDown` / `ArrowUp`    | Next/previous slide (vertical orientation)                                                                 |
| `Home`                     | Jump to first slide                                                                                        |
| `End`                      | Jump to last slide                                                                                         |

## ARIA attributes used

| Attribute                                           | Element                          | Purpose                                          |
| --------------------------------------------------- | -------------------------------- | ------------------------------------------------ |
| `role="region"` + `aria-roledescription="carousel"` | root                             | Identifies the carousel widget                   |
| `aria-roledescription="slide"`                      | each slide                       | Identifies individual slides                     |
| `aria-label`                                        | slide                            | "N of M" positional context                      |
| `aria-label`                                        | Prev/Next/dot/play-pause buttons | Explicit accessible names, no icon-only controls |
| `aria-current="true"`                               | active dot                       | Marks the currently shown slide's indicator      |
| `aria-live="polite"`                                | hidden live region               | Announces slide changes                          |

## WCAG criteria satisfied

- **2.2.2 Pause, Stop, Hide (A)** — autoplay always has a visible pause
  control and pauses on hover/focus.
- **2.1.1 Keyboard (A)** — full operability via the shortcuts table above.
- **2.4.7 Focus Visible (AA)** — `.focus-ring-safe` on the viewport and all
  buttons.
- **4.1.2 Name, Role, Value (A)** — explicit roles, labels, and current-state
  indication on every control.
- **1.4.13 Content on Hover or Focus (AA)** — not applicable (no
  hover-triggered popover content), included for audit completeness.

## Known limitations

- Swipe/touch gesture support is not implemented — navigation is
  keyboard/click only in this version.
- No built-in lazy-loading of off-screen slide content; all slides mount
  simultaneously. For carousels with heavy media, consider lazy-loading
  images within your own slide content.
- `slidesPerView` combined with `loop={true}` can produce a final "page"
  with fewer trailing slides than `slidesPerView` — this is visually
  acceptable but not specially handled/padded.
