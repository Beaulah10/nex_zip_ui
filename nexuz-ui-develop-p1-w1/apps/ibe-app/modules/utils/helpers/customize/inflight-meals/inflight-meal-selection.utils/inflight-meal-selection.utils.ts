/**
 * File: inflight-meal-selection.utils.ts
 * Description: Utility functions and constants used by the inflight meals
 * customization flow. Provides bundle eligibility checks, stock status handling,
 * mandatory meal validation, pricing recalculation logic, and shared meal-related
 * metadata used throughout meal selection and validation workflows.
 */

import { BUNDLE_CODES } from "@/modules/utils/constants/bundle-codes/bundle-codes.constants";
import {
	isPremiumBundleCode,
	isValueBundleCode,
	normalizeServiceCode,
} from "@/modules/utils/helpers/common/bundle-code-check/bundle-code-check.utils";
import type { MealServiceMap } from "@/types/customize/inflight-meals/inflight-meal-hooks.types";
import type { SelectedMealLineItem } from "@/types/customize/inflight-meals/inflight-meals.types";

export { BUNDLE_CODES, isPremiumBundleCode, isValueBundleCode, normalizeServiceCode };

export const formatMealSelectedText = (count: number): string | undefined => {
	if (count <= 0) {
		return undefined;
	}

	return count === 1 ? "meal_selected_one" : "meal_selected_many";
};

export const formatRequiredMealSelectionText = (count: number): string | undefined => {
	if (count <= 0) {
		return undefined;
	}

	return count === 1 ? "free_meal_selection_required_one" : "free_meal_selection_required_many";
};

// Static allergy and nutritional info shown for every meal and drink card detail view
export const STATIC_ALLERGIES = "Soba, shrimp, wheat";
export const STATIC_NUTRITION = "Salt: 3.0g, Carbohydrates: 52.2g, Energy: 295kcal";

export const formatStockLabel = (remainingQty: number): string | undefined => {
	if (remainingQty === 0) {
		return "out_of_stock";
	}

	if (remainingQty < 10) {
		return "remaining_quantity";
	}

	return undefined;
};

export const isICNValueMealExceptionPassenger = ({
	bundleCode,
	isIcnRoute,
}: {
	bundleCode: string;
	isIcnRoute: boolean;
}): boolean => isValueBundleCode(bundleCode) && isIcnRoute;

// Returns true if a passenger has a bundle that mandates meal selection (Value or Premium).
export const isMandatoryMealPassenger = ({
	bundleCode,
	isIcnRoute,
}: {
	bundleCode: string;
	isIcnRoute: boolean;
}): boolean => {
	if (isPremiumBundleCode(bundleCode)) {
		return true;
	}

	if (!isValueBundleCode(bundleCode)) {
		return false;
	}

	return !isICNValueMealExceptionPassenger({ bundleCode, isIcnRoute });
};

// Recalculates one passenger's selected meal line-item prices, keeping only the highest-priced
// bundle-eligible meal free and returning the count used to drive warning visibility.
export function recalculatePassengerMealItems({
	currentMeals,
	bundleIncludedMealCodes,
	mealServiceMap,
}: {
	currentMeals: SelectedMealLineItem[];
	bundleIncludedMealCodes?: ReadonlySet<string>;
	mealServiceMap: MealServiceMap;
}): {
	lineItems: SelectedMealLineItem[];
	bundleEligibleSelectedCount: number;
} {
	const enrichedMeals = currentMeals.map((meal, index) => {
		const entry = mealServiceMap[meal.mealId];
		const basePrice = entry?.service.amount ?? meal.price;
		const serviceCode = entry?.service.ssrCode
			? normalizeServiceCode(entry.service.ssrCode)
			: undefined;
		const isBundleEligible =
			serviceCode !== undefined && bundleIncludedMealCodes?.has(serviceCode) === true;

		return {
			meal,
			index,
			basePrice,
			isBundleEligible,
		};
	});

	const bundleEligibleMeals = enrichedMeals.filter((item) => item.isBundleEligible);

	let freeMealIndex: number | null = null;
	for (const item of bundleEligibleMeals) {
		if (freeMealIndex === null) {
			freeMealIndex = item.index;
			continue;
		}

		const currentFree = enrichedMeals[freeMealIndex];
		if (currentFree && item.basePrice > currentFree.basePrice) {
			freeMealIndex = item.index;
		}
	}

	const lineItems = enrichedMeals.map((item) => ({
		...item.meal,
		price: item.isBundleEligible && item.index === freeMealIndex ? 0 : item.basePrice,
	}));

	return {
		lineItems,
		bundleEligibleSelectedCount: bundleEligibleMeals.length,
	};
}
