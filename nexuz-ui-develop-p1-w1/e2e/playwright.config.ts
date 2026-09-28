import { defineConfig, devices, type ReporterDescription } from "@playwright/test";

/// <reference types="node" />

const TOP_APP_BASE_URL = process.env.TOP_BASE_URL ?? "http://localhost:3002";
const normalizeBaseUrl = (baseUrl: string) => (baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`);
const managedServers = [
	process.env.TOP_BASE_URL
		? null
		: {
				command: "pnpm --filter top-app dev",
				url: "http://localhost:3002/api/health",
				reuseExistingServer: true,
				timeout: 120000,
			},
].filter((server) => server !== null);

const reporter: ReporterDescription[] = process.env.CI
	? [
			["list"],
			["html", { open: "never" }],
			["json", { outputFile: "playwright-report/results.json" }],
		]
	: [["list"], ["html", { open: "never" }]];

/**
 * Playwright config for nexuz-ui e2e tests.
 *
 * Start the top app before running:
 *   pnpm --filter top-app dev   (port 3002)
 *
 * Then run:
 *   pnpm --filter e2e test
 */
export default defineConfig({
	testDir: ".",
	/* Run each file's tests in order; no parallel workers per file */
	fullyParallel: false,
	workers: 1,
	retries: 1,
	reporter,

	use: {
		/* Fail fast on navigation errors */
		actionTimeout: 10_000,
		navigationTimeout: 15_000,
		screenshot: "only-on-failure",
		video: "off",
	},
	webServer: managedServers.length > 0 ? managedServers : undefined,

	projects: [
		{
			name: "top-app",
			testMatch: "booking-flows/**/*.spec.ts",
			use: {
				...devices["Desktop Chrome"],
				baseURL: normalizeBaseUrl(TOP_APP_BASE_URL),
			},
		},
	],
});
