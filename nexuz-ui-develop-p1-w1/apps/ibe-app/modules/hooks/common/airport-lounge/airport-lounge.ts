import { useEffect, useState } from "react";
import type { selectCustomersListItem } from "@/components/common/select-customers/select-customers";
import { createSelectCustomerListItems } from "@/components/common/select-customers/select-customers";
import { usePassengerOrder } from "@/modules/hooks/common/passenger-order/passenger-order";
import {
	INFANT_PASSENGER_TYPES,
	UNDER_SIX_DEPENDENT_TYPES,
} from "@/modules/utils/constants/priority-service/passenger-types.constants";
import { useAppSelector } from "@/store/hooks";
import { selectPassengers as selectSavedPassengers } from "@/store/slices/passenger/passenger.slice";
import type {
	AirportLoungePassengerSelection,
	AirportLoungeSelectionOptions,
} from "@/types/lounge-dialog/lounge-dialog.types";
import type { PassengerValues } from "@/types/passenger/passenger.type";

/**
 * Returns the items to display based on the show more state.
 * @param items - Collection of items.
 * @param showFull - Whether to show all items.
 * @param initialCount - Initial item count to display.
 * @returns Items to render.
 */

export function getSeeMoreItems<T>(
	items: readonly T[],
	showFull: boolean,
	initialCount: number
): T[] {
	if (showFull) {
		return [...items];
	}

	return items.slice(0, Math.max(initialCount, 0));
}

/**
 * Returns the full or truncated description text.
 * @param description - Description to display.
 * @param showFull - Whether to show the full description.
 * @param previewLength - Maximum length before truncation.
 * @returns The display text and truncation status.
 */
export function getSeeMoreDescriptionText(
	description: string,
	showFull: boolean,
	previewLength: number
): { text: string; isTruncated: boolean } {
	if (showFull || description.length <= previewLength) {
		return {
			text: description,
			isTruncated: false,
		};
	}

	return {
		text: `${description.substring(0, previewLength)}...`,
		isTruncated: true,
	};
}

/**
 * Calculates the total lounge amount for selected passengers.
 */
export function getAirportLoungeTotalAmount(
	passengers: readonly selectCustomersListItem[],
	pricePerPassenger: number
): number {
	return (
		passengers.filter(
			(passenger) =>
				passenger.checked &&
				!UNDER_SIX_DEPENDENT_TYPES.has(passenger.passengerTypeCode?.toLowerCase() ?? "")
		).length * pricePerPassenger
	);
}

/**
 * Creates airport lounge passenger list items and applies selection/disabled states.
 * @param orderedPassengersWithNames - Passenger list with names.
 * @param savedPassengers - Saved passenger details.
 * @param segmentLfid - Optional segment identifier.
 * @returns Updated passenger list for lounge selection.
 */
function createAirportLoungePassengerList(
	orderedPassengersWithNames: (PassengerValues & { mappedAdultId?: string })[],
	savedPassengers: PassengerValues[],
	segmentLfid?: number
) {
	return createSelectCustomerListItems(orderedPassengersWithNames).map((passenger, index) => {
		const sourcePassenger = orderedPassengersWithNames[index];
		const savedPassenger = savedPassengers.find((saved) => saved.id === passenger.id);
		const hasLoungeSelection = (savedPassenger?.services?.lounge ?? []).some(
			(service) => segmentLfid === undefined || service.lfid === segmentLfid
		);
		const isDependentPassenger = INFANT_PASSENGER_TYPES.has(
			sourcePassenger?.passengerTypeCode ?? ""
		);

		return {
			...passenger,
			checked: hasLoungeSelection,
			mappedAdultId: sourcePassenger?.mappedAdultId ?? "",
			disabled: isDependentPassenger ? true : (passenger.disabled ?? false),
		};
	});
}

/**
 * Builds Airport Lounge passenger state and toggle handlers from ordered passengers.
 * Pass segmentLfid to scope checked state to the current flight direction segment.
 */
export const useAirportLoungePassengerSelection = ({
	segmentLfid,
}: AirportLoungeSelectionOptions = {}): AirportLoungePassengerSelection => {
	const { orderedPassengersWithNames } = usePassengerOrder();
	const savedPassengers = useAppSelector(selectSavedPassengers);
	const [airportLoungePassengers, setAirportLoungePassengers] = useState<selectCustomersListItem[]>(
		() => createAirportLoungePassengerList(orderedPassengersWithNames, savedPassengers, segmentLfid)
	);

	useEffect(() => {
		setAirportLoungePassengers(
			createAirportLoungePassengerList(orderedPassengersWithNames, savedPassengers, segmentLfid)
		);
	}, [orderedPassengersWithNames, savedPassengers, segmentLfid]);

	const toggleAirportLoungePax = (id: string, checked: boolean) => {
		setAirportLoungePassengers((prev) => prev.map((p) => (p.id === id ? { ...p, checked } : p)));
	};

	const toggleAirportLoungeSelectAll = (checked: boolean) => {
		setAirportLoungePassengers((prev) => prev.map((p) => (p.disabled ? p : { ...p, checked })));
	};

	return {
		airportLoungePassengers,
		toggleAirportLoungePax,
		toggleAirportLoungeSelectAll,
	};
};
