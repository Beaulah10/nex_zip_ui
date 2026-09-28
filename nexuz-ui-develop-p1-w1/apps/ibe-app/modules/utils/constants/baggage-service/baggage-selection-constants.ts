import type {
	BaggageEquipmentItem,
	BundleId,
	DefaultBaggageService,
} from "@/types/baggage-selection/baggage-selection.types";
import type { BundleCode } from "@/types/passenger/passenger.type";

// Map BundleCode to BundleId for baggage selection
export const bundleCodeToBundleIdMap: Record<BundleCode, BundleId> = {
	NOBN: "NONE",
	VALK: "VALUE",
	PRMK: "PREMIUM",
	VALN: "VALUE",
	PREN: "PREMIUM",
	FLBS: "FLEXBIZ",
	FLBF: "FLEXBIZ",
	PREM: "PREMIUM",
	PRMB: "PREMIUM",
	PRMI: "PREMIUM",
	PRMT: "PREMIUM",
	VALB: "VALUE",
	VALI: "VALUE",
	VALT: "VALUE",
	VALU: "VALUE",
};
// Out of stock error code for baggage selection
export const BAGGAGE_OUT_OF_STOCK_ERROR_CODE = "NEXUZCMNE004";
// Map Category Id to Category Name for baggage selection
export const BAGGAGE_CATEGORY_MAP = {
	CARRY_ON: 144,
	CHECKED_IN: 143,
	SPORTS: 145,
} as const;
export type BaggageCategories = (typeof BAGGAGE_CATEGORIES)[keyof typeof BAGGAGE_CATEGORIES];
export const BAGGAGE_CATEGORIES = {
	CARRY_ON: "carryOn",
	CHECKED_IN: "checkedIn",
	SPORTS: "sportsEquipment",
};
// maximum number of baggage items allowed for selection : sports equipment + checked-in baggage
export const MAX_ITEMS_FOR_BAGGAGE_SELECTION = 5;
// Carry on baggage labels for display purposes
export const CARRY_ON_LABELS = {
	"7kg": "label_carry_on_label_7_kg",
	CABN: "label_carry_on_label_15_kg",
};
// Baggage Equipment Items for display purposes
export const SPORTS_EQUIPMENT_MAP: BaggageEquipmentItem[] = [
	{
		id: "SKII",
		label: "label_ski_equipment",
		icon: "downhill_skiing",
		price: 0,
		ssrCode: "SKII",
		qtyAvailable: 0,
	},
	{
		id: "GOLF",
		label: "label_golf",
		icon: "sports_golf",
		price: 0,
		ssrCode: "GOLF",
		qtyAvailable: 0,
	},
	{
		id: "BIKE",
		label: "label_bicycle_equipment",
		icon: "pedal_bike",
		price: 0,
		ssrCode: "BIKE",
		qtyAvailable: 0,
	},
	{
		id: "SUFS",
		label: "label_surfboard_equipment",
		icon: "surfing",
		price: 0,
		ssrCode: "SUFS",
		qtyAvailable: 0,
	},
	{
		id: "SUFL",
		label: "label_surfboard_equipment_large",
		icon: "surfing",
		price: 0,
		ssrCode: "SUFL",
		qtyAvailable: 0,
	},
	{
		id: "SNOB",
		label: "label_snow_board",
		icon: "snowboarding",
		price: 0,
		ssrCode: "SNOB",
		qtyAvailable: 0,
	},
];

export const DEFAULT_BAGGAGE_BY_BUNDLE = {
	VALUE: [
		{
			ssrCode: "BAGN",
			categoryId: BAGGAGE_CATEGORY_MAP.CHECKED_IN,
		},
	],

	PREMIUM: [
		{
			ssrCode: "BAGN",
			categoryId: BAGGAGE_CATEGORY_MAP.CHECKED_IN,
		},
		{
			ssrCode: "CABN",
			categoryId: BAGGAGE_CATEGORY_MAP.CARRY_ON,
		},
	],

	FLEXBIZ: [
		{
			ssrCode: "CABN",
			categoryId: BAGGAGE_CATEGORY_MAP.CARRY_ON,
		},
	],
} as const satisfies Record<string, readonly DefaultBaggageService[]>;
// Maximum quantity allowed for each baggage item checked in and sports
export const MAX_BAGGAGE_QUANTITY_PER_ITEM = 5;
