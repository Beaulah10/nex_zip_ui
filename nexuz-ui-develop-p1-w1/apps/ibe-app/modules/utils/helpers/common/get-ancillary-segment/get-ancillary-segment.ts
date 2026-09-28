/**
 * File: get-ancillary-segment.ts
 * Description: Helper function that resolves the flight segment to be used for
 * ancillary selection based on the current booking flow direction and booking stage.
 * It prioritizes the first outbound segment for segment1, the first inbound segment
 * (or second outbound segment as a fallback) for segment2, and applies direction-based
 * fallback logic when no specific stage segment is identified.
 */

import type { BookingFlowDirection } from "@/modules/utils/helpers/common/flow-router/flow-router";
import { getBookingStageSegment } from "@/modules/utils/helpers/common/flow-router/flow-router";
import type { selectConfirmedFlight } from "@/store/slices/flight-selection/flight-selection.slice";

export function getSelectedAncillarySegment({
	confirmedFlight,
	direction,
}: {
	confirmedFlight: NonNullable<ReturnType<typeof selectConfirmedFlight>>;
	direction: BookingFlowDirection;
}) {
	const stageSegment = getBookingStageSegment({ confirmedFlight, direction });

	if (stageSegment === "segment1") {
		return confirmedFlight.flights.outbound.segments[0];
	}

	if (stageSegment === "segment2") {
		return (
			confirmedFlight.flights.inbound?.segments[0] ?? confirmedFlight.flights.outbound.segments[1]
		);
	}

	return direction === "outbound"
		? confirmedFlight.flights.outbound.segments[0]
		: (confirmedFlight.flights.inbound?.segments[0] ??
				confirmedFlight.flights.outbound.segments[0]);
}
