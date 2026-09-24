import type { Flightdetails } from "@/types/flight-selection/flight-selection.types";

/**
 * Returns flights matching the selected date.
 */
export const getFlightsByDate = (
	flights: Flightdetails[],
	selectedDate: string
): Flightdetails[] => {
	const [month, day] = selectedDate.split("-").map(Number);

	return flights.filter((flight) => {
		const departure = flight.scheduledDepartureArrivalDateTime.departureDateTime;

		if (!departure) {
			return false;
		}

		const date = new Date(departure);

		return date.getMonth() + 1 === month && date.getDate() === day;
	});
};
