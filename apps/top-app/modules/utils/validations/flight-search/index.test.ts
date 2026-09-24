import { describe, expect, it } from "vitest";
import {
	CHILD_INFANT_PER_ADULT_ERROR,
	COMBINED_CHILDREN_PER_ADULT_ERROR,
	COMBINED_INFANT_PER_ADULT_ERROR,
	flightSearchSchema,
	getFlightSearchPassengerMessages,
	getPassengerAlertContent,
	INFANT_PER_ADULT_ERROR,
	MAX_PASSENGERS_ERROR,
	TRAVEL_DATES_ERROR,
	VANCOUVER_ROUTE_ERROR,
} from "@/modules/utils/validations/flight-search";
import type { FlightSearchFormValues } from "@/types/flight-search/flight-search.types";

function makeInput(overrides: Partial<FlightSearchFormValues> = {}): FlightSearchFormValues {
	return {
		tripType: "round-trip",
		origin: "NRT",
		destination: "ICN",
		passengerCounts: {
			adult: 1,
			childA: 0,
			childB: 0,
			childC: 0,
			infant: 0,
		},
		travelDates: {
			outboundDate: "2026-10-01",
			returnDate: "2026-10-10",
		},
		promotionCode: "PROMO1",
		...overrides,
	};
}

describe("flight-search-schema", () => {
	it("accepts valid payload", () => {
		const input = makeInput();
		const parsed = flightSearchSchema.parse(input);
		expect(parsed).toEqual(input);
	});

	it("returns max passenger error when total exceeds 9", () => {
		const messages = getFlightSearchPassengerMessages(
			makeInput({
				passengerCounts: {
					adult: 3,
					childA: 2,
					childB: 2,
					childC: 2,
					infant: 1,
				},
			})
		);

		expect(messages).toContain(MAX_PASSENGERS_ERROR);
	});

	it("returns max passenger and companion errors when multiple rules fail", () => {
		const messages = getFlightSearchPassengerMessages(
			makeInput({
				passengerCounts: {
					adult: 1,
					childA: 3,
					childB: 2,
					childC: 3,
					infant: 3,
				},
			})
		);

		expect(messages).toEqual([
			MAX_PASSENGERS_ERROR,
			COMBINED_CHILDREN_PER_ADULT_ERROR,
			COMBINED_INFANT_PER_ADULT_ERROR,
		]);
	});

	it("applies vancouver rule and skips non-vancouver child rules", () => {
		const messages = getFlightSearchPassengerMessages(
			makeInput({
				origin: "YVR",
				passengerCounts: {
					adult: 1,
					childA: 1,
					childB: 1,
					childC: 1,
					infant: 0,
				},
			})
		);

		expect(messages).toEqual([VANCOUVER_ROUTE_ERROR]);
		expect(messages).not.toContain(CHILD_INFANT_PER_ADULT_ERROR);
		expect(messages).not.toContain(INFANT_PER_ADULT_ERROR);
	});

	it("applies infant-per-adult rule for vancouver routes", () => {
		const messages = getFlightSearchPassengerMessages(
			makeInput({
				origin: "YVR",
				passengerCounts: {
					adult: 1,
					childA: 0,
					childB: 0,
					childC: 0,
					infant: 2,
				},
			})
		);

		expect(messages).toEqual([INFANT_PER_ADULT_ERROR]);
	});

	it("returns only the child-infant error when child and infant rules fail", () => {
		const messages = getFlightSearchPassengerMessages(
			makeInput({
				passengerCounts: {
					adult: 1,
					childA: 0,
					childB: 0,
					childC: 2,
					infant: 2,
				},
			})
		);

		expect(messages).toEqual([CHILD_INFANT_PER_ADULT_ERROR]);
	});

	it("returns child companion error when only child limit fails", () => {
		const messages = getFlightSearchPassengerMessages(
			makeInput({
				passengerCounts: {
					adult: 1,
					childA: 0,
					childB: 0,
					childC: 3,
					infant: 0,
				},
			})
		);

		expect(messages).toEqual([CHILD_INFANT_PER_ADULT_ERROR]);
	});

	it("returns infant error when only infant limit fails", () => {
		const messages = getFlightSearchPassengerMessages(
			makeInput({
				passengerCounts: {
					adult: 1,
					childA: 0,
					childB: 0,
					childC: 0,
					infant: 2,
				},
			})
		);

		expect(messages).toEqual([INFANT_PER_ADULT_ERROR]);
	});

	it("returns null alert content when no messages exist", () => {
		const content = getPassengerAlertContent(makeInput());
		expect(content).toBeNull();
	});

	it("returns heading and messages for multiple violations", () => {
		const content = getPassengerAlertContent(
			makeInput({
				passengerCounts: {
					adult: 1,
					childA: 0,
					childB: 0,
					childC: 2,
					infant: 2,
				},
			})
		);

		expect(content?.messages).toEqual([]);
		expect(content?.title).toBe(CHILD_INFANT_PER_ADULT_ERROR);
	});

	it("reports promotion code character validation error", () => {
		const result = flightSearchSchema.safeParse(makeInput({ promotionCode: "ABC-123" }));

		expect(result.success).toBe(false);
		if (result.success) {
			return;
		}
		expect(result.error.issues[0]?.message).toBe("Please enter in alphanumeric characters.");
	});

	it("returns travel date error when one-way outbound date is missing", () => {
		const result = flightSearchSchema.safeParse(
			makeInput({
				tripType: "one-way",
				travelDates: {
					outboundDate: "",
					returnDate: "",
				},
			})
		);

		expect(result.success).toBe(false);
		if (result.success) {
			return;
		}

		expect(result.error.issues.some((issue) => issue.message === TRAVEL_DATES_ERROR)).toBe(true);
	});

	it("skips travel date error until destination is selected", () => {
		const result = flightSearchSchema.safeParse(
			makeInput({
				destination: "",
				travelDates: {
					outboundDate: "",
					returnDate: "",
				},
			})
		);

		expect(result.success).toBe(false);
		if (result.success) {
			return;
		}

		expect(result.error.issues.some((issue) => issue.message === TRAVEL_DATES_ERROR)).toBe(false);
	});
});
