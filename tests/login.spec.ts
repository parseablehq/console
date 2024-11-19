import { test, expect, BrowserContext } from '@playwright/test';

const TEST_URL = 'http://localhost:3001';

test.describe('Login Page', () => {
	let context: BrowserContext;

	test.beforeEach(async ({ browser }) => {
		context = await browser.newContext();
		await context.newPage();
	});

	test.afterEach(async () => {
		await context.close();
	});
	// Test for title of the page
	test('has title', async ({ page }) => {
		await page.goto(TEST_URL);
		await expect(page).toHaveTitle(/Parseable | Login/);
	});

	// Test to ensure login form works with valid credentials
	test('login with valid credentials', async ({ page }) => {
		await page.goto(TEST_URL);

		await page.fill('input[placeholder="J.Doe"]', 'admin');
		await page.fill('input[placeholder="**********"]', 'admin');

		await page.click('button[type="submit"]');

		await expect(page).toHaveTitle(/Parseable | Streams/);
	});

	// Test to ensure login button is disabled when form is invalid
	test('login button is disabled when form is invalid', async ({ page }) => {
		await page.goto(TEST_URL);

		const loginButton = page.locator('button[type="submit"]');

		await expect(loginButton).toBeDisabled();

		await page.fill('input[placeholder="J.Doe"]', 'admin');

		await expect(loginButton).toBeDisabled();
	});

	// Test to check login with invalid credentials
	test('login with invalid credentials', async ({ page }) => {
		await page.goto(TEST_URL);

		await page.fill('input[placeholder="J.Doe"]', 'invalidUser');
		await page.fill('input[placeholder="**********"]', 'invalidPassword');

		await page.click('button[type="submit"]');

		const errorMessage = await page.locator('text=Bad Request, Invalid Redirect URL!').first();
		await expect(errorMessage).toBeVisible();
	});

	// Test to check OAuth login button functionality
	// test('OAuth login button works', async ({ page }) => {
	// 	await page.goto(TEST_URL);
	// 	await page.getByRole('link', { name: 'Login with OAuth' }).click();

	// 	const pageOrigin = new URL(page.url()).origin;
	// 	const expectedOAuthURL = `${pageOrigin}/api/v1/o/login?redirect=${TEST_URL}`;

	// 	await page.waitForURL(expectedOAuthURL);

	// 	await expect(page).toHaveURL(expectedOAuthURL);
	// });
});
