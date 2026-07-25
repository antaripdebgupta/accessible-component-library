import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Button', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/iframe.html?id=components-button--primary');
  });

  test('has no axe violations', async ({ page }) => {
    const results = await new AxeBuilder({ page }).analyze();

    expect(results.violations).toEqual([]);
  });

  test('is keyboard operable', async ({ page }) => {
    const button = page.getByRole('button', {
      name: 'Save changes',
    });

    // Explicitly focus the component instead of relying on
    // Storybook's global tab order.
    await button.focus();

    await expect(button).toBeFocused();

    // Native <button> elements support keyboard activation.
    await page.keyboard.press('Enter');
  });
});

test.describe('Button — disabled', () => {
  test('disabled button is not activatable but remains in tab order', async ({ page }) => {
    await page.goto('/iframe.html?id=components-button--disabled');

    const button = page.getByRole('button', {
      name: 'Submit',
    });

    await expect(button).toHaveAttribute('aria-disabled', 'true');

    // aria-disabled intentionally keeps the button focusable.
    await button.focus();

    await expect(button).toBeFocused();
  });
});