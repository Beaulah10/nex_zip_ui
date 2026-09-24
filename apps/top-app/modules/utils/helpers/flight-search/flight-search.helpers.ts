import type {
	FlightSearchApiParams,
	FlightSearchFormValues,
	MessageAirport,
	PassengerCounts,
	RouteGroups,
	TripType,
} from "@/types/flight-search/flight-search.types";

const DEV_BOOKING_APP_ORIGIN = "http://localhost:3000";

/**
 * Retrieves localized airport information by IATA code (case-insensitive).
 *
 * @param {MessageAirport[]} airports - Airport list from localized messages
 * @param {string} iata - The airport IATA code (e.g., "NRT")
 * @returns {MessageAirport | undefined} Matching localized airport data, if found
 */
export function getMessageAirportByIata(airports: MessageAirport[], iata: string) {
	return airports.find((airport) => airport.iata_code.toUpperCase() === iata.toUpperCase());
}

/**
 * Orders IATA codes based on localized airport display order from messages.
 * Codes missing in localized airports are placed after known codes.
 *
 * @param {string[]} iataCodes - IATA code list to sort
 * @param {MessageAirport[]} airports - Localized airports containing display_order
 * @returns {string[]} Sorted IATA list
 */
export function orderIataCodesByMessageAirports(
	iataCodes: string[],
	airports: MessageAirport[]
): string[] {
	const orderMap = new Map(
		airports.map((airport, index) => [
			airport.iata_code.toUpperCase(),
			typeof airport.display_order === "number" ? airport.display_order : index + 1,
		])
	);

	return [...iataCodes].sort((a, b) => {
		const orderA = orderMap.get(a.toUpperCase());
		const orderB = orderMap.get(b.toUpperCase());

		if (orderA === undefined && orderB === undefined) {
			return a.localeCompare(b);
		}
		if (orderA === undefined) {
			return 1;
		}
		if (orderB === undefined) {
			return -1;
		}

		if (orderA !== orderB) {
			return orderA - orderB;
		}

		return a.localeCompare(b);
	});
}

/**
 * Gets all available destination airports for a given origin in round-trip routes.
 * Removes duplicates using Set.
 *
 * @param {RouteGroups} data - Array of route groups containing origin/destination pairs
 * @param {string} origin - The origin airport IATA code (e.g., "NRT")
 * @returns {string[]} Array of unique destination IATA codes
 *
 * @example
 * const destinations = getRoundTripDestinations(routeData, "NRT");
 * // ["KIX", "FUK", "HND"]
 */
export function getRoundTripDestinations(data: RouteGroups, origin: string): string[] {
	return [
		...new Set(
			data
				.flat()
				.filter((item) => item.origin === origin)
				.map((item) => item.destination)
		),
	];
}
/**
 * Gets available destinations based on trip type and origin.
 * Routes differently for round-trip (direct destinations) vs one-way (connected routes).
 *
 * @param {RouteGroups} data - Array of route groups containing origin/destination pairs
 * @param {string} origin - The origin airport IATA code
 * @param {TripType} tripType - Type of trip: "round-trip" or "one-way"
 * @returns {string[]} Array of available destination IATA codes, empty array if no origin provided
 *
 * @example
 * // Round-trip: direct destinations from origin
 * getDestinations(routes, "NRT", "round-trip")
 * // ["KIX", "FUK"]
 *
 * // One-way: connected destinations through intermediate airports
 * getDestinations(routes, "NRT", "one-way")
 * // ["KIX", "FUK", "HAK"]
 */
export function getDestinations(data: RouteGroups, origin: string, tripType: TripType): string[] {
	if (!origin) {
		return [];
	}

	return tripType === "round-trip"
		? getRoundTripDestinations(data, origin)
		: getOneWayDestinations(data, origin);
}

/**
 * Gets available destinations for one-way trips by traversing connected routes.
 * Finds all destinations reachable from the start airport through intermediate hops.
 *
 * @private
 * @param {RouteGroups} data - Array of route groups containing connected segments
 * @param {string} start - The starting airport IATA code
 * @returns {string[]} Array of reachable destination IATA codes (excluding the start airport)
 *
 * @example
 * // Route structure: [NRT->HND->KIX], [NRT->NKE]
 * getOneWayDestinations(routes, "NRT")
 * // ["HND", "KIX", "NKE"]
 */
function getOneWayDestinations(data: RouteGroups, start: string): string[] {
	const result = new Set<string>();

	for (const journey of data) {
		let current = start;

		for (const { origin, destination } of journey) {
			if (origin === current) {
				result.add(destination);
				current = destination;
			} else {
				break;
			}
		}
	}

	return [...result].filter((item) => item !== start);
}

/**
 * Calculates the total number of passengers from a passenger count object.
 *
 * @param {PassengerCounts} counts - Object containing passenger counts by age bucket (adult, childA, childB, childC, infant)
 * @returns {number} Total count of all passengers
 *
 * @example
 * const counts = { adult: 2, childA: 1, childB: 0, childC: 0, infant: 0 };
 * getPassengerCount(counts)
 * // 3
 */
