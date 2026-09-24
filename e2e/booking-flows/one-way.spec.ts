import { test } from "@playwright/test";
import { beginJourneyFromTopApp, completeFlow, expectCustomerInformation } from "./helpers";

test.describe("One-way flow", () => {
	test("completes booking from search to confirmation", async ({ page }) => {
		test.setTimeout(120_000);

		await beginJourneyFromTopApp(page, {
			origin: "NRT",
			destination: "SIN",
			departureDate: "2026-11-20",
			tripType: "one-way",
		});

		await completeFlow(page, "one-way");
		await expectCustomerInformation(page);
	});
});
