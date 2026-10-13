# @accessly-ui/react

A production-grade, WCAG 2.2 AA accessible React component library — 22
styled, composable components built on [`@accessly-ui/primitives`](https://www.npmjs.com/package/@accessly-ui/primitives) and
themed with [`@accessly-ui/tailwind-preset`](https://www.npmjs.com/package/@accessly-ui/tailwind-preset).

Need unstyled behavior only, to skin yourself? See `@accessly-ui/primitives`.

## Install

```bash
npm install @accessly-ui/react @accessly-ui/tailwind-preset
```

`@accessly-ui/primitives` comes along automatically — only install it directly
if you want its unstyled hooks on their own.

Wire up the preset in your CSS:

```css
@import 'tailwindcss';
@import '@accessly-ui/tailwind-preset/theme.css';
@source '../node_modules/@accessly-ui/react/dist/**/*.js';
```

## Usage

```tsx
import {
  ThemeProvider,
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  Button,
} from '@accessly-ui/react';

function App() {
  return (
    <ThemeProvider defaultMode="system">
      <Dialog>
        <DialogTrigger>
          <Button variant="primary">Open</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Hello</DialogTitle>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </ThemeProvider>
  );
}
```

## Components (22)

Accordion · Alert · Avatar · AvatarGroup · AvatarDropdown · Breadcrumb ·
Button · Carousel · Checkbox · Combobox · CommandPalette · DataTable ·
Dialog · DropdownMenu · Input · Pagination · RadioGroup · Skeleton ·
Switch · Tabs · Textarea · Toast · Tooltip · TreeView

Every component is composable (e.g. `Dialog` → `DialogHeader` /
`DialogBody` / `DialogFooter`) rather than a single do-everything prop API,
ships with a colocated `.a11y.md` accessibility contract, and is covered by
Storybook keyboard `play` tests plus Playwright accessibility-tree e2e
tests.

## Theming

Light, dark, and system themes are supported out of the box via
`ThemeProvider`/`ThemeToggle`, synced to the OS by default:

```tsx
import { ThemeProvider, ThemeToggle } from '@accessly-ui/react';

<ThemeProvider defaultMode="system">
  <ThemeToggle />
  {/* app */}
</ThemeProvider>;
```

## Accessibility

Every component targets WCAG 2.2 AA, verified with axe-core, Playwright
keyboard-navigation tests, and manual NVDA screen reader passes. See each
component's `.a11y.md` for its specific contract and keyboard shortcuts.

## Part of Accessly UI

- [`@accessly-ui/primitives`](https://www.npmjs.com/package/@accessly-ui/primitives) — headless, unstyled component logic
- [`@accessly-ui/tailwind-preset`](https://www.npmjs.com/package/@accessly-ui/tailwind-preset) — design tokens
- [`@accessly-ui/utils`](https://www.npmjs.com/package/@accessly-ui/utils) — shared hooks

## License

MIT
