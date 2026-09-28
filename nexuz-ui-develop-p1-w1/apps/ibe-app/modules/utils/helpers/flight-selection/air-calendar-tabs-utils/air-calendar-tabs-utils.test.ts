import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { formatPrice } from "@/modules/utils/helpers/currency-formatter";
import type { FlightSelectionBound } from "@/types/flight-selection/flight-selection.types";
import { airCalendarTabs } from "./air-calendar-tabs-utils";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const buildSegment = (departureDateTimeOffset: string) => ({
	carrierCode: "ZG",
	origin: "NRT",
	destination: "SIN",
	flightTime: "6:00",
	flightNumber: "001",
	pfid: 1,
	lfid: 1,
	fareInfos: [] as never[],
	previousDayIndicator: false as const,
	nextDayIndicator: false as const,
	scheduledDepartureArrivalDateTime: {
		departureDateTime: "",
		departureDateTimeOffset,
		arrivalDateTime: "",
		arrivalDateTimeOffset: "",
	},
});

const buildFlightsByDate = (
	date: string,
	departureDateTimeOffset: string
): FlightSelectionBound["flightsByDate"] => [
	{
		date,
		flights: [
			{
				transitTime: "",
				overallFlightTime: "",
				segments: [buildSegment(departureDateTimeOffset)],
			},
		],
	},
];

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("airCalendarTabs", () => {
	// Fix "now" to local midnight Aug 21, 2026 to make all date comparisons deterministic.
	const NOW = new Date(2026, 7, 21);

	beforeEach(() => {
		vi.useFakeTimers();
		vi.setSystemTime(NOW);
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	it("returns exactly 7 tabs", () => {
		expect(airCalendarTabs(new Date(2026, 7, 24), false, false)).toHaveLength(7);
	});

	it("tab values use 'month-day' format and tab dates use 'month/day' format", () => {
		// Center = Sep 1 → tabs[0]=Aug29, tabs[3]=Sep1, tabs[6]=Sep4
		const result = airCalendarTabs(new Date(2026, 8, 1), false, false);

		expect(result[0]?.value).toBe("8-29");
		expect(result[0]?.date).toBe("8/29");
		expect(result[3]?.value).toBe("9-1");
		expect(result[3]?.date).toBe("9/1");
		expect(result[6]?.value).toBe("9-4");
		expect(result[6]?.date).toBe("9/4");
	});

	it("past dates are disabled with a '-' price", () => {
		// Center = Aug 21 (today) → tabs[0..2] = Aug 18/19/20 (past), tabs[3] = today
		const result = airCalendarTabs(new Date(2026, 7, 21), false, false);

		expect(result[0]?.disabled).toBe(true);
		expect(result[0]?.price).toBe("-");
		expect(result[1]?.disabled).toBe(true);
		expect(result[2]?.disabled).toBe(true);
		// Today itself is not a past date
		expect(result[3]?.disabled).toBe(false);
	});

	it("future dates without airCalendarFare data show '-' price", () => {
		// All 7 tabs are future (center = Aug 24, three days ahead of today)
		const result = airCalendarTabs(new Date(2026, 7, 24), false, false);

		for (const tab of result) {
			expect(tab.price).toBe("-");
		}
	});

	it("shows formatted prices for dates that appear in airCalendarFare", () => {
		const airCalendarFare: FlightSelectionBound["airCalendarFare"] = [
			{ date: "2026-08-24", baseFareAmount: 10000, totalFareAmount: 12000 },
			{ date: "2026-08-25", baseFareAmount: 20000, totalFareAmount: 22000 },
		];

		// Center = Aug 24 → tabs[3]=Aug24, tabs[4]=Aug25, tabs[2]=Aug23 (no fare)
		const result = airCalendarTabs(new Date(2026, 7, 24), false, false, airCalendarFare);

		expect(result[3]?.price).toBe(formatPrice(10000));
		expect(result[4]?.price).toBe(formatPrice(20000));
		expect(result[2]?.price).toBe("-");
	});

	it("does not restrict dates when both hasChildC and hasInfant are false", () => {
		// Departure in 12 h — would trigger restriction if flags were set
		const offset = new Date(2026, 7, 21, 12, 0, 0).toISOString();

		const result = airCalendarTabs(
			new Date(2026, 7, 21),
			false,
			false,
			undefined,
			buildFlightsByDate("2026-08-21", offset)
		);

		expect(result[3]?.disabled).toBe(false);
	});

	it("disables a date for childC when departure is within 24 hours", () => {
		// Departure in 12 h → 12 < 24 → restricted
		const offset = new Date(2026, 7, 21, 12, 0, 0).toISOString();

		const result = airCalendarTabs(
			new Date(2026, 7, 21),
			true,
			false,
			undefined,
			buildFlightsByDate("2026-08-21", offset)
		);

		expect(result[3]?.disabled).toBe(true);
	});

	it("disables a date for infant when departure is within 48 hours", () => {
		// Center = Aug 22 (tabs[3]) — departure at noon Aug 22 = 36 h from midnight Aug 21
		const offset = new Date(2026, 7, 22, 12, 0, 0).toISOString();

		const result = airCalendarTabs(
			new Date(2026, 7, 22),
			false,
			true,
			undefined,
			buildFlightsByDate("2026-08-22", offset)
		);

		expect(result[3]?.disabled).toBe(true);
	});

	it("does not disable a date when departure is more than 48 hours away for infant", () => {
		// Departure at noon Aug 24 = 84 h from midnight Aug 21
		const offset = new Date(2026, 7, 24, 12, 0, 0).toISOString();

		const result = airCalendarTabs(
			new Date(2026, 7, 24),
			false,
			true,
			undefined,
			buildFlightsByDate("2026-08-24", offset)
		);

		expect(result[3]?.disabled).toBe(false);
	});

	it("skips a segment whose departureDateTimeOffset is an empty string", () => {
		const result = airCalendarTabs(
			new Date(2026, 7, 21),
			true,
			true,
			undefined,
			buildFlightsByDate("2026-08-21", "")
		);

		expect(result[3]?.disabled).toBe(false);
	});

	it("skips a segment whose departureDateTimeOffset is an invalid date string", () => {
		const result = airCalendarTabs(
			new Date(2026, 7, 21),
			true,
			true,
			undefined,
			buildFlightsByDate("2026-08-21", "not-a-valid-date")
		);

		expect(result[3]?.disabled).toBe(false);
	});

	it("handles an empty flights array in a flightsByDate entry without errors", () => {
		const flightsByDate: FlightSelectionBound["flightsByDate"] = [
			{ date: "2026-08-21", flights: [] },
		];

		const result = airCalendarTabs(new Date(2026, 7, 21), true, true, undefined, flightsByDate);

		expect(result[3]?.disabled).toBe(false);
	});

	it("handles a flight with an empty segments array without errors", () => {
		const flightsByDate: FlightSelectionBound["flightsByDate"] = [
			{
				date: "2026-08-21",
				flights: [{ transitTime: "", overallFlightTime: "", segments: [] }],
			},
		];

		const result = airCalendarTabs(new Date(2026, 7, 21), true, true, undefined, flightsByDate);

		expect(result[3]?.disabled).toBe(false);
	});

	it("handles undefined airCalendarFare and undefined flightsByDate without errors", () => {
		const result = airCalendarTabs(new Date(2026, 7, 24), false, false, undefined, undefined);

		expect(result).toHaveLength(7);
		expect(result.every((tab) => tab.price === "-")).toBe(true);
	});

	it("stops restriction checks after the first restricted segment is found", () => {
		// Two segments: first triggers restriction, second should never be evaluated
		const restrictedOffset = new Date(2026, 7, 21, 6, 0, 0).toISOString(); // 6 h → restricted
		const unreachableOffset = new Date(2026, 7, 21, 18, 0, 0).toISOString();

		const flightsByDate: FlightSelectionBound["flightsByDate"] = [
			{
				date: "2026-08-21",
				flights: [
					{
						transitTime: "",
						overallFlightTime: "",
						segments: [buildSegment(restrictedOffset), buildSegment(unreachableOffset)],
					},
				],
			},
		];

		const result = airCalendarTabs(new Date(2026, 7, 21), true, false, undefined, flightsByDate);

		expect(result[3]?.disabled).toBe(true);
	});

	it("flightsByDate entries for other dates do not affect a different tab", () => {
		// Flight is on Aug 22; tabs[3] covers Aug 21 – should not be restricted
		const offset = new Date(2026, 7, 22, 6, 0, 0).toISOString();

		const result = airCalendarTabs(
			new Date(2026, 7, 21),
			true,
			false,
			undefined,
			buildFlightsByDate("2026-08-22", offset)
		);

		expect(result[3]?.disabled).toBe(false);
	});
});
