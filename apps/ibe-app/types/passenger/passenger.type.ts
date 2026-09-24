import type { NEXUZR004OffersPassengerType } from "@repo/sdk/swagger";
import type { useTranslations } from "next-intl";
import type { Control, FieldErrors, UseFormReturn } from "react-hook-form";
import type { getAdultAssignmentMap } from "@/modules/utils/helpers/passenger-name/passenger-rules/passenger-rules";
import type {
	PassengerFormValues,
	PassengerItemValues,
} from "@/modules/utils/validations/passenger.schema/passenger.schema";
import type { BundleId } from "@/types/bundle/bundle.types";
import type { ApisInfo, DatePart } from "@/types/customer-information/customer-information.types";

/** Passenger section display configuration */
export interface PassengerSection {
	id: string;
	mainLabel: string;
	ageLabel: string;
	hasAccompanyingAdult: boolean;
	passengerTypeCode: string;
}

// ── Bundle / Service / Seat sub-types ────────────────────────────────────────

export type BundleCode = BundleId;

export type PassengerSeat = {
	lfid: number;
	pfid: number;
	row: string;
	column: string;
	serviceCode: string;
	amount: number;
	applicableAmount?: number;
	bundleCode?: string;
};

export type PassengerService = {
	lfid: number;
	pfid: number;
	amount: number;
	applicableAmount?: number;
	categoryId: number;
	cutOffHours: number;
	description: string;
	maxCountServiceLevel: number;
	passengerType: string;
	qtyAvailable: number;
	ssrCode: string;
	serviceID: number;
	chargeComment: string;
	bundleCode?: string;
};

export type PassengerBundle = {
	lfid: number;
	pfid: number;
	bundleCode: BundleCode;
	amount?: number;
	categoryId?: number;
	serviceID?: number;
	bundleCategory?: NEXUZR004OffersPassengerType;
};

/** Canonical category keys used to group passenger services in store state. */
export type PassengerServiceCategory =
	| "meals"
	| "extras"
	| "baggage"
	| "lounge"
	| "express"
	| "non-chargeable"
	| "travel";

/** Canonical ordering of passenger service categories. */
export const PASSENGER_SERVICE_CATEGORIES = [
	"meals",
	"extras",
	"baggage",
	"lounge",
	"express",
	"non-chargeable",
	"travel",
] as const satisfies readonly PassengerServiceCategory[];

/** Passenger services grouped by category for a single passenger. */
export type PassengerServiceGroups = Partial<Record<PassengerServiceCategory, PassengerService[]>>;

/** Create a fully shaped passenger service groups object. */
export function createPassengerServiceGroups(
	services?: PassengerServiceGroups
): PassengerServiceGroups {
	const nextServices: PassengerServiceGroups = {};

	for (const category of PASSENGER_SERVICE_CATEGORIES) {
		nextServices[category] = services?.[category] ?? [];
	}

	return nextServices;
}

// ── Passenger name and association details ────────────────────────────────────

/** Passenger name and association details */
export type PassengerValues = {
	id: string;
	passengerTypeCode: string;
	associateWithPassengerId?: string;
	firstName: string;
	middleName?: string;
	lastName: string;
	dateOfBirth?: DatePart | string;
	gender?: string;
	redressNumber?: string;
	knownTravelerNumber?: string;
	nationality?: string;
	isPrimaryPassenger?: boolean;
	height?: number | string;
	weight?: number | string;
	contactInformation?: {
		countryCode?: string;
		phoneNumber?: string;
		email?: string;
	};
	emergencyContact?: {
		countryCode?: string;
		phoneNumber?: string;
	};
	apisInfo?: ApisInfo;
	seats?: PassengerSeat[];
	services?: PassengerServiceGroups;
	bundles?: PassengerBundle[];
};

// Defines the number of passengers per passenger category.
export type PassengerCounts = {
	adult: number;
	childA: number;
	childB: number;
	childC: number;
	infant: number;
};

/** Passenger section codes used when building passenger name sections. */
export type PassengerSectionCode = "adult" | "childA" | "childB" | "childC" | "infant";

/** Configuration for a passenger name section entry. */
export type PassengerSectionConfig = {
	countKey: PassengerSectionCode;
	mainLabelKey: "adult_passenger" | "child_passenger" | "infant_passenger";
	ageLabelKey: "adult_age" | "older_child_age" | "child_age" | "younger_child_age" | "infant_age";
	hasAccompanyingAdult: boolean;
	requiresYvrRoute?: boolean;
};

//  Redux/store state for passenger names.
export type PassengerNameState = {
	passengers: PassengerValues[];
	/** True after a successful confirm-and-proceed submission */
	submitted: boolean;
	/** Amount committed by page-level proceed/confirm actions for top-bar display. */
	committedSelectionsTotal?: number;
};

// Translation function type for passenger name page  strings.
export type PassengerNameLabels = ReturnType<typeof useTranslations<"passenger_name_page">>;

/** Props for the PassengerSection component */
export type PassengerSectionProps = {
	index: number;
	section: PassengerSection;
	errs: FieldErrors<PassengerItemValues> | undefined;
	control: Control<PassengerFormValues>;
	trigger: UseFormReturn<PassengerFormValues>["trigger"];
	adultOptions: { value: string; label: string; disabled: boolean }[];
	associatedAdults: ReturnType<typeof getAdultAssignmentMap>;
	isYvrRouteValue: boolean;
	passengerNameLabels: PassengerNameLabels;
};
