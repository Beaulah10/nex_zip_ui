import { renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { PassengerValues } from "@/types/passenger/passenger.type";
import { useInflightMealSummary } from "./use-inflight-meal-summary";

function buildStoredPassenger(
	id: string,
	mealServices: Array<{ serviceID: number; lfid: number }> = []
): PassengerValues {
	return {
		id,
		firstName: "Test",
		lastName: "User",
		passengerTypeCode: "adult",
		services: {
			meals: mealServices.map(({ serviceID, lfid }) => ({
				serviceID,
				lfid,
				pfid: 200,
				amount: 1000,
				categoryId: 1,
				cutOffHours: 0,
				description: `Meal ${serviceID}`,
				maxCountServiceLevel: 1,
				passengerType: "adult",
				qtyAvailable: 5,
				ssrCode: `MEAL${serviceID}`,
				chargeComment: "",
				bundleCode: "",
			})),
		},
	};
}

function buildServicePassenger(id: string, bundleCode: string, isIcnRoute = false) {
	return {
		id,
		name: `Passenger ${id}`,
		bundleCode,
		bundleLabel: "Bundle",
		mealfeatures: [],
		isIcnRoute,
		isValueBundle: false,
	};
}

describe("useInflightMealSummary", () => {
	it("counts selected meals and remaining required meals for eligible passengers", () => {
		const { result } = renderHook(() =>
			useInflightMealSummary({
				selectedAncillarySegmentLfid: 100,
				servicePassengers: [
					buildServicePassenger("p1", "VALK"),
					buildServicePassenger("p2", "PRMK"),
				],
				storedPassengers: [
					buildStoredPassenger("p1", [{ serviceID: 1, lfid: 100 }]),
					buildStoredPassenger("p2", []),
				],
			})
		);

		expect(result.current.selectedMealPassengerCount).toBe(1);
		expect(result.current.requiredMealSelectionCount).toBe(1);
	});

	it("counts only premium bundle passengers on ICN routes", () => {
		const { result } = renderHook(() =>
			useInflightMealSummary({
				selectedAncillarySegmentLfid: 100,
				servicePassengers: [
					buildServicePassenger("p1", "PRMK", true),
					buildServicePassenger("p2", "VALK", true),
				],
				storedPassengers: [
					buildStoredPassenger("p1", [{ serviceID: 1, lfid: 100 }]),
					buildStoredPassenger("p2", [{ serviceID: 2, lfid: 100 }]),
				],
			})
		);

		expect(result.current.selectedMealPassengerCount).toBe(1);
		expect(result.current.requiredMealSelectionCount).toBe(0);
	});

	it("does not count meals from a different LFID", () => {
		const { result } = renderHook(() =>
			useInflightMealSummary({
				selectedAncillarySegmentLfid: 100,
				servicePassengers: [buildServicePassenger("p1", "VALK")],
				storedPassengers: [buildStoredPassenger("p1", [{ serviceID: 1, lfid: 999 }])],
			})
		);

		expect(result.current.selectedMealPassengerCount).toBe(0);
		expect(result.current.requiredMealSelectionCount).toBe(1);
	});
});
