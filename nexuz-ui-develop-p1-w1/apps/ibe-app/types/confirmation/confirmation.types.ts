/**
 * File: confirmation.types.ts
 * Description: Display-layer types for the confirmation page.
 * All types are derived from store data shapes and used only by confirmation
 * helpers, the confirmation hook, and the confirmation page component.
 */

import type { NEXUZR004OffersAncillaryResponse } from "@repo/sdk";
import type * as React from "react";
import type { ErrorDialogAction } from "@/components/common/error-dialog/error-dialog";
import type {
	AncillaryTranslations,
	BaggageTranslations,
} from "@/modules/hooks/confirmation/use-confirmation-baggage/use-confirmation-baggage";
import type { BaggageCategories } from "@/modules/utils/constants/baggage-service/baggage-selection-constants";
import type { BAGGAGE_INVENTORY_TYPE } from "@/modules/utils/constants/confirmation/confirmation.constants";
import type { ConfirmationSummaryRowId } from "@/modules/utils/constants/confirmation/summary-row.constants";
import type { BookingFlowDirection } from "@/modules/utils/helpers/common/flow-router/flow-router";
import type { AppDispatch } from "@/store";
import type { ConfirmedFlightPayload } from "@/store/slices/flight-selection/flight-selection.slice";
import type {
	PassengerBaggageServices,
	ServicePassenger,
} from "@/types/baggage-selection/baggage-selection.types";
import type { Passenger } from "@/types/customer-information/customer-information.types";
import type { PassengerValues } from "@/types/passenger/passenger.type";
import type {
	CancelledSeatSelection,
	SeatSelectionDialogType,
} from "@/types/seat-map/seat-map.types";
// ── FlightItineraryCard ───────────────────────────────────────────────────────

/** Props for the flight leg summary card shown on the itinerary review. */
export interface FlightItineraryCardProps extends React.HTMLAttributes<HTMLDivElement> {
	/** Departure IATA airport code, e.g. "NRT" */
	departureAirportCode: string;
	/** Departure airport full name, e.g. "Narita International Airport" */
	departureAirportName: string;
	/** Arrival IATA airport code, e.g. "SIN" */
	arrivalAirportCode: string;
	/** Arrival airport full name, e.g. "Changi International Airport" */
	arrivalAirportName: string;
	/** Departure time string, e.g. "23:40" */
	departureTime: string;
	/** Departure date label, e.g. "Mon, Aug 26, 2026" */
	departureDate: string;
	/** Arrival time string, e.g. "09:00" */
	arrivalTime: string;
	/** Arrival date label, e.g. "Tue, Aug 27, 2026" */
	arrivalDate: string;
	/** Total flight duration label, e.g. "14h 20m" */
	duration: string;
	/** Leg label shown in the pill badge, e.g. "Outbound" / "Inbound" */
	legLabel: string;
	/** IATA flight number, e.g. "ZG 053" */
	flightNumber: string;
}

// ── PassengerRow ──────────────────────────────────────────────────────────────

/** Travel-document fields for a single passenger's table row. */
export interface PassengerRowData {
	id: string;
	name: string;
	dateOfBirth: string;
	passportNumber: string;
	expiryDate: string;
	nationality: string;
	needsAssistance?: boolean;
	isInfant?: boolean;
	onChange?: () => void;
}

/** Props for the full passenger table row including change action and labels. */
export interface PassengerRowProps extends PassengerRowData {
	changeLabel: string;
	needsAssistanceLabel: string;
	className?: string;
}

// ── PassengerAccordionRow ─────────────────────────────────────────────────────

/** Props for the mobile passenger accordion card, extending base row data with column labels. */
export interface PassengerAccordionRowProps extends PassengerRowData {
	dateOfBirthLabel: string;
	passportNumberLabel: string;
	expiryDateLabel: string;
	nationalityLabel: string;
	changeLabel: string;
	needsAssistanceLabel: string;
	/** Per-passenger toggle aria-label template containing a "{name}" placeholder. */
	toggleAriaLabel: string;
	defaultOpen?: boolean;
	/** Controlled open state for single-open behaviour on mobile. */
	isOpen?: boolean;
	onToggle?: () => void;
	className?: string;
}

// ── PassengerInformation ──────────────────────────────────────────────────────

