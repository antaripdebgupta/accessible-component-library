import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Checkbox', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/iframe.html?id=components-checkbox--default');
  });

  test('has no axe violations', async ({ page }) => {
    const results = await new AxeBuilder({ page }).include('#storybook-root').analyze();
    expect(results.violations).toEqual([]);
  });

  test('is keyboard operable', async ({ page }) => {
    const checkbox = page.getByRole('checkbox', {
      name: 'Subscribe to newsletter',
    });

    await checkbox.focus();
    await expect(checkbox).toBeFocused();

    await expect(checkbox).not.toBeChecked();

    // Press Space to check
    await page.keyboard.press('Space');
    await expect(checkbox).toBeChecked();

    // Press Space to uncheck
    await page.keyboard.press('Space');
    await expect(checkbox).not.toBeChecked();
  });

  test('can be toggled by mouse click', async ({ page }) => {
    const checkbox = page.getByRole('checkbox', {
      name: 'Subscribe to newsletter',
    });

    await expect(checkbox).not.toBeChecked();
    await checkbox.click();
    await expect(checkbox).toBeChecked();
  });
});

test.describe('Checkbox — Indeterminate', () => {
  test('renders indeterminate state', async ({ page }) => {
    await page.goto('/iframe.html?id=components-checkbox--indeterminate');

    const checkbox = page.getByRole('checkbox', {
      name: 'Select all features',
    });

    // Checkbox has native indeterminate property set which results in the state attribute or native element property
    // We can evaluate element property
    const isIndeterminate = await checkbox.evaluate((el: HTMLInputElement) => el.indeterminate);
    expect(isIndeterminate).toBe(true);

    // Clicking it makes it checked
    await checkbox.click();
    await expect(checkbox).toBeChecked();
    const isIndeterminateAfterClick = await checkbox.evaluate(
      (el: HTMLInputElement) => el.indeterminate,
    );
    expect(isIndeterminateAfterClick).toBe(false);
  });
});
