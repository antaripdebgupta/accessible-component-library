import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Tooltip — accessibility', () => {
  test('has no axe violations while open', async ({ page }) => {
    await page.goto('/iframe.html?id=components-tooltip--default');
    const trigger = page.getByRole('button', { name: 'Hover or focus me' });
    await trigger.focus();
    await expect(page.getByRole('tooltip')).toBeVisible();

    const results = await new AxeBuilder({ page }).include('#storybook-root').analyze();
    expect(results.violations).toEqual([]);
  });

  test('aria-describedby links trigger to the visible tooltip', async ({ page }) => {
    await page.goto('/iframe.html?id=components-tooltip--default');
    const trigger = page.getByRole('button', { name: 'Hover or focus me' });
    await trigger.focus();

    const tooltip = page.getByRole('tooltip');
    await expect(tooltip).toBeVisible();

    const describedby = await trigger.getAttribute('aria-describedby');
    const tooltipId = await tooltip.getAttribute('id');
    expect(describedby).toBe(tooltipId);
  });
});

test.describe('Tooltip — focus behavior', () => {
  test('shows immediately on focus, hides on blur', async ({ page }) => {
    await page.goto('/iframe.html?id=components-tooltip--default');
    const trigger = page.getByRole('button', { name: 'Hover or focus me' });

    await expect(page.getByRole('tooltip')).toHaveCount(0);
    await trigger.focus();
    await expect(page.getByRole('tooltip')).toBeVisible();

    await trigger.blur();
    await expect(page.getByRole('tooltip')).toHaveCount(0);
  });

  test('Escape dismisses an open tooltip', async ({ page }) => {
    await page.goto('/iframe.html?id=components-tooltip--default');
    await page.getByRole('button', { name: 'Hover or focus me' }).focus();
    await expect(page.getByRole('tooltip')).toBeVisible();

    await page.keyboard.press('Escape');
    await expect(page.getByRole('tooltip')).toHaveCount(0);
  });
});

test.describe('Tooltip — hover behavior', () => {
  test('shows on hover after the configured delay', async ({ page }) => {
    await page.goto('/iframe.html?id=components-tooltip--hover-delay');
    const trigger = page.getByRole('button', { name: 'Hover and wait 600ms' });

    await trigger.hover();
    await expect(page.getByRole('tooltip')).toHaveCount(0);
    await expect(page.getByRole('tooltip')).toBeVisible({ timeout: 1000 });
  });

  test('moving the pointer onto the tooltip keeps it open (hoverable)', async ({ page }) => {
    await page.goto('/iframe.html?id=components-tooltip--default');
    const trigger = page.getByRole('button', { name: 'Hover or focus me' });

    await trigger.hover();
    const tooltip = page.getByRole('tooltip');
    await expect(tooltip).toBeVisible();

    await tooltip.hover();
    await page.waitForTimeout(150);
    await expect(tooltip).toBeVisible();
  });
});

test.describe('Tooltip — disabled', () => {
  test('never appears when disabled', async ({ page }) => {
    await page.goto('/iframe.html?id=components-tooltip--disabled');
    await page.getByRole('button', { name: 'Tooltip disabled' }).waitFor();
    await page.keyboard.press('Tab');
    await page.waitForTimeout(200);
    await expect(page.getByRole('tooltip')).toHaveCount(0);
  });
});

test.describe('Tooltip — RTL', () => {
  test('renders and functions under dir=rtl', async ({ page }) => {
    await page.goto('/iframe.html?id=components-tooltip--rtl');
    const trigger = page.getByRole('button', { name: 'أعلى' });
    await trigger.focus();
    await expect(page.getByRole('tooltip')).toBeVisible();
  });
});
