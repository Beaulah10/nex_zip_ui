/**
 * File: confirmation-priority.ts
 * Confirmation-specific helpers for opening the existing priority service dialog
 * from the reservation confirmation page.
 */

import type { NEXUZR004OffersAncillaryResponse } from "@repo/sdk";
import { getAirportRouteLabel } from "@/modules/utils/helpers/airport";
import {
	type BookingFlowDirection,
	getBookingDirectionLabel,
	getBookingStageSegment,
} from "@/modules/utils/helpers/common/flow-router/flow-router";
import { getSelectedAncillarySegment } from "@/modules/utils/helpers/common/get-ancillary-segment/get-ancillary-segment";
import type { AppDispatch } from "@/store";
import {
	buildRetrieveOfferAncillariesRequest,
	fetchAncillaryOffers,
} from "@/store/slices/common/ancillary-offers/ancillary-offers";
import type { ConfirmedFlightPayload } from "@/store/slices/flight-selection/flight-selection.slice";
import type { PreparedConfirmationPriorityActionResult } from "@/types/confirmation/confirmation.types";
import type { Passenger } from "@/types/customer-information/customer-information.types";

/**
 * Extracts ancillary data from a fulfilled fetch action.
 * Rejected or skipped actions return no confirmation data.
 */
function getAncillaryData(
	resultAction: ReturnType<AppDispatch>
): NEXUZR004OffersAncillaryResponse | undefined {
	return fetchAncillaryOffers.fulfilled.match(resultAction) ? resultAction.payload : undefined;
}

/**
 * Prepares the confirmation-page priority dialog for one passenger.
 * It loads ancillary data and returns the dialog state or a fallback result.
 */
export async function prepareConfirmationPriorityDialog({
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
}): Promise<PreparedConfirmationPriorityActionResult> {
	const selectedSegment = getSelectedAncillarySegment({ confirmedFlight, direction });

	if (!selectedSegment) {
		return { type: "noop" };
	}

	let request: ReturnType<typeof buildRetrieveOfferAncillariesRequest>;

	try {
		request = buildRetrieveOfferAncillariesRequest({
			confirmedFlight,
			segment: selectedSegment,
			passengers,
			serviceCategory: "AMENITIES",
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
		type: "open-priority-dialog",
		ancillaryData,
		priorityDialogState: {
			open: true,
			passengerId,
			direction,
			stageLabel: getBookingDirectionLabel({ confirmedFlight, direction }),
			routeLabel: getAirportRouteLabel([selectedSegment]),
			segmentLfid: selectedSegment.lfid,
		},
	};
}
