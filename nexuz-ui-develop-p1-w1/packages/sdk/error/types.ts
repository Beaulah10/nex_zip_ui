/**
 * Catalog entry describing a known API error code and its UI title key.
 */
export type ApiErrorConfigEntry<TCode extends string = string> = {
	status: number;
	code: TCode;
	titleKey: string;
};

/**
 * Parsed API error response payload fields.
 */
export type ParsedApiErrorResponse = {
	code?: string;
	description?: string;
	message?: string;
};

/**
 * Normalized API error shape used by SDK consumers.
 */
export type NormalizedApiError = {
	status: number;
	code?: string;
	description?: string;
	message: string;
};

/**
 * Item error fields accepted before normalization.
 */
export type ApiErrorItem = {
	status: number;
	code?: string;
	description?: string;
	message?: string;
};
