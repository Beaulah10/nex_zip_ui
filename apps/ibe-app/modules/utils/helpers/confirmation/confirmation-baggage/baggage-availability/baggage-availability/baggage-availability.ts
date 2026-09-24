/**
 * File: baggage-availability.ts
 * Pure detection helper for confirmation baggage stock-shortage scenarios.
 * It compares stored baggage selections with the latest ancillary API response
 * and returns the updated baggage state for affected passengers.
 */

import {
	BAGGAGE_CATEGORIES,
	type BaggageCategories,
	bundleCodeToBundleIdMap,
	SPORTS_EQUIPMENT_MAP,
} from "@/modules/utils/constants/baggage-service/baggage-selection-constants";
import { BAGGAGE_INVENTORY_TYPE } from "@/modules/utils/constants/confirmation/confirmation.constants";
import { isBundledBaggageOutOfStock } from "@/modules/utils/helpers/baggage-service/baggage-inventory/baggage-inventory";
import type { getBaggageOffersByPassengerType } from "@/modules/utils/helpers/baggage-service/baggage-offers/baggage-offers";
import { buildPassengerWithBaggageSelection } from "@/modules/utils/helpers/baggage-service/build-baggage-selection/build-baggage-selection";
import type {
	BaggageOffersByPTCType,
	PassengerBaggageSelectionMap,
	PassengerBaggageServices,
	ServicePassenger,
} from "@/types/baggage-selection/baggage-selection.types";
import type {
	BaggageAvailabilityActionResult,
	BaggageSelectionEntry,
	BundleBaggageInventoryValidationResult,
	UnavailableBaggageEntry,
} from "@/types/confirmation/confirmation.types";
import type { BundleCode, PassengerValues } from "@/types/passenger/passenger.type";
export type ConfirmationBaggageInventoryResolution =
	| {
			type: typeof BAGGAGE_INVENTORY_TYPE.AVAILABLE;
			baggageSelectionsByPassengerId: PassengerBaggageSelectionMap;
	  }
	| {
			type: typeof BAGGAGE_INVENTORY_TYPE.NO_BUNDLE_OUT_OF_STOCK;
			baggageSelectionsByPassengerId: PassengerBaggageSelectionMap;
			disabledPassengerIds: string[];
	  }
	| {
			type: typeof BAGGAGE_INVENTORY_TYPE.BUNDLE_OUT_OF_STOCK;
			baggageSelectionsByPassengerId: PassengerBaggageSelectionMap;
	  }
	| {
			type: typeof BAGGAGE_INVENTORY_TYPE.SELECTED_BAGGAGE_UNAVAILABLE;
			baggageSelectionsByPassengerId: PassengerBaggageSelectionMap;
			unavailableBaggage: UnavailableBaggageEntry[];
			updatedBaggageServicesByPassengerId: Record<string, PassengerBaggageServices>;
			firstAffectedPassengerId: string | null;
	  };

// Reads the available inventory quantity for a baggage SSR from the latest offers response.
function getAvailableBaggageQuantity({
	baggageOffersByPassengerType,
	ssrCode,
	category,
}: {
	baggageOffersByPassengerType: Record<string, BaggageOffersByPTCType>;
	ssrCode: string;
	category: BaggageCategories;
}) {
	const offers = baggageOffersByPassengerType.adult;
	let availableQty = 0;
	if (category === BAGGAGE_CATEGORIES.CARRY_ON) {
		availableQty = offers?.categories.carryOn[ssrCode]?.qtyAvailable ?? 0;
	} else if (category === BAGGAGE_CATEGORIES.CHECKED_IN) {
		availableQty = offers?.categories.checkedIn[ssrCode]?.qtyAvailable ?? 0;
	} else if (category === BAGGAGE_CATEGORIES.SPORTS) {
		availableQty = offers?.categories.sportsEquipment[ssrCode]?.qtyAvailable ?? 0;
	}
	return availableQty;
}

