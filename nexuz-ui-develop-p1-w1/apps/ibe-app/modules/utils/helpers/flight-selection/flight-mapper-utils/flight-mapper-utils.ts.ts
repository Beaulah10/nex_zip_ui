/**
 * File: flight-mapper-utils.ts
 * Flight display helper utilities.
 * Transforms flight selection API data into normalized flight details
 * and UI-ready display models used by the flight-selection flow.
 */

import type { useTranslations } from "next-intl";
import formatFlightTime from "@/modules/utils/helpers/flightTime-formatter";
import type {
	FareInfo,
	FlightDisplayItem,
	Flightdetails,
	FlightFare,
	FlightSelectionApiFlight,
	FlightSelectionApiSegment,
	FlightSelectionBound,
} from "@/types/flight-selection/flight-selection.types";
import { getCabinPriceDisplayData } from "../cabin-utils/cabin-utils";

/**
 * Normalizes a single API segment into display-safe values.
 * @param segment Segment from API response.
 * @returns Segment with safe default values.
 */
const getDisplaySegment = (segment: FlightSelectionApiSegment) => ({
	carrierCode: segment.carrierCode,
	origin: segment.origin,
	destination: segment.destination,
	flightTime: segment.flightTime,
	flightNumber: segment.flightNumber,
	scheduledDepartureArrivalDateTime: {
		departureDateTime: segment.scheduledDepartureArrivalDateTime?.departureDateTime ?? "",
		arrivalDateTime: segment.scheduledDepartureArrivalDateTime?.arrivalDateTime ?? "",
	},
	previousDayIndicator: segment.previousDayIndicator ?? false,
	nextDayIndicator: segment.nextDayIndicator ?? false,
});

/**
 * Extracts/get per-passenger fare rows for one cabin fare info block.
 * @param fareInfo Fare info from API cabin entry.
 * @returns Passenger fare rows with counts and totals.
 */
const getFlightFares = (fareInfo: FareInfo | undefined): FlightFare[] => {
	const fareDetails = fareInfo?.fareDetails ?? [];
	const passengerWise = fareInfo?.boundSummary?.passengerWiseFares ?? [];

	return fareDetails.map((detail) => {
		const matchedPassenger = passengerWise.find(
			(passenger) => passenger.passengerType === detail.passengerType
		);

		return {
			passengerType: detail.passengerType,
			count: matchedPassenger?.count ?? 0,
			passengerCount: matchedPassenger?.count ?? 0,
			baseFareAmtInclTax: detail.baseFareAmtInclTax,
			fareAmtInclTax: detail.fareAmtInclTax,
			ptcTotalFare: detail.ptcTotalFare,
			amount: detail.fareAmtInclTax,
			availableSeat: detail.availableSeat,
		};
	});
};

const getCabinSeatsLeft = (
	fareInfos: FareInfo[] | undefined,
	cabin: "STANDARD" | "ZIPFULLFLAT"
): number | undefined => {
	const cabinFareInfo = (fareInfos ?? []).find((fareInfo) => fareInfo.cabin === cabin);
	if (!cabinFareInfo) {
		return undefined;
	}

	const adultFare = cabinFareInfo.fareDetails?.find((detail) => detail.passengerType === "adult");
	return adultFare?.availableSeat ?? cabinFareInfo.fareDetails?.[0]?.availableSeat;
};

/**
 * Normalizes one raw flight and derives cabin and segment fare metadata.
 * @param flight Flight object from API response.
 * @returns Normalized flight model used by UI.
 */
const getFlightDetails = (flight: FlightSelectionApiFlight): Flightdetails => {
	const segments = flight.segments ?? [];
	const firstSegment = segments[0];
	const lastSegment = segments[segments.length - 1];

	const cabinFares = (firstSegment?.fareInfos ?? []).map((fareInfo) => ({
		cabin: fareInfo.cabin,
		fares: getFlightFares(fareInfo),
	}));

	const standardCabin = cabinFares.find((cabin) => cabin.cabin === "STANDARD");
	const zipCabin = cabinFares.find((cabin) => cabin.cabin === "ZIPFULLFLAT");
	const standardSeatsLeftBySegment = segments.map((segment) =>
		getCabinSeatsLeft(segment.fareInfos, "STANDARD")
	);
	const zipSeatsLeftBySegment = segments.map((segment) =>
		getCabinSeatsLeft(segment.fareInfos, "ZIPFULLFLAT")
	);

	return {
		carrierCode: firstSegment?.carrierCode ?? "",
		origin: firstSegment?.origin ?? "",
		destination: lastSegment?.destination ?? "",
		flightTime: firstSegment?.flightTime,
		transitTime: flight.transitTime,
		overallFlightTime: flight.overallFlightTime,
		flightNumber: firstSegment?.flightNumber ?? "",
		scheduledDepartureArrivalDateTime: {
			departureDateTime: firstSegment?.scheduledDepartureArrivalDateTime?.departureDateTime ?? "",
			arrivalDateTime: lastSegment?.scheduledDepartureArrivalDateTime?.arrivalDateTime ?? "",
		},
		segments: segments.map(getDisplaySegment),
		isConnectingFlight: segments.length > 1,
		cabinFares,
		fares: cabinFares[0]?.fares ?? [],
		segmentFaresList: segments.map((segment) => ({
			standard: getFlightFares(
				segment.fareInfos?.find((fareInfo) => fareInfo.cabin === "STANDARD")
			),
			zipFullFlat: getFlightFares(
				segment.fareInfos?.find((fareInfo) => fareInfo.cabin === "ZIPFULLFLAT")
			),
		})),
		standardSeatsLeft: standardCabin?.fares?.[0]?.availableSeat,
		zipSeatsLeft: zipCabin?.fares?.[0]?.availableSeat,
		standardSeatsLeftBySegment,
		zipSeatsLeftBySegment,
	};
};

