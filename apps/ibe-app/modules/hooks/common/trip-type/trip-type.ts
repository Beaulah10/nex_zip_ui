import { useAppSelector } from "@/store/hooks";
import {
	selectConfirmedFlight,
	selectHasConnectingOutbound,
} from "@/store/slices/flight-selection/flight-selection.slice";
import type { TripType, UseTripTypeResult } from "@/types/common.type";

/**
 * Derives selected trip type from Redux store.
 * - Uses stored one-way / roundtrip value.
 * - Overrides to "connecting" when selected flight has more than one segment.
 */
export function useTripType(): UseTripTypeResult {
	const confirmedFlight = useAppSelector(selectConfirmedFlight);
	const hasConnectingOutbound = useAppSelector(selectHasConnectingOutbound);
	const storedTripType = confirmedFlight?.tripType;
	const outboundSegments = confirmedFlight?.flights.outbound.segments.length ?? 0;
	const connecting = outboundSegments > 1 || hasConnectingOutbound;
	const tripType: TripType | undefined = connecting ? "connecting" : storedTripType;

	return {
		tripType,
		oneway: tripType === "oneway",
		roundtrip: tripType === "roundtrip",
		connecting: tripType === "connecting",
	};
}