// Flattens passenger baggage selections into inventory-comparable entry records.
function buildBaggageEntries(
	baggageSelectionsByPassengerId: PassengerBaggageSelectionMap,
	orderedPassengerIds: string[]
): BaggageSelectionEntry[] {
	const entries: BaggageSelectionEntry[] = [];

	for (const passengerId of orderedPassengerIds) {
		const selection = baggageSelectionsByPassengerId[passengerId];

		if (!selection) {
			continue;
		}

		const { passenger, baggageServices } = selection;
		const passengerName = passenger.name;

		for (const service of Object.values(baggageServices.carryOn)) {
			const baggageName = "select_carry_on_baggage_15kg";
			entries.push({
				passengerId,
				passengerName,
				ssrCode: service.ssrCode,
				baggageName: baggageName,
				category: BAGGAGE_CATEGORIES.CARRY_ON,
			});
		}

		for (const { service, quantity } of Object.values(baggageServices.checkedIn)) {
			const baggageName = "passenger_list_checked_in_baggage";
			for (let index = 0; index < quantity; index += 1) {
				entries.push({
					passengerId,
					passengerName,
					ssrCode: service.ssrCode,
					baggageName: baggageName,
					category: BAGGAGE_CATEGORIES.CHECKED_IN,
				});
			}
		}

		for (const { service, quantity } of Object.values(baggageServices.sportsEquipment)) {
			const baggageName = SPORTS_EQUIPMENT_MAP.find(
				(item) => item.ssrCode === service.ssrCode
			)?.label;
			for (let index = 0; index < quantity; index += 1) {
				entries.push({
					passengerId,
					passengerName,
					ssrCode: service.ssrCode,
					baggageName: baggageName ?? "passenger_list_sports_equipment",
					category: BAGGAGE_CATEGORIES.SPORTS,
				});
			}
		}
	}

	return entries;
}

// Groups flattened baggage entries by inventory key so stock can be compared per SSR and category.
function buildEntriesByInventoryKey(entries: BaggageSelectionEntry[]) {
	const entriesByInventoryKey = new Map<string, BaggageSelectionEntry[]>();

	for (const entry of entries) {
		const inventoryKey = `${entry.category}:${entry.ssrCode}`;

		const currentEntries = entriesByInventoryKey.get(inventoryKey) ?? [];

		currentEntries.push(entry);

		entriesByInventoryKey.set(inventoryKey, currentEntries);
	}

	return entriesByInventoryKey;
}

// Creates a mutable clone of each passenger baggage selection for availability adjustments.
function cloneBaggageServices(
	baggageSelectionsByPassengerId: PassengerBaggageSelectionMap
): Record<string, ReturnType<typeof buildPassengerServicesClone>> {
	return Object.fromEntries(
		Object.entries(baggageSelectionsByPassengerId).map(([passengerId, selection]) => [
			passengerId,
			buildPassengerServicesClone(selection.baggageServices),
		])
	);
}

// Clones a passenger's baggage services so selection updates do not mutate original state.
function buildPassengerServicesClone(
	baggageServices: PassengerBaggageSelectionMap[string]["baggageServices"]
) {
	return {
		carryOn: { ...baggageServices.carryOn },
		checkedIn: Object.fromEntries(
			Object.entries(baggageServices.checkedIn).map(([ssrCode, value]) => [
				ssrCode,
				{ service: value.service, quantity: value.quantity },
			])
		),
		sportsEquipment: Object.fromEntries(
			Object.entries(baggageServices.sportsEquipment).map(([ssrCode, value]) => [
				ssrCode,
				{ service: value.service, quantity: value.quantity },
			])
		),
	};
}

// Removes one quantity-based baggage selection entry from a cloned service map.
function removeQuantityBasedSelection<T extends { quantity: number }>({
	services,
	ssrCode,
}: {
	services: Record<string, T>;
	ssrCode: string;
}) {
	const entry = services[ssrCode];

	if (!entry) {
		return;
	}

	if (entry.quantity <= 1) {
		delete services[ssrCode];
		return;
	}

	entry.quantity -= 1;
}

