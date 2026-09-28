/**
 * File: use-seat-map-passenger-panel.ts
 * Description: Custom hook that prepares all data needed by SeatMapPassengerPanel.
 * Combines ordered passenger data (via getPassengerOrder), bundle selections,
 * and confirmed flight info from Redux into a ready-to-render UI data shape.
 */

import { useTranslations } from "next-intl";
import { useMemo } from "react";
import { usePassengerOrder } from "@/modules/hooks/common/passenger-order/passenger-order";
import {
	formatFullName,
	getBundleLabelFromCode,
	getFlightCode,
} from "@/modules/utils/helpers/seat-map/seat-map-passenger-panel/seat-map-passenger-panel";
import {
	getActiveSeatMapSegment,
	getPassengerBundleCodeByLfid,
} from "@/modules/utils/helpers/seat-map/seat-map-segment-utils/seat-map-segment-utils";
import { useAppSelector } from "@/store/hooks";
import { selectConfirmedFlight } from "@/store/slices/flight-selection/flight-selection.slice";
import { selectPassengers } from "@/store/slices/passenger/passenger.slice";
import { selectSeatMapRequest } from "@/store/slices/seat-map/seat-map.slice";
import type { BundleCode, PassengerValues } from "@/types/passenger/passenger.type";
import type {
	BundleByPassengerId,
	PassengerSeatRow,
	SeatMapPassengerPanelUIData,
	UseSeatMapPassengerPanelProps,
} from "@/types/seat-map/seat-map.types";

/**
 * Builds a read-only map from passenger id to the selected bundle code for the
 * active seat-map segment.
 *
 * @param reduxPassengers - The passengers array from the passenger Redux slice.
 * @param lfid            - Active flight segment logical id for the seat-map flow.
 */
function createBundleByPassengerIdMap(
	reduxPassengers: PassengerValues[],
	lfid: number | undefined
): BundleByPassengerId {
	const map = new Map<string, BundleCode>();

	for (const passenger of reduxPassengers) {
		const bundleCode = getPassengerBundleCodeByLfid(passenger, lfid);
		if (bundleCode) {
			map.set(passenger.id, bundleCode);
		}
	}

	return map;
}

/**
 * Maps an ordered list of passengers (with names) to PassengerSeatRow display objects.
 *
 * @param orderedPassengersWithNames - Passengers in display order with resolved first/last names.
 * @param bundleByPassengerId        - Bundle code lookup map keyed by passenger id.
 */
function createPassengerSeatRows(
	orderedPassengersWithNames: ReturnType<typeof usePassengerOrder>["orderedPassengersWithNames"],
	bundleByPassengerId: BundleByPassengerId,
	t: (key: string) => string
): PassengerSeatRow[] {
	return orderedPassengersWithNames.map((passenger) => ({
		name: formatFullName(passenger.firstName, passenger.lastName),
		bundle: getBundleLabelFromCode(
			bundleByPassengerId.get(passenger.id) as BundleCode | undefined,
			t
		),
		isInfant: passenger.passengerTypeCode === "infant",
	}));
}

/**
 * Prepares all display data for SeatMapPassengerPanel by reading from Redux
 * and the passenger order hook. Returns ordered passenger rows and the
 * flight route code for the given booking direction.
 *
 * @param props.direction - Booking flow direction ("outbound" or "inbound").
 */
export function useSeatMapPassengerPanel({
	direction,
}: Readonly<UseSeatMapPassengerPanelProps>): SeatMapPassengerPanelUIData {
	const t = useTranslations("seat_service");
	const { orderedPassengersWithNames } = usePassengerOrder();
	const reduxPassengers = useAppSelector(selectPassengers);
	const confirmedFlight = useAppSelector(selectConfirmedFlight);
	const seatMapRequest = useAppSelector(selectSeatMapRequest);
	const selectedSegment = useMemo(
		() =>
			getActiveSeatMapSegment({
				confirmedFlight,
				direction,
				logicalFlightId: seatMapRequest?.logicalFlightId,
			}),
		[confirmedFlight, direction, seatMapRequest?.logicalFlightId]
	);

	const flightCode = useMemo(
		() => getFlightCode(confirmedFlight, direction, selectedSegment),
		[confirmedFlight, direction, selectedSegment]
	);

	const bundleByPassengerId = useMemo(
		() => createBundleByPassengerIdMap(reduxPassengers, selectedSegment?.lfid),
		[reduxPassengers, selectedSegment?.lfid]
	);

	const passengers = useMemo<PassengerSeatRow[]>(
		() => createPassengerSeatRows(orderedPassengersWithNames, bundleByPassengerId, t),
		[orderedPassengersWithNames, bundleByPassengerId, t]
	);

	return { flightCode, passengers };
}
