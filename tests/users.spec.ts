import { test, expect, BrowserContext, Page } from '@playwright/test';

const TEST_URL = 'http://localhost:3001/users';

test.describe('Users Page', () => {
    let context: BrowserContext;
    let page: Page;

    test.beforeEach(async ({ browser }) => {
        context = await browser.newContext();
        page = await context.newPage();
    });

    test.afterEach(async () => {
        await context.close();
    });

    // Check if the page title is correct i.e. Parseable | Users
    test('has title', async ({ page }) => {
        await page.goto(TEST_URL);
        await expect(page).toHaveTitle(/Parseable | Users/);
    });

    test("should have a table with Roles", async ({ page }) => {
        await page.goto(TEST_URL);

        // Check if the Roles heading is visible
        await expect(page.getByRole('heading', { name: 'Roles' })).toBeVisible();

        // Check if the table with the correct headers is visible
        const rolesTable = page.locator('table').filter({
            // Check if the table has thead with Role and Access columns
            has: page.locator('thead tr').filter({
                has: page.locator('th').nth(0).filter({ hasText: 'Role' })
            }).filter({
                has: page.locator('th').nth(1).filter({ hasText: 'Access' })
            })
        });

        await expect(rolesTable).toBeVisible();

        // Check if the table has rows (excluding the header row)
        const rows = rolesTable.locator('tbody tr');
        const rowCount = await rows.count(); // Get the number of rows in the table
        expect(rowCount).toBeGreaterThan(0);
    });

    test("should have a button to create a new Role", async ({ page }) => {
        await page.goto(TEST_URL);

        // Check if the Create Role button is visible
        const createRoleButton = page.getByRole('button', { name: 'Create Role' });
        await expect(createRoleButton).toBeVisible();
    });

    test("should open the Create Role Modal when the Create Role button is clicked", async ({ page }) => {
        await page.goto(TEST_URL);

        // Click on the Create Role button
        const createRoleButton = page.getByRole('button', { name: 'Create Role' });
        await createRoleButton.click();

        // Check if the Create Role Modal is visible
        await expect(page.locator('text=Enter the name of the Role')).toBeVisible();
    });

    test.describe('Create Role Modal', () => {
        test.beforeEach(async ({ page }) => {
            await page.goto(TEST_URL);

            // Click on the Create Role button
            const createRoleButton = page.getByRole('button', { name: 'Create Role' });
            await createRoleButton.click();
        });

        test("should have a text input to enter the name of the Role", async ({ page }) => {
            // Check if the text input is visible
            const roleNameInput = page.locator('input[placeholder="Type the name of the Role to create"]');
            await expect(roleNameInput).toBeVisible();
        });

        test("should have a button to create the Role", async ({ page }) => {
            // Check if the Create button is visible
            const createButton = page.locator('[itemid="create-role-button"]');
            await expect(createButton).toBeVisible();
        });

        test("should have a button to cancel creating the Role", async ({ page }) => {
            // Check if the Cancel button is visible
            const cancelButton = page.getByRole('button', { name: 'Cancel' });
            await expect(cancelButton).toBeVisible();
        });
    });

    test("should have a button to set the default OIDC Role", async ({ page }) => {
        await page.goto(TEST_URL);

        // Check if the Set Default OIDC Role button is visible
        const setDefaultRoleButton = page.getByRole('button', { name: 'Set Default OIDC Role' });
        await expect(setDefaultRoleButton).toBeVisible();
    });

    test("should have a button to navigate to the Docs", async ({ page }) => {
        await page.goto(TEST_URL);

        // Check if the Docs button is visible
        const docsButton = page.locator('[itemid="roles-docs"]');
        await expect(docsButton).toBeVisible();
    });

    test("Should navigate to the Docs page when the Docs button is clicked", async ({ page }) => {
        await page.goto(TEST_URL);

        // Click on the Docs button and wait for a new page to open
        const [newPage] = await Promise.all([
            page.waitForEvent('popup'), // Wait for a new tab (popup) to open
            page.locator('[itemid="roles-docs"]').click()
        ]);

        // Verify that the new page's URL matches the expected URL
        await newPage.waitForLoadState();
        // Wait for the page to load and check if the heading is present
        const heading = newPage.locator('h1', { hasText: 'Role Based Access Control' });
        await expect(heading).toBeVisible();
    });

});