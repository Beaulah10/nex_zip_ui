/**
 * File: confirmation.constants.ts
 * Centralized URLs used for precaution, policy, baggage, and insurance links
 * displayed across the booking and confirmation flows.
 */

import type { ManualReceiptState, ReceiptFieldName } from "@/types/confirmation/confirmation.types";

export const PRECAUTION_URLS = {
	transportationAgreement: "https://www.zipair.net/en/carriage",
	fareRegulations: "https://www.zipair.net/en/farerules",
	privacyPolicy: "https://www.zipair.net/en/privacy",
	insuranceIntroduction: "https://www.zipair.net/en/service/insurance",
	checkedBaggageTerms: "https://akiba.zipair.net/en/terms-for-baggage",
	souvenirSalesTerms: "https://akiba.zipair.net/en/terms-of-use",
	dangerousGoods: "https://www.zipair.net/en/service/baggage/rule",
} as const;

export const EMPTY_MANUAL_STATE: ManualReceiptState = {
	lastName: "",
	firstName: "",
	middleName: "",
	emailAddress: "",
	emailConfirmation: "",
};

export const RECEIPT_REQUIRED_FIELDS: ReceiptFieldName[] = [
	"lastName",
	"firstName",
	"emailAddress",
	"emailConfirmation",
];

export const PRECAUTION_LINK_PROPS = {
	target: "_blank",
	rel: "noopener noreferrer",
} as const;

export const PASSENGER_INFORMATION_ACCORDION_VALUE = "passenger-information";
export const PASSENGER_ACCORDION_VALUE = "passenger";
export const TAXES_SUMMARY_ACCORDION_VALUE = "taxes-summary";

export const DEADLINE_VALIDATION_TYPES = {
	BOOKING_ERROR: "booking-error",
	BUNDLE_DEADLINE: "bundle-deadline",
	PASSENGER_SERVICES: "passenger-services",
} as const;

export const WARNING_MODES = {
	CANNOT_CHANGE: "cannot-change",
} as const;
export const DEFAULT_SERVICE_CUTOFF_HOURS = 24;
export const HNL_LOUNGE_CUTOFF_HOURS = 48;
export const HNL_NRT_TRANSPORT_CUTOFF_HOURS = 96;

/** Milliseconds in one hour, used for deadline window math. */
export const HOURS_IN_MILLISECONDS = 60 * 60 * 1000;

/** Shared deadline thresholds in hours. */
export const BOOKING_CUTOFF_HOURS = 1.5;
export const DEADLINE_24_HOURS = 24;
export const DEADLINE_48_HOURS = 48;
export const DEADLINE_96_HOURS = 96;
// Baggage inventory issue types used to categorize stock shortages.
export const BAGGAGE_INVENTORY_TYPE = {
	NO_BUNDLE_OUT_OF_STOCK: "no-bundle-out-of-stock",
	BUNDLE_OUT_OF_STOCK: "bundle-out-of-stock",
	SELECTED_BAGGAGE_UNAVAILABLE: "selected-baggage-unavailable",
	AVAILABLE: "available",
} as const;
// Icons used for summary rows in the confirmation UI.
export const SUMMARY_ROW_ICON = {
	BAGGAGE: "luggage",
	SEAT: "airline_seat_recline_normal",
} as const;