export function getPassengerCount(counts: PassengerCounts): number {
	return Object.values(counts).reduce((total, count) => total + count, 0);
}

/**
 * Default passenger counts for a new flight search.
 * Initializes with 1 adult passenger and 0 children/infants.
 *
 * @type {PassengerCounts}
 * @constant
 */
export const DEFAULT_PASSENGER_COUNTS: PassengerCounts = {
	adult: 1,
	childA: 0,
	childB: 0,
	childC: 0,
	infant: 0,
};

/**
 * IATA code for Tokyo Narita International Airport.
 * Used as default origin for IP location detection and as a hub airport for one-way connections.
 *
 * @type {string}
 * @constant
 * @private
 */
const TOKYO_NARITA_IATA = "NRT";

/**
 * Builds the routes string for flight search API based on origin, destination, and trip type.
 * For round-trips: returns "origin,destination"
 * For one-ways: returns "origin,NRT,destination" if neither is Narita, else "origin,destination"
 *
 * @param {string} origin - The origin airport IATA code
 * @param {string} destination - The destination airport IATA code
 * @param {TripType} tripType - Type of trip: "round-trip" or "one-way"
 * @returns {string} Formatted route string for API (e.g., "NRT,KIX" or "FUK,NRT,HAK")
 *
 * @example
 * buildSearchRoutes("NRT", "KIX", "round-trip")
 * // "NRT,KIX"
 *
 * buildSearchRoutes("FUK", "HAK", "one-way")
 * // "FUK,NRT,HAK" (connects through Narita)
 */
export function buildSearchRoutes(origin: string, destination: string, tripType: TripType): string {
	if (tripType === "round-trip") {
		return `${origin},${destination}`;
	}

	const isNaritaInRoute = origin === TOKYO_NARITA_IATA || destination === TOKYO_NARITA_IATA;

	return isNaritaInRoute
		? `${origin},${destination}`
		: `${origin},${TOKYO_NARITA_IATA},${destination}`;
}

/**
 * Calculates the next day's date from a given date string.
 * Used to set the end date for round-trip search range (departure date to next day).
 *
 * @private
 * @param {string} dateString - Date string in YYYY-MM-DD format (ISO 8601 without time)
 * @returns {string} Next day's date in YYYY-MM-DD format
 *
 * @example
 * getNextDate("2024-12-25")
 * // "2024-12-26"
 */
function getNextDate(dateString: string): string {
	const date = new Date(`${dateString}T00:00:00Z`);
	date.setUTCDate(date.getUTCDate() + 1);
	const year = date.getUTCFullYear();
	const month = String(date.getUTCMonth() + 1).padStart(2, "0");
	const day = String(date.getUTCDate()).padStart(2, "0");
	return `${year}-${month}-${day}`;
}

/**
 * Normalizes a travel date string to YYYY-MM-DD.
 *
 * Accepts canonical dates (YYYY-MM-DD) and display labels like "Jul 24".
 * For month/day labels, uses the current year.
 */
function normalizeToIsoDate(dateString: string): string {
	if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
		return dateString;
	}

	const currentYear = new Date().getFullYear();
	const parsed = new Date(`${dateString} ${currentYear}`);

	if (Number.isNaN(parsed.getTime())) {
		return dateString;
	}

	const year = parsed.getFullYear();
	const month = String(parsed.getMonth() + 1).padStart(2, "0");
	const day = String(parsed.getDate()).padStart(2, "0");

	return `${year}-${month}-${day}`;
}

/**
 * Determines if a one-way trip should be treated as a connecting flight.
 * Returns true if tripType is "one-way" and neither origin nor destination is Tokyo Narita.
 *
 * @param {TripType} tripType - Type of trip: "round-trip" or "one-way"
 * @param {string} origin - The origin airport IATA code
 * @param {string} destination - The destination airport IATA code
 * @returns {boolean} True if this is a one-way connecting flight (not using Narita as hub)
 *
 * @example
 * isConnectingFlightRoute("one-way", "FUK", "HAK")
 * // true (requires Narita connection)
 *
 * isConnectingFlightRoute("one-way", "NRT", "KIX")
 * // false (direct from Narita)
 */
export function isConnectingFlightRoute(
	tripType: TripType,
	origin: string,
	destination: string
): boolean {
	return (
		tripType === "one-way" && origin !== TOKYO_NARITA_IATA && destination !== TOKYO_NARITA_IATA
	);
}

/**
 * Generates tooltip text for origin/destination selection fields.
 * Provides context-specific messages based on whether the field is for arrival or departure,
 * and whether a location has been selected.
 *
 * @param {boolean} isArrival - Whether the tooltip is for arrival (true) or departure (false)
 * @param {string} value - The selected airport IATA code or empty string if not selected
 * @returns {string} Tooltip message describing the current state and action
 *
 * @example
 * getTooltipText(false, "NRT")
 * // "You have selected NRT. Please click here to change the Departure Location."
 *
 * getTooltipText(true, "")
 * // "You have not selected an arrival destination. Please click here to select the arrival destination."
 */
