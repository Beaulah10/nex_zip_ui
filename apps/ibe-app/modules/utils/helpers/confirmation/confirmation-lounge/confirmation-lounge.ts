/**
 * File: confirmation-lounge.ts
 * Confirmation-specific helpers for opening the existing airport lounge dialog
 * from the reservation confirmation page.
 */

import type { NEXUZR004OffersAncillaryResponse } from "@repo/sdk";
import { getAirportRouteLabel } from "@/modules/utils/helpers/airport";
import {
	type BookingFlowDirection,
	getBookingDirectionLabel,
	getBookingStageSegment,
} from "@/modules/utils/helpers/common/flow-router/flow-router";
import type { AppDispatch } from "@/store";
import {
	buildRetrieveOfferAncillariesRequest,
	fetchAncillaryOffers,
} from "@/store/slices/common/ancillary-offers/ancillary-offers";
import type { ConfirmedFlightPayload } from "@/store/slices/flight-selection/flight-selection.slice";
import type { PreparedConfirmationLoungeActionResult } from "@/types/confirmation/confirmation.types";
import type { Passenger } from "@/types/customer-information/customer-information.types";

export type ConfirmationLoungeActionResult = PreparedConfirmationLoungeActionResult;

/**
 * Returns the flight segment associated with the selected booking direction.
 * Resolves the correct outbound or inbound segment based on the booking stage.
 */
function getConfirmationLoungeSegment({
	confirmedFlight,
	direction,
}: {
	confirmedFlight: ConfirmedFlightPayload;
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

function getAncillaryData(
	resultAction: ReturnType<AppDispatch>
): NEXUZR004OffersAncillaryResponse | undefined {
	return fetchAncillaryOffers.fulfilled.match(resultAction) ? resultAction.payload : undefined;
}

/**
 * Prepares and opens the lounge dialog from the confirmation page.
 * Fetches lounge ancillary offers and returns dialog state when successful.
 */
export async function prepareConfirmationLoungeDialog({
	dispatch,
	confirmedFlight,
	direction,
	passengerId,
	passengers,
}: {
	dispatch: AppDispatch;
	confirmedFlight: ConfirmedFlightPayload;
	direction: BookingFlowDirection;
	passengerId: string;
	passengers: Passenger[];
}): Promise<ConfirmationLoungeActionResult> {
	const selectedSegment = getConfirmationLoungeSegment({ confirmedFlight, direction });

	if (!selectedSegment) {
		return { type: "noop" };
	}

	let request: ReturnType<typeof buildRetrieveOfferAncillariesRequest>;

	try {
		request = buildRetrieveOfferAncillariesRequest({
			confirmedFlight,
			segment: selectedSegment,
			passengers,
			serviceCategory: "LOUNGE",
		});
	} catch {
		return { type: "noop" };
	}

	const ancillaryScope = getBookingStageSegment({ confirmedFlight, direction });
	const resultAction = await dispatch(
		fetchAncillaryOffers({
			scope: ancillaryScope,
			request,
		})
	);

	if (fetchAncillaryOffers.rejected.match(resultAction)) {
		if (resultAction.meta.condition) {
			return { type: "noop" };
		}

		return { type: "service-unavailable" };
	}

	const ancillaryData = getAncillaryData(resultAction);

	if (!ancillaryData) {
		return { type: "noop" };
	}

	return {
		type: "open-lounge-dialog",
		ancillaryData,
		loungeDialogState: {
			open: true,
			passengerId,
			direction,
			stageLabel: getBookingDirectionLabel({ confirmedFlight, direction }),
			routeLabel: getAirportRouteLabel([selectedSegment]),
			ancillaryScope,
			originCode: selectedSegment.origin,
			segmentLfid: selectedSegment.lfid,
		},
	};
}
