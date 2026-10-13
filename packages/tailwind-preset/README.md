# @accessly-ui/tailwind-preset

Design tokens for Accessly UI, shipped as a Tailwind CSS v4 preset (CSS-first)
plus a plain JS export for anyone not using Tailwind. Powers the look of
[`@accessly-ui/react`](https://www.npmjs.com/package/@accessly-ui/react), and safe to use standalone if you're styling
[`@accessly-ui/primitives`](https://www.npmjs.com/package/@accessly-ui/primitives) yourself.

## Install

```bash
npm install @accessly-ui/tailwind-preset
```

## Usage with Tailwind CSS v4

```css
/* src/index.css */
@import 'tailwindcss';
@import '@accessly-ui/tailwind-preset/theme.css';
```

That's it — no `tailwind.config.js` `presets` array needed, since v4 is
CSS-first. If you're also consuming `@accessly-ui/react`, add a `@source` so
Tailwind scans its compiled classes:

```css
@source '../node_modules/@accessly-ui/react/dist/**/*.js';
```

## Usage without Tailwind

```js
import { tokens } from '@accessly-ui/tailwind-preset';

tokens.color.primary; // → the raw token value
```

## Theming

Tokens are defined for light and dark via class-based selectors (`.light` /
`.dark`), plus a `prefers-color-scheme` media query for automatic OS sync
when no explicit choice has been made. Toggle by adding/removing the
`.light`/`.dark` class on any ancestor element — it doesn't have to be
`<html>`, which also makes it safe to use inside embedded contexts like
Storybook.

## Part of Accessly UI

- [`@accessly-ui/primitives`](https://www.npmjs.com/package/@accessly-ui/primitives) — headless, unstyled component logic
- [`@accessly-ui/react`](https://www.npmjs.com/package/@accessly-ui/react) — styled, composable components built with these tokens
- [`@accessly-ui/utils`](https://www.npmjs.com/package/@accessly-ui/utils) — shared hooks

## License

MIT
