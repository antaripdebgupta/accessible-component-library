import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

let storyIndex: any = null;
for (let i = 0; i < 15; i++) {
  try {
    const res = await fetch('http://localhost:6006/index.json');
    if (res.ok) {
      storyIndex = await res.json();
      break;
    }
  } catch {
    await new Promise((r) => setTimeout(r, 1000));
  }
}

const storyIds = storyIndex ? Object.keys(storyIndex.entries ?? storyIndex.stories) : [];

for (const id of storyIds) {
  test(`axe: ${id}`, async ({ page }) => {
    await page.goto(`/iframe.html?id=${id}`);
    const results = await new AxeBuilder({ page })
      .include('#storybook-root')
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
      .analyze();
    expect(results.violations, id).toEqual([]);
  });
}
