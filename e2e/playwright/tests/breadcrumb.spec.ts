import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Breadcrumb', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/iframe.html?id=components-breadcrumb--default');
  });

  test('has no axe violations', async ({ page }) => {
    const results = await new AxeBuilder({ page }).include('#storybook-root').analyze();
    expect(results.violations).toEqual([]);
  });

  test('renders navigation landmark and links', async ({ page }) => {
    const nav = page.getByRole('navigation', { name: 'Breadcrumb' });
    await expect(nav).toBeVisible();

    const homeLink = page.getByRole('link', { name: 'Home' });
    await expect(homeLink).toHaveAttribute('href', '/');

    // Last item is current page span with aria-current="page"
    const currentItem = page.getByText('Electronics');
    await expect(currentItem).toHaveAttribute('aria-current', 'page');
  });
});

test.describe('Breadcrumb — Collapse & Focus Management', () => {
  test('opens collapsed menu and manages focus correctly', async ({ page }) => {
    await page.goto('/iframe.html?id=components-breadcrumb--collapsed');

    const ellipsisButton = page.getByRole('button', {
      name: 'Show hidden breadcrumb items',
    });
    await expect(ellipsisButton).toBeVisible();

    // Click ellipsis button to open menu
    await ellipsisButton.click();

    // Menu content appears
    const menuContent = page.getByRole('menu');
    await expect(menuContent).toBeVisible();

    // Press Escape to close dropdown and return focus to ellipsis trigger
    await page.keyboard.press('Escape');
    await expect(menuContent).not.toBeVisible();
    await expect(ellipsisButton).toBeFocused();
  });
});
