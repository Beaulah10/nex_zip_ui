import type { FieldPath } from "react-hook-form";
import type { PassengerInformation } from "@/modules/utils/validations/customer-information/customer-information-schema";

// ── Date Constants ──────────────────────────────────────────────────────────────

export const CURRENT_YEAR = new Date().getFullYear();
export const PAST_YEARS = Array.from({ length: 100 }, (_, i) => String(CURRENT_YEAR - i));
export const FUTURE_YEARS = Array.from({ length: 11 }, (_, i) => String(CURRENT_YEAR + i));
export const MONTHS = ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12"];
export const DAYS = Array.from({ length: 31 }, (_, i) => String(i + 1).padStart(2, "0"));
export const MONTH_LABEL_MAP = new Map([
	["01", "Jan"],
	["02", "Feb"],
	["03", "Mar"],
	["04", "Apr"],
	["05", "May"],
	["06", "Jun"],
	["07", "Jul"],
	["08", "Aug"],
	["09", "Sep"],
	["10", "Oct"],
	["11", "Nov"],
	["12", "Dec"],
]);
export const MONTHS_VALUE = [...MONTH_LABEL_MAP.keys()];
export const getMonthLabel = (month: string) => MONTH_LABEL_MAP.get(month) ?? month;

//Base URL
export const ZIPAIR_BASE_URL = "https://uat-www.zipair.net";

// ── Assistance Constants ────────────────────────────────────────────────────────

export const ASSISTANCE_CATEGORIES = [
	"Illness or injury",
	"Carrying medical electronic devices",
	"Use of a wheelchair",
	"Visual or hearing impairments",
	"Intellectual or developmental disabilities",
];

// ── Mock Booking Context ──────────────────────────────────────────────────────
// These values represent the current booking session context used for validation.
// In production these would come from the booking store / API response.

export type RouteType = "US" | "TH" | "OTHER";
export type PassengerType = "adult" | "child_12_14" | "child_7_11" | "child_2_6" | "infant";

/**
 * Purpose-of-travel values that correspond to J, K, F visa categories.
 * Used to determine STOP SSR eligibility.
 */
export const STOP_SSR_VISA_PURPOSE_VALUES = [
	"exchange-visits", // Category "J" visa
	"family-us-citizen", // Category "K" visa
	"study-abroad", // Category "F" visa
] as const;

// Age Label from Passenger Type code(passengerTypeCode)
export const PASSENGER_TYPE_CODE_TO_AGE_LABEL: Record<string, string> = {
	adult: "passenger_type_code_adt",
	childA: "passenger_type_code_chda",
	childB: "passenger_type_code_chdb",
	childC: "passenger_type_code_chdc",
	infant: "passenger_type_code_inf",
};
// ── Travel Document Constants ────────────────────────────────────────────────

/** Value that triggers EVUS section — keep in sync with schema validation */
export const PURPOSE_OF_TRAVEL_B1B2_VALUE = "b1-b2-tourism" as const;

export const PURPOSE_OF_TRAVEL_OPTIONS = [
	{ value: "study-abroad", label: "purpose_travel_study_abroad" },
	{ value: "family-us-citizen", label: "purpose_travel_family_us_citizen" },
	{ value: "exchange-visits", label: "purpose_travel_exchange_visits" },
	{ value: PURPOSE_OF_TRAVEL_B1B2_VALUE, label: "purpose_travel_b1_b2" },
	{ value: "other", label: "purpose_travel_other" },
] as const;

export const DOCUMENT_TYPE_OPTIONS_US = [
	{ value: "visa", label: "document_type_visa" },
	{
		value: "permanent-residence",
		label: "document_type_permanent_residence",
	},
	{
		value: "resident-alien-card",
		label: "document_type_resident_alien_card",
	},
	{
		value: "military-id",
		label: "document_type_us_military_id",
	},
] as const;

export const DOCUMENT_TYPE_OPTIONS_DEFAULT = [
	{
		value: "visa",
		label: "document_type_visa",
	},
	{
		value: "permanent-residence",
		label: "document_type_permanent_residence",
	},
] as const;

export const TRAVEL_DOCUMENT_CLEAR_ERRORS_FIELDS = [
	"documentType",
	"documentNumber",
	"documentExpiryDate",
	"issuingCountry",
	"purposeOfTravel",
	"evusObtained",
] as const satisfies readonly FieldPath<PassengerInformation>[];

export const TRAVEL_DOCUMENT_PURPOSE_CLEAR_ERRORS_FIELDS = [
	"purposeOfTravel",
	"evusObtained",
] as const satisfies readonly FieldPath<PassengerInformation>[];

export const TRAVEL_DOCUMENT_EVUS_CLEAR_ERRORS_FIELDS = [
	"evusObtained",
] as const satisfies readonly FieldPath<PassengerInformation>[];

export const TRAVEL_DOCUMENT_REDRESS_NUMBER_FIELDS = [
	"redressNumber",
] as const satisfies readonly FieldPath<PassengerInformation>[];

export const TRAVEL_DOCUMENT_KNOWN_TRAVELER_NUMBER_FIELDS = [
	"knownTravelerNumber",
] as const satisfies readonly FieldPath<PassengerInformation>[];

// Body weight options with translation keys for localized display labels
export const BODY_WEIGHT_OPTIONS = [
	{
		value: "Less than 9kg",
		label: "body_weight_less_than_9kg_label",
	},
	{
		value: "9kg or more to less than 18kg",
		label: "body_weight_9kg_to_18kg_label",
	},
	{
		value: "18kg or more",
		label: "body_weight_18kg_or_more_label",
	},
] as const;

