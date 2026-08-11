# Skeleton — Accessibility Contract

## Overview

Shimmering placeholder blocks shown while content loads. All individual
`Skeleton` shapes are decorative and hidden from assistive technology —
loading state is instead announced once, at the container level, via
`SkeletonGroup`.

## Accessibility features

- Every `Skeleton` shape carries `aria-hidden="true"` and `role="presentation"`
  — screen readers never encounter meaningless placeholder shapes, and
  never announce "image" or "region" for shimmer blocks that convey no
  content.
- `SkeletonGroup` is the single point where loading state becomes
  perceivable to AT: it sets `aria-busy` and a polite `aria-live` region
  with a descriptive label (e.g. "Loading profile"). This means a form
  with 8 skeleton fields inside a `SkeletonGroup` announces "Loading
  profile" exactly once — not 8 times — avoiding the common real-world
  mistake of making every shimmer block individually announce loading.
- The shimmer sweep animation is fully removed (not shortened) under
  `prefers-reduced-motion: reduce` — a plain static block with reduced
  opacity is shown instead of an animated sweep, since animated shimmer is
  exactly the category of motion that preference exists to suppress.
- Preset compositions (`SkeletonCard`, `SkeletonForm`, `SkeletonTable`,
  etc.) are pure layout arrangements of `Skeleton` shapes with no
  additional ARIA needed beyond what's already handled by `Skeleton` and
  `SkeletonGroup`.

## Keyboard shortcuts

None — skeletons are non-interactive, static placeholders.

## ARIA attributes used

| Attribute                           | Element                 | Purpose                                  |
| ----------------------------------- | ----------------------- | ---------------------------------------- |
| `aria-hidden="true"`                | every Skeleton shape    | Hides decorative shimmer shapes from AT  |
| `role="presentation"`               | every Skeleton shape    | Reinforces no semantic meaning           |
| `aria-busy`                         | SkeletonGroup container | Marks the region as loading              |
| `aria-live="polite"` + `aria-label` | SkeletonGroup container | Single, descriptive loading announcement |

## WCAG criteria satisfied

- **4.1.3 Status Messages (AA)** — loading state is announced via
  `SkeletonGroup`'s live region without requiring focus to move.
- **2.3.3 Animation from Interactions (AAA, applied as best practice)** —
  shimmer animation is disabled entirely under `prefers-reduced-motion`.
- **1.3.1 Info and Relationships (A)** — decorative placeholder shapes are
  correctly excluded from the accessibility tree rather than being
  announced as meaningless content.

## Known limitations

- `SkeletonGroup` announces loading start via `aria-live`/`aria-busy`, but
  does not separately announce loading _completion_ — when `loading`
  flips to `false` and real content replaces the fallback, screen readers
  typically pick up the new content naturally since it replaces the busy
  region, but no explicit "content loaded" announcement is added. For
  critical flows where an explicit completion announcement matters, wire
  a separate `LiveRegionProvider.announce()` call (from `@acl/utils`)
  alongside your data-fetch completion.
- Shimmer sweep direction does not adapt for RTL — this is intentional
  (the animation carries no directional/semantic meaning, unlike icons or
  layout), but is called out here since it's a common question when
  auditing RTL support component-by-component.
