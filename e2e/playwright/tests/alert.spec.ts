import { test, expect } from '@playwright/test';

test.describe('Alert', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/iframe.html?id=components-alert--success');
    });

    test('renders with correct accessibility attributes', async ({ page }) => {
        const alert = page.getByRole('alert');

        await expect(alert).toBeVisible();
        await expect(alert).toHaveAttribute('aria-live', 'assertive');
        await expect(alert).toHaveAttribute('aria-atomic', 'true');
    });

    test('renders title and description', async ({ page }) => {
        const alert = page.getByRole('alert');

        await expect(alert).toContainText('Success Tips');
        await expect(alert).toContainText(
            'Detailed description and advice about your submission.',
        );
    });

    test('renders the icon as decorative content', async ({ page }) => {
        const alert = page.getByRole('alert');
        const icon = alert.locator('svg');

        await expect(icon).toHaveAttribute('aria-hidden', 'true');
    });
});

test.describe('Closable Alert', () => {
    test('renders a close button', async ({ page }) => {
        await page.goto(
            '/iframe.html?id=components-alert--closable-dismisses',
        );

        const alert = page.getByRole('alert');
        const closeButton = page.getByRole('button', {
            name: 'Close alert',
        });

        await expect(alert).toBeVisible();
        await expect(closeButton).toBeVisible();
    });

    test('dismisses when the close button is clicked', async ({ page }) => {
        await page.goto(
            '/iframe.html?id=components-alert--closable-dismisses',
        );

        const alert = page.getByRole('alert');
        const closeButton = page.getByRole('button', {
            name: 'Close alert',
        });

        await expect(alert).toBeVisible();

        await closeButton.click();

        await expect(alert).not.toBeVisible();
    });
});

test.describe('Alert urgency', () => {
    test('uses assertive announcements by default', async ({ page }) => {
        await page.goto('/iframe.html?id=components-alert--info');

        const alert = page.getByRole('alert');

        await expect(alert).toHaveAttribute('aria-live', 'assertive');
    });
});