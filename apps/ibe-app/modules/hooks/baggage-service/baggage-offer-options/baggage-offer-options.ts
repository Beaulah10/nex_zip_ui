/**
 * File: baggage-offer-options.ts
 * Description: Hook for retrieving baggage offer options for a specific passenger type. It includes functions to get carry-on options, checked-in baggage prices, and sports equipment options.
 */

import { useMemo } from "react";
import {
	getCarryOnOptionsByPassengerType,
	getSportsEquipmentOptionsByPassengerType,
} from "@/modules/utils/helpers/baggage-service/baggage-offers/baggage-offers";
import type { BaggageOfferServicesByCategories } from "@/types/baggage-selection/baggage-selection.types";

export const useBaggageOfferOptions = ({
	baggageOffersByPassengerType,
	passengerTypeCode,
	availableInventory,
}: {
	baggageOffersByPassengerType: Record<
		string,
		{
			passengerType: string;
			categories: BaggageOfferServicesByCategories;
		}
	>;
	passengerTypeCode: string | undefined;
	availableInventory: Record<string, number>;
}) => {
	// get carryOnOptions, priceForCheckedInBaggage, sportsEquipmentOptions from response
	const carryOnOptions = useMemo(
		() =>
			getCarryOnOptionsByPassengerType(
				baggageOffersByPassengerType,
				passengerTypeCode,
				availableInventory
			),
		[baggageOffersByPassengerType, passengerTypeCode, availableInventory]
	);
	const priceForCheckedInBaggage = useMemo(() => {
		const passengerType = passengerTypeCode ?? "adult";
		const checkedInPrice =
			baggageOffersByPassengerType[passengerType]?.categories.checkedIn?.["BAGN"]?.amount ?? 0;
		return checkedInPrice;
	}, [baggageOffersByPassengerType, passengerTypeCode]);
	const sportsEquipmentOptions = useMemo(
		() =>
			getSportsEquipmentOptionsByPassengerType(
				baggageOffersByPassengerType,
				passengerTypeCode ?? "adult",
				availableInventory
			),
		[baggageOffersByPassengerType, passengerTypeCode, availableInventory]
	);
	return { carryOnOptions, priceForCheckedInBaggage, sportsEquipmentOptions };
};
