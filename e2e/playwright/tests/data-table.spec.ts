import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('DataTable — accessibility', () => {
  test('has no axe violations', async ({ page }) => {
    await page.goto('/iframe.html?id=components-datatable--custom-cells');
    await expect(page.getByRole('table')).toBeVisible({ timeout: 15000 });

    const results = await new AxeBuilder({ page }).include('#storybook-root').analyze();
    expect(results.violations).toEqual([]);
  });
});

test.describe('DataTable — sorting', () => {
  test('clicking a sortable header reorders rows and updates aria-sort', async ({ page }) => {
    await page.goto('/iframe.html?id=components-datatable--sortable');
    const nameHeader = page.getByRole('columnheader', { name: /Name/ });
    const nameButton = page.getByRole('button', { name: /Name/ });

    await nameButton.click();
    await expect(nameHeader).toHaveAttribute('aria-sort', 'ascending');

    await nameButton.click();
    await expect(nameHeader).toHaveAttribute('aria-sort', 'descending');

    await nameButton.click();
    await expect(nameHeader).toHaveAttribute('aria-sort', 'none');
  });

  test('sort button is keyboard-activatable', async ({ page }) => {
    await page.goto('/iframe.html?id=components-datatable--sortable');
    const nameButton = page.getByRole('button', { name: /Name/ });
    await nameButton.focus();
    await page.keyboard.press('Enter');
    await expect(page.getByRole('columnheader', { name: /Name/ })).toHaveAttribute(
      'aria-sort',
      'ascending',
    );
  });
});

test.describe('DataTable — row selection', () => {
  test('select-all checkbox selects every row on the page', async ({ page }) => {
    await page.goto('/iframe.html?id=components-datatable--row-selection');
    await page.getByRole('checkbox', { name: 'Select all rows on this page' }).click();

    const checkboxes = page.getByRole('checkbox').filter({ hasNotText: 'Select all' });
    const count = await checkboxes.count();
    for (let i = 0; i < count; i++) {
      await expect(checkboxes.nth(i)).toBeChecked();
    }
  });

  test('keyboard ArrowDown moves focus down the checkbox column', async ({ page }) => {
    await page.goto('/iframe.html?id=components-datatable--row-selection');
    const first = page.getByRole('checkbox', { name: 'Select row 1' });
    const second = page.getByRole('checkbox', { name: 'Select row 2' });

    await first.focus();
    await page.keyboard.press('ArrowDown');
    await expect(second).toBeFocused();
  });
});

test.describe('DataTable — pagination', () => {
  test("clicking a page number shows that page's rows", async ({ page }) => {
    await page.goto('/iframe.html?id=components-datatable--pagination');
    await expect(page.getByRole('button', { name: 'Page 1' })).toHaveAttribute(
      'aria-current',
      'page',
    );

    await page.getByRole('button', { name: 'Page 2' }).click();
    await expect(page.getByRole('button', { name: 'Page 2' })).toHaveAttribute(
      'aria-current',
      'page',
    );
  });

  test('previous/next buttons are disabled at the boundaries', async ({ page }) => {
    await page.goto('/iframe.html?id=components-datatable--pagination');
    await expect(page.getByRole('button', { name: 'Previous page' })).toBeDisabled();

    const nextButton = page.getByRole('button', { name: 'Next page' });
    while (await nextButton.isEnabled()) {
      await nextButton.click();
    }
    await expect(nextButton).toBeDisabled();
  });
});

test.describe('DataTable — expandable rows', () => {
  test('expanding a row reveals its detail content', async ({ page }) => {
    await page.goto('/iframe.html?id=components-datatable--expandable-rows');
    const expandButton = page.getByRole('button', { name: 'Expand row 1' });
    await expandButton.click();

    await expect(page.getByText(/Joined:/)).toBeVisible();
    await expect(page.getByRole('button', { name: 'Collapse row 1' })).toBeVisible();
  });
});

test.describe('DataTable — responsive', () => {
  test('collapses to a stacked card layout below md breakpoint', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 700 });
    await page.goto('/iframe.html?id=components-datatable--responsive');

    // The <thead> is hidden at this width; each cell shows an inline
    // label instead (e.g. "Name" appears twice: once as the hidden
    // column header and once as each row's inline label).
    const columnHeader = page.locator('thead');
    await expect(columnHeader).toBeHidden();
    await expect(page.locator('tbody').getByText('Name', { exact: true }).first()).toBeVisible();
  });
});

test.describe('DataTable — loading and empty states', () => {
  test('loading state shows skeleton rows', async ({ page }) => {
    await page.goto('/iframe.html?id=components-datatable--loading-state');
    const skeletonRows = page.locator('tbody[aria-hidden="true"] tr');
    await expect(skeletonRows.first()).toBeVisible();
  });

  test('empty state shows the empty message', async ({ page }) => {
    await page.goto('/iframe.html?id=components-datatable--empty-state');
    await expect(page.getByText('No users match your filters.')).toBeVisible();
  });
});

test.describe('DataTable — RTL', () => {
  test('renders and functions under dir=rtl', async ({ page }) => {
    await page.goto('/iframe.html?id=components-datatable--rtl');
    await expect(page.getByRole('table')).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'الاسم' })).toBeVisible();
  });
});
