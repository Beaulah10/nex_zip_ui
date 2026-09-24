import type { useTranslations } from "next-intl";
import { describe, expect, it } from "vitest";
import { formatPrice } from "@/modules/utils/helpers/currency-formatter";
import type { Flightdetails, FlightFare } from "@/types/flight-selection/flight-selection.types";
import {
	calculateGrandTotal,
	calculateSelectedBoundFlightTotal,
	getCabinPriceDisplayData,
	inboundCabinSelection,
	outboundCabinSelection,
} from "./cabin-utils";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

// Satisfies the ReturnType<typeof useTranslations> signature needed by
// getCabinPriceDisplayData without importing the actual next-intl module.
const t = ((key: string) => key) as unknown as ReturnType<typeof useTranslations>;

const buildFare = (
	passengerType: string,
	fareAmtInclTax: number,
	passengerCount: number
): FlightFare => ({
	passengerType,
	count: passengerCount,
	passengerCount,
	fareAmtInclTax,
	amount: fareAmtInclTax,
});

const buildFlight = (override?: Partial<Flightdetails>): Flightdetails => ({
	carrierCode: "ZG",
	origin: "NRT",
	destination: "SIN",
	transitTime: "",
	overallFlightTime: "",
	flightNumber: "001",
	scheduledDepartureArrivalDateTime: {
		departureDateTime: "2026-08-21T10:00:00Z",
		arrivalDateTime: "2026-08-21T16:00:00Z",
	},
	segments: [],
	isConnectingFlight: false,
	cabinFares: [],
	fares: [],
	segmentFaresList: [],
	...override,
});

// ---------------------------------------------------------------------------
// outboundCabinSelection
// ---------------------------------------------------------------------------

describe("outboundCabinSelection", () => {
	it("merges a segment key into the existing state without clearing other entries", () => {
		const result = outboundCabinSelection(
			{ "flight-out-0-segment-0": "standard", "flight-out-0-segment-1": null },
			"flight-out-0-segment-1",
			"zipFullFlat"
		);

		expect(result).toEqual({
			"flight-out-0-segment-0": "standard",
			"flight-out-0-segment-1": "zipFullFlat",
		});
	});

	it("clears all existing non-segment keys and sets only the newly selected flight", () => {
		const result = outboundCabinSelection(
			{ "flight-out-0": "standard", "flight-out-1": "zipFullFlat" },
			"flight-out-1",
			"standard"
		);

		expect(result).toEqual({ "flight-out-0": null, "flight-out-1": "standard" });
	});

	it("handles an empty current state for a non-segment key", () => {
		expect(outboundCabinSelection({}, "flight-out-0", "standard")).toEqual({
			"flight-out-0": "standard",
		});
	});
});

// ---------------------------------------------------------------------------
// inboundCabinSelection
// ---------------------------------------------------------------------------

describe("inboundCabinSelection", () => {
	it("clears all existing keys and sets only the selected inbound flight", () => {
		const result = inboundCabinSelection(
			{ "flight-in-0": "standard", "flight-in-1": "zipFullFlat" },
			"flight-in-1",
			"standard"
		);

		expect(result).toEqual({ "flight-in-0": null, "flight-in-1": "standard" });
	});

	it("handles an empty current state", () => {
		expect(inboundCabinSelection({}, "flight-in-0", "standard")).toEqual({
			"flight-in-0": "standard",
		});
	});
});

// ---------------------------------------------------------------------------
// calculateSelectedBoundFlightTotal
// ---------------------------------------------------------------------------

