import { COMMON_ERROR_CONFIG } from "@repo/sdk";
import type {
	Cabin,
	ExpandedSeat,
	LegendItemId,
	SeatPositionType,
	SeatStatus,
} from "@/types/seat-map/seat-map.types";
import type {
	SeatColumn,
	SeatValidationErrorDescriptor,
	SeatWarningBannerDescriptor,
} from "@/types/seat-map/seat-validation.types";

export const SEAT_SIZE_CLASSES = "w-7 h-7";
export const SEAT_SIZE_CLASSES_DEFAULT = "w-11 h-7";
export const SEAT_SIZE_CLASSES_LARGE = "w-11 h-11";
export const ROW_NUMBER_CLASSES = "w-7 md:w-8 h-8 md:w-11 md:h-11 shrink-0";

export const CABIN_COLUMN_GROUPS: Record<Cabin["class"], string[][]> = {
	ZipFullFlat: [["A"], ["D"], ["G"], ["K"]],
	Standard: [
		["A", "B", "C"],
		["D", "E", "G"],
		["H", "J", "K"],
	],
};

export const NON_ADJACENT_ERROR: SeatValidationErrorDescriptor = {
	type: "NON_ADJACENT_OR_WRONG_ADULT",
};

export const EMERGENCY_EXIT_ERROR: SeatValidationErrorDescriptor = {
	type: "EMERGENCY_EXIT_INELIGIBLE",
};

export const ADJACENT_FREE_SEAT_MANDATORY_ERROR: SeatValidationErrorDescriptor = {
	type: "ADJACENT_FREE_SEAT_MANDATORY",
};

export const SEAT_SELECTION_48_HOUR_ERROR: SeatValidationErrorDescriptor = {
	type: "SEAT_SELECTION_48_HOUR_UNAVAILABLE",
};

export const BUNDLE_MANDATORY_ERROR: SeatValidationErrorDescriptor = {
	type: "BUNDLE_SEAT_MANDATORY",
};

export const EMERGENCY_EXIT_SEAT_CODES = new Set(["46A", "46B", "46C", "46H", "46J", "46K"]);
export const EMERGENCY_EXIT_SERVICE_CODE = "STEX";
export const NON_RECLINING_SEATS = new Set(["36A", "36B", "36C", "36H", "36J", "36K"]);
export const LIMITED_RECLINING_SEATS = new Set(["57A", "57C", "57H", "57K"]);

export const ZIP_FULL_FLAT_ADJACENT_PAIRS: [SeatColumn, SeatColumn][] = [
	["A", "D"],
	["D", "G"],
	["G", "K"],
];

export const STANDARD_INVALID_ACROSS_AISLE_PAIRS: [SeatColumn, SeatColumn][] = [
	["C", "D"],
	["G", "H"],
];

export const ROW_56_57_SPECIAL_ADJACENT_PAIRS: [SeatColumn, SeatColumn][] = [
	["A", "C"],
	["H", "K"],
];

export const STANDARD_ADJACENT_PAIRS: [SeatColumn, SeatColumn][] = [
	["A", "B"],
	["B", "C"],
	["D", "E"],
	["E", "G"],
	["H", "J"],
	["J", "K"],
];

export const NON_RECLINING_WARNING: SeatWarningBannerDescriptor = {
	type: "NON_RECLINING",
};

export const LIMITED_RECLINING_WARNING: SeatWarningBannerDescriptor = {
	type: "LIMITED_RECLINING",
};

export const ZIP_FULL_FLAT_LEGEND_ITEM_IDS = new Set([
	"central-seat",
	"selected",
	"not-selectable",
]);

export const PRICE_BEARING_ITEM_IDS = new Set([
	"more-legroom",
	"front-aisle-window-side",
	"reclining-not-allowed",
	"rear-aisle-window-side",
	"central-seat",
	"selected",
]);

export const STATUS_CLASSES: Record<ExpandedSeat["status"], string> = {
	"front-tier": "bg-primary-400 text-primary-900 hover:bg-primary-500",
	"rear-tier": "bg-success-400 text-success-800 hover:opacity-90",
	central: "bg-primary-300 border border-primary-500 text-primary-900 hover:bg-opacity-90",
	"exit-row": "bg-warning-400 text-warning-950 hover:bg-warning-500",
	"no-recline": "bg-gray-300 text-base-500",
	"not-selectable": "bg-base-100 text-base-400 cursor-not-allowed",
};

export const SELECTED_CLASSES = "bg-primary-900 text-white border-none";
export const FRONT_TIER_LINE_ROW_START = 18;
export const FRONT_TIER_LINE_ROW_END = 35;

export const ROW_START_CLASSES = [
	"row-start-1",
	"row-start-2",
	"row-start-3",
	"row-start-4",
	"row-start-5",
];

export const COLUMN_SEAT_TYPE: Record<string, SeatPositionType> = {
	A: "Window",
	B: "Middle",
	C: "Aisle",
	D: "Aisle",
	E: "Middle",
	G: "Aisle",
	H: "Aisle",
	J: "Middle",
	K: "Window",
};

export const SEAT_ELIGIBLE_BUNDLE_CODES = new Set<string>([
	"VALB",
	"VALI",
	"VALK",
	"VALN",
	"VALT",
	"VALU",
	"PREM",
	"PRMB",
	"PRMI",
	"PRMK",
	"PREN",
	"PRMT",
	"FLBF",
	"FLBS",
]);

export const SERVICE_CODE_TO_STATUS: Record<string, SeatStatus> = {
	STOT: "central",
	STFW: "front-tier",
	STUN: "no-recline",
	STAF: "rear-tier",
	STEX: "exit-row",
};

export const SEAT_MAP_BOUNDARY_ERROR_PREFIX = "SEAT_MAP_API_ERROR:";

export const ADJACENT_SEATING_GUIDANCE_URL = "https://www.zipair.net/en/ticket/u6";

export const SEAT_MAP_ENDPOINT_ERROR_CONFIG = [
	{ status: 422, code: "NEXUZR004E051", titleKey: "error_labels.NEXUZR004E051" },
	{ status: 404, code: "NEXUZCMNE004", titleKey: "error_labels.NEXUZCMNE004" },
] as const;

export const SEAT_MAP_ERROR_CONFIG = [
	...SEAT_MAP_ENDPOINT_ERROR_CONFIG,
	...COMMON_ERROR_CONFIG,
] as const;

export const STANDARD_LEGEND_SERVICE_CODES: Partial<Record<LegendItemId, string>> = {
	"more-legroom": "STEX",
	"front-aisle-window-side": "STFW",
	"reclining-not-allowed": "STUN",
	"rear-aisle-window-side": "STAF",
	"central-seat": "STOT",
};
