import {
	BOOKING_CUTOFF_HOURS,
	DEADLINE_24_HOURS,
	DEADLINE_48_HOURS,
	DEADLINE_96_HOURS,
	HOURS_IN_MILLISECONDS,
} from "@/modules/utils/constants/confirmation/confirmation.constants";
import { getBundleSegment } from "@/modules/utils/helpers/bundle/bundle.helpers";
import { isNRTToICNRoute } from "@/modules/utils/helpers/common/country-utils/country-utils";
import type { BookingFlowDirection } from "@/modules/utils/helpers/common/flow-router/flow-router";
import { useAppSelector } from "@/store/hooks";
import { selectConfirmedFlight } from "@/store/slices/flight-selection/flight-selection.slice";
import type { DepartureDateTimeInfo } from "@/types/confirmation/confirmation.types";

/** Checks whether the provided value is a valid date-time string. */
const isValidDateTime = (value?: string): value is string => {
	if (!value) {
		return false;
	}

	return !Number.isNaN(new Date(value).getTime());
};
/** Resolves the best available departure date-time from provided fields. */
export const resolveDepartureDateTime = ({
	departureDateTime,
	departureDateTimeOffset,
}: DepartureDateTimeInfo): string => {
	if (departureDateTimeOffset && departureDateTime) {
		const combinedDateTime = departureDateTimeOffset.includes("T")
			? departureDateTimeOffset
			: `${departureDateTime}${departureDateTimeOffset}`;

		if (isValidDateTime(combinedDateTime)) {
			return combinedDateTime;
		}
	}

	if (isValidDateTime(departureDateTimeOffset)) {
		return departureDateTimeOffset;
	}

	if (isValidDateTime(departureDateTime)) {
		return departureDateTime;
	}

	return departureDateTime ?? departureDateTimeOffset ?? "";
};

/**
 * Returns true when departure is within threshold hours from now,
 * or already in the past.
 */
export const isDeadlineExceeded = (
	departureDateTime: string,
	thresholdHours: number,
	now = new Date()
): boolean => {
	const departure = new Date(departureDateTime);
	return departure.getTime() - now.getTime() <= thresholdHours * HOURS_IN_MILLISECONDS;
};

/** Shortcut for 24-hour deadline check. */
export const is24HourDeadlineExceeded = (departureDateTime: string): boolean =>
	isDeadlineExceeded(departureDateTime, DEADLINE_24_HOURS);

/** Shortcut for the 90-minute booking cutoff check. */
export const isBookingCutoffExceeded = (departureDateTime: string): boolean =>
	isDeadlineExceeded(departureDateTime, BOOKING_CUTOFF_HOURS);

/** Shortcut for 48-hour deadline check. */
export const is48HourDeadlineExceeded = (departureDateTime: string): boolean =>
	isDeadlineExceeded(departureDateTime, DEADLINE_48_HOURS);

/**
 * Returns true when fewer than 96 hours remain before the departure.
 */
export const is96HourDeadlineExceeded = (departureDateTime: string): boolean =>
	isDeadlineExceeded(departureDateTime, DEADLINE_96_HOURS);

/**
 * Derives departure datetime from confirmed flight and returns 24h/48h deadline flags.
 * Bundle purchase deadline rule by route:
 * NRT-ICN uses 24 hours, all other routes use 48 hours.
 */
export const getBundleDeadlineHours = (
	outboundSegments: Parameters<typeof isNRTToICNRoute>[0]
): 24 | 48 => (isNRTToICNRoute(outboundSegments) ? DEADLINE_24_HOURS : DEADLINE_48_HOURS);

/**
 * Evaluates bundle purchase cutoff using route-specific deadline window.
 */
export const isBundlePurchaseDeadlineExceeded = (
	departureDateTime: string,
	outboundSegments: Parameters<typeof isNRTToICNRoute>[0],
	now = new Date()
): boolean => isDeadlineExceeded(departureDateTime, getBundleDeadlineHours(outboundSegments), now);

/**
 * Hook that exposes departure deadline status for active booking direction.
 * Reads current segment from confirmed flight, then returns standard
 * 24h/48h checks and route-aware bundle purchase deadline state.
 */
export const useDepartureDeadline = (direction: BookingFlowDirection = "outbound") => {
	const confirmedFlight = useAppSelector(selectConfirmedFlight);
	const outboundSegments = confirmedFlight?.flights.outbound.segments ?? [];
	const currentSegment = getBundleSegment(confirmedFlight, direction);
	const departureDateTime =
		currentSegment?.scheduledDepartureArrivalDateTime?.departureDateTime || "";
	const now = new Date();
	const bundleDeadlineHours = getBundleDeadlineHours(outboundSegments);

	return {
		is24HourDeadlineExceeded: isDeadlineExceeded(departureDateTime, DEADLINE_24_HOURS, now),
		is48HourDeadlineExceeded: isDeadlineExceeded(departureDateTime, DEADLINE_48_HOURS, now),
		is96HourDeadlineExceeded: isDeadlineExceeded(departureDateTime, DEADLINE_96_HOURS, now),
		isBundlePurchaseDeadlineExceeded: isDeadlineExceeded(
			departureDateTime,
			bundleDeadlineHours,
			now
		),
		bundleDeadlineHours,
	};
};

/**
 * Derives departure datetime difference from confirmed flight
 */
export const getRemainingHours = (departureTime: string): number => {
	const departureUtc = new Date(departureTime).getTime();

	const currentUtc = Date.now();

	return (departureUtc - currentUtc) / (1000 * 60 * 60);
};