/** Alias for PassengerRowData used by the passenger information table. */
export type PassengerInformationRow = PassengerRowData;

/** Column header labels for the passenger information table. */
export interface PassengerInformationColumnLabels {
	passenger: string;
	dateOfBirth: string;
	passportNumber: string;
	expiryDate: string;
	nationality: string;
}

/** Props for the PassengerInformation accordion table on the confirmation page. */
export interface PassengerInformationProps {
	title: string;
	helperText: string;
	passengers: PassengerInformationRow[];
	columnLabels: PassengerInformationColumnLabels;
	changeLabel: string;
	needsAssistanceLabel: string;
	toggleAriaLabel: string;
	/** Callback that returns the aria-label for a given passenger name. */
	toggleRowAriaLabel: (name: string) => string;
	defaultOpen?: boolean;
	className?: string;
}

// ── SummaryRow ────────────────────────────────────────────────────────────────

/** A single price line item within a summary row group, e.g. "Cabin baggage". */
export interface SummaryLineItem {
	/** Bold sub-heading shown above the label, e.g. "Cabin baggage" */
	title?: string;
	label: string;
	price?: number;
	originalPrice?: number;
	/** Free-form note shown instead of a price, e.g. the Seat Type disclaimer */
	note?: string;
	/** For baggage items that are included in the bundle, this can be used to hide the original price. */
	hideOriginalPrice?: boolean;
}

/** A grouped set of price line items displayed within a single summary row. */
export interface SummaryItemGroup {
	items: SummaryLineItem[];
}

/** Props for a labeled ancillary summary row, e.g. "Bundle" or "Baggage". */
export interface SummaryRowProps {
	passengerName: string;
	id: ConfirmationSummaryRowId;
	icon: string;
	label: string;
	groups: SummaryItemGroup[];
	warningMessage?: string;
	changeLabel?: string;
	actionDisabled?: boolean;
	onChange?: () => void;
	changeDisabled?: boolean;
	/** When set, renders this text in place of items and shows a disabled button. */
	unavailableStatus?: string;
	className?: string;
}

// ── PassengerSummaryCard ──────────────────────────────────────────────────────

/** Summary row data without the className presentation prop. */
export type SummaryRowData = Omit<SummaryRowProps, "className" | "passengerName">;

/** Props for the passenger price-summary accordion card shown under each flight leg. */
export interface PassengerSummaryCardProps {
	accordionValue: string;
	name: string;
	totalPrice: number;
	rows: SummaryRowData[];
	toggleAriaLabel: string;
	seatErrorBanner?: {
		title: string;
		body: string;
	};
	isInfant?: boolean;
	/** Age-range badge shown below the name, e.g. "0 - 1 year" for an infant passenger. */
	badgeLabel?: string;
	className?: string;
	baggageSegmentMismatchBanner?: {
		title: string;
		body: string;
		variant?: "error" | "warning";
	};
	showBaggageSegmentMismatchBanner?: boolean;
	baggageSegmentMismatchPassengerId?: string;
}

// ── TaxRow ────────────────────────────────────────────────────────────────────

/** A sub-item beneath a tax row, e.g. a fee breakdown entry. */
export interface TaxSubItem {
	label: string;
	price?: number;
}

/** Props for a single tax line item row in the taxes accordion. */
export interface TaxRowProps {
	title: string;
	price: number;
	subItems: TaxSubItem[];
	className?: string;
}

// ── TaxesSummaryCard ──────────────────────────────────────────────────────────

/** Tax row data without the className presentation prop. */
export type TaxRowData = Omit<TaxRowProps, "className">;

/** Props for the taxes and fees breakdown accordion card on the confirmation page. */
export interface TaxesSummaryCardProps {
	title: string;
	totalPrice: number;
	note: string;
	rows: TaxRowData[];
	toggleAriaLabel: string;
	defaultOpen?: boolean;
	className?: string;
}

// ── IssuanceOfReceipt ─────────────────────────────────────────────────────────

/** Props for the issuance-of-receipt form section with recipient and email fields. */
export interface IssuanceOfReceiptProps {
	title: string;
	recipientLabel: string;
	recipientManualOptionLabel: string;
	requiredBadgeLabel: string;
	optionalBadgeLabel: string;
	lastNameLabel: string;
	firstNameLabel: string;
	middleNameLabel: string;
	halfWidthAlphabetLabel: string;
	emailLabel: string;
	emailConfirmationLabel: string;
	halfWidthAlphanumericLabel: string;
	emailHelperText: string;
	className?: string;
}

