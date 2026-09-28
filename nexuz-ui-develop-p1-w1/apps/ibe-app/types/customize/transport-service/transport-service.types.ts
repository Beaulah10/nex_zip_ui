import type { StaticImageData } from "next/image";
import type { useTranslations } from "next-intl";
import type { ReactElement, ReactNode, RefObject } from "react";
import type { selectCustomersListItem } from "@/components/common/select-customers/select-customers";
import type { BookingFlowDirection } from "@/modules/utils/helpers/common/flow-router/flow-router";
import type { PassengerValues } from "@/types/passenger/passenger.type";

/**
 * Maps transport service card duration/trip labels to their corresponding prices.
 */
export interface TransportServiceCardPricingRowData {
	label: string;
	prices: number[];
}

/**
 * Supported service ids used by the UI and persisted in state.
 */
export type TransportServiceId =
	| "shuttle-one-way"
	| "shuttle-round-trip"
	| "trolley-7-days"
	| "trolley-4-days"
	| "trolley-1-day";

/**
 * SSR codes that map to transportation products in ancillary offers.
 */
export type TransportServiceSsrCode = "TXIA" | "TXIB" | "TRLA" | "TRLB" | "TRLC";

/**
 * Service row metadata displayed in each transport service card.
 */
export interface TransportServiceVisualService {
	id: TransportServiceId;
	label: string;
	imageSrc: StaticImageData;
}

/**
 * UI model for each transport activity section.
 */
export interface TransportServiceItem {
	imageSrc: StaticImageData;
	mobileImageSrc?: StaticImageData;
	desktopImageSrc?: StaticImageData;
	imageClassName?: string;
	mobileImageClassName?: string;
	desktopImageClassName?: string;
	title: string;
	moreInfoHref?: string;
	description: string;
	ageGroupLabels: string[];
	durationLabel?: string;
	pricingRows: TransportServiceCardPricingRowData[];
	footnote?: string;
	services: TransportServiceVisualService[];
}

/**
 * Flattened selected service information used by details panel.
 */
export interface SelectedTransportService {
	id: TransportServiceId;
	label: string;
	activityImage: StaticImageData;
	activityDesktopImage?: StaticImageData;
	activityDescription: string;
}

/**
 * Ancillary transportation selector return type.
 */
export type TransportationOffersData = ReturnType<
	typeof import("@/store/slices/common/ancillary-offers/ancillary-offers").selectAncillaryOffersDataByDirectionAndServiceCategory
>;

/**
 * Props for the transport service selection dialog component.
 * Includes dialog state, navigation handlers, selected service details,
 * pricing information, and the content rendered inside the dialog.
 */
export interface TransportServiceDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	routeLabel: string;
	selectedTransportServiceId: string | null;
	totalAmount: number;
	onBack: () => void;
	onConfirm: () => void;
	children: ReactNode;
	stageLabel: string;
	hasOutOfStockPassengers: boolean;
	triggerRef: RefObject<HTMLButtonElement | null>;
}

/**
 * Props for the transport service selection component.
 * Controls dialog visibility, route context, ancillary scope,
 * and stage information used to render the transport service flow.
 */
export interface TransportServiceProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	direction: BookingFlowDirection;
	routeLabel: string;
	highlightedPassengerId?: string;
	origin?: string;
	destination?: string;
	stageLabel: string;
	triggerRef: RefObject<HTMLButtonElement | null>;
}

/**
 * Params for the useTransportServicePassengers hook.
 */
export interface UseTransportServicePassengersParams {
	transportationData: TransportationOffersData;
	selectedPassengers: PassengerValues[];
	selectedTransportServiceId: TransportServiceId | null;
	selectedServiceStockLimit: number | null;
	getPassengerAmount: (passengerTypeCode?: string) => number;
	transportServiceLabels: ReturnType<typeof useTranslations>;
	open: boolean;
	lfidBySsrCode: Map<string, number>;
	setPricingTransportServiceId: (id: TransportServiceId | null) => void;
}

/**
 * Params for the useTransportServicePersistence hook.
 */
export interface UseTransportServicePersistenceParams {
	selectedTransportServiceId: TransportServiceId | null;
	transportServicePax: selectCustomersListItem[];
	transportationData: TransportationOffersData;
}

/**
 * Params for the useTransportServicePricing hook.
 */
export interface UseTransportServicePricingParams {
	transportationData: TransportationOffersData;
	selectedPassengers: PassengerValues[];
	currentLfid?: number;
}

/**
 * Params for the useTransportServiceSelection hook.
 */
export interface UseTransportServiceSelectionParams {
	transportationData: TransportationOffersData;
	transportServices: TransportServiceItem[];
	lfidBySsrCode: Map<string, number>;
	selectedPassengers: PassengerValues[];
	transportServiceLabels: ReturnType<typeof useTranslations>;
	setPricingTransportServiceId: (id: TransportServiceId | null) => void;
	trolleyDesktopImage?: StaticImageData;
}

/**
 * Represents the availability of supported transportation services
 * for the current route based on ancillary offer data.
 */
export interface TransportServiceAvailability {
	hasOneWay: boolean;
	hasRoundTrip: boolean;
	hasTRLA: boolean;
	hasTRLB: boolean;
	hasTRLC: boolean;
	hasAnySupportedTransportSsr: boolean;
}

/**
 * Represents a selectable transport service option displayed within a
 * transport service card.
 */
export interface TransportServiceCardServiceRow {
	/** e.g. "Trolley Services (7 days)" */
	label: string;
	selected?: boolean;
	disabled?: boolean;
	disabledReason?: string;
	onAdd?: () => void;
	/** A fully-configured selection dialog element (e.g. `<TransportServiceSelectionDialog />`), rendered with the Add button as its trigger. */
	dialog?: ReactElement<{ trigger?: ReactNode }>;
}

/** Pricing row used by the transport service pricing table. */
export type TransportServiceCardPricingRow = TransportServiceCardPricingRowData;

/**
 * Props for rendering a transport service card, including
 * service information, pricing details, and selectable options.
 */
export interface TransportServiceCardProps {
	imageSrc: StaticImageData;
	mobileImageSrc?: StaticImageData;
	desktopImageSrc?: StaticImageData;
	imageAlt?: string;
	imageClassName?: string;
	mobileImageClassName?: string;
	desktopImageClassName?: string;
	title: string;
	moreInfoHref?: string;
	onMoreInfoClick?: () => void;
	description: string;
	/** Column headers shown after `durationLabel`, e.g. ["12 years and Older", "2 - 11 years old"]. */
	ageGroupLabels: string[];
	/** Header label for the pricing table's leading column, e.g. "Duration" or "Trip type". */
	durationLabel?: string;
	pricingRows: TransportServiceCardPricingRow[];
	/** e.g. "*Free for children under 1 year old" */
	footnote?: string;
	services: TransportServiceCardServiceRow[];
	className?: string;
}

/**
 * Props for the TotalAmountDisplay component.
 */
export interface TotalAmountDisplayProps {
	amount: number;
	label?: string;
	amountClassName?: string;
	labelClassName?: string;
}
