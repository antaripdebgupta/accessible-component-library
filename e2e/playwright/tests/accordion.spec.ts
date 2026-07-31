import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Accordion — accessibility', () => {
  test('has no axe violations', async ({ page }) => {
    await page.goto('/iframe.html?id=components-accordion--default');
    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations).toEqual([]);
  });

  test('triggers are buttons wrapped in headings, panels are regions', async ({ page }) => {
    await page.goto('/iframe.html?id=components-accordion--default');
    await expect(page.getByRole('heading', { level: 3 })).toHaveCount(3);
    await expect(page.getByRole('button')).toHaveCount(3);
    await expect(page.getByRole('region', { name: 'What is this library?' })).toBeVisible();
  });

  test('trigger and panel are linked via aria-controls/aria-labelledby', async ({ page }) => {
    await page.goto('/iframe.html?id=components-accordion--default');
    const trigger = page.getByRole('button', { name: 'What is this library?', exact: true });
    const panel = page.getByRole('region', { name: 'What is this library?' });

    const controls = await trigger.getAttribute('aria-controls');
    const panelId = await panel.getAttribute('id');
    expect(controls).toBe(panelId);

    const labelledby = await panel.getAttribute('aria-labelledby');
    const triggerId = await trigger.getAttribute('id');
    expect(labelledby).toBe(triggerId);
  });
});

test.describe('Accordion — single mode', () => {
  test('opening a trigger sets aria-expanded and closes the previously open item', async ({
    page,
  }) => {
    await page.goto('/iframe.html?id=components-accordion--default');
    const first = page.getByRole('button', { name: 'What is this library?', exact: true });
    const second = page.getByRole('button', { name: 'Is it WCAG 2.2 AA compliant?', exact: true });

    await expect(first).toHaveAttribute('aria-expanded', 'true');

    await second.click();
    await expect(second).toHaveAttribute('aria-expanded', 'true');
    await expect(first).toHaveAttribute('aria-expanded', 'false');
  });

  test('clicking the open trigger again collapses it (collapsible)', async ({ page }) => {
    await page.goto('/iframe.html?id=components-accordion--default');
    const first = page.getByRole('button', { name: 'What is this library?', exact: true });

    await expect(first).toHaveAttribute('aria-expanded', 'true');
    await first.click();
    await expect(first).toHaveAttribute('aria-expanded', 'false');
  });
});

test.describe('Accordion — multiple mode', () => {
  test('more than one item can be open at the same time', async ({ page }) => {
    await page.goto('/iframe.html?id=components-accordion--multiple');
    const first = page.getByRole('button', { name: 'What is this library?', exact: true });
    const second = page.getByRole('button', { name: 'Is it WCAG 2.2 AA compliant?', exact: true });

    await expect(first).toHaveAttribute('aria-expanded', 'true');
    await expect(second).toHaveAttribute('aria-expanded', 'true');
  });

  test('toggling one open item in multiple mode does not close the others', async ({ page }) => {
    await page.goto('/iframe.html?id=components-accordion--multiple');
    const first = page.getByRole('button', { name: 'What is this library?', exact: true });
    const second = page.getByRole('button', { name: 'Is it WCAG 2.2 AA compliant?', exact: true });

    await first.click();
    await expect(first).toHaveAttribute('aria-expanded', 'false');
    await expect(second).toHaveAttribute('aria-expanded', 'true');
  });
});

test.describe('Accordion — disabled items', () => {
  test('disabled trigger cannot be toggled', async ({ page }) => {
    await page.goto('/iframe.html?id=components-accordion--disabled');
    const disabledTrigger = page.getByRole('button', { name: 'Coming soon', exact: true });

    await expect(disabledTrigger).toBeDisabled();
    await expect(disabledTrigger).toHaveAttribute('aria-expanded', 'false');
  });

  test('ArrowDown/End skip disabled items during keyboard navigation', async ({ page }) => {
    await page.goto('/iframe.html?id=components-accordion--disabled');
    const first = page.getByRole('button', { name: 'What is this library?', exact: true });
    const last = page.getByRole('button', { name: 'Is it WCAG 2.2 AA compliant?', exact: true });

    await first.focus();
    await page.keyboard.press('End');
    // "Coming soon" is disabled, so End should land on the last enabled trigger.
    await expect(last).toBeFocused();
  });
});

test.describe('Accordion — keyboard navigation', () => {
  test('Tab focuses the first trigger', async ({ page }) => {
    await page.goto('/iframe.html?id=components-accordion--default');
    await page.getByRole('button', { name: 'What is this library?', exact: true }).waitFor();
    await page.keyboard.press('Tab');
    await expect(
      page.getByRole('button', { name: 'What is this library?', exact: true }),
    ).toBeFocused();
  });

  test('ArrowDown/ArrowUp move focus between triggers, wrapping', async ({ page }) => {
    await page.goto('/iframe.html?id=components-accordion--default');
    const first = page.getByRole('button', { name: 'What is this library?', exact: true });
    const second = page.getByRole('button', { name: 'Is it WCAG 2.2 AA compliant?', exact: true });
    const third = page.getByRole('button', { name: 'How is it tested?', exact: true });

    await first.focus();
    await page.keyboard.press('ArrowDown');
    await expect(second).toBeFocused();

    await page.keyboard.press('ArrowDown');
    await expect(third).toBeFocused();

    // Wraps back to the first trigger.
    await page.keyboard.press('ArrowDown');
    await expect(first).toBeFocused();

    await page.keyboard.press('ArrowUp');
    await expect(third).toBeFocused();
  });

  test('Home/End move focus to the first/last trigger', async ({ page }) => {
    await page.goto('/iframe.html?id=components-accordion--default');
    const first = page.getByRole('button', { name: 'What is this library?', exact: true });
    const third = page.getByRole('button', { name: 'How is it tested?', exact: true });

    await first.focus();
    await page.keyboard.press('End');
    await expect(third).toBeFocused();

    await page.keyboard.press('Home');
    await expect(first).toBeFocused();
  });

  test('Enter/Space toggles the focused trigger', async ({ page }) => {
    await page.goto('/iframe.html?id=components-accordion--default');
    const second = page.getByRole('button', { name: 'Is it WCAG 2.2 AA compliant?', exact: true });

    await second.focus();
    await page.keyboard.press('Enter');
    await expect(second).toHaveAttribute('aria-expanded', 'true');

    await page.keyboard.press('Space');
    await expect(second).toHaveAttribute('aria-expanded', 'false');
  });
});

test.describe('Accordion — RTL', () => {
  test('renders with dir=rtl and remains keyboard operable', async ({ page }) => {
    await page.goto('/iframe.html?id=components-accordion--rtl');
    const triggers = page.getByRole('button');
    await expect(triggers).toHaveCount(2);

    await triggers.first().focus();
    await page.keyboard.press('ArrowDown');
    await expect(triggers.nth(1)).toBeFocused();
  });
});
