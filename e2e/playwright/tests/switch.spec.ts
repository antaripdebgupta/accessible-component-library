import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Switch', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/iframe.html?id=components-switch--default');
  });

  test('has no axe violations', async ({ page }) => {
    const results = await new AxeBuilder({ page }).include('#storybook-root').analyze();
    expect(results.violations).toEqual([]);
  });

  test('is keyboard operable', async ({ page }) => {
    const toggle = page.getByRole('switch', {
      name: 'Dark Mode',
    });

    await toggle.focus();
    await expect(toggle).toBeFocused();

    await expect(toggle).toHaveAttribute('aria-checked', 'false');

    // Press Space to toggle on
    await page.keyboard.press('Space');
    await expect(toggle).toHaveAttribute('aria-checked', 'true');

    // Wait for rapid toggle protection debounce
    await page.waitForTimeout(250);

    // Press Enter to toggle off
    await page.keyboard.press('Enter');
    await expect(toggle).toHaveAttribute('aria-checked', 'false');
  });

  test('can be toggled by mouse click', async ({ page }) => {
    const toggle = page.getByRole('switch', {
      name: 'Dark Mode',
    });

    await expect(toggle).toHaveAttribute('aria-checked', 'false');
    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-checked', 'true');
  });
});