export type ReceiptRecipientInfo = {
	firstName: string;
	lastName: string;
	middleName?: string;
	emailAddress: string;
};

/** Ref handle for programmatically triggering receipt form validation. */
export interface IssuanceOfReceiptHandle {
	validateSelection: () => boolean;
	getRecipientInfo: () => ReceiptRecipientInfo | null;
	focus: () => void;
}

// ── Confirmation page local props ────────────────────────────────────────────

/** Props for the confirmation page total amount summary row. */
export interface TotalAmountSummaryProps {
	label: string;
	amount: number;
	note?: string;
}

/** Props for the confirmation page leg summary section. */
export interface LegSectionProps {
	legData: ConfirmationFlightLegDisplay;
	passengers: ConfirmationPassengerDisplay[];
	taxTitle: string;
	taxNote: string;
	toggleSummaryAriaLabel: string;
	toggleTaxesAriaLabel: string;
	onSeatAction: (passengerId: string) => void;
	onLoungeChange: (passengerId: string) => void;
	onTransportChange: (passengerId: string) => void;
	onPriorityChange: (passengerId: string) => void;
	onBundleChange?: () => void;
	bundleChangeDisabled?: boolean;
}

export interface ConfirmationSeatDialogState {
	open: boolean;
	direction: BookingFlowDirection;
	passengerId: string;
	stageLabel: string;
	routeLabel: string;
}
export interface ConfirmationSeatErrorState {
	open: boolean;
	title: string;
	content: string;
	buttonLabel?: string;
	action: ErrorDialogAction;
	unavailableSeatSelections: CancelledSeatSelection[];
}

export interface ConfirmationBundleErrorState {
	open: boolean;
	title: string;
	content: string;
	buttonLabel: string;
	action: ErrorDialogAction;
	redirectUrl?: string;
}

export interface ConfirmationLoungeDialogState {
	open: boolean;
	passengerId: string;
	direction: BookingFlowDirection;
	stageLabel: string;
	routeLabel: string;
	ancillaryScope: "segment1" | "segment2" | "outbound" | "inbound";
	originCode?: string;
	segmentLfid?: number;
}

export interface ConfirmationTransportServiceDialogState {
	open: boolean;
	passengerId: string;
	direction: BookingFlowDirection;
	stageLabel: string;
	routeLabel: string;
	origin?: string;
	destination?: string;
}

export interface ConfirmationTransportErrorState {
	open: boolean;
	title: string;
	content: string;
	buttonLabel: string;
	action: ErrorDialogAction;
	redirectUrl?: string;
	pendingTransportDialogPassenger?: { passengerId: string; direction: BookingFlowDirection } | null;
}

export interface UnavailableTransportEntry {
	passengerId: string;
	passengerName: string;
	serviceName: string;
}

export type TransportToRemove = {
	passengerId: string;
	lfid: number;
	ssrCode: string;
	serviceID: number;
};

export type TransportAvailabilityActionResult =
	| { type: "noop" }
	| {
			type: "all-transports-unavailable";
			transportsToRemove: TransportToRemove[];
	  }
	| {
			type: "selected-transport-unavailable";
			unavailableTransports: UnavailableTransportEntry[];
			transportsToRemove: TransportToRemove[];
			affectedPassengerIds: string[];
	  };

export type ResolvedTransportAvailabilityIssue =
	| { type: "noop" }
	| {
			type: "all-transports-unavailable";
			transportsToRemove: TransportToRemove[];
			disabledPassengerIds: string[];
	  }
	| {
			type: "selected-transport-unavailable";
			transportsToRemove: TransportToRemove[];
			disabledPassengerIds: string[];
			contentSuffix: string;
			shouldReopenDialog: boolean;
	  };

export interface ConfirmationPriorityDialogState {
	open: boolean;
	passengerId: string;
	direction: BookingFlowDirection;
	stageLabel: string;
	routeLabel: string;
	segmentLfid?: number;
}

export interface UnavailablePriorityServiceEntry {
	passengerId: string;
	passengerName: string;
	serviceName: string;
}

