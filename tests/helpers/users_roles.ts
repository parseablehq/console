import { Page, expect } from '@playwright/test';

/**
 * Creates a new role in the application.
 *
 * @param page - The Playwright Page object representing the browser page.
 * @param ROLE_NAME - The name of the role to be created.
 * @param ACCESS - The access level to be assigned to the role.
 *
 * @returns A promise that resolves when the role creation process is complete.
 */
const createNewRole = async (page: Page, ROLE_NAME: string, ACCESS: string) => {
	const createRoleButton = page.getByRole('button', { name: 'Create Role' });
	await createRoleButton.click();
	const roleNameInputCreate = page.getByPlaceholder('Type the name of the Role to create');
	await roleNameInputCreate.fill(ROLE_NAME);

	const accessLevelDropdown = page.getByPlaceholder('Select privilege');
	await accessLevelDropdown.click();
	await page
		.locator('.mantine-Select-option')
		.filter({ hasText: `${ACCESS}` })
		.click();

	// Wait for one second
	await page.waitForTimeout(1000);
	// Check if the Create button is enabled
	const createButton = page.getByTestId('create-role-modal-button');
	await expect(createButton).toBeEnabled();
	await createButton.click();
};

/**
 * Deletes a role if it exists in the roles table on the given page.
 *
 * @param page - The Playwright Page object representing the browser page.
 * @param ROLE_NAME - The name of the role to be deleted.
 *
 * @remarks
 * This function locates the roles table on the page, checks if the specified role exists,
 * and if it does, clicks the delete button, confirms the deletion, and verifies that the role
 * is no longer visible in the table.
 */
const deleteIfRoleExists = async (page: Page, ROLE_NAME: string) => {
	const rolesTable = page.locator('table').filter({
		has: page
			.locator('thead tr')
			.filter({
				has: page.locator('th').nth(0).filter({ hasText: 'Role' }),
			})
			.filter({
				has: page.locator('th').nth(1).filter({ hasText: 'Access' }),
			}),
	});

	const roleRow = rolesTable.locator('tbody tr').filter({ hasText: ROLE_NAME });
	const roleRowCount = await roleRow.count();

	if (roleRowCount !== 0) {
		const deleteButton = roleRow.getByRole('button', { name: 'Delete Role' });
		await deleteButton.click();

		await page.waitForSelector('text=Are you sure you want to delete this role?');
		const roleNameInput = page.getByPlaceholder('Please enter the Role');
		await roleNameInput.fill(ROLE_NAME);

		const confirmDeleteButton = page.getByRole('button', { name: 'Delete' });
		await expect(confirmDeleteButton).toBeEnabled();
		await confirmDeleteButton.click();

		await expect(roleRow).not.toBeVisible();
	}
};

export { createNewRole, deleteIfRoleExists };
