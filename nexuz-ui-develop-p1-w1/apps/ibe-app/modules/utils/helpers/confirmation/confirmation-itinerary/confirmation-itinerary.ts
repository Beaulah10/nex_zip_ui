/**
 * File: confirmation-itinerary.ts
 * Utility functions for building confirmation itinerary card data, formatting flight details,
 * and calculating transit/journey information for booking confirmation screens.
 */

import { getAirportFullName } from "@/modules/utils/helpers/airport";
import { formatDuration } from "@/modules/utils/helpers/flightTime-formatter";
import type {
	SelectedFlightBound,
	SelectedSegment,
} from "@/store/slices/flight-selection/flight-selection.slice";
import type { AirportFullNameMap } from "@/types/airport.types";
import type {
	ConfirmationTransitInfo,
	FlightItineraryCardProps,
} from "@/types/confirmation/confirmation.types";

function formatTime(isoString: string): string {
	const date = new Date(isoString);
	if (Number.isNaN(date.getTime())) return "";
	return date.toLocaleTimeString("en-US", {
		hour: "2-digit",
		minute: "2-digit",
		hour12: false,
		timeZone: "UTC",
	});
}

function formatDate(isoString: string): string {
	const date = new Date(isoString);
	if (Number.isNaN(date.getTime())) return "";
	return date.toLocaleDateString("en-US", {
		weekday: "short",
		month: "short",
		day: "numeric",
		year: "numeric",
		timeZone: "UTC",
	});
}

function formatConfirmationTransitDuration(
	time?: string,
	options?: { abbreviateMinutes?: boolean }
): string {
	if (!time?.includes(":")) {
		return "";
	}

	const [h, m] = time.split(":");
	const hours = Number(h);
	const minutes = Number(m);

	if (Number.isNaN(hours) || Number.isNaN(minutes)) {
		return "";
	}

	const minuteLabel = options?.abbreviateMinutes ? "mins" : "minutes";
	return `${hours} hours ${minutes} ${minuteLabel}`;
}

/**
 * Builds confirmation itinerary card props for a single selected segment.
 * Resolves airport names and formats departure, arrival, and duration values.
 */
export function getSegmentItineraryProps(
	segment: SelectedSegment,
	legLabel: string,
	airportFullNameMap?: AirportFullNameMap
): FlightItineraryCardProps {
	const schedule = segment.scheduledDepartureArrivalDateTime;
	const [hours = 0, minutes = 0] = (segment.flightTime ?? "0:0").split(":").map(Number);
	const durationStr = `${hours}:${minutes.toString().padStart(2, "0")}`;

	return {
		departureAirportCode: segment.origin,
		departureAirportName: getAirportFullName(segment.origin, airportFullNameMap),
		arrivalAirportCode: segment.destination,
		arrivalAirportName: getAirportFullName(segment.destination, airportFullNameMap),
		departureTime: formatTime(schedule.departureDateTime),
		departureDate: formatDate(schedule.departureDateTime),
		arrivalTime: formatTime(schedule.arrivalDateTime),
		arrivalDate: formatDate(schedule.arrivalDateTime),
		duration: formatDuration(durationStr),
		legLabel,
		flightNumber: `${segment.carrierCode} ${segment.flightNumber}`,
	};
}

/**
 * Builds transit information between two confirmation segments.
 * Returns layover and total journey durations when both segment times are valid.
 */
export function buildTransitInfo(
	segment1: SelectedSegment,
	segment2: SelectedSegment,
	airportFullNameMap?: AirportFullNameMap
): ConfirmationTransitInfo | undefined {
	const seg1Arrival = new Date(segment1.scheduledDepartureArrivalDateTime.arrivalDateTime);
	const seg2Departure = new Date(segment2.scheduledDepartureArrivalDateTime.departureDateTime);
	const seg1Departure = new Date(segment1.scheduledDepartureArrivalDateTime.departureDateTime);
	const seg2Arrival = new Date(segment2.scheduledDepartureArrivalDateTime.arrivalDateTime);

	if (
		Number.isNaN(seg1Arrival.getTime()) ||
		Number.isNaN(seg2Departure.getTime()) ||
		Number.isNaN(seg1Departure.getTime()) ||
		Number.isNaN(seg2Arrival.getTime())
	) {
		return undefined;
	}

	const transitMinutes = Math.max(
		0,
		Math.floor((seg2Departure.getTime() - seg1Arrival.getTime()) / 60_000)
	);
	const totalJourneyMinutes = Math.max(
		0,
		Math.floor((seg2Arrival.getTime() - seg1Departure.getTime()) / 60_000)
	);

	const toHHMM = (mins: number) =>
		`${Math.floor(mins / 60)}:${(mins % 60).toString().padStart(2, "0")}`;

	return {
		airportName: getAirportFullName(segment1.destination, airportFullNameMap),
		airportCode: segment1.destination,
		transitDuration: formatConfirmationTransitDuration(toHHMM(transitMinutes)),
		totalDuration: formatConfirmationTransitDuration(toHHMM(totalJourneyMinutes), {
			abbreviateMinutes: true,
		}),
	};
}

/**
 * Builds confirmation itinerary card props for a full flight bound.
 * Uses the first and last segments to present the overall journey details.
 */
export function getFlightItineraryProps(
	bound: SelectedFlightBound,
	legLabel: string,
	airportFullNameMap?: AirportFullNameMap
): FlightItineraryCardProps {
	const firstSegment = bound.segments[0];
	const lastSegment = bound.segments[bound.segments.length - 1];

	if (!firstSegment || !lastSegment) {
		return {
			departureAirportCode: "",
			departureAirportName: "",
			arrivalAirportCode: "",
			arrivalAirportName: "",
			departureTime: "",
			departureDate: "",
			arrivalTime: "",
			arrivalDate: "",
			duration: "",
			legLabel,
			flightNumber: "",
		};
	}

	const departure = firstSegment.scheduledDepartureArrivalDateTime;
	const arrival = lastSegment.scheduledDepartureArrivalDateTime;
	const totalMinutes = bound.segments.reduce((sum, segment) => {
		const [hours = 0, minutes = 0] = (segment.flightTime ?? "0:0").split(":").map(Number);
		return sum + hours * 60 + minutes;
	}, 0);
	const formattedDuration = `${Math.floor(totalMinutes / 60)}:${(totalMinutes % 60)
		.toString()
		.padStart(2, "0")}`;

	return {
		departureAirportCode: firstSegment.origin,
		departureAirportName: getAirportFullName(firstSegment.origin, airportFullNameMap),
		arrivalAirportCode: lastSegment.destination,
		arrivalAirportName: getAirportFullName(lastSegment.destination, airportFullNameMap),
		departureTime: formatTime(departure.departureDateTime),
		departureDate: formatDate(departure.departureDateTime),
		arrivalTime: formatTime(arrival.arrivalDateTime),
		arrivalDate: formatDate(arrival.arrivalDateTime),
		duration: formatDuration(formattedDuration),
		legLabel,
		flightNumber: `${firstSegment.carrierCode} ${firstSegment.flightNumber}`,
	};
}
