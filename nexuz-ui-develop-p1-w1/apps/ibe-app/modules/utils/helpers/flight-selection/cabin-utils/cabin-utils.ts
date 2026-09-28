import type { useTranslations } from "next-intl";
import {
	getPassengerLabel,
	PASSENGER_DISPLAY_ORDER,
} from "@/modules/utils/helpers/common/passenger-label/passenger-label";
import { formatPrice } from "@/modules/utils/helpers/currency-formatter";
import type {
	CabinPrices,
	FlightCabinState,
	Flightdetails,
	FlightFare,
} from "@/types/flight-selection/flight-selection.types";

export type CabinFare = {
	passengerType: string;
	fareAmtInclTax?: number;
};

const getSelectedCabinSegmentFares = (flight: Flightdetails, flightId: string, cabin: string) => {
	const segmentIndex = Number(flightId.split("-segment-")[1]);

	if (Number.isNaN(segmentIndex)) {
		return [];
	}

	const segmentFares = flight.segmentFaresList?.[segmentIndex];
	const cabinKey = cabin.trim().toLowerCase();

	if (cabinKey === "standard") {
		return segmentFares?.standard ?? [];
	}

	if (cabinKey === "zipfullflat") {
		return segmentFares?.zipFullFlat ?? [];
	}

	return [];
};

/**
 * Applies outbound cabin selection while preserving segment behavior.
 * @param current Current outbound selection state.
 * @param flightId Flight or segment selection key.
 * @param cabin Selected cabin value.
 * @returns Updated outbound cabin state.
 */
export const outboundCabinSelection = (
	current: FlightCabinState,
	flightId: string,
	cabin: string
): FlightCabinState => {
	const isSegment = flightId.includes("-segment-");

	if (isSegment) {
		return {
			...current,
			[flightId]: cabin,
		};
	}

	const updated: FlightCabinState = {};
	for (const key of Object.keys(current)) {
		updated[key] = null;
	}

	updated[flightId] = cabin;
	return updated;
};

/**
 * Applies inbound cabin selection with single-selection behavior.
 * @param current Current inbound selection state.
 * @param flightId Selected flight key.
 * @param cabin Selected cabin value.
 * @returns Updated inbound cabin state.
 */
export const inboundCabinSelection = (
	current: FlightCabinState,
	flightId: string,
	cabin: string
): FlightCabinState => {
	const updated: FlightCabinState = {};

	for (const key of Object.keys(current)) {
		updated[key] = null;
	}

	updated[flightId] = cabin;
	return updated;
};

/**
 * Calculates total fare amount for selected cabins across flights.
 * @param selectedCabins Selected cabin key/value map.
 * @param flights Filtered flights for a direction.
 * @returns Aggregated amount including passenger counts.
 */
export const calculateSelectedBoundFlightTotal = (
	selectedCabins: FlightCabinState,
	flights: Flightdetails[]
): number =>
	Object.entries(selectedCabins).reduce((total, [flightId, cabin]) => {
		if (!cabin) return total;

		const isSegmentKey = flightId.includes("-segment-");
		const baseId = isSegmentKey ? (flightId.split("-segment-")[0] ?? flightId) : flightId;
		const flightIndex = Number(baseId.split("-").pop());
		if (Number.isNaN(flightIndex)) return total;

		const flight = flights[flightIndex];
		if (!flight) return total;

		const selectedCabinFares: FlightFare[] = isSegmentKey
			? getSelectedCabinSegmentFares(flight, flightId, cabin)
			: flight.cabinFares.find(
					(cabinFare) => cabinFare.cabin?.trim().toLowerCase() === cabin.trim().toLowerCase()
				)?.fares ||
				flight.cabinFares[0]?.fares ||
				[];

		const totalForFlight = selectedCabinFares.reduce((sum, fare) => {
			const perPassenger = fare.fareAmtInclTax;
			const count = fare.passengerCount;
			return sum + perPassenger * count;
		}, 0);

		return total + totalForFlight;
	}, 0);

/**
 * Calculates grand total for outbound and inbound selections.
 * @param outboundCabins Selected outbound cabins.
 * @param outboundFlights Filtered outbound flights.
 * @param inboundCabins Selected inbound cabins.
 * @param inboundFlights Filtered inbound flights.
 * @param isRoundTrip Whether trip is roundtrip.
 * @returns Combined total amount.
 */
export const calculateGrandTotal = (
	outboundCabins: FlightCabinState,
	outboundFlights: Flightdetails[],
	inboundCabins: FlightCabinState,
	inboundFlights: Flightdetails[],
	isRoundTrip: boolean
): number => {
	const outboundTotal = calculateSelectedBoundFlightTotal(outboundCabins, outboundFlights);

	const inboundTotal = isRoundTrip
		? calculateSelectedBoundFlightTotal(inboundCabins, inboundFlights)
		: 0;

	return outboundTotal + inboundTotal;
};

/**
 * Builds UI-ready cabin prices from passenger fare rows.
 * @param fares Raw fare rows for a cabin.
 * @returns Formatted adult and extra passenger prices.
 */
export const getCabinPriceDisplayData = (
	fares: CabinFare[],
	t: ReturnType<typeof useTranslations>
): CabinPrices | undefined => {
	if (!fares.length) return undefined;

	const adultFare = fares.find((fare) => fare.passengerType === "adult");

	const extras = PASSENGER_DISPLAY_ORDER.map((passengerType) =>
		fares.find((fare) => fare.passengerType === passengerType)
	)
		.filter((fare): fare is CabinFare => fare !== undefined)
		.map((fare) => ({
			label: getPassengerLabel(fare.passengerType, t),
			price: formatPrice(fare.fareAmtInclTax ?? 0),
		}));

	return {
		adult: formatPrice(adultFare?.fareAmtInclTax ?? 0),
		extras: extras.length > 0 ? extras : undefined,
	};
};
