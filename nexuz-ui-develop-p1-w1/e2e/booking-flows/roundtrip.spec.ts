import { test } from "@playwright/test";
import { beginJourneyFromTopApp, completeFlow, expectCustomerInformation } from "./helpers";

test.describe("Roundtrip flow", () => {
	test("completes booking from search to confirmation", async ({ page }) => {
		test.setTimeout(120_000);

		await beginJourneyFromTopApp(page, {
			origin: "NRT",
			destination: "SIN",
			departureDate: "2026-11-20",
			returnDate: "2026-11-30",
			tripType: "round-trip",
		});

		await completeFlow(page, "roundtrip");
		await expectCustomerInformation(page);
	});
});
