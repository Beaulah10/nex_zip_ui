"use client";

import { Button } from "@repo/ui/components/button";
import { Dialog, DialogTrigger } from "@repo/ui/components/dialog";
import Icon from "@repo/ui/components/icon";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import standardImage from "@/assets/images/standard.png";
import standardDesktopImage from "@/assets/images/standardDesktop.png";
import zipFullFlatImage from "@/assets/images/zipfullflat.png";
import zipfullflatDesktopImage from "@/assets/images/zipfullflatDesktop.png";
import { BookingFooter } from "@/components/common/booking-footer/booking-footer";
import { BookingHeader } from "@/components/common/booking-header/booking-header";
import { LoadingOverlay } from "@/components/common/loading-overlay/loading-overlay";
import { BoundDisplay } from "@/components/flight-selection/bound-display/bound-display";
import DateSelectionModal from "@/components/flight-selection/calendar/date-selection-modal/date-selection-modal";
import { EmergencySupportDialog } from "@/components/flight-selection/emergency-support/emergency-support-dialog";
import { EnterPassengerDialog } from "@/components/passenger-name/enter-passenger/enter-passenger";
import { flightSelectionData } from "@/modules/hooks/flight-selection/flight-selection-data";
import {
	convertFaresToPrices,
	convertPromoFaresToPrices,
	getMonthDateRange,
	getNextCalendarWindowRange,
	isLoadMoreNeeded,
	stringToDate,
} from "@/modules/utils/helpers/calendar-fare/calendar-fare-utils";
import { calculateGrandTotal } from "@/modules/utils/helpers/flight-selection/cabin-utils/cabin-utils";
import {
	getConnectingFlightSelectionErrors,
	isOutboundSelectionIncomplete,
} from "@/modules/utils/helpers/flight-selection/flight-selection-utils/flight-selection-utils";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchCalendarFares } from "@/store/slices/calendar-fares/calendar-fares.slice";
import {
	type ConfirmedFlightPayload,
	confirmFlightSelection,
	type SelectedFlightBound,
	type SelectedSegment,
	setFlightSelectionRequest,
} from "@/store/slices/flight-selection/flight-selection.slice";
import type {
	BoundDisplayProps,
	ConnectingFlightError,
	FareInfo,
	FlightCabinState,
	Flightdetails,
	FlightSelectionApiSegment,
	FlightSelectionBound,
	FlightSelectionProps,
} from "@/types/flight-selection/flight-selection.types";

/**
 * Finds the matching raw API segment using carrier, flight number,
 * and departure datetime to get the API segment for a selected/display segment.
 */
const getMatchingSegmentFromApiData = (
	rawBound: FlightSelectionBound | undefined,
	displaySegment: Flightdetails["segments"][number]
): FlightSelectionApiSegment | undefined => {
	for (const byDate of rawBound?.flightsByDate ?? []) {
		for (const flight of byDate.flights) {
			for (const segment of flight.segments) {
				const isSameSegment =
					segment.carrierCode === displaySegment.carrierCode &&
					segment.flightNumber === displaySegment.flightNumber &&
					segment.scheduledDepartureArrivalDateTime.departureDateTime ===
						displaySegment.scheduledDepartureArrivalDateTime.departureDateTime;

				if (isSameSegment) {
					return segment;
				}
			}
		}
	}

	return undefined;
};

/**
 * Finds fare info for the selected cabin.
 */
const findCabinFareInfo = (rawSegment: FlightSelectionApiSegment | undefined, cabin: string) => {
	const cabinKey = cabin.trim().toLowerCase();

	return rawSegment?.fareInfos?.find(
		(fareInfo) => fareInfo.cabin.trim().toLowerCase() === cabinKey
	);
};

/**
 * Builds one selected segment from display and raw API data.
 */
const getSelectedSegmentData = (
	displaySegment: Flightdetails["segments"][number],
	rawSegment: FlightSelectionApiSegment | undefined,
	selectedCabin: string
): SelectedSegment => {
	const cabinFareInfo = findCabinFareInfo(rawSegment, selectedCabin);

	return {
		pfid: rawSegment?.pfid ?? 0,
		lfid: rawSegment?.lfid ?? 0,
		carrierCode: displaySegment.carrierCode,
		origin: displaySegment.origin,
		destination: displaySegment.destination,
		flightNumber: displaySegment.flightNumber,
		scheduledDepartureArrivalDateTime: {
			departureDateTime: displaySegment.scheduledDepartureArrivalDateTime.departureDateTime,
			departureDateTimeOffset:
				rawSegment?.scheduledDepartureArrivalDateTime.departureDateTimeOffset ?? "",
			arrivalDateTime: displaySegment.scheduledDepartureArrivalDateTime.arrivalDateTime,
			arrivalDateTimeOffset:
				rawSegment?.scheduledDepartureArrivalDateTime.arrivalDateTimeOffset ?? "",
		},
		flightTime: displaySegment.flightTime,
		selectedCabin,
		fareDetails: cabinFareInfo?.fareDetails ?? [],
	};
};

/**
 * Checks whether the selected cabin key belongs to a specific leg segment.
 */
const isConnectingFlightSegement = (flightId: string): boolean => {
	return flightId.includes("-segment-");
};

/**
 * Gets the main flight index from a selected cabin key.
 *
 * Example:
 * flight-outbound-0 -> 0
 * flight-outbound-0-segment-1 -> 0
 */
const getFlightIndex = (flightId: string): number => {
	const baseId = isConnectingFlightSegement(flightId)
		? (flightId.split("-segment-")[0] ?? flightId)
		: flightId;

	return Number(baseId.split("-").pop());
};

/**
 * Gets the segment index from a selected cabin key.
 *
 * Example:
 * flight-outbound-0-segment-1 -> 1
 */
