/**
 * File: baggage-categories.ts
 * Description: Helper functions for managing baggage categories. includes mapping and building baggage categories for passengers.
 */

import {
	bundleCodeToBundleIdMap,
	SPORTS_EQUIPMENT_MAP,
} from "@/modules/utils/constants/baggage-service/baggage-selection-constants";
import {
	getCarryOnCharge,
	getCheckedBaggageCharge,
} from "@/modules/utils/helpers/baggage-service/baggage-pricing/baggage-pricing";
import type {
	BaggageTranslator,
	PassengerBaggageServices,
	ServicePassenger,
} from "@/types/baggage-selection/baggage-selection.types";
import type { BundleCode } from "@/types/passenger/passenger.type";
export const mapBaggageCategories = ({
	categories,
	t,
}: {
	categories: ReturnType<typeof buildBaggageCategories> | undefined;
	t: BaggageTranslator;
}) =>
	categories?.map((category) => ({
		...category,
		title: t(category.title),

		items: category.items.map((item) => ({
			...item,

			label:
				category.title === "passenger_list_checked_in_baggage"
					? t(item.label, {
							count: item.count,
						})
					: category.title === "passenger_list_sports_equipment"
						? t("select_sports_equipment", {
								count: item.count,
								sportsLabel: t(item.label),
							})
						: t(item.label),
		})),
	}));
// build categories for the baggage selection summary based on the selected services to display in the summary modal
export const buildBaggageCategories = ({
	passenger,
	baggageServices,
}: {
	passenger: ServicePassenger;
	baggageServices: PassengerBaggageServices;
}) => {
	const categories = [];

	const packageType = bundleCodeToBundleIdMap[passenger.bundleCode as BundleCode];

	const carryOn = Object.values(baggageServices.carryOn)[0];
	if (carryOn) {
		categories.push({
			title: "passenger_list_carry_on_baggage",

			items: [
				{
					count: 1,
					label: "select_carry_on_baggage_15kg",

					price: getCarryOnCharge(carryOn.ssrCode, packageType, carryOn.amount),
				},
			],
		});
	} else {
		categories.push({
			title: "passenger_list_carry_on_baggage",

			items: [
				{
					count: 1,
					label: "select_carry_on_baggage_7kg",

					price: 0,
				},
			],
		});
	}

	const checkedIn = Object.values(baggageServices.checkedIn);
	const checkedInBaggage = checkedIn.filter(({ service }) => service.ssrCode === "BAGN");
	if (checkedInBaggage.length > 0) {
		categories.push({
			title: "passenger_list_checked_in_baggage",

			items: checkedInBaggage.map(({ service, quantity }) => ({
				count: quantity,
				label: quantity > 1 ? "select_checked_in_baggages" : "select_checked_in_baggage",
				price: getCheckedBaggageCharge(quantity, packageType, service.amount ?? 0),
			})),
		});
	}

	const sports = Object.values(baggageServices.sportsEquipment);

	if (sports.length > 0) {
		categories.push({
			title: "passenger_list_sports_equipment",

			items: sports.map(({ service, quantity }) => {
				const sportsLabel =
					SPORTS_EQUIPMENT_MAP.find((item) => item.ssrCode === service.ssrCode)?.label ??
					service.description;
				return {
					count: quantity,
					label: sportsLabel,

					price: (service.amount ?? 0) * quantity,
				};
			}),
		});
	}

	return categories;
};

export const areAllBaggageServicesMapped = (baggageServices: PassengerBaggageServices): boolean => {
	const carryOnServices = Object.values(baggageServices.carryOn);

	const checkedInServices = Object.values(baggageServices.checkedIn).map(({ service }) => service);

	const sportsServices = Object.values(baggageServices.sportsEquipment).map(
		({ service }) => service
	);

	const allServices = [...carryOnServices, ...checkedInServices, ...sportsServices];

	return (
		allServices.every(
			(service) =>
				service.serviceID !== undefined && service.serviceID !== null && service.serviceID > 0
		) && allServices.length !== 0
	); // Return true if all services are mapped and there is at least one service selected, otherwise return false
};
