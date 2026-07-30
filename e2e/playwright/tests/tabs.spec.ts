import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Tabs — accessibility', () => {
  test('has no axe violations', async ({ page }) => {
    await page.goto('/iframe.html?id=components-tabs--default');
    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations).toEqual([]);
  });

  test('accessibility tree has correct role hierarchy', async ({ page }) => {
    await page.goto('/iframe.html?id=components-tabs--default');
    await expect(page.getByRole('tablist')).toBeVisible();
    await expect(page.getByRole('tab')).toHaveCount(3);
    await expect(page.getByRole('tabpanel')).toBeVisible();
  });
});

test.describe('Tabs — keyboard navigation', () => {
  test('Tab focuses the active tab, ArrowRight moves and activates next', async ({ page }) => {
    await page.goto('/iframe.html?id=components-tabs--default');
    await page.getByRole('tablist').waitFor();
    await page.keyboard.press('Tab');
    await expect(page.getByRole('tab', { name: 'Account' })).toBeFocused();

    await page.keyboard.press('ArrowRight');
    const password = page.getByRole('tab', { name: 'Password' });
    await expect(password).toBeFocused();
    await expect(password).toHaveAttribute('aria-selected', 'true');
  });

  test('Home/End move to first/last tab', async ({ page }) => {
    await page.goto('/iframe.html?id=components-tabs--default');
    await page.getByRole('tablist').waitFor();
    await page.keyboard.press('Tab');
    await page.keyboard.press('End');
    await expect(page.getByRole('tab', { name: 'Team' })).toBeFocused();

    await page.keyboard.press('Home');
    await expect(page.getByRole('tab', { name: 'Account' })).toBeFocused();
  });

  test('disabled tabs are skipped during arrow navigation', async ({ page }) => {
    await page.goto('/iframe.html?id=components-tabs--disabled-tabs');
    await page.getByRole('tab', { name: 'Available', exact: true }).focus();
    await page.keyboard.press('ArrowRight');
    await expect(page.getByRole('tab', { name: 'Available 2' })).toBeFocused();
  });

  test('focus is never trapped in the tablist', async ({ page }) => {
    await page.goto('/iframe.html?id=components-tabs--default');
    await page.getByRole('tab', { name: 'Account' }).focus();
    await page.keyboard.press('Tab');
    await expect(page.getByRole('tab', { name: 'Account' })).not.toBeFocused();
  });
});

test.describe('Tabs — manual activation', () => {
  test('arrow keys move focus without activating; Enter activates', async ({ page }) => {
    await page.goto('/iframe.html?id=components-tabs--manual-activation');
    await page.getByRole('tab', { name: 'Tab A' }).focus();
    await page.keyboard.press('ArrowRight');

    const tabB = page.getByRole('tab', { name: 'Tab B' });
    await expect(tabB).toBeFocused();
    await expect(page.getByRole('tab', { name: 'Tab A' })).toHaveAttribute('aria-selected', 'true');

    await page.keyboard.press('Enter');
    await expect(tabB).toHaveAttribute('aria-selected', 'true');
  });
});

test.describe('Tabs — orientation', () => {
  test('vertical tabs respond to ArrowDown/ArrowUp', async ({ page }) => {
    await page.goto('/iframe.html?id=components-tabs--vertical');
    await page.getByRole('tab', { name: 'General' }).focus();
    await page.keyboard.press('ArrowDown');
    await expect(page.getByRole('tab', { name: 'Profile' })).toBeFocused();
  });
});

test.describe('Tabs — RTL', () => {
  test('ArrowLeft moves to next tab under RTL', async ({ page }) => {
    await page.goto('/iframe.html?id=components-tabs--rtl');
    const tabs = page.getByRole('tab');
    await tabs.first().focus();
    await page.keyboard.press('ArrowLeft');
    await expect(tabs.nth(1)).toBeFocused();
  });
});

test.describe('Tabs — lazy panels', () => {
  test('inactive panel content is not in the DOM until first selected', async ({ page }) => {
    await page.goto('/iframe.html?id=components-tabs--default');
    await expect(page.getByText('Change your password here.')).toHaveCount(0);
    await page.getByRole('tab', { name: 'Password' }).click();
    await expect(page.getByText('Change your password here.')).toBeVisible();
  });
});

test.describe('Tabs — responsive', () => {
  test('scrollable tablist remains operable on narrow viewports', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 700 });
    await page.goto('/iframe.html?id=components-tabs--scrollable');
    await expect(page.getByRole('tablist')).toBeVisible();
    await page.getByRole('tab', { name: 'Tab 1', exact: true }).focus();
    await page.keyboard.press('End');
    await expect(page.getByRole('tab', { name: 'Tab 12', exact: true })).toBeFocused();
  });
});
