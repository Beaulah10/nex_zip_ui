import { renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { PassengerValues } from "@/store/slices/passenger/passenger.slice";
import type { MealServiceMap } from "@/types/customize/inflight-meals/inflight-meal-hooks.types";
import type { MealListOption } from "@/types/customize/inflight-meals/inflight-meals.types";
import { useInflightMealAvailability } from "./use-inflight-meal-availability";

const LFID = 100;

function buildMealOption(id: string, qtyAvailable: number): MealListOption {
	return {
		id,
		name: `Meal ${id}`,
		imageSrc: "",
		price: 1000,
		qtyAvailable,
		remainingQty: qtyAvailable,
	};
}

function buildServiceMapEntry(id: string, lfid = LFID): MealServiceMap[string] {
	return {
		service: {
			ssrId: parseInt(id, 10),
			lfid,
			description: `Meal ${id}`,
			amount: 1000,
			ssrCode: `MEAL${id}`,
			qtyAvailable: 10,
			pfid: 200,
			cutOffHours: 0,
			maxCountServiceLevel: 1,
		} as MealServiceMap[string]["service"],
		categoryId: 1,
		passengerType: "adult",
	};
}

function buildPassenger(
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
				description: "Meal",
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

const mealServiceMap: MealServiceMap = {
	"1": buildServiceMapEntry("1"),
	"2": buildServiceMapEntry("2"),
};

const mealListOptions: MealListOption[] = [buildMealOption("1", 5), buildMealOption("2", 15)];

function requireMealOption(option: MealListOption | undefined): MealListOption {
	if (!option) {
		throw new Error("Expected meal option");
	}

	return option;
}

const defaultParams = {
	passengers: [] as PassengerValues[],
	mealListOptions,
	mealServiceMap,
	pendingRemovalsByPassenger: {} as Record<string, string[]>,
	confirmedMealIdsByPassenger: {} as Record<string, string[]>,
	selectedMealPassengerId: null as string | null,
};

describe("useInflightMealAvailability", () => {
	describe("confirmedStockUsageByMealId", () => {
		it("returns empty usage map when no passengers have meal services", () => {
			const { result } = renderHook(() => useInflightMealAvailability(defaultParams));
			expect(result.current.confirmedStockUsageByMealId).toEqual({});
		});

		it("counts a confirmed meal service when lfid matches the service map", () => {
			const passengers = [buildPassenger("p1", [{ serviceID: 1, lfid: LFID }])];

			const { result } = renderHook(() =>
				useInflightMealAvailability({ ...defaultParams, passengers })
			);

			expect(result.current.confirmedStockUsageByMealId["1"]).toBe(1);
		});

		it("does not count a meal service when lfid does not match the service map entry", () => {
			const passengers = [buildPassenger("p1", [{ serviceID: 1, lfid: 999 }])];

			const { result } = renderHook(() =>
				useInflightMealAvailability({ ...defaultParams, passengers })
			);

			expect(result.current.confirmedStockUsageByMealId["1"]).toBeUndefined();
		});

		it("does not count a meal service whose ID is not in the service map", () => {
			const passengers = [buildPassenger("p1", [{ serviceID: 99, lfid: LFID }])];

			const { result } = renderHook(() =>
				useInflightMealAvailability({ ...defaultParams, passengers })
			);

			expect(result.current.confirmedStockUsageByMealId["99"]).toBeUndefined();
		});

		it("accumulates counts from multiple passengers selecting the same meal", () => {
			const passengers = [
				buildPassenger("p1", [{ serviceID: 1, lfid: LFID }]),
				buildPassenger("p2", [{ serviceID: 1, lfid: LFID }]),
			];

			const { result } = renderHook(() =>
				useInflightMealAvailability({ ...defaultParams, passengers })
			);

			expect(result.current.confirmedStockUsageByMealId["1"]).toBe(2);
		});

		it("reduces confirmed usage by pending removal count", () => {
			const passengers = [
				buildPassenger("p1", [{ serviceID: 1, lfid: LFID }]),
				buildPassenger("p2", [{ serviceID: 1, lfid: LFID }]),
			];

			const { result } = renderHook(() =>
				useInflightMealAvailability({
					...defaultParams,
					passengers,
					pendingRemovalsByPassenger: { p1: ["1"] },
				})
			);

			expect(result.current.confirmedStockUsageByMealId["1"]).toBe(1);
		});

		it("does not reduce count when pending removal ID is not in service map", () => {
			const passengers = [buildPassenger("p1", [{ serviceID: 1, lfid: LFID }])];

			const { result } = renderHook(() =>
				useInflightMealAvailability({
					...defaultParams,
					passengers,
					pendingRemovalsByPassenger: { p1: ["999"] },
				})
			);

			// Meal "1" count unchanged; "999" is not in service map so ignored
			expect(result.current.confirmedStockUsageByMealId["1"]).toBe(1);
		});

		it("clamps confirmed usage to 0 when pending removals exceed confirmed count", () => {
			// 1 passenger confirmed, 2 pending removals (edge case)
			const passengers = [buildPassenger("p1", [{ serviceID: 1, lfid: LFID }])];

			const { result } = renderHook(() =>
				useInflightMealAvailability({
					...defaultParams,
					passengers,
					pendingRemovalsByPassenger: { p1: ["1"], p2: ["1"] },
				})
			);

			expect(result.current.confirmedStockUsageByMealId["1"]).toBe(0);
		});
	});

	describe("stockAwareMealListOptions – remainingQty", () => {
		it("returns full qty when no confirmed usage", () => {
			const { result } = renderHook(() => useInflightMealAvailability(defaultParams));

			expect(requireMealOption(result.current.stockAwareMealListOptions[0]).remainingQty).toBe(5);
			expect(requireMealOption(result.current.stockAwareMealListOptions[1]).remainingQty).toBe(15);
		});

		it("reduces remainingQty by confirmed usage count", () => {
			const passengers = [buildPassenger("p1", [{ serviceID: 1, lfid: LFID }])];

			const { result } = renderHook(() =>
				useInflightMealAvailability({ ...defaultParams, passengers })
			);

			// qtyAvailable=5, confirmedUsage=1 → remaining=4
			expect(requireMealOption(result.current.stockAwareMealListOptions[0]).remainingQty).toBe(4);
		});

		it("clamps remainingQty to 0 when all stock is consumed", () => {
			const passengers = Array.from({ length: 5 }, (_, i) =>
				buildPassenger(`p${i}`, [{ serviceID: 1, lfid: LFID }])
			);

			const { result } = renderHook(() =>
				useInflightMealAvailability({
					...defaultParams,
					passengers,
					mealListOptions: [buildMealOption("1", 5)],
					mealServiceMap: { "1": buildServiceMapEntry("1") },
				})
			);

			expect(requireMealOption(result.current.stockAwareMealListOptions[0]).remainingQty).toBe(0);
		});

		it("adds 1 to remainingQty for selected passenger's confirmed (non-pending) meal", () => {
			// p1 and p2 each confirmed meal "1", p1 is the selected passenger
			const passengers = [
				buildPassenger("p1", [{ serviceID: 1, lfid: LFID }]),
				buildPassenger("p2", [{ serviceID: 1, lfid: LFID }]),
			];

			const { result } = renderHook(() =>
				useInflightMealAvailability({
					...defaultParams,
					passengers,
					confirmedMealIdsByPassenger: { p1: ["1"], p2: ["1"] },
					selectedMealPassengerId: "p1",
				})
			);

			// qtyAvailable=5, confirmedUsage=2, reservedForP1=1 → remaining=5-2+1=4
			expect(requireMealOption(result.current.stockAwareMealListOptions[0]).remainingQty).toBe(4);
		});

		it("does not reserve a slot when the selected passenger's confirmed meal is pending removal", () => {
			const { result } = renderHook(() =>
				useInflightMealAvailability({
					...defaultParams,
					confirmedMealIdsByPassenger: { p1: ["1"] },
					pendingRemovalsByPassenger: { p1: ["1"] },
					selectedMealPassengerId: "p1",
				})
			);

			// Pending removal cancels the reservation → remainingQty = 5 - 0 + 0 = 5
			expect(requireMealOption(result.current.stockAwareMealListOptions[0]).remainingQty).toBe(5);
		});

		it("does not reserve a slot when selectedMealPassengerId is null", () => {
			const passengers = [buildPassenger("p1", [{ serviceID: 1, lfid: LFID }])];

			const { result } = renderHook(() =>
				useInflightMealAvailability({
					...defaultParams,
					passengers,
					confirmedMealIdsByPassenger: { p1: ["1"] },
					selectedMealPassengerId: null,
				})
			);

			// No passenger selected → no reservation
			expect(requireMealOption(result.current.stockAwareMealListOptions[0]).remainingQty).toBe(4);
		});
	});

	describe("stockAwareMealListOptions – stockLabel and isOutOfStock", () => {
		it("sets stockLabel to 'remaining_quantity' for low stock (1–9)", () => {
			const options = [buildMealOption("1", 3)];
			const map: MealServiceMap = { "1": buildServiceMapEntry("1") };

			const { result } = renderHook(() =>
				useInflightMealAvailability({
					...defaultParams,
					mealListOptions: options,
					mealServiceMap: map,
				})
			);

			expect(requireMealOption(result.current.stockAwareMealListOptions[0]).stockLabel).toBe(
				"remaining_quantity"
			);
			expect(requireMealOption(result.current.stockAwareMealListOptions[0]).isOutOfStock).toBe(
				false
			);
		});

		it("sets stockLabel to 'out_of_stock' and isOutOfStock=true when remainingQty is 0", () => {
			const passengers = Array.from({ length: 5 }, (_, i) =>
				buildPassenger(`p${i}`, [{ serviceID: 1, lfid: LFID }])
			);

			const { result } = renderHook(() =>
				useInflightMealAvailability({
					...defaultParams,
					passengers,
					mealListOptions: [buildMealOption("1", 5)],
					mealServiceMap: { "1": buildServiceMapEntry("1") },
				})
			);

			expect(requireMealOption(result.current.stockAwareMealListOptions[0]).stockLabel).toBe(
				"out_of_stock"
			);
			expect(requireMealOption(result.current.stockAwareMealListOptions[0]).isOutOfStock).toBe(
				true
			);
		});

		it("returns undefined stockLabel when remainingQty is 10 or more", () => {
			const { result } = renderHook(() =>
				useInflightMealAvailability({
					...defaultParams,
					mealListOptions: [buildMealOption("2", 15)],
					mealServiceMap: { "2": buildServiceMapEntry("2") },
				})
			);

			expect(
				requireMealOption(result.current.stockAwareMealListOptions[0]).stockLabel
			).toBeUndefined();
			expect(requireMealOption(result.current.stockAwareMealListOptions[0]).isOutOfStock).toBe(
				false
			);
		});

		it("returns undefined stockLabel exactly at the 10-unit boundary", () => {
			const { result } = renderHook(() =>
				useInflightMealAvailability({
					...defaultParams,
					mealListOptions: [buildMealOption("1", 10)],
					mealServiceMap: { "1": buildServiceMapEntry("1") },
				})
			);

			expect(
				requireMealOption(result.current.stockAwareMealListOptions[0]).stockLabel
			).toBeUndefined();
		});
	});

	describe("mealListDisplayOptions", () => {
		it("keeps stockLabel for meals with low stock", () => {
			const options = [buildMealOption("1", 3)]; // low stock, not 0

			const { result } = renderHook(() =>
				useInflightMealAvailability({
					...defaultParams,
					mealListOptions: options,
					mealServiceMap: { "1": buildServiceMapEntry("1") },
				})
			);

			// display options retain the label
			expect(requireMealOption(result.current.mealListDisplayOptions[0]).stockLabel).toBe(
				"remaining_quantity"
			);
		});

		it("keeps stockLabel for out-of-stock meals in display options", () => {
			const passengers = Array.from({ length: 5 }, (_, i) =>
				buildPassenger(`p${i}`, [{ serviceID: 1, lfid: LFID }])
			);

			const { result } = renderHook(() =>
				useInflightMealAvailability({
					...defaultParams,
					passengers,
					mealListOptions: [buildMealOption("1", 5)],
					mealServiceMap: { "1": buildServiceMapEntry("1") },
				})
			);

			expect(requireMealOption(result.current.mealListDisplayOptions[0]).stockLabel).toBe(
				"out_of_stock"
			);
			expect(requireMealOption(result.current.mealListDisplayOptions[0]).isOutOfStock).toBe(true);
		});

		it("returns no stock label for high-stock meals", () => {
			const { result } = renderHook(() =>
				useInflightMealAvailability({
					...defaultParams,
					mealListOptions: [buildMealOption("2", 15)],
					mealServiceMap: { "2": buildServiceMapEntry("2") },
				})
			);

			expect(
				requireMealOption(result.current.mealListDisplayOptions[0]).stockLabel
			).toBeUndefined();
		});
	});

	describe("mealListOptionsById", () => {
		it("builds a map keyed by meal ID", () => {
			const { result } = renderHook(() => useInflightMealAvailability(defaultParams));

			expect(result.current.mealListOptionsById["1"]).toBeDefined();
			expect(requireMealOption(result.current.mealListOptionsById["1"]).id).toBe("1");
			expect(result.current.mealListOptionsById["2"]).toBeDefined();
			expect(requireMealOption(result.current.mealListOptionsById["2"]).id).toBe("2");
		});

		it("contains updated remainingQty after confirmed usage", () => {
			const passengers = [buildPassenger("p1", [{ serviceID: 1, lfid: LFID }])];

			const { result } = renderHook(() =>
				useInflightMealAvailability({ ...defaultParams, passengers })
			);

			expect(requireMealOption(result.current.mealListOptionsById["1"]).remainingQty).toBe(4);
		});
	});

	describe("multi-passenger scenarios", () => {
		it("handles multiple passengers with different meals", () => {
			const passengers = [
				buildPassenger("p1", [{ serviceID: 1, lfid: LFID }]),
				buildPassenger("p2", [{ serviceID: 2, lfid: LFID }]),
			];

			const { result } = renderHook(() =>
				useInflightMealAvailability({ ...defaultParams, passengers })
			);

			expect(result.current.confirmedStockUsageByMealId["1"]).toBe(1);
			expect(result.current.confirmedStockUsageByMealId["2"]).toBe(1);
			expect(requireMealOption(result.current.stockAwareMealListOptions[0]).remainingQty).toBe(4);
			expect(requireMealOption(result.current.stockAwareMealListOptions[1]).remainingQty).toBe(14);
		});

		it("returns empty lists when mealListOptions is empty", () => {
			const { result } = renderHook(() =>
				useInflightMealAvailability({ ...defaultParams, mealListOptions: [] })
			);

			expect(result.current.stockAwareMealListOptions).toHaveLength(0);
			expect(result.current.mealListDisplayOptions).toHaveLength(0);
			expect(result.current.mealListOptionsById).toEqual({});
		});
	});
});
