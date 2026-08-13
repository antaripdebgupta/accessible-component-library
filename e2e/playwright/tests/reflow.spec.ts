import { test, expect } from '@playwright/test';

test.describe.configure({ mode: 'serial' });

const stories = [
  'button--primary',
  'data-table--full-featured',
  'command-palette--default',
  'combobox--default',
];

for (const story of stories) {
  test(`${story} has no horizontal scroll at 320px width`, async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 800 });
    await page.goto(`/iframe.html?id=components-${story}`, { waitUntil: 'domcontentloaded' });
    await page.waitForLoadState('networkidle');

    const hasHScroll = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
    );

    if (hasHScroll) {
      const overflowing = await page.evaluate(() => {
        const vw = document.documentElement.clientWidth;
        const all = Array.from(document.querySelectorAll('body *'));
        return all
          .filter((el) => el.getBoundingClientRect().right > vw + 0.5)
          .map((el) => ({
            tag: el.tagName,
            id: el.id,
            class: (el as HTMLElement).className?.toString().slice(0, 120),
            right: Math.round(el.getBoundingClientRect().right),
            width: Math.round(el.getBoundingClientRect().width),
          }))
          .slice(0, 8);
      });
      console.log(
        `\n[${story}] scrollWidth overflow — offending elements:`,
        JSON.stringify(overflowing, null, 2),
      );
    }

    expect(hasHScroll).toBe(false);
  });
}