const getSegmentIndex = (flightId: string): number => {
	return Number(flightId.split("-segment-")[1]);
};

/**
 * Returns only the flights/segments that have a cabin selected by the user
 */
const getSelectedCabinEntries = (selectedCabins: FlightCabinState): Array<[string, string]> => {
	return Object.entries(selectedCabins).filter(
		(entry): entry is [string, string] => typeof entry[1] === "string"
	);
};

/**
 * Calculates amount for a selected segment cabin.
 */
const getSegmentAmount = (
	rawSegment: FlightSelectionApiSegment | undefined,
	cabin: string
): number => {
	const cabinFareInfo = findCabinFareInfo(rawSegment, cabin);
	const passengerWiseFares = cabinFareInfo?.boundSummary.passengerWiseFares ?? [];

	return (cabinFareInfo?.fareDetails ?? []).reduce((total, fareDetail) => {
		const passengerFare = passengerWiseFares.find(
			(fare) => fare.passengerType === fareDetail.passengerType
		);

		return total + fareDetail.fareAmtInclTax * (passengerFare?.count ?? 0);
	}, 0);
};

/**
 * Calculates amount for a selected whole flight cabin.
 */
const getFlightAmount = (flight: Flightdetails, cabin: string): number => {
	const cabinKey = cabin.trim().toLowerCase();

	const cabinFares = flight.cabinFares?.find(
		(cabinFare) => cabinFare.cabin.trim().toLowerCase() === cabinKey
	);
	return (cabinFares?.fares ?? []).reduce(
		(total, fare) => total + fare.fareAmtInclTax * fare.count,
		0
	);
};

/**
 * Builds passenger fare breakdown from the last selected cabin.
 */
const getPassengerFareBreakdown = (
	selectedEntries: Array<[string, string]>,
	filteredFlights: Flightdetails[],
	rawBound: FlightSelectionBound | undefined
) => {
	const lastEntry = selectedEntries.at(-1);

	if (!lastEntry) {
		return [];
	}

	const [flightId, cabin] = lastEntry;
	const flightIndex = getFlightIndex(flightId);

	if (Number.isNaN(flightIndex)) {
		return [];
	}

	const flight = filteredFlights[flightIndex];

	if (!flight) {
		return [];
	}

	const segmentIndex = isConnectingFlightSegement(flightId) ? getSegmentIndex(flightId) : 0;

	if (Number.isNaN(segmentIndex)) {
		return [];
	}

	const displaySegment = flight.segments?.[segmentIndex];

	if (!displaySegment) {
		return [];
	}

	const rawSegment = getMatchingSegmentFromApiData(rawBound, displaySegment);
	const cabinFareInfo = findCabinFareInfo(rawSegment, cabin);

	return cabinFareInfo?.boundSummary.passengerWiseFares ?? [];
};

/**
 * Builds selected flight bound data.
 *
 * Used for outbound and inbound flight selections and connecting flight details includes segment details, pricebrekdown and total amount.
 */
const getSelectedFlightBoundDetails = (
	selectedCabins: FlightCabinState,
	filteredFlights: Flightdetails[],
	rawBound: FlightSelectionBound | undefined
): SelectedFlightBound => {
	const segments: SelectedSegment[] = [];
	const selectedFareInfos: FareInfo[] = [];
	let totalFlightAmount = 0;

	const selectedEntries = getSelectedCabinEntries(selectedCabins);

	for (const [flightId, cabin] of selectedEntries) {
		const flightIndex = getFlightIndex(flightId);

		if (Number.isNaN(flightIndex)) {
			continue;
		}

		const flight = filteredFlights[flightIndex];

		if (!flight) {
			continue;
		}

		if (isConnectingFlightSegement(flightId)) {
			const segmentIndex = getSegmentIndex(flightId);

			if (Number.isNaN(segmentIndex)) {
				continue;
			}

			const displaySegment = flight.segments[segmentIndex];

			if (!displaySegment) {
				continue;
			}

			const rawSegment = getMatchingSegmentFromApiData(rawBound, displaySegment);
			const cabinFareInfo = findCabinFareInfo(rawSegment, cabin);

			totalFlightAmount += getSegmentAmount(rawSegment, cabin);
			segments.push(getSelectedSegmentData(displaySegment, rawSegment, cabin));

			if (cabinFareInfo) {
				selectedFareInfos.push(cabinFareInfo);
			}

			continue;
		}

		for (const displaySegment of flight.segments ?? []) {
			const rawSegment = getMatchingSegmentFromApiData(rawBound, displaySegment);
			const cabinFareInfo = findCabinFareInfo(rawSegment, cabin);

			segments.push(getSelectedSegmentData(displaySegment, rawSegment, cabin));

			if (cabinFareInfo) {
				selectedFareInfos.push(cabinFareInfo);
			}
		}

		totalFlightAmount += getFlightAmount(flight, cabin);
	}

	const passengerFareBreakdown = getPassengerFareBreakdown(
		selectedEntries,
		filteredFlights,
		rawBound
	);

	return {
		segments,
		selectedFareInfos,
		passengerFareBreakdown,
		totalFlightAmount,
	};
};

type selectedFlightDataArgs = {
	tripType: "oneway" | "roundtrip";
	selectedCabinsOutbound: FlightCabinState;
	selectedCabinsInbound: FlightCabinState;
	filteredFlightsOutbound: Flightdetails[];
	filteredFlightsInbound: Flightdetails[];
	rawOutbound: FlightSelectionBound | undefined;
	rawInbound: FlightSelectionBound | undefined;
	currency: string;
	language: string;
};

type PassengerCounts = {
	childC: number;
	infant: number;
};

const getPassengerType = (passengerCounts: PassengerCounts): "adult" | "child" => {
	const hasChildren = passengerCounts.childC > 0 || passengerCounts.infant > 0;

	return hasChildren ? "child" : "adult";
};

