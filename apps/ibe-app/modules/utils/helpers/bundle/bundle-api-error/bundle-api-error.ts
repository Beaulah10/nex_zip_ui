import {
	getBoundaryErrorFromStatusCode,
	getErrorCodeFromBoundaryError,
	getSdkApiError,
	resolveErrorTitleKey,
} from "@repo/sdk";
import {
	BUNDLE_BOUNDARY_ERROR_PREFIX,
	BUNDLE_DEFAULT_ERROR_TITLE_KEY,
	BUNDLE_ERROR_CONFIG,
	BUNDLE_FETCH_ERROR_MESSAGE,
} from "@/modules/utils/constants/bundle/bundle.constants";
import type { BundleApiError, BundleErrorCode } from "@/types/bundle/bundle.types";

/**
 * Normalizes unknown SDK/network error into bundle API error shape.
 */
export function getBundleApiError(error: unknown): BundleApiError {
	return getSdkApiError(error, BUNDLE_FETCH_ERROR_MESSAGE);
}

/**
 * Resolves translation key for bundle error code, with system fallback key.
 */
export function getBundleErrorTitleKey(code: BundleErrorCode) {
	return resolveErrorTitleKey(code, BUNDLE_ERROR_CONFIG, BUNDLE_DEFAULT_ERROR_TITLE_KEY);
}

/**
 * Converts bundle API error to boundary error instance for cross-route error handling.
 */
export function getBundleBoundaryError(
	error: Pick<BundleApiError, "status" | "code"> | null | undefined
): Error {
	return (
		getBoundaryErrorFromStatusCode(error, BUNDLE_ERROR_CONFIG, BUNDLE_BOUNDARY_ERROR_PREFIX) ??
		new Error(`${BUNDLE_BOUNDARY_ERROR_PREFIX}GENERIC`)
	);
}

/**
 * Extracts typed bundle error code from boundary error message prefix payload.
 */
export function getBundleErrorCodeFromBoundaryError(
	error: Pick<Error, "message"> | null | undefined
): BundleErrorCode | null {
	return getErrorCodeFromBoundaryError(error, BUNDLE_BOUNDARY_ERROR_PREFIX, BUNDLE_ERROR_CONFIG);
}
