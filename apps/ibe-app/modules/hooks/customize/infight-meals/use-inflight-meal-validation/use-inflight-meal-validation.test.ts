import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { MealServiceMap } from "@/types/customize/inflight-meals/inflight-meal-hooks.types";
import type {
	InflightMealPassenger,
	SelectedMealLineItem,
} from "@/types/customize/inflight-meals/inflight-meals.types";
import { useInflightMealValidation } from "./use-inflight-meal-validation";

// A premium-bundle passenger → mandatory meal required
const mandatoryPassenger: InflightMealPassenger = {
	id: "p1",
	name: "John Doe",
	bundleCode: "PREN",
	bundleLabel: "Premium",
	mealfeatures: [],
	isIcnRoute: false,
	isValueBundle: false,
};

// A value-bundle, non-ICN passenger → also mandatory
const mandatoryValuePassenger: InflightMealPassenger = {
	id: "p2",
	name: "Jane Doe",
	bundleCode: "VALN",
	bundleLabel: "Value",
	mealfeatures: [],
	isIcnRoute: false,
	isValueBundle: true,
};

// A value-bundle ICN passenger → NOT mandatory
const icnValuePassenger: InflightMealPassenger = {
	id: "p3",
	name: "ICN Passenger",
	bundleCode: "VALN",
	bundleLabel: "Value",
	mealfeatures: [],
	isIcnRoute: true,
	isValueBundle: true,
};

// A no-bundle passenger → NOT mandatory
const noBundlePassenger: InflightMealPassenger = {
	id: "p4",
	name: "No Bundle",
	bundleCode: "NOBN",
	bundleLabel: "",
	mealfeatures: [],
	isIcnRoute: false,
	isValueBundle: false,
};

// SSR code for a bundle-included meal (will match normalizeServiceCode → uppercase)
const BUNDLE_MEAL_SSR_CODE = "VMEAL";

const bundleMealServiceEntry: MealServiceMap[string] = {
	service: {
		ssrId: 1,
		lfid: 100,
		description: "Bundle Meal",
		amount: 2000,
		ssrCode: BUNDLE_MEAL_SSR_CODE,
		qtyAvailable: 10,
		pfid: 200,
		cutOffHours: 0,
		maxCountServiceLevel: 1,
	} as MealServiceMap[string]["service"],
	categoryId: 1,
	passengerType: "adult",
};

const nonBundleMealServiceEntry: MealServiceMap[string] = {
	service: {
		ssrId: 2,
		lfid: 100,
		description: "Regular Meal",
		amount: 1500,
		ssrCode: "RMEAL",
		qtyAvailable: 10,
		pfid: 200,
		cutOffHours: 0,
		maxCountServiceLevel: 1,
	} as MealServiceMap[string]["service"],
	categoryId: 1,
	passengerType: "adult",
};

const mealServiceMap: MealServiceMap = {
	"1": bundleMealServiceEntry,
	"2": nonBundleMealServiceEntry,
};

const bundleIncludedCodes: ReadonlySet<string> = new Set([BUNDLE_MEAL_SSR_CODE]);

function makeLineItem(mealId: string, price = 1000): SelectedMealLineItem {
	return { mealId, label: `Meal ${mealId}`, price };
}

const defaultParams = {
	selectedMealPassengerId: null as string | null,
	servicePassengers: [] as InflightMealPassenger[],
	selectedMealsByPassenger: {} as Record<string, SelectedMealLineItem[]>,
	confirmedMealIdsByPassenger: {} as Record<string, string[]>,
	pendingRemovalsByPassenger: {} as Record<string, string[]>,
	bundleIncludedMealCodesByPassengerId: {} as Record<string, ReadonlySet<string>>,
	mealServiceMap,
};

