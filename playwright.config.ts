import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
	testDir: './tests',
	testIgnore: '**/login.spec.ts',
	/* Run tests in files in parallel */
	fullyParallel: true, // Set this to false to ensure sequential execution of files
	/* Fail the build on CI if you accidentally left test.only in the source code. */
	forbidOnly: !!process.env.CI,
	/* Retry on CI only */
	retries: process.env.CI ? 2 : 0,
	/* Opt out of parallel tests on CI. */
	workers: process.env.CI ? 1 : undefined,
	/* Reporter to use. See https://playwright.dev/docs/test-reporters */
	reporter: 'line',
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
			name: 'chromium',
			use: { ...devices['Desktop Chrome'] },
		},
		// {
		// 	name: 'Firefox',
		// 	use: { ...devices['Desktop Firefox'] },
		// },
		// {
		// 	name: 'Safari',
		// 	use: { ...devices['Desktop Safari'] },
		// },
	],

	/* Run your local dev server before starting the tests */
	webServer: {
		command: 'pnpm run dev',
		url: 'http://localhost:3001',
		reuseExistingServer: false,
		env: {
			PORT: '3001',
			VITE_PARSEABLE_URL: 'https://demo.parseable.com',
			VITE_USE_BASIC_AUTH: 'true',
			VITE_USERNAME: 'admin',
			VITE_PASSWORD: 'admin',
		},
	},
});
