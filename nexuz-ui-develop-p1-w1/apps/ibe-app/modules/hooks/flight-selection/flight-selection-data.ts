import { useTranslations } from "next-intl";
import { useEffect, useMemo, useState } from "react";
import { airCalendarTabs } from "@/modules/utils/helpers/flight-selection/air-calendar-tabs-utils/air-calendar-tabs-utils";
import {
	inboundCabinSelection,
	outboundCabinSelection,
} from "@/modules/utils/helpers/flight-selection/cabin-utils/cabin-utils";
import { getFlightsByDate } from "@/modules/utils/helpers/flight-selection/flight-date-utils/flight-date-utils";
import {
	getFlightDetailsFromBound,
	getFlightDisplayItems,
} from "@/modules/utils/helpers/flight-selection/flight-mapper-utils/flight-mapper-utils.ts";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
	clearFlightSelection,
	fetchFlightSelection,
	selectConfirmedFlight,
} from "@/store/slices/flight-selection/flight-selection.slice";
import type {
	AirCalendarTab,
	FlightCabinState,
	FlightDisplayItem,
	Flightdetails,
	FlightSelectionRequest,
} from "@/types/flight-selection/flight-selection.types";

interface FlightSelectionDataResult {
	activeRequest: FlightSelectionRequest;
	isLoadingFlights: boolean;
	error: string | null | undefined;
	tripType: "roundtrip" | "oneway";
	isRoundTrip: boolean;
	selectedDateOutbound: string;
	setSelectedDateOutbound: (date: string) => void;
	selectedDateInbound: string;
	setSelectedDateInbound: (date: string) => void;
	calendarTabsOutbound: AirCalendarTab[];
	calendarTabsInbound: AirCalendarTab[];
	filteredFlightsOutbound: Flightdetails[];
	filteredFlightsInbound: Flightdetails[];
	mappedFlightsOutbound: FlightDisplayItem[];
	mappedFlightsInbound: FlightDisplayItem[];
	selectedCabinsOutbound: FlightCabinState;
	selectedCabinsInbound: FlightCabinState;
	onSelectOutboundCabin: (flightId: string, cabin: string) => void;
	onSelectInboundCabin: (flightId: string, cabin: string) => void;
	hasConnectingOutbound: boolean;
}

function isSelectedConnectingSegment(flightId: string, flight: FlightDisplayItem) {
	if (!flight.isConnectingFlight) {
		return false;
	}

	return flight.segments?.some((_, index) => `${flight.id}-segment-${index}` === flightId) ?? false;
}

function clearOtherConnectingSelections(
	selectedCabins: FlightCabinState,
	mappedFlights: FlightDisplayItem[],
	currentFlightId: string
) {
	const updated = { ...selectedCabins };

	for (const flight of mappedFlights) {
		if (!flight.isConnectingFlight || flight.id === currentFlightId) {
			continue;
		}

		flight.segments?.forEach((_, index) => {
			delete updated[`${flight.id}-segment-${index}`];
		});
	}

	return updated;
}

/**
 * Loads, normalizes, and manages state for flight-selection screen.
 * @param locale Current locale used for flight request.
 * @returns View-model state and handlers for component rendering.
 */

