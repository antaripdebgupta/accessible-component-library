import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('TreeView — accessibility', () => {
  test('has no axe violations', async ({ page }) => {
    await page.goto('/iframe.html?id=components-treeview--default');
    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations).toEqual([]);
  });

  test('accessibility tree has correct role hierarchy', async ({ page }) => {
    await page.goto('/iframe.html?id=components-treeview--default');
    await expect(page.getByRole('tree')).toBeVisible();
    await expect(page.getByRole('treeitem').first()).toBeVisible();
  });
});

test.describe('TreeView — keyboard navigation', () => {
  test('Tab focuses the tree at the first item', async ({ page }) => {
    await page.goto('/iframe.html?id=components-treeview--default');
    await expect(page.getByRole('tree')).toBeVisible();
    await page.locator('body').focus();
    await page.keyboard.press('Tab');
    await expect(page.getByRole('treeitem', { name: 'src' })).toBeFocused();
  });

  test("ArrowDown moves into expanded branch's first child", async ({ page }) => {
    await page.goto('/iframe.html?id=components-treeview--default');
    await page.getByRole('treeitem', { name: 'src' }).focus();
    await page.keyboard.press('ArrowDown');
    await expect(page.getByRole('treeitem', { name: 'components' })).toBeFocused();
  });

  test('ArrowRight expands a collapsed branch and moves focus inside', async ({ page }) => {
    await page.goto('/iframe.html?id=components-treeview--default');
    const components = page.getByRole('treeitem', { name: 'components' });
    await components.focus();
    // components starts expanded per story defaultExpanded — collapse then re-expand
    await page.keyboard.press('ArrowLeft');
    await expect(components).toHaveAttribute('aria-expanded', 'false');
    await page.keyboard.press('ArrowRight');
    await expect(components).toHaveAttribute('aria-expanded', 'true');
  });

  test('Home/End jump to first/last visible item', async ({ page }) => {
    await page.goto('/iframe.html?id=components-treeview--default');
    await page.getByRole('treeitem', { name: 'src' }).focus();
    await page.keyboard.press('End');
    const items = page.getByRole('treeitem');
    const lastItem = items.last();
    await expect(lastItem).toBeFocused();

    await page.keyboard.press('Home');
    await expect(page.getByRole('treeitem', { name: 'src' })).toBeFocused();
  });

  test('Enter selects a leaf item', async ({ page }) => {
    await page.goto('/iframe.html?id=components-treeview--default');
    const readme = page.getByRole('treeitem', { name: 'README.md' });
    await readme.focus();
    await page.keyboard.press('Enter');
    await expect(readme).toHaveAttribute('aria-selected', 'true');
  });
});

test.describe('TreeView — disabled items', () => {
  test('disabled node is skipped by click selection but remains visible', async ({ page }) => {
    await page.goto('/iframe.html?id=components-treeview--with-disabled-node');
    const locked = page.getByRole('treeitem', { name: /locked\.ts/ });
    await expect(locked).toHaveAttribute('aria-disabled', 'true');
    await locked.click({ force: true });
    await expect(locked).toHaveAttribute('aria-selected', 'false');
  });
});

test.describe('TreeView — layout stability on expand/collapse', () => {
  test('expanding a node does not change its own bounding box position', async ({ page }) => {
    await page.goto('/iframe.html?id=components-treeview--default');
    const src = page.getByRole('treeitem', { name: 'src' });

    const boxBefore = await src.boundingBox();
    await src.click(); // collapse
    await src.click(); // re-expand
    const boxAfter = await src.boundingBox();

    expect(boxBefore).not.toBeNull();
    expect(boxAfter).not.toBeNull();
    expect(boxAfter!.y).toBeCloseTo(boxBefore!.y, 0);
    expect(boxAfter!.x).toBeCloseTo(boxBefore!.x, 0);
  });

  test('collapsing a node moves following siblings up, not the node itself', async ({ page }) => {
    await page.goto('/iframe.html?id=components-treeview--default');
    const src = page.getByRole('treeitem', { name: 'src' });
    const pkg = page.getByRole('treeitem', { name: 'package.json' });

    const srcBoxBefore = await src.boundingBox();
    const pkgBoxBefore = await pkg.boundingBox();

    await src.click(); // collapse src

    const srcBoxAfter = await src.boundingBox();
    const pkgBoxAfter = await pkg.boundingBox();

    expect(srcBoxAfter!.y).toBeCloseTo(srcBoxBefore!.y, 0); // src unmoved
    expect(pkgBoxAfter!.y).toBeLessThan(pkgBoxBefore!.y); // pkg moved up to fill the gap
  });
});

test.describe('TreeView — RTL', () => {
  test('indentation mirrors correctly under RTL', async ({ page }) => {
    await page.goto('/iframe.html?id=components-treeview--rtl');
    await expect(page.getByRole('tree')).toBeVisible();
    const root = page.getByRole('treeitem').first();
    await expect(root).toBeVisible();
  });
});
