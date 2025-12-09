import { test, expect } from '@playwright/test';

test.describe('Daily Report Flow', () => {
    test.beforeEach(async ({ page }) => {
        // Capture console logs
        page.on('console', msg => console.log(`BROWSER CONSOLE: ${msg.text()}`));

        await page.goto('/login');
        await page.fill('input[name="email"]', 'foreman@midwestunderground.com');
        await page.fill('input[name="password"]', 'password123');
        await page.click('button[type="submit"]');

        // Wait for redirection
        try {
            await expect(page).toHaveURL(/\/dashboard/, { timeout: 30000 });
        } catch (e) {
            console.error('Login Redirect Failed. Current URL: ', page.url());
            console.error('Page Title: ', await page.title());
            throw e;
        }
    });

    test('should create a new daily report', async ({ page }) => {
        test.setTimeout(60000);
        // Navigate to New Report page
        await page.goto('/dashboard/reports/new');
        console.error('STEP: Navigated to /new');

        // Verify Heading
        try {
            await expect(page.getByText('New Daily Report', { exact: true })).toBeVisible({ timeout: 10000 });
            console.error('STEP: Heading Visible');
        } catch (e) {
            console.error('STEP FAILED: Heading Visibility');
            console.error('Content Dump:', await page.content());
            throw e;
        }

        // Handle potential Onboarding or Tour Modals
        // Escape key multiple times to be safe
        await page.keyboard.press('Escape');
        await page.waitForTimeout(300);
        await page.keyboard.press('Escape');
        await page.waitForTimeout(300);

        // Select Project
        try {
            await page.click('button[role="combobox"]', { force: true, timeout: 5000 });
            console.log('STEP: Clicked Combobox');
            await expect(page.locator('[role="option"]').first()).toBeVisible({ timeout: 5000 });
            console.log('STEP: Options Visible');
            const firstOption = page.locator('[role="option"]').first();
            await firstOption.click({ force: true });
            console.log('STEP: Selected Option');
        } catch (e) {
            console.log('STEP FAILED: Project Selection');
            throw e;
        }

        // Fill Date (Use robust random date to avoid collision across workers)
        const randomYear = 2025 + Math.floor(Math.random() * 50);
        const randomMonth = Math.floor(Math.random() * 12) + 1;
        const randomDay = Math.floor(Math.random() * 28) + 1;
        const randomDate = `${randomYear}-${randomMonth.toString().padStart(2, '0')}-${randomDay.toString().padStart(2, '0')}`;
        console.error('STEP: Fill Date', randomDate);
        await page.fill('input[name="reportDate"]', randomDate);

        // Fill Notes
        await page.fill('textarea[name="notes"]', 'E2E Test Report Notes');
        console.error('STEP: Filled Notes');

        // Submit
        try {
            await page.click('button[type="submit"]', { timeout: 5000 });
            console.error('STEP: Clicked Submit');
        } catch (e) {
            console.error('STEP FAILED: Submit Click');
            throw e;
        }

        // Wait for redirection or success
        try {
            // Check for potential success toast first (sometimes redirection is slow or toast appears first)
            const successToast = page.locator('.sonner-toast[data-type="success"]');
            try {
                await expect(successToast).toBeVisible({ timeout: 5000 });
                console.error('STEP: Success Toast Detected');
            } catch (ignore) {
                // Ignore if toast not seen immediately, wait for URL
            }
            await expect(page.getByRole('heading', { name: /daily reports/i })).toBeVisible({ timeout: 30000 });
            console.error('STEP: List Page Verified');
        } catch (e) {
            console.error('STEP FAILED: List Verification/Redirect');
            console.error('Final URL:', page.url());
            throw e;
        }
    });
});
