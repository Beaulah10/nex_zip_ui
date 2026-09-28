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
	getMonthDateRange,
	getNextCalendarWindowRange,
	isLoadMoreNeeded,
	normalizeCalendarFaresApiError,
	shouldResetSelectionOnSeatTypeChange,
	stringToDate,
} from "./calendar-fare-utils";

describe("calendar-fare-utils", () => {
	it("normalizes and maps API errors", () => {
		const normalized = normalizeCalendarFaresApiError({
			status: 422,
			code: "NEXUZR002E050",
			message: "backend message",
		});

		expect(normalized.message).toBe("backend message");
		expect(getCalendarFaresApiError(new Error("boom")).message).toBe("boom");
		expect(getCalendarFaresErrorTitleKey("NEXUZR002E050")).toBe("error_titles.NEXUZR002E050");
		expect(getCalendarFaresBoundaryError({ status: 422, code: "NEXUZR002E050" })?.message).toBe(
			"CALENDAR_FARES_API_ERROR:NEXUZR002E050"
		);
		expect(getCalendarFaresBoundaryError({ status: 503, code: undefined })?.message).toBe(
			"CALENDAR_FARES_API_ERROR:GENERIC"
		);
		expect(
			getCalendarFaresErrorCodeFromBoundaryError({
				message: "CALENDAR_FARES_API_ERROR:NEXUZR002E051",
			})
		).toBe("NEXUZR002E051");
		expect(
			getCalendarFaresErrorCodeFromBoundaryError({ message: "OTHER_PREFIX:NEXUZR002E051" })
		).toBeNull();
	});

	it("formats and converts fare labels", () => {
		expect(formatFare(undefined)).toBe("X");
		expect(formatFare(null as unknown as number)).toBe("X");
		expect(formatFare(12345)).toBe("¥12,345");

		const faresData = {
			"2026-07-21": {
				standard: 1000,
				zipFullFlat: 2000,
				standardPromo: 900,
				zipFullFlatPromo: 1800,
			},
			"2026-07-22": { standard: 1500 },
			"2026-07-23": undefined,
		} as any;

		expect(convertFaresToPrices(faresData, "standard")).toEqual({
			"2026-07-21": "¥1,000",
			"2026-07-22": "¥1,500",
		});
		expect(convertFaresToPrices(faresData, "zip")).toEqual({
			"2026-07-21": "¥2,000",
		});
		expect(convertPromoFaresToPrices(faresData, "standard")).toEqual({
			"2026-07-21": "¥900",
		});
		expect(convertPromoFaresToPrices(faresData, "zip")).toEqual({
			"2026-07-21": "¥1,800",
		});
	});

	it("parses and formats dates", () => {
		expect(dateToString(new Date(2026, 6, 21))).toBe("2026-07-21");
		expect(stringToDate("2026-07-21")).toEqual(new Date(2026, 6, 21));
		expect(stringToDate("bad-input")).toEqual(new Date(2024, 0, 1));
		expect(getMonthDateRange(2026, 6)).toEqual({
			start: new Date(2026, 6, 1),
			end: new Date(2026, 7, 0),
		});
		expect(getNextCalendarWindowRange(new Date(2026, 5, 15))).toEqual({
			from: "2026-06-15",
			to: "2026-08-31",
		});
	});

	it("decides when more data or a seat reset is needed", () => {
		expect(isLoadMoreNeeded(new Date(2026, 6, 1), new Date(2026, 6, 10), [])).toBe(true);
		expect(
			isLoadMoreNeeded(new Date(2026, 6, 1), new Date(2026, 6, 10), [
				{ from: "2026-07-01", to: "2026-07-31" },
			])
		).toBe(false);
		expect(
			isLoadMoreNeeded(new Date(2026, 6, 1), new Date(2026, 6, 10), [
				{ from: "2026-07-05", to: "2026-07-31" },
			])
		).toBe(true);

		expect(
			shouldResetSelectionOnSeatTypeChange({
				oneWay: true,
				outboundDate: new Date(2026, 6, 21),
				inboundDate: null,
				outboundPrices: {},
			})
		).toBe(true);
		expect(
			shouldResetSelectionOnSeatTypeChange({
				oneWay: false,
				outboundDate: new Date(2026, 6, 21),
				inboundDate: new Date(2026, 6, 22),
				outboundPrices: { "2026-07-21": "¥1,000" },
				inboundPrices: { "2026-07-22": "¥1,500" },
			})
		).toBe(false);
		expect(
			shouldResetSelectionOnSeatTypeChange({
				oneWay: false,
				outboundDate: new Date(2026, 6, 21),
				inboundDate: new Date(2026, 6, 22),
				outboundPrices: {},
				inboundPrices: { "2026-07-22": "¥1,500" },
			})
		).toBe(true);
		expect(
			shouldResetSelectionOnSeatTypeChange({
				oneWay: true,
				outboundDate: null,
				inboundDate: null,
			})
		).toBe(false);
	});
});
