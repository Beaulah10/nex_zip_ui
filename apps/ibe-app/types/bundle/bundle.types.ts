import type { NEXUZR004OffersFlightCabinEnum, NormalizedApiError } from "@repo/sdk";
import type { ReactNode, RefObject } from "react";
import type { BUNDLE_ERROR_CONFIG } from "@/modules/utils/constants/bundle/bundle.constants";
import type {
	BookingFlowDirection,
	BookingStageSegment,
} from "@/modules/utils/helpers/common/flow-router/flow-router";

/**
 * Canonical bundle codes returned by bundles API's bundle code.
 */
export type BundleId =
	| "NOBN"
	| "FLBF"
	| "FLBS"
	| "PREM"
	| "PREN"
	| "PRMB"
	| "PRMI"
	| "PRMK"
	| "PRMT"
	| "VALB"
	| "VALI"
	| "VALK"
	| "VALN"
	| "VALT"
	| "VALU";

/**
 * Flight segment payload used in bundle quote requests.
 */
export interface FlightDetails {
	departureDate: string;
	cabin: NEXUZR004OffersFlightCabinEnum;
	lfid: number;
	fareBasisCode?: string;
	fareClass?: string;
}

/**
 * Request shape for bundle offers.
 */
export interface BundleRequest {
	routes: string;
	adult: number;
	childA?: number;
	childB?: number;
	childC?: number;
	infant?: number;
	outbound: FlightDetails[];
	inbound?: FlightDetails[];
}

/**
 * Top-level API request wrapper for retrieving offer bundles.
 */
export interface RetrieveOfferBundlesRequest {
	currency: string;
	nEXUZR004OffersBundleRequest: BundleRequest;
}

/**
 * Selected bundle per passenger key (or null when no selection).
 */
export type BundleSelectionMap = Record<string, BundleId | null>;

/**
 * UI-ready bundle option.
 */
export type BundleOption = {
	id: BundleId;
	name: string;
	description: ReactNode;
	price?: number;
	badge?: string;
};

/**
 * Feature matrix row rendered across bundle columns.
 */
export type FeatureRow = {
	icon: ReactNode;
	label: string;
	values: Partial<Record<BundleId, ReactNode>>;
};

/**
 * Feature category keys used by bundle comparison matrix config.
 */
export type BundleCategory = "noBundle" | "flexBizz" | "premium" | "value";

/**
 * Passenger descriptor used in bundle selection UI.
 */
export type Passenger = { id: string; name: string; icon: ReactNode };

/**
 * Either a selectable passenger row or grouped unavailable passengers row.
 */
export type PassengerEntry =
	| { kind: "passenger"; id: string; name: string; icon: ReactNode }
	| { kind: "unavailable-group"; id: string; passengers: Passenger[]; message: string };

/**
 * Supported bundle-related API/boundary error codes.
 */
export type BundleErrorCode = (typeof BUNDLE_ERROR_CONFIG)[number]["code"];

/**
 * Normalized error shape used across bundle API request lifecycle.
 */
export type BundleApiError = NormalizedApiError;

/**
 * Passenger counts normalized to bundle offers API request fields.
 */
export type PassengerTypeCounts = {
	adult: number;
	childA: number;
	childB: number;
	childC: number;
	infant: number;
};

/**
 * Route params shape for stage-based bundles page.
 */
export type BundleStageRouteParams = {
	locale: string;
	stage: string;
};

/**
 * Next.js page props for stage-based bundles route.
 */
export type BundleStagePageProps = {
	params: Promise<BundleStageRouteParams>;
};

/** Props for the bundle stage heading section. */
export type BundleSectionProps = {
	stage: BookingStageSegment;
};

/** Props for the top-level bundle selection shell. */
export type BundleSelectionProps = {
	locale?: string;
	direction?: BookingFlowDirection;
	stage?: BookingStageSegment;
};

/** Props for the bundle package selection page body. */
export type BundlePackageSelectionProps = {
	locale?: string;
	direction?: BookingFlowDirection;
	isICNRoute?: boolean;
	onProceed?: (selections: { outbound: BundleSelectionMap; inbound: BundleSelectionMap }) => void;
};

/** Args for the bundle package selection hook. */
export type UseBundlePackageSelectionArgs = {
	locale?: string;
	direction: BookingFlowDirection;
	isICNRoute?: boolean;
	onProceed?: (selections: { outbound: BundleSelectionMap; inbound: BundleSelectionMap }) => void;
};

/** Pending confirmation change state for bundle package selection. */
export type PendingConfirmationChange =
	| {
			kind: "selection";
			nextSelection: BundleSelectionMap;
	  }
	| {
			kind: "flex-biz";
			id?: string;
			applyToAll: boolean;
	  };

/** Labels used by confirmation bundle dialogs. */
export type BundleDialogLabels = {
	title: string;
	content: string;
	buttonLabel: string;
};

/** Props for bundle availability and deadline alerts. */
export type BundlePackageSelectionAlertsProps = {
	allBundlesUnavailable: boolean;
	isBundlePurchaseDeadlineExceeded: boolean;
	stageLabel: string;
	bundleDeadlineHours: number;
	unavailableBundleIds: BundleId[];
	showOutOfStockAlert: boolean;
	bundles: BundleOption[];
	hasSelectionInteraction: boolean;
	limitedBundleIds: BundleId[];
	applyToAll: boolean;
	topValidationMessage: string | null;
	validationAttempt: number;
};

/** Props for bundle offer overview panel. */
export type BundleOfferOverviewProps = {
	bundles: BundleOption[];
	hasFlexBizData: boolean;
	isICNRoute: boolean;
	isYvrRoute: boolean;
	showEligibilityBanner: boolean;
	onFlexBizRequest: () => void;
	onFlexBizOpen: () => void;
	flexBizDialogOpen: boolean;
	onFlexBizDialogOpenChange: (open: boolean) => void;
};

