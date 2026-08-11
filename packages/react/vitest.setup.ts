import '@testing-library/jest-dom';
import * as jestAxeMatchers from 'jest-axe';
import { expect } from 'vitest';

expect.extend(jestAxeMatchers.toHaveNoViolations);

if (typeof window !== 'undefined' && !window.matchMedia) {
  window.matchMedia = (query: string) =>
    ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }) as unknown as MediaQueryList;
}
