"use client";

import { useParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
	convertFaresToPrices,
	convertPromoFaresToPrices,
	getCalendarFaresBoundaryError,
	getMonthDateRange,
	getNextCalendarWindowRange,
	isLoadMoreNeeded,
	stringToDate,
} from "@/modules/utils/helpers/calendar-fare/calendar-fare-utils";
import { buildSearchRoutes } from "@/modules/utils/helpers/flight-search/flight-search.helpers";
import type { AppDispatch, RootState } from "@/store";
import {
	fetchCalendarFares,
	isSameCalendarRequest,
} from "@/store/slices/calendar-fares/calendar-fares.slice";
import type { AppLocale } from "../../../../modules/utils/locales";
import type { CalendarContentProps } from "../../../../types/flight-search/calendar.types";
import DateSelectionModal from "../date-selection-modal/date-selection-modal";

export default function CalendarContent({
	open,
	onOpenChange,
	onConfirm,
	onReset,
	tripType,
	origin,
	destination,
	promotionCode,
	initialDeparture = null,
	initialReturn = null,
	passengerType = "adult",
	initialSeatType,
}: CalendarContentProps) {
	const dispatch = useDispatch<AppDispatch>();
	const params = useParams<{ locale?: string | string[] }>();
	const locale: AppLocale = Array.isArray(params?.locale)
		? ((params.locale[0] ?? "en") as AppLocale)
		: ((params?.locale ?? "en") as AppLocale);
	const isOneWay = tripType === "one-way";
	const isRoundTrip = tripType === "round-trip";
	const [seatType, setSeatType] = useState<"standard" | "zip">("standard");
	const [visibleMonths, setVisibleMonths] = useState<{ first: Date; second: Date } | null>(null);
	const requestedRangesRef = useRef<{
		contextKey: string;
		ranges: Array<{ from: string; to: string }>;
	}>({ contextKey: "", ranges: [] });

	// Reset seat type when initialSeatType changes (e.g., when dates are reset to standard)
	useEffect(() => {
		if (initialSeatType && open) {
			setSeatType(initialSeatType);
		}
	}, [initialSeatType, open]);

	// Get calendar fares from Redux
	const calendarFaresState = useSelector((state: RootState) => state.calendarFares);
	const { outboundFares, inboundFares, loadedRanges, isPending, request, error } =
		calendarFaresState;
	const calendarFaresBoundaryError = useMemo(() => getCalendarFaresBoundaryError(error), [error]);

	if (calendarFaresBoundaryError) {
		throw calendarFaresBoundaryError;
	}

	// Get flight search form data for route info
	const flightFormState = useSelector((state: RootState) => state.flightSearchForm);
	const { data: formData } = flightFormState;
	const activeOrigin = origin || formData?.origin;
	const activeDestination = destination || formData?.destination;
	const activePromotionCode = promotionCode ?? formData?.promotionCode;

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

	const requestCalendarFares = useCallback(
		(rangeToFetch: { from: string; to: string }) => {
			if (!activeOrigin || !activeDestination) return;

			const requestPayload = {
				routes: buildSearchRoutes(activeOrigin, activeDestination, tripType),
				departureDateFrom: rangeToFetch.from,
				departureDateTo: isRoundTrip ? rangeToFetch.from : undefined,
				language: locale,
				currency: "JPY",
				promotionCode: activePromotionCode,
			};
			const contextKey = JSON.stringify({
				routes: requestPayload.routes,
				language: requestPayload.language,
				currency: requestPayload.currency,
				promotionCode: requestPayload.promotionCode,
				tripType,
			});
			const requestedRanges = requestedRangesRef.current;

			if (requestedRanges.contextKey !== contextKey) {
				requestedRanges.contextKey = contextKey;
				requestedRanges.ranges = [];
			}

			if (
				requestedRanges.ranges.some(
					(range) => range.from === rangeToFetch.from && range.to === rangeToFetch.to
				)
			) {
				return;
			}

			if (request && isSameCalendarRequest(request, requestPayload) && !error) {
				return;
			}

			requestedRanges.ranges.push(rangeToFetch);

			void dispatch(
				fetchCalendarFares({
					request: requestPayload,
					loadedRange: rangeToFetch,
				})
			)
				.catch(() => undefined)
				.finally(() => {
					if (requestedRangesRef.current.contextKey !== contextKey) return;
					requestedRangesRef.current.ranges = requestedRangesRef.current.ranges.filter(
						(range) => range.from !== rangeToFetch.from || range.to !== rangeToFetch.to
					);
				});
		},
		[
			activeOrigin,
			activeDestination,
			activePromotionCode,
			dispatch,
			isRoundTrip,
			locale,
			request,
			error,
			tripType,
		]
	);

	// Determine if we need to fetch initial data
	useEffect(() => {
		if (!open || !activeOrigin || !activeDestination) return;

		const rangeToFetch = getNextCalendarWindowRange(today);
		const endDate = stringToDate(rangeToFetch.to);
		const needsFetch = isLoadMoreNeeded(today, endDate, loadedRanges);

		if (!needsFetch) {
			return; // Data already loaded
		}

		requestCalendarFares(rangeToFetch);
	}, [open, activeOrigin, activeDestination, today, loadedRanges, requestCalendarFares]);

	// Track visible months from the modal so a separate effect can lazy-load ranges.
	const handleVisibleMonthChange = useCallback((visibleMonth: Date, secondVisibleMonth: Date) => {
		setVisibleMonths({ first: visibleMonth, second: secondVisibleMonth });
	}, []);

	// Lazy-load fares when visible months move outside loaded ranges.
	useEffect(() => {
		if (!open || !activeOrigin || !activeDestination || !visibleMonths) return;

		const { start: month1Start, end: month1End } = getMonthDateRange(
			visibleMonths.first.getFullYear(),
			visibleMonths.first.getMonth()
		);
		const { end: month2End } = getMonthDateRange(
			visibleMonths.second.getFullYear(),
			visibleMonths.second.getMonth()
		);

		const extendedStart = month1Start;
		const extendedEnd = month2End > month1End ? month2End : month1End;

		if (!isLoadMoreNeeded(extendedStart, extendedEnd, loadedRanges)) {
			return;
		}

		let furthestDate = today;
		for (const range of loadedRanges) {
			const rangeEnd = stringToDate(range.to);
			if (rangeEnd >= furthestDate) {
				furthestDate = rangeEnd;
				furthestDate.setDate(furthestDate.getDate() + 1);
			}
		}
		for (const range of requestedRangesRef.current.ranges) {
			const rangeEnd = stringToDate(range.to);
			if (rangeEnd >= furthestDate) {
				furthestDate = rangeEnd;
				furthestDate.setDate(furthestDate.getDate() + 1);
			}
		}

		while (furthestDate <= maxDate && extendedEnd > furthestDate) {
			const rangeToFetch = getNextCalendarWindowRange(furthestDate);
			if (stringToDate(rangeToFetch.from) > maxDate) break;
			requestCalendarFares(rangeToFetch);
			furthestDate = stringToDate(rangeToFetch.to);
			furthestDate.setDate(furthestDate.getDate() + 1);
		}
	}, [
		open,
		activeOrigin,
		activeDestination,
		visibleMonths,
		loadedRanges,
		today,
		maxDate,
		requestCalendarFares,
	]);

	// Convert Redux fare data to prices format for outbound leg
	const outboundPrices = useMemo(() => {
		if (seatType === "standard") {
			return convertFaresToPrices(outboundFares, "standard");
		}
		return convertFaresToPrices(outboundFares, "zip");
	}, [outboundFares, seatType]);

	// Convert Redux fare data to prices format for inbound leg
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

	const isCalendarLoading = isPending || (open && !loadedRanges.length && !error);

	const handleRoundTripConfirm = (departure: Date, returnDate: Date) => {
		onConfirm(departure, returnDate, seatType);
		onOpenChange(false);
	};

	const handleOneWayConfirm = (outboundDate: Date) => {
		onConfirm(outboundDate, null, seatType);
		onOpenChange(false);
	};

	// Always use real prices from API - no fallback to mock.
	return (
		<DateSelectionModal
			isOpen={open}
			onClose={() => onOpenChange(false)}
			onConfirm={handleRoundTripConfirm}
			onReset={onReset}
			initialDeparture={initialDeparture}
			initialReturn={initialReturn}
			initialSeatType={initialSeatType}
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
	);
}
