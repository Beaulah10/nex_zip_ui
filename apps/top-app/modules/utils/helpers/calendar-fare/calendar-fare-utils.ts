import {
	COMMON_ERROR_CONFIG,
	getBoundaryErrorFromStatusCode,
	getErrorCodeFromBoundaryError,
	getSdkApiError,
	type NormalizedApiError,
	normalizeApiError,
	resolveErrorTitleKey,
} from "@repo/sdk";
import type { FareDataByDate } from "@/store/slices/calendar-fares/calendar-fares.slice";

export type FareDisplay = "available" | "unavailable" | "partial";

const CALENDAR_FARES_BOUNDARY_ERROR_PREFIX = "CALENDAR_FARES_API_ERROR:";

const CALENDAR_FARES_ENDPOINT_ERROR_CONFIG = [
	{ status: 422, code: "NEXUZR002E050", titleKey: "error_titles.NEXUZR002E050" },
	{ status: 404, code: "NEXUZR002E051", titleKey: "error_titles.NEXUZR002E051" },
	{ status: 404, code: "NEXUZR002E052", titleKey: "error_titles.NEXUZR002E052" },
] as const;

const CALENDAR_FARES_ERROR_CONFIG = [
	...CALENDAR_FARES_ENDPOINT_ERROR_CONFIG,
	...COMMON_ERROR_CONFIG,
] as const;

export type CalendarFaresErrorCode = (typeof CALENDAR_FARES_ERROR_CONFIG)[number]["code"];

/**
 * Normalized shape used by the app for calendar fares API failures.
 */
export type CalendarFaresApiError = NormalizedApiError;

/**
 * Ensures calendar fares errors use a stable, display-safe shape.
 */
export function normalizeCalendarFaresApiError(error: {
	status: number;
	code?: string;
	description?: string;
	message?: string;
}): CalendarFaresApiError {
	return normalizeApiError(error, "Unable to fetch calendar fares");
}

/**
 * Converts unknown thrown values into a stable calendar fares error shape.
 *
 * For SDK request errors, it attempts to parse `responseBody` and extract
 * `code`, `description`, and `message`/`error` fields when present.
 */
export function getCalendarFaresApiError(error: unknown): CalendarFaresApiError {
	return getSdkApiError(error, "Unable to fetch calendar fares");
}

/**
 * Resolves the i18n title key for a supported calendar fares error code.
 */
export function getCalendarFaresErrorTitleKey(code: CalendarFaresErrorCode) {
	return resolveErrorTitleKey(code, CALENDAR_FARES_ERROR_CONFIG, "system_error_title");
}

/**
 * Builds an error-boundary error from a normalized calendar fares API error.
 *
 * Supported status/code pairs map to code-specific boundary errors.
 * Any 5xx status maps to a generic boundary error.
 */
export function getCalendarFaresBoundaryError(
	error: Pick<CalendarFaresApiError, "status" | "code"> | null | undefined
) {
	return getBoundaryErrorFromStatusCode(
		error,
		CALENDAR_FARES_ERROR_CONFIG,
		CALENDAR_FARES_BOUNDARY_ERROR_PREFIX
	);
}

/**
 * Extracts a supported calendar fares error code from a boundary error message.
 *
 * Returns `null` if the message does not have the calendar fares prefix or if
 * the extracted suffix is not one of the configured calendar fares error codes.
 */
export function getCalendarFaresErrorCodeFromBoundaryError(
	error: Pick<Error, "message"> | null | undefined
): CalendarFaresErrorCode | null {
	return getErrorCodeFromBoundaryError(
		error,
		CALENDAR_FARES_BOUNDARY_ERROR_PREFIX,
		CALENDAR_FARES_ERROR_CONFIG
	);
}

/**
 * Determines what to display for a date based on availability of fare types.
 * Implements the availability rules from requirements.
 *
 * @param date - The date to display
 * @param faresForDate - Fare data for the date (may have standard and/or zipFullFlat)
 * @param selectedFareType - The selected fare type ("standard" or "zip")
 * @returns Display value: fare amount, "-" for partial unavailability, or "X" for no availability
 */
export function getFareDisplay(
	faresForDate: { standard?: number; zipFullFlat?: number } | undefined,
	selectedFareType: "standard" | "zip"
): string {
	if (!faresForDate) {
		// No fare data for this date at all
		return "X";
	}

	const standardAvailable = faresForDate.standard !== undefined;
	const zipAvailable = faresForDate.zipFullFlat !== undefined;

	// Both available: display the selected fare type
	if (standardAvailable && zipAvailable) {
		const fare = selectedFareType === "standard" ? faresForDate.standard : faresForDate.zipFullFlat;
		if (fare !== undefined) {
			return formatFare(fare);
		}
		return "X";
	}

	// Only standard available
	if (standardAvailable && !zipAvailable) {
		if (selectedFareType === "standard") {
			return faresForDate.standard !== undefined ? formatFare(faresForDate.standard) : "X";
		}
		// Selected ZIP but only standard available
		return "-";
	}

	// Only ZIP available
	if (zipAvailable && !standardAvailable) {
		if (selectedFareType === "zip") {
			return faresForDate.zipFullFlat !== undefined ? formatFare(faresForDate.zipFullFlat) : "X";
		}
		// Selected standard but only ZIP available
		return "-";
	}

	// Neither available
	return "X";
}

/**
 * Formats a fare amount as a currency string.
 * Uses Japanese yen format as per mock data convention.
 */
