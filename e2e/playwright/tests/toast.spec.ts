import { test, expect } from '@playwright/test';

test.describe('Toast', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto(
            '/iframe.html?id=components-toast--default',
        );
    });

    test('shows a success notification', async ({ page }) => {
        await page.getByRole('button', {
            name: 'Success',
        }).click();

        const toast = page.getByRole('status');

        await expect(toast).toBeVisible();
        await expect(toast).toContainText('Success');
        await expect(toast).toContainText(
            'Your changes have been saved successfully.',
        );
    });

    test('shows an information notification', async ({ page }) => {
        await page.getByRole('button', {
            name: 'Info',
        }).click();

        const toast = page.getByRole('status');

        await expect(toast).toBeVisible();
        await expect(toast).toContainText('Information');
    });

    test('shows a warning notification', async ({ page }) => {
        await page.getByRole('button', {
            name: 'Warning',
        }).click();

        const toast = page.getByRole('status');

        await expect(toast).toBeVisible();
        await expect(toast).toContainText('Warning');
    });

    test('shows an error notification', async ({ page }) => {
        await page.getByRole('button', {
            name: 'Error',
        }).click();

        const toast = page.getByRole('status');

        await expect(toast).toBeVisible();
        await expect(toast).toContainText('Error');
    });

    test('can be dismissed manually', async ({ page }) => {
        await page.goto(
            '/iframe.html?id=components-toast--persistent',
        );

        await page.getByRole('button', {
            name: 'Show persistent notification',
        }).click();

        const toast = page.getByRole('status');

        await expect(toast).toBeVisible();

        await page.getByRole('button', {
            name: 'Dismiss notification',
        }).click();

        await expect(toast).not.toBeVisible();
    });
});