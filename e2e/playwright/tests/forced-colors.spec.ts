import { test, expect } from '@playwright/test';

test('forced colors — focus ring remains visible', async ({ page }) => {
  await page.emulateMedia({ forcedColors: 'active' });
  await page.goto('/iframe.html?id=components-button--primary');

  const button = page.locator('#storybook-root button').first();
  await button.waitFor({ state: 'visible' });

  // Focus directly rather than relying on Tab order inside Storybook's
  // iframe chrome — what we're actually testing is whether the focus
  // ring itself remains visible under forced-colors, not tab order.
  await button.focus();
  await expect(button).toBeFocused();

  const outline = await button.evaluate((el) => getComputedStyle(el).outlineStyle);
  expect(outline).not.toBe('none');
});
