/**
 * File: confirmation-meal.ts
 * Pure detection helper for inflight meal out-of-stock scenarios on the confirmation page and used for inflight meals customize screen.
 * All store mutations are performed by the caller (confirmation.tsx,customize.tsx).
 */

import type { NEXUZR004OffersAncillaryResponse } from "@repo/sdk";
import {
	extractAdultMeals,
	hasSufficientMealStock,
} from "@/modules/utils/helpers/customize/inflight-meals/inflight-meals.utils/inflight-meals.utils";
import type {
	MealAvailabilityActionResult,
	MealToRemove,
	UnavailableMealEntry,
} from "@/types/confirmation/confirmation.types";
import type { PassengerValues } from "@/types/passenger/passenger.type";

function getMealsForPassengerType(
	ancillaryData: NEXUZR004OffersAncillaryResponse | undefined,
	passengerTypeCode: string
): Array<{ ssrId: number; qtyAvailable: number }> {
	const entry = ancillaryData?.data?.servicesPerPassengerType?.find(
		(e) => e.passengerType === passengerTypeCode
	);
	if (!entry) return [];
	return (entry.categories ?? [])
		.flatMap((cat) => cat.specialServices ?? [])
		.map((s) => ({ ssrId: s.ssrId, qtyAvailable: s.qtyAvailable ?? 0 }));
}

/**
 * Detects which out-of-stock scenario applies based on the latest ancillary API response.
 * Priority: AC5 (bundle) > AC2/AC3 (all unavailable) > AC1 (specific meal gone) > AC4 (partial).
 */
