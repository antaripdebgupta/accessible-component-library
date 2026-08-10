import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Input', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/iframe.html?id=components-input--field');
  });

  test('has no axe violations', async ({ page }) => {
    const results = await new AxeBuilder({ page }).include('#storybook-root').analyze();
    expect(results.violations).toEqual([]);
  });

  test('accepts user typing', async ({ page }) => {
    const input = page.getByRole('textbox', { name: 'Email Address' });
    await input.fill('test@example.com');
    await expect(input).toHaveValue('test@example.com');
  });
});

test.describe('Input — Password Toggle & Cursor Preservation', () => {
  test('toggles password mask while preserving cursor position', async ({ page }) => {
    await page.goto('/iframe.html?id=components-input--button-group-variant');

    const passwordInput = page.locator('input[type="password"]');
    await passwordInput.focus();

    // Type text into password field
    await passwordInput.fill('MySecretPassword');

    // Move cursor into middle (between 'Secret' and 'Password')
    await passwordInput.evaluate((el: HTMLInputElement) => {
      el.setSelectionRange(8, 8);
    });

    // Verify selection position
    const initialPos = await passwordInput.evaluate((el: HTMLInputElement) => el.selectionStart);
    expect(initialPos).toBe(8);

    // Click Show Password button
    const toggleButton = page.getByRole('button', { name: 'Show password' });
    await toggleButton.click();

    // Input should now be type="text"
    const textInput = page.locator('input[type="text"]').first();
    await expect(textInput).toHaveAttribute('type', 'text');
    await expect(textInput).toHaveValue('MySecretPassword');

    // Selection position should still be preserved
    const preservedPos = await textInput.evaluate((el: HTMLInputElement) => el.selectionStart);
    expect(preservedPos).toBe(8);
  });
});

test.describe('Input — FileInput Parity', () => {
  test('supports file selection via native click trigger', async ({ page }) => {
    await page.goto('/iframe.html?id=components-input--file');

    // Click file dropzone or native input
    const fileInput = page.locator('input[type="file"]');

    // Set file input files
    await fileInput.setInputFiles({
      name: 'document.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('dummy pdf content'),
    });

    await expect(page.getByText('document.pdf')).toBeVisible();
  });
});
