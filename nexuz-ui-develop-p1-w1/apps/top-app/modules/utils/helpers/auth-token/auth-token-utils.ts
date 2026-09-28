import {
	COMMON_ERROR_CONFIG,
	getBoundaryErrorFromCode,
	getErrorCodeFromBoundaryError,
	getSdkApiError,
	type NormalizedApiError,
	resolveErrorTitleKey,
} from "@repo/sdk";

const AUTH_TOKEN_BOUNDARY_ERROR_PREFIX = "AUTH_TOKEN_API_ERROR:";

const AUTH_TOKEN_ENDPOINT_ERROR_CONFIG = [
	{ status: 422, code: "NEXUZR001E001", titleKey: "error_titles.NEXUZR001E001" },
] as const;

const AUTH_TOKEN_ERROR_CONFIG = [
	...AUTH_TOKEN_ENDPOINT_ERROR_CONFIG,
	...COMMON_ERROR_CONFIG,
] as const;

export type AuthTokenErrorCode = (typeof AUTH_TOKEN_ERROR_CONFIG)[number]["code"];

/**
 * Normalized shape used by the app for auth token API failures.
 */
export type AuthTokenApiError = NormalizedApiError;

/**
 * Converts unknown thrown values into a stable auth token error shape.
 *
 * For SDK request errors, it attempts to parse `responseBody` and extract
 * `code`, `description`, and `message`/`error` fields when present.
 */
export function getAuthTokenApiError(error: unknown): AuthTokenApiError {
	return getSdkApiError(error, "Unable to retrieve security token");
}

/**
 * Resolves the i18n title key for a supported auth token error code.
 */
export function getAuthTokenErrorTitleKey(code: AuthTokenErrorCode) {
	return resolveErrorTitleKey(code, AUTH_TOKEN_ERROR_CONFIG, "system_error_title");
}

/**
 * Builds an error-boundary error from an auth token API code.
 *
 * Returns `null` when no code is provided. Unsupported codes map to
 * a generic boundary error suffix.
 */
export function getAuthTokenBoundaryErrorFromCode(code: string | null | undefined) {
	return getBoundaryErrorFromCode(code, AUTH_TOKEN_ERROR_CONFIG, AUTH_TOKEN_BOUNDARY_ERROR_PREFIX);
}

/**
 * Extracts a supported auth token error code from a boundary error message.
 *
 * Returns `null` if the message does not have the auth token prefix or if the
 * extracted suffix is not one of the configured auth token error codes.
 */
export function getAuthTokenErrorCodeFromBoundaryError(
	error: Pick<Error, "message"> | null | undefined
): AuthTokenErrorCode | null {
	return getErrorCodeFromBoundaryError(
		error,
		AUTH_TOKEN_BOUNDARY_ERROR_PREFIX,
		AUTH_TOKEN_ERROR_CONFIG
	);
}
