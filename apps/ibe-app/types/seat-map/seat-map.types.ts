/**
 * File: seat-map.types.ts
 * Description: Centralized type definitions for the seat map feature, including cabin layouts,
 * seat metadata, passenger panel data models, bundle mappings, and seat selection UI contracts.
 */

import type { ReactNode } from "react";
import type { BookingFlowDirection } from "@/modules/utils/helpers/common/flow-router/flow-router";
import type { BundleCode, PassengerBundle } from "@/types/passenger/passenger.type";

/* -------------------------------------------------------------------------- */
/*                                Seat Map Types                              */
/* -------------------------------------------------------------------------- */

export type SeatPositionType = "Window" | "Middle" | "Aisle";

export interface RawSeat {
	seat: string;
	type: SeatPositionType;
	isSeatAvailable: boolean;
	amount: number;
	serviceCode: string;
}

export interface TemplateSeat {
	column: string;
	type: SeatPositionType;
}

export interface FixedCabinRow {
	row: number;
	layout: string;
	seats: RawSeat[];
}

export interface TemplateCabinRow {
	rowRange: string;
	layout: string;
	templateSeats: TemplateSeat[];
}

export type CabinRow = FixedCabinRow | TemplateCabinRow;

export interface Cabin {
	name: string;
	class: "ZipFullFlat" | "Standard";
	rows: CabinRow[];
}

export type SeatStatus =
	| "front-tier"
	| "rear-tier"
	| "central"
	| "exit-row"
	| "no-recline"
	| "not-selectable";

export interface ExpandedSeat {
	code: string;
	column: string;
	type: SeatPositionType;
	status: SeatStatus;
	isSeatAvailable: boolean;
	amount: number;
	serviceCode: string;
}

export interface BusinessCabinRowsProps {
	rows: ExpandedRow[];
	/** Maps seatCode → passengerIndex for assigned seats. */
	assignedSeatToPassengerIndex?: Record<string, number>;
	/** Maps seatCode → passenger initials for assigned seats. */
	assignedSeatToPassengerLabel?: Record<string, string>;
	onSelectSeat?: (seat: ExpandedSeat) => void;
}

export interface ExpandedRow {
	row: number;
	layout: string;
	seats: ExpandedSeat[];
}

export interface SeatProps {
	seat: ExpandedSeat;
	selected?: boolean;
	passengerLabel?: string;
	size?: "default" | "large";
	onSelect?: (seat: ExpandedSeat) => void;
}

export interface SeatDemoOverride {
	status?: SeatStatus;
}

export interface CabinAssistanceIconsProps {
	/** Renders the middle accessible + lavatory group between the two end lavatory icons. */
	showAccessibleGroup?: boolean;
}

export interface SeatMapRowProps {
	cabinClass: Cabin["class"];
	row: ExpandedRow;
	/** Maps seatCode → passengerIndex for assigned seats. */
	assignedSeatToPassengerIndex?: Record<string, number>;
	/** Maps seatCode → passenger initials for assigned seats. */
	assignedSeatToPassengerLabel?: Record<string, string>;
	onSelectSeat?: (seat: ExpandedSeat) => void;
}

/* -------------------------------------------------------------------------- */
/*                      Seat Map Passenger Panel Types                        */
/* -------------------------------------------------------------------------- */

/** Props accepted by the useSeatMapPassengerPanel hook. */
export interface UseSeatMapPassengerPanelProps {
	/** Booking flow direction used to resolve the correct flight segment. */
	direction: BookingFlowDirection;
}

/** Data shape returned by useSeatMapPassengerPanel, ready for direct use in SeatMapPassengerPanel. */
export interface SeatMapPassengerPanelUIData {
	/** Route code derived from the confirmed flight, e.g. "NRT-BKK". */
	flightCode: string;

	/** Ordered passenger rows prepared for display in the panel. */
	passengers: PassengerSeatRow[];
}

/** Read-only map from passenger id to the passenger's selected bundle code. */
export type BundleByPassengerId = ReadonlyMap<string, BundleCode>;

export interface PassengerSeatRow {
	name: string;
	seatType?: SeatPositionType;
	seatCode?: string;
	price?: string;
	isSelected?: boolean;
	bundle?: string;
	isInfant?: boolean;
}

export interface AdjacentInfoBannerMessage {
	text: string;
	linkText?: string;
	linkHref?: string;
	linkTarget?: string;
}

export interface SeatMapPassengerPanelProps {
	flightCode: string;
	cabinClass: "Standard" | "ZipFullFlat";
	activePassengerComplimentaryLegendEligible: boolean;
	activePassengerBundleSeatServiceCodes: ReadonlySet<string>;
	activePassengerSelectedSeatServiceCode?: string;
	bundleInfoMessage?: string;
	legendPrices: SeatLegendPrices;
	passengers: PassengerSeatRow[];
	activePassengerIndex?: number;
	onPassengerSelect?: (index: number) => void;
	adjacentInfoBannerMessages?: AdjacentInfoBannerMessage[];
	seatRulesInfoMessages?: string[];
	className?: string;
}

