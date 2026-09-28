/**
 * File: inflight-meals.utils.ts
 * Description: Utility functions for mapping the NEXUZR004 ancillary offers API
 * response to inflight meals UI models. Extracts only the adult passenger entry
 * and combines In-Flight Meals and Drinks special services into a single
 * MealListOption array consumed by the meal list grid and category filter chips.
 */

import type { NEXUZR004OffersAncillaryResponse, NEXUZR004OffersSpecialService } from "@repo/sdk";
import cokeImage from "@/assets/images/coke.png";
import meal1 from "@/assets/images/meal1.png";
import meal2 from "@/assets/images/meal2.png";
import meal3 from "@/assets/images/meal3.png";
import meal4 from "@/assets/images/meal4.png";
import {
	isPremiumBundleCode,
	isValueBundleCode,
	normalizeServiceCode,
} from "@/modules/utils/helpers/common/bundle-code-check/bundle-code-check.utils";
import {
	STATIC_ALLERGIES,
	STATIC_NUTRITION,
} from "@/modules/utils/helpers/customize/inflight-meals/inflight-meal-selection.utils/inflight-meal-selection.utils";
import type {
	MealListOption,
	MealSelectionDialogProps,
} from "@/types/customize/inflight-meals/inflight-meals.types";
import type { PassengerService } from "@/types/passenger/passenger.type";

//......... Constants ..................//
export const INFLIGHT_MEAL_CATEGORY_TITLE = "In-Flight Meals";
export const DRINKS_CATEGORY_TITLE = "Drinks";

const BUNDLE_MEALS_CATEGORY = "MEALS";

const MEAL_IMAGES = [meal1.src, meal2.src, meal3.src, meal4.src];

/** Fallback image shown for all meal and drink cards (API does not return image URLs). */
export const PLACEHOLDER_MEAL_IMAGE = meal1.src;

//......... Field Mapping: SpecialService → MealListOption ..................//
/**
 * Maps a single NEXUZR004OffersSpecialService to a MealListOption.
 *
 * API field          → UI field
 * service.ssrId      → id       (unique identifier as string)
 * service.description→ name     (dish/drink name displayed on card)
 * service.amount     → price    (raw number; currency display handled by component)
 * PLACEHOLDER_IMAGE  → imageSrc (API returns no image URLs)
 * qtyAvailable     → qtyAvailable / remainingQty (raw initial stock for later derived UI state)
 * category param     → category (drives "All / Meals / Drink" filter chip behaviour)
 */
export const mapSpecialServiceToMealListOption = (
	service: NEXUZR004OffersSpecialService,
	category: "meals" | "drink",
	bundleIncludedMealCodes?: ReadonlySet<string>
): MealListOption => {
	const serviceCode = normalizeServiceCode(service.ssrCode);
	const isBundleIncludedMeal =
		category === "meals" &&
		bundleIncludedMealCodes !== undefined &&
		bundleIncludedMealCodes.has(serviceCode);

	const imageSrc =
		category === "drink"
			? cokeImage.src
			: (MEAL_IMAGES[service.ssrId % MEAL_IMAGES.length] ?? meal1.src);

	return {
		id: service.ssrId.toString(),
		name: service.description,
		imageSrc,
		price: isBundleIncludedMeal ? 0 : service.amount,
		originalPrice: isBundleIncludedMeal ? service.amount : undefined,
		bundleLabel: isBundleIncludedMeal ? "Bundle" : undefined,
		qtyAvailable: service.qtyAvailable,
		remainingQty: service.qtyAvailable,
		category,
	};
};

export function buildMealDetailsMap(
	meals: MealListOption[],
	passengerName: string,
	routeLabel: string
): Record<string, Omit<MealSelectionDialogProps, "trigger" | "open" | "onOpenChange">> {
	return Object.fromEntries(
		meals.map((meal) => [
			meal.id,
			{
				passengerName,
				routeLabel,
				imageSrc: meal.imageSrc,
				dishName: meal.name,
				bundleLabel: meal.bundleLabel,
				originalPrice: meal.originalPrice,
				price: meal.price,
				remainingQty: meal.remainingQty,
				stockLabel: meal.stockLabel,
				isOutOfStock: meal.isOutOfStock,
				allergies: STATIC_ALLERGIES,
				nutrition: STATIC_NUTRITION,
				drinkOptions: [], // Set drink — not in scope
				deliveryTimingOptions: [], // Timing of delivery — not in scope
			},
		])
	);
}