export type PriorityServiceToRemove = {
	passengerId: string;
	lfid: number;
	ssrCode: string;
	serviceID: number;
};

export type PriorityAvailabilityActionResult =
	| { type: "noop" }
	| {
			type: "all-priority-unavailable";
			servicesToRemove: PriorityServiceToRemove[];
	  }
	| {
			type: "selected-priority-unavailable";
			unavailableServices: UnavailablePriorityServiceEntry[];
			servicesToRemove: PriorityServiceToRemove[];
			affectedPassengerIds: string[];
	  };

export type ResolvedPriorityAvailabilityIssue =
	| { type: "noop" }
	| {
			type: "all-priority-unavailable";
			servicesToRemove: PriorityServiceToRemove[];
			disabledPassengerIds: string[];
	  }
	| {
			type: "selected-priority-unavailable";
			servicesToRemove: PriorityServiceToRemove[];
			disabledPassengerIds: string[];
			contentSuffix: string;
			shouldReopenDialog: boolean;
	  };

export interface ConfirmationPriorityErrorState {
	open: boolean;
	title: string;
	content: string;
	buttonLabel: string;
	action: ErrorDialogAction;
	redirectUrl?: string;
	pendingPriorityDialogPassenger?: { passengerId: string; direction: BookingFlowDirection } | null;
}

export type PreparedConfirmationPriorityDialogState = {
	open: true;
	passengerId: string;
	direction: BookingFlowDirection;
	stageLabel: string;
	routeLabel: string;
	segmentLfid?: number;
};

export type PreparedConfirmationPriorityActionResult =
	| { type: "noop" }
	| { type: "service-unavailable" }
	| {
			type: "open-priority-dialog";
			priorityDialogState: PreparedConfirmationPriorityDialogState;
			ancillaryData: NEXUZR004OffersAncillaryResponse;
	  };

export interface UnavailableLoungeEntry {
	passengerId: string;
	passengerName: string;
	loungeName: string;
}

export type LoungeToRemove = {
	passengerId: string;
	lfid: number;
	ssrCode: string;
	serviceID: number;
};

export type LoungeAvailabilityActionResult =
	| { type: "noop" }
	| {
			type: "all-lounges-unavailable";
			loungesToRemove: LoungeToRemove[];
	  }
	| {
			type: "selected-lounge-unavailable";
			unavailableLounges: UnavailableLoungeEntry[];
			loungesToRemove: LoungeToRemove[];
			affectedPassengerIds: string[];
	  };

export type ResolvedLoungeAvailabilityIssue =
	| { type: "noop" }
	| {
			type: "all-lounges-unavailable";
			loungesToRemove: LoungeToRemove[];
			disabledPassengerIds: string[];
	  }
	| {
			type: "selected-lounge-unavailable";
			loungesToRemove: LoungeToRemove[];
			disabledPassengerIds: string[];
			contentSuffix: string;
			shouldReopenDialog: boolean;
	  };

export interface ConfirmationLoungeErrorState {
	open: boolean;
	title: string;
	content: string;
	buttonLabel: string;
	action: ErrorDialogAction;
	redirectUrl?: string;
	pendingLoungeDialogPassenger?: { passengerId: string; direction: BookingFlowDirection } | null;
}

export type PreparedConfirmationLoungeDialogState = {
	open: true;
	passengerId: string;
	direction: BookingFlowDirection;
	stageLabel: string;
	routeLabel: string;
	ancillaryScope: "segment1" | "segment2" | "outbound" | "inbound";
	originCode?: string;
	segmentLfid?: number;
};

export type PreparedConfirmationLoungeActionResult =
	| { type: "noop" }
	| { type: "service-unavailable" }
	| {
			type: "open-lounge-dialog";
			loungeDialogState: PreparedConfirmationLoungeDialogState;
			ancillaryData: NEXUZR004OffersAncillaryResponse;
	  };

// ── Meal out-of-stock ────────────────────────────────────────────────────────

export interface UnavailableMealEntry {
	passengerId: string;
	passengerName: string;
	mealName: string;
}

export type MealToRemove = {
	passengerId: string;
	lfid: number;
	ssrCode: string;
	serviceID: number;
};