/**
 * Flattens bound-level flightsByDate into normalized flight rows.
 * @param bound Outbound or inbound flight bound data.
 * @returns Normalized flights for selected bound.
 */
export const getFlightDetailsFromBound = (bound?: FlightSelectionBound): Flightdetails[] => {
	const flights: Flightdetails[] = [];
	for (const byDate of bound?.flightsByDate ?? []) {
		for (const flight of byDate.flights) flights.push(getFlightDetails(flight));
	}
	return flights;
};

/**
 * Builds mapped display cards and applies departure time sort.
 * @param flights Normalized flights filtered by selected date.
 * @param tripDirection Bound direction for id and transit formatting.
 * @param hasYoungPassengers Flags ZIP restriction usage.
 * @returns UI-ready sorted flight cards.
 */

export const getFlightDisplayItems = (
	flights: Flightdetails[],
	tripDirection: "outbound" | "inbound",
	hasYoungPassengers: boolean,
	t: ReturnType<typeof useTranslations>
): FlightDisplayItem[] => {
	const mapped = flights.map((flight, index) => {
		const departure = new Date(flight.scheduledDepartureArrivalDateTime.departureDateTime);
		const arrival = new Date(flight.scheduledDepartureArrivalDateTime.arrivalDateTime);
		const standardCabin = flight.cabinFares.find((cabin) => cabin.cabin === "STANDARD");
		const zipCabin = flight.cabinFares.find((cabin) => cabin.cabin === "ZIPFULLFLAT");
		const hasZipFullFlat = !!zipCabin;
		const hasStandardCabin = !!standardCabin;
		const inboundTransitTime = flight.transitTime ? formatFlightTime(flight.transitTime) : "";

		return {
			id: `${tripDirection === "outbound" ? "flight-out" : "flight-in"}-${index}`,
			hasStandardCabin,
			hasZipFullFlat,
			departureTime: departure.toLocaleTimeString([], {
				hour: "2-digit",
				minute: "2-digit",
				hour12: false,
			}),
			departureCity: flight.origin,
			arrivalTime: arrival.toLocaleTimeString([], {
				hour: "2-digit",
				minute: "2-digit",
				hour12: false,
			}),
			arrivalCity: flight.destination,
			flightNumber: `${flight.carrierCode}${flight.flightNumber}`,
			duration: formatFlightTime(flight.flightTime ?? ""),

			nextDayIndicator: flight.segments[0]?.nextDayIndicator,
			transitTime: tripDirection === "inbound" ? inboundTransitTime : flight.transitTime,

			overallFlightTime: tripDirection === "outbound" ? flight.overallFlightTime : "",

			isConnectingFlight: flight.isConnectingFlight,
			isZipDisabled: tripDirection === "inbound" ? hasYoungPassengers : undefined,
			segments: flight.segments.map((segment) => {
				const segmentDeparture = new Date(
					segment.scheduledDepartureArrivalDateTime.departureDateTime
				);
				const segmentArrival = new Date(segment.scheduledDepartureArrivalDateTime.arrivalDateTime);

				return {
					departureTime: segmentDeparture.toLocaleTimeString([], {
						hour: "2-digit",
						minute: "2-digit",
						hour12: false,
					}),
					departureCity: segment.origin,
					arrivalTime: segmentArrival.toLocaleTimeString([], {
						hour: "2-digit",
						minute: "2-digit",
						hour12: false,
					}),
					arrivalCity: segment.destination,
					flightNumber: `${segment.carrierCode}${segment.flightNumber}`,
					duration: formatFlightTime(segment.flightTime),
					previousDayIndicator: segment.previousDayIndicator,
					nextDayIndicator: segment.nextDayIndicator,
				};
			}),
			standardPrices: getCabinPriceDisplayData(standardCabin?.fares ?? [], t),
			zipPrices: getCabinPriceDisplayData(zipCabin?.fares ?? [], t),
			standardSeatsLeft: flight.standardSeatsLeft,
			zipSeatsLeft: flight.zipSeatsLeft,
			standardSeatsLeftBySegment: flight.standardSeatsLeftBySegment,
			zipSeatsLeftBySegment: flight.zipSeatsLeftBySegment,
			fares: flight.fares,
			segmentFaresList: flight.segmentFaresList,
		};
	});

	return mapped.sort((first, second) => {
		const [firstHour = 0, firstMinute = 0] = first.departureTime.split(":").map(Number);
		const [secondHour = 0, secondMinute = 0] = second.departureTime.split(":").map(Number);
		return firstHour * 60 + firstMinute - (secondHour * 60 + secondMinute);
	});
};
