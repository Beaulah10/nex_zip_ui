/**
 * File: build-baggage-selection.ts
 * Description: Utility functions for building baggage selection data structures. It includes functions to construct passenger baggage selections, build selection values, and create baggage services based on user selections and available offers.
 */

import type { usePassengerOrder } from "@/modules/hooks/common/passenger-order/passenger-order";
import {
	BAGGAGE_CATEGORY_MAP,
	bundleCodeToBundleIdMap,
} from "@/modules/utils/constants/baggage-service/baggage-selection-constants";
import { buildBaggageCategories } from "@/modules/utils/helpers/baggage-service/baggage-categories/baggage-categories";
import { calculatePassengerBaggagePrice } from "@/modules/utils/helpers/baggage-service/baggage-pricing/baggage-pricing";
import type {
	BaggageEquipmentItem,
	BaggageOfferServicesByCategories,
	BaggageOffersByPTCType,
	BaggageSelectionValues,
	PassengerBaggageSelectionMap,
	PassengerBaggageServices,
	PassengerWithBaggageSelection,
	ServicePassenger,
} from "@/types/baggage-selection/baggage-selection.types";
import type {
	BundleCode,
	PassengerService,
	PassengerServiceCategory,
	PassengerServiceGroups,
	PassengerValues,
} from "@/types/passenger/passenger.type";

// get baggage services for a specific passenger and category
export function flattenPassengerServicesByCategory(
	services: PassengerServiceGroups | undefined,
	category: PassengerServiceCategory
): PassengerService[] {
	return services?.[category] ?? [];
}
// Build passenger list with bundle, bagagge selection and category details
export const buildPassengerWithBaggageSelection = ({
	passengerList,
	selectedBundlePassengers,
	serviceCategory,
	currentLfid,
	baggageOffersByPassengerType,
}: {
	passengerList: PassengerValues[];
	selectedBundlePassengers: ServicePassenger[];
	serviceCategory: PassengerServiceCategory;
	currentLfid?: number;
	baggageOffersByPassengerType: Record<string, BaggageOffersByPTCType>;
}): PassengerBaggageSelectionMap => {
	return passengerList.reduce<PassengerBaggageSelectionMap>((acc, passenger) => {
		const selectedPassenger = selectedBundlePassengers.find((p) => p.id === passenger.id);
		const baggageOffers =
			baggageOffersByPassengerType[selectedPassenger?.passengerTypeCode ?? "adult"];
		if (!selectedPassenger) {
			return acc;
		}
		const services = flattenPassengerServicesByCategory(passenger.services, serviceCategory).filter(
			(service) => currentLfid === undefined || service.lfid === currentLfid
		);
		const baggageServices: PassengerBaggageServices = {
			carryOn: {},

			checkedIn: {},

			sportsEquipment: {},
		};

		for (const service of services) {
			switch (service.categoryId) {
				case 144:
					baggageServices.carryOn[service.ssrCode] = service;
					break;

				case 143: {
					const existing = baggageServices.checkedIn[service.ssrCode];

					if (existing) {
						existing.quantity += 1;
					} else {
						baggageServices.checkedIn[service.ssrCode] = {
							service: {
								...service,
								amount: baggageOffers?.categories.checkedIn?.BAGN?.amount ?? 0,
							},
							quantity: 1,
						};
					}

					break;
				}

				case 145: {
					const existing = baggageServices.sportsEquipment[service.ssrCode];

					if (existing) {
						existing.quantity += 1;
					} else {
						baggageServices.sportsEquipment[service.ssrCode] = {
							service,
							quantity: 1,
						};
					}

					break;
				}
			}
		}

		acc[passenger.id] = {
			passenger: selectedPassenger,

			baggageServices,

			categories: buildBaggageCategories({
				passenger: selectedPassenger,

				baggageServices,
			}),

			totalPrice: calculatePassengerBaggagePrice({
				passenger: selectedPassenger,

				baggageServices,
			}),
		};

		return acc;
	}, {});
};

