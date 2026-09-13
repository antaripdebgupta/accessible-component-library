import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Textarea', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/iframe.html?id=components-textarea--field');
  });

  test('has no axe violations', async ({ page }) => {
    const results = await new AxeBuilder({ page }).include('#storybook-root').analyze();
    expect(results.violations).toEqual([]);
  });

  test('accepts text input and maintains label association', async ({ page }) => {
    const textarea = page.getByRole('textbox', { name: 'User Feedback' });
    await textarea.fill('Testing Playwright input');
    await expect(textarea).toHaveValue('Testing Playwright input');
  });
});

test.describe('Textarea — AutoResize on Paste', () => {
  test('recalculates height immediately upon pasting multi-line text', async ({ page }) => {
    await page.goto('/iframe.html?id=components-textarea--auto-resize');

    const textarea = page.getByRole('textbox', { name: 'Auto-resizing Textarea' });

    // Initial bounding box
    const initialBox = await textarea.boundingBox();
    expect(initialBox).not.toBeNull();

    const multilineText = 'Line 1\nLine 2\nLine 3\nLine 4\nLine 5\nLine 6';

    // Focus and fill multiline text (simulating paste)
    await textarea.focus();
    await textarea.fill(multilineText);

    // Bounding box after pasting
    const newBox = await textarea.boundingBox();
    expect(newBox).not.toBeNull();
    expect(newBox!.height).toBeGreaterThan(initialBox!.height);
  });
});

test.describe('Textarea — Submit on Enter', () => {
  test('submits on Enter keypress in chat button variant', async ({ page }) => {
    await page.goto('/iframe.html?id=components-textarea--button-variant');

    const textarea = page.getByRole('textbox', { name: 'Chat Input' });
    await textarea.fill('Hello world');
    await textarea.press('Enter');

    // Check the submitted message appeared in the chat feed, not the textarea value itself.
    const message = page.locator('div.bg-surface').getByText('Hello world', { exact: true });
    await expect(message).toBeVisible();
  });
});
