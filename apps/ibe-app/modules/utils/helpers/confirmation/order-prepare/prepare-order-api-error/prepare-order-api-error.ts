/**
 * File:  prepare-order-api-error.ts
 * Description: Extracts Prepare Order API error codes from boundary errors.
 */

/**
 * Extracts a Prepare Order API error code from an error boundary error.
 */
export const getPrepareOrderErrorCodeFromBoundaryError = (error: Error): string | null => {
	const match = error.message.match(/NEXUZ(?:R005E\d{3}|CMNE001)/);

	return match?.[0] ?? null;
};