/**
 * Builds the final confirmed flight payload.
 *
 * This payload is stored in Redux after the user confirms flight selection.
 */
const selectedFlightData = ({
	tripType,
	selectedCabinsOutbound,
	selectedCabinsInbound,
	filteredFlightsOutbound,
	filteredFlightsInbound,
	rawOutbound,
	rawInbound,
	currency,
	language,
}: selectedFlightDataArgs): ConfirmedFlightPayload => {
	const outbound = getSelectedFlightBoundDetails(
		selectedCabinsOutbound,
		filteredFlightsOutbound,
		rawOutbound
	);

	const inbound =
		tripType === "roundtrip"
			? getSelectedFlightBoundDetails(selectedCabinsInbound, filteredFlightsInbound, rawInbound)
			: undefined;

	const grandTotalAmount = outbound.totalFlightAmount + (inbound?.totalFlightAmount ?? 0);

	return {
		tripType,
		selectedCabinsOutbound,
		selectedCabinsInbound,
		flights: {
			outbound,
			...(inbound ? { inbound } : {}),
		},
		grandTotalAmount,
		currency,
		language,
	};
};

/**
 * Renders the flight-selection page and orchestrates UI-only state.
 * @param locale Active locale used for flight data loading.
 * @returns Flight selection layout with outbound and inbound sections.
 */
