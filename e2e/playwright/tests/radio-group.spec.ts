import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('RadioGroup', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/iframe.html?id=components-radiogroup--default');
  });

  test('has no axe violations', async ({ page }) => {
    const results = await new AxeBuilder({ page }).include('#storybook-root').analyze();
    expect(results.violations).toEqual([]);
  });

  test('keyboard navigation with arrow keys and roving focus', async ({ page }) => {
    const radio1 = page.getByRole('radio', { name: 'Standard Shipping' });
    const radio2 = page.getByRole('radio', { name: 'Express Shipping' });
    const radio3 = page.getByRole('radio', { name: 'Overnight Shipping' });

    // Focus the first radio
    await radio1.focus();
    await expect(radio1).toBeFocused();

    // Roving focus: ArrowDown to move to second radio
    await page.keyboard.press('ArrowDown');
    await expect(radio2).toBeFocused();
    await expect(radio2).toBeChecked();

    // ArrowDown to move to third radio
    await page.keyboard.press('ArrowDown');
    await expect(radio3).toBeFocused();
    await expect(radio3).toBeChecked();

    // ArrowUp back to second radio
    await page.keyboard.press('ArrowUp');
    await expect(radio2).toBeFocused();
    await expect(radio2).toBeChecked();
  });

  test('skips disabled options during arrow key navigation', async ({ page }) => {
    await page.goto('/iframe.html?id=components-radiogroup--disabled-items');

    const radio1 = page.getByRole('radio', { name: 'Credit Card' });
    const radio3 = page.getByRole('radio', { name: 'Apple Pay' });

    await radio1.focus();
    await expect(radio1).toBeFocused();

    // ArrowDown should skip disabled PayPal and focus Apple Pay
    await page.keyboard.press('ArrowDown');
    await expect(radio3).toBeFocused();
    await expect(radio3).toBeChecked();
  });
});
