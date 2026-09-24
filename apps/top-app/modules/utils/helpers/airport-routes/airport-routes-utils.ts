import {
	COMMON_ERROR_CONFIG,
	getBoundaryErrorFromCode,
	getBoundaryErrorFromStatusCode,
	getErrorCodeFromBoundaryError,
	getSdkApiError,
	type NormalizedApiError,
	resolveErrorTitleKey,
} from "@repo/sdk";

const AIRPORT_ROUTES_BOUNDARY_ERROR_PREFIX = "AIRPORT_ROUTES_API_ERROR:";

const AIRPORT_ROUTES_ENDPOINT_ERROR_CONFIG = [
	{ status: 422, code: "NEXUZR002E001", titleKey: "error_titles.NEXUZR002E001" },
] as const;

const AIRPORT_ROUTES_ERROR_CONFIG = [
	...AIRPORT_ROUTES_ENDPOINT_ERROR_CONFIG,
	...COMMON_ERROR_CONFIG,
] as const;

export type AirportRoutesErrorCode = (typeof AIRPORT_ROUTES_ERROR_CONFIG)[number]["code"];

/**
 * Normalized shape used by the app for airport routes API failures.
 */
export type AirportRoutesApiError = NormalizedApiError;

/**
 * Converts unknown thrown values into a stable airport routes error shape.
 *
 * For SDK request errors, it attempts to parse `responseBody` and extract
 * `code`, `description`, and `message`/`error` fields when present.
 */
export function getAirportRoutesApiError(error: unknown): AirportRoutesApiError {
	return getSdkApiError(error, "Unable to retrieve airport routes");
}

/**
 * Resolves the i18n title key for a supported airport routes error code.
 */
export function getAirportRoutesErrorTitleKey(code: AirportRoutesErrorCode) {
	return resolveErrorTitleKey(code, AIRPORT_ROUTES_ERROR_CONFIG, "system_error_title");
}

/**
 * Builds an error-boundary error from a normalized airport routes API error.
 *
 * Supported status/code pairs map to code-specific boundary errors.
 * Any 5xx status maps to a generic boundary error.
 */
export function getAirportRoutesBoundaryError(
	error: Pick<AirportRoutesApiError, "status" | "code"> | null | undefined
) {
	return getBoundaryErrorFromStatusCode(
		error,
		AIRPORT_ROUTES_ERROR_CONFIG,
		AIRPORT_ROUTES_BOUNDARY_ERROR_PREFIX
	);
}

/**
 * Builds an error-boundary error from an airport routes API code.
 *
 * Returns `null` when no code is provided. Unsupported codes map to
 * a generic boundary error suffix.
 */
export function getAirportRoutesBoundaryErrorFromCode(code: string | null | undefined) {
	return getBoundaryErrorFromCode(
		code,
		AIRPORT_ROUTES_ERROR_CONFIG,
		AIRPORT_ROUTES_BOUNDARY_ERROR_PREFIX
	);
}

/**
 * Extracts a supported airport routes error code from a boundary error message.
 *
 * Returns `null` if the message does not have the airport routes prefix or if
 * the extracted suffix is not one of the configured airport routes error codes.
 */
export function getAirportRoutesErrorCodeFromBoundaryError(
	error: Pick<Error, "message"> | null | undefined
): AirportRoutesErrorCode | null {
	return getErrorCodeFromBoundaryError(
		error,
		AIRPORT_ROUTES_BOUNDARY_ERROR_PREFIX,
		AIRPORT_ROUTES_ERROR_CONFIG
	);
}
