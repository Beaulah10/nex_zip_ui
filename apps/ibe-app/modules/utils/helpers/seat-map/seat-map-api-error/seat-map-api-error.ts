/**
 * File: seat-map-error.ts
 * Description: Provides seat map API error handling utilities,
 * including error normalization, boundary error mapping, error code extraction, and
 * localized error title resolution.
 */

import {
	getBoundaryErrorFromStatusCode,
	getErrorCodeFromBoundaryError,
	getSdkApiError,
	type NormalizedApiError,
	resolveErrorTitleKey,
} from "@repo/sdk";
import {
	SEAT_MAP_BOUNDARY_ERROR_PREFIX,
	SEAT_MAP_ERROR_CONFIG,
} from "@/modules/utils/constants/seat-map/seat-map.constants";

export type SeatMapErrorCode = (typeof SEAT_MAP_ERROR_CONFIG)[number]["code"];

export type SeatMapApiError = NormalizedApiError;

const NO_AVAILABLE_SEATS_ERROR_CODES = new Set(["NEXUZR004E052"]);

export function getSeatMapApiError(error: unknown): SeatMapApiError {
	return getSdkApiError(error, "Unable to fetch seat map");
}

export function isNoAvailableSeatsSeatMapError(
	error: Pick<SeatMapApiError, "code"> | null | undefined
) {
	return Boolean(error?.code && NO_AVAILABLE_SEATS_ERROR_CODES.has(error.code));
}

export function getSeatMapErrorTitleKey(code: SeatMapErrorCode | string) {
	return resolveErrorTitleKey(code, SEAT_MAP_ERROR_CONFIG, "system_error_title");
}

export function getSeatMapBoundaryError(
	error: Pick<SeatMapApiError, "status" | "code"> | null | undefined
) {
	return getBoundaryErrorFromStatusCode(
		error,
		SEAT_MAP_ERROR_CONFIG,
		SEAT_MAP_BOUNDARY_ERROR_PREFIX
	);
}

export function getSeatMapErrorCodeFromBoundaryError(
	error: Pick<Error, "message"> | null | undefined
): SeatMapErrorCode | null {
	return getErrorCodeFromBoundaryError(
		error,
		SEAT_MAP_BOUNDARY_ERROR_PREFIX,
		SEAT_MAP_ERROR_CONFIG
	);
}