// Removes an unavailable baggage entry from cloned services and records it for the error state.
function removeEntryFromUpdatedServices({
	entry,
	updatedBaggageServicesByPassengerId,
	unavailableBaggage,
}: {
	entry: BaggageSelectionEntry;
	updatedBaggageServicesByPassengerId: Record<
		string,
		ReturnType<typeof buildPassengerServicesClone>
	>;
	unavailableBaggage: UnavailableBaggageEntry[];
}) {
	const updatedServices = updatedBaggageServicesByPassengerId[entry.passengerId];
	if (!updatedServices) {
		return;
	}
	if (entry.category === BAGGAGE_CATEGORIES.CARRY_ON) {
		updatedServices.carryOn = {};
	}

	if (entry.category === BAGGAGE_CATEGORIES.CHECKED_IN) {
		removeQuantityBasedSelection({
			services: updatedServices.checkedIn,
			ssrCode: entry.ssrCode,
		});
	}

	if (entry.category === BAGGAGE_CATEGORIES.SPORTS) {
		removeQuantityBasedSelection({
			services: updatedServices.sportsEquipment,
			ssrCode: entry.ssrCode,
		});
	}

	unavailableBaggage.push({
		passengerId: entry.passengerId,
		passengerName: entry.passengerName,
		baggageName: entry.baggageName,
	});
}

// Detects which stored baggage selections are no longer available in the latest inventory response.
export function detectBaggageAvailabilityIssue({
	baggageSelectionsByPassengerId,
	orderedPassengerIds,
	baggageOffersByPassengerType,
}: {
	baggageSelectionsByPassengerId: PassengerBaggageSelectionMap;
	orderedPassengerIds: string[];
	baggageOffersByPassengerType: Record<string, BaggageOffersByPTCType>;
}): BaggageAvailabilityActionResult {
	const selectedEntries = buildBaggageEntries(baggageSelectionsByPassengerId, orderedPassengerIds);
	const entriesByInventoryKey = buildEntriesByInventoryKey(selectedEntries);
	const updatedBaggageServicesByPassengerId = cloneBaggageServices(baggageSelectionsByPassengerId);
	const unavailableBaggage: UnavailableBaggageEntry[] = [];
	for (const entries of entriesByInventoryKey.values()) {
		const firstEntry = entries[0];

		if (!firstEntry) {
			continue;
		}

		const availableQty = getAvailableBaggageQuantity({
			baggageOffersByPassengerType,
			ssrCode: firstEntry.ssrCode,
			category: firstEntry.category,
		});
		if (availableQty >= entries.length) {
			continue;
		}

		const entriesToRemove = entries.slice(Math.max(availableQty, 0));
		for (const entry of entriesToRemove) {
			removeEntryFromUpdatedServices({
				entry,
				updatedBaggageServicesByPassengerId,
				unavailableBaggage,
			});
		}
	}

	if (unavailableBaggage.length === 0) {
		return { type: "noop" };
	}

	return {
		type: BAGGAGE_INVENTORY_TYPE.SELECTED_BAGGAGE_UNAVAILABLE,
		unavailableBaggage,
		updatedBaggageServicesByPassengerId,
	};
}

// Validates whether bundle-included and no-bundle baggage inventory is still purchasable.
export const validateBaggageInventoryOutOfStock = ({
	passengers,
	baggageOffersByPassengerType,
}: {
	passengers: ServicePassenger[];
	baggageOffersByPassengerType: ReturnType<typeof getBaggageOffersByPassengerType>;
}): BundleBaggageInventoryValidationResult => {
	const categories = baggageOffersByPassengerType.adult?.categories;
	const cabnQty = getAvailableBaggageQuantity({
		baggageOffersByPassengerType,
		ssrCode: "CABN",
		category: BAGGAGE_CATEGORIES.CARRY_ON,
	});
	const bagnQty = getAvailableBaggageQuantity({
		baggageOffersByPassengerType,
		ssrCode: "BAGN",
		category: BAGGAGE_CATEGORIES.CHECKED_IN,
	});
	const sportsItems = Object.values(categories?.sportsEquipment ?? {});
	const areAllSportsUnavailable =
		sportsItems.length === 0 || sportsItems.every((item) => (item.qtyAvailable ?? 0) <= 0);
	const bundleIds = passengers.map(
		(passenger) => bundleCodeToBundleIdMap[passenger.bundleCode as BundleCode]
	);
	const areAllPassengersNoBundle =
		bundleIds.length > 0 && bundleIds.every((bundleId) => bundleId === "NONE");
	if (areAllPassengersNoBundle && cabnQty <= 0 && bagnQty <= 0 && areAllSportsUnavailable) {
		return {
			isValid: false,
			type: "no-bundle-out-of-stock",
			reason: "All baggage inventory is unavailable for No Bundle passengers.",
		};
	}
	const bundledBaggageAvailability = isBundledBaggageOutOfStock({
		passengers,
		availableCabnQty: cabnQty,
		availableBagnQty: bagnQty,
	});

	if (!bundledBaggageAvailability.isValid) {
		return {
			isValid: false,
			type: "bundle-out-of-stock",
			reason: "Bundle-included baggage inventory is unavailable.",
		};
	}

	return {
		isValid: true,
		type: "available",
	};
};

