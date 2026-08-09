import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Pagination — accessibility', () => {
  test('has no axe violations', async ({ page }) => {
    await page.goto('/iframe.html?id=components-pagination--default');
    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations).toEqual([]);
  });

  test('has correct ARIA attributes and roles', async ({ page }) => {
    await page.goto('/iframe.html?id=components-pagination--default');

    const nav = page.getByRole('navigation', { name: 'Pagination' });
    await expect(nav).toBeVisible();

    const prevBtn = page.getByRole('button', { name: 'Previous page' });
    await expect(prevBtn).toBeVisible();

    const nextBtn = page.getByRole('button', { name: 'Next page' });
    await expect(nextBtn).toBeVisible();

    const page1 = page.getByRole('button', { name: 'Page 1' });
    await expect(page1).toHaveAttribute('aria-current', 'page');
  });
});

test.describe('Pagination — interactions', () => {
  test('clicking a page number updates the page', async ({ page }) => {
    await page.goto('/iframe.html?id=components-pagination--default');

    const activePageText = page.getByText('Active Page: 1');
    await expect(activePageText).toBeVisible();

    const page3 = page.getByRole('button', { name: 'Page 3' });
    await page3.click();

    await expect(page.getByText('Active Page: 3')).toBeVisible();
    await expect(page3).toHaveAttribute('aria-current', 'page');
    await expect(page.getByRole('button', { name: 'Page 1' })).not.toHaveAttribute('aria-current');
  });

  test('clicking Next/Previous updates the page', async ({ page }) => {
    await page.goto('/iframe.html?id=components-pagination--default');

    const nextBtn = page.getByRole('button', { name: 'Next page' });
    const prevBtn = page.getByRole('button', { name: 'Previous page' });

    await expect(prevBtn).toBeDisabled();

    await nextBtn.click();
    await expect(page.getByText('Active Page: 2')).toBeVisible();
    await expect(prevBtn).not.toBeDisabled();

    await prevBtn.click();
    await expect(page.getByText('Active Page: 1')).toBeVisible();
  });

  test('boundaries disable buttons', async ({ page }) => {
    await page.goto('/iframe.html?id=components-pagination--default');

    const prevBtn = page.getByRole('button', { name: 'Previous page' });
    const nextBtn = page.getByRole('button', { name: 'Next page' });

    await expect(prevBtn).toBeDisabled();

    // Default has pageCount=5
    await page.getByRole('button', { name: 'Page 5' }).click();
    await expect(nextBtn).toBeDisabled();
    await expect(prevBtn).not.toBeDisabled();
  });
});

test.describe('Pagination — smooth content transition', () => {
  test('paginated content changes page with correct items', async ({ page }) => {
    await page.goto('/iframe.html?id=components-pagination--paginated-content');

    // First page items
    await expect(page.getByText('Introduction to Accessibility')).toBeVisible();
    await expect(page.getByText('Keyboard Navigation Basics')).toBeVisible();
    await expect(page.getByText('Color Contrast Guidelines')).toHaveCount(0);

    // Click page 2
    await page.getByRole('button', { name: 'Page 2' }).click();

    // Verify page 2 items are visible
    await expect(page.getByText('Color Contrast Guidelines')).toBeVisible();
    await expect(page.getByText('Screen Reader Testing')).toBeVisible();
    await expect(page.getByText('Introduction to Accessibility')).toHaveCount(0);
  });
});
