/**
 * File: baggage-inventory.ts
 * Description: Hook for managing baggage inventory. It includes functions to build, validate, and restore baggage inventory based on passenger selections and available services.
 */

import { useMemo } from "react";
import {
	buildAvailableBaggageInventory,
	buildBaggageInventory,
	restorePassengerBaggageInventory,
} from "@/modules/utils/helpers/baggage-service/baggage-inventory/baggage-inventory";
import type {
	BaggageOfferServicesByCategories,
	PassengerWithBaggageSelection,
} from "@/types/baggage-selection/baggage-selection.types";
import type { PassengerValues } from "@/types/passenger/passenger.type";

export const useBaggageInventory = ({
	adultBaggageResponse,
	passengerList,
	currentLfid,
	selectedPassenger,
}: {
	adultBaggageResponse?: BaggageOfferServicesByCategories;
	passengerList: PassengerValues[];
	currentLfid?: number;
	selectedPassenger?: PassengerWithBaggageSelection | null;
}) => {
	const baseInventory = useMemo(() => {
		if (!adultBaggageResponse) {
			return {};
		}

		return buildBaggageInventory(adultBaggageResponse);
	}, [adultBaggageResponse]);

	const availableInventory = useMemo(
		() =>
			buildAvailableBaggageInventory({
				baseInventory,
				passengerList,
				currentLfid,
			}),
		[baseInventory, passengerList, currentLfid]
	);

	return useMemo(
		() =>
			restorePassengerBaggageInventory({
				availableInventory,
				baggageServices: selectedPassenger?.baggageServices,
			}),
		[availableInventory, selectedPassenger]
	);
};
