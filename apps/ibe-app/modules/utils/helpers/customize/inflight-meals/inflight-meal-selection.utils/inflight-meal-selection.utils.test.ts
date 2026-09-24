import { describe, expect, it } from "vitest";
import {
	formatStockLabel,
	isICNValueMealExceptionPassenger,
	isMandatoryMealPassenger,
	recalculatePassengerMealItems,
} from "./inflight-meal-selection.utils";

describe("formatStockLabel", () => {
	it("returns out_of_stock when quantity is 0", () => {
		expect(formatStockLabel(0)).toBe("out_of_stock");
	});

	it("returns remaining_quantity when quantity is below 10", () => {
		expect(formatStockLabel(1)).toBe("remaining_quantity");
		expect(formatStockLabel(9)).toBe("remaining_quantity");
	});

	it("returns undefined when quantity is 10 or above", () => {
		expect(formatStockLabel(10)).toBeUndefined();
		expect(formatStockLabel(200)).toBeUndefined();
	});
});

describe("isICNValueMealExceptionPassenger", () => {
	it("returns true only for value bundle passengers on ICN route", () => {
		expect(
			isICNValueMealExceptionPassenger({
				bundleCode: "VALB",
				isIcnRoute: true,
			})
		).toBe(true);
	});

	it("returns false for non-value bundles or non-ICN route", () => {
		expect(
			isICNValueMealExceptionPassenger({
				bundleCode: "PREM",
				isIcnRoute: true,
			})
		).toBe(false);
		expect(
			isICNValueMealExceptionPassenger({
				bundleCode: "VALB",
				isIcnRoute: false,
			})
		).toBe(false);
	});
});

describe("isMandatoryMealPassenger", () => {
	it("returns true for premium bundles", () => {
		expect(isMandatoryMealPassenger({ bundleCode: "PREM", isIcnRoute: true })).toBe(true);
		expect(isMandatoryMealPassenger({ bundleCode: "PRMB", isIcnRoute: false })).toBe(true);
	});

	it("returns false for non value/non premium bundles", () => {
		expect(isMandatoryMealPassenger({ bundleCode: "NOBN", isIcnRoute: false })).toBe(false);
	});

	it("returns false for value bundle passenger on ICN route", () => {
		expect(isMandatoryMealPassenger({ bundleCode: "VALB", isIcnRoute: true })).toBe(false);
	});

	it("returns true for value bundle passenger on non-ICN route", () => {
		expect(isMandatoryMealPassenger({ bundleCode: " valb ", isIcnRoute: false })).toBe(true);
	});
});

describe("recalculatePassengerMealItems", () => {
	it("makes only the highest priced eligible meal free", () => {
		const currentMeals = [
			{ mealId: "m1", label: "Meal 1", price: 90 },
			{ mealId: "m2", label: "Meal 2", price: 10 },
			{ mealId: "m3", label: "Meal 3", price: 70 },
		];

		const mealServiceMap = {
			m1: { service: { amount: 100, ssrCode: "ml1" } },
			m2: { service: { amount: 250, ssrCode: "ML2" } },
			m3: { service: { amount: 80, ssrCode: "DR1" } },
		} as any;

		const result = recalculatePassengerMealItems({
			currentMeals,
			bundleIncludedMealCodes: new Set(["ML1", "ML2"]),
			mealServiceMap,
		});

		expect(result.bundleEligibleSelectedCount).toBe(2);
		expect(result.lineItems).toEqual([
			{ mealId: "m1", label: "Meal 1", price: 100 },
			{ mealId: "m2", label: "Meal 2", price: 0 },
			{ mealId: "m3", label: "Meal 3", price: 80 },
		]);
	});

	it("keeps the first meal free when eligible prices are tied", () => {
		const currentMeals = [
			{ mealId: "m1", label: "Meal 1", price: 10 },
			{ mealId: "m2", label: "Meal 2", price: 20 },
		];

		const mealServiceMap = {
			m1: { service: { amount: 150, ssrCode: "ML1" } },
			m2: { service: { amount: 150, ssrCode: "ML2" } },
		} as any;

		const result = recalculatePassengerMealItems({
			currentMeals,
			bundleIncludedMealCodes: new Set(["ML1", "ML2"]),
			mealServiceMap,
		});

		expect(result.bundleEligibleSelectedCount).toBe(2);
		expect(result.lineItems[0]?.price).toBe(0);
		expect(result.lineItems[1]?.price).toBe(150);
	});

	it("uses original line-item price when service lookup is missing", () => {
		const currentMeals = [{ mealId: "m1", label: "Meal 1", price: 123 }];

		const result = recalculatePassengerMealItems({
			currentMeals,
			bundleIncludedMealCodes: new Set(["ML1"]),
			mealServiceMap: {},
		});

		expect(result.bundleEligibleSelectedCount).toBe(0);
		expect(result.lineItems).toEqual([{ mealId: "m1", label: "Meal 1", price: 123 }]);
	});

	it("does not apply free pricing when bundleIncludedMealCodes is undefined", () => {
		const currentMeals = [{ mealId: "m1", label: "Meal 1", price: 50 }];
		const mealServiceMap = {
			m1: { service: { amount: 200, ssrCode: "ML1" } },
		} as any;

		const result = recalculatePassengerMealItems({
			currentMeals,
			mealServiceMap,
		});

		expect(result.bundleEligibleSelectedCount).toBe(0);
		expect(result.lineItems[0]?.price).toBe(200);
	});
});
