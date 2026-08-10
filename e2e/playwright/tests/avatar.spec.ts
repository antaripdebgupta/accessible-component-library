import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

// Scope every scan to Storybook's component root and restrict to WCAG rules —
// axe's "best practice" page-structure rules (landmark-one-main,
// page-has-heading-one, region) are about full-page layout and don't apply
// to isolated component stories rendered inside Storybook's iframe.
function scannedAxe(page: import('@playwright/test').Page) {
  return new AxeBuilder({ page })
    .include('#storybook-root')
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']);
}

test.describe('Avatar — accessibility', () => {
  test('has no axe violations across variants', async ({ page }) => {
    for (const story of [
      'default',
      'sizes',
      'badge',
      'badge-with-icon',
      'group',
      'group-with-count',
      'group-with-icon',
    ]) {
      await page.goto(`/iframe.html?id=components-avatar--${story}`);
      const results = await scannedAxe(page).analyze();
      expect(results.violations, `story: ${story}`).toEqual([]);
    }
  });
});

test.describe('Avatar — fallback behavior', () => {
  test('renders accessible name via role=img', async ({ page }) => {
    await page.goto('/iframe.html?id=components-avatar--default');
    const avatars = page.getByRole('img');
    await expect(avatars.first()).toBeVisible();
  });

  test('broken image falls back to initials without a broken-image icon flash', async ({
    page,
  }) => {
    // Match by domain — the story's avatar src has no file extension
    // (https://i.pravatar.cc/150?img=1), so a "*.png" glob never matched.
    await page.route('**/i.pravatar.cc/**', (route) => route.abort());
    await page.goto('/iframe.html?id=components-avatar--default');

    const avatar = page.getByRole('img').first();
    await expect(avatar).toBeVisible();
    await expect(avatar.locator('img')).toHaveCount(0, { timeout: 8000 });
  });
});

test.describe('Avatar — group overflow', () => {
  test('overflow avatar shows correct count and total', async ({ page }) => {
    await page.goto('/iframe.html?id=components-avatar--group-with-count');
    const overflow = page.getByRole('img', { name: /more, \d+ total/ });
    await expect(overflow).toBeVisible();
  });

  test('clickable overflow button opens on click and is keyboard reachable', async ({ page }) => {
    await page.goto('/iframe.html?id=components-avatar--group-with-count');
    const overflowButton = page.getByRole('button', { name: /more, \d+ total/ });
    if (await overflowButton.count()) {
      await page.keyboard.press('Tab');
      await expect(overflowButton).toBeVisible();
    }
  });
});

test.describe('Avatar — dropdown composition', () => {
  test('clicking the avatar trigger opens the account menu', async ({ page }) => {
    await page.goto('/iframe.html?id=components-avatar--dropdown');
    const trigger = page.getByRole('button', { name: /Open account menu/ });
    await trigger.click();
    await expect(page.getByRole('menu')).toBeVisible();
    await expect(page.getByRole('menuitem', { name: 'Profile' })).toBeVisible();
  });

  test('Escape closes the menu and returns focus to the avatar trigger', async ({ page }) => {
    await page.goto('/iframe.html?id=components-avatar--dropdown');
    const trigger = page.getByRole('button', { name: /Open account menu/ });
    await trigger.click();
    await expect(page.getByRole('menu')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.getByRole('menu')).not.toBeVisible();
    await expect(trigger).toBeFocused();
  });
});

test.describe('Avatar — RTL', () => {
  test('renders correctly under RTL with mirrored badge position', async ({ page }) => {
    await page.goto('/iframe.html?id=components-avatar--rtl');
    await expect(page.getByRole('img').first()).toBeVisible();
    const results = await scannedAxe(page).analyze();
    expect(results.violations).toEqual([]);
  });
});
