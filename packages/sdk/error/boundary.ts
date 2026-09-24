import type { ApiErrorConfigEntry } from "./types";

/**
 * Returns true when the status code represents an HTTP 5xx server error.
 */
function isServerError(status: number): boolean {
	return status >= 500 && status < 600;
}

/**
 * Maps an API status/code pair to a boundary error using the provided catalog.
 * Falls back to a generic boundary error for 5xx responses.
 */
export function getBoundaryErrorFromStatusCode<TCode extends string>(
	error: Pick<{ status: number; code?: string }, "status" | "code"> | null | undefined,
	config: readonly ApiErrorConfigEntry<TCode>[],
	prefix: string,
): Error | null {
	if (!error?.code) {
		return error && isServerError(error.status) ? new Error(`${prefix}GENERIC`) : null;
	}

	// Matched status/code entries are converted into a prefixed boundary error.
	const match = config.find((item) => item.status === error.status && item.code === error.code);
	if (match) {
		return new Error(`${prefix}${match.code}`);
	}

	return isServerError(error.status) ? new Error(`${prefix}GENERIC`) : null;
}

/**
 * Maps a raw API code to a boundary error using the provided catalog.
 * Returns a generic boundary error when the code is unknown.
 */
export function getBoundaryErrorFromCode<TCode extends string>(
	code: string | null | undefined,
	config: readonly ApiErrorConfigEntry<TCode>[],
	prefix: string,
): Error | null {
	if (!code) {
		return null;
	}

	// Finds a catalog entry by code regardless of HTTP status.
	const match = config.find((item) => item.code === code);
	if (match) {
		return new Error(`${prefix}${match.code}`);
	}

	return new Error(`${prefix}GENERIC`);
}

/**
 * Extracts a known API error code from a boundary error message prefix.
 */
export function getErrorCodeFromBoundaryError<TCode extends string>(
	error: Pick<Error, "message"> | null | undefined,
	prefix: string,
	config: readonly ApiErrorConfigEntry<TCode>[],
): TCode | null {
	if (!error?.message.startsWith(prefix)) {
		return null;
	}

	// Suffix is the code portion after the known boundary prefix.
	const suffix = error.message.slice(prefix.length);
	return config.some((item) => item.code === suffix) ? (suffix as TCode) : null;
}
