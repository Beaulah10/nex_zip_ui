import type { ApiErrorConfigEntry } from "./types";

// Shared error catalog used across applications for common error handling.
export const COMMON_ERROR_CONFIG = [
	{ status: 400, code: "NEXUZCMNE001", titleKey: "error_titles.NEXUZCMNE001" },
	{ status: 500, code: "NEXUZCMNE002", titleKey: "error_titles.NEXUZCMNE002" },
	{ status: 500, code: "NEXUZCMNE003", titleKey: "error_titles.NEXUZCMNE003" },
] as const satisfies readonly ApiErrorConfigEntry<string>[];

/**
 * Union of all common error codes from the shared catalog.
 */
export type CommonErrorCode = (typeof COMMON_ERROR_CONFIG)[number]["code"];
