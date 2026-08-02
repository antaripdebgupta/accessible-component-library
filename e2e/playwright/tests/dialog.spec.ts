import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Dialog — accessibility', () => {
  test('has no axe violations while open', async ({ page }) => {
    await page.goto('/iframe.html?id=components-dialog--default');
    await page.getByRole('button', { name: 'Open dialog' }).click();
    await expect(page.getByRole('dialog')).toBeVisible();

    const results = await new AxeBuilder({ page }).include('#storybook-root').analyze();
    expect(results.violations).toEqual([]);
  });

  test('dialog is labelled and marked modal', async ({ page }) => {
    await page.goto('/iframe.html?id=components-dialog--default');
    await page.getByRole('button', { name: 'Open dialog' }).click();

    const dialog = page.getByRole('dialog');
    await expect(dialog).toHaveAttribute('aria-modal', 'true');
    await expect(dialog).toBeVisible();
  });
});

test.describe('Dialog — open/close', () => {
  test('trigger opens the dialog and focuses the panel', async ({ page }) => {
    await page.goto('/iframe.html?id=components-dialog--default');
    await page.getByRole('button', { name: 'Open dialog' }).click();
    await expect(page.getByRole('dialog')).toBeFocused();
  });

  test('Escape closes the dialog and restores focus to the trigger', async ({ page }) => {
    await page.goto('/iframe.html?id=components-dialog--default');
    const trigger = page.getByRole('button', { name: 'Open dialog' });
    await trigger.click();
    await expect(page.getByRole('dialog')).toBeVisible();

    await page.keyboard.press('Escape');
    await expect(page.getByRole('dialog')).toHaveCount(0);
    await expect(trigger).toBeFocused();
  });

  test('clicking outside the dialog closes it', async ({ page }) => {
    await page.goto('/iframe.html?id=components-dialog--default');
    await page.getByRole('button', { name: 'Open dialog' }).click();
    await expect(page.getByRole('dialog')).toBeVisible();

    await page.mouse.click(10, 10);
    await expect(page.getByRole('dialog')).toHaveCount(0);
  });

  test('clicking inside the dialog does not close it', async ({ page }) => {
    await page.goto('/iframe.html?id=components-dialog--default');
    await page.getByRole('button', { name: 'Open dialog' }).click();
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();

    await dialog.click();
    await expect(dialog).toBeVisible();
  });

  test('Cancel button closes the dialog', async ({ page }) => {
    await page.goto('/iframe.html?id=components-dialog--default');
    await page.getByRole('button', { name: 'Open dialog' }).click();
    await page.getByRole('button', { name: 'Cancel' }).click();
    await expect(page.getByRole('dialog')).toHaveCount(0);
  });
});

test.describe('Dialog — close button variants', () => {
  test('built-in close (X) button closes the dialog', async ({ page }) => {
    await page.goto('/iframe.html?id=components-dialog--close-button');
    await page.getByRole('button', { name: 'Feedback' }).click();
    await expect(page.getByRole('dialog')).toBeVisible();

    await page.getByRole('button', { name: 'Close' }).first().click();
    await expect(page.getByRole('dialog')).toHaveCount(0);
  });

  test('dialog without a close button has no X rendered', async ({ page }) => {
    await page.goto('/iframe.html?id=components-dialog--no-close-button');
    await page.getByRole('button', { name: 'Open without close button' }).click();
    await expect(page.getByRole('dialog')).toBeVisible();

    // Only the footer's explicit Cancel/Confirm buttons should exist —
    // no unlabeled "Close" icon button.
    await expect(page.getByRole('button', { name: 'Cancel' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Confirm' })).toBeVisible();
  });
});

test.describe('Dialog — focus trap', () => {
  test('Tab cycles within the dialog and does not escape to the page', async ({ page }) => {
    await page.goto('/iframe.html?id=components-dialog--default');
    await page.getByRole('button', { name: 'Open dialog' }).click();
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeFocused();

    // Tab repeatedly; focus should always remain within the dialog.
    for (let i = 0; i < 10; i++) {
      await page.keyboard.press('Tab');
      const activeInDialog = await page.evaluate(() => {
        const dialogEl = document.querySelector('[role="dialog"]');
        return dialogEl?.contains(document.activeElement) ?? false;
      });
      expect(activeInDialog).toBe(true);
    }
  });
});

test.describe('Dialog — scrollable content', () => {
  test('body content scrolls independently while header/footer stay fixed', async ({ page }) => {
    await page.goto('/iframe.html?id=components-dialog--scrollable-content');
    await page.getByRole('button', { name: 'Open scrollable dialog' }).click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.getByText('Changelog')).toBeVisible();

    await page.getByText('v1.1.0').scrollIntoViewIfNeeded();
    await expect(page.getByText('v1.1.0')).toBeVisible();
    // Header should still be visible after scrolling the body.
    await expect(page.getByText('Changelog')).toBeVisible();
  });

  test('background does not scroll while dialog is open', async ({ page }) => {
    await page.goto('/iframe.html?id=components-dialog--scrollable-content');
    const bodyOverflowBefore = await page.evaluate(() => document.body.style.overflow);
    await page.getByRole('button', { name: 'Open scrollable dialog' }).click();
    await expect(page.getByRole('dialog')).toBeVisible();

    const bodyOverflowOpen = await page.evaluate(() => document.body.style.overflow);
    expect(bodyOverflowOpen).toBe('hidden');
    expect(bodyOverflowOpen).not.toBe(bodyOverflowBefore);
  });
});

test.describe('Dialog — sticky footer', () => {
  test('footer remains visible while body content scrolls', async ({ page }) => {
    await page.goto('/iframe.html?id=components-dialog--sticky-footer');
    await page.getByRole('button', { name: 'Open sticky-footer dialog' }).click();
    await expect(page.getByRole('dialog')).toBeVisible();

    await expect(page.getByRole('button', { name: 'Accept' })).toBeVisible();
    await page.getByText('Section 10:').scrollIntoViewIfNeeded();
    await expect(page.getByRole('button', { name: 'Accept' })).toBeVisible();
  });
});

test.describe('Dialog — RTL', () => {
  test('renders and functions under dir=rtl', async ({ page }) => {
    await page.goto('/iframe.html?id=components-dialog--rtl');
    await page.getByRole('button', { name: 'فتح الحوار' }).click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.getByText('تعديل الملف الشخصي')).toBeVisible();
  });
});
