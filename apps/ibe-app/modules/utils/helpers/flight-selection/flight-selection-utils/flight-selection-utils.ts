/**
 * File: flight-selection-utils.ts
 * Provides helper functions for evaluating outbound and connecting flight selections.
 * Used by the flight-selection flow to determine selection completeness and errors.
 */

import type {
	ConnectingFlightError,
	FlightCabinState,
	FlightDisplayItem,
} from "@/types/flight-selection/flight-selection.types";

/**
 * Checks whether the outbound flight selection is incomplete.
 *
 * Returns true when:
 * - no cabin has been selected
 * - one or more connecting flights have only a subset of segments selected
 *
 * @param selectedCabins Cabin selections keyed by flight identifier.
 * @param flights Outbound flights currently displayed to the user.
 * @returns True when the outbound selection is incomplete.
 */
export const isOutboundSelectionIncomplete = (
	selectedCabins: FlightCabinState,
	flights: Array<{ id: string; segments?: unknown[] }>
): boolean => {
	const selectedKeys = Object.keys(selectedCabins).filter((key) => selectedCabins[key]);

	if (selectedKeys.length === 0) {
		return true;
	}

	const segmentKeys = selectedKeys.filter((key) => key.includes("-segment-"));

	if (segmentKeys.length === 0) {
		return false;
	}

	const selectedSegmentCounts: Record<string, number> = {};

	for (const key of segmentKeys) {
		const flightId = key.split("-segment-")[0];

		if (!flightId) {
			continue;
		}

		selectedSegmentCounts[flightId] = (selectedSegmentCounts[flightId] ?? 0) + 1;
	}

	return Object.entries(selectedSegmentCounts).some(([flightId, selectedCount]) => {
		const flight = flights.find((item) => item.id === flightId);

		const totalSegments = flight?.segments?.length ?? 0;

		return selectedCount < totalSegments;
	});
};

/**
 * Returns connecting-flight selection errors.
 *
 * Generates one error per connecting itinerary when all required
 * segments have not been selected.
 *
 * @param flights Flights displayed to the user.
 * @param selectedCabins Cabin selections keyed by flight identifier.
 * @param t Translation function used to generate localized error messages.
 * @returns Collection of connecting-flight selection errors.
 */
export const getConnectingFlightSelectionErrors = (
	flights: FlightDisplayItem[],
	selectedCabins: FlightCabinState,
	t: (key: string, values?: Record<string, string | number | Date>) => string
): ConnectingFlightError[] => {
	const connectingFlights = flights.filter((flight) => flight.isConnectingFlight);

	const startedFlights = connectingFlights.filter((flight) => {
		const segments = flight.segments ?? [];

		return segments.some((_, index) => !!selectedCabins[`${flight.id}-segment-${index}`]);
	});

	if (startedFlights.length === 0) {
		return connectingFlights.map((flight) => ({
			groupId: flight.id,
			message: t("flight_selection_error_label"),
		}));
	}

	const errors: ConnectingFlightError[] = [];

	for (const flight of startedFlights) {
		const segments = flight.segments ?? [];

		const selectedSegments = segments.map(
			(_, index) => selectedCabins[`${flight.id}-segment-${index}`]
		);

		const selectedCount = selectedSegments.filter(Boolean).length;

		if (selectedCount === 0) {
			continue;
		}

		const firstMissingSegmentIndex = selectedSegments.findIndex((value) => !value);

		if (firstMissingSegmentIndex !== -1) {
			errors.push({
				groupId: flight.id,
				message: t("segment_selection_error_label", {
					number: firstMissingSegmentIndex + 1,
				}),
			});
		}
	}

	return errors;
};
