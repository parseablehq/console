import { test, expect, BrowserContext, Page } from '@playwright/test';

const TEST_URL = 'http://localhost:3001/users';
const ROLE_NAME = 'playwright-test-role';

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

            // const createRoleButton = page.getByRole('button', { name: 'Create Role' });
            // await createRoleButton.click();
        });

        test("create role modal should have the required elements", async ({ page }) => {
            await expect(page.getByPlaceholder("Type the name of the Role to create")).toBeVisible();
            await expect(page.getByPlaceholder("Select privilege")).toBeVisible();
            await expect(page.getByTestId('create-role-modal-button')).toBeDisabled();
            await expect(page.getByTestId("cancel-role-modal-button")).toBeVisible();
            // close the modal
            await page.getByTestId("cancel-role-modal-button").click();
            await expect(page.locator('text=Enter the name of the Role')).not.toBeVisible();
        });

        test('create a new Role', async ({ page }) => {
            console.log("Starting 'create a new Role' test");

            // Wait for one second
            await page.waitForTimeout(1000);

            // check if loading text is not visible on the roles section
            await expect(page.locator('table').filter({ hasText: 'RoleAccessDeleteloading' }).locator('td')).not.toBeVisible();


            // Inline the helper function here to check if it runs
            const rolesTable = page.locator('table').filter({
                has: page.locator('thead tr').filter({
                    has: page.locator('th').nth(0).filter({ hasText: 'Role' })
                }).filter({
                    has: page.locator('th').nth(1).filter({ hasText: 'Access' })
                })
            });

            const roleRow = rolesTable.locator('tbody tr').filter({ hasText: ROLE_NAME });
            const roleRowCount = await roleRow.count();

            console.log(`Found ${roleRowCount} rows with the role name "${ROLE_NAME}".`);
            if (roleRowCount === 0) {
                console.log(`Role "${ROLE_NAME}" does not exist. Skipping deletion.`);

            } else {

                console.log(`Role "${ROLE_NAME}" exists. Attempting to delete.`);
                const deleteButton = roleRow.getByRole('button', { name: 'Delete Role' });
                await deleteButton.click();

                await page.waitForSelector('text=Are you sure you want to delete this role?');
                const roleNameInput = page.getByPlaceholder('Please enter the Role');
                await roleNameInput.fill(ROLE_NAME);

                const confirmDeleteButton = page.getByRole('button', { name: 'Delete' });
                await expect(confirmDeleteButton).toBeEnabled();
                await confirmDeleteButton.click();

                await expect(roleRow).not.toBeVisible();
                console.log(`Successfully deleted role "${ROLE_NAME}".`);
            }

            console.log("Finished checking if role exists; now creating role.");

            const createRoleButton = page.getByRole('button', { name: 'Create Role' });
            await createRoleButton.click();
            const roleNameInputCreate = page.getByPlaceholder("Type the name of the Role to create");
            await roleNameInputCreate.fill(ROLE_NAME);

            const accessLevelDropdown = page.getByPlaceholder("Select privilege");
            await accessLevelDropdown.click();
            await page.locator('.mantine-Select-option').filter({ hasText: /^admin$/ }).click();

            // Wait for one second
            await page.waitForTimeout(1000);
            // Check if the Create button is enabled
            const createButton = page.getByTestId('create-role-modal-button');
            await expect(createButton).toBeEnabled();
            await createButton.click();

            // wait for the modal to close, and the new Role to be added to the table
            await page.waitForSelector('text=Enter the name of the Role', { state: 'detached' });
            const newRoleRow = page.locator('tbody tr').filter({ hasText: ROLE_NAME });
            await expect(newRoleRow).toBeVisible();
            const newRoleAccess = newRoleRow.locator('td').nth(1);
            // check if new role has admin access
            await expect(newRoleAccess).toHaveText('admin');
        });

        test('delete the newly created Role', async ({ page }) => {
            // Wait for one second
            await page.waitForTimeout(1000);

            // check if loading text is not visible on the roles section
            await expect(page.locator('table').filter({ hasText: 'RoleAccessDeleteloading' }).locator('td')).not.toBeVisible();

            // Inline the helper function here to check if it runs
            const rolesTable = page.locator('table').filter({
                has: page.locator('thead tr').filter({
                    has: page.locator('th').nth(0).filter({ hasText: 'Role' })
                }).filter({
                    has: page.locator('th').nth(1).filter({ hasText: 'Access' })
                })
            });

            const roleRow = rolesTable.locator('tbody tr').filter({ hasText: ROLE_NAME });
            const roleRowCount = await roleRow.count();

            console.log(`Found ${roleRowCount} rows with the role name "${ROLE_NAME}".`);
            if (roleRowCount === 0) {
                console.log(`Role "${ROLE_NAME}" does not exist. Skipping deletion.`);
                return;
            }

            console.log(`Role "${ROLE_NAME}" exists. Attempting to delete.`);
            const deleteButton = roleRow.getByRole('button', { name: 'Delete Role' });
            await deleteButton.click();

            await page.waitForSelector('text=Are you sure you want to delete this role?');
            const roleNameInput = page.getByPlaceholder('Please enter the Role');
            await roleNameInput.fill(ROLE_NAME);

            const confirmDeleteButton = page.getByRole('button', { name: 'Delete' });
            await expect(confirmDeleteButton).toBeEnabled();
            await confirmDeleteButton.click();

            // check if loading text is not visible on the roles section
            await expect(page.locator('table').filter({ hasText: 'RoleAccessDeleteloading' }).locator('td')).not.toBeVisible();

            await expect(roleRow).not.toBeVisible();
            console.log(`Successfully deleted role "${ROLE_NAME}".`);

            await expect(rolesTable).toBeVisible();

            const deletedRoleRow = rolesTable.locator('tbody tr').filter({ hasText: ROLE_NAME });
            await expect(deletedRoleRow).not.toBeVisible();
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
        const docsButton = page.getByTestId("roles-docs");
        await expect(docsButton).toBeVisible();
    });

    test("Should navigate to the Docs page when the Docs button is clicked", async ({ page }) => {
        await page.goto(TEST_URL);

        // Click on the Docs button and wait for a new page to open
        const [newPage] = await Promise.all([
            page.waitForEvent('popup'), // Wait for a new tab (popup) to open
            page.getByTestId("roles-docs").click()
        ]);

        // Verify that the new page's URL matches the expected URL
        await newPage.waitForLoadState();
        // Wait for the page to load and check if the heading is present
        const heading = newPage.locator('h1', { hasText: 'Role Based Access Control' });
        await expect(heading).toBeVisible();
    });

});