import { COMMON_ERROR_CONFIG } from "@repo/sdk";
import type { BundleId } from "@/types/bundle/bundle.types";

/**
 * Canonical no-bundle option identifier.
 */
export const NO_BUNDLE_ID: BundleId = "NOBN";

/**
 * Backend error code indicating no bundle inventory/availability for current context.
 */
export const BUNDLE_UNAVAILABLE_ERROR_CODE = "NEXUZR004E003";

/**
 * Backend error codes indicating bundles are unavailable for the current context.
 */
export const NO_BUNDLES_AVAILABLE_CODES = new Set(["NEXUZR004003", "NEXUZR004E003"]);

/**
 * Prefix used when wrapping bundle API errors for Next.js error boundary propagation.
 */
export const BUNDLE_BOUNDARY_ERROR_PREFIX = "BUNDLE_API_ERROR:";

/**
 * Fallback message used when SDK error payload has no actionable details.
 */
export const BUNDLE_FETCH_ERROR_MESSAGE = "Unable to fetch bundle offers";

/**
 * Default translation key when error code has no mapped title.
 */
export const BUNDLE_DEFAULT_ERROR_TITLE_KEY = "system_error_title";

/**
 * Endpoint-specific error mappings for bundle offers API.
 */
export const BUNDLE_ENDPOINT_ERROR_CONFIG = [
	{ status: 422, code: "NEXUZR004E001", titleKey: "error_titles.NEXUZR004E001" },
	{ status: 422, code: "NEXUZR004E002", titleKey: "error_titles.NEXUZR004E002" },
	{ status: 404, code: "NEXUZCMNE004", titleKey: "error_titles.NEXUZCMNE004" },
	{ status: 422, code: BUNDLE_UNAVAILABLE_ERROR_CODE, titleKey: "error_titles.NEXUZR004E003" },
] as const;

/**
 * Full bundle error mapping (common + endpoint-specific) used by title and boundary helpers.
 */
export const BUNDLE_ERROR_CONFIG = [
	...COMMON_ERROR_CONFIG,
	...BUNDLE_ENDPOINT_ERROR_CONFIG,
] as const;

/**
 * Passenger type codes treated as adult fare records in offers payload.
 */
export const ADULT_PASSENGER_TYPE_CODE_SET = new Set(["adult", "adt"]);

/**
 * Cabin value preserved from selected flight when building offers request.
 */
export const ZIP_FULL_FLAT_CABIN_CODE = "ZIPFULLFLAT";

/**
 * Passenger type codes used by bundle offers request payloads.
 */
export const BUNDLE_OFFER_PASSENGER_TYPE_CODES = {
	ADULT: "adult",
	CHILD_A: "childa",
	CHILD_B: "childb",
	CHILD_C: "childc",
	INFANT: "infant",
} as const;

/**
 * Bundle code groups by offer family.
 */
export const BUNDLE_CODES: {
	NO_BUNDLE: BundleId[];
	FLEX_BIZ: BundleId[];
	VALUE: BundleId[];
	PREMIUM: BundleId[];
} = {
	NO_BUNDLE: [NO_BUNDLE_ID],
	FLEX_BIZ: ["FLBF", "FLBS"],
	VALUE: ["VALB", "VALI", "VALK", "VALN", "VALT", "VALU"],
	PREMIUM: ["PREM", "PREN", "PRMB", "PRMI", "PRMK", "PRMT"],
};

/**
 * Default offers cabin when selected cabin is missing or not zip full flat.
 */
export const STANDARD_CABIN_CODE = "STANDARD";

/**
 * Display labels for bundle codes used in bundle selection UI.
 */
export const BUNDLE_NAMES: Record<BundleId, string> = {
	NOBN: "No Bundle",
	FLBF: "Flex Biz",
	FLBS: "Flex Biz",
	PREM: "Premium",
	PREN: "Premium",
	PRMB: "Premium",
	PRMI: "Premium",
	PRMK: "Premium",
	PRMT: "Premium",
	VALB: "Value",
	VALI: "Value",
	VALK: "Value",
	VALN: "Value",
	VALT: "Value",
	VALU: "Value",
};
