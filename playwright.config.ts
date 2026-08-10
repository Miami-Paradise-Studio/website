import { defineConfig, devices } from '@playwright/test';

/**
 * The WebGL hero only renders on a real GPU path. Headless-shell Chromium falls
 * back to software rendering, where the canvas either takes tens of seconds or
 * never paints, which reads as an application bug when it is a CI artefact.
 * `channel: 'chromium'` selects the new headless mode that keeps the GPU path.
 */
export default defineConfig({
	testDir: './tests',
	testMatch: '**/*.spec.ts',
	globalSetup: './tests/server.ts',
	globalTeardown: './tests/teardown.ts',
	fullyParallel: true,
	forbidOnly: !!process.env.CI,
	retries: process.env.CI ? 1 : 0,
	reporter: process.env.CI ? 'github' : 'list',

	use: {
		baseURL: 'http://localhost:4321',
		trace: 'on-first-retry',
	},

	projects: [
		{
			name: 'chromium',
			use: { ...devices['Desktop Chrome'], channel: 'chromium' },
		},
	],

});