describe("useInflightMealValidation", () => {
	describe("initial state", () => {
		it("starts with no error messages", () => {
			const { result } = renderHook(() => useInflightMealValidation(defaultParams));

			expect(result.current.mandatoryMealErrorMessage).toBeUndefined();
			expect(result.current.outerValidationMessage).toBeUndefined();
			expect(result.current.selectedPassengerWarningMessage).toBeUndefined();
			expect(result.current.incompleteMandatoryPassengerNames).toEqual([]);
			expect(result.current.showMealRequiredError).toBe(false);
			expect(result.current.showOuterValidationError).toBe(false);
		});

		it("exposes both setter functions", () => {
			const { result } = renderHook(() => useInflightMealValidation(defaultParams));

			expect(typeof result.current.setShowMealRequiredError).toBe("function");
			expect(typeof result.current.setShowOuterValidationError).toBe("function");
		});
	});

	describe("mandatoryMealErrorMessage", () => {
		it("sets mandatoryMealErrorMessage when setShowMealRequiredError(true) is called", () => {
			const { result } = renderHook(() => useInflightMealValidation(defaultParams));

			act(() => {
				result.current.setShowMealRequiredError(true);
			});

			expect(result.current.mandatoryMealErrorMessage).toBe("error_labels.mandatory_meal_required");
		});

		it("clears mandatoryMealErrorMessage when setShowMealRequiredError(false) is called", () => {
			const { result } = renderHook(() => useInflightMealValidation(defaultParams));

			act(() => {
				result.current.setShowMealRequiredError(true);
			});

			act(() => {
				result.current.setShowMealRequiredError(false);
			});

			expect(result.current.mandatoryMealErrorMessage).toBeUndefined();
		});
	});

	describe("outerValidationMessage", () => {
		it("shows outer validation message when there are incomplete mandatory passengers", () => {
			const { result } = renderHook(() =>
				useInflightMealValidation({
					...defaultParams,
					servicePassengers: [mandatoryPassenger],
					confirmedMealIdsByPassenger: {}, // p1 has no confirmed meals
				})
			);

			act(() => {
				result.current.setShowOuterValidationError(true);
			});

			expect(result.current.outerValidationMessage).toBe("error_labels.outer_validation");
		});

		it("does not show outer validation message when all mandatory passengers have meals", () => {
			const { result } = renderHook(() =>
				useInflightMealValidation({
					...defaultParams,
					servicePassengers: [mandatoryPassenger],
					confirmedMealIdsByPassenger: { p1: ["1"] },
				})
			);

			act(() => {
				result.current.setShowOuterValidationError(true);
			});

			expect(result.current.outerValidationMessage).toBeUndefined();
		});

		it("does not show outer validation when error flag is false even with incomplete passengers", () => {
			const { result } = renderHook(() =>
				useInflightMealValidation({
					...defaultParams,
					servicePassengers: [mandatoryPassenger],
					confirmedMealIdsByPassenger: {},
				})
			);

			// showOuterValidationError remains false
			expect(result.current.outerValidationMessage).toBeUndefined();
		});
	});

	describe("showMealRequiredError resets on passenger change", () => {
		it("resets showMealRequiredError when selectedMealPassengerId changes", () => {
			const { result, rerender } = renderHook(
				({ passengerId }: { passengerId: string | null }) =>
					useInflightMealValidation({
						...defaultParams,
						selectedMealPassengerId: passengerId,
					}),
				{ initialProps: { passengerId: "p1" as string | null } }
			);

			act(() => {
				result.current.setShowMealRequiredError(true);
			});

			expect(result.current.showMealRequiredError).toBe(true);

			rerender({ passengerId: "p2" });

			expect(result.current.showMealRequiredError).toBe(false);
		});

		it("resets showMealRequiredError when passenger changes to null", () => {
			const { result, rerender } = renderHook(
				({ passengerId }: { passengerId: string | null }) =>
					useInflightMealValidation({
						...defaultParams,
						selectedMealPassengerId: passengerId,
					}),
				{ initialProps: { passengerId: "p1" as string | null } }
			);

			act(() => {
				result.current.setShowMealRequiredError(true);
			});

			rerender({ passengerId: null });

			expect(result.current.showMealRequiredError).toBe(false);
		});
	});

	describe("selectedPassengerWarningMessage", () => {
		it("returns undefined when no passenger is selected", () => {
			const { result } = renderHook(() =>
				useInflightMealValidation({
					...defaultParams,
					selectedMealPassengerId: null,
					servicePassengers: [mandatoryPassenger],
				})
			);

			expect(result.current.selectedPassengerWarningMessage).toBeUndefined();
		});

		it("returns undefined when selected passenger is not in servicePassengers", () => {
			const { result } = renderHook(() =>
				useInflightMealValidation({
					...defaultParams,
					selectedMealPassengerId: "unknown",
					servicePassengers: [mandatoryPassenger],
				})
			);

			expect(result.current.selectedPassengerWarningMessage).toBeUndefined();
		});

		it("returns undefined when selected passenger is not mandatory", () => {
			const { result } = renderHook(() =>
				useInflightMealValidation({
					...defaultParams,
					selectedMealPassengerId: noBundlePassenger.id,
					servicePassengers: [noBundlePassenger],
				})
			);

			expect(result.current.selectedPassengerWarningMessage).toBeUndefined();
		});

		it("returns undefined when ICN value-bundle passenger is selected (not mandatory)", () => {
			const { result } = renderHook(() =>
				useInflightMealValidation({
					...defaultParams,
					selectedMealPassengerId: icnValuePassenger.id,
					servicePassengers: [icnValuePassenger],
				})
			);

			expect(result.current.selectedPassengerWarningMessage).toBeUndefined();
		});

		it("returns undefined when mandatory passenger has fewer than 2 bundle meals and no non-bundle items", () => {
			const { result } = renderHook(() =>
				useInflightMealValidation({
					...defaultParams,
					selectedMealPassengerId: mandatoryPassenger.id,
					servicePassengers: [mandatoryPassenger],
					selectedMealsByPassenger: {
						p1: [makeLineItem("1")], // one bundle meal
					},
					bundleIncludedMealCodesByPassengerId: {
						p1: bundleIncludedCodes,
					},
				})
			);

			// bundleEligibleSelectedCount=1, hasNonBundleItems=false → no warning
			expect(result.current.selectedPassengerWarningMessage).toBeUndefined();
		});

		it("returns 'warning_bundle' when mandatory passenger has 2 or more bundle-eligible meals", () => {
			const { result } = renderHook(() =>
				useInflightMealValidation({
					...defaultParams,
					selectedMealPassengerId: mandatoryPassenger.id,
					servicePassengers: [mandatoryPassenger],
					selectedMealsByPassenger: {
						p1: [makeLineItem("1"), makeLineItem("1")], // two bundle meals (same id, different entries)
					},
					bundleIncludedMealCodesByPassengerId: {
						p1: bundleIncludedCodes,
					},
					mealServiceMap: {
						"1": bundleMealServiceEntry,
					},
				})
			);

			expect(result.current.selectedPassengerWarningMessage).toBe("warning_bundle");
		});

		it("returns 'warning_bundle' when mandatory passenger has a non-bundle meal", () => {
			const { result } = renderHook(() =>
				useInflightMealValidation({
					...defaultParams,
					selectedMealPassengerId: mandatoryPassenger.id,
					servicePassengers: [mandatoryPassenger],
					selectedMealsByPassenger: {
						p1: [makeLineItem("2")], // non-bundle meal
					},
					bundleIncludedMealCodesByPassengerId: {
						p1: bundleIncludedCodes,
					},
					mealServiceMap,
				})
			);

			expect(result.current.selectedPassengerWarningMessage).toBe("warning_bundle");
		});

		it("returns 'warning_bundle' for mandatory value-bundle passenger with 2 bundle meals", () => {
			const { result } = renderHook(() =>
				useInflightMealValidation({
					...defaultParams,
					selectedMealPassengerId: mandatoryValuePassenger.id,
					servicePassengers: [mandatoryValuePassenger],
					selectedMealsByPassenger: {
						p2: [makeLineItem("1"), makeLineItem("1")],
					},
					bundleIncludedMealCodesByPassengerId: {
						p2: bundleIncludedCodes,
					},
					mealServiceMap: { "1": bundleMealServiceEntry },
				})
			);

			expect(result.current.selectedPassengerWarningMessage).toBe("warning_bundle");
		});

		it("filters out pending removals when computing warning", () => {
			// p1 has 2 meals but one is pending removal, leaving 1 → no warning
			const { result } = renderHook(() =>
				useInflightMealValidation({
					...defaultParams,
					selectedMealPassengerId: mandatoryPassenger.id,
					servicePassengers: [mandatoryPassenger],
					selectedMealsByPassenger: {
						p1: [makeLineItem("1"), makeLineItem("1")],
					},
					pendingRemovalsByPassenger: {
						p1: ["1"], // removes one of the bundle meals
					},
					bundleIncludedMealCodesByPassengerId: {
						p1: bundleIncludedCodes,
					},
					mealServiceMap: { "1": bundleMealServiceEntry },
				})
			);

			// After filtering, only 1 bundle meal remains → no warning
			expect(result.current.selectedPassengerWarningMessage).toBeUndefined();
		});
	});

	describe("incompleteMandatoryPassengerNames", () => {
		it("returns empty array when there are no mandatory passengers", () => {
			const { result } = renderHook(() =>
				useInflightMealValidation({
					...defaultParams,
					servicePassengers: [noBundlePassenger],
					confirmedMealIdsByPassenger: {},
				})
			);

			expect(result.current.incompleteMandatoryPassengerNames).toEqual([]);
		});

		it("lists mandatory passenger names who have no confirmed meals", () => {
			const { result } = renderHook(() =>
				useInflightMealValidation({
					...defaultParams,
					servicePassengers: [mandatoryPassenger, mandatoryValuePassenger],
					confirmedMealIdsByPassenger: {},
				})
			);

			expect(result.current.incompleteMandatoryPassengerNames).toContain("John Doe");
			expect(result.current.incompleteMandatoryPassengerNames).toContain("Jane Doe");
		});

		it("excludes mandatory passengers who have at least one confirmed meal", () => {
			const { result } = renderHook(() =>
				useInflightMealValidation({
					...defaultParams,
					servicePassengers: [mandatoryPassenger, mandatoryValuePassenger],
					confirmedMealIdsByPassenger: { p1: ["1"] }, // p1 complete, p2 incomplete
				})
			);

			expect(result.current.incompleteMandatoryPassengerNames).not.toContain("John Doe");
			expect(result.current.incompleteMandatoryPassengerNames).toContain("Jane Doe");
		});

		it("includes mandatory passenger when all confirmed meals are pending removal", () => {
			const { result } = renderHook(() =>
				useInflightMealValidation({
					...defaultParams,
					servicePassengers: [mandatoryPassenger],
					confirmedMealIdsByPassenger: { p1: ["1"] },
					pendingRemovalsByPassenger: { p1: ["1"] }, // removal cancels the confirmation
				})
			);

			expect(result.current.incompleteMandatoryPassengerNames).toContain("John Doe");
		});

		it("excludes ICN value-bundle passengers from mandatory check", () => {
			const { result } = renderHook(() =>
				useInflightMealValidation({
					...defaultParams,
					servicePassengers: [icnValuePassenger],
					confirmedMealIdsByPassenger: {},
				})
			);

			expect(result.current.incompleteMandatoryPassengerNames).toEqual([]);
		});
	});
});
