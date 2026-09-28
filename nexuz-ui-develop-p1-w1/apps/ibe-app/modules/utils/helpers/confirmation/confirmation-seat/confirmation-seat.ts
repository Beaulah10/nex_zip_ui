/**
 * File: confirmation-seat.ts
 * Confirmation-specific helpers for opening the existing seat-map dialog flow
 * from the reservation confirmation page.
 */

import type { ErrorDialogAction } from "@/components/common/error-dialog/error-dialog";
import { SPECIAL_ASSISTANCE_SSR_CODES } from "@/modules/utils/constants/customer-information/constants";
import {
	EMERGENCY_EXIT_SEAT_CODES,
	EMERGENCY_EXIT_SERVICE_CODE,
} from "@/modules/utils/constants/seat-map/seat-map.constants";
import { getAirportRouteLabel } from "@/modules/utils/helpers/airport";
import {
	type BookingFlowDirection,
	getBookingStageSegment,
} from "@/modules/utils/helpers/common/flow-router/flow-router";
import { buildSeatMapFromApiResponse } from "@/modules/utils/helpers/seat-map/build-seat-map-utils/build-seat-map-utils";
import { isNoAvailableSeatsSeatMapError } from "@/modules/utils/helpers/seat-map/seat-map-api-error/seat-map-api-error";
import {
	getSeatSelectionAvailabilityDialog,
	toSeatValidationPassengers,
} from "@/modules/utils/helpers/seat-map/seat-selection-availability/seat-selection-availability";
import {
	buildAvailableSeatCodeSet,
	getCancelledSeatSelections,
} from "@/modules/utils/helpers/seat-map/seat-selection-cancellation/seat-selection-cancellation";
import type { AppDispatch } from "@/store";
import type { ConfirmedFlightPayload } from "@/store/slices/flight-selection/flight-selection.slice";
import {
	buildRetrieveSeatMapRequest,
	clearSeatMap,
	fetchSeatMapOffers,
} from "@/store/slices/seat-map/seat-map.slice";
import type {
	ConfirmationFlightLegDisplay,
	ConfirmationSeatActionResult,
	ConfirmationSeatDialogState,
	ConfirmationSeatErrorState,
	OrderedPassengerWithNames,
} from "@/types/confirmation/confirmation.types";
import type { PassengerValues } from "@/types/passenger/passenger.type";
import type {
	Cabin,
	CancelledSeatSelection,
	SeatSelectionDialogType,
} from "@/types/seat-map/seat-map.types";

/** Returns the dialog action to perform for a seat-selection error type. */
export function getSeatMapDialogAction(dialogType: SeatSelectionDialogType): ErrorDialogAction {
	switch (dialogType) {
		case "NO_AVAILABLE_SEATS":
			return "close";
		case "NO_ADJACENT_SEATS":
		case "UNAVAILABLE_SELECTED_SEAT":
			return "returnToTop";
	}
}

/** Builds the service-unavailable error state shown when seat data cannot be retrieved. */
export function buildConfirmationSeatUnavailableErrorState(
	t: (key: string) => string
): ConfirmationSeatErrorState {
	return {
		open: true,
		title: t("service_unavailable_session_title"),
		content: t("service_unavailable_session_message"),
		action: "close",
		unavailableSeatSelections: [],
	};
}

