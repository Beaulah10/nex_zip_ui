import type { AirportFullNameMap, AirportMessagesShape } from "@/types/airport.types";

export const AIRPORT_MAP: Record<string, string> = {
	NRT: "Tokyo",
	ICN: "Seoul",
	TPE: "Taipei",
	BKK: "Bangkok",
	SIN: "Singapore",
	HNL: "Honolulu",
	YVR: "Vancouver",
	SFO: "San Francisco",
	SJC: "San Jose",
	LAX: "Los Angeles",
	IAH: "Houston",
	MCO: "Orlando",
	KUL: "Kuala Lumpur",
};

export const getAirportFullNameMap = (messages?: AirportMessagesShape): AirportFullNameMap => {
	const airports = messages?.flight_selection_page?.airports ?? [];

	return Object.fromEntries(
		airports.map(({ iata_code, airport }) => [iata_code.toUpperCase(), airport])
	) as AirportFullNameMap;
};

// Name only
export const getAirportName = (code?: string) => {
	if (!code) return "";

	return AIRPORT_MAP[code.toUpperCase()] ?? code;
};

export const getAirportFullName = (code?: string, airportFullNameMap?: AirportFullNameMap) => {
	if (!code) return "";

	const normalizedCode = code.toUpperCase();

	return airportFullNameMap?.[normalizedCode] ?? code;
};

// Name + Code
export const getAirportDisplayName = (code?: string) => {
	if (!code) return "";

	const name = AIRPORT_MAP[code.toUpperCase()];

	return name ? `${name} (${code.toUpperCase()})` : code;
};

/**
 * Readable route label for a flight bound,
 * e.g. "Tokyo Narita (NRT) – Bangkok (BKK)".
 * Uses the departureSegment origin and destinationSegment destination to correctly
 * represent connecting flights.
 * Returns an empty string when segment data is unavailable.
 *
 * @param segments - Array of flight segments for the bound.
 */
export function getAirportRouteLabel(
	segments: Array<{ origin: string; destination: string }> | undefined
): string {
	const departureSegment = segments?.[0];
	const destinationSegment = segments?.[segments.length - 1];
	if (!departureSegment || !destinationSegment) return "";

	return `${getAirportDisplayName(departureSegment.origin)} – ${getAirportDisplayName(destinationSegment.destination)}`;
}

/**
 * Builds the ordered list of route segments for the flight menu bar.
 *
 * - Roundtrip (2 airports + return date): [outbound, return]
 * - Connecting (3+ airports):            full route with via intermediate airports
 * - One-way direct (2 airports):         [single segment]
 *
 * @param airports      - Ordered IATA codes parsed from the search request.
 * @param hasReturnDate - True when a return date is present (roundtrip indicator).
 */
export function getConnectingAirportRoutes(
	airports: string[],
	hasReturnDate: boolean
): Array<{ origin: string; destination: string; via?: string[] }> {
	if (hasReturnDate && airports.length === 2) {
		return [
			{ origin: airports[0] ?? "", destination: airports[1] ?? "" },
			{ origin: airports[1] ?? "", destination: airports[0] ?? "" },
		];
	}

	if (airports.length > 2) {
		return [
			{
				origin: airports[0] ?? "",
				destination: airports[airports.length - 1] ?? "",
				via: airports.slice(1, -1),
			},
		];
	}

	if (airports.length === 2) {
		return [{ origin: airports[0] ?? "", destination: airports[1] ?? "" }];
	}

	return [];
}
