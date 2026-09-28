/**
 * File: baggage-offers.ts
 * Description: Helper functions for managing baggage offers. It includes functions to organize baggage offers by passenger type and category, and to retrieve carry-on and sports equipment options based on available inventory.
 */

import type {
	NEXUZR004OffersAncillaryResponse,
	NEXUZR004OffersServicesPerPassengerType,
} from "@repo/sdk";
import {
	BAGGAGE_CATEGORY_MAP,
	bundleCodeToBundleIdMap,
	CARRY_ON_LABELS,
	SPORTS_EQUIPMENT_MAP,
} from "@/modules/utils/constants/baggage-service/baggage-selection-constants";
import type {
	BaggageEquipmentItem,
	BaggageOfferServicesByCategories,
	BaggageOffersByPTCType,
	CarryOnOption,
} from "@/types/baggage-selection/baggage-selection.types";
import type { BundleCode } from "@/types/passenger/passenger.type";

/**
 * Organize baggage offers response by passenger type with categories.
 * Transforms the array of services per passenger type into a Record keyed by passengerType,
 * with services organized by category (carryOn, checkedIn, sportsEquipment).
 */
export const getBaggageServicesResponse = (
	baggageOfferResponse: NEXUZR004OffersServicesPerPassengerType | undefined
): BaggageOfferServicesByCategories => {
	if (!baggageOfferResponse) {
		return {
			carryOn: {},
			checkedIn: {},
			sportsEquipment: {},
		};
	}
	const carryOnCategory = baggageOfferResponse.categories.find(
		(category) => category.categoryId === BAGGAGE_CATEGORY_MAP["CARRY_ON"]
	);

	const checkedInCategory = baggageOfferResponse.categories.find(
		(category) => category.categoryId === BAGGAGE_CATEGORY_MAP["CHECKED_IN"]
	);

	const sportsCategory = baggageOfferResponse.categories.find(
		(category) => category.categoryId === BAGGAGE_CATEGORY_MAP["SPORTS"]
	);

	return {
		carryOn: Object.fromEntries(
			(carryOnCategory?.specialServices ?? []).map((service) => [service.ssrCode, service])
		),

		checkedIn: Object.fromEntries(
			(checkedInCategory?.specialServices ?? []).map((service) => [service.ssrCode, service])
		),

		sportsEquipment: Object.fromEntries(
			(sportsCategory?.specialServices ?? []).map((service) => [service.ssrCode, service])
		),
	};
};

export const getBaggageOffersByPassengerType = (
	baggageOffersResponse: NEXUZR004OffersAncillaryResponse | undefined
): Record<
	string,
	{
		passengerType: string;
		categories: BaggageOfferServicesByCategories;
	}
> => {
	if (!baggageOffersResponse?.data?.servicesPerPassengerType) {
		return {};
	}

	return Object.fromEntries(
		baggageOffersResponse.data.servicesPerPassengerType.map((services) => [
			services.passengerType,
			{
				passengerType: services.passengerType,
				categories: getBaggageServicesResponse(services),
			},
		])
	);
};

export const getCarryOnOptionsByPassengerType = (
	baggageOffersByPassengerType: Record<string, BaggageOffersByPTCType>,
	passengerType: string | undefined,
	availableInventory?: Record<string, number>
): CarryOnOption[] => {
	const passengerOffers = baggageOffersByPassengerType[passengerType ?? "adult"];
	if (!passengerOffers?.categories?.carryOn) {
		return [
			{
				id: "7kg",
				label: CARRY_ON_LABELS["7kg"],
				price: 0,
				ssrCode: "7KG",
				qtyAvailable: 0,
			},
			{
				id: "CABN",
				label: CARRY_ON_LABELS.CABN,
				price: 0,
				ssrCode: "CABN",
				qtyAvailable: 0,
			},
		];
	}

	const carryOnServices = passengerOffers.categories.carryOn;

	return [
		{
			id: "7kg",
			label: CARRY_ON_LABELS["7kg"],
			price: 0,
			ssrCode: "7KG",
			qtyAvailable: 0,
		},
		{
			id: "CABN",
			label: CARRY_ON_LABELS.CABN,
			price: carryOnServices["CABN"]?.amount ?? 0,
			ssrCode: "CABN",
			qtyAvailable: availableInventory?.["CABN"] ?? carryOnServices["CABN"]?.qtyAvailable ?? 0,
		},
	];
};

//  Map Passenger Sports Equipment selection with offer response value
export const getSportsEquipmentOptionsByPassengerType = (
	baggageOffersByPassengerType: Record<string, BaggageOffersByPTCType>,
	passengerType: string,
	availableInventory?: Record<string, number>
): BaggageEquipmentItem[] => {
	const equipmentOptions = SPORTS_EQUIPMENT_MAP;
	const baggageOffers = baggageOffersByPassengerType[passengerType];
	const sportsCategory = baggageOffers?.categories?.sportsEquipment;
	if (!sportsCategory) {
		return equipmentOptions;
	}
	return equipmentOptions.map((item) => {
		const availableService = sportsCategory[item.ssrCode];
		return {
			...item,
			qtyAvailable: availableInventory?.[item.ssrCode] ?? availableService?.qtyAvailable ?? 0,
			price: availableService?.amount ?? 0,
		};
	});
};

export function getFreeBaggageItemCount(bundleCode: string) {
	const bundleId = bundleCodeToBundleIdMap[bundleCode as BundleCode];

	if (bundleId === "VALUE" || bundleId === "PREMIUM") {
		return 2;
	}

	return 1;
}

export function formatBaggagePreselectedText(totalItems: number) {
	if (totalItems <= 0) {
		return undefined;
	}

	return `${totalItems} free baggage ${totalItems === 1 ? "item" : "items"} preselected`;
}
