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

export function getFareDisplay(
	faresForDate: { standard?: number; zipFullFlat?: number } | undefined,
	selectedFareType: "standard" | "zip"
): string {
	// No fare data for this date at all
	if (!faresForDate) return "X";

	const standardAvailable = faresForDate.standard !== undefined;
	const zipAvailable = faresForDate.zipFullFlat !== undefined;

	// Both available: display the selected fare type
	if (standardAvailable && zipAvailable) {
		const fare = selectedFareType === "standard" ? faresForDate.standard : faresForDate.zipFullFlat;
		return fare !== undefined ? formatFare(fare) : "X";
	}

	// Only standard available
	if (standardAvailable && !zipAvailable) {
		return selectedFareType === "standard" && faresForDate.standard !== undefined
			? formatFare(faresForDate.standard)
			: "-"; // Selected ZIP but only standard available
	}

	// Only ZIP available
	if (zipAvailable && !standardAvailable) {
		return selectedFareType === "zip" && faresForDate.zipFullFlat !== undefined
			? formatFare(faresForDate.zipFullFlat)
			: "-"; // Selected standard but only ZIP available
	}

	// Neither available
	return "X";
}

/**
 * Formats a fare amount as a JPY string.
 */
export function formatFare(amount: number | undefined): string {
	if (amount === undefined || amount === null) return "X";
	return `¥${amount.toLocaleString("en-US")}`;
}

/**
 * Converts fare data to calendar price labels for the selected seat type.
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
		if (fareAmount !== undefined) {
			prices[date] = formatFare(fareAmount);
		}
	}

	return prices;
}

/**
 * Converts promo fare data to calendar promo labels for the selected seat type.
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
 * Converts Date to YYYY-MM-DD.
 */
export function dateToString(date: Date): string {
	return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

/**
 * Parses YYYY-MM-DD into Date.
 */
export function stringToDate(dateStr: string): Date {
	const parts = dateStr.split("-").map(Number);
	const year = parts[0] || 2024;
	const month = parts[1] || 1;
	const day = parts[2] || 1;
	return new Date(year, month - 1, day);
}

/**
 * Returns month start and end dates.
 */
export function getMonthDateRange(year: number, month: number): { start: Date; end: Date } {
	const start = new Date(year, month, 1);
	const end = new Date(year, month + 1, 0);
	return { start, end };
}

/**
 * Returns the next fetch window (from date to end of month +2).
 */
export function getNextCalendarWindowRange(fromDate: Date): { from: string; to: string } {
	const from = dateToString(fromDate);
	const toDate = new Date(fromDate.getFullYear(), fromDate.getMonth() + 3, 0);
	const to = dateToString(toDate);
	return { from, to };
}

/**
 * Checks if the visible date range falls outside loaded ranges.
 */
export function isLoadMoreNeeded(
	visibleStartDate: Date,
	visibleEndDate: Date,
	loadedRanges: Array<{ from: string; to: string }>
): boolean {
	if (loadedRanges.length === 0) return true;

	const visibleStart = dateToString(visibleStartDate);
	const visibleEnd = dateToString(visibleEndDate);

	for (const range of loadedRanges) {
		if (visibleStart >= range.from && visibleEnd <= range.to) {
			return false;
		}
	}

	return true;
}

interface SeatTypeSelectionResetParams {
	oneWay: boolean;
	outboundDate: Date | null;
	inboundDate: Date | null;
	outboundPrices?: Record<string, string>;
	inboundPrices?: Record<string, string>;
}

/**
 * Returns true when selected dates are no longer valid after seat type change.
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
