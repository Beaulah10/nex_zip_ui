import path from "node:path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
	plugins: [react()],
	test: {
		environment: "jsdom",
		globals: true,
		setupFiles: ["./vitest.setup.ts"],
		include: ["**/*.{test,spec}.{ts,tsx}"],
		exclude: ["node_modules", ".next", "dist", "coverage"],
		coverage: {
			provider: "v8",
			reporter: ["text", "html", "json-summary", "lcov"],
			reportsDirectory: "./coverage",
			include: [
				"components/flight-search/calendar/calendar-content/calendar-content.tsx",
				"components/flight-search/calendar/date-selection-modal/date-selection-modal.tsx",
				"components/flight-search/calendar/calendar-modal-controls/calendar-modal-controls.tsx",
				"components/flight-search/calendar/calendar-desktop-months/calendar-desktop-months.tsx",
				"components/flight-search/calendar/calendar-mobile-months/calendar-mobile-months.tsx",
				"components/flight-search/calendar/calendar-month/calendar-month.tsx",
				"components/flight-search/calendar/calendar-modal-footer/calendar-modal-footer.tsx",
				"components/flight-search/calendar/alert-banner/alert-banner.tsx",
				"components/flight-search/calendar/date-tab-navigation/date-tab-navigation.tsx",
				"components/flight-search/calendar/seat-type-selector/seat-type-selector.tsx",
				"components/flight-search/calendar/calendar-legend-modal/calendar-legend-modal.tsx",
				"components/flight-search/calendar/calendar-constants/calendar-constants.tsx",
				"lib/calendar-fare-utils.ts",
				"modules/utils/helpers/calendar-helpers/calendar-helpers.tsx",
				"modules/utils/helpers/calendar-tooltip-helpers/calendar-tooltip-helpers.ts",
				"modules/hooks/Calendar/use-calendar-navigation/use-calendar-navigation.tsx",
				"modules/hooks/Calendar/use-date-selection/use-date-selection.tsx",
				"modules/services/calendar-fares.service.ts",
				"store/slices/calendar-fares.slice.ts",
				"app/[locale]/page.tsx",
				"components/flight-search/flight-search.tsx",
				"components/flight-search/calendar.tsx",
				"components/flight-search/child-alert/alert.tsx",
				"components/flight-search/location/arrival-modal.tsx",
				"components/flight-search/location/departure-modal.tsx",
				"components/flight-search/location/menu-item.tsx",
				"components/flight-search/passenger/passenger-info.tsx",
				"components/flight-search/passenger/passenger-modal.tsx",
				"components/flight-search/passport-info/passport-info-modal.tsx",
				"components/flight-search/helper/helper.ts",
				"modules/services/flight-search.services.ts",
				"modules/utils/validations/flight-search/index.ts",
				"store/slices/flight-search-form.slice.ts",
			],
		},
	},
	resolve: {
		alias: {
			"@": path.resolve(__dirname, "."),
		},
	},
});
