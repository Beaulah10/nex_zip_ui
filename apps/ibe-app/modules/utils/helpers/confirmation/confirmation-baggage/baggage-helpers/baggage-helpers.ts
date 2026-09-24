/**
 * File: baggage-helpers.ts
 * Description: Helper functions for managing baggage changes and removals on the confirmation page.
 */

import type { usePassengerOrder } from "@/modules/hooks/common/passenger-order/passenger-order";
import { bundleCodeToBundleIdMap } from "@/modules/utils/constants/baggage-service/baggage-selection-constants";
import { dispatchBaggageChanges } from "@/modules/utils/helpers/baggage-service/baggage-selection-utils/baggage-selection-utils";
import { collectBaggageSegmentMismatchPassengerIds } from "@/modules/utils/helpers/baggage-service/baggage-validation/baggage-validation";
import type { buildPassengerWithBaggageSelection } from "@/modules/utils/helpers/baggage-service/build-baggage-selection/build-baggage-selection";
import { getStoredBaggageByLfid } from "@/modules/utils/helpers/baggage-service/build-baggage-selection/build-baggage-selection";
import type { AppDispatch } from "@/store";
import type { ConfirmedFlightPayload } from "@/store/slices/flight-selection/flight-selection.slice";
import { removeService } from "@/store/slices/passenger/passenger.slice";
import type { PassengerBaggageServices } from "@/types/baggage-selection/baggage-selection.types";
import type { BundleCode } from "@/types/passenger/passenger.type";

export const checkOutOfStockForUpdatedServices = ({
	updatedBaggageServices,
	selectedBundleCode,
}: {
	updatedBaggageServices: PassengerBaggageServices;
	selectedBundleCode: BundleCode;
}) => {
	const selectedBundle = bundleCodeToBundleIdMap[selectedBundleCode] ?? "NOBN";
	const checkedInAvailable =
		updatedBaggageServices.checkedIn?.BAGN && updatedBaggageServices.checkedIn?.BAGN.quantity > 0;
	const cabinBaggageAvailable = updatedBaggageServices.carryOn?.CABN;
	if (selectedBundle === "VALUE") {
		return checkedInAvailable;
	}
	if (selectedBundle === "PREMIUM") {
		return checkedInAvailable && cabinBaggageAvailable;
	}
	if (selectedBundle === "FLEXBIZ") {
		return cabinBaggageAvailable;
	}
	return true;
};
export const outOfStockValidationForUpdatedServices = ({
	updatedBaggageServicesByPassengerId,
	baggageSelectionsByPassengerId,
}: {
	updatedBaggageServicesByPassengerId: Record<string, PassengerBaggageServices>;
	baggageSelectionsByPassengerId: ReturnType<typeof buildPassengerWithBaggageSelection>;
}) => {
	for (const [affectedPassengerId, updatedBaggageServices] of Object.entries(
		updatedBaggageServicesByPassengerId
	)) {
		const originalSelection = baggageSelectionsByPassengerId?.[affectedPassengerId];

		if (!originalSelection) {
			continue;
		}
		const isStockAvailable = checkOutOfStockForUpdatedServices({
			updatedBaggageServices,
			selectedBundleCode: originalSelection.passenger.bundleCode,
		});
		if (!isStockAvailable) {
			return true;
		}
	}
	return false;
};
// Helper functions for managing baggage changes due to unavailability
export const applyBaggageShortageChanges = ({
	dispatch,
	baggageSelectionsByPassengerId,
	updatedBaggageServicesByPassengerId,
	currentLfid,
}: {
	dispatch: AppDispatch;
	baggageSelectionsByPassengerId: ReturnType<typeof buildPassengerWithBaggageSelection>;
	updatedBaggageServicesByPassengerId: Record<string, PassengerBaggageServices>;
	currentLfid: number;
}) => {
	for (const [affectedPassengerId, updatedBaggageServices] of Object.entries(
		updatedBaggageServicesByPassengerId
	)) {
		const originalSelection = baggageSelectionsByPassengerId[affectedPassengerId];

		if (!originalSelection) {
			continue;
		}
		const originalBaggageServices = originalSelection.baggageServices;
		const carryOnService =
			updatedBaggageServices.carryOn.CABN ?? originalBaggageServices.carryOn.CABN;

		dispatchBaggageChanges({
			dispatch,
			passengerId: affectedPassengerId,
			currentLfid,
			changeType: "carry-on",
			original: Boolean(originalBaggageServices.carryOn.CABN),
			updated: Boolean(updatedBaggageServices.carryOn.CABN),
			service: carryOnService,
		});

		dispatchBaggageChanges({
			dispatch,
			passengerId: affectedPassengerId,
			currentLfid,
			changeType: "checked-in",
			original: originalBaggageServices.checkedIn,
			updated: updatedBaggageServices.checkedIn,
			ssrCodeFilter: "BAGN",
		});

		dispatchBaggageChanges({
			dispatch,
			passengerId: affectedPassengerId,
			currentLfid,
			changeType: "sports",
			original: originalBaggageServices.sportsEquipment,
			updated: updatedBaggageServices.sportsEquipment,
		});
	}
};
// Helper function to remove all baggage services for passengers
export const removeAllBaggageServicesForPassengers = ({
	dispatch,
	baggageSelectionsByPassengerId,
	currentLfid,
}: {
	dispatch: AppDispatch;
	baggageSelectionsByPassengerId: ReturnType<typeof buildPassengerWithBaggageSelection>;
	currentLfid: number;
}) => {
	for (const [affectedPassengerId, selection] of Object.entries(baggageSelectionsByPassengerId)) {
		Object.values(selection.baggageServices).forEach((service) => {
			dispatch(
				removeService({
					passengerId: affectedPassengerId,
					lfid: Number(currentLfid),
					serviceID: service.serviceID,
					ssrCode: service.ssrCode,
				})
			);
		});
	}
};

// Helper functions for Segment mismatch summary
export const getBaggageSegmentComparisonSummary = ({
	isConnectingFlight,
	confirmedFlight,
	orderedPassengersWithNames,
}: {
	isConnectingFlight: boolean;
	confirmedFlight: Pick<ConfirmedFlightPayload, "tripType" | "flights"> | undefined;
	orderedPassengersWithNames: ReturnType<typeof usePassengerOrder>["orderedPassengersWithNames"];
}) => {
	if (!isConnectingFlight || !confirmedFlight) {
		return {
			segment1LessThanSegment2PassengerIds: [],
			segment1GreaterThanSegment2PassengerIds: [],
		};
	}

	const segment1Lfid = confirmedFlight.flights.outbound.segments[0]?.lfid;
	const segment2Lfid = (
		confirmedFlight.flights.inbound?.segments[0] ?? confirmedFlight.flights.outbound.segments[1]
	)?.lfid;

	const segment1Selections = getStoredBaggageByLfid({
		passengers: orderedPassengersWithNames,
		lfid: segment1Lfid,
		serviceCategory: "baggage",
	});

	const segment2Selections = getStoredBaggageByLfid({
		passengers: orderedPassengersWithNames,
		lfid: segment2Lfid,
		serviceCategory: "baggage",
	});

	return collectBaggageSegmentMismatchPassengerIds({
		passengerIds: orderedPassengersWithNames.map((passenger) => passenger.id),
		segment1Selections,
		segment2Selections,
	});
};