/** Props for passenger bundle selection footer. */
export type BookingFooterProps = {
	totalAmount: number;
	onProceed: () => void;
};

/** Props for bundle comparison matrix. */
export type BundleComparisonTableProps = {
	bundles: BundleOption[];
	features: FeatureRow[];
};

/** Props for bundle price cards. */
export type BundlePriceCardsProps = {
	bundles: BundleOption[];
	hasFlexBizData: boolean;
	onFlexBizRequest: () => void;
	triggerRef?: RefObject<HTMLButtonElement | null>;
};

/** Props for ticket change option dialog. */
export type TicketChangeOptionDialogProps = {
	open?: boolean;
	onOpenChange?: (open: boolean) => void;
	onConfirm?: () => void;
	onRequest?: () => void;
	triggerRef?: RefObject<HTMLButtonElement | null>;
};

/** Props for route availability banner. */
export type UnavailableAlertProps = {
	isYvrRoute: boolean;
};

/** Props for passenger bundle selection section. */
export type PassengerBundleSelectionProps = {
	stageLabel: string;
	passengers: PassengerEntry[];
	bundles: BundleOption[];
	applyToAll: boolean;
	onApplyToAllChange: (value: boolean) => void;
	onApplyBundleToAllChange?: (value: BundleId, bundleCapacity: number | null) => void;
	selection: BundleSelectionMap;
	onSelectionChange: (id: string, value: BundleId) => void;
	onFlexBizRequest?: (id?: string) => void;
	onLimitedBundleAttempt: (bundleId: BundleId) => void;
	limitedCollapsedBundleIds: BundleId[];
	isBundleDisabled?: (bundleId: BundleId) => boolean;
	bundleCapacities?: Map<BundleId, number> | null;
	validationMessage?: string | null;
	invalidPassengerIds?: Set<string>;
	purchaseDeadlineExceeded?: boolean;
	onProceed: () => void;
};

/** Props for passenger bundle table footer. */
export type PassengerBundleTableProps = {
	title: string;
	passengers: PassengerEntry[];
	bundles: BundleOption[];
	applyToAll: boolean;
	onApplyToAllChange: (value: boolean) => void;
	onApplyBundleToAllChange?: (value: BundleId, bundleCapacity: number | null) => void;
	selection: BundleSelectionMap;
	onSelectionChange: (id: string, value: BundleId) => void;
	onFlexBizRequest?: (id?: string) => void;
	onLimitedBundleAttempt: (bundleId: BundleId) => void;
	limitedCollapsedBundleIds: BundleId[];
	isBundleDisabled: (bundleId: BundleId) => boolean;
	bundleCapacities: Map<BundleId, number> | null;
	validationMessage?: string | null;
	invalidPassengerIds?: Set<string>;
	purchaseDeadlineExceeded: boolean;
};

/** Props for desktop passenger bundle table. */
export type PassengerBundleTableDesktopProps = {
	isCollapsed: boolean;
	firstEntryUnavailable: boolean;
	isCollapsedInvalid: boolean;
	firstPassengerName?: string;
	totalPassengerCount: number;
	passengers: PassengerEntry[];
	bundles: BundleOption[];
	allValue: BundleId | null;
	isBundleDisabled: (bundleId: BundleId) => boolean;
	bundleCapacities: Map<BundleId, number> | null;
	onApplyBundleToAllChange?: (value: BundleId, bundleCapacity: number | null) => void;
	onSelectionChange: (id: string, value: BundleId) => void;
	onFlexBizRequest?: (id?: string) => void;
	onLimitedBundleAttempt: (bundleId: BundleId) => void;
	limitedCollapsedBundleIds: BundleId[];
	isCollapsedBundleLimited: (bundleId: BundleId) => boolean;
	invalidPassengerIds?: Set<string>;
	selection: BundleSelectionMap;
	isPassengerBundleDisabled: (bundleId: BundleId, passengerId: string) => boolean;
	selectedBundleIds: Set<BundleId>;
};

/** Props for mobile passenger bundle table. */
export type PassengerBundleTableMobileProps = {
	isCollapsed: boolean;
	firstEntryUnavailable: boolean;
	isCollapsedInvalid: boolean;
	firstPassengerName?: string;
	totalPassengerCount: number;
	passengers: PassengerEntry[];
	bundles: BundleOption[];
	allValue: BundleId | null;
	isBundleDisabled: (bundleId: BundleId) => boolean;
	bundleCapacities: Map<BundleId, number> | null;
	onApplyBundleToAllChange?: (value: BundleId, bundleCapacity: number | null) => void;
	onSelectionChange: (id: string, value: BundleId) => void;
	onFlexBizRequest?: (id?: string) => void;
	onLimitedBundleAttempt: (bundleId: BundleId) => void;
	limitedCollapsedBundleIds: BundleId[];
	isCollapsedBundleLimited: (bundleId: BundleId) => boolean;
	invalidPassengerIds?: Set<string>;
	selection: BundleSelectionMap;
	isPassengerBundleDisabled: (bundleId: BundleId, passengerId: string) => boolean;
	mobileCollapsedHeaderClass: string;
	selectedBundleIds: Set<BundleId>;
};

/** Props for passenger cell rendering. */
export type PassengerCellProps = {
	passenger: Passenger;
	invalid?: boolean;
};

/** Props for bundle radio cell rendering. */
export type BundleRadioCellProps = {
	bundle: BundleOption;
	selected: BundleId | null;
	onSelect: (value: BundleId) => void;
	disabled?: boolean;
	invalid?: boolean;
	sizeClass?: string;
	columnHighlighted?: boolean;
};