// Resolves the single inventory outcome used by the confirmation baggage flow.
export function resolveConfirmationBaggageInventory({
	passengerList,
	servicePassengers,
	currentLfid,
	orderedPassengerIds,
	baggageOffersByPassengerType,
}: {
	passengerList: PassengerValues[];
	servicePassengers: ServicePassenger[];
	currentLfid: number;
	orderedPassengerIds: string[];
	baggageOffersByPassengerType: Record<string, BaggageOffersByPTCType>;
}): ConfirmationBaggageInventoryResolution {
	const baggageSelectionsByPassengerId = buildPassengerWithBaggageSelection({
		passengerList,
		selectedBundlePassengers: servicePassengers,
		serviceCategory: "baggage",
		currentLfid,
		baggageOffersByPassengerType,
	});

	const inventoryValidation = validateBaggageInventoryOutOfStock({
		passengers: servicePassengers,
		baggageOffersByPassengerType,
	});

	if (!inventoryValidation.isValid) {
		if (inventoryValidation.type === BAGGAGE_INVENTORY_TYPE.NO_BUNDLE_OUT_OF_STOCK) {
			return {
				type: BAGGAGE_INVENTORY_TYPE.NO_BUNDLE_OUT_OF_STOCK,
				baggageSelectionsByPassengerId,
				disabledPassengerIds: servicePassengers.map((passenger) => passenger.id),
			};
		}

		return {
			type: BAGGAGE_INVENTORY_TYPE.BUNDLE_OUT_OF_STOCK,
			baggageSelectionsByPassengerId,
		};
	}

	const baggageIssue = detectBaggageAvailabilityIssue({
		baggageSelectionsByPassengerId,
		orderedPassengerIds,
		baggageOffersByPassengerType,
	});

	if (baggageIssue.type !== BAGGAGE_INVENTORY_TYPE.SELECTED_BAGGAGE_UNAVAILABLE) {
		return {
			type: BAGGAGE_INVENTORY_TYPE.AVAILABLE,
			baggageSelectionsByPassengerId,
		};
	}

	const affectedPassengerIds = new Set(
		baggageIssue.unavailableBaggage.map((entry) => entry.passengerId)
	);

	return {
		type: BAGGAGE_INVENTORY_TYPE.SELECTED_BAGGAGE_UNAVAILABLE,
		baggageSelectionsByPassengerId,
		unavailableBaggage: baggageIssue.unavailableBaggage,
		updatedBaggageServicesByPassengerId: baggageIssue.updatedBaggageServicesByPassengerId,
		firstAffectedPassengerId:
			orderedPassengerIds.find((passengerId) => affectedPassengerIds.has(passengerId)) ?? null,
	};
}

//get grouped content suffix
export const getGroupedContentSuffix = (
	unavailableBaggage: {
		baggageName: string;
		passengerId: string;
		passengerName: string;
	}[]
): Map<string, { baggageName: string; passengerName: string; quantity: number }> => {
	const unavailableBaggageByPassenger = new Map<
		string,
		{
			baggageName: string;
			passengerName: string;
			quantity: number;
		}
	>();

	for (const entry of unavailableBaggage) {
		// Include both baggageName and passengerId because two passengers can have
		// the same baggage item.
		const key = `${entry.passengerId}:${entry.baggageName}`;
		const existingEntry = unavailableBaggageByPassenger.get(key);

		if (existingEntry) {
			existingEntry.quantity += 1;
			continue;
		}

		unavailableBaggageByPassenger.set(key, {
			baggageName: entry.baggageName,
			passengerName: entry.passengerName,
			quantity: 1,
		});
	}

	return unavailableBaggageByPassenger;
};
