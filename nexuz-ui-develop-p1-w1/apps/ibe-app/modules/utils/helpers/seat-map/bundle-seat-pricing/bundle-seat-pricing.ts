/**
 * seat-bundle.utils.ts
 *
 * Utility functions for retrieving bundle-based seat service codes and
 * calculating seat pricing and legend mappings for the seat map experience.
 */

import { STANDARD_LEGEND_SERVICE_CODES } from "@/modules/utils/constants/seat-map/seat-map.constants";
import type { PassengerBundle } from "@/types/passenger/passenger.type";
import type { BundleSeatPrice, LegendItemId } from "@/types/seat-map/seat-map.types";

/**
 * Checks whether a bundle category represents a seat category.
 * Comparison is case-insensitive and ignores extra whitespace.
 */
function isSeatCategory(category: string | undefined): boolean {
	return category?.trim().toUpperCase() === "SEAT";
}

/**
 * Retrieves all seat service codes available through a passenger's bundles.
 * Optionally filters bundle data for a specific flight (LFID).
 */
export function getBundleSeatServiceCodes(
	passenger: { bundles?: PassengerBundle[] },
	lfid?: number
): ReadonlySet<string> {
	const codes = new Set<string>();

	for (const bundle of passenger.bundles ?? []) {
		if (lfid !== undefined && bundle.lfid !== lfid) {
			continue;
		}

		for (const category of bundle.bundleCategory?.categories ?? []) {
			if (!isSeatCategory(category.category)) {
				continue;
			}

			for (const service of category.services ?? []) {
				if (service.code) {
					codes.add(service.code);
				}
			}
		}
	}

	return codes;
}

export function getBundleSeatPrice({
	amount,
	serviceCode,
	bundleSeatServiceCodes,
}: {
	amount: number;
	serviceCode?: string;
	bundleSeatServiceCodes: ReadonlySet<string>;
}): BundleSeatPrice {
	const isBundleIncluded = !!serviceCode && bundleSeatServiceCodes.has(serviceCode);

	return {
		originalAmount: amount,
		effectiveAmount: isBundleIncluded ? 0 : amount,
		isBundleIncluded,
	};
}

/**
 * Resolves the service code associated with a seat legend item.
 * Applies cabin-specific mappings and selected seat handling.
 */
export function getSeatLegendServiceCode({
	itemId,
	cabinClass,
	selectedServiceCode,
}: {
	itemId: LegendItemId;
	cabinClass: "Standard" | "ZipFullFlat";
	selectedServiceCode?: string;
}): string | undefined {
	if (itemId === "selected") {
		return selectedServiceCode;
	}

	if (itemId === "not-selectable") {
		return undefined;
	}

	if (itemId === "central-seat" && cabinClass === "ZipFullFlat") {
		return "STZF";
	}

	return STANDARD_LEGEND_SERVICE_CODES[itemId];
}