describe("calculateSelectedBoundFlightTotal", () => {
	it("returns 0 for an empty selectedCabins map", () => {
		expect(calculateSelectedBoundFlightTotal({}, [])).toBe(0);
	});

	it("skips entries whose cabin value is null", () => {
		expect(calculateSelectedBoundFlightTotal({ "flight-out-0": null }, [buildFlight()])).toBe(0);
	});

	it("calculates the total for a matching non-segment cabin key", () => {
		const fares = [buildFare("adult", 5000, 2), buildFare("childA", 3000, 1)];
		const flights = [buildFlight({ cabinFares: [{ cabin: "STANDARD", fares }] })];

		expect(calculateSelectedBoundFlightTotal({ "flight-out-0": "standard" }, flights)).toBe(
			5000 * 2 + 3000 * 1
		);
	});

	it("falls back to cabinFares[0] fares when the cabin name does not match", () => {
		const fares = [buildFare("adult", 5000, 1)];
		const flights = [buildFlight({ cabinFares: [{ cabin: "STANDARD", fares }] })];

		// Requesting "zipFullFlat" → no exact match → falls back to cabinFares[0]
		expect(calculateSelectedBoundFlightTotal({ "flight-out-0": "zipFullFlat" }, flights)).toBe(
			5000
		);
	});

	it("returns 0 when the flight has no cabinFares at all", () => {
		const flights = [buildFlight({ cabinFares: [] })];

		expect(calculateSelectedBoundFlightTotal({ "flight-out-0": "standard" }, flights)).toBe(0);
	});

	it("returns 0 when the flight key does not contain a numeric index", () => {
		expect(calculateSelectedBoundFlightTotal({ "flight-abc": "standard" }, [buildFlight()])).toBe(
			0
		);
	});

	it("returns 0 when no flight exists at the derived index", () => {
		// Index 5 is out of range for a single-element array
		expect(calculateSelectedBoundFlightTotal({ "flight-out-5": "standard" }, [buildFlight()])).toBe(
			0
		);
	});

	it("calculates standard segment fares for a segment key", () => {
		const segmentFares = [buildFare("adult", 4000, 2)];
		const flights = [
			buildFlight({ segmentFaresList: [{ standard: segmentFares, zipFullFlat: [] }] }),
		];

		expect(
			calculateSelectedBoundFlightTotal({ "flight-out-0-segment-0": "standard" }, flights)
		).toBe(4000 * 2);
	});

	it("calculates zipFullFlat segment fares for a segment key", () => {
		const segmentFares = [buildFare("adult", 8000, 1)];
		const flights = [
			buildFlight({ segmentFaresList: [{ standard: [], zipFullFlat: segmentFares }] }),
		];

		expect(
			calculateSelectedBoundFlightTotal({ "flight-out-0-segment-0": "zipFullFlat" }, flights)
		).toBe(8000);
	});

	it("returns 0 for an unknown cabin type in a segment key", () => {
		const flights = [buildFlight({ segmentFaresList: [{ standard: [], zipFullFlat: [] }] })];

		expect(
			calculateSelectedBoundFlightTotal({ "flight-out-0-segment-0": "premium" }, flights)
		).toBe(0);
	});

	it("returns 0 when the segment suffix is not a number", () => {
		const flights = [
			buildFlight({ segmentFaresList: [{ standard: [buildFare("adult", 5000, 1)] }] }),
		];

		expect(
			calculateSelectedBoundFlightTotal({ "flight-out-0-segment-abc": "standard" }, flights)
		).toBe(0);
	});

	it("returns 0 when segmentFaresList entry has undefined standard fares", () => {
		// Covers the `segmentFares?.standard ?? []` null-coalescing branch
		const flights = [buildFlight({ segmentFaresList: [{ standard: undefined, zipFullFlat: [] }] })];

		expect(
			calculateSelectedBoundFlightTotal({ "flight-out-0-segment-0": "standard" }, flights)
		).toBe(0);
	});

	it("returns 0 when segmentFaresList entry has undefined zipFullFlat fares", () => {
		// Covers the `segmentFares?.zipFullFlat ?? []` null-coalescing branch
		const flights = [buildFlight({ segmentFaresList: [{ standard: [], zipFullFlat: undefined }] })];

		expect(
			calculateSelectedBoundFlightTotal({ "flight-out-0-segment-0": "zipFullFlat" }, flights)
		).toBe(0);
	});

	it("accumulates totals across multiple selected cabins", () => {
		const fares = [buildFare("adult", 5000, 1)];
		const flights = [
			buildFlight({ cabinFares: [{ cabin: "STANDARD", fares }] }),
			buildFlight({ cabinFares: [{ cabin: "STANDARD", fares }] }),
		];

		expect(
			calculateSelectedBoundFlightTotal(
				{ "flight-out-0": "standard", "flight-out-1": "standard" },
				flights
			)
		).toBe(10000);
	});
});

