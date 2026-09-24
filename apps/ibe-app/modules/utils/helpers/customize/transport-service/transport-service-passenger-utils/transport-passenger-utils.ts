import type { selectCustomersListItem } from "@/components/common/select-customers/select-customers";
import { createAccompanyingSelectionHelpers } from "@/modules/hooks/common/accompanying-selection/accompanying-selection";
import { INFANT_PASSENGER_TYPES } from "@/modules/utils/constants/priority-service/passenger-types.constants";
import { passengerType } from "@/modules/utils/helpers/customize/transport-service/transport-service-response/transport-service-api-response";

const transportAccompanyingSelection = createAccompanyingSelectionHelpers({
	autoSelectPassengerTypes: INFANT_PASSENGER_TYPES,
	normalizePassengerTypeCode: passengerType,
	primaryRequiresNoMappedAdult: false,
});

/**
 * Checks if the given passenger type code belongs to an infant.
 */
export function isInfantPassenger(passengerTypeCode?: string): boolean {
	return passengerType(passengerTypeCode) === "infant";
}

/**
 * Counts selected passengers excluding infants.
 */
export function getSelectedNonInfantCount(passengers: selectCustomersListItem[]): number {
	return transportAccompanyingSelection.getSelectedPrimaryPassengerCount(passengers);
}

/**
 * Toggles a single passenger selection while respecting infant and stock-limit rules.
 */
export function toggleTransportPassengerSelection({
	passengers,
	targetId,
	nextChecked,
	stockLimit,
}: {
	passengers: selectCustomersListItem[];
	targetId: string;
	nextChecked: boolean;
	stockLimit: number | null;
}): selectCustomersListItem[] {
	return transportAccompanyingSelection.togglePrimaryPassengerSelection({
		passengers,
		targetId,
		nextChecked,
		stockLimit,
	});
}

/**
 * Toggles all passenger selections while respecting infant and stock-limit rules.
 */
export function toggleTransportSelectAllPassengers({
	passengers,
	nextChecked,
	stockLimit,
}: {
	passengers: selectCustomersListItem[];
	nextChecked: boolean;
	stockLimit: number | null;
}): selectCustomersListItem[] {
	return transportAccompanyingSelection.toggleSelectAllPrimaryPassengers({
		passengers,
		nextChecked,
		stockLimit,
	});
}

/**
 * Checks whether two transport-passenger lists are equal to avoid unnecessary state updates.
 */
export function isTransportPassengerListequal(
	currentPassengers: selectCustomersListItem[],
	nextPassengers: selectCustomersListItem[]
): boolean {
	if (currentPassengers.length !== nextPassengers.length) {
		return false;
	}

	for (let index = 0; index < currentPassengers.length; index += 1) {
		const current = currentPassengers[index];
		const next = nextPassengers[index];
		if (!current || !next) {
			return false;
		}
		if (
			current.id !== next.id ||
			current.name !== next.name ||
			current.category !== next.category ||
			current.passengerTypeCode !== next.passengerTypeCode ||
			current.checked !== next.checked
		) {
			return false;
		}
	}

	return true;
}

/**
 * Normalizes optional airport codes for route checks.
 */
export function getRouteAirportCode(value?: string): string {
	return value?.trim().toUpperCase() ?? "";
}
