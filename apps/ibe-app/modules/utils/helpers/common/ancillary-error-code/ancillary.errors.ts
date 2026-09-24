import {
	COMMON_ERROR_CONFIG,
	getBoundaryErrorFromStatusCode,
	getErrorCodeFromBoundaryError,
	getSdkApiError,
	type NormalizedApiError,
	resolveErrorTitleKey,
} from "@repo/sdk";

/**
 * Normalized shape used by the app for ancillary offers API failures.
 */
export type AncillaryOffersApiError = NormalizedApiError;

const ANCILLARY_OFFERS_BOUNDARY_ERROR_PREFIX = "ANCILLARY_OFFERS_API_ERROR:";

const ANCILLARY_OFFERS_ENDPOINT_ERROR_CONFIG = [
	{ status: 404, code: "NEXUZR004E102", titleKey: "error_titles.NEXUZR004E102" },
	{ status: 404, code: "NEXUZCMNE004", titleKey: "error_titles.NEXUZCMNE004" },
	{ status: 422, code: "NEXUZR004E101", titleKey: "error_titles.NEXUZCMNE004" },
] as const;

const ANCILLARY_OFFERS_ERROR_CONFIG = [
	...ANCILLARY_OFFERS_ENDPOINT_ERROR_CONFIG,
	...COMMON_ERROR_CONFIG,
] as const;

export type AncillaryOffersErrorCode = (typeof ANCILLARY_OFFERS_ERROR_CONFIG)[number]["code"];

/**
 * Converts unknown thrown values into a stable ancillary offers error shape.
 *
 * For SDK request errors, it attempts to parse `responseBody` and extract
 * `code`, `description`, and `message`/`error` fields when present.
 */
export function getAncillaryOffersApiError(error: unknown): AncillaryOffersApiError {
	return getSdkApiError(error, "Unable to fetch ancillary offers");
}

/**
 * Resolves the i18n title key for a supported ancillary offers error code.
 */
export function getAncillaryOffersErrorTitleKey(code: AncillaryOffersErrorCode) {
	return resolveErrorTitleKey(code, ANCILLARY_OFFERS_ERROR_CONFIG, "system_error_title");
}

/**
 * Builds an error-boundary error from a normalized ancillary offers API error.
 *
 * Supported status/code pairs map to code-specific boundary errors.
 * Any 5xx status maps to a generic boundary error.
 */
export function getAncillaryOffersBoundaryError(
	error: Pick<AncillaryOffersApiError, "status" | "code"> | null | undefined
) {
	return getBoundaryErrorFromStatusCode(
		error,
		ANCILLARY_OFFERS_ERROR_CONFIG,
		ANCILLARY_OFFERS_BOUNDARY_ERROR_PREFIX
	);
}

/**
 * Extracts a supported ancillary offers error code from a boundary error message.
 *
 * Returns `null` if the message does not have the ancillary offers prefix or if
 * the extracted suffix is not one of the configured ancillary offers error codes.
 */
export function getAncillaryOffersErrorCodeFromBoundaryError(
	error: Pick<Error, "message"> | null | undefined
): AncillaryOffersErrorCode | null {
	return getErrorCodeFromBoundaryError(
		error,
		ANCILLARY_OFFERS_BOUNDARY_ERROR_PREFIX,
		ANCILLARY_OFFERS_ERROR_CONFIG
	);
}
