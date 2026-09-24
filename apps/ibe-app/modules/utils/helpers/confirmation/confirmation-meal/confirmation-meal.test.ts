import { describe, expect, it } from "vitest";
import { detectMealAvailabilityIssue } from "./confirmation-meal";

function makePassenger(id: string, passengerTypeCode: string, meals: any[] = []) {
	return {
		id,
		firstName: `First${id}`,
		lastName: `Last${id}`,
		passengerTypeCode,
		services: { meals },
	} as any;
}

function makeMeal(
	serviceID: number,
	qtyAvailable: number,
	passengerType = "adult",
	code = `M${serviceID}`
) {
	return {
		ssrId: serviceID,
		ssrCode: code,
		description: `Meal ${serviceID}`,
		qtyAvailable,
		passengerType,
	};
}

function ancillaryByType(
	entries: Array<{ passengerType: string; meals: ReturnType<typeof makeMeal>[] }>
) {
	return {
		data: {
			servicesPerPassengerType: entries.map((entry) => ({
				passengerType: entry.passengerType,
				categories: [{ title: "In-Flight Meals", specialServices: entry.meals }],
			})),
		},
	} as any;
}

describe("detectMealAvailabilityIssue", () => {
	it("prioritizes bundle meal unavailability", () => {
		const result = detectMealAvailabilityIssue({
			ancillaryData: ancillaryByType([
				{ passengerType: "adult", meals: [makeMeal(1, 1, "adult", "BUNDLE"), makeMeal(2, 1)] },
			]),
			storedPassengers: [],
			orderedPassengerIds: [],
			lfid: 10,
			bundleIncludedMealCodesByPassengerId: {
				P1: new Set(["BUNDLE"]),
				P2: new Set(["BUNDLE"]),
			},
		});

		expect(result).toEqual({ type: "bundle-meal-unavailable" });
	});

	it("returns all-meals-unavailable and collects existing selections", () => {
		const passenger = makePassenger("P1", "ADT", [
			{ lfid: 10, ssrCode: "ML1", serviceID: 101, description: "Meal 101" },
			{ lfid: 20, ssrCode: "ML2", serviceID: 102, description: "Meal 102" },
		]);

		const result = detectMealAvailabilityIssue({
			ancillaryData: ancillaryByType([{ passengerType: "adult", meals: [makeMeal(101, 0)] }]),
			storedPassengers: [passenger],
			orderedPassengerIds: ["P1"],
			lfid: 10,
			bundleIncludedMealCodesByPassengerId: {},
		});

		expect(result).toEqual({
			type: "all-meals-unavailable",
			hasExistingSelections: true,
			mealsToRemove: [{ passengerId: "P1", lfid: 10, ssrCode: "ML1", serviceID: 101 }],
		});
	});

	it("returns selected-meal-unavailable when a chosen meal is fully removed", () => {
		const passenger = makePassenger("P1", "ADT", [
			{ lfid: 10, ssrCode: "ML1", serviceID: 101, description: "Meal 101" },
		]);

		const result = detectMealAvailabilityIssue({
			ancillaryData: ancillaryByType([
				{ passengerType: "adult", meals: [makeMeal(101, 0), makeMeal(202, 2)] },
			]),
			storedPassengers: [passenger],
			orderedPassengerIds: ["P1"],
			lfid: 10,
			bundleIncludedMealCodesByPassengerId: {},
		});

		expect(result).toEqual({
			type: "selected-meal-unavailable",
			unavailableMeals: [
				{ passengerId: "P1", passengerName: "FirstP1 LastP1", mealName: "Meal 101" },
			],
			mealsToRemove: [{ passengerId: "P1", lfid: 10, ssrCode: "ML1", serviceID: 101 }],
		});
	});

	it("removes the last passengers first when inventory is partially reduced for a selected meal", () => {
		const passengers = [
			makePassenger("P1", "ADT", [
				{ lfid: 10, ssrCode: "ML1", serviceID: 101, description: "Meal 101" },
			]),
			makePassenger("P2", "ADT", [
				{ lfid: 10, ssrCode: "ML1", serviceID: 101, description: "Meal 101" },
			]),
			makePassenger("P3", "ADT", [
				{ lfid: 10, ssrCode: "ML1", serviceID: 101, description: "Meal 101" },
			]),
		];

		const result = detectMealAvailabilityIssue({
			ancillaryData: ancillaryByType([
				{ passengerType: "adult", meals: [makeMeal(101, 2), makeMeal(202, 3)] },
			]),
			storedPassengers: passengers,
			orderedPassengerIds: ["P1", "P2", "P3"],
			lfid: 10,
			bundleIncludedMealCodesByPassengerId: {},
		});

		expect(result).toEqual({
			type: "selected-meal-unavailable",
			unavailableMeals: [
				{ passengerId: "P3", passengerName: "FirstP3 LastP3", mealName: "Meal 101" },
			],
			mealsToRemove: [{ passengerId: "P3", lfid: 10, ssrCode: "ML1", serviceID: 101 }],
		});
	});

	it("returns partial-meals-unavailable when a passenger type has insufficient general stock", () => {
		const passengers = [makePassenger("P1", "CHD"), makePassenger("P2", "CHD")];

		const result = detectMealAvailabilityIssue({
			ancillaryData: ancillaryByType([
				{ passengerType: "adult", meals: [makeMeal(999, 5)] },
				{ passengerType: "CHD", meals: [makeMeal(301, 1, "CHD")] },
			]),
			storedPassengers: passengers,
			orderedPassengerIds: ["P1", "P2"],
			lfid: 10,
			bundleIncludedMealCodesByPassengerId: {},
		});

		expect(result).toEqual({
			type: "partial-meals-unavailable",
			affectedPassengerIds: ["P2"],
			mealsToRemove: [],
		});
	});

	it("removes the last affected adult passenger meal during partial availability", () => {
		const passengers = [
			makePassenger("P1", "adult", [
				{ lfid: 10, ssrCode: "MA1", serviceID: 401, description: "Adult meal 1" },
			]),
			makePassenger("P2", "adult", [
				{ lfid: 10, ssrCode: "MA2", serviceID: 402, description: "Adult meal 2" },
			]),
		];

		const result = detectMealAvailabilityIssue({
			ancillaryData: ancillaryByType([
				{ passengerType: "adult", meals: [makeMeal(401, 1), makeMeal(402, 1)] },
			]),
			storedPassengers: passengers,
			orderedPassengerIds: ["P1", "P2"],
			lfid: 10,
			bundleIncludedMealCodesByPassengerId: {},
		});

		expect(result).toEqual({
			type: "partial-meals-unavailable",
			affectedPassengerIds: ["P2"],
			mealsToRemove: [{ passengerId: "P2", lfid: 10, ssrCode: "MA2", serviceID: 402 }],
		});
	});

	it("returns noop when stock is sufficient and there are no impacted passengers", () => {
		const result = detectMealAvailabilityIssue({
			ancillaryData: ancillaryByType([{ passengerType: "adult", meals: [makeMeal(1, 3)] }]),
			storedPassengers: [makePassenger("P1", "adult")],
			orderedPassengerIds: ["P1"],
			lfid: 10,
			bundleIncludedMealCodesByPassengerId: {},
		});

		expect(result).toEqual({ type: "noop" });
	});
});
