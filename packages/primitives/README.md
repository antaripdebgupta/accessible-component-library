# @accessly-ui/primitives

Headless, unstyled, WCAG 2.2 AA–correct component logic for React. No markup
opinions, no CSS — just state management, keyboard navigation, focus
handling, and ARIA wiring, so you can build your own styled components on a
foundation that's already accessible.

If you want working, pre-styled components instead, see
[`@accessly-ui/react`](https://www.npmjs.com/package/@accessly-ui/react), which is built on top of this package.

## Install

```bash
npm install @accessly-ui/primitives
```

## What's included

22 component behaviors, each exported as a hook: `useAccordion`, `useAlert`,
`useAvatar`/`useAvatarGroup`, `useBreadcrumb`, `useButton`, `useCarousel`,
`useCheckbox`, `useCombobox`, `useCommandPalette`, `useDataTable`, `useDialog`,
`useDropdownMenu`, `useInput`, `usePagination`, `useRadioGroup`, `useSkeleton`,
`useSwitch`, `useTabs`, `useTextarea`, `useTooltip`, `useTree`.

Each hook returns the props, state, and refs you wire onto your own markup —
you own the DOM structure and all styling.

## Usage

```tsx
import { useDialog } from '@accessly-ui/primitives';

function CustomDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { triggerProps, contentProps, overlayProps } = useDialog({ open, onOpenChange });

  return (
    <>
      <button {...triggerProps}>Open</button>
      {open && (
        <div {...overlayProps} className="my-own-overlay-styles">
          <div {...contentProps} className="my-own-dialog-styles">
            {/* your markup */}
          </div>
        </div>
      )}
    </>
  );
}
```

Every hook follows the [WAI-ARIA Authoring Practices Guide](https://www.w3.org/WAI/ARIA/apg/)
for its pattern — keyboard behavior, focus order, and ARIA attributes are
handled for you; only presentation is left to you.

## Part of Accessly UI

- [`@accessly-ui/react`](https://www.npmjs.com/package/@accessly-ui/react) — styled components built on this package
- [`@accessly-ui/tailwind-preset`](https://www.npmjs.com/package/@accessly-ui/tailwind-preset) — design tokens
- [`@accessly-ui/utils`](https://www.npmjs.com/package/@accessly-ui/utils) — shared hooks this package is built on

## License

MIT
