import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
	testDir: './tests',
	/* Run tests in files in parallel */
	fullyParallel: true,
	/* Fail the build on CI if you accidentally left test.only in the source code. */
	forbidOnly: !!process.env.CI,
	/* Retry on CI only */
	retries: process.env.CI ? 2 : 0,
	/* Opt out of parallel tests on CI. */
	workers: process.env.CI ? 1 : undefined,
	/* Reporter to use. See https://playwright.dev/docs/test-reporters */
	reporter: 'html',
	/* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
	use: {
		/* Base URL to use in actions like `await page.goto('/')`. */
		// baseURL: 'http://127.0.0.1:3000',

		/* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
		trace: 'on-first-retry',
	},

	/* Configure projects for major browsers */
	projects: [
		{
			name: 'login - Chromium',
			testMatch: '**/login.spec.ts', // Ensure login runs first
			use: { ...devices['Desktop Chrome'] },
		},
		{
			name: 'users - Chromium',
			testMatch: '**/users.spec.ts', // Ensure users runs second
			use: { ...devices['Desktop Chrome'] },
			dependencies: ['login - Chromium'],
		},
		{
			name: 'login - Firefox',
			testMatch: '**/login.spec.ts', // Ensure login runs first on Firefox
			use: { ...devices['Desktop Firefox'] },
		},
		{
			name: 'users - Firefox',
			testMatch: '**/users.spec.ts', // Ensure users runs second on Firefox
			use: { ...devices['Desktop Firefox'] },
			dependencies: ['login - Firefox'],
		},
		{
			name: 'login - Safari',
			testMatch: '**/login.spec.ts', // Ensure login runs first on Safari
			use: { ...devices['Desktop Safari'] },
		},
		{
			name: 'users - Safari',
			testMatch: '**/users.spec.ts', // Ensure users runs second on Safari
			use: { ...devices['Desktop Safari'] },
			dependencies: ['login - Safari'],
		},
	],

	/* Run your local dev server before starting the tests */
	// webServer: {
	//   command: 'npm run start',
	//   url: 'http://127.0.0.1:3000',
	//   reuseExistingServer: !process.env.CI,
	// },
});
