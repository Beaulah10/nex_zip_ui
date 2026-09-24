/**
 * File: travel-documents-utils.ts
 * Description: Helper functions for travel document validation and route-specific travel rules.
 * It provides utilities for determining route types, validating travel document requirements, checking registration deadlines, and evaluating itinerary conditions for customer information workflows.
 */

import {
	DOCUMENT_TYPE_OPTIONS_DEFAULT,
	DOCUMENT_TYPE_OPTIONS_US,
} from "@/modules/utils/constants/customer-information/constants";
import { NRT_AIRPORT_CODE } from "@/modules/utils/helpers/common/country-utils/country-utils";
import type {
	ConfirmedFlightPayload,
	SelectedSegment,
} from "@/store/slices/flight-selection/flight-selection.slice";

/**
 * Returns the document type options based on the route.
 * US routes include Resident Alien Card and US Military ID in addition to the defaults.
 */
export const getDocumentTypeOptions = (
	isUS: boolean
): typeof DOCUMENT_TYPE_OPTIONS_US | typeof DOCUMENT_TYPE_OPTIONS_DEFAULT =>
	isUS ? DOCUMENT_TYPE_OPTIONS_US : DOCUMENT_TYPE_OPTIONS_DEFAULT;

// ── Segment-aware route helpers ───────────────────────────────────────────────

export type FlightSegment = Pick<SelectedSegment, "origin" | "destination">;
export const getFlightSegments = (flightDetails: ConfirmedFlightPayload): SelectedSegment[] => {
	const allSegments = [
		...flightDetails.flights.outbound.segments,
		...(flightDetails.flights.inbound?.segments ?? []),
	];
	return allSegments;
};

/**
 * Returns true when the itinerary involves NRT (Japan) as a direct one-way destination
 * or as part of a round trip. Connecting flights (multi-hop to reach NRT) are excluded.
 *
 * - One-way: single segment with destination = NRT
 * - Round trip: 2 segments where first origin = NRT or first destination = NRT
 * - Connecting (excluded): 2+ segments where NRT is reached via an intermediate stop
 */
export const isNRTDirectOrRoundTrip = (segments: ReadonlyArray<FlightSegment>): boolean => {
	const len = segments.length;
	if (len > 2 || len === 0) return false;

	const first = segments[0];
	if (!first) return false;
	if (len === 1) {
		return first.destination === NRT_AIRPORT_CODE;
	}
	const second = segments[1];
	if (!second) return false;

	// True roundtrip must be a reverse leg between the same two airports.
	const isReverseLeg = first.origin === second.destination && first.destination === second.origin;
	const hasNRTInPair = first.origin === NRT_AIRPORT_CODE || first.destination === NRT_AIRPORT_CODE;

	return isReverseLeg && hasNRTInPair;
};
