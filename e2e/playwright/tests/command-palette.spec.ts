import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('CommandPalette — accessibility', () => {
  test('has no axe violations while open', async ({ page }) => {
    await page.goto('/iframe.html?id=components-commandpalette--default');
    await page.getByRole('button', { name: /Open/ }).click();
    await expect(page.getByRole('dialog', { name: 'Command palette' })).toBeVisible();

    const results = await new AxeBuilder({ page }).include('#storybook-root').analyze();
    expect(results.violations).toEqual([]);
  });
});

test.describe('CommandPalette — open/close', () => {
  test('button click opens the palette and focuses the input', async ({ page }) => {
    await page.goto('/iframe.html?id=components-commandpalette--default');
    await page.getByRole('button', { name: /Open/ }).click();
    await expect(page.getByRole('combobox')).toBeFocused();
  });

  test('Escape closes the palette and restores focus to the trigger', async ({ page }) => {
    await page.goto('/iframe.html?id=components-commandpalette--default');
    const trigger = page.getByRole('button', { name: /Open/ });
    await trigger.click();
    await expect(page.getByRole('dialog')).toBeVisible();

    await page.keyboard.press('Escape');
    await expect(page.getByRole('dialog')).toHaveCount(0);
    await expect(trigger).toBeFocused();
  });

  test('clicking outside the palette closes it', async ({ page }) => {
    await page.goto('/iframe.html?id=components-commandpalette--default');
    await page.getByRole('button', { name: /Open/ }).click();
    await expect(page.getByRole('dialog')).toBeVisible();

    await page.mouse.click(10, 10);
    await expect(page.getByRole('dialog')).toHaveCount(0);
  });

  test('clicking inside the panel does not close it', async ({ page }) => {
    await page.goto('/iframe.html?id=components-commandpalette--default');
    await page.getByRole('button', { name: /Open/ }).click();
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();

    await dialog.click();
    await expect(dialog).toBeVisible();
  });

  test('global hotkey (mod+k) toggles the palette', async ({ page }) => {
    await page.goto('/iframe.html?id=components-commandpalette--default');
    await page.getByRole('button', { name: /Open/ }).waitFor();
    await expect(page.getByRole('dialog')).toHaveCount(0);

    await page.keyboard.press('ControlOrMeta+k');
    await expect(page.getByRole('dialog')).toBeVisible();

    await page.keyboard.press('ControlOrMeta+k');
    await expect(page.getByRole('dialog')).toHaveCount(0);
  });
});

test.describe('CommandPalette — keyboard navigation', () => {
  test('ArrowDown/ArrowUp move aria-activedescendant, wrapping', async ({ page }) => {
    await page.goto('/iframe.html?id=components-commandpalette--default');
    await page.getByRole('button', { name: /Open/ }).click();
    const input = page.getByRole('combobox');

    const first = await input.getAttribute('aria-activedescendant');
    await page.keyboard.press('ArrowDown');
    const second = await input.getAttribute('aria-activedescendant');
    expect(second).not.toBe(first);

    // Enough ArrowDown presses to wrap all the way back to the first item.
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('ArrowDown');
    const wrapped = await input.getAttribute('aria-activedescendant');
    expect(wrapped).toBe(first);
  });

  test('Enter selects the highlighted item and closes the palette', async ({ page }) => {
    await page.goto('/iframe.html?id=components-commandpalette--default');
    await page.getByRole('button', { name: /Open/ }).click();
    await page.keyboard.press('Enter');
    await expect(page.getByRole('dialog')).toHaveCount(0);
  });

  test('clicking an item selects it', async ({ page }) => {
    await page.goto('/iframe.html?id=components-commandpalette--default');
    await page.getByRole('button', { name: /Open/ }).click();
    await page.getByRole('option', { name: 'View Profile' }).click();
    await expect(page.getByRole('dialog')).toHaveCount(0);
  });
});

test.describe('CommandPalette — groups', () => {
  test('group headings render with their items', async ({ page }) => {
    await page.goto('/iframe.html?id=components-commandpalette--groups');
    await page.getByRole('button', { name: /Open grouped/ }).click();

    await expect(page.getByText('Suggestions')).toBeVisible();
    await expect(page.getByText('Settings', { exact: true })).toBeVisible();
    await expect(page.getByRole('option', { name: 'Calendar' })).toBeVisible();
  });
});

test.describe('CommandPalette — async search reordering safety', () => {
  test('typing quickly only ever shows results for the latest query', async ({ page }) => {
    await page.goto('/iframe.html?id=components-commandpalette--async-search');
    await page.getByRole('button', { name: /Open async search/ }).click();
    const input = page.getByRole('combobox');

    await input.fill('a');
    await input.fill('ap');

    await expect(page.getByRole('option', { name: 'Apple' })).toBeVisible({ timeout: 1000 });
    await expect(page.getByRole('option', { name: 'Banana' })).toHaveCount(0);
  });

  test('loading indicator appears while a search is in flight', async ({ page }) => {
    await page.goto('/iframe.html?id=components-commandpalette--async-search');
    await page.getByRole('button', { name: /Open async search/ }).click();
    const input = page.getByRole('combobox');

    await input.fill('a');
    await expect(page.getByText('Searching...')).toBeVisible();
    await expect(page.getByText('Searching...')).toHaveCount(0, { timeout: 2000 });
  });
});

test.describe('CommandPalette — RTL', () => {
  test('renders and functions under dir=rtl', async ({ page }) => {
    await page.goto('/iframe.html?id=components-commandpalette--rtl');
    await page.getByRole('button', { name: 'فتح لوحة الأوامر' }).click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.getByRole('option', { name: 'ملف جديد' })).toBeVisible();
  });
});
