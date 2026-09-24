/**
 * File: baggage-inventory.ts
 * Description: Helper functions for managing baggage inventory. It includes functions to build, validate, and restore baggage inventory based on passenger selections and available services.
 */

import { bundleCodeToBundleIdMap } from "@/modules/utils/constants/baggage-service/baggage-selection-constants";
import type { getBaggageOffersByPassengerType } from "@/modules/utils/helpers/baggage-service/baggage-offers/baggage-offers";
import type {
	BaggageOfferServicesByCategories,
	PassengerBaggageServices,
	ServicePassenger,
} from "@/types/baggage-selection/baggage-selection.types";
import type { BundleCode, PassengerValues } from "@/types/passenger/passenger.type";

/**
 * Build initial baggage inventory from the adult passenger offer response.
 * Creates a Record mapping SSR codes to available quantities.
 */
export const buildBaggageInventory = (
	adultBaggageResponse: BaggageOfferServicesByCategories | undefined
): Record<string, number> => {
	const inventory: Record<string, number> = {};
	if (!adultBaggageResponse) {
		return inventory;
	}
	// Extract carry-on services
	for (const [ssrCode, service] of Object.entries(adultBaggageResponse.carryOn)) {
		inventory[ssrCode] = service.qtyAvailable ?? 0;
	}

	// Extract checked-in baggage services
	for (const [ssrCode, service] of Object.entries(adultBaggageResponse.checkedIn)) {
		inventory[ssrCode] = service.qtyAvailable ?? 0;
	}

	// Extract sports equipment services
	for (const [ssrCode, service] of Object.entries(adultBaggageResponse.sportsEquipment)) {
		inventory[ssrCode] = service.qtyAvailable ?? 0;
	}

	return inventory;
};
// Checks if bundled baggage is out of stock based on available carry-on and checked-in quantities.
export const isBundledBaggageOutOfStock = ({
	passengers,
	availableCabnQty,
	availableBagnQty,
}: {
	passengers?: ServicePassenger[];
	availableCabnQty: number;
	availableBagnQty: number;
}) => {
	const passengerList = passengers ?? [];
	const ValuePaassengers = [];
	const PremiumPassengers = [];
	const FlexBizPassengers = [];
	const bundlePassengers = passengerList.filter((passenger) => {
		const bundleId = bundleCodeToBundleIdMap[passenger.bundleCode as BundleCode];
		if (bundleId === "VALUE") {
			ValuePaassengers.push(passenger);
		}
		if (bundleId === "PREMIUM") {
			PremiumPassengers.push(passenger);
		}
		if (bundleId === "FLEXBIZ") {
			FlexBizPassengers.push(passenger);
		}
		return bundleId === "PREMIUM" || bundleId === "VALUE" || bundleId === "FLEXBIZ";
	});

	const passengerCount = bundlePassengers.length;
	const bundlePassengerCount = {
		VALUE: ValuePaassengers.length,
		PREMIUM: PremiumPassengers.length,
		FLEXBIZ: FlexBizPassengers.length,
	};
	if (passengerCount === 0) {
		return {
			isValid: true,
		};
	}

	const requiredCarryOnCount = bundlePassengerCount.PREMIUM + bundlePassengerCount.FLEXBIZ;
	const requiredCheckedInCount = bundlePassengerCount.PREMIUM + bundlePassengerCount.VALUE;

	if (requiredCarryOnCount > 0 && availableCabnQty < requiredCarryOnCount) {
		return {
			isValid: false,
			reason: "Carry-on baggage inventory is unavailable.",
		};
	}

	if (requiredCheckedInCount > 0 && availableBagnQty < requiredCheckedInCount) {
		return {
			isValid: false,
			reason: "Checked-in baggage inventory is unavailable.",
		};
	}

	return {
		isValid: true,
	};
};
// validate if the package included baggage inventory is available for all passengers in the bundle
export const validateBundleIncludedBaggageInventory = ({
	passengers,
	baggageOffersByPassengerType,
}: {
	passengers?: ServicePassenger[];
	baggageOffersByPassengerType: ReturnType<typeof getBaggageOffersByPassengerType>;
}) => {
	const categories = baggageOffersByPassengerType["adult"]?.categories;
	const cabnQty = categories?.carryOn?.CABN?.qtyAvailable ?? 0;
	const bagnQty = categories?.checkedIn?.BAGN?.qtyAvailable ?? 0;
	return isBundledBaggageOutOfStock({
		passengers,
		availableCabnQty: cabnQty,
		availableBagnQty: bagnQty,
	});
};
/**
 * Reduces API inventory using baggage services already committed to Redux.
 *
 * Each PassengerService represents one selected quantity.
 * This works with duplicate BAGN/sports service entries in passenger.services.baggage.
 */
export const buildAvailableBaggageInventory = ({
	baseInventory,
	passengerList,
	currentLfid,
}: {
	baseInventory: Record<string, number>;
	passengerList: PassengerValues[];
	currentLfid?: number;
}): Record<string, number> => {
	const availableInventory = { ...baseInventory };

	if (currentLfid === undefined) {
		return availableInventory;
	}

	for (const passenger of passengerList) {
		const baggageServices = passenger.services?.baggage ?? [];

		for (const service of baggageServices) {
			if (service.lfid !== currentLfid) {
				continue;
			}

			const ssrCode = service.ssrCode;

			if (!ssrCode) {
				continue;
			}

			const availableQty = availableInventory[ssrCode];

			/*
			 * Ignore services which do not exist in the current offer inventory.
			 * This prevents accidental creation of negative inventory keys.
			 */
			if (availableQty === undefined) {
				continue;
			}

			availableInventory[ssrCode] = Math.max(0, availableQty - 1);
		}
	}

	return availableInventory;
};

/**
 * The general available inventory already subtracts every passenger,
 * including the passenger currently being edited.
 *
 * Restoring the current passenger's committed quantity allows that
 * passenger to keep or modify the existing selection without the
 * existing selection being counted twice.
 */
export const restorePassengerBaggageInventory = ({
	availableInventory,
	baggageServices,
}: {
	availableInventory: Record<string, number>;
	baggageServices?: PassengerBaggageServices;
}): Record<string, number> => {
	const restoredInventory = { ...availableInventory };

	if (!baggageServices) {
		return restoredInventory;
	}

	for (const service of Object.values(baggageServices.carryOn)) {
		if (!service.ssrCode) {
			continue;
		}

		restoredInventory[service.ssrCode] = (restoredInventory[service.ssrCode] ?? 0) + 1;
	}

	for (const { service, quantity } of Object.values(baggageServices.checkedIn)) {
		if (!service.ssrCode) {
			continue;
		}

		restoredInventory[service.ssrCode] = (restoredInventory[service.ssrCode] ?? 0) + quantity;
	}

	for (const { service, quantity } of Object.values(baggageServices.sportsEquipment)) {
		if (!service.ssrCode) {
			continue;
		}

		restoredInventory[service.ssrCode] = (restoredInventory[service.ssrCode] ?? 0) + quantity;
	}

	return restoredInventory;
};
