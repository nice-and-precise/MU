
import { test, expect } from '@playwright/test';

test.describe('Crew Dashboard Flow', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/login');
        await page.fill('input[name="email"]', 'operator@midwestunderground.com');
        await page.fill('input[name="password"]', 'password123');
        await page.click('button[type="submit"]');

        // Wait for redirection to crew dashboard
        await expect(page).toHaveURL(/\/dashboard\/crew/, { timeout: 30000 });
    });

    test('should render crew dashboard main elements', async ({ page }) => {
        // Confirm URL
        await expect(page).toHaveURL(/\/dashboard\/crew/);

        // Check for error boundary or login
        const errorText = page.getByText('Error');
        if (await errorText.count() > 0 && await errorText.first().isVisible()) {
            console.log('Found "Error" on page');
        }

        // Verify Header using text
        await expect(page.getByText('Crew Dashboard', { exact: true })).toBeVisible();

        // Verify key sections
        await expect(page.getByText('My Work: Today')).toBeVisible();
        await expect(page.getByText('Time Status')).toBeVisible();
        await expect(page.getByText('Daily Report').first()).toBeVisible();
    });

    test('should show clock-in controls', async ({ page }) => {
        // Verify we see Clock In or Clock Out
        // Using desktop link specifically for desktop viewport test
        const timerButton = page.locator('a[href*="/dashboard/time"]');
        await expect(timerButton).toBeVisible();
    });
});