export const flightSelectionData = (
	locale: string,
	requestPayload: FlightSelectionRequest
): FlightSelectionDataResult => {
	const dispatch = useAppDispatch();
	const {
		data: flightData,
		request: storedRequest,
		isPending: isLoadingFlights,
		error,
	} = useAppSelector((state) => state.flightSelection);
	const confirmedFlight = useAppSelector(selectConfirmedFlight);

	/** Retrieves the stored request payload from Redux or uses the current request payload. */
	const activeRequest = useMemo(
		() => storedRequest ?? requestPayload,
		[storedRequest, requestPayload]
	);
	const [selectedDateOutbound, setSelectedDateOutbound] = useState("");
	const [selectedDateInbound, setSelectedDateInbound] = useState("");
	const [calendarTabsOutbound, setCalendarTabsOutbound] = useState<AirCalendarTab[]>([]);
	const [calendarTabsInbound, setCalendarTabsInbound] = useState<AirCalendarTab[]>([]);
	const [allFlightsOutbound, setAllFlightsOutbound] = useState<Flightdetails[]>([]);
	const [allFlightsInbound, setAllFlightsInbound] = useState<Flightdetails[]>([]);
	const [filteredFlightsOutbound, setFilteredFlightsOutbound] = useState<Flightdetails[]>([]);
	const [filteredFlightsInbound, setFilteredFlightsInbound] = useState<Flightdetails[]>([]);
	const [selectedCabinsOutbound, setSelectedCabinsOutbound] = useState<FlightCabinState>({});
	const [selectedCabinsInbound, setSelectedCabinsInbound] = useState<FlightCabinState>({});
	const flightSelectionLabels = useTranslations("flight_selection_page");
	useEffect(() => {
		if (!confirmedFlight) {
			return;
		}

		setSelectedCabinsOutbound(confirmedFlight.selectedCabinsOutbound ?? {});

		setSelectedCabinsInbound(confirmedFlight.selectedCabinsInbound ?? {});
	}, [confirmedFlight]);

	const isRoundTrip = Boolean(requestPayload.departureDateTo);
	const tripType = requestPayload.departureDateTo ? "roundtrip" : "oneway";

	const hasChildC = (activeRequest.childC ?? 0) > 0;
	const hasYoungPassengers = hasChildC || (activeRequest.infant ?? 0) > 0;
	useEffect(() => {
		dispatch(clearFlightSelection());
		dispatch(
			fetchFlightSelection({
				locale,
				request: requestPayload,
			})
		);
	}, [dispatch, locale, requestPayload]);

	useEffect(() => {
		if (!flightData) return;

		const outboundBound = flightData.data?.outbound;
		const inboundBound = flightData.data?.inbound;

		const outbound = getFlightDetailsFromBound(outboundBound);
		const inbound = getFlightDetailsFromBound(inboundBound);

		setAllFlightsOutbound(outbound);
		setAllFlightsInbound(inbound);

		const outboundCenterDate = new Date(requestPayload.departureDateFrom);
		const outboundMonth = outboundCenterDate.getMonth() + 1;
		const outboundDay = outboundCenterDate.getDate();

		setSelectedDateOutbound(`${outboundMonth}-${outboundDay}`);
		setCalendarTabsOutbound(
			airCalendarTabs(
				outboundCenterDate,
				hasChildC,
				(requestPayload.infant ?? 0) > 0,
				outboundBound?.airCalendarFare,
				outboundBound?.flightsByDate
			)
		);

		if (inboundBound) {
			const inboundDateStr = requestPayload.departureDateTo ?? requestPayload.departureDateFrom;
			const inboundCenterDate = new Date(inboundDateStr);
			const inboundMonth = inboundCenterDate.getMonth() + 1;
			const inboundDay = inboundCenterDate.getDate();

			setSelectedDateInbound(`${inboundMonth}-${inboundDay}`);
			setCalendarTabsInbound(
				airCalendarTabs(
					inboundCenterDate,
					hasChildC,
					(requestPayload.infant ?? 0) > 0,
					inboundBound?.airCalendarFare,
					inboundBound?.flightsByDate
				)
			);
		} else {
			setSelectedDateInbound("");
			setCalendarTabsInbound([]);
			setSelectedCabinsInbound({});
			setFilteredFlightsInbound([]);
		}
	}, [flightData, hasChildC, requestPayload]);
	useEffect(() => {
		if (!selectedDateOutbound || allFlightsOutbound.length === 0) {
			setFilteredFlightsOutbound([]);
			return;
		}

		setFilteredFlightsOutbound(getFlightsByDate(allFlightsOutbound, selectedDateOutbound));

		if (!confirmedFlight) {
			setSelectedCabinsOutbound({});
		}
	}, [selectedDateOutbound, allFlightsOutbound, confirmedFlight]);

	useEffect(() => {
		if (!isRoundTrip || !selectedDateInbound || allFlightsInbound.length === 0) {
			setFilteredFlightsInbound([]);
			return;
		}

		setFilteredFlightsInbound(getFlightsByDate(allFlightsInbound, selectedDateInbound));

		if (!confirmedFlight) {
			setSelectedCabinsInbound({});
		}
	}, [selectedDateInbound, allFlightsInbound, isRoundTrip, confirmedFlight]);

	const mappedFlightsOutbound = useMemo(
		() =>
			getFlightDisplayItems(
				filteredFlightsOutbound,
				"outbound",
				hasYoungPassengers,
				flightSelectionLabels
			),
		[filteredFlightsOutbound, hasYoungPassengers, flightSelectionLabels]
	);

	const mappedFlightsInbound = useMemo(
		() =>
			getFlightDisplayItems(
				filteredFlightsInbound,
				"inbound",
				hasYoungPassengers,
				flightSelectionLabels
			),
		[filteredFlightsInbound, hasYoungPassengers, flightSelectionLabels]
	);

	/**
	 * Updates outbound cabin selection preserving connecting behavior.
	 * @param flightId Flight or segment key.
	 * @param cabin Selected cabin code.
	 */
	const onSelectOutboundCabin = (flightId: string, cabin: string): void => {
		setSelectedCabinsOutbound((current) => {
			const currentFlight = mappedFlightsOutbound.find((flight) =>
				isSelectedConnectingSegment(flightId, flight)
			);

			const updated = currentFlight
				? clearOtherConnectingSelections(current, mappedFlightsOutbound, currentFlight.id)
				: { ...current };

			return outboundCabinSelection(updated, flightId, cabin);
		});
	};

	/**
	 * Updates inbound cabin selection with single-flight behavior.
	 * @param flightId Flight key.
	 * @param cabin Selected cabin code.
	 */
	const onSelectInboundCabin = (flightId: string, cabin: string): void => {
		setSelectedCabinsInbound((current) => inboundCabinSelection(current, flightId, cabin));
	};

	const hasConnectingOutbound = allFlightsOutbound.some((flight) => flight.isConnectingFlight);

	return {
		activeRequest,
		isLoadingFlights,
		error,
		tripType,
		isRoundTrip,
		selectedDateOutbound,
		setSelectedDateOutbound,
		selectedDateInbound,
		setSelectedDateInbound,
		calendarTabsOutbound,
		calendarTabsInbound,
		filteredFlightsOutbound,
		filteredFlightsInbound,
		mappedFlightsOutbound,
		mappedFlightsInbound,
		selectedCabinsOutbound,
		selectedCabinsInbound,
		onSelectOutboundCabin,
		onSelectInboundCabin,
		hasConnectingOutbound,
	};
};