export function detectMealAvailabilityIssue(params: {
	ancillaryData: NEXUZR004OffersAncillaryResponse | undefined;
	storedPassengers: PassengerValues[];
	orderedPassengerIds: string[];
	lfid: number;
	bundleIncludedMealCodesByPassengerId: Record<string, ReadonlySet<string>>;
}): MealAvailabilityActionResult {
	const {
		ancillaryData,
		storedPassengers,
		orderedPassengerIds,
		lfid,
		bundleIncludedMealCodesByPassengerId,
	} = params;

	// ── Check if bundle-included meal codes have sufficient combined stock for bundled passengers ──
	const bundledPassengers = Object.values(bundleIncludedMealCodesByPassengerId).filter(
		(codes) => codes.size > 0
	);
	const bundledPaxCount = bundledPassengers.length;
	const allBundleMealCodes = new Set<string>();
	for (const codes of bundledPassengers) {
		for (const code of codes) {
			allBundleMealCodes.add(code);
		}
	}

	if (!hasSufficientMealStock(ancillaryData, allBundleMealCodes, bundledPaxCount)) {
		return { type: "bundle-meal-unavailable" };
	}

	const availableAdultMeals = extractAdultMeals(ancillaryData).filter((m) => m.qtyAvailable > 0);

	// ── Check if No meals available at all for adults ────────────────────────
	if (availableAdultMeals.length === 0) {
		const mealsToRemove: MealToRemove[] = [];
		for (const passenger of storedPassengers) {
			for (const meal of passenger.services?.meals ?? []) {
				if (meal.lfid === lfid) {
					mealsToRemove.push({
						passengerId: passenger.id,
						lfid: meal.lfid,
						ssrCode: meal.ssrCode,
						serviceID: meal.serviceID,
					});
				}
			}
		}
		return {
			type: "all-meals-unavailable",
			hasExistingSelections: mealsToRemove.length > 0,
			mealsToRemove,
		};
	}

	// Build a lookup of available meal IDs → qty from the full adult meals (including qty=0 ones)
	const allAdultMeals = extractAdultMeals(ancillaryData);
	const availableMealQty: Record<string, number> = {};
	for (const meal of allAdultMeals) {
		availableMealQty[meal.id] = meal.qtyAvailable;
	}

	// Ordered passenger list (preserves booking order for reverse-removal logic)
	const orderedPassengers = orderedPassengerIds
		.map((id) => storedPassengers.find((p) => p.id === id))
		.filter((p): p is PassengerValues => p !== undefined);

	// ── Check if Selected meal no longer available or qty < selection count ──────
	// Group passengers who selected each meal on this lfid, in booking order
	const passengersByMealId: Record<string, PassengerValues[]> = {};
	for (const passenger of orderedPassengers) {
		for (const meal of passenger.services?.meals ?? []) {
			if (meal.lfid !== lfid) continue;
			const mealId = meal.serviceID.toString();
			if (!passengersByMealId[mealId]) passengersByMealId[mealId] = [];
			passengersByMealId[mealId].push(passenger);
		}
	}

	const unavailableMeals: UnavailableMealEntry[] = [];
	const ac1MealsToRemove: MealToRemove[] = [];

	for (const [mealId, passengerList] of Object.entries(passengersByMealId)) {
		const qty = availableMealQty[mealId];

		if (qty === undefined || qty === 0) {
			// check if All selections for this meal are cancelled
			for (const passenger of passengerList) {
				const meal = passenger.services?.meals?.find(
					(m) => m.lfid === lfid && m.serviceID.toString() === mealId
				);
				if (!meal) continue;
				ac1MealsToRemove.push({
					passengerId: passenger.id,
					lfid: meal.lfid,
					ssrCode: meal.ssrCode,
					serviceID: meal.serviceID,
				});
				unavailableMeals.push({
					passengerId: passenger.id,
					passengerName: `${passenger.firstName} ${passenger.lastName}`,
					mealName: meal.description,
				});
			}
		} else if (qty < passengerList.length) {
			// Reverse-order removal: last N passengers lose the meal
			const toRemoveCount = passengerList.length - qty;
			const toRemove = passengerList.slice(-toRemoveCount);
			for (const passenger of toRemove) {
				const meal = passenger.services?.meals?.find(
					(m) => m.lfid === lfid && m.serviceID.toString() === mealId
				);
				if (!meal) continue;
				ac1MealsToRemove.push({
					passengerId: passenger.id,
					lfid: meal.lfid,
					ssrCode: meal.ssrCode,
					serviceID: meal.serviceID,
				});
				unavailableMeals.push({
					passengerId: passenger.id,
					passengerName: `${passenger.firstName} ${passenger.lastName}`,
					mealName: meal.description,
				});
			}
		}
	}

	if (unavailableMeals.length > 0) {
		return { type: "selected-meal-unavailable", unavailableMeals, mealsToRemove: ac1MealsToRemove };
	}

	// ── Limited inventory — last N passengers of a type can't get any meal
	const affectedPassengerIds: string[] = [];
	const ac4MealsToRemove: MealToRemove[] = [];

	// Group ordered passengers by type code
	const passengersByType: Record<string, PassengerValues[]> = {};
	for (const passenger of orderedPassengers) {
		const typeCode = passenger.passengerTypeCode;
		if (!passengersByType[typeCode]) passengersByType[typeCode] = [];
		passengersByType[typeCode].push(passenger);
	}

	for (const [typeCode, typePassengers] of Object.entries(passengersByType)) {
		const typeMeals = getMealsForPassengerType(ancillaryData, typeCode);
		// Max qty across all meals for this type — if any meal can serve all, no one is unavailable
		const maxQtyAvailable = typeMeals.reduce((max, s) => Math.max(max, s.qtyAvailable), 0);
		const typeCount = typePassengers.length;

		if (maxQtyAvailable < typeCount) {
			const unavailableCount = typeCount - maxQtyAvailable;
			// Last N passengers in booking order for this type are unavailable
			const unavailablePassengers = typePassengers.slice(-unavailableCount);
			for (const passenger of unavailablePassengers) {
				affectedPassengerIds.push(passenger.id);
				for (const meal of passenger.services?.meals ?? []) {
					if (meal.lfid === lfid) {
						ac4MealsToRemove.push({
							passengerId: passenger.id,
							lfid: meal.lfid,
							ssrCode: meal.ssrCode,
							serviceID: meal.serviceID,
						});
					}
				}
			}
		}
	}

	if (affectedPassengerIds.length > 0) {
		return {
			type: "partial-meals-unavailable",
			affectedPassengerIds,
			mealsToRemove: ac4MealsToRemove,
		};
	}

	return { type: "noop" };
}