export type MealAvailabilityActionResult =
	| { type: "noop" }
	| { type: "bundle-meal-unavailable" }
	| {
			type: "all-meals-unavailable";
			hasExistingSelections: boolean;
			mealsToRemove: MealToRemove[];
	  }
	| {
			type: "partial-meals-unavailable";
			affectedPassengerIds: string[];
			mealsToRemove: MealToRemove[];
	  }
	| {
			type: "selected-meal-unavailable";
			unavailableMeals: UnavailableMealEntry[];
			mealsToRemove: MealToRemove[];
	  };

export interface ConfirmationMealErrorState {
	open: boolean;
	title: string;
	content: string;
	buttonLabel: string;
	action: ErrorDialogAction;
	redirectUrl?: string;
	/** When set, this passenger's meal dialog is opened after the error is dismissed (AC1). */
	pendingMealDialogPassenger?: { passengerId: string; direction: BookingFlowDirection } | null;
}

export interface UnavailableBaggageEntry {
	passengerId: string;
	passengerName: string;
	baggageName: string;
}

export type BaggageAvailabilityActionResult =
	| { type: "noop" }
	| {
			type: "selected-baggage-unavailable";
			unavailableBaggage: UnavailableBaggageEntry[];
			updatedBaggageServicesByPassengerId: Record<string, PassengerBaggageServices>;
	  };

export interface UnavailableExtraEntry {
	passengerId: string;
	passengerName: string;
	extraName: string;
}

export type ExtraToRemove = {
	passengerId: string;
	lfid: number;
	ssrCode: string;
};

export type ExtrasAvailabilityActionResult =
	| { type: "noop" }
	| { type: "bundle-extra-unavailable" }
	| {
			type: "all-extras-unavailable";
			hasExistingSelections: boolean;
			extrasToRemove: ExtraToRemove[];
	  }
	| {
			type: "selected-extra-unavailable";
			unavailableExtras: UnavailableExtraEntry[];
			extrasToRemove: ExtraToRemove[];
	  };

export interface ConfirmationExtrasErrorState {
	open: boolean;
	title: string;
	content: string;
	buttonLabel: string;
	action: ErrorDialogAction;
	redirectUrl?: string;
}
// ── NewsletterSubscription ────────────────────────────────────────────────────

/** Props for the optional newsletter opt-in checkbox shown on the confirmation page. */
export interface NewsletterSubscriptionProps {
	label: string;
	caption: string;
	defaultChecked?: boolean;
	onCheckedChange?: (checked: boolean) => void;
	className?: string;
}

// ── Precautions ───────────────────────────────────────────────────────────────

/** A single precaution bullet point with optional alert styling variant. */
export interface PrecautionItem {
	id: string;
	content: React.ReactNode;
	variant?: "default" | "alert";
}

/** A titled group of precaution items with an optional text size. */
export interface PrecautionSubsection {
	title: string;
	items: PrecautionItem[];
	textSize?: "sm" | "base";
}

/** Props for the Precautions section including subsections and an agreement checkbox. */
export interface PrecautionsProps {
	title: string;
	subsections: PrecautionSubsection[];
	agreeLabel: string;
	agreeCheckboxLabel: string;
	checked: boolean;
	onCheckedChange?: (checked: boolean) => void;
	showAgreementError?: boolean;
	agreementCheckboxError?: string;
	className?: string;
}

// ── Per-passenger display ─────────────────────────────────────────────────────

/** Aggregated display data for a single passenger combining travel-document and ancillary info. */
export type ConfirmationPassengerDisplay = {
	id: string;
	name: string;
	passengerTypeCode: string;
	isInfant?: boolean;
	/** Age-range badge, e.g. "0 - 1 year" for infant. Undefined for adults. */
	badgeLabel?: string;
	/** Sum of all bundle + seat + service amounts stored in `passenger.slice`. */
	totalPrice: number;
	/** Rows passed directly to `PassengerSummaryCard`. */
	summaryRows: SummaryRowData[];
	/** Row passed directly to `PassengerInformation`. */
	infoRow: PassengerInformationRow;
};

// ── Per-leg display ───────────────────────────────────────────────────────────

