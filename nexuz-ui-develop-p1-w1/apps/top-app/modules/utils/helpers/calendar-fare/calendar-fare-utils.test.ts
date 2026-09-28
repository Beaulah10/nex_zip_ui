import { SdkRequestError } from "@repo/sdk";
import { describe, expect, it } from "vitest";
import {
	convertFaresToPrices,
	convertPromoFaresToPrices,
	dateToString,
	formatFare,
	getCalendarFaresApiError,
	getCalendarFaresBoundaryError,
	getCalendarFaresErrorCodeFromBoundaryError,
	getCalendarFaresErrorTitleKey,
	getFareDisplay,
	getMonthDateRange,
	getNextCalendarWindowRange,
	isLoadMoreNeeded,
	normalizeCalendarFaresApiError,
	shouldResetSelectionOnSeatTypeChange,
	stringToDate,
} from "./calendar-fare-utils";

describe("calendar-fare-utils", () => {
	it("formats fares and handles undefined values", () => {
		expect(formatFare(12345)).toBe("¥12,345");
		expect(formatFare(undefined)).toBe("X");
	});

	it("returns fare display by availability rules", () => {
		expect(getFareDisplay(undefined, "standard")).toBe("X");
		expect(getFareDisplay({ standard: 1000, zipFullFlat: 2000 }, "standard")).toBe("¥1,000");
		expect(getFareDisplay({ standard: 1000, zipFullFlat: 2000 }, "zip")).toBe("¥2,000");
		expect(getFareDisplay({ standard: 1000 }, "zip")).toBe("-");
		expect(getFareDisplay({ zipFullFlat: 2000 }, "standard")).toBe("-");
	});

	it("converts standard and promo fares by selected seat type", () => {
		const fares = {
			"2026-07-10": { standard: 12000, standardPromo: 10000, zipFullFlat: 24000 },
			"2026-07-11": { zipFullFlat: 26000, zipFullFlatPromo: 21000 },
		};

		expect(convertFaresToPrices(fares, "standard")).toEqual({ "2026-07-10": "¥12,000" });
		expect(convertFaresToPrices(fares, "zip")).toEqual({
			"2026-07-10": "¥24,000",
			"2026-07-11": "¥26,000",
		});
		expect(convertPromoFaresToPrices(fares, "standard")).toEqual({ "2026-07-10": "¥10,000" });
		expect(convertPromoFaresToPrices(fares, "zip")).toEqual({ "2026-07-11": "¥21,000" });
	});

	it("calculates loading windows and detects when load-more is needed", () => {
		const visibleStart = new Date(2026, 6, 1);
		const visibleEnd = new Date(2026, 6, 31);

		expect(isLoadMoreNeeded(visibleStart, visibleEnd, [])).toBe(true);
		expect(
			isLoadMoreNeeded(visibleStart, visibleEnd, [{ from: "2026-07-01", to: "2026-07-31" }])
		).toBe(false);
		expect(
			isLoadMoreNeeded(visibleStart, visibleEnd, [{ from: "2026-06-01", to: "2026-06-30" }])
		).toBe(true);

		expect(getNextCalendarWindowRange(new Date(2026, 5, 15))).toEqual({
			from: "2026-06-15",
			to: "2026-08-31",
		});
	});

	it("converts date strings both directions and calculates month range", () => {
		const date = new Date(2026, 0, 9);
		expect(dateToString(date)).toBe("2026-01-09");
		expect(stringToDate("2026-01-09")).toEqual(new Date(2026, 0, 9));
		expect(getMonthDateRange(2026, 1)).toEqual({
			start: new Date(2026, 1, 1),
			end: new Date(2026, 1, 28),
		});
	});

	it("determines whether selected dates should reset after seat type changes", () => {
		const outbound = new Date(2026, 6, 10);
		const inbound = new Date(2026, 6, 14);

		expect(
			shouldResetSelectionOnSeatTypeChange({
				oneWay: true,
				outboundDate: outbound,
				inboundDate: null,
				outboundPrices: { "2026-07-10": "¥12,000" },
			})
		).toBe(false);

		expect(
			shouldResetSelectionOnSeatTypeChange({
				oneWay: false,
				outboundDate: outbound,
				inboundDate: inbound,
				outboundPrices: { "2026-07-10": "¥12,000" },
				inboundPrices: {},
			})
		).toBe(true);
	});

	it("normalizes calendar fare errors with fallback messages", () => {
		expect(
			normalizeCalendarFaresApiError({
				status: 500,
				description: "Backend exploded",
				message: "Ignored",
			})
		).toEqual({
			status: 500,
			description: "Backend exploded",
			message: "Backend exploded",
		});

		expect(normalizeCalendarFaresApiError({ status: 500 })).toEqual({
			status: 500,
			message: "Unable to fetch calendar fares",
		});
	});

	it("extracts api error details from sdk request errors", () => {
		const sdkError = new SdkRequestError({
			message: "Response returned an error code",
			method: "GET",
			responseBody: JSON.stringify({
				code: "NEXUZR002E051",
				description: "Requested Bound is not available",
			}),
			status: 404,
			url: "http://localhost:3000/api/search/calendar-fares",
		});

		expect(getCalendarFaresApiError(sdkError)).toEqual({
			status: 404,
			code: "NEXUZR002E051",
			description: "Requested Bound is not available",
			message: "Requested Bound is not available",
		});
	});

	it("handles invalid sdk response bodies safely", () => {
		const invalidJsonError = new SdkRequestError({
			message: "Response returned an error code",
			method: "GET",
			responseBody: "not-json",
			status: 500,
			url: "http://localhost:3000/api/search/calendar-fares",
		});

		expect(getCalendarFaresApiError(invalidJsonError)).toEqual({
			status: 500,
			message: "Response returned an error code",
		});
	});

	it("builds boundary errors for supported and generic server errors", () => {
		expect(getCalendarFaresBoundaryError({ status: 404, code: "NEXUZR002E051" })?.message).toBe(
			"CALENDAR_FARES_API_ERROR:NEXUZR002E051"
		);
		expect(getCalendarFaresBoundaryError({ status: 503, code: undefined })?.message).toBe(
			"CALENDAR_FARES_API_ERROR:GENERIC"
		);
		expect(getCalendarFaresBoundaryError({ status: 400, code: undefined })).toBeNull();
	});

	it("maps boundary errors back to supported error codes and title keys", () => {
		expect(
			getCalendarFaresErrorCodeFromBoundaryError({
				message: "CALENDAR_FARES_API_ERROR:NEXUZR002E052",
			})
		).toBe("NEXUZR002E052");
		expect(
			getCalendarFaresErrorCodeFromBoundaryError({ message: "CALENDAR_FARES_API_ERROR:GENERIC" })
		).toBeNull();

		expect(getCalendarFaresErrorTitleKey("NEXUZCMNE001")).toBe("error_titles.NEXUZCMNE001");
	});
});