export const FlightSelection = ({ locale, flightSelectionAssets }: FlightSelectionProps) => {
	const standardCabinImage =
		flightSelectionAssets?.standardCabinMobileImage?.url ?? standardImage.src;
	const standardCabinDesktopImage =
		flightSelectionAssets?.standardCabinDesktopImage?.url ?? standardDesktopImage.src;
	const zipfullflatCabinImage =
		flightSelectionAssets?.zipfullflatCabinMobileImage?.url ?? zipFullFlatImage.src;
	const zipfullflatCabinDesktopImage =
		flightSelectionAssets?.zipfullflatCabinDesktopImage?.url ?? zipfullflatDesktopImage.src;
	const boundDisplayImages = {
		standardCabinImage: standardCabinImage as unknown as BoundDisplayProps["standardCabinImage"],
		zipFullFlatImage: zipfullflatCabinImage as unknown as BoundDisplayProps["zipFullFlatImage"],
		standardDesktopImage:
			standardCabinDesktopImage as unknown as BoundDisplayProps["standardDesktopImage"],
		zipfullflatDesktopImage:
			zipfullflatCabinDesktopImage as unknown as BoundDisplayProps["zipfullflatDesktopImage"],
	};

	const isIbeAppDateConfirmRoutingEnabled = true;
	const [open, setOpen] = useState(false);
	const [roundTripCalendarSet, setRoundTripCalendar] = useState(false);
	const [seatType, setSeatType] = useState<"standard" | "zip">("standard");
	const [visibleMonths, setVisibleMonths] = useState<{ first: Date; second: Date } | null>(null);
	const requestedCalendarRangesRef = useRef<{
		contextKey: string;
		ranges: Array<{ from: string; to: string }>;
	}>({ contextKey: "", ranges: [] });

	const flightSelectionLabels = useTranslations("flight_selection_page");

	const router = useRouter();
	const pathname = usePathname();
	const searchParams = useSearchParams();

	/** Builds the flight selection request payload from URL query parameters. */
	const requestPayload = useMemo(
		() => ({
			routes: searchParams.get("routes") ?? "",
			departureDateFrom: searchParams.get("departureDateFrom") ?? "",
			departureDateTo: searchParams.get("departureDateTo") ?? undefined,
			adult: Number(searchParams.get("adult") ?? 0),
			childA: Number(searchParams.get("childA") ?? 0),
			childB: Number(searchParams.get("childB") ?? 0),
			childC: Number(searchParams.get("childC") ?? 0),
			infant: Number(searchParams.get("infant") ?? 0),
		}),
		[searchParams]
	);

	const passengerType = useMemo(
		() =>
			getPassengerType({
				childC: requestPayload.childC,
				infant: requestPayload.infant,
			}),
		[requestPayload.childC, requestPayload.infant]
	);

	const dispatch = useAppDispatch();

	/** Updates only the date fields in the Redux flight menu bar state */
	const updateFlightMenuDateOnly = useCallback(
		(nextDepartureDateFrom: string, nextDepartureDateTo?: string) => {
			dispatch(
				setFlightSelectionRequest({
					...requestPayload,
					departureDateFrom: nextDepartureDateFrom,
					departureDateTo: nextDepartureDateTo,
				})
			);
		},
		[dispatch, requestPayload]
	);

	useEffect(() => {
		dispatch(setFlightSelectionRequest(requestPayload));
	}, [dispatch, requestPayload]);
	//  send payload getting data and mapping to these objects
	const {
		isLoadingFlights,
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
	} = flightSelectionData(locale, requestPayload);

	const [showError, setShowError] = useState(false);
	const [showEmergencyDialog, setShowEmergencyDialog] = useState(false);
	const [hasAgreedEmergencySupport, setHasAgreedEmergencySupport] = useState(false);
	const [isPassengerDialogOpen, setIsPassengerDialogOpen] = useState(false);
	const outboundRef = useRef<HTMLDivElement | null>(null);
	const inboundRef = useRef<HTMLDivElement | null>(null);
	const {
		outboundFares,
		inboundFares,
		loadedRanges,
		isPending: isCalendarPending,
		error: calendarError,
	} = useAppSelector((state) => state.calendarFares);

	const today = useMemo(() => {
		const d = new Date();
		d.setHours(0, 0, 0, 0);
		return d;
	}, []);

	const maxDate = useMemo(() => {
		const d = new Date(today);
		d.setDate(d.getDate() + 364);
		return d;
	}, [today]);

	const formatRouteDate = useCallback((date: Date) => {
		const year = date.getFullYear();
		const month = String(date.getMonth() + 1).padStart(2, "0");
		const day = String(date.getDate()).padStart(2, "0");

		return `${year}-${month}-${day}`;
	}, []);

	const getRouteDateFromMonthDay = useCallback(
		(monthDay: string, referenceDateString: string): string | undefined => {
			if (!monthDay.trim() || !referenceDateString.trim()) {
				return undefined;
			}

			const referenceDate = new Date(referenceDateString);
			const [month = 1, day = 1] = monthDay.split("-").map(Number);
			let year = referenceDate.getFullYear();

			if (month < referenceDate.getMonth() + 1) {
				year += 1;
			}

			return formatRouteDate(new Date(year, month - 1, day));
		},
		[formatRouteDate]
	);

	const getCalendarMonthStart = useCallback(
		(dateString: string) => {
			const monthStart = stringToDate(dateString);
			monthStart.setDate(1);

			return monthStart < today ? formatRouteDate(today) : formatRouteDate(monthStart);
		},
		[formatRouteDate, today]
	);

	const getSelectedCalendarRequestDates = useCallback(() => {
		const selectedOutboundRouteDate = selectedDateOutbound?.trim()
			? getRouteDateFromMonthDay(selectedDateOutbound, requestPayload.departureDateFrom)
			: undefined;
		const outboundDate = selectedOutboundRouteDate ?? requestPayload.departureDateFrom;
		const inboundDate = selectedDateInbound?.trim()
			? (getRouteDateFromMonthDay(selectedDateInbound, outboundDate) ??
				requestPayload.departureDateTo)
			: requestPayload.departureDateTo;
		const calendarDate = isRoundTrip ? (inboundDate ?? outboundDate) : outboundDate;
		const calendarMonthStart = getCalendarMonthStart(calendarDate);

		return {
			departureDateFrom: calendarMonthStart,
			departureDateTo: calendarMonthStart,
			selectedOutboundRouteDate,
		};
	}, [
		getCalendarMonthStart,
		getRouteDateFromMonthDay,
		isRoundTrip,
		requestPayload.departureDateFrom,
		requestPayload.departureDateTo,
		selectedDateInbound,
		selectedDateOutbound,
	]);

	const getAlignedCalendarWindowStart = useCallback(
		(targetMonthStart: Date, anchorMonthStart: Date) => {
			const monthOffset =
				(targetMonthStart.getFullYear() - anchorMonthStart.getFullYear()) * 12 +
				(targetMonthStart.getMonth() - anchorMonthStart.getMonth());
			const alignedOffset = Math.floor(monthOffset / 3) * 3;

			return new Date(
				anchorMonthStart.getFullYear(),
				anchorMonthStart.getMonth() + alignedOffset,
				1
			);
		},
		[]
	);

	const requestCalendarFares = useCallback(
		(
			rangeToFetch: { from: string; to: string },
			requestMode: "selected-dates" | "visible-month" = "selected-dates"
		) => {
			if (!requestPayload.routes) return;

			const selectedRequestDates = getSelectedCalendarRequestDates();
			const visibleMonthRequestDate = getCalendarMonthStart(rangeToFetch.from);
			const departureDateFrom =
				requestMode === "visible-month"
					? visibleMonthRequestDate
					: selectedRequestDates.departureDateFrom;
			const departureDateTo =
				requestMode === "visible-month"
					? visibleMonthRequestDate
					: selectedRequestDates.departureDateTo;

			const calendarRequestPayload = {
				routes: requestPayload.routes,
				departureDateFrom: departureDateFrom,
				departureDateTo: departureDateTo,
				language: locale,
				currency: "JPY",
				promotionCode: searchParams.get("promotionCode") ?? undefined,
			};

			const contextKey = JSON.stringify({
				routes: calendarRequestPayload.routes,
				language: calendarRequestPayload.language,
				currency: calendarRequestPayload.currency,
				promotionCode: calendarRequestPayload.promotionCode,
				tripType,
			});
			const requestedCalendarRanges = requestedCalendarRangesRef.current;

			if (requestedCalendarRanges.contextKey !== contextKey) {
				requestedCalendarRanges.contextKey = contextKey;
				requestedCalendarRanges.ranges = [];
			}

			if (
				requestedCalendarRanges.ranges.some(
					(range) => range.from === rangeToFetch.from && range.to === rangeToFetch.to
				)
			) {
				return;
			}

			requestedCalendarRanges.ranges.push(rangeToFetch);

			void dispatch(
				fetchCalendarFares({
					locale,
					request: calendarRequestPayload,
					loadedRange: rangeToFetch,
				})
			)
				.catch(() => undefined)
				.finally(() => {
					if (requestedCalendarRangesRef.current.contextKey !== contextKey) return;
					requestedCalendarRangesRef.current.ranges =
						requestedCalendarRangesRef.current.ranges.filter(
							(range) => range.from !== rangeToFetch.from || range.to !== rangeToFetch.to
						);
				});
		},
		[
			dispatch,
			getSelectedCalendarRequestDates,
			getCalendarMonthStart,
			locale,
			requestPayload.routes,
			searchParams,
			tripType,
		]
	);

	useEffect(() => {
		if (!open || !requestPayload.routes) return;

		const { departureDateFrom } = getSelectedCalendarRequestDates();
		const initialVisibleMonthDate = departureDateFrom
			? new Date(`${departureDateFrom}T00:00:00`)
			: today;
		initialVisibleMonthDate.setDate(1);

		const rangeToFetch = getNextCalendarWindowRange(initialVisibleMonthDate);
		const endDate = stringToDate(rangeToFetch.to);
		const needsFetch = isLoadMoreNeeded(initialVisibleMonthDate, endDate, loadedRanges);

		if (!needsFetch) {
			return;
		}

		requestCalendarFares(rangeToFetch);
	}, [
		open,
		requestPayload.routes,
		today,
		loadedRanges,
		requestCalendarFares,
		getSelectedCalendarRequestDates,
	]);

	const handleVisibleMonthChange = useCallback((visibleMonth: Date, secondVisibleMonth: Date) => {
		setVisibleMonths({ first: visibleMonth, second: secondVisibleMonth });
	}, []);

	useEffect(() => {
		if (!open || !requestPayload.routes || !visibleMonths) return;

		const { departureDateFrom } = getSelectedCalendarRequestDates();
		const anchorMonthStart = departureDateFrom
			? new Date(`${departureDateFrom}T00:00:00`)
			: new Date(today);
		anchorMonthStart.setDate(1);

		const { start: month1Start, end: month1End } = getMonthDateRange(
			visibleMonths.first.getFullYear(),
			visibleMonths.first.getMonth()
		);
		const { end: month2End } = getMonthDateRange(
			visibleMonths.second.getFullYear(),
			visibleMonths.second.getMonth()
		);

		const extendedStart = month1Start;
		const extendedEnd = new Date(Math.max(month1End.getTime(), month2End.getTime()));

		if (!isLoadMoreNeeded(extendedStart, extendedEnd, loadedRanges)) {
			return;
		}

		const requestedRanges = requestedCalendarRangesRef.current.ranges;
		let furthestDate = new Date(today);
		for (const range of [...loadedRanges, ...requestedRanges]) {
			const rangeEnd = stringToDate(range.to);
			if (rangeEnd >= furthestDate) {
				furthestDate = new Date(rangeEnd);
				furthestDate.setDate(furthestDate.getDate() + 1);
			}
		}

		while (furthestDate <= maxDate && extendedEnd > furthestDate) {
			const rangeToFetch = getNextCalendarWindowRange(furthestDate);
			if (stringToDate(rangeToFetch.from) > maxDate) break;
			requestCalendarFares(rangeToFetch, "visible-month");
			const nextFurthestDate = stringToDate(rangeToFetch.to);
			nextFurthestDate.setDate(nextFurthestDate.getDate() + 1);
			if (nextFurthestDate <= furthestDate) break;
			furthestDate = nextFurthestDate;
		}

		let earliestDate: Date | undefined;
		for (const range of [...loadedRanges, ...requestedRanges]) {
			const rangeStart = stringToDate(range.from);
			if (!earliestDate || rangeStart < earliestDate) {
				earliestDate = rangeStart;
			}
		}

		while (earliestDate && extendedStart < earliestDate) {
			const fetchWindowStart = getAlignedCalendarWindowStart(extendedStart, anchorMonthStart);

			if (fetchWindowStart >= earliestDate || fetchWindowStart > maxDate) break;

			const rangeToFetch = getNextCalendarWindowRange(fetchWindowStart);
			requestCalendarFares(rangeToFetch, "visible-month");
			const nextEarliestDate = stringToDate(rangeToFetch.from);
			if (nextEarliestDate >= earliestDate) break;
			earliestDate = nextEarliestDate;
		}
	}, [
		getAlignedCalendarWindowStart,
		getSelectedCalendarRequestDates,
		open,
		requestPayload.routes,
		visibleMonths,
		loadedRanges,
		today,
		maxDate,
		requestCalendarFares,
	]);

	const outboundPrices = useMemo(() => {
		if (seatType === "standard") {
			return convertFaresToPrices(outboundFares, "standard");
		}
		return convertFaresToPrices(outboundFares, "zip");
	}, [outboundFares, seatType]);

	const inboundPrices = useMemo(() => {
		if (seatType === "standard") {
			return convertFaresToPrices(inboundFares, "standard");
		}
		return convertFaresToPrices(inboundFares, "zip");
	}, [inboundFares, seatType]);

	const outboundPromoPrices = useMemo(() => {
		if (seatType === "standard") {
			return convertPromoFaresToPrices(outboundFares, "standard");
		}
		return convertPromoFaresToPrices(outboundFares, "zip");
	}, [outboundFares, seatType]);

	const inboundPromoPrices = useMemo(() => {
		if (seatType === "standard") {
			return convertPromoFaresToPrices(inboundFares, "standard");
		}
		return convertPromoFaresToPrices(inboundFares, "zip");
	}, [inboundFares, seatType]);

	const initialDepartureDate = useMemo(() => {
		if (!selectedDateOutbound) return null;
		const fullDate = getRouteDateFromMonthDay(
			selectedDateOutbound,
			requestPayload.departureDateFrom
		);
		return fullDate ? new Date(`${fullDate}T00:00:00`) : null;
	}, [selectedDateOutbound, getRouteDateFromMonthDay, requestPayload.departureDateFrom]);

	const initialReturnDate = useMemo(() => {
		if (!selectedDateInbound) return null;
		const outboundFull = selectedDateOutbound
			? getRouteDateFromMonthDay(selectedDateOutbound, requestPayload.departureDateFrom)
			: null;
		const ref = outboundFull ?? requestPayload.departureDateFrom;
		const fullDate = getRouteDateFromMonthDay(selectedDateInbound, ref);
		return fullDate ? new Date(`${fullDate}T00:00:00`) : null;
	}, [
		selectedDateInbound,
		selectedDateOutbound,
		getRouteDateFromMonthDay,
		requestPayload.departureDateFrom,
	]);

	const isCalendarLoading = isCalendarPending || (open && !loadedRanges.length && !calendarError);

	const isOneWay = tripType === "oneway" && !roundTripCalendarSet;

	const formatCalendarSelectionDate = useCallback((date: Date) => {
		return `${date.getMonth() + 1}-${date.getDate()}`;
	}, []);

	const pushFlightSelectionPath = useCallback(
		(outboundDate: Date, inboundDate: Date | null) => {
			if (!isIbeAppDateConfirmRoutingEnabled) {
				return;
			}

			const nextParams = new URLSearchParams(searchParams.toString());
			nextParams.set("departureDateFrom", formatRouteDate(outboundDate));

			if (inboundDate) {
				nextParams.set("departureDateTo", formatRouteDate(inboundDate));
			} else {
				nextParams.delete("departureDateTo");
			}

			const nextQuery = nextParams.toString();
			router.push(nextQuery ? `${pathname}?${nextQuery}` : pathname);
		},
		[formatRouteDate, pathname, router, searchParams]
	);

	const handleRoundTripConfirm = useCallback(
		(departure: Date, returnDate: Date) => {
			//setConfirmedDeparture(departure);
			//setConfirmedReturn(returnDate);
			setSelectedDateOutbound(formatCalendarSelectionDate(departure));
			setSelectedDateInbound(formatCalendarSelectionDate(returnDate));
			pushFlightSelectionPath(departure, returnDate);
			setOpen(false);
		},
		[
			formatCalendarSelectionDate,
			pushFlightSelectionPath,
			setSelectedDateOutbound,
			setSelectedDateInbound,
		]
	);

	const handleOneWayConfirm = useCallback(
		(outboundDate: Date) => {
			//setConfirmedDeparture(outboundDate);
			//setConfirmedReturn(null);
			setSelectedDateOutbound(formatCalendarSelectionDate(outboundDate));
			setSelectedDateInbound("");
			pushFlightSelectionPath(outboundDate, null);
			setOpen(false);
		},
		[
			formatCalendarSelectionDate,
			pushFlightSelectionPath,
			setSelectedDateOutbound,
			setSelectedDateInbound,
		]
	);

	const handleCalendarReset = useCallback(() => {
		setSeatType("standard");
	}, []);

	const hasOutboundFlights = mappedFlightsOutbound.length > 0;
	const hasSelectedOutbound = Object.values(selectedCabinsOutbound).some(Boolean);
	const hasSelectedInbound = Object.values(selectedCabinsInbound).some(Boolean);

	const [connectingFlightErrors, setConnectingFlightErrors] = useState<ConnectingFlightError[]>([]);

	useEffect(() => {
		if (selectedDateOutbound) {
			setShowError(false);
			setConnectingFlightErrors([]);
		}
	}, [selectedDateOutbound]);

	const isOutboundInvalid =
		mappedFlightsOutbound.length === 0 ||
		isOutboundSelectionIncomplete(selectedCabinsOutbound, mappedFlightsOutbound);

	const isInboundInvalid = isRoundTrip && !hasSelectedInbound;
	const selectedOutboundRouteDate = useMemo(() => {
		if (!selectedDateOutbound) {
			return requestPayload.departureDateFrom;
		}

		return (
			getRouteDateFromMonthDay(selectedDateOutbound, requestPayload.departureDateFrom) ??
			requestPayload.departureDateFrom
		);
	}, [selectedDateOutbound, requestPayload.departureDateFrom, getRouteDateFromMonthDay]);
	const outboundDateDisable = calendarTabsOutbound.map((tab) => {
		if (!hasSelectedInbound || !selectedDateInbound) {
			return { ...tab, disabled: tab.disabled };
		}

		const outboundRouteDate = getRouteDateFromMonthDay(tab.value, requestPayload.departureDateFrom);
		const selectedInboundRouteDate = getRouteDateFromMonthDay(
			selectedDateInbound,
			selectedOutboundRouteDate
		);

		return {
			...tab,
			disabled:
				tab.disabled ||
				(!!outboundRouteDate &&
					!!selectedInboundRouteDate &&
					outboundRouteDate >= selectedInboundRouteDate),
		};
	});
	// disable dates in inbound prior to outbound date
	const inboundDateDisable = calendarTabsInbound.map((tab) => {
		if (!hasSelectedOutbound || !selectedOutboundRouteDate) {
			return { ...tab, disabled: tab.disabled };
		}

		const inboundRouteDate = getRouteDateFromMonthDay(tab.value, selectedOutboundRouteDate);

		return {
			...tab,
			disabled:
				tab.disabled ||
				(!!selectedOutboundRouteDate &&
					!!inboundRouteDate &&
					inboundRouteDate <= selectedOutboundRouteDate),
		};
	});
	const isOutboundDateDisabled = outboundDateDisable.some(
		(tab) => tab.value === selectedDateOutbound && tab.disabled
	);
	const isInboundDateDisabled = inboundDateDisable.some(
		(tab) => tab.value === selectedDateInbound && tab.disabled
	);

	const flightData = useAppSelector((state) => state.flightSelection.data);

	/**
	 * Builds and dispatches the confirmed flight selection payload.
	 */
	const updateStoreWithSelectedFlightData = () => {
		const payload = selectedFlightData({
			tripType,
			selectedCabinsOutbound,
			selectedCabinsInbound,
			filteredFlightsOutbound,
			filteredFlightsInbound,
			rawOutbound: flightData?.data?.outbound,
			rawInbound: flightData?.data?.inbound,
			currency: "JPY",
			language: locale,
		});
		dispatch(confirmFlightSelection(payload));
	};
	const handleValidationScroll = (connectingErrors?: ConnectingFlightError[]) => {
		const errorFlightId = connectingErrors?.[0]?.groupId;
		const scrollOptions: ScrollIntoViewOptions = {
			behavior: "smooth",
			block: "start",
		};

		if (errorFlightId) {
			document.getElementById(errorFlightId)?.scrollIntoView(scrollOptions);
		} else if (connectingErrors?.length || !hasSelectedOutbound) {
			window.scrollTo({
				top: 0,
				behavior: "smooth",
			});
		} else if (!hasSelectedInbound) {
			inboundRef?.current?.scrollIntoView(scrollOptions);
		}
	};

	/**
	 * Validates the current selection before opening passenger entry.
	 * Stores the confirmed flight payload only when all business checks pass.
	 */
	const confirmAndProceedClick = (e: React.MouseEvent<HTMLButtonElement>) => {
		const hasSelectedOutbound = Object.values(selectedCabinsOutbound || {}).some(Boolean);
		const hasSelectedInbound = Object.values(selectedCabinsInbound || {}).some(Boolean);
		let connectingErrors: ConnectingFlightError[] = [];
		// Prevent proceeding when no flights are availables
		if (mappedFlightsOutbound.length === 0) {
			e.preventDefault();
			setShowError(true);
			setConnectingFlightErrors([]);
			handleValidationScroll();
			return;
		}
		if (tripType === "oneway" && hasConnectingOutbound) {
			connectingErrors = getConnectingFlightSelectionErrors(
				mappedFlightsOutbound,
				selectedCabinsOutbound,
				flightSelectionLabels
			);

			setConnectingFlightErrors(connectingErrors);

			if (connectingErrors.length > 0) {
				e.preventDefault();

				setConnectingFlightErrors(connectingErrors);
				handleValidationScroll(connectingErrors);

				return;
			}
		} else if (tripType === "oneway" && isOutboundInvalid) {
			setConnectingFlightErrors([]);
			e.preventDefault();

			setShowError(true);
			handleValidationScroll();

			return;
		} else if (tripType !== "oneway" && (!hasSelectedOutbound || !hasSelectedInbound)) {
			e.preventDefault();

			setShowError(true);
			handleValidationScroll();

			return;
		}

		setShowError(false);

		const hasZipFullFlatSelected =
			Object.values(selectedCabinsOutbound || {}).includes("zipfullflat") ||
			Object.values(selectedCabinsInbound || {}).includes("zipfullflat");

		if (hasZipFullFlatSelected && !hasAgreedEmergencySupport) {
			updateStoreWithSelectedFlightData();
			e.preventDefault();
			setIsPassengerDialogOpen(false);
			setShowEmergencyDialog(true);
			return;
		}

		updateStoreWithSelectedFlightData();
	};

	const totalAmount = calculateGrandTotal(
		selectedCabinsOutbound,
		filteredFlightsOutbound,
		selectedCabinsInbound,
		filteredFlightsInbound,
		isRoundTrip
	);

	if (isLoadingFlights) {
		return <LoadingOverlay />;
	}

	const hasConnectingFlights = filteredFlightsOutbound.some((flight) => flight.isConnectingFlight);

	return (
		<div className="flight-selection-page flex min-h-screen w-full flex-col bg-white">
			<div className="flex items-start justify-between gap-4 px-4 md:px-0">
				<div className="min-w-0 flex-1">
					<BookingHeader title={flightSelectionLabels("flight_page_title")} description={null} />
				</div>

				<button
					type="button"
					className="inline-flex w-[11.375rem] shrink-0 items-center whitespace-nowrap rounded-md border border-primary-600 bg-transparent px-5 py-2.5 font-medium text-base text-primary-700 hover:cursor-pointer"
					aria-haspopup="dialog"
					aria-expanded={open}
					onClick={() => {
						setRoundTripCalendar(false);
						setOpen(true);
					}}
				>
					{flightSelectionLabels("date_selection_button_label")}
					<Icon
						name="calendar_month"
						size={24}
						fill={0}
						wght={400}
						grad={0}
						opsz={24}
						className="shrink-0 pl-2 text-base-400"
					/>
				</button>
			</div>

			<BoundDisplay
				title={flightSelectionLabels("outbound_label")}
				tabs={outboundDateDisable}
				selectedDate={selectedDateOutbound}
				onDateChange={(value: string) => {
					setSelectedDateOutbound(value);

					const outboundRouteDate = getRouteDateFromMonthDay(
						value,
						requestPayload.departureDateFrom
					);

					if (outboundRouteDate) {
						const inboundRouteDate = selectedDateInbound
							? (getRouteDateFromMonthDay(selectedDateInbound, outboundRouteDate) ?? undefined)
							: requestPayload.departureDateTo;
						updateFlightMenuDateOnly(outboundRouteDate, inboundRouteDate);
					}
				}}
				flights={mappedFlightsOutbound}
				selectedCabins={selectedCabinsOutbound}
				onCabinSelect={onSelectOutboundCabin}
				standardCabinImage={boundDisplayImages.standardCabinImage}
				zipFullFlatImage={boundDisplayImages.zipFullFlatImage}
				standardDesktopImage={boundDisplayImages.standardDesktopImage}
				zipfullflatDesktopImage={boundDisplayImages.zipfullflatDesktopImage}
				ref={outboundRef}
				isConnectingFlightBound={hasConnectingOutbound}
				connectingFlightErrors={connectingFlightErrors}
				disableCabinSelection={isOutboundDateDisabled}
				showError={showError && isOutboundInvalid && connectingFlightErrors.length === 0}
			/>

			{isRoundTrip ? (
				<BoundDisplay
					title={flightSelectionLabels("inbound_label")}
					tabs={inboundDateDisable}
					selectedDate={selectedDateInbound}
					onDateChange={(value: string) => {
						if (!hasSelectedOutbound || !selectedDateOutbound) {
							setSelectedDateInbound(value);

							const inboundRouteDate = getRouteDateFromMonthDay(
								value,
								requestPayload.departureDateFrom
							);

							if (inboundRouteDate) {
								updateFlightMenuDateOnly(requestPayload.departureDateFrom, inboundRouteDate);
							}

							return;
						}

						const outboundRouteDate = getRouteDateFromMonthDay(
							selectedDateOutbound,
							requestPayload.departureDateFrom
						);

						const inboundRouteDate = getRouteDateFromMonthDay(
							value,
							outboundRouteDate ?? requestPayload.departureDateFrom
						);
						if (outboundRouteDate && inboundRouteDate && inboundRouteDate <= outboundRouteDate) {
							return;
						}

						setSelectedDateInbound(value);

						if (inboundRouteDate) {
							updateFlightMenuDateOnly(
								outboundRouteDate ?? requestPayload.departureDateFrom,
								inboundRouteDate
							);
						}
					}}
					flights={mappedFlightsInbound}
					selectedCabins={selectedCabinsInbound}
					onCabinSelect={onSelectInboundCabin}
					standardCabinImage={boundDisplayImages.standardCabinImage}
					zipFullFlatImage={boundDisplayImages.zipFullFlatImage}
					standardDesktopImage={boundDisplayImages.standardDesktopImage}
					zipfullflatDesktopImage={boundDisplayImages.zipfullflatDesktopImage}
					ref={inboundRef}
					disableCabinSelection={isInboundDateDisabled}
					showError={showError && isInboundInvalid}
				/>
			) : null}

			{!isRoundTrip && hasOutboundFlights && !hasConnectingFlights ? (
				<div>
					<div className="mx-4 flex items-center gap-2 border-b pb-4 md:mx-0">
						<h2 className="pl-4 font-bold text-2xl text-primary-700 md:pl-0">
							{flightSelectionLabels("inbound_label")}
						</h2>

						<span className="flex w-[8.125rem] items-center rounded bg-red-100 px-2.5 py-0.5 text-red-800 text-xs">
							<Icon
								name="warning"
								size={12}
								fill={1}
								color=""
								variant="rounded"
								className="shrink-0 text-current"
							/>
							<span className="pl-1.5 font-medium">
								{flightSelectionLabels("no_return_flight_label")}
							</span>
						</span>
					</div>

					<div className="mx-4 my-4 h-auto w-auto rounded border border-gray-300 bg-white p-4 md:mx-0 md:mb-6">
						<div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
							<p className="text-base text-gray-700 leading-5 md:max-w-[44%]">
								{flightSelectionLabels("one_way_ticket_message")}
							</p>

							<Button
								type="button"
								size="xl"
								aria-haspopup="dialog"
								aria-expanded={open}
								onClick={() => {
									setRoundTripCalendar(true);
									setOpen(true);
								}}
								className="shrink-0 rounded-md border border-primary-600 bg-transparent px-5 py-2 font-medium text-base text-primary-700 hover:bg-transparent md:min-w-[16rem]"
							>
								{flightSelectionLabels("add_return_flight_button_label")}
							</Button>
						</div>
					</div>
				</div>
			) : null}

			{hasOutboundFlights && (
				<div className="mx-2 bg-gray-50 p-4 text-gray-700 text-sm md:mx-0">
					<ul className="list-disc space-y-2 pl-5">
						<li>{flightSelectionLabels("airfare_not_guaranteed_message")}</li>
						<li>
							{flightSelectionLabels.rich("check_in_baggage_fee_message", {
								link: (chunks) => (
									<a
										href="https://www.zipair.net/en/service/baggage"
										className="text-primary-700 underline"
										target="_blank"
										rel="noopener noreferrer"
									>
										{chunks}
									</a>
								),
							})}
						</li>
						<li>
							{flightSelectionLabels.rich("fare_restrictions_message", {
								link: (chunks) => (
									<a
										href="https://www.zipair.net/en/farerules"
										className="text-primary-700 underline"
										target="_blank"
										rel="noopener noreferrer"
									>
										{chunks}
									</a>
								),
							})}
						</li>
					</ul>
				</div>
			)}

			<div className="flight-selection-action z-10 mx-4 border-base-200 bg-white pt-4 pb-14 md:mx-0 md:pt-6">
				<BookingFooter
					amountValue={totalAmount}
					action={
						<>
							<Dialog open={isPassengerDialogOpen} onOpenChange={setIsPassengerDialogOpen}>
								<DialogTrigger asChild>
									<Button
										onClick={confirmAndProceedClick}
										variant="primary"
										size="xl"
										className="w-full rounded-lg bg-primary-600 py-3.5 md:w-auto md:min-w-64"
									>
										{flightSelectionLabels("proceed_to_enter_customer_info_button_label")}
									</Button>
								</DialogTrigger>
								{isPassengerDialogOpen ? <EnterPassengerDialog locale={locale} /> : null}
							</Dialog>

							<EmergencySupportDialog
								open={showEmergencyDialog}
								onClose={() => setShowEmergencyDialog(false)}
								onAgree={() => {
									updateStoreWithSelectedFlightData();
									setHasAgreedEmergencySupport(true);
									setShowEmergencyDialog(false);
									setIsPassengerDialogOpen(true);
								}}
							/>
						</>
					}
				/>
			</div>
			<DateSelectionModal
				isOpen={open}
				onClose={() => setOpen(false)}
				onConfirm={handleRoundTripConfirm}
				onReset={handleCalendarReset}
				initialDeparture={initialDepartureDate}
				initialReturn={initialReturnDate}
				initialSeatType={seatType}
				oneWay={isOneWay}
				onConfirmOneWay={handleOneWayConfirm}
				outboundPrices={outboundPrices}
				outboundPromoPrices={outboundPromoPrices}
				inboundPrices={inboundPrices}
				inboundPromoPrices={inboundPromoPrices}
				passengerType={passengerType}
				onVisibleMonthChange={handleVisibleMonthChange}
				onSeatTypeChange={setSeatType}
				isLoading={isCalendarLoading}
				outboundFareData={outboundFares}
				inboundFareData={inboundFares}
				currencySymbol="¥"
			/>
		</div>
	);
};
