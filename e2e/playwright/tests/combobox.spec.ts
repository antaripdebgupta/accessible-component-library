import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Combobox — accessibility', () => {
  test('has no axe violations while open', async ({ page }) => {
    await page.goto('/iframe.html?id=components-combobox--default');
    await page.getByPlaceholder('Select a fruit...').click();
    await expect(page.getByRole('listbox')).toBeVisible();

    const results = await new AxeBuilder({ page }).include('#storybook-root').analyze();
    expect(results.violations).toEqual([]);
  });

  test('input has combobox role and correct ARIA wiring', async ({ page }) => {
    await page.goto('/iframe.html?id=components-combobox--default');
    const input = page.getByRole('combobox');
    await expect(input).toHaveAttribute('aria-expanded', 'false');

    await input.click();
    await expect(input).toHaveAttribute('aria-expanded', 'true');
    await expect(input).toHaveAttribute('aria-controls');
    await expect(input).toHaveAttribute('aria-autocomplete', 'list');
  });
});

test.describe('Combobox — default (single select)', () => {
  test('typing filters the list', async ({ page }) => {
    await page.goto('/iframe.html?id=components-combobox--default');
    const input = page.getByPlaceholder('Select a fruit...');
    await input.click();
    await input.fill('ban');

    await expect(page.getByRole('option', { name: 'Banana' })).toBeVisible();
    await expect(page.getByRole('option', { name: 'Apple' })).toHaveCount(0);
  });

  test('selecting an item fills the input and closes the popup', async ({ page }) => {
    await page.goto('/iframe.html?id=components-combobox--default');
    const input = page.getByPlaceholder('Select a fruit...');
    await input.click();
    await page.getByRole('option', { name: 'Cherry' }).click();

    await expect(input).toHaveValue('Cherry');
    await expect(page.getByRole('listbox')).toHaveCount(0);
  });

  test('ArrowDown then Enter selects the highlighted item', async ({ page }) => {
    await page.goto('/iframe.html?id=components-combobox--default');
    const input = page.getByPlaceholder('Select a fruit...');
    await input.click();
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('Enter');

    await expect(input).toHaveValue('Apple');
  });

  test('Escape closes the popup', async ({ page }) => {
    await page.goto('/iframe.html?id=components-combobox--default');
    await page.getByPlaceholder('Select a fruit...').click();
    await expect(page.getByRole('listbox')).toBeVisible();

    await page.keyboard.press('Escape');
    await expect(page.getByRole('listbox')).toHaveCount(0);
  });
});

test.describe('Combobox — multiple', () => {
  test('selecting items adds tags and keeps the popup open', async ({ page }) => {
    await page.goto('/iframe.html?id=components-combobox--multiple');
    const input = page.getByPlaceholder('Add fruits...');
    await input.click();
    await page.getByRole('option', { name: 'Grape' }).click();

    await expect(page.getByRole('button', { name: 'Remove Grape' })).toBeVisible();
    await expect(page.getByRole('listbox')).toBeVisible();
  });

  test('removing a tag deselects the item', async ({ page }) => {
    await page.goto('/iframe.html?id=components-combobox--multiple');
    await page.getByRole('button', { name: 'Remove Apple' }).click();
    await expect(page.getByText('Apple', { exact: true })).toHaveCount(0);
  });

  test('Backspace on empty input removes the last tag', async ({ page }) => {
    await page.goto('/iframe.html?id=components-combobox--multiple');
    const input = page.getByPlaceholder('Add fruits...');
    await input.click();
    await input.press('Backspace');

    // Multiple story starts with ["Apple", "Cherry"] — Cherry is last.
    await expect(page.getByRole('button', { name: 'Remove Cherry' })).toHaveCount(0);
    await expect(page.getByRole('button', { name: 'Remove Apple' })).toBeVisible();
  });
});

test.describe('Combobox — clear button', () => {
  test('clear button empties the selection', async ({ page }) => {
    await page.goto('/iframe.html?id=components-combobox--clear-button');
    const input = page.getByPlaceholder('Select a fruit...');
    await expect(input).toHaveValue('Banana');

    await page.getByRole('button', { name: 'Clear' }).click();
    await expect(input).toHaveValue('');
  });
});

test.describe('Combobox — groups', () => {
  test('group headings render alongside their items', async ({ page }) => {
    await page.goto('/iframe.html?id=components-combobox--groups');
    await page.getByPlaceholder('Select a timezone...').click();

    await expect(page.getByText('Americas')).toBeVisible();
    await expect(page.getByText('Europe')).toBeVisible();
    await expect(page.getByRole('option', { name: 'Eastern Time' })).toBeVisible();
    await expect(page.getByRole('option', { name: 'Paris (CET)' })).toBeVisible();
  });
});

test.describe('Combobox — custom items', () => {
  test('selecting a custom item works via textValue filtering', async ({ page }) => {
    await page.goto('/iframe.html?id=components-combobox--custom-items');
    const input = page.getByPlaceholder('Select a country...');
    await input.click();
    await input.fill('Japan');

    await expect(page.getByRole('option', { name: /Japan/ })).toBeVisible();
    await page.getByRole('option', { name: /Japan/ }).click();
    await expect(page.getByRole('listbox')).toHaveCount(0);
  });
});

test.describe('Combobox — invalid', () => {
  test('invalid combobox has aria-invalid set', async ({ page }) => {
    await page.goto('/iframe.html?id=components-combobox--invalid');
    await expect(page.getByRole('combobox')).toHaveAttribute('aria-invalid', 'true');
  });
});

test.describe('Combobox — disabled', () => {
  test('disabled combobox does not open on click', async ({ page }) => {
    await page.goto('/iframe.html?id=components-combobox--disabled');
    await page.getByPlaceholder('Select a fruit...').click({ force: true });
    await expect(page.getByRole('listbox')).toHaveCount(0);
  });
});

test.describe('Combobox — auto-highlight', () => {
  test('first match is highlighted automatically as the query narrows', async ({ page }) => {
    await page.goto('/iframe.html?id=components-combobox--auto-highlight');
    const input = page.getByPlaceholder("Try typing 'a'...");
    await input.click();
    await input.fill('a');

    const activeDescendant = await input.getAttribute('aria-activedescendant');
    expect(activeDescendant).toBeTruthy();
  });
});

test.describe('Combobox — RTL', () => {
  test('renders and functions under dir=rtl', async ({ page }) => {
    await page.goto('/iframe.html?id=components-combobox--rtl');
    const input = page.getByPlaceholder('اختر فاكهة...');
    await input.click();
    await expect(page.getByRole('listbox')).toBeVisible();
    await expect(page.getByRole('option', { name: 'تفاح' })).toBeVisible();
  });
});
