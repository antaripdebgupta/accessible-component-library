import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('DropdownMenu — accessibility', () => {
  test('has no axe violations while open', async ({ page }) => {
    await page.goto('/iframe.html?id=components-dropdownmenu--basic');
    await page.getByRole('button', { name: 'Open menu' }).click();
    await expect(page.getByRole('menu')).toBeVisible();

    const results = await new AxeBuilder({ page }).include('#storybook-root').analyze();
    expect(results.violations).toEqual([]);
  });

  test('trigger has aria-haspopup and aria-expanded', async ({ page }) => {
    await page.goto('/iframe.html?id=components-dropdownmenu--basic');
    const trigger = page.getByRole('button', { name: 'Open menu' });
    await expect(trigger).toHaveAttribute('aria-haspopup', 'menu');
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');

    await trigger.click();
    await expect(trigger).toHaveAttribute('aria-expanded', 'true');
  });
});

test.describe('DropdownMenu — keyboard navigation', () => {
  test('opening the menu focuses the first item', async ({ page }) => {
    await page.goto('/iframe.html?id=components-dropdownmenu--basic');
    await page.getByRole('button', { name: 'Open menu' }).click();
    await expect(page.getByRole('menuitem', { name: 'Profile' })).toBeFocused();
  });

  test('ArrowDown/ArrowUp move focus, wrapping', async ({ page }) => {
    await page.goto('/iframe.html?id=components-dropdownmenu--basic');
    await page.getByRole('button', { name: 'Open menu' }).click();
    await expect(page.getByRole('menuitem', { name: 'Profile' })).toBeFocused();

    await page.keyboard.press('ArrowDown');
    await expect(page.getByRole('menuitem', { name: 'Billing' })).toBeFocused();

    await page.keyboard.press('ArrowUp');
    await expect(page.getByRole('menuitem', { name: 'Profile' })).toBeFocused();
  });

  test('Home/End move to first/last item', async ({ page }) => {
    await page.goto('/iframe.html?id=components-dropdownmenu--icon');
    await page.getByRole('button', { name: 'Open menu' }).click();
    await expect(page.getByRole('menuitem', { name: 'Profile' })).toBeFocused();

    await page.keyboard.press('End');
    await expect(page.getByRole('menuitem', { name: 'Log out' })).toBeFocused();

    await page.keyboard.press('Home');
    await expect(page.getByRole('menuitem', { name: 'Profile' })).toBeFocused();
  });

  test('Escape closes the menu and returns focus to the trigger', async ({ page }) => {
    await page.goto('/iframe.html?id=components-dropdownmenu--basic');
    const trigger = page.getByRole('button', { name: 'Open menu' });
    await trigger.click();
    await expect(page.getByRole('menu')).toBeVisible();

    await page.keyboard.press('Escape');
    await expect(page.getByRole('menu')).toHaveCount(0);
    await expect(trigger).toBeFocused();
  });

  test('clicking outside the menu closes it', async ({ page }) => {
    await page.goto('/iframe.html?id=components-dropdownmenu--basic');
    await page.getByRole('button', { name: 'Open menu' }).click();
    await expect(page.getByRole('menu')).toBeVisible();

    await page.mouse.click(10, 10);
    await expect(page.getByRole('menu')).toHaveCount(0);
  });
});

test.describe('DropdownMenu — selection', () => {
  test('selecting an item closes the menu', async ({ page }) => {
    await page.goto('/iframe.html?id=components-dropdownmenu--basic');
    await page.getByRole('button', { name: 'Open menu' }).click();
    await page.getByRole('menuitem', { name: 'Profile' }).click();
    await expect(page.getByRole('menu')).toHaveCount(0);
  });

  test('disabled item does not close the menu when clicked', async ({ page }) => {
    await page.goto('/iframe.html?id=components-dropdownmenu--basic');
    await page.getByRole('button', { name: 'Open menu' }).click();
    const disabledItem = page.getByRole('menuitem', { name: 'Invite users (disabled)' });
    await expect(disabledItem).toHaveAttribute('aria-disabled', 'true');
    await disabledItem.click({ force: true });
    await expect(page.getByRole('menu')).toBeVisible();
  });
});

test.describe('DropdownMenu — checkboxes and radio', () => {
  test('checkbox items toggle without closing the menu', async ({ page }) => {
    await page.goto('/iframe.html?id=components-dropdownmenu--checkboxes');
    await page.getByRole('button', { name: 'View' }).click();

    const statusBar = page.getByRole('menuitemcheckbox', { name: 'Status bar' });
    await expect(statusBar).toHaveAttribute('aria-checked', 'true');

    await statusBar.click();
    await expect(statusBar).toHaveAttribute('aria-checked', 'false');
    await expect(page.getByRole('menu')).toBeVisible();
  });

  test('radio group allows only one selected item at a time', async ({ page }) => {
    await page.goto('/iframe.html?id=components-dropdownmenu--radio-group');
    await page.getByRole('button', { name: 'Panel position' }).click();

    const bottom = page.getByRole('menuitemradio', { name: 'Bottom' });
    const top = page.getByRole('menuitemradio', { name: 'Top' });
    await expect(bottom).toHaveAttribute('aria-checked', 'true');

    await top.click();
    await expect(top).toHaveAttribute('aria-checked', 'true');
    await expect(bottom).toHaveAttribute('aria-checked', 'false');
  });
});

test.describe('DropdownMenu — submenu', () => {
  test('ArrowRight opens the submenu and focuses its first item', async ({ page }) => {
    await page.goto('/iframe.html?id=components-dropdownmenu--submenu');
    await page.getByRole('button', { name: 'Open menu' }).click();

    const subTrigger = page.getByRole('menuitem', { name: 'Invite users' });
    await subTrigger.focus();
    await page.keyboard.press('ArrowRight');

    const emailItem = page.getByRole('menuitem', { name: 'Email' });
    await emailItem.waitFor();
    await expect(emailItem).toBeFocused();
  });

  test('ArrowLeft closes the submenu and returns focus to its trigger', async ({ page }) => {
    await page.goto('/iframe.html?id=components-dropdownmenu--submenu');
    await page.getByRole('button', { name: 'Open menu' }).click();

    const subTrigger = page.getByRole('menuitem', { name: 'Invite users' });
    await subTrigger.focus();
    await page.keyboard.press('ArrowRight');
    await page.getByRole('menuitem', { name: 'Email' }).waitFor();

    await page.keyboard.press('ArrowLeft');
    await expect(subTrigger).toBeFocused();
  });
});

test.describe('DropdownMenu — RTL', () => {
  test('renders and functions under dir=rtl', async ({ page }) => {
    await page.goto('/iframe.html?id=components-dropdownmenu--rtl');
    await page.getByRole('button', { name: 'القائمة' }).click();
    await expect(page.getByRole('menu')).toBeVisible();
    await expect(page.getByRole('menuitem', { name: 'الملف الشخصي' })).toBeFocused();
  });
});
