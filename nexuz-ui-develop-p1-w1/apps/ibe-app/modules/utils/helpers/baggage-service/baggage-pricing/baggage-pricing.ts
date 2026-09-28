/**
 * File: baggage-pricing.ts
 * Description: Helper functions for calculating baggage pricing based on selected services and package types. It includes functions to calculate total baggage price for a passenger, get carry-on and checked baggage charges, and compute sports equipment charges.
 */

import { bundleCodeToBundleIdMap } from "@/modules/utils/constants/baggage-service/baggage-selection-constants";
import type {
	BaggageEquipmentItem,
	BaggageSelectionValues,
	BundleId,
	CarryOnOption,
	PassengerBaggageServices,
	ServicePassenger,
} from "@/types/baggage-selection/baggage-selection.types";
import type { BundleCode } from "@/types/passenger/passenger.type";
// calculate total baggage price for a passenger based on the selected services and package type
export const calculatePassengerBaggagePrice = ({
	passenger,
	baggageServices,
}: {
	passenger: ServicePassenger;
	baggageServices: PassengerBaggageServices;
}) => {
	const packageType = bundleCodeToBundleIdMap[passenger.bundleCode as BundleCode];

	let total = 0;

	const carryOn = Object.values(baggageServices.carryOn)[0];

	if (carryOn) {
		total += getCarryOnCharge(carryOn.ssrCode, packageType, carryOn.amount ?? 0);
	}

	for (const { service, quantity } of Object.values(baggageServices.checkedIn)) {
		total += getCheckedBaggageCharge(quantity, packageType, service.amount ?? 0);
	}

	for (const { service, quantity } of Object.values(baggageServices.sportsEquipment)) {
		total += (service.amount ?? 0) * quantity;
	}

	return total;
};

// get the carry-on charge based on the selected carry-on option and package type
export const getCarryOnCharge = (carryOnId: string, packageType: BundleId, amount: number) => {
	if (packageType === "NONE" || packageType === "VALUE") {
		return carryOnId === "CABN" ? amount : 0; // Replace 7000 with the actual amount if needed
	}
	return 0;
};

// get the checked baggage charge based on the selected checked baggage count and package type
export const getCheckedBaggageCharge = (
	checkedInBaggageCount: number,
	packageType: BundleId,
	amount: number
) => {
	if (packageType === "VALUE" || packageType === "PREMIUM") {
		return amount * Math.max(0, checkedInBaggageCount - 1);
	}
	return amount * checkedInBaggageCount;
};

// get the sports equipment charge based on the selected sports equipment and package type
export const getSportsEquipmentCharge = (
	sportsEquipment: BaggageEquipmentItem[],
	equipmentCounts: Record<string, number>
) => {
	return sportsEquipment.reduce(
		(total, equipment) => total + equipment.price * (equipmentCounts[equipment.id] ?? 0),
		0
	);
};

// calculate the total baggage price based on the selected options for carry-on, checked-in baggage, and sports equipment per passenger
export const calculateBaggagePriceFromSelection = ({
	selection,
	carryOnOptions,
	equipmentOptions,
	packageType,
	checkedInBaggagePrice,
}: {
	selection: BaggageSelectionValues;
	carryOnOptions: CarryOnOption[];
	equipmentOptions: BaggageEquipmentItem[];
	packageType: BundleId;
	checkedInBaggagePrice: number;
}) => {
	const selectedCarryOn = carryOnOptions.find((option) => option.id === selection.carryOnId);

	const carryOnCharge = getCarryOnCharge(
		selectedCarryOn?.ssrCode ?? "",
		packageType,
		selectedCarryOn?.price ?? 0
	);

	const checkedInCharge = getCheckedBaggageCharge(
		selection.checkedInBaggageCount,
		packageType,
		checkedInBaggagePrice
	);

	const sportsCharge = getSportsEquipmentCharge(equipmentOptions, selection.equipmentCounts);

	return carryOnCharge + checkedInCharge + sportsCharge;
};
