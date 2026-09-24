/**
 * File: seat-map-segment-utils.ts
 * Description: Provides helper utilities for resolving the active seat map flight segment and
 * retrieving passenger bundle information for a specific flight.
 */

import type { BookingFlowDirection } from "@/modules/utils/helpers/common/flow-router/flow-router";
import { getBookingStageSegment } from "@/modules/utils/helpers/common/flow-router/flow-router";
import type {
	ConfirmedFlightPayload,
	SelectedSegment,
} from "@/store/slices/flight-selection/flight-selection.slice";
import type { BundleCode, PassengerValues } from "@/types/passenger/passenger.type";

function getAllFlightSegments(confirmedFlight: ConfirmedFlightPayload): SelectedSegment[] {
	return [
		...confirmedFlight.flights.outbound.segments,
		...(confirmedFlight.flights.inbound?.segments ?? []),
	];
}

function getStageFallbackSegment(
	confirmedFlight: ConfirmedFlightPayload,
	direction: BookingFlowDirection
): SelectedSegment | undefined {
	const stageSegment = getBookingStageSegment({ confirmedFlight, direction });

	if (stageSegment === "segment2") {
		return (
			confirmedFlight.flights.inbound?.segments?.[0] ??
			confirmedFlight.flights.outbound.segments?.[1]
		);
	}

	if (stageSegment === "inbound") {
		return confirmedFlight.flights.inbound?.segments?.[0];
	}

	return confirmedFlight.flights.outbound.segments?.[0];
}

export function getActiveSeatMapSegment({
	confirmedFlight,
	direction,
	logicalFlightId,
}: {
	confirmedFlight?: ConfirmedFlightPayload;
	direction: BookingFlowDirection;
	logicalFlightId?: number;
}): SelectedSegment | undefined {
	if (!confirmedFlight) {
		return undefined;
	}

	if (logicalFlightId !== undefined) {
		const matchingSegment = getAllFlightSegments(confirmedFlight).find(
			(segment) => segment.lfid === logicalFlightId
		);

		if (matchingSegment) {
			return matchingSegment;
		}
	}

	return getStageFallbackSegment(confirmedFlight, direction);
}

export function getPassengerBundleCodeByLfid(
	passenger: PassengerValues,
	lfid?: number
): BundleCode | undefined {
	if (lfid === undefined) {
		return undefined;
	}

	return passenger.bundles?.find((bundle) => bundle.lfid === lfid)?.bundleCode;
}
