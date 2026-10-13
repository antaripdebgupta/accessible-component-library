# @accessly-ui/utils

Shared low-level React hooks used across [`@accessly-ui/primitives`](https://www.npmjs.com/package/@accessly-ui/primitives)
and [`@accessly-ui/react`](https://www.npmjs.com/package/@accessly-ui/react). Framework-agnostic
within React — no styling, no component logic, just the small cross-cutting
behaviors every accessible component ends up needing.

## Install

```bash
npm install @accessly-ui/utils
```

## What's included

- `useControllableState` — controlled/uncontrolled value handling with a single API
- `useFocusTrap` — traps focus within a container (dialogs, menus, popovers)
- `useEscapeKey` — fires a callback on `Escape`, respecting focus scope
- `useRovingTabIndex` — roving `tabindex` for composite widgets (toolbars, tab lists, trees)
- `useStableId` — SSR-safe, hydration-safe unique IDs for ARIA attribute wiring
- `useTypeahead` — type-to-select behavior for listbox-like widgets
- `useDirection` — reads and reacts to `dir="rtl"`/`dir="ltr"` context
- `useReducedMotion` — respects `prefers-reduced-motion`
- `LiveRegion` — a visually-hidden `aria-live` region helper for announcements

## Usage

```tsx
import { useFocusTrap, useEscapeKey } from '@accessly-ui/utils';

function CustomPanel({ onClose }: { onClose: () => void }) {
  const ref = useFocusTrap<HTMLDivElement>();
  useEscapeKey(onClose);

  return (
    <div ref={ref} role="dialog" aria-modal="true">
      ...
    </div>
  );
}
```

These hooks are the same primitives `@accessly-ui/primitives` is built on — useful
on their own if you're building fully custom components and just want the
accessibility plumbing handled correctly.

## Part of Accessly UI

- [`@accessly-ui/primitives`](https://www.npmjs.com/package/@accessly-ui/primitives) — headless, unstyled component logic
- [`@accessly-ui/react`](https://www.npmjs.com/package/@accessly-ui/react) — styled, composable components
- [`@accessly-ui/tailwind-preset`](https://www.npmjs.com/package/@accessly-ui/tailwind-preset) — design tokens

## License

MIT
