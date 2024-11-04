import { test, expect } from '@playwright/test';

test('has title', async ({ page }) => {
	await page.goto('https://demo.parseable.com');

	await expect(page).toHaveTitle(/Parseable | Login/);
});