// ---------------------------------------------------------------------------
// calculateGrandTotal
// ---------------------------------------------------------------------------

describe("calculateGrandTotal", () => {
	const singleFare = [buildFare("adult", 5000, 1)];
	const flightWithCabin = buildFlight({ cabinFares: [{ cabin: "standard", fares: singleFare }] });

	it("returns only the outbound total for a one-way trip (isRoundTrip = false)", () => {
		expect(
			calculateGrandTotal({ "flight-out-0": "standard" }, [flightWithCabin], {}, [], false)
		).toBe(5000);
	});

	it("adds the inbound total to the outbound total for a round trip", () => {
		expect(
			calculateGrandTotal(
				{ "flight-out-0": "standard" },
				[flightWithCabin],
				{ "flight-in-0": "standard" },
				[flightWithCabin],
				true
			)
		).toBe(10000);
	});

	it("returns 0 when no cabins are selected", () => {
		expect(calculateGrandTotal({}, [], {}, [], true)).toBe(0);
	});
});

// ---------------------------------------------------------------------------
// getCabinPriceDisplayData
// ---------------------------------------------------------------------------

describe("getCabinPriceDisplayData", () => {
	it("returns undefined for an empty fares array", () => {
		expect(getCabinPriceDisplayData([], t)).toBeUndefined();
	});

	it("returns adult price with no extras when only an adult fare is present", () => {
		const result = getCabinPriceDisplayData([{ passengerType: "adult", fareAmtInclTax: 10000 }], t);

		expect(result?.adult).toBe(formatPrice(10000));
		expect(result?.extras).toBeUndefined();
	});

	it("includes extras for each non-adult passenger type in PASSENGER_DISPLAY_ORDER", () => {
		const result = getCabinPriceDisplayData(
			[
				{ passengerType: "adult", fareAmtInclTax: 10000 },
				{ passengerType: "childA", fareAmtInclTax: 5000 },
				{ passengerType: "infant", fareAmtInclTax: 2000 },
			],
			t
		);

		expect(result?.adult).toBe(formatPrice(10000));
		expect(result?.extras).toHaveLength(2);
		// childA comes before infant in PASSENGER_DISPLAY_ORDER
		expect(result?.extras?.[0]?.label).toBe("childA_label");
		expect(result?.extras?.[0]?.price).toBe(formatPrice(5000));
		expect(result?.extras?.[1]?.label).toBe("infant_label");
		expect(result?.extras?.[1]?.price).toBe(formatPrice(2000));
	});

	it("preserves PASSENGER_DISPLAY_ORDER for all four extra types", () => {
		const result = getCabinPriceDisplayData(
			[
				{ passengerType: "infant", fareAmtInclTax: 1000 },
				{ passengerType: "childC", fareAmtInclTax: 3000 },
				{ passengerType: "childB", fareAmtInclTax: 4000 },
				{ passengerType: "childA", fareAmtInclTax: 5000 },
				{ passengerType: "adult", fareAmtInclTax: 10000 },
			],
			t
		);

		// Order must follow PASSENGER_DISPLAY_ORDER: childA, childB, childC, infant
		const labels = result?.extras?.map((e) => e.label);
		expect(labels).toEqual(["childA_label", "childB_label", "childC_label", "infant_label"]);
	});

	it("uses 0 as fallback when the adult fareAmtInclTax is undefined", () => {
		const result = getCabinPriceDisplayData([{ passengerType: "adult" }], t);

		expect(result?.adult).toBe(formatPrice(0));
	});

	it("uses 0 for adult price when no adult fare is present", () => {
		const result = getCabinPriceDisplayData([{ passengerType: "childA", fareAmtInclTax: 5000 }], t);

		expect(result?.adult).toBe(formatPrice(0));
		expect(result?.extras).toHaveLength(1);
	});

	it("uses 0 as fallback for extra fare price when fareAmtInclTax is undefined", () => {
		// Covers the `fare.fareAmtInclTax ?? 0` branch inside the extras map
		const result = getCabinPriceDisplayData(
			[{ passengerType: "childA", fareAmtInclTax: undefined }],
			t
		);

		expect(result?.extras?.[0]?.price).toBe(formatPrice(0));
	});
});