//......... Extract Adult Meals and Drinks ..................//
/**
 * Extracts In-Flight Meals and Drinks special services for the adult passenger
 * type and returns them as a combined MealListOption array.
 *
 * - Ignores all non-adult passenger types (childA, childB, childC, infant).
 * - Ignores all non-meal/drink categories (e.g. Meal Handling, Meal Delivery Time).
 * - Returns [] when data is undefined or the adult entry is absent.
 * - Meals are placed before drinks in the returned array.
 */
export const extractAdultMeals = (
	data: NEXUZR004OffersAncillaryResponse | undefined,
	options?: {
		bundleIncludedMealCodes?: ReadonlySet<string>;
	}
): MealListOption[] => {
	if (!data?.data?.servicesPerPassengerType) {
		return [];
	}

	const adultEntry = data.data.servicesPerPassengerType.find(
		(entry) => entry.passengerType === "adult"
	);

	if (!adultEntry) {
		return [];
	}

	const mealCategory = adultEntry.categories.find(
		(cat) => cat.title === INFLIGHT_MEAL_CATEGORY_TITLE
	);

	const drinkCategory = adultEntry.categories.find((cat) => cat.title === DRINKS_CATEGORY_TITLE);

	const mealItems = (mealCategory?.specialServices ?? []).map((service) =>
		mapSpecialServiceToMealListOption(service, "meals", options?.bundleIncludedMealCodes)
	);

	const drinkItems = (drinkCategory?.specialServices ?? []).map((service) =>
		mapSpecialServiceToMealListOption(service, "drink")
	);

	return [...mealItems, ...drinkItems];
};

//......... Meal Service Lookup ..................//

export type MealServiceEntry = {
	service: NEXUZR004OffersSpecialService;
	categoryId: number;
	passengerType: string;
};

/**
 * Builds a lookup map keyed by ssrId (as string) → MealServiceEntry.
 * Covers only "In-Flight Meals" and "Drinks" categories across all passenger types.
 * Used in InflightMealsDialog to build a PassengerService when dispatching to Redux.
 */
export const extractMealServiceLookup = (
	data: NEXUZR004OffersAncillaryResponse | undefined
): Record<string, MealServiceEntry> => {
	const lookup: Record<string, MealServiceEntry> = {};

	if (!data?.data?.servicesPerPassengerType) {
		return lookup;
	}

	for (const entry of data.data.servicesPerPassengerType) {
		for (const category of entry.categories) {
			if (
				category.title === INFLIGHT_MEAL_CATEGORY_TITLE ||
				category.title === DRINKS_CATEGORY_TITLE
			) {
				for (const service of category.specialServices) {
					lookup[service.ssrId.toString()] = {
						service,
						categoryId: category.categoryId,
						passengerType: entry.passengerType,
					};
				}
			}
		}
	}

	return lookup;
};

/**
 * Maps a MealServiceEntry to a PassengerService ready for Redux dispatch.
 * Fields not present in the ancillary API (chargeComment, bundleCode) default to "".
 */
export const toPassengerService = (entry: MealServiceEntry): PassengerService => ({
	lfid: entry.service.lfid,
	pfid: entry.service.pfid ?? 0,
	amount: entry.service.amount,
	categoryId: entry.categoryId,
	cutOffHours: entry.service.cutOffHours,
	description: entry.service.description,
	maxCountServiceLevel: entry.service.maxCountServiceLevel,
	passengerType: entry.passengerType,
	qtyAvailable: entry.service.qtyAvailable,
	ssrCode: entry.service.ssrCode,
	serviceID: entry.service.ssrId,
	chargeComment: "",
	bundleCode: "",
});

export const getBundleIncludedMealCodes = (
	bundleCategories: Array<{
		category?: string;
		services?: Array<{ code?: string }>;
	}> = []
): Set<string> => {
	const includedCodes = new Set<string>();

	for (const category of bundleCategories) {
		if (category.category?.trim().toUpperCase() !== BUNDLE_MEALS_CATEGORY) {
			continue;
		}

		for (const service of category.services ?? []) {
			if (!service.code) {
				continue;
			}
			includedCodes.add(normalizeServiceCode(service.code));
		}
	}

	return includedCodes;
};

