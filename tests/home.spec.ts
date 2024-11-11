import { test, expect } from '@playwright/test';

const TEST_URL = 'http://localhost:3001';

test.describe('Home Page', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto(`${TEST_URL}`);
	});

	test('should render the component correctly with default state', async ({ page }) => {
		await expect(page.locator('text=All Streams')).toBeVisible();
		await expect(page.locator('input[placeholder="Search Stream"]')).toBeVisible();
	});

	test('should render the component correctly with streams data', async ({ page }) => {
		// Check that the streams are displayed
		await expect(page.locator('text=backend')).toBeVisible();
		await expect(page.locator('text=frontend')).toBeVisible();
	});

	test('should filter streams based on search input', async ({ page }) => {
		const searchInput = page.locator('input[placeholder="Search Stream"]');
		await searchInput.fill('backend');
		await expect(page.locator('text=backend')).toBeVisible();

		// Clear the search and check if both streams are visible
		await searchInput.fill('');
		await expect(page.locator('text=backend')).toBeVisible();
		await expect(page.locator('text=frontend')).toBeVisible();
	});

	test('should display empty state if no streams are available', async ({ page }) => {
		const searchInput = page.locator('input[placeholder="Search Stream"]');
		await searchInput.fill(Math.random().toString());

		// Expect empty state view to be visible
		await expect(page.locator('text=No Stream found on this account')).toBeVisible();
		await expect(page.locator('text=All Streams (0)')).toBeVisible();
	});

	test('should display the create stream button', async ({ page }) => {
		const createButton = page.locator('text=Create Stream');
		await expect(createButton).toBeVisible();
	});

	test('should display the create stream modal on click', async ({ page }) => {
		const createButton = page.locator('text=Create Stream');
		await expect(createButton).toBeVisible();
		await createButton.click();
		await expect(page.locator('text=Create Stream').nth(1)).toBeVisible();
	});

	test.describe('Create Stream Modal', () => {
		test.beforeEach(async ({ page }) => {
			const createButton = page.locator('text=Create Stream');
			await createButton.click();
		});

		test('should render the form correctly', async ({ page }) => {
			// Check if essential elements are present in the form
			await expect(page.locator('input[placeholder="Name"]')).toBeVisible();
			await expect(page.locator('text=Schema Type')).toBeVisible();
			await expect(page.locator('button:has-text("Create")').nth(1)).toBeVisible();
		});

		test('should enable the submit button when form is valid', async ({ page }) => {
			// Fill in the form with valid values
			await page.fill('input[placeholder="Name"]', 'PlaywrightStream');

			await page.locator('button:has-text("Create")').nth(1).click();
		});

		test.describe('Delete Stream', () => {
			test('search, navigate, and delete demo stream', async ({ page }) => {
				// Step 1: Search for the demo stream
				await page.goto(`${TEST_URL}`);
				const searchInput = page.locator('input[placeholder="Search Stream"]');
				await searchInput.fill('PlaywrightStream');
				await expect(page.locator('text=PlaywrightStream')).toBeVisible();

				// Step 2: Navigate to the demo stream
				await page.locator('text=PlaywrightStream').click();
				const manageBtn = page.locator('[data-id="manage-stream-btn"]');
				await expect(manageBtn).toBeVisible();
				await manageBtn.click();

				await page.waitForTimeout(2000);

				// Step 3: Delete the demo stream
				const deleteBtn = page.locator('[data-id="delete-stream-btn"]');
				await expect(deleteBtn).toBeVisible();
				await deleteBtn.click();
				await expect(page.locator('text=Delete Stream')).toBeVisible();
				await page.fill('input[placeholder*="Type the name of the stream to confirm. i.e."]', 'PlaywrightStream');
				const confirmDeleteBtn = page.getByRole('button', { name: 'Delete' });
				await expect(confirmDeleteBtn).toBeEnabled();
				await confirmDeleteBtn.click();

				// Wait for the delete API to finish
				const [response] = await Promise.all([
					page.waitForResponse((response) => response.url().includes('PlaywrightStream') && response.status() === 200),
					confirmDeleteBtn.click(),
				]);

				await expect(response).toBeDefined();

				// Step 4: Check if stream is deleted
				await page.goto(`${TEST_URL}`);
				await expect(searchInput).toBeVisible();
				await searchInput.fill('PlaywrightStream');
				await expect(page.locator('text=No Stream found on this account')).toBeVisible();
				await expect(page.locator('text=All Streams (0)')).toBeVisible();
			});
		});
	});
});