/** Builds the seat-selection error dialog state for the specified validation or availability error. */
export function buildConfirmationSeatErrorState({
	dialogType,
	seatLabels,
	seatSelectionsToRemove = [],
	contentSuffix,
	useAdjacentSeatCancellationMessage,
}: {
	dialogType: SeatSelectionDialogType;
	seatLabels: (key: string) => string;
	seatSelectionsToRemove?: CancelledSeatSelection[];
	contentSuffix?: string;
	useAdjacentSeatCancellationMessage?: boolean;
}): ConfirmationSeatErrorState {
	const titleByDialogType: Record<SeatSelectionDialogType, string> = {
		NO_AVAILABLE_SEATS: seatLabels("error_labels.no_available_seats_title"),
		NO_ADJACENT_SEATS: seatLabels("error_labels.no_adjacent_seats_title"),
		UNAVAILABLE_SELECTED_SEAT: seatLabels("error_labels.cancelled_selection_title"),
	};

	const contentByDialogType: Record<SeatSelectionDialogType, string> = {
		NO_AVAILABLE_SEATS: seatLabels("error_labels.no_available_seats_content"),
		NO_ADJACENT_SEATS: seatLabels("error_labels.no_adjacent_seats_content"),
		UNAVAILABLE_SELECTED_SEAT: useAdjacentSeatCancellationMessage
			? seatLabels("error_labels.cancelled_adjacent_selection_content")
			: [
					seatLabels("error_labels.cancelled_selection_content_line_1"),
					seatLabels("error_labels.cancelled_selection_content_line_2"),
				].join(" "),
	};

	const buttonLabelByDialogType: Record<SeatSelectionDialogType, string> = {
		NO_AVAILABLE_SEATS: seatLabels("error_labels.no_available_seats_button"),
		NO_ADJACENT_SEATS: seatLabels("error_labels.no_adjacent_seats_button"),
		UNAVAILABLE_SELECTED_SEAT: seatLabels("error_labels.cancelled_selection_ok_button"),
	};

	return {
		open: true,
		title: titleByDialogType[dialogType],
		content: contentSuffix
			? `${contentByDialogType[dialogType]}\n\n${contentSuffix}`
			: contentByDialogType[dialogType],
		buttonLabel: buttonLabelByDialogType[dialogType],
		action: getSeatMapDialogAction(dialogType),
		unavailableSeatSelections: seatSelectionsToRemove,
	};
}

/** Builds the route label displayed in the confirmation seat dialog for a flight leg. */
export function buildConfirmationSeatRouteLabel(legData: ConfirmationFlightLegDisplay): string {
	return getAirportRouteLabel([
		{
			origin: legData.itinerary.departureAirportCode,
			destination: legData.itinerary.arrivalAirportCode,
		},
	]);
}

/**
 * Returns true when the passenger has any special-assistance SSR that makes an
 * emergency exit seat invalid.
 */
function hasSpecialAssistanceService(passenger: PassengerValues): boolean {
	return (
		passenger.services?.["non-chargeable"]?.some((service) =>
			SPECIAL_ASSISTANCE_SSR_CODES.has(service.ssrCode)
		) ?? false
	);
}

/**
 * Returns true when the passenger currently holds an emergency exit seat on the
 * specified segment.
 */
function hasEmergencyExitSeatOnSegment(
	passenger: PassengerValues,
	lfid: number,
	pfid: number
): boolean {
	return (
		passenger.seats?.some((seat) => {
			if (seat.lfid !== lfid || seat.pfid !== pfid) {
				return false;
			}

			return (
				seat.serviceCode === EMERGENCY_EXIT_SERVICE_CODE &&
				EMERGENCY_EXIT_SEAT_CODES.has(`${seat.row}${seat.column}`)
			);
		}) ?? false
	);
}

/**
 * Returns the passenger ids that should show the emergency-exit restriction on
 * confirmation for the selected flight direction.
 */
export function getConfirmationEmergencyExitRestrictedPassengerIds({
	confirmedFlight,
	direction,
	storedPassengers,
}: {
	confirmedFlight: ConfirmedFlightPayload;
	direction: BookingFlowDirection;
	storedPassengers: PassengerValues[];
}): string[] {
	const seatSegment = getConfirmationSeatSegment({ confirmedFlight, direction });

	if (!seatSegment) {
		return [];
	}

	const segmentPfid = seatSegment.pfid ?? 0;

	return storedPassengers
		.filter(
			(passenger) =>
				hasSpecialAssistanceService(passenger) &&
				hasEmergencyExitSeatOnSegment(passenger, seatSegment.lfid, segmentPfid)
		)
		.map((passenger) => passenger.id);
}