// Body height options with translation keys for localized display labels
export const BODY_HEIGHT_OPTIONS = [
	{
		value: "72-81 cm",
		label: "body_height_72_81_label",
	},
	{
		value: "82-91 cm",
		label: "body_height_82_91_label",
	},
	{
		value: "92-101 cm",
		label: "body_height_92_101_label",
	},
] as const;

// Gender options with translation keys for localized display labels
export const GENDER_OPTIONS = [
	{
		value: "male",
		label: "label_male",
	},
	{
		value: "female",
		label: "label_female",
	},
] as const;

export const pregnancyNotices = [
	"pregnancy_notice_1",
	"pregnancy_notice_2",
	"pregnancy_notice_3",
	"pregnancy_notice_4",
	"pregnancy_notice_5",
	"pregnancy_notice_6",
];

// Special-notes clearErrors field groups
export const WHEELCHAIR_DIMENSION_FIELDS = [
	"wheelchairHeight",
	"wheelchairWidth",
	"wheelchairDepth",
	"wheelchairWeight",
] as const satisfies readonly FieldPath<PassengerInformation>[];

export const WHEELCHAIR_BATTERY_FIELDS = [
	"wheelchairBatteryRemovable",
	"wheelchairBatteryType",
] as const satisfies readonly FieldPath<PassengerInformation>[];

export const WHEELCHAIR_TYPE_FIELDS = [
	"wheelchairType",
	...WHEELCHAIR_BATTERY_FIELDS,
	"isFoldable",
	...WHEELCHAIR_DIMENSION_FIELDS,
] as const satisfies readonly FieldPath<PassengerInformation>[];

export const WHEELCHAIR_BRING_OWN_FIELDS = [
	"bringingOwnWheelchair",
	...WHEELCHAIR_TYPE_FIELDS,
] as const satisfies readonly FieldPath<PassengerInformation>[];

export const WHEELCHAIR_REASON_FIELDS = [
	"reasonForWheelchair",
	...WHEELCHAIR_BRING_OWN_FIELDS,
] as const satisfies readonly FieldPath<PassengerInformation>[];

export const WHEELCHAIR_CLEAR_ERRORS_FIELDS = [
	"canWalk",
	"canGoUpDownStairs",
	"needsOnboardWheelchair",
	...WHEELCHAIR_REASON_FIELDS,
] as const satisfies readonly FieldPath<PassengerInformation>[];

export const REQUESTING_ASSISTANCE_CLEAR_ERRORS_FIELDS = [
	"canManagePersonalNeeds",
	"boardingWithAccompanion",
	"accompanyingPersonName",
	"assistanceReasons",
	...WHEELCHAIR_CLEAR_ERRORS_FIELDS,
] as const satisfies readonly FieldPath<PassengerInformation>[];

export const SERVICE_DOG_CAGE_DIMENSION_FIELDS = [
	"serviceDogCageHeight",
	"serviceDogCageWidth",
	"serviceDogCageDepth",
	"serviceDogCageWeight",
] as const satisfies readonly FieldPath<PassengerInformation>[];

export const SERVICE_DOG_CLEAR_ERRORS_FIELDS = [
	"serviceDogType",
	"serviceDogBreed",
	"serviceDogWeight",
	"serviceDogCagePresence",
	...SERVICE_DOG_CAGE_DIMENSION_FIELDS,
] as const satisfies readonly FieldPath<PassengerInformation>[];

// ------------ Assistance service - constants -----------------------------
// Assistance reasons for passengers requesting assistance
export const ASSISTANCE_REASONS = [
	{ value: "illness", label: "assistance_reason_illness" },
	{ value: "visual", label: "assistance_reason_visual" },
	{ value: "medical-devices", label: "assistance_reason_medical_devices" },
	{ value: "hearing", label: "assistance_reason_hearing" },
	{ value: "wheelchair", label: "assistance_reason_wheelchair" },
	{ value: "intellectual", label: "assistance_reason_intellectual" },
];

// Restricted assistance reasons

export const RESTRICTED_REASONS = ["illness", "medical-devices", "intellectual"];

// Wheelchair assistance reasons
export const WHEELCHAIR_REASONS = [
	{ value: "aftereffects", label: "wheelchair_reason_aftereffects" },
	{ value: "illness", label: "wheelchair_reason_illness" },
	{ value: "old-age", label: "wheelchair_reason_old_age" },
	{ value: "injury", label: "wheelchair_reason_injury" },
	{ value: "physical-disability", label: "wheelchair_reason_physical_disability" },
	{ value: "weak-legs", label: "wheelchair_reason_weak_legs" },
];

// Wheelchair battery types
export const BATTERY_TYPES = [
	{ value: "nickel-cadmium", label: "battery_type_nickel_cadmium" },
	{ value: "nickel-metal-hydride", label: "battery_type_nickel_metal_hydride" },
	{ value: "lithium-ion", label: "battery_type_lithium_ion" },
	{ value: "lead-acid", label: "battery_type_lead_acid" },
	{ value: "gel-battery", label: "battery_type_gel_battery" },
	{ value: "silicon-battery", label: "battery_type_silicon_battery" },
];

export const SPECIAL_ASSISTANCE_SSR_CODES = new Set([
	"PRGN",
	"BLND",
	"DEAF",
	"SVAN",
	"WCHR",
	"WCHS",
	"WCHC",
	"DBWC",
	"WBWC",
	"MPWC",
]);

export const AUTO_SCAN_DELAY_MS = 3000;
