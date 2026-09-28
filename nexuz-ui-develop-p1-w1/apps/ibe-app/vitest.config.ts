import path from "node:path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

/**
 * Vitest configuration for the IBE app.
 * Uses @vitejs/plugin-react for reliable React 19 JSX transform.
 * Resolves @repo/ui workspace packages via explicit aliases.
 */
export default defineConfig({
	plugins: [react()],
	test: {
		environment: "jsdom",
		globals: true,
		setupFiles: ["./vitest.setup.ts"],
		exclude: ["node_modules", ".next", "dist", "coverage"],
		coverage: {
			provider: "v8",
			reporter: ["text", "html", "json-summary", "lcov"],
			reportsDirectory: "./coverage",
			include: [
				"components/customize/seat-map/**/*.{ts,tsx}",
				"components/passenger-name/**/*.{ts,tsx}",
				"components/customize/inflight-meals/**/*.{ts,tsx}",
				"components/flight-selection/**/*.{ts,tsx}",
				"modules/hooks/seat-map/**/*.{ts,tsx}",
				"modules/hooks/flight-selection/**/*.{ts,tsx}",
				"modules/utils/constants/seat-map/**/*.{ts,tsx}",
				"modules/utils/helpers/customize/inflight-meals/**/*.{ts,tsx}",
				"modules/utils/helpers/seat-map/**/*.{ts,tsx}",
				"modules/utils/helpers/flight-selection/**/*.{ts,tsx}",
				"modules/hooks/customize/inflight-meals/**/*.{ts,tsx}",
				"modules/utils/validations/seat-map/**/*.{ts,tsx}",
				"modules/services/seat-map/**/*.{ts,tsx}",
				"components/bundle/**/*.{ts,tsx}",
				"modules/utils/helpers/**/*.ts",
				"modules/utils/validations/**/*.ts",
				"app/[locale]/**/*.tsx",
				"components/customer-information/**/*.tsx",
				"store/slices/customer-information/**/*.ts",
				"store/slices/bundle-offers/**/*.ts",
				"store/slices/seat-map/**/*.ts",
				"store/slices/flight-selection/**/*.ts",
				"components/common/passenger-number-badge/**/*.{ts,tsx}",
				"modules/utils/helpers/passenger-name/**/*.{ts,tsx}",
				"modules/utils/helpers/bundle/**/*.{ts,tsx}",
				"modules/utils/validations/passenger.schema/**/*.{ts,tsx}",
				"modules/utils/helpers/common/route-type/**/*.{ts,tsx}",
				"store/slices/passenger.slice/**/*.{ts,tsx}",
				"components/booking-stepper/booking-stepper.tsx",
				"components/customize/transport-service/**/*.{ts,tsx}",
				"modules/utils/helpers/customize/transport-service/**/*.{ts,tsx}",
				"modules/hooks/customize/transport-service/**/*.{ts,tsx}",
				"modules/services/common/offer-ancillary/offer-ancillary-service/**/*.{ts,tsx}",
				"modules/services/flight-selection/flight-selection.service/**/*.{ts,tsx}",
				"components/common/ancillary-alerts/**/*.{ts,tsx}",
				"components/common/flight-menu-bar/**/*.{ts,tsx}",
				"components/customize/customize.tsx",
				"modules/hooks/air-ancillary/**/*.{ts,tsx}",
				"modules/hooks/common/booking-bundle-status/**/*.{ts,tsx}",
				"modules/hooks/common/departure-deadline/**/*.{ts,tsx}",
			],
			exclude: ["**/*.test.{ts,tsx}", "**/*.d.ts", "**/node_modules/**", "**/coverage/**"],
			thresholds: {
				statements: 80,
				branches: 80,
				functions: 80,
				lines: 80,
			},
		},
	},
	resolve: {
		alias: {
			// Force all packages (including @repo/ui which has its own React copy)
			// to resolve to the same React instance as ibe-app to avoid the
			// "Invalid hook call" duplicate-React error in tests.
			react: path.resolve(__dirname, "node_modules/react"),
			"react-dom": path.resolve(__dirname, "node_modules/react-dom"),
			"@": path.resolve(__dirname, "."),
			"@repo/ui/components/alert": path.resolve(
				__dirname,
				"../../packages/ui/components/alert.tsx"
			),
			"@repo/ui/components/badge": path.resolve(
				__dirname,
				"../../packages/ui/components/badge.tsx"
			),
			"@repo/ui/components/button": path.resolve(
				__dirname,
				"../../packages/ui/components/button.tsx"
			),
			"@repo/ui/components/dialog": path.resolve(
				__dirname,
				"../../packages/ui/components/dialog.tsx"
			),
			"@repo/ui/components/field": path.resolve(
				__dirname,
				"../../packages/ui/components/field.tsx"
			),
			"@repo/ui/components/icon": path.resolve(__dirname, "../../packages/ui/components/icon.tsx"),
			"@repo/ui/components/input-field": path.resolve(
				__dirname,
				"../../packages/ui/components/input-field.tsx"
			),
			"@repo/ui/components/input": path.resolve(
				__dirname,
				"../../packages/ui/components/input.tsx"
			),
			"@repo/ui/components/select": path.resolve(
				__dirname,
				"../../packages/ui/components/select.tsx"
			),
			"@repo/ui/components/wrapper": path.resolve(
				__dirname,
				"../../packages/ui/components/wrapper.tsx"
			),
			"@repo/ui/lib": path.resolve(__dirname, "../../packages/ui/lib/utils.ts"),
		},
	},
});