/** Returns the flight segment used for confirmation page seat-selection actions. */
export function getConfirmationSeatSegment({
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

/**
 * Returns true when the passenger has a bundle
 * on the specified flight segment.
 */
function hasBundleOnSegment(passenger: PassengerValues, lfid: number): boolean {
	return passenger.bundles?.some((bundle) => bundle.lfid === lfid) ?? false;
}

/** Validates seat availability and prepares the seat dialog or related error state. */
export async function prepareConfirmationSeatDialog({
	dispatch,
	locale,
	confirmedFlight,
	direction,
	passengerId,
	stageLabel,
	routeLabel,
	orderedPassengersWithNames,
	storedPassengers,
}: {
	dispatch: AppDispatch;
	locale: string;
	confirmedFlight: ConfirmedFlightPayload;
	direction: BookingFlowDirection;
	passengerId: string;
	stageLabel: string;
	routeLabel: string;
	orderedPassengersWithNames: OrderedPassengerWithNames[];
	storedPassengers: PassengerValues[];
}): Promise<ConfirmationSeatActionResult> {
	const seatSegment = getConfirmationSeatSegment({ confirmedFlight, direction });

	if (!seatSegment) {
		return { type: "noop" };
	}

	const seatDialogState: ConfirmationSeatDialogState = {
		open: true,
		direction,
		passengerId,
		stageLabel,
		routeLabel,
	};

	let request: ReturnType<typeof buildRetrieveSeatMapRequest>;

	try {
		request = buildRetrieveSeatMapRequest(confirmedFlight, seatSegment);
	} catch {
		return { type: "service-unavailable" };
	}

	const resultAction = await dispatch(
		fetchSeatMapOffers({
			locale,
			request,
		})
	);

	if (fetchSeatMapOffers.fulfilled.match(resultAction)) {
		const cabinClass: Cabin["class"] = request.cabin === "ZIPFULLFLAT" ? "ZipFullFlat" : "Standard";
		const builtSeatMap = buildSeatMapFromApiResponse(
			resultAction.payload.data?.seatInfo ?? [],
			cabinClass
		);

		const availableSeatCodes = buildAvailableSeatCodeSet(builtSeatMap);
		const cancelledSelections = getCancelledSeatSelections({
			orderedPassengersWithNames,
			storedPassengers,
			lfid: seatSegment.lfid,
			pfid: seatSegment.pfid ?? 0,
			availableSeatCodes,
		});
		const seatSelectionDialog = getSeatSelectionAvailabilityDialog({
			cabins: builtSeatMap,
			cabinType: request.cabin === "ZIPFULLFLAT" ? "ZIP_FULL_FLAT" : "STANDARD",
			passengers: toSeatValidationPassengers(orderedPassengersWithNames),
		});

		if (cancelledSelections.length > 0) {
			const passengerById = new Map(storedPassengers.map((passenger) => [passenger.id, passenger]));
			const isBundleSeatUnavailable = cancelledSelections.some((selection) => {
				const passenger = passengerById.get(selection.passengerId);
				return passenger ? hasBundleOnSegment(passenger, seatSegment.lfid) : false;
			});
			if (isBundleSeatUnavailable) {
				return {
					type: "open-seat-error-dialog",
					dialogType: "UNAVAILABLE_SELECTED_SEAT",
					seatDialogState: { ...seatDialogState, open: false },
					seatSelectionsToRemove: cancelledSelections,
					isBundleSeatUnavailable: true,
				};
			}
			// Existing No Bundle flow
			const contentSuffix = cancelledSelections
				.map((selection) => `${selection.seatCode} : ${selection.passengerName}`)
				.join("\n");

			return {
				type: "open-seat-error-dialog",
				dialogType: "UNAVAILABLE_SELECTED_SEAT",
				seatDialogState: { ...seatDialogState, open: false },
				seatSelectionsToRemove: cancelledSelections,
				contentSuffix,
			};
		}

		if (seatSelectionDialog) {
			dispatch(clearSeatMap());
			return {
				type: "open-seat-error-dialog",
				dialogType: seatSelectionDialog,
				seatDialogState: { ...seatDialogState, open: false },
			};
		}

		return {
			type: "open-seat-dialog",
			seatDialogState,
		};
	}

	if (resultAction.meta.condition) {
		return { type: "noop" };
	}

	if (
		fetchSeatMapOffers.rejected.match(resultAction) &&
		isNoAvailableSeatsSeatMapError(resultAction.payload)
	) {
		return {
			type: "open-seat-error-dialog",
			dialogType: "NO_AVAILABLE_SEATS",
		};
	}

	return { type: "service-unavailable" };
}
