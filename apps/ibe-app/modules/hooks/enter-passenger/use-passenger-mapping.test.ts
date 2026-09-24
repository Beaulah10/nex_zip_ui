import { renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { PassengerSection, PassengerValues } from "@/types/passenger/passenger.type";
import { usePassengerMapping } from "./use-passenger-mapping";

const adultSection = (id: string): PassengerSection => ({
	id,
	mainLabel: "Adult",
	ageLabel: "18+",
	hasAccompanyingAdult: false,
	passengerTypeCode: "adult",
});

const childSection = (id: string): PassengerSection => ({
	id,
	mainLabel: "Child",
	ageLabel: "2-11",
	hasAccompanyingAdult: true,
	passengerTypeCode: "childC",
});

const savedAdult = (id: string, firstName: string, lastName: string): PassengerValues => ({
	id,
	passengerTypeCode: "adult",
	firstName,
	lastName,
});

const savedChild = (
	id: string,
	firstName: string,
	lastName: string,
	associateWithPassengerId?: string
): PassengerValues => ({
	id,
	passengerTypeCode: "childC",
	firstName,
	lastName,
	associateWithPassengerId,
});

describe("usePassengerMapping", () => {
	it("returns empty passengers array when no sections provided", () => {
		const { result } = renderHook(() =>
			usePassengerMapping({ processedPassengerSections: [], savedPassengers: [] })
		);
		expect(result.current).toEqual({ passengers: [] });
	});

	it("returns blank strings when no saved passengers exist", () => {
		const sections = [adultSection("1"), adultSection("2")];
		const { result } = renderHook(() =>
			usePassengerMapping({ processedPassengerSections: sections, savedPassengers: [] })
		);
		expect(result.current.passengers).toEqual([
			{
				id: "1",
				firstName: "",
				lastName: "",
				accompanyingAdult: undefined,
				hasAccompanyingAdult: false,
				passengerTypeCode: "adult",
			},
			{
				id: "2",
				firstName: "",
				lastName: "",
				accompanyingAdult: undefined,
				hasAccompanyingAdult: false,
				passengerTypeCode: "adult",
			},
		]);
	});

	it("maps saved passengers to sections by type order, not by ID", () => {
		const sections = [adultSection("1"), adultSection("2"), childSection("3")];
		const saved = [
			savedAdult("1", "JOHN", "DOE"),
			savedAdult("2", "JANE", "DOE"),
			savedChild("3", "KID", "ONE"),
		];

		const { result } = renderHook(() =>
			usePassengerMapping({ processedPassengerSections: sections, savedPassengers: saved })
		);

		expect(result.current.passengers).toEqual([
			{
				id: "1",
				firstName: "JOHN",
				lastName: "DOE",
				accompanyingAdult: undefined,
				hasAccompanyingAdult: false,
				passengerTypeCode: "adult",
			},
			{
				id: "2",
				firstName: "JANE",
				lastName: "DOE",
				accompanyingAdult: undefined,
				hasAccompanyingAdult: false,
				passengerTypeCode: "adult",
			},
			{
				id: "3",
				firstName: "KID",
				lastName: "ONE",
				accompanyingAdult: undefined,
				hasAccompanyingAdult: true,
				passengerTypeCode: "childC",
			},
		]);
	});

	it("preserves accompanyingAdult when referenced adult ID still exists in sections", () => {
		const sections = [adultSection("1"), adultSection("2"), childSection("3")];
		const saved = [
			savedAdult("1", "JOHN", "DOE"),
			savedAdult("2", "JANE", "DOE"),
			savedChild("3", "KID", "ONE", "2"),
		];

		const { result } = renderHook(() =>
			usePassengerMapping({ processedPassengerSections: sections, savedPassengers: saved })
		);

		expect(result.current.passengers[2]?.accompanyingAdult).toBe("2");
	});

	it("clears accompanyingAdult when the referenced adult ID no longer exists in sections", () => {
		// adult "2" was removed from sections; child's association should be cleared
		const sections = [adultSection("1"), childSection("2")];
		const saved = [
			savedAdult("OLD-1", "JOHN", "DOE"),
			savedChild("OLD-2", "KID", "ONE", "non-existent-id"),
		];

		const { result } = renderHook(() =>
			usePassengerMapping({ processedPassengerSections: sections, savedPassengers: saved })
		);

		expect(result.current.passengers[1]?.accompanyingAdult).toBeUndefined();
	});

	it("remaps saved passengers correctly when passenger count decrease shifts section IDs", () => {
		// Scenario: 2 adults + 1 childC → reduce to 1 adult + 1 childC
		// The child was associated with adult "2", which no longer appears in new sections.
		// The hook should positionally map the 1st saved adult to section "1"
		// and the 1st saved childC to section "2", clearing the stale association.
		const newSections = [adultSection("1"), childSection("2")];
		const saved = [
			savedAdult("OLD-1", "JOHN", "DOE"),
			savedAdult("OLD-2", "JANE", "DOE"),
			savedChild("OLD-3", "KID", "ONE", "OLD-ADULT-2"),
		];

		const { result } = renderHook(() =>
			usePassengerMapping({ processedPassengerSections: newSections, savedPassengers: saved })
		);

		expect(result.current).toEqual({
			passengers: [
				{
					id: "1",
					firstName: "JOHN",
					lastName: "DOE",
					accompanyingAdult: undefined,
					hasAccompanyingAdult: false,
					passengerTypeCode: "adult",
				},
				{
					id: "2",
					firstName: "KID",
					lastName: "ONE",
					accompanyingAdult: undefined,
					hasAccompanyingAdult: true,
					passengerTypeCode: "childC",
				},
			],
		});
	});

	it("handles more sections than saved passengers by filling remaining with empty strings", () => {
		const sections = [adultSection("1"), adultSection("2"), adultSection("3")];
		const saved = [savedAdult("1", "JOHN", "DOE")];

		const { result } = renderHook(() =>
			usePassengerMapping({ processedPassengerSections: sections, savedPassengers: saved })
		);

		expect(result.current.passengers[0]?.firstName).toBe("JOHN");
		expect(result.current.passengers[1]?.firstName).toBe("");
		expect(result.current.passengers[2]?.firstName).toBe("");
	});

	it("uses section IDs (not saved passenger IDs) in the output", () => {
		const sections = [adultSection("new-section-id")];
		const saved = [savedAdult("old-saved-id", "JOHN", "DOE")];

		const { result } = renderHook(() =>
			usePassengerMapping({ processedPassengerSections: sections, savedPassengers: saved })
		);

		expect(result.current.passengers[0]?.id).toBe("new-section-id");
	});

	it("memoizes result and returns same reference when inputs are unchanged", () => {
		const sections = [adultSection("1")];
		const saved = [savedAdult("1", "JOHN", "DOE")];

		const { result, rerender } = renderHook(() =>
			usePassengerMapping({ processedPassengerSections: sections, savedPassengers: saved })
		);

		const first = result.current;
		rerender();
		expect(result.current).toBe(first);
	});
});