// build selection values from passenger baggage services for controlled component state
export const buildSelectionValuesFromPassengerBaggage = (
	selectedItem: PassengerWithBaggageSelection,
	sportsEquipmentOptions: BaggageEquipmentItem[]
): BaggageSelectionValues => {
	const bundleID = bundleCodeToBundleIdMap[selectedItem.passenger.bundleCode as BundleCode];
	const defaultCarryOnId = bundleID === "PREMIUM" || bundleID === "FLEXBIZ" ? "CABN" : "7kg";
	const defaultCheckedIn = bundleID === "PREMIUM" || bundleID === "VALUE" ? 1 : 0;
	const carryOn = Object.values(selectedItem.baggageServices.carryOn)[0];
	const checkedIn = selectedItem.baggageServices.checkedIn.BAGN;
	const equipmentCounts = Object.values(selectedItem.baggageServices.sportsEquipment).reduce<
		Record<string, number>
	>((acc, item) => {
		const equipment = sportsEquipmentOptions.find((eq) => eq.ssrCode === item.service.ssrCode);

		if (equipment) {
			acc[equipment.id] = item.quantity;
		}

		return acc;
	}, {});

	return {
		carryOnId: carryOn?.ssrCode === "CABN" ? "CABN" : defaultCarryOnId,

		checkedInBaggageCount: checkedIn?.quantity ?? defaultCheckedIn,

		equipmentCounts,
	};
};
// get the baggage services selected by a passenger and build a PassengerBaggageServices object
export const buildPassengerBaggageServicesFromSelection = ({
	baggageOffersByPassengerType,
	selection,
	selectedPassenger,
}: {
	baggageOffersByPassengerType: Record<
		string,
		{
			passengerType: string;
			categories: BaggageOfferServicesByCategories;
		}
	>;
	selection: BaggageSelectionValues;
	selectedPassenger: PassengerWithBaggageSelection;
}): PassengerBaggageServices => {
	const carryOn = selection.carryOnId;

	const passengerType = selectedPassenger.passenger.passengerTypeCode;

	const baggageOffers = baggageOffersByPassengerType[passengerType];

	const carryOnResponse = baggageOffers?.categories?.carryOn?.[carryOn];

	const checkedInResponse = baggageOffers?.categories?.checkedIn?.["BAGN"];

	const sportsEquipmentResponse = baggageOffers?.categories?.sportsEquipment ?? {};

	return {
		carryOn:
			carryOn === "CABN"
				? {
						CABN: {
							lfid: carryOnResponse?.lfid ?? 0,
							pfid: carryOnResponse?.pfid,
							categoryId: BAGGAGE_CATEGORY_MAP["CARRY_ON"],
							cutOffHours: carryOnResponse?.cutOffHours,
							maxCountServiceLevel: carryOnResponse?.maxCountServiceLevel,
							passengerType,
							qtyAvailable: carryOnResponse?.qtyAvailable,
							serviceID: carryOnResponse?.ssrId,
							chargeComment: "",
							bundleCode: selectedPassenger.passenger.bundleCode,
							ssrCode: carryOn,
							description: carryOnResponse?.description,
							amount: carryOnResponse?.amount ?? 0,
						} as PassengerService,
					}
				: {},

		checkedIn:
			selection.checkedInBaggageCount > 0
				? {
						BAGN: {
							service: {
								lfid: checkedInResponse?.lfid,
								pfid: checkedInResponse?.pfid,
								categoryId: BAGGAGE_CATEGORY_MAP["CHECKED_IN"],
								cutOffHours: checkedInResponse?.cutOffHours,
								maxCountServiceLevel: checkedInResponse?.maxCountServiceLevel,
								passengerType,
								qtyAvailable: checkedInResponse?.qtyAvailable,
								serviceID: checkedInResponse?.ssrId,
								chargeComment: "",
								bundleCode: selectedPassenger.passenger.bundleCode,
								ssrCode: "BAGN",
								description: checkedInResponse?.description,
								amount: checkedInResponse?.amount ?? 0,
							} as PassengerService,

							quantity: selection.checkedInBaggageCount,
						},
					}
				: {},

		sportsEquipment: Object.fromEntries(
			Object.entries(sportsEquipmentResponse)
				.filter(([ssrCode]) => (selection.equipmentCounts?.[ssrCode] ?? 0) > 0)
				.map(([ssrCode, item]) => [
					ssrCode,
					{
						service: {
							categoryId: BAGGAGE_CATEGORY_MAP.SPORTS,
							lfid: item.lfid,
							pfid: item.pfid ?? 0,
							serviceID: item.ssrId,
							ssrCode: item.ssrCode,
							description: item.description,
							amount: item.amount ?? 0,
							passengerType,
							qtyAvailable: item.qtyAvailable,
							cutOffHours: item.cutOffHours,
							maxCountServiceLevel: item.maxCountServiceLevel,
							chargeComment: "",
							bundleCode: selectedPassenger.passenger.bundleCode,
						} as PassengerService,

						quantity: selection.equipmentCounts?.[ssrCode] ?? 0,
					},
				])
		),
	};
};
export function getStoredBaggageByLfid({
	passengers,
	lfid,
	serviceCategory,
}: {
	passengers: ReturnType<typeof usePassengerOrder>["orderedPassengersWithNames"];
	lfid: number | undefined;
	serviceCategory: PassengerServiceCategory;
}): Record<string, PassengerBaggageServices> {
	if (lfid === undefined) {
		return {};
	}
	return passengers.reduce<Record<string, PassengerBaggageServices>>((acc, passenger) => {
		const services = flattenPassengerServicesByCategory(passenger.services, serviceCategory).filter(
			(service) => lfid === undefined || service.lfid === lfid
		);
		const baggageServices: PassengerBaggageServices = {
			carryOn: {},

			checkedIn: {},

			sportsEquipment: {},
		};

		for (const service of services) {
			switch (service.categoryId) {
				case 144:
					baggageServices.carryOn[service.ssrCode] = service;
					break;

				case 143: {
					const existing = baggageServices.checkedIn[service.ssrCode];

					if (existing) {
						existing.quantity += 1;
					} else {
						baggageServices.checkedIn[service.ssrCode] = {
							service: {
								...service,
							},
							quantity: 1,
						};
					}

					break;
				}

				case 145: {
					const existing = baggageServices.sportsEquipment[service.ssrCode];

					if (existing) {
						existing.quantity += 1;
					} else {
						baggageServices.sportsEquipment[service.ssrCode] = {
							service,
							quantity: 1,
						};
					}

					break;
				}
			}
		}

		acc[passenger.id] = baggageServices;

		return acc;
	}, {});
}
