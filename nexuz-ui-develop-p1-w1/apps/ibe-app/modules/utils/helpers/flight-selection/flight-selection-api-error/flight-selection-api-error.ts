import {
	COMMON_ERROR_CONFIG,
	getBoundaryErrorFromStatusCode,
	getErrorCodeFromBoundaryError,
	getSdkApiError,
	type NormalizedApiError,
	resolveErrorTitleKey,
} from "@repo/sdk";

const FLIGHT_SELECTION_BOUNDARY_ERROR_PREFIX = "FLIGHT_SELECTION_API_ERROR:";

const FLIGHT_SELECTION_ENDPOINT_ERROR_CONFIG = [
	{ status: 422, code: "NEXUZR003E001", titleKey: "error_titles.NEXUZR003E001" },
	{ status: 404, code: "NEXUZR003E002", titleKey: "error_titles.NEXUZR003E002" },
	{ status: 404, code: "NEXUZR003E003", titleKey: "error_titles.NEXUZR003E003" },
] as const;

const FLIGHT_SELECTION_ERROR_CONFIG = [
	...FLIGHT_SELECTION_ENDPOINT_ERROR_CONFIG,
	...COMMON_ERROR_CONFIG,
] as const;

export type FlightSelectionErrorCode = (typeof FLIGHT_SELECTION_ERROR_CONFIG)[number]["code"];

export type FlightSelectionApiError = NormalizedApiError;

export function getFlightSelectionApiError(error: unknown): FlightSelectionApiError {
	return getSdkApiError(error, "Unable to fetch flight selection");
}

export function getFlightSelectionErrorTitleKey(code: FlightSelectionErrorCode) {
	return resolveErrorTitleKey(code, FLIGHT_SELECTION_ERROR_CONFIG, "system_error_title");
}

export function getFlightSelectionBoundaryError(
	error: Pick<FlightSelectionApiError, "status" | "code"> | null | undefined
) {
	return getBoundaryErrorFromStatusCode(
		error,
		FLIGHT_SELECTION_ERROR_CONFIG,
		FLIGHT_SELECTION_BOUNDARY_ERROR_PREFIX
	);
}

export function getFlightSelectionErrorCodeFromBoundaryError(
	error: Pick<Error, "message"> | null | undefined
): FlightSelectionErrorCode | null {
	return getErrorCodeFromBoundaryError(
		error,
		FLIGHT_SELECTION_BOUNDARY_ERROR_PREFIX,
		FLIGHT_SELECTION_ERROR_CONFIG
	);
}
