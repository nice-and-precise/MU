
import { test, expect } from '@playwright/test';

test.describe('Owner Dashboard Flow', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/login');
        await page.fill('input[name="email"]', 'owner@midwestunderground.com');
        await page.fill('input[name="password"]', 'password123');
        await page.click('button[type="submit"]');
        await expect(page).toHaveURL(/\/dashboard/, { timeout: 30000 });
    });

    test('should render dashboard main elements', async ({ page }) => {
        // Verify URL redirection
        await expect(page).toHaveURL(/\/dashboard\/owner/, { timeout: 10000 });

        // Verify Header
        await expect(page.getByText('OWNERSHIP DASHBOARD')).toBeVisible();

        // Verify Key Widgets
        await expect(page.getByText('Financial Health')).toBeVisible();
        await expect(page.getByText('Risk Flags')).toBeVisible();
        await expect(page.getByText('Pending Actions')).toBeVisible();

        // Verify Chart
        await expect(page.getByText('Weekly Production Trends')).toBeVisible();
    });

    test('should navigate to projects list', async ({ page }) => {
        // Navigate via Sidebar logic (or direct URL for stability)
        await page.goto('/dashboard/projects');
        await expect(page).toHaveURL(/\/dashboard\/projects/);

        // Wait for loading to finish (if loading skeleton exists)
        // If loading.tsx renders initially, we wait for it to detach
        // But since we don't have a specific selector for the "whole" loading page other than generic structure...
        // We can just wait for the heading to appear with a longer timeout

        try {
            await expect(page.getByRole('heading', { name: /projects/i })).toBeVisible({ timeout: 15000 });
        } catch (e) {
            console.error('Projects Page Title:', await page.title());
            console.error('Projects content dump:', await page.content());
            throw e;
        }

        // CHeck for potential error state
        const errorMsg = page.getByText('Error loading projects.');
        if (await errorMsg.isVisible()) {
            console.error('Projects page failed to load data');
            throw new Error('Projects page showed error state');
        }
    });
});
