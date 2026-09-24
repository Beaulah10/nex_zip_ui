import { renderHook } from "@testing-library/react";
import { createRef } from "react";
import { describe, expect, it, vi } from "vitest";
import type { PassengerValues } from "@/store/slices/passenger/passenger.slice";
import type { MealServiceMap } from "@/types/customize/inflight-meals/inflight-meal-hooks.types";
import type {
	InflightMealPassenger,
	SelectedMealLineItem,
} from "@/types/customize/inflight-meals/inflight-meals.types";
import { useInflightMealPrefill } from "./use-inflightmeal-prefill";

const LFID = 100;

function buildPassenger(
	id: string,
	mealServices: Array<{ serviceID: number; lfid: number; amount?: number }> = []
): PassengerValues {
	return {
		id,
		firstName: "Test",
		lastName: "User",
		passengerTypeCode: "adult",
		services: {
			meals: mealServices.map(({ serviceID, lfid, amount = 1000 }) => ({
				serviceID,
				lfid,
				pfid: 200,
				amount,
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

function buildServicePassenger(id: string): InflightMealPassenger {
	return {
		id,
		name: `Passenger ${id}`,
		bundleCode: "PREN",
		bundleLabel: "Premium",
		mealfeatures: [],
		isIcnRoute: false,
		isValueBundle: false,
	};
}

const mealServiceMap: MealServiceMap = {
	"1": {
		service: {
			ssrId: 1,
			lfid: LFID,
			description: "Meal 1",
			amount: 1000,
			ssrCode: "MEAL1",
			qtyAvailable: 10,
			pfid: 200,
			cutOffHours: 0,
			maxCountServiceLevel: 1,
		} as MealServiceMap[string]["service"],
		categoryId: 1,
		passengerType: "adult",
	},
	"2": {
		service: {
			ssrId: 2,
			lfid: LFID,
			description: "Meal 2",
			amount: 2000,
			ssrCode: "MEAL2",
			qtyAvailable: 10,
			pfid: 200,
			cutOffHours: 0,
			maxCountServiceLevel: 1,
		} as MealServiceMap[string]["service"],
		categoryId: 1,
		passengerType: "adult",
	},
};

const mealOptionNameById: Record<string, string> = {
	"1": "Chicken Meal",
	"2": "Vegetarian Meal",
};

describe("useInflightMealPrefill", () => {
	function buildParams(overrides: Partial<Parameters<typeof useInflightMealPrefill>[0]> = {}) {
		const setConfirmedMealIdsByPassenger = vi.fn();
		const setSelectedMealsByPassenger = vi.fn();
		const setMealPrices = vi.fn();
		const setPendingRemovalsByPassenger = vi.fn();
		const hasHydratedSelectionStateRef = createRef<boolean>() as React.RefObject<boolean>;
		// React.createRef initialises to null; we override the current
		(hasHydratedSelectionStateRef as unknown as { current: boolean }).current = false;

		return {
			params: {
				open: false,
				servicePassengers: [] as InflightMealPassenger[],
				passengers: [] as PassengerValues[],
				mealOptionNameById,
				bundleIncludedMealCodesByPassengerId: {} as Record<string, ReadonlySet<string>>,
				mealServiceMap,
				setConfirmedMealIdsByPassenger,
				setSelectedMealsByPassenger,
				setMealPrices,
				setPendingRemovalsByPassenger,
				hasHydratedSelectionStateRef,
				...overrides,
			},
			setConfirmedMealIdsByPassenger,
			setSelectedMealsByPassenger,
			setMealPrices,
			setPendingRemovalsByPassenger,
			hasHydratedSelectionStateRef,
		};
	}

	describe("when open is false", () => {
		it("does not call any state setters on initial render with open=false", () => {
			const { params, setConfirmedMealIdsByPassenger, setMealPrices } = buildParams({
				open: false,
			});

			renderHook(() => useInflightMealPrefill(params));

			expect(setConfirmedMealIdsByPassenger).not.toHaveBeenCalled();
			expect(setMealPrices).not.toHaveBeenCalled();
		});

		it("resets hasHydratedSelectionStateRef to false when dialog closes", () => {
			const { params, hasHydratedSelectionStateRef } = buildParams({ open: false });
			(hasHydratedSelectionStateRef as unknown as { current: boolean }).current = true;

			renderHook(() => useInflightMealPrefill(params));

			expect(hasHydratedSelectionStateRef.current).toBe(false);
		});
	});

	describe("when open becomes true", () => {
		it("does not prefill when servicePassengers is empty", () => {
			const { params, setConfirmedMealIdsByPassenger } = buildParams({
				open: true,
				servicePassengers: [],
				passengers: [buildPassenger("p1", [{ serviceID: 1, lfid: LFID }])],
			});

			renderHook(() => useInflightMealPrefill(params));

			expect(setConfirmedMealIdsByPassenger).not.toHaveBeenCalled();
		});

		it("does not prefill when passengers is empty", () => {
			const { params, setConfirmedMealIdsByPassenger } = buildParams({
				open: true,
				servicePassengers: [buildServicePassenger("p1")],
				passengers: [],
			});

			renderHook(() => useInflightMealPrefill(params));

			expect(setConfirmedMealIdsByPassenger).not.toHaveBeenCalled();
		});

		it("does not prefill when passenger has no meal services for this direction", () => {
			const { params, setConfirmedMealIdsByPassenger, setSelectedMealsByPassenger, setMealPrices } =
				buildParams({
					open: true,
					servicePassengers: [buildServicePassenger("p1")],
					passengers: [buildPassenger("p1")], // no services
				});

			renderHook(() => useInflightMealPrefill(params));

			// Setters still called (with empty data from the loop)
			// But confirmed meal IDs will be empty objects
			expect(setConfirmedMealIdsByPassenger).toHaveBeenCalledWith({});
			expect(setSelectedMealsByPassenger).toHaveBeenCalledWith({});
			expect(setMealPrices).toHaveBeenCalledWith({});
		});

		it("does not prefill when passenger has meal services with non-matching lfid", () => {
			const { params, setConfirmedMealIdsByPassenger } = buildParams({
				open: true,
				servicePassengers: [buildServicePassenger("p1")],
				passengers: [buildPassenger("p1", [{ serviceID: 1, lfid: 999 }])], // lfid mismatch
			});

			renderHook(() => useInflightMealPrefill(params));

			expect(setConfirmedMealIdsByPassenger).toHaveBeenCalledWith({});
		});

		it("sets confirmed meal IDs when passenger has matching meal services", () => {
			const { params, setConfirmedMealIdsByPassenger } = buildParams({
				open: true,
				servicePassengers: [buildServicePassenger("p1")],
				passengers: [buildPassenger("p1", [{ serviceID: 1, lfid: LFID }])],
			});

			renderHook(() => useInflightMealPrefill(params));

			expect(setConfirmedMealIdsByPassenger).toHaveBeenCalledWith(
				expect.objectContaining({ p1: expect.arrayContaining(["1"]) })
			);
		});

		it("uses mealOptionNameById label for meal display", () => {
			const { params, setSelectedMealsByPassenger } = buildParams({
				open: true,
				servicePassengers: [buildServicePassenger("p1")],
				passengers: [buildPassenger("p1", [{ serviceID: 1, lfid: LFID }])],
			});

			renderHook(() => useInflightMealPrefill(params));

			const callArg = ((setSelectedMealsByPassenger as ReturnType<typeof vi.fn>).mock.calls[0] ??
				[])[0] as Record<string, SelectedMealLineItem[]>;
			const items: SelectedMealLineItem[] = callArg.p1 as SelectedMealLineItem[];
			expect(items.some((item) => item.label === "Chicken Meal")).toBe(true);
		});

		it("falls back to service description when mealOptionNameById has no entry", () => {
			const { params, setSelectedMealsByPassenger } = buildParams({
				open: true,
				servicePassengers: [buildServicePassenger("p1")],
				passengers: [buildPassenger("p1", [{ serviceID: 1, lfid: LFID }])],
				mealOptionNameById: {}, // no name mapping
			});

			renderHook(() => useInflightMealPrefill(params));

			const callArg = ((setSelectedMealsByPassenger as ReturnType<typeof vi.fn>).mock.calls[0] ??
				[])[0] as Record<string, SelectedMealLineItem[]>;
			const items: SelectedMealLineItem[] = callArg.p1 as SelectedMealLineItem[];
			// Falls back to description from service or mealId
			expect(items.some((item) => item.label === "Meal 1" || item.label === "1")).toBe(true);
		});

		it("sets meal prices based on line items", () => {
			const { params, setMealPrices } = buildParams({
				open: true,
				servicePassengers: [buildServicePassenger("p1")],
				passengers: [buildPassenger("p1", [{ serviceID: 1, lfid: LFID, amount: 1500 }])],
			});

			renderHook(() => useInflightMealPrefill(params));

			const callArg = ((setMealPrices as ReturnType<typeof vi.fn>).mock.calls[0] ??
				[])[0] as Record<string, number>;
			expect(typeof callArg.p1).toBe("number");
		});

		it("resets pending removals to empty object on prefill", () => {
			const { params, setPendingRemovalsByPassenger } = buildParams({
				open: true,
				servicePassengers: [buildServicePassenger("p1")],
				passengers: [buildPassenger("p1", [{ serviceID: 1, lfid: LFID }])],
			});

			renderHook(() => useInflightMealPrefill(params));

			expect(setPendingRemovalsByPassenger).toHaveBeenCalledWith({});
		});

		it("marks hasHydratedSelectionStateRef as true after successful prefill", () => {
			const { params, hasHydratedSelectionStateRef } = buildParams({
				open: true,
				servicePassengers: [buildServicePassenger("p1")],
				passengers: [buildPassenger("p1", [{ serviceID: 1, lfid: LFID }])],
			});

			renderHook(() => useInflightMealPrefill(params));

			expect(hasHydratedSelectionStateRef.current).toBe(true);
		});
	});

	describe("hydration guard", () => {
		it("does not run prefill again when already hydrated (ref=true)", () => {
			const { params, setConfirmedMealIdsByPassenger, hasHydratedSelectionStateRef } = buildParams({
				open: true,
				servicePassengers: [buildServicePassenger("p1")],
				passengers: [buildPassenger("p1", [{ serviceID: 1, lfid: LFID }])],
			});

			// Pre-set the ref to indicate already hydrated
			(hasHydratedSelectionStateRef as unknown as { current: boolean }).current = true;

			renderHook(() => useInflightMealPrefill(params));

			// setters should NOT be called because it's already hydrated
			expect(setConfirmedMealIdsByPassenger).not.toHaveBeenCalled();
		});

		it("re-runs prefill after dialog is closed and reopened", () => {
			const { params, setConfirmedMealIdsByPassenger } = buildParams({
				servicePassengers: [buildServicePassenger("p1")],
				passengers: [buildPassenger("p1", [{ serviceID: 1, lfid: LFID }])],
			});

			const { rerender } = renderHook(
				({ open }: { open: boolean }) => useInflightMealPrefill({ ...params, open }),
				{ initialProps: { open: false } }
			);

			// Open → prefill runs
			rerender({ open: true });
			expect(setConfirmedMealIdsByPassenger).toHaveBeenCalledTimes(1);

			// Close → ref resets
			rerender({ open: false });
			expect(params.hasHydratedSelectionStateRef.current).toBe(false);

			// Reopen → prefill runs again
			rerender({ open: true });
			expect(setConfirmedMealIdsByPassenger).toHaveBeenCalledTimes(2);
		});
	});

	describe("deduplication of meal IDs", () => {
		it("deduplicates meals with the same serviceID for a single passenger", () => {
			// Two services with the same ID: only one entry should appear
			const { params, setConfirmedMealIdsByPassenger } = buildParams({
				open: true,
				servicePassengers: [buildServicePassenger("p1")],
				passengers: [
					buildPassenger("p1", [
						{ serviceID: 1, lfid: LFID },
						{ serviceID: 1, lfid: LFID }, // duplicate
					]),
				],
			});

			renderHook(() => useInflightMealPrefill(params));

			const callArg = ((setConfirmedMealIdsByPassenger as ReturnType<typeof vi.fn>).mock.calls[0] ??
				[])[0] as Record<string, unknown>;
			expect(callArg.p1).toEqual(["1"]);
		});
	});

	describe("multiple passengers", () => {
		it("prefills all service passengers that have matching meal services", () => {
			const { params, setConfirmedMealIdsByPassenger } = buildParams({
				open: true,
				servicePassengers: [buildServicePassenger("p1"), buildServicePassenger("p2")],
				passengers: [
					buildPassenger("p1", [{ serviceID: 1, lfid: LFID }]),
					buildPassenger("p2", [{ serviceID: 2, lfid: LFID }]),
				],
			});

			renderHook(() => useInflightMealPrefill(params));

			const callArg = ((setConfirmedMealIdsByPassenger as ReturnType<typeof vi.fn>).mock.calls[0] ??
				[])[0] as Record<string, unknown>;
			expect(callArg.p1).toContain("1");
			expect(callArg.p2).toContain("2");
		});

		it("skips a service passenger whose id is not found in passengers array", () => {
			const { params, setConfirmedMealIdsByPassenger } = buildParams({
				open: true,
				servicePassengers: [buildServicePassenger("ghost")], // no matching passenger
				passengers: [buildPassenger("p1", [{ serviceID: 1, lfid: LFID }])],
			});

			renderHook(() => useInflightMealPrefill(params));

			const callArg = ((setConfirmedMealIdsByPassenger as ReturnType<typeof vi.fn>).mock.calls[0] ??
				[])[0] as Record<string, unknown>;
			// "ghost" is not a key because no matching passenger was found
			expect(callArg.ghost).toBeUndefined();
		});
	});
});