export const getTooltipText = (isArrival: boolean, value: string) => {
	if (isArrival) {
		if (!value) {
			return "You have not selected an arrival destination. Please click here to select the arrival destination.";
		}
		return `You have selected ${value}. Please click here to change the Arrival Location.`;
	}
	// Departure
	return `You have selected ${value}. Please click here to change the Departure Location.`;
};

/**
 * Maps form data stored in Redux to flight search API query parameters.
 *
 * Transforms frontend form values to backend API format:
 * - Passenger age buckets are renamed (childA, childB, childC, infant)
 * - For round-trips, adds departureDateTo (selected return date; falls back to next day)
 * - For one-ways, only uses departureDateFrom
 * - Omits passenger counts if zero to keep query string clean
 *
 * Passenger age buckets mapping:
 * - adult: 15 years and older
 * - childA: 12-14 years old
 * - childB: 7-11 years old
 * - childC: 2-6 years old
 * - infant: 0-1 year old
 *
 * @param {FlightSearchFormValues} formData - Flight search form values from Redux (origin, destination, dates, passengers, trip type)
 * @returns {FlightSearchApiParams} API query parameters ready to send to the flight search backend
 *
 * @example
 * const formData = {
 *   origin: "NRT",
 *   destination: "KIX",
 *   travelDates: { outboundDate: "2024-12-25", returnDate: "2025-01-01" },
 *   passengerCounts: { adult: 2, childA: 1, childB: 0, childC: 0, infant: 0 },
 *   tripType: "round-trip"
 * };
 *
 * mapFormDataToFlightSearchApiParams(formData)
 * // {
 * //   routes: "NRT,KIX",
 * //   departureDateFrom: "2024-12-25",
 * //   departureDateTo: "2025-01-01",
 * //   adult: "2",
 * //   childA: "1"
 * // }
 */
export function mapFormDataToFlightSearchApiParams(
	formData: FlightSearchFormValues
): FlightSearchApiParams {
	const { origin, destination, travelDates, passengerCounts, tripType } = formData;
	const routes = buildSearchRoutes(origin, destination, tripType);
	const departureDateFrom = normalizeToIsoDate(travelDates.outboundDate);
	const normalizedReturnDate = travelDates.returnDate
		? normalizeToIsoDate(travelDates.returnDate)
		: "";
	const departureDateTo =
		tripType === "round-trip" ? normalizedReturnDate || getNextDate(departureDateFrom) : undefined;

	return {
		routes,
		departureDateFrom,
		...(departureDateTo ? { departureDateTo } : {}),
		adult: String(passengerCounts.adult),
		...(passengerCounts.childA > 0 ? { childA: String(passengerCounts.childA) } : {}),
		...(passengerCounts.childB > 0 ? { childB: String(passengerCounts.childB) } : {}),
		...(passengerCounts.childC > 0 ? { childC: String(passengerCounts.childC) } : {}),
		...(passengerCounts.infant > 0 ? { infant: String(passengerCounts.infant) } : {}),
	};
}

/**
 * Builds the flight selection page URL with query parameters from form data.
 *
 * Converts flight search form data into a navigable URL path with encoded query string.
 * All non-zero passenger counts and route information are included as query parameters.
 *
 * @param {FlightSearchFormValues} formData - Flight search form values
 * @param {string} locale - The current locale (e.g., "en", "ja")
 * @returns {string} URL path for flight selection page (e.g., "/booking/en/flight-selection?routes=NRT%2CKIX&departureDateFrom=2024-12-25&...")
 *
 * @example
 * const formData = {
 *   origin: "NRT",
 *   destination: "KIX",
 *   travelDates: { outboundDate: "2024-12-25", returnDate: "2025-01-01" },
 *   passengerCounts: { adult: 2, childA: 0, childB: 0, childC: 0, infant: 0 },
 *   tripType: "round-trip"
 * };
 *
 * buildFlightSelectionPath(formData, "en")
 * // "/booking/en/flight-selection?routes=NRT%2CKIX&departureDateFrom=2024-12-25&departureDateTo=2025-01-01&adult=2"
 */
export const buildFlightSelectionPath = (
	formData: FlightSearchFormValues,
	locale: string
): string => {
	const apiParams = mapFormDataToFlightSearchApiParams(formData);
	const query = new URLSearchParams();

	for (const [key, value] of Object.entries(apiParams)) {
		if (value) {
			query.set(key, value);
		}
	}

	const queryString = query.toString();
	const bookingPath = queryString
		? `/booking/${locale}/flight-selection?${queryString}`
		: `/booking/${locale}/flight-selection`;
	const bookingAppOrigin = process.env.NEXT_PUBLIC_IBE_APP_ORIGIN?.trim();

	if (bookingAppOrigin) {
		return `${bookingAppOrigin.replace(/\/$/, "")}${bookingPath}`;
	}

	return process.env.NODE_ENV === "development"
		? `${DEV_BOOKING_APP_ORIGIN}${bookingPath}`
		: bookingPath;
};
