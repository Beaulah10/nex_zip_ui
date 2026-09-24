import { SdkRequestError } from "../sdk-client";
import type { ApiErrorItem, NormalizedApiError, ParsedApiErrorResponse } from "./types";

/**
 * Returns a trimmed non-empty string value, otherwise undefined.
 */
function pickString(value: unknown): string | undefined {
	return typeof value === "string" && value.trim() ? value : undefined;
}

/**
 * Safely parses a JSON error response body into known error fields.
 */
export function parseSdkErrorResponseBody(
	responseBody: string | null | undefined,
): ParsedApiErrorResponse {
	if (!responseBody) {
		return {};
	}

	try {
		// Parse unknown response payload and safely narrow it to an object shape.
		const parsed = JSON.parse(responseBody);
		if (!parsed || typeof parsed !== "object") {
			return {};
		}

		// Access response properties through a generic record for runtime safety.
		const parsedRecord = parsed as Record<string, unknown>;
		return {
			code: pickString(parsedRecord.code),
			description: pickString(parsedRecord.description),
			message: pickString(parsedRecord.message) ?? pickString(parsedRecord.error),
		};
	} catch {
		return {};
	}
}

/**
 * Normalizes partial API error fields into the SDK error shape.
 */
export function normalizeApiError(item: ApiErrorItem, fallbackMessage: string): NormalizedApiError {
	return {
		status: item.status,
		code: item.code,
		description: item.description,
		message: item.description ?? item.message ?? fallbackMessage,
	};
}

/**
 * Converts unknown thrown values into a normalized API error object.
 */
export function getSdkApiError(error: unknown, fallbackMessage: string): NormalizedApiError {
	if (error instanceof SdkRequestError) {
		// Parsed response data enriches SDK request errors with API-specific fields.
		const parsedResponse = parseSdkErrorResponseBody(error.responseBody);

		return normalizeApiError(
			{
				status: error.status ?? 500,
				code: parsedResponse.code,
				description: parsedResponse.description,
				message: parsedResponse.message ?? error.message,
			},
			fallbackMessage,
		);
	}

	if (error instanceof Error) {
		return normalizeApiError(
			{
				status: 500,
				message: error.message,
			},
			fallbackMessage,
		);
	}

	return normalizeApiError(
		{
			status: 500,
			message: fallbackMessage,
		},
		fallbackMessage,
	);
}
