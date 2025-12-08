
import { test, expect } from '@playwright/test';

test.describe('Daily Report Flow', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/login');
        await page.fill('input[name="email"]', 'foreman@midwestunderground.com');
        await page.fill('input[name="password"]', 'password123');
        await page.click('button[type="submit"]');

        // Wait for redirection
        await expect(page).toHaveURL(/\/dashboard/, { timeout: 30000 });

        // Capture console logs
        page.on('console', msg => console.log(`BROWSER CONSOLE: ${msg.text()}`));
    });

    test('should create a new daily report', async ({ page }) => {
        // Navigate to New Report page
        await page.goto('/dashboard/reports/new');

        // Verify Heading
        await expect(page.getByText('New Daily Report', { exact: true })).toBeVisible();

        // Handle potential Onboarding or Tour Modals
        await page.keyboard.press('Escape');
        await page.waitForTimeout(300);
        await page.keyboard.press('Escape');
        await page.waitForTimeout(300);

        // Select Project
        await page.click('button[role="combobox"]');
        await expect(page.locator('[role="option"]').first()).toBeVisible();
        const firstOption = page.locator('[role="option"]').first();
        await firstOption.click();

        // Fill Date (Use random future date to avoid conflict)
        const randomDay = Math.floor(Math.random() * 28) + 1;
        const randomDate = `2035-01-${randomDay.toString().padStart(2, '0')}`;
        await page.fill('input[name="reportDate"]', randomDate);

        // Fill Notes
        await page.fill('textarea[name="notes"]', 'E2E Test Report Notes');

        // Click Create
        await page.click('button[type="submit"]');

        // Check for validation errors
        const validationMessages = page.locator('p.text-destructive');
        if (await validationMessages.count() > 0) {
            const count = await validationMessages.count();
            for (let i = 0; i < count; ++i) {
                const text = await validationMessages.nth(i).textContent();
                if (text && text.trim() !== '*') {
                    console.error('Real Validation Error:', text);
                }
            }
        }

        // Wait for success toast or redirect
        try {
            const successToast = page.getByText('Daily report created successfully');
            try {
                // Wait for toast if visible?
                await expect(successToast).toBeVisible({ timeout: 5000 });
                console.log('Success toast detected');
            } catch (e) {
                console.log('No success toast seen in 5s');
            }

            await expect(page).toHaveURL(/\/dashboard\/reports\/?$/, { timeout: 15000 });
        } catch (e) {
            console.log('Final URL:', page.url());
            throw e;
        }

        // Verify redirect to list
        await expect(page.getByText('Daily Reports').first()).toBeVisible();
    });
});