// Builds a map of passenger IDs to bundle-included meal codes for the selected direction, excluding ICN Value Bundle passengers.
export const buildBundleIncludedMealCodesByPassengerId = ({
	passengers,
	directionSegmentLfids,
	servicePassengers = [],
}: {
	passengers: Array<{
		id: string;
		bundles?: Array<{
			lfid: number;
			bundleCategory?: {
				categories?: Array<{ category?: string; services?: Array<{ code?: string }> }>;
			};
		}>;
	}>;
	directionSegmentLfids: ReadonlySet<number>;
	servicePassengers?: Array<{ id: string; isIcnRoute?: boolean; isValueBundle?: boolean }>;
}): Record<string, ReadonlySet<string>> => {
	const servicePassengerById = Object.fromEntries(
		servicePassengers.map((passenger) => [passenger.id, passenger])
	);

	return Object.fromEntries(
		passengers.map((passenger) => {
			const servicePassenger = servicePassengerById[passenger.id];
			if (servicePassenger?.isIcnRoute && servicePassenger.isValueBundle) {
				return [passenger.id, new Set<string>()];
			}

			const includedMealCodes = new Set<string>();
			const passengerBundles = (passenger.bundles ?? []).filter((bundle) =>
				directionSegmentLfids.has(bundle.lfid)
			);

			for (const bundle of passengerBundles) {
				const bundleIncludedCodes = getBundleIncludedMealCodes(bundle.bundleCategory?.categories);

				for (const code of bundleIncludedCodes) {
					includedMealCodes.add(code);
				}
			}

			return [passenger.id, includedMealCodes];
		})
	);
};

/** Returns false when combined available qty for bundle meal codes is less than the bundled passenger count. */
export const hasSufficientMealStock = (
	ancillaryData: NEXUZR004OffersAncillaryResponse | undefined,
	bundleMealCodes: ReadonlySet<string>,
	bundledPaxCount: number
): boolean => {
	if (bundledPaxCount === 0 || bundleMealCodes.size === 0) {
		return true;
	}

	const adultEntry = ancillaryData?.data?.servicesPerPassengerType?.find(
		(entry) => entry.passengerType === "adult"
	);

	if (!adultEntry) {
		return true;
	}

	const mealCategory = adultEntry.categories?.find(
		(cat) => cat.title === INFLIGHT_MEAL_CATEGORY_TITLE
	);

	let totalAvailable = 0;
	for (const service of mealCategory?.specialServices ?? []) {
		if (bundleMealCodes.has(normalizeServiceCode(service.ssrCode))) {
			totalAvailable += service.qtyAvailable ?? 0;
		}
	}
	return totalAvailable >= bundledPaxCount;
};

export const isInflightMealStockLimited = ({
	ancillaryData,
	bundledMealPassengerCount,
	direction,
	confirmedFlight,
	servicePassengers,
	isICNRoute,
	passengersWithBundles,
}: {
	ancillaryData: NEXUZR004OffersAncillaryResponse | undefined;
	bundledMealPassengerCount: number;
	direction: string;
	confirmedFlight: {
		flights: {
			outbound: { segments: Array<{ lfid: number }> };
			inbound?: { segments: Array<{ lfid: number }> } | null;
		};
	};
	servicePassengers: Array<{ id: string; bundleCode: string }>;
	isICNRoute: boolean;
	passengersWithBundles: Array<{
		id: string;
		bundles?: Array<{
			lfid: number;
			bundleCategory?: {
				categories?: Array<{ category?: string; services?: Array<{ code?: string }> }>;
			};
		}>;
	}>;
}): boolean => {
	if (bundledMealPassengerCount === 0) return false;

	const directionSegments =
		direction === "outbound"
			? confirmedFlight.flights.outbound.segments
			: (confirmedFlight.flights.inbound?.segments ?? []);
	const directionSegmentLfids = new Set(directionSegments.map((s) => s.lfid));

	const bundledPassengerIds = new Set(
		servicePassengers
			.filter((sp) =>
				isICNRoute
					? isPremiumBundleCode(sp.bundleCode)
					: isValueBundleCode(sp.bundleCode) || isPremiumBundleCode(sp.bundleCode)
			)
			.map((sp) => sp.id)
	);

	const bundleIncludedMealCodesByPassengerId = buildBundleIncludedMealCodesByPassengerId({
		passengers: passengersWithBundles,
		directionSegmentLfids,
		servicePassengers: servicePassengers.map((passenger) => ({
			id: passenger.id,
			isIcnRoute: isICNRoute,
			isValueBundle: isValueBundleCode(passenger.bundleCode),
		})),
	});
	const allBundleMealCodes = new Set<string>();
	for (const passengerId of bundledPassengerIds) {
		for (const code of bundleIncludedMealCodesByPassengerId[passengerId] ?? []) {
			allBundleMealCodes.add(code);
		}
	}

	return !hasSufficientMealStock(ancillaryData, allBundleMealCodes, bundledMealPassengerCount);
};
