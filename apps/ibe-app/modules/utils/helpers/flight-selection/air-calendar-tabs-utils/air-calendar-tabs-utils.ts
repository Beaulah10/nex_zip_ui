import { formatPrice } from "@/modules/utils/helpers/currency-formatter";
import type {
	AirCalendarTab,
	FlightSelectionBound,
} from "@/types/flight-selection/flight-selection.types";

/**
 * Builds seven calendar tabs around the selected center date.
 * @param centerDate Selected departure date as tab center.
 * @param hasChildC Indicates presence of childA passenger.
 * @param hasInfant Indicates presence of infant passenger.
 * @returns Calendar tabs with disabled states and prices.
 */
export const airCalendarTabs = (
	centerDate: Date,
	hasChildC: boolean,
	hasInfant: boolean,
	airCalendarFare?: FlightSelectionBound["airCalendarFare"],
	flightsByDate?: FlightSelectionBound["flightsByDate"]
): AirCalendarTab[] => {
	const tabs: AirCalendarTab[] = [];

	const priceMap = new Map<string, number>(
		(airCalendarFare ?? []).map((item) => {
			const parts = item.date.split("-");
			const month = Number(parts[1]);
			const day = Number(parts[2]);
			return [`${month}-${day}`, item.baseFareAmount] as [string, number];
		})
	);

	for (let index = -3; index <= 3; index += 1) {
		const date = new Date(centerDate);
		date.setDate(centerDate.getDate() + index);

		const month = date.getMonth() + 1;
		const day = date.getDate();
		const key = `${month}-${day}`;
		//if selected date is current date then disable the past date.
		const today = new Date();
		today.setHours(0, 0, 0, 0);

		const tabDate = new Date(date);
		tabDate.setHours(0, 0, 0, 0);

		const isPastDate = tabDate < today;
		let isBookingRestricted = false;

		if (flightsByDate) {
			const flightsForDateList = flightsByDate.filter((flightDate) => {
				const [, flightMonth, flightDay] = flightDate.date.split("-").map(Number);

				return flightMonth === month && flightDay === day;
			});

			for (const flightsForDate of flightsForDateList) {
				for (const flight of flightsForDate.flights ?? []) {
					for (const segment of flight.segments ?? []) {
						const departureTimeOffset =
							segment.scheduledDepartureArrivalDateTime?.departureDateTimeOffset;

						if (!departureTimeOffset) continue;

						const departureTime = new Date(departureTimeOffset);
						const now = new Date();
						if (Number.isNaN(departureTime.getTime())) continue;

						const hoursUntilDeparture =
							(departureTime.getTime() - now.getTime()) / (1000 * 60 * 60);

						if (hasChildC && hoursUntilDeparture < 24) {
							isBookingRestricted = true;
							break;
						}

						if (hasInfant && hoursUntilDeparture < 48) {
							isBookingRestricted = true;
							break;
						}
					}

					if (isBookingRestricted) break;
				}

				if (isBookingRestricted) break;
			}
		}

		tabs.push({
			value: key,
			date: `${month}/${day}`,
			price: isPastDate ? "-" : priceMap.has(key) ? formatPrice(priceMap.get(key) ?? 0) : "-",
			disabled: isBookingRestricted || isPastDate,
		});
	}

	return tabs;
};
