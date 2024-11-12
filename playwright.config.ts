import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
	testDir: './tests',
	/* Run tests in files in parallel */
	fullyParallel: false, // Set this to false to ensure sequential execution of files
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

	/* Run tests in sequence by specifying files directly */
	projects: [
		{
			name: 'login - Chromium',
			testMatch: '**/login.spec.ts', // Ensure login runs first
			use: { ...devices['Desktop Chrome'] },
		},
		{
			name: 'home - Chromium',
			testMatch: '**/home.spec.ts', // Ensure home runs second
			use: { ...devices['Desktop Chrome'] },
		},
		{
			name: 'login - Firefox',
			testMatch: '**/login.spec.ts', // Ensure login runs first on Firefox
			use: { ...devices['Desktop Firefox'] },
		},
		{
			name: 'home - Firefox',
			testMatch: '**/home.spec.ts', // Ensure home runs second on Firefox
			use: { ...devices['Desktop Firefox'] },
		},
		{
			name: 'login - Safari',
			testMatch: '**/login.spec.ts', // Ensure login runs first on Safari
			use: { ...devices['Desktop Safari'] },
		},
		{
			name: 'home - Safari',
			testMatch: '**/home.spec.ts', // Ensure home runs second on Safari
			use: { ...devices['Desktop Safari'] },
		},
	],

	/* Run your local dev server before starting the tests */
	// webServer: {
	//   command: 'npm run start',
	//   url: 'http://127.0.0.1:3000',
	//   reuseExistingServer: !process.env.CI,
	// },
});
