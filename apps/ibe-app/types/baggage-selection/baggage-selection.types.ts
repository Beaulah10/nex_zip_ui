// ------------------ Types for Baggage Service components -----------------------

import type { NEXUZR004OffersSpecialService } from "@repo/sdk";
import type { usePassengerOrder } from "@/modules/hooks/common/passenger-order/passenger-order";
import type { useServicePassengers } from "@/modules/hooks/common/service-passengers/service-passengers";
import type {
	BAGGAGE_CATEGORY_MAP,
	DEFAULT_BAGGAGE_BY_BUNDLE,
} from "@/modules/utils/constants/baggage-service/baggage-selection-constants";
import type { PassengerService } from "@/types/passenger/passenger.type";

// type for carry-on options, checked-in baggage, and sports equipment services
export interface CarryOnOption {
	id: string;
	label: string;
	price: number;
	ssrCode: string;
	qtyAvailable?: number;
}

export interface BaggageEquipmentItem {
	id: string;
	icon: string;
	label: string;
	price: number;
	ssrCode: string;
	qtyAvailable: number;
}
// Type for the selected baggage services for a passenger - UI Display
export interface BaggageSelectionValues {
	carryOnId: string;
	checkedInBaggageCount: number;
	equipmentCounts: Record<string, number>;
}

// ------------------ Type for the props of the Baggage Selection component -------------------
// Baggage Selection Content Component
export interface BaggageSelectionProps {
	readonly passengerName: string;
	readonly bundleId: "NONE" | "VALUE" | "PREMIUM" | "FLEXBIZ";
	readonly bundleLabel: string;
	readonly checkedInBaggagePrice: number;
	readonly carryOnOptions: CarryOnOption[];
	readonly equipment: readonly BaggageEquipmentItem[];
	readonly value: BaggageSelectionValues | null;
	readonly onChange?: (value: BaggageSelectionValues) => void;
	readonly showHeader?: boolean;
	readonly availableInventory?: Record<string, number>;
	readonly segmentValidationMessage?: string | null;
	readonly adultType?: string;
	readonly onValidationChange?: (validate: () => boolean) => void;
}

// ------------------ Type for the props of the Baggage Counter Card component -------------------
export interface BaggageCounterProps {
	value?: number;
	defaultValue?: number;
	min?: number;
	onChange?: (value: number) => void;
	className?: string;
	disabled?: boolean;
	incrementDisabled: boolean;
}

// Type for the props of the Counter Card component
export interface CounterCardProps {
	readonly icon: string;
	readonly label: string;
	readonly description?: string;
	readonly price: number;
	readonly count: number;
	readonly min?: number;
	readonly incrementDisabled: boolean;
	readonly disabled: boolean;
	readonly onChange: (count: number) => void;
	className?: string;
}

// ----------------- types for the baggage Selection utils ----------------------
export type BundleId = "NONE" | "VALUE" | "PREMIUM" | "FLEXBIZ";

export interface BaggageServiceInfo {
	amount: number;
	currency: string;
	qtyAvailable: number;
	ssrCode: string;
}
export interface BaggageServicesResponse {
	carryOn: Record<string, BaggageServiceInfo>;
	checkedIn: Record<string, BaggageServiceInfo>;
	sportsEquipment: Record<string, BaggageServiceInfo>;
}
export interface QuantityBasedService {
	service: PassengerService;
	quantity: number;
}
export type PassengerServiceWithQuantity = Record<string, QuantityBasedService>;
export type PassengerServiceForCarryOn = Record<string, PassengerService>;
export interface PassengerBaggageServices {
	carryOn: PassengerServiceForCarryOn;

	checkedIn: PassengerServiceWithQuantity;

	sportsEquipment: PassengerServiceWithQuantity;
}
export type CheckedInBaggageMap = PassengerBaggageServices["checkedIn"];
export type SportsEquipmentMap = PassengerBaggageServices["sportsEquipment"];
export type ServicePassengers = ReturnType<typeof useServicePassengers>["servicePassengers"];
export type ServicePassenger = ServicePassengers[number];
export interface PassengerWithBaggageSelection {
	passenger: ServicePassenger;
	baggageServices: PassengerBaggageServices;
	categories: {
		title: string;
		items: {
			count: number;
			label: string;
			price: number;
		}[];
	}[];

	totalPrice: number;
}
export type PassengerBaggageSelectionMap = Record<string, PassengerWithBaggageSelection>;

export interface BaggageOfferServicesByCategories {
	carryOn: Record<string, NEXUZR004OffersSpecialService>;
	checkedIn: Record<string, NEXUZR004OffersSpecialService>;
	sportsEquipment: Record<string, NEXUZR004OffersSpecialService>;
}

export interface BaggageOffersByPTCType {
	passengerType: string;
	categories: BaggageOfferServicesByCategories;
}

export type SegmentComparisonResult = {
	currentGreater: string[];
	otherGreater: string[];
	hasCurrentGreater: boolean;
	hasOtherGreater: boolean;
};

export type BaggageCategoryId = (typeof BAGGAGE_CATEGORY_MAP)[keyof typeof BAGGAGE_CATEGORY_MAP];

export type DefaultBaggageService = {
	readonly ssrCode: "BAGN" | "CABN";
	readonly categoryId: BaggageCategoryId;
};

export type DefaultBaggageBundle = keyof typeof DEFAULT_BAGGAGE_BY_BUNDLE;

export type GetDefaultBaggageActionsParams = {
	currentLfid: number;
	currentPfid?: number;
	servicePassengers: ServicePassenger[];
	orderedPassengersWithNames: ReturnType<typeof usePassengerOrder>["orderedPassengersWithNames"];
};

export type BaggageTranslator = (key: string, values?: Record<string, string | number>) => string;
export type BaggagePassengerListTypes = {
	passengers: ServicePassenger[];
	baggageSelections: PassengerBaggageSelectionMap;
	onPassengerClick: (passengerId: string) => void;
	translate: BaggageTranslator;
	focusPassengerId: string | null;
	onFocusRestored: () => void;
};