/** All display data needed to render one flight leg (outbound or inbound) on the confirmation page. */
export type ConfirmationFlightLegDisplay = {
	itinerary: FlightItineraryCardProps;
	/** Human-readable leg label, e.g. "Outbound" / "Inbound" / "Segment 1". */
	legLabel: string;
	/** Passengers with ancillaries filtered to this leg's segments only. */
	passengers: ConfirmationPassengerDisplay[];
	/** Total flight amount for this leg from `confirmedFlight.flights.[bound].totalFlightAmount`. */
	totalAmount: number;
	/** Tax breakdown rows for `TaxesSummaryCard`. */
	taxRows: TaxRowData[];
	/** Total tax amount for this leg. */
	taxTotalAmount: number;
};

// ── Page-level data ───────────────────────────────────────────────────────────

/** Transit information shown between connecting flight segments. */
export type ConfirmationTransitInfo = {
	/** Full transit-airport name, e.g. "Honolulu" */
	airportName: string;
	/** IATA code of the transit airport, e.g. "HNL" */
	airportCode: string;
	/** Formatted layover duration, e.g. "5 hours 35 minutes" */
	transitDuration: string;
	/** Formatted total journey duration (all segments + transit), e.g. "14 hours 15 minutes" */
	totalDuration: string;
};

/** Root data object returned by `useConfirmationData` and consumed by the Confirmation page component. */
export type ConfirmationPageData = {
	/** Outbound leg (oneway/roundtrip) or Segment 1 (connecting). Always present. */
	outbound: ConfirmationFlightLegDisplay;
	/** Inbound leg (roundtrip) or Segment 2 (connecting); taxes zeroed for connecting flights. */
	inbound?: ConfirmationFlightLegDisplay;
	/** Present only for connecting flights. */
	transitInfo?: ConfirmationTransitInfo;
	/** True when the confirmed flight is a connecting (multi-segment) itinerary. */
	isConnecting: boolean;
	/** Flat list used by the `PassengerInformation` table. */
	passengerInfoRows: PassengerInformationRow[];
	/** Live grand total derived from displayed passenger totals plus leg tax totals. */
	grandTotalAmount: number;
};

/** Form state for the manually entered receipt recipient fields. */
export type ManualReceiptState = {
	lastName: string;
	firstName: string;
	middleName: string;
	emailAddress: string;
	emailConfirmation: string;
};

/** Validation options for receipt name fields. */
export type ReceiptNameValidationOptions = {
	required?: boolean;
	requiredMessage: string;
	maxLengthMessage: string;
	invalidMessage: string;
};

/** Validation options for receipt email fields. */
export type ReceiptEmailValidationOptions = {
	requiredMessage: string;
	invalidMessage: string;
	isUsCanadaRoute: boolean;
};

/** Validation options for receipt email confirmation. */
export type ReceiptEmailConfirmationValidationOptions = {
	emailAddress: string;
	emailConfirmation: string;
	invalidMessage: string;
	requiredMessage: string;
	mismatchMessage: string;
	isUsCanadaRoute: boolean;
};

/** Union of valid receipt form field names derived from ManualReceiptState. */
export type ReceiptFieldName = keyof ManualReceiptState;

/** Partial map of field-level validation error messages for the receipt form. */
export type ReceiptFieldErrors = Partial<Record<ReceiptFieldName, string>>;

// Props for customizing the accordion toggle icon's size and styling classes.
export type AccordionToggleIconProps = {
	className?: string;
	iconClassName?: string;
	iconSize?: number;
	wrapperClassName?: string;
};

/**
 * Result returned when validating and preparing the seat-selection dialog
 * from the confirmation page. Indicates whether to open the seat dialog,
 * show an error dialog, or take no action.
 */

export type ConfirmationSeatActionResult =
	| { type: "noop" }
	| { type: "service-unavailable" }
	| { type: "open-seat-dialog"; seatDialogState: ConfirmationSeatDialogState }
	| {
			type: "open-seat-error-dialog";
			dialogType: SeatSelectionDialogType;
			seatDialogState?: ConfirmationSeatDialogState;
			seatSelectionsToRemove?: CancelledSeatSelection[];
			contentSuffix?: string;
			isBundleSeatUnavailable?: boolean;
	  };

