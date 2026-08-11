import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

function scannedAxe(page: import('@playwright/test').Page) {
  return new AxeBuilder({ page })
    .include('#storybook-root')
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']);
}

test.describe('Skeleton — accessibility', () => {
  test('has no axe violations across variants', async ({ page }) => {
    for (const story of ['default', 'avatar', 'card', 'text', 'form', 'table', 'rtl']) {
      await page.goto(`/iframe.html?id=components-skeleton--${story}`);
      const results = await scannedAxe(page).analyze();
      expect(results.violations, `story: ${story}`).toEqual([]);
    }
  });

  test('skeleton shapes are excluded from the accessibility tree', async ({ page }) => {
    await page.goto('/iframe.html?id=components-skeleton--default');
    const presentational = page.locator('[role="presentation"][aria-hidden="true"]');
    await expect(presentational.first()).toBeVisible();
  });
});

test.describe('Skeleton — loading to loaded transition', () => {
  test('shows skeleton fallback first, then real content, with a single loading announcement', async ({
    page,
  }) => {
    await page.goto('/iframe.html?id=components-skeleton--loading-to-loaded-transition');

    const loadingRegion = page.getByRole('status', { name: 'Loading profile' });
    await expect(loadingRegion).toBeVisible();
    await expect(loadingRegion).toHaveAttribute('aria-busy', 'true');

    await expect(page.getByText('Ada Lovelace')).toBeVisible({ timeout: 4000 });
    await expect(page.getByRole('status', { name: 'Loading profile' })).toHaveCount(0);
  });
});

test.describe('Skeleton — reduced motion', () => {
  test('shimmer animation is disabled under prefers-reduced-motion', async ({ browser }) => {
    const context = await browser.newContext({ reducedMotion: 'reduce' });
    const page = await context.newPage();
    await page.goto('/iframe.html?id=components-skeleton--default');

    const skeleton = page.locator('[role="presentation"]').first();
    await expect(skeleton).toBeVisible();

    const readTransform = () =>
      skeleton.evaluate((el) => window.getComputedStyle(el, '::before').transform);

    const t1 = await readTransform();
    await page.waitForTimeout(400);
    const t2 = await readTransform();

    expect(t1).toBe(t2);
    await context.close();
  });

  test('shimmer animation runs under normal motion settings', async ({ browser }) => {
    const context = await browser.newContext({ reducedMotion: 'no-preference' });
    const page = await context.newPage();
    await page.goto('/iframe.html?id=components-skeleton--default');

    const skeleton = page.locator('[role="presentation"]').first();
    await expect(skeleton).toBeVisible();

    const readTransform = () =>
      skeleton.evaluate((el) => window.getComputedStyle(el, '::before').transform);

    const t1 = await readTransform();
    await page.waitForTimeout(400);
    const t2 = await readTransform();

    expect(t1).not.toBe(t2);
    await context.close();
  });
});

test.describe('Skeleton — RTL', () => {
  test('renders correctly under RTL with no axe violations', async ({ page }) => {
    await page.goto('/iframe.html?id=components-skeleton--rtl');
    await expect(page.locator('[role="presentation"]').first()).toBeVisible();
    const results = await scannedAxe(page).analyze();
    expect(results.violations).toEqual([]);
  });
});

test.describe('Skeleton — table preset', () => {
  test('renders correct grid structure', async ({ page }) => {
    await page.goto('/iframe.html?id=components-skeleton--table');
    const table = page.locator('#storybook-root table');
    const rows = table.locator('tbody tr');
    await expect(rows).toHaveCount(5);
  });
});
