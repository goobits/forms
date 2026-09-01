import { devices } from '@playwright/test';

import {
	createWorkspacePlaywrightConfig,
	resolveWorkspacePlaywrightOutputPath
} from '@sketchapi/testing/playwright';

const baseURL = 'http://localhost:3180';
const config = createWorkspacePlaywrightConfig(import.meta.url, {
	baseURL,
	outputDir: resolveWorkspacePlaywrightOutputPath('sketchpad-com-forms', 'artifacts'),
	parallel: true,
	projects: [
		{
			name: 'chromium',
			use: { ...devices['Desktop Chrome'] }
		},
		{
			name: 'firefox',
			use: { ...devices['Desktop Firefox'] }
		},
		{
			name: 'webkit',
			use: { ...devices['Desktop Safari'] }
		},
		{
			name: 'mobile-chrome',
			use: { ...devices['Pixel 5'] }
		},
		{
			name: 'mobile-safari',
			use: { ...devices['iPhone 12'] }
		}
	],
	reporter: [
		[
			'html',
			{
				open: 'never',
				outputFolder: resolveWorkspacePlaywrightOutputPath('sketchpad-com-forms', 'html-report')
			}
		]
	],
	screenshot: true,
	testDir: './e2e'
});

config.webServer = {
	command: 'pnpm run demo',
	url: baseURL,
	reuseExistingServer: false
};

export default config;