/* -------------------------------------------------------------------------- */
/*                           Seat Map Legend Types                            */
/* -------------------------------------------------------------------------- */

export type LegendItemId =
	| "more-legroom"
	| "front-aisle-window-side"
	| "reclining-not-allowed"
	| "rear-aisle-window-side"
	| "central-seat"
	| "selected"
	| "not-selectable";

export type SeatLegendPrices = Partial<Record<LegendItemId, number>>;

/* -------------------------------------------------------------------------- */
/*                   Seat Selection Availability Types                        */
/* -------------------------------------------------------------------------- */

export type SeatSelectionDialogType =
	| "NO_AVAILABLE_SEATS"
	| "NO_ADJACENT_SEATS"
	| "UNAVAILABLE_SELECTED_SEAT";

/* -------------------------------------------------------------------------- */
/*                           Seat Map Dialog Types                            */
/* -------------------------------------------------------------------------- */

export interface SeatMapDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	direction: BookingFlowDirection;
	stageLabel: string;
	routeLabel: string;
	initialActivePassengerIndex?: number;
	restoreFocusElement?: HTMLElement | null;
}

/* -------------------------------------------------------------------------- */
/*                         Seat Selection Hook Types                          */
/* -------------------------------------------------------------------------- */

export interface SeatAssignment {
	seatCode: string;
	amount: number;
	serviceCode: string;
	seatType?: SeatPositionType;
}

export type Assignments = Map<number, SeatAssignment>;

export interface UseSeatSelectionReturn {
	activePassengerIndex: number;
	assignments: Assignments;
	/** Maps seatCode → passengerIndex (0-based) for all assigned seats. */
	assignedSeatToPassengerIndex: Record<string, number>;
	totalSeatCost: number;
	handleSeatSelect: (seat: ExpandedSeat) => void;
	setActivePassenger: (index: number) => void;
	resetAssignments: () => void;
	setInitialAssignments: (assignments: Assignments) => void;
}

export interface CancelledSeatSelection {
	passengerId: string;
	passengerName: string;
	seatCode: string;
	lfid: number;
	pfid: number;
	isAdjacentSeatRelated?: boolean;
}

export interface SeatMapProps {
	data: Cabin[];
	/** Maps seatCode → passengerIndex (0-based) for all assigned seats. */
	assignedSeatToPassengerIndex?: Record<string, number>;
	/** Maps seatCode → passenger initials for all assigned seats. */
	assignedSeatToPassengerLabel?: Record<string, string>;
	/** Seat code of the currently active passenger's assigned seat. When set, the seat map scrolls it into view. */
	activeSeatCode?: string;
	onSeatSelect?: (seat: ExpandedSeat) => void;
	className?: string;
}

export type SeatSelectionSummaryPassenger = {
	id: string;
	bundleCode: string;
	passengerTypeCode?: string;
};

export type SeatSelectionSummaryAdjacentPassenger = {
	id: string;
	passengerTypeCode?: string;
	mappedAdultId?: string;
	associateWithPassengerId?: string;
};

export type StoredPassengerSeat = {
	lfid: number;
	pfid?: number;
};

export type StoredPassengerSeatState = {
	id: string;
	seats?: StoredPassengerSeat[];
	bundles?: PassengerBundle[];
};

export type SeatSelectionProgressSummary = {
	selectedItemsText?: string;
	freeItemsText?: string;
	entitledSeatCount: number;
	selectedSeatCount: number;
	remainingBundleRequiredSeatCount: number;
	remainingAdjacentRequiredSeatCount: number;
	remainingRequiredSeatCount: number;
};

export type SeatSelectionSummaryLabels = {
	selectedSingle: (count: number) => string;
	selectedMultiple: (count: number) => string;
	requiredSingle: (count: number) => string;
	requiredMultiple: (count: number) => string;
	allSelected: string;
};

export type BundleSeatPrice = {
	originalAmount: number;
	effectiveAmount: number;
	isBundleIncluded: boolean;
};

export interface CabinHeaderProps {
	cabinClass: Cabin["class"];
}

export interface EmergencyExitSupportContentProps {
	routeLabel: string;
	onConfirm: () => void;
	onCancel: () => void;
}

export interface SeatColumnGroupsProps {
	columnGroups: string[][];
	renderCell: (column: string, groupIndex: number) => ReactNode;
	renderSpacer?: (groupIndex: number) => ReactNode;
	className?: string;
}

export type SeatLegendCabin = "Standard" | "ZipFullFlat";

export interface LegendItem {
	id: LegendItemId;
	label: string;
	swatchClassName: string;
	icon?: ReactNode;
	swatchStyle?: React.CSSProperties;
}

export interface SeatCellProps extends PassengerSeatRow {
	isSelectedRow?: boolean;
}
