/**
 * File: country-utils.ts
 * Description: Helper functions to get route type and check if the route is US or THAI or Canada or narita.
 * It provides utilities for determining route types, validating travel document requirements.
 */

import type { FlightSegment } from "@/modules/utils/helpers/customer-information/travel-documents-utils/travel-documents-utils";

/* get country - route details */

// These airport codes are used to check whether the route is US or THAI or Canada or narita.
export const US_AIRPORT_CODES = ["HNL", "SFO", "SJC", "LAX", "IAH", "MCO"];

export const THAI_AIRPORT_CODES = ["BKK"];

export const CANADA_AIRPORT_CODES = ["YVR"];

export const NRT_AIRPORT_CODE = "NRT";

export const SIN_AIRPORT_CODE = "SIN";

export const BKK_AIRPORT_CODE = "BKK";

export const ICN_AIRPORT_CODE = "ICN";

export const HNL_AIRPORT_CODE = "HNL";

/**
 * Returns the route type based on the destination airport code.
 */
export const getRouteType = (destinationCode: string): "US" | "THAI" | "CANADA" | "OTHER" => {
	if (US_AIRPORT_CODES.includes(destinationCode)) return "US";
	if (THAI_AIRPORT_CODES.includes(destinationCode)) return "THAI";
	if (CANADA_AIRPORT_CODES.includes(destinationCode)) return "CANADA";
	return "OTHER";
};

/**
 * Returns true when any of the destination is a US airport.
 */
export const isDestinationUS = (segments: ReadonlyArray<FlightSegment>): boolean =>
	segments.some((segment) => getRouteType(segment.destination) === "US");

/**
 * Returns true when any of the destination is a Thai airport.
 */
export const isDestinationThai = (segments: ReadonlyArray<FlightSegment>): boolean =>
	segments.some((segment) => getRouteType(segment.destination) === "THAI");

/**
 * Returns true when any of the destination is a Canada airport.
 */
export const isDestinationCanada = (segments: ReadonlyArray<FlightSegment>): boolean =>
	segments.some((segment) => getRouteType(segment.destination) === "CANADA");

/**
 * Returns true when ANY segment in the itinerary has a US origin or US destination.
 * Works for one-way, roundtrip, and multi-city/connecting flights.
 */
export const isAnyUSRoute = (segments: ReadonlyArray<FlightSegment>): boolean =>
	segments.some(
		(s) => US_AIRPORT_CODES.includes(s.origin) || US_AIRPORT_CODES.includes(s.destination)
	);

/**
 * Returns true when ANY segment in the itinerary has a CANADA origin or CANADA destination.
 * Works for one-way, roundtrip, and multi-city/connecting flights.
 */
export const isAnyCANADARoute = (segments: ReadonlyArray<FlightSegment>): boolean =>
	segments.some(
		(s) => CANADA_AIRPORT_CODES.includes(s.origin) || CANADA_AIRPORT_CODES.includes(s.destination)
	);

/**
 * Returns true when ANY segment in the itinerary has ICN as its origin or destination.
 */
export const isAnyICNRoute = (segments: ReadonlyArray<FlightSegment>): boolean =>
	segments.some((s) => s.origin === ICN_AIRPORT_CODE || s.destination === ICN_AIRPORT_CODE);

/**
 * Returns true when the itinerary uses ICN as an origin or destination.
 */
export const isICNRoute = (segments: ReadonlyArray<FlightSegment>): boolean =>
	isAnyICNRoute(segments);

/**
 * Returns true when the first segment's departure airport is in the US.
 */
export const isUSDeparture = (segments: ReadonlyArray<FlightSegment>): boolean => {
	const firstSegment = segments?.[0];
	return firstSegment ? US_AIRPORT_CODES.includes(firstSegment.origin) : false;
};

/**
 * Determines whether the route is from Narita (NRT) to Honolulu (HNL).
 */
export const isDestinationHNLfromNRT = (origin?: string, destination?: string): boolean =>
	origin === NRT_AIRPORT_CODE && destination === HNL_AIRPORT_CODE;

/**
 * Determines whether the route is from Narita (NRT) to Honolulu (HNL).
 */
export const isDestinationNRTfromHNL = (origin?: string, destination?: string): boolean =>
	origin === HNL_AIRPORT_CODE && destination === NRT_AIRPORT_CODE;

/**
 * Determines whether transport services are available for the route.
 */
export function isTransportServiceRouteEnabled(origin?: string, destination?: string): boolean {
	return (
		isDestinationHNLfromNRT(origin, destination) || isDestinationNRTfromHNL(origin, destination)
	);
}

/**
 * Returns true when the first outbound segment is NRT to ICN.
 */
export const isNRTToICNRoute = (segments: ReadonlyArray<FlightSegment>): boolean => {
	const firstSegment = segments[0];
	return firstSegment?.origin === NRT_AIRPORT_CODE && firstSegment.destination === ICN_AIRPORT_CODE;
};

export const isOriginfromLoungeApplicableCountry = (origin?: string): boolean => {
	return (
		origin === NRT_AIRPORT_CODE ||
		origin === SIN_AIRPORT_CODE ||
		origin === HNL_AIRPORT_CODE ||
		origin === BKK_AIRPORT_CODE
	);
};

export function isLoungeServiceRouteEnabled(origin?: string): boolean {
	return isOriginfromLoungeApplicableCountry(origin);
}

/** Returns true for flights departing from NRT to ICN. */
export const isKoreanFlightNrtDeparture = (source: string, destination: string): boolean => {
	if (source === "NRT" && destination === "ICN") {
		return true;
	}
	return false;
};

/** Returns true for flights departing from ICN or for routes where neither the departure nor arrival airport is ICN. */
export const isKoreanFlight = (source: string, destination: string): boolean => {
	const isNonKoreanFlight = (source === "NRT" || source !== "ICN") && destination !== "ICN";
	const isKoreanFlight = source === "ICN";

	if (isNonKoreanFlight || isKoreanFlight) {
		return true;
	}

	return false;
};
