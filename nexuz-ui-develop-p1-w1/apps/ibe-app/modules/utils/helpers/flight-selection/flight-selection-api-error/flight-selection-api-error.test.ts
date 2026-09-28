import { describe, expect, it } from "vitest";
import {
	getFlightSelectionApiError,
	getFlightSelectionBoundaryError,
	getFlightSelectionErrorCodeFromBoundaryError,
	getFlightSelectionErrorTitleKey,
} from "./flight-selection-api-error";

describe("flight-selection-api-error", () => {
	it("normalizes errors with a fallback message", () => {
		const error = getFlightSelectionApiError(new Error("boom"));

		expect(error.status).toBe(500);
		expect(error.message).toBe("boom");
	});

	it("resolves supported error titles", () => {
		expect(getFlightSelectionErrorTitleKey("NEXUZR003E001")).toBe("error_titles.NEXUZR003E001");
		expect(getFlightSelectionErrorTitleKey("NEXUZCMNE002")).toBe("error_titles.NEXUZCMNE002");
	});

	it("maps API errors to boundary errors and back", () => {
		expect(getFlightSelectionBoundaryError({ status: 422, code: "NEXUZR003E001" })?.message).toBe(
			"FLIGHT_SELECTION_API_ERROR:NEXUZR003E001"
		);
		expect(getFlightSelectionBoundaryError({ status: 503, code: undefined })?.message).toBe(
			"FLIGHT_SELECTION_API_ERROR:GENERIC"
		);
		expect(
			getFlightSelectionErrorCodeFromBoundaryError({
				message: "FLIGHT_SELECTION_API_ERROR:NEXUZR003E002",
			})
		).toBe("NEXUZR003E002");
		expect(
			getFlightSelectionErrorCodeFromBoundaryError({ message: "OTHER_PREFIX:NEXUZR003E002" })
		).toBeNull();
	});
});
