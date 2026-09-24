/**
 * File: seat-selection-availability.ts
 * Description: Provides utilities for validating seat availability and
 * returning the appropriate seat selection dialog configuration.
 */

import { expandCabinRows } from "@/components/customize/seat-map/expand-cabin-rows/expand-cabin-rows";
import { hasRequiredAdjacentSeatAvailability } from "@/modules/utils/validations/seat-map/seat-validation";
import type { Cabin, SeatSelectionDialogType } from "@/types/seat-map/seat-map.types";
import type { CabinType, SeatValidationPassenger } from "@/types/seat-map/seat-validation.types";

type SeatValidationPassengerInput = {
	id: string;
	passengerTypeCode?: string | null;
	mappedAdultId?: string | null;
	associateWithPassengerId?: string | null;
};

/**
 * Converts passenger data into the format required by
 * seat validation and adjacent seat availability checks.
 */
export function toSeatValidationPassengers(
	passengers: SeatValidationPassengerInput[]
): SeatValidationPassenger[] {
	return passengers.map((passenger) => ({
		id: passenger.id,
		passengerTypeCode: passenger.passengerTypeCode ?? undefined,
		mappedAdultId: passenger.mappedAdultId ?? passenger.associateWithPassengerId ?? undefined,
	}));
}

/**
 * Evaluates seat availability and adjacency requirements,
 * then returns the appropriate seat selection dialog if needed.
 */
export function getSeatSelectionAvailabilityDialog({
	cabins,
	cabinType,
	passengers,
}: {
	cabins: Cabin[];
	cabinType: CabinType;
	passengers: SeatValidationPassenger[];
}): SeatSelectionDialogType | undefined {
	const availableSeatCodes = cabins
		.flatMap((cabin) => expandCabinRows(cabin))
		.flatMap((row) => row.seats)
		.filter((seat) => seat.isSeatAvailable)
		.map((seat) => seat.code);

	if (availableSeatCodes.length === 0) {
		return "NO_AVAILABLE_SEATS";
	}

	if (
		!hasRequiredAdjacentSeatAvailability({
			passengers,
			cabinType,
			availableSeatCodes,
		})
	) {
		return "NO_ADJACENT_SEATS";
	}

	return undefined;
}