// Props for rendering a meal selection leg section, including meal actions, seat restrictions, and related UI labels.
export type MealLegSectionProps = LegSectionProps & {
	onMealChange: (passengerId: string) => void;
	onExtrasChange: (passengerId: string) => void;
	disabledSeatPassengerIds?: string[];
	disabledExtrasPassengerIds?: string[];
	restrictedSeatPassengerIds?: string[];
	disabledLoungePassengerIds?: string[];
	disabledPriorityPassengerIds?: string[];
	proceedAttemptCount?: number;
	shouldScrollToRestrictedSeatBanner?: boolean;
	disabledSeatStatusLabel: string;
	addButtonLabel: string;
	transportUnavailableLabel?: string;
	transportAddButtonLabel?: string;
	disabledTransportPassengerIds?: string[];
	passengersWithUnavailableMeals?: ReadonlySet<string>;
	mealUnavailableLabel?: string;
	mealAddLabel?: string;
	extrasUnavailableLabel?: string;
	extrasAddLabel?: string;
	loungeUnavailableLabel?: string;
	loungeAddLabel?: string;
	priorityUnavailableLabel?: string;
	priorityAddLabel?: string;
	seatRestrictionBanner?: {
		title: string;
		body: string;
	};
	onBaggageChange: (passengerId: string) => void;
	disabledBaggagePassengerIds?: string[];
	baggageCarryOn7KgLabel: string;
	baggageSegmentMismatchFocusPassengerId?: string;
	baggageSegmentMismatchPassengerIds?: ReadonlySet<string>;
	baggageSegmentMismatchBanner?: {
		title: string;
		body: string;
		variant?: "error" | "warning";
	};
	baggageSegmentMismatchAttempt?: number;
	shouldScrollToBaggageSegmentMismatchBanner?: boolean;
};

// State for controlling the meal confirmation dialog, including visibility, passenger, route, and journey details.
export type ConfirmationMealDialogState = {
	open: boolean;
	passengerId: string | null;
	direction: BookingFlowDirection;
	stageLabel: string;
	routeLabel: string;
};

export type ConfirmationTopProceedIssue = "none" | "seat" | "meal" | "agreement";

/** Passenger data required for confirmation seat validation and cancellation checks. */
export type OrderedPassengerWithNames = Pick<
	PassengerValues,
	"id" | "firstName" | "lastName" | "passengerTypeCode" | "associateWithPassengerId"
> & {
	/** Adult passenger associated with a child or infant passenger. */
	mappedAdultId?: string;
};
/** Departure date-time values used to resolve the final departure timestamp. */
export type DepartureDateTimeInfo = {
	departureDateTime?: string;
	departureDateTimeOffset?: string;
};
/** Indicates whether a booking includes a purchased bundle. */
export type BookingBundleStatus = "Bundle" | "NoBundle";

/** Store data required for purchase deadline validation. */
export type ExistingStoreData = {
	confirmedFlight: ConfirmedFlightPayload | undefined;
};

/** Input payload for confirmation purchase deadline validation. */
export type ConfirmationOnLoadValidationInput = {
	bundleType: BookingBundleStatus;
	source: string;
	destination: string;
	departureTime: string;
	passengerList: PassengerValues[];
	existingStoreData: ExistingStoreData;
	labels: ConfirmationPurchaseDeadlineValidationLabels;
};

/** Supported services subject to purchase deadline validation. */
export type ConfirmationPurchaseDeadlineServiceKey =
	| "bundle"
	| "seat"
	| "baggage"
	| "meal"
	| "priority"
	| "lounge"
	| "transport"
	| "extras";

/** Modes indicating how a deadline warning should be presented to the user. */
export type ConfirmationDeadlineWarningMode = "cannot-select" | "cannot-change";

/** Instructions for cleaning up passenger services when a deadline is exceeded. */
export type ConfirmationDeadlineCleanupInstruction =
	| {
			type: "remove-seat";
			passengerId: string;
			lfid: number;
			pfid: number;
	  }
	| {
			type: "remove-service";
			passengerId: string;
			lfid: number;
			ssrCode: string;
			serviceID?: number;
	  };

/** State representing the deadline status for a specific passenger service. */
export type ConfirmationPassengerServiceDeadlineState = {
	serviceKey: ConfirmationPurchaseDeadlineServiceKey;
	lfid: number;
	isPurchased: boolean;
	isDeadlinePassed: boolean;
	warningMode: ConfirmationDeadlineWarningMode;
	actionDisabled: boolean;
	shouldDisplayNotSelected: boolean;
	shouldOverrideActionToAdd: boolean;
};

