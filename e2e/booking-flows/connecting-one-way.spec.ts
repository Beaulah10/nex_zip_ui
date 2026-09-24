import { test } from "@playwright/test";
import { beginJourneyFromTopApp, completeFlow, expectCustomerInformation } from "./helpers";

test.describe("Connecting one-way flow", () => {
	test("completes booking from search to confirmation", async ({ page }) => {
		test.setTimeout(120_000);

		await beginJourneyFromTopApp(page, {
			origin: "BKK",
			destination: "SIN",
			departureDate: "2026-10-01",
			tripType: "one-way",
			allowFirstAvailableDeparture: true,
		});

		await completeFlow(page, "connecting");
		await expectCustomerInformation(page);
	});
});