export function formatFare(amount: number | undefined): string {
	if (amount === undefined || amount === null) return "X";
	return `¥${amount.toLocaleString("en-US")}`;
}

/**
 * Converts API fare response to prices object keyed by date.
 * Only includes dates where the selected fare type is available.
 * Dates where the selected type is unavailable (shown as "-" in availability rules)
 * are omitted, which causes the calendar to show them as unavailable ("×").
 *
 * @param faresData - Fares indexed by date with standard/zipFullFlat keys
 * @param selectedFareType - Filter for "standard" or "zip"
 * @returns Prices object with YYYY-MM-DD keys and formatted fare strings
 */
export function convertFaresToPrices(
	faresData: FareDataByDate,
	selectedFareType: "standard" | "zip"
): Record<string, string> {
	const prices: Record<string, string> = {};

	for (const [date, fares] of Object.entries(faresData)) {
		if (!fares) continue;

		const fareKey = selectedFareType === "standard" ? "standard" : "zipFullFlat";
		const fareAmount = fares[fareKey];

		// Only include dates where the selected fare type is available
		if (fareAmount !== undefined) {
			prices[date] = formatFare(fareAmount);
		}
	}

	return prices;
}

/**
 * Converts API promo fare data to promo prices object keyed by date.
 * Only includes dates where the selected fare type has a promotional value.
 */
export function convertPromoFaresToPrices(
	faresData: FareDataByDate,
	selectedFareType: "standard" | "zip"
): Record<string, string> {
	const prices: Record<string, string> = {};

	for (const [date, fares] of Object.entries(faresData)) {
		if (!fares) continue;

		const promoFareKey = selectedFareType === "standard" ? "standardPromo" : "zipFullFlatPromo";
		const fareAmount = fares[promoFareKey];

		if (fareAmount !== undefined) {
			prices[date] = formatFare(fareAmount);
		}
	}

	return prices;
}

/**
 * Checks if a new date extends beyond the currently loaded range.
 *
 * @param visibleStartDate - Start date of visible month (inclusive)
 * @param visibleEndDate - End date of visible month (inclusive)
 * @param loadedRanges - Array of previously loaded date ranges
 * @returns true if visible dates extend beyond loaded data
 */
export function isLoadMoreNeeded(
	visibleStartDate: Date,
	visibleEndDate: Date,
	loadedRanges: Array<{ from: string; to: string }>
): boolean {
	// No data has been loaded yet, so the first visible range must be fetched.
	if (loadedRanges.length === 0) return true;

	const visibleStart = dateToString(visibleStartDate);
	const visibleEnd = dateToString(visibleEndDate);

	// Check if all visible dates fall within at least one loaded range
	for (const range of loadedRanges) {
		if (visibleStart >= range.from && visibleEnd <= range.to) {
			return false; // All visible dates are loaded
		}
	}

	return true; // Need to load more
}

/**
 * Calculate the next calendar window to fetch starting from the given date.
 *
 * Window rule:
 * - Start from `fromDate`.
 * - End at the last day of the month that is two months after `fromDate`'s month.
 *
 * Examples:
 * - 2026-06-15 -> 2026-08-31
 * - 2026-09-01 -> 2026-11-30
 *
 * @param fromDate - Start date (inclusive)
 * @returns Object with from and to dates in YYYY-MM-DD format
 */
export function getNextCalendarWindowRange(fromDate: Date): { from: string; to: string } {
	const from = dateToString(fromDate);
	const toDate = new Date(fromDate.getFullYear(), fromDate.getMonth() + 3, 0);
	const to = dateToString(toDate);

	return { from, to };
}

/**
 * Convert Date to YYYY-MM-DD string format.
 */
export function dateToString(date: Date): string {
	return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

/**
 * Parse YYYY-MM-DD string to Date object.
 */
export function stringToDate(dateStr: string): Date {
	const parts = dateStr.split("-").map(Number);
	const year = parts[0] || 2024;
	const month = parts[1] || 1;
	const day = parts[2] || 1;
	return new Date(year, month - 1, day);
}

/**
 * Get the visible month range (first and last dates of the month).
 */
export function getMonthDateRange(year: number, month: number): { start: Date; end: Date } {
	const start = new Date(year, month, 1);
	const end = new Date(year, month + 1, 0);
	return { start, end };
}

interface SeatTypeSelectionResetParams {
	oneWay: boolean;
	outboundDate: Date | null;
	inboundDate: Date | null;
	outboundPrices?: Record<string, string>;
	inboundPrices?: Record<string, string>;
}

/**
 * Determines whether selected dates should be cleared after changing seat type.
 *
 * Rules:
 * - One-way: keep outbound only when that date has a fare in the new seat type.
 * - Round-trip: keep both dates only when both outbound and inbound have fares.
 */
export function shouldResetSelectionOnSeatTypeChange({
	oneWay,
	outboundDate,
	inboundDate,
	outboundPrices,
	inboundPrices,
}: SeatTypeSelectionResetParams): boolean {
	if (!outboundDate) {
		return false;
	}

	const outboundDateKey = dateToString(outboundDate);
	const outboundAvailable = Boolean(outboundPrices?.[outboundDateKey]);

	if (oneWay || !inboundDate) {
		return !outboundAvailable;
	}

	const inboundDateKey = dateToString(inboundDate);
	const inboundAvailable = Boolean(inboundPrices?.[inboundDateKey]);

	return !(outboundAvailable && inboundAvailable);
}