/** State representing the deadline status for all services of a specific passenger. */
export type ConfirmationPassengerDeadlineState = Partial<
	Record<
		number,
		Partial<
			Record<ConfirmationPurchaseDeadlineServiceKey, ConfirmationPassengerServiceDeadlineState>
		>
	>
>;

/** Labels used in the confirmation purchase deadline validation UI. */
export type ConfirmationPurchaseDeadlineValidationLabels = {
	locale: string;
	bookingErrorTitle: string;
	bookingErrorMessage: string;
	bookingErrorButtonLabel: string;
	bundleDeadlineTitle: string;
	bundleDeadlineMessage: string;
	bundleDeadlineButtonLabel: string;
};

/** State representing a blocking validation modal. */
export type BlockingValidationState = {
	title: string;
	message: string;
	buttonLabel: string;
	redirectPath: string;
};

/** Result of the confirmation purchase deadline validation. */
export type ConfirmationPurchaseDeadlineValidationResult =
	| {
			type: "booking-error";
			modal: BlockingValidationState;
	  }
	| {
			type: "bundle-deadline";
			modal: BlockingValidationState;
	  }
	| {
			type: "passenger-services";
			sanitizedPassengers: PassengerValues[];
			passengerStates: Record<string, ConfirmationPassengerDeadlineState>;
			cleanupInstructions: ConfirmationDeadlineCleanupInstruction[];
	  };

export type StandardAncillarySummaryRowId = Extract<
	ConfirmationSummaryRowId,
	"meal" | "priority" | "lounge" | "transport" | "extras"
>;

// confirmation Page Baggage : Types
export type BaggageSegmentMismatchState = {
	passengerId: string;
	direction: BookingFlowDirection;
} | null;

export type BaggageSegmentComparisonSummary = {
	segment1LessThanSegment2PassengerIds: string[];
	segment1GreaterThanSegment2PassengerIds: string[];
};

export type BaggageSegmentMismatchBanner = {
	title: string;
	body: string;
	variant?: "error" | "warning";
};
export type ConfirmationBaggageDialogState = {
	open: boolean;
	passengerId: string | null;
	direction: BookingFlowDirection;
	stageLabel: string;
	routeLabel: string;
};

export type ConfirmationBaggageErrorState = {
	open: boolean;
	title: string;
	content: string;
	buttonLabel?: string;
	action: ErrorDialogAction;
	pendingBaggageDialogPassenger?: {
		passengerId: string;
		direction: BookingFlowDirection;
	} | null;
	affectedPassengerId?: string | null;
	affectedDirection?: BookingFlowDirection | null;
};

export type BundleBaggageInventoryValidationResult = {
	isValid: boolean;
	type: "available" | "no-bundle-out-of-stock" | "bundle-out-of-stock";
	reason?: string;
};

export type BaggageSelectionEntry = {
	passengerId: string;
	passengerName: string;
	ssrCode: string;
	baggageName: string;
	category: BaggageCategories;
};

export type UseConfirmationBaggageParams = {
	dispatch: AppDispatch;
	confirmedFlight: ConfirmedFlightPayload | undefined;
	passengerList: Passenger[];
	storedPassengers: PassengerValues[];
	orderedPassengersWithNames: OrderedPassengerWithNames[];
	outboundServicePassengers: ServicePassenger[];
	inboundServicePassengers: ServicePassenger[];
	baggageErrorState: ConfirmationBaggageErrorState;
	setBaggageDialogState: React.Dispatch<React.SetStateAction<ConfirmationBaggageDialogState>>;
	setBaggageErrorState: React.Dispatch<React.SetStateAction<ConfirmationBaggageErrorState>>;
	setIsServiceLoading: React.Dispatch<React.SetStateAction<boolean>>;
	baggageServiceT: BaggageTranslations;
	ancillaryServiceT: AncillaryTranslations;
	returnToTop: () => void;
};

export type BaggageInventoryType =
	(typeof BAGGAGE_INVENTORY_TYPE)[keyof typeof BAGGAGE_INVENTORY_TYPE];

export type ConfirmationDisabledFlagsState = {
	seat: Record<string, string[]>;
	baggage: Record<string, string[]>;
	extras: Record<string, string[]>;
	lounge: Record<string, string[]>;
	transport: Record<string, string[]>;
	priority: Record<string, string[]>;
	meal: string[];
	bundle: Record<string, boolean>;
};
