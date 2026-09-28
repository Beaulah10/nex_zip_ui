import type { ImageProps, StaticImageData } from "next/image";
import type * as React from "react";
import type { FlightSelectionAssets } from "@/modules/utils/helpers/flight-selection/flight-selection-assets";
import type { SeatType } from "@/types/calendar.types";

/**
 * flight-selection.types.ts
 *
 * Contains request and response types for the flight selection API.
 * Supports one-way and round-trip responses with direct or connecting flight segments.
 */

export interface FlightSelectionProps {
	locale: string;
	flightSelectionAssets?: FlightSelectionAssets;
}

export interface FlightInfoProps extends React.HTMLAttributes<HTMLDivElement> {
	/** Departure time string, e.g. "16:25" */
	departureTime: string;
	/** Departure city/airport label, e.g. "Tokyo (Narita)" */
	departureCity: string;
	/** Arrival time string, e.g. "9:40" */
	arrivalTime: string;
	/** Arrival city/airport label, e.g. "San Jose" */
	arrivalCity: string;
	/** IATA flight number, e.g. "ZG002" */
	flightNumber: string;
	/** Flight duration label, e.g. "10H15M" */
	duration: string;
	/**
	 * Number of days added to arrival relative to departure.
	 * When set, renders "+N" superscript next to arrival time.
	 */
	previousDayIndicator?: boolean;
	nextDayIndicator?: boolean;
}

export interface FlightCardListProps {
	flights: FlightDisplayItem[];
	selectedCabins: Record<string, string | null>;
	onCabinSelect: (flightId: string, cabin: string) => void;
	standardCabinImage: ImageProps["src"];
	zipFullFlatImage: ImageProps["src"];
	standardDesktopImage: ImageProps["src"];
	zipfullflatDesktopImage: ImageProps["src"];
	hasMultipleConnectingFlights: boolean;
	connectingFlightErrors: ConnectingFlightError[];
	disableCabinSelection?: boolean;
}

export interface FlightInfoProps extends React.HTMLAttributes<HTMLDivElement> {
	/** Departure time string, e.g. "16:25" */
	departureTime: string;
	/** Departure city/airport label, e.g. "Tokyo (Narita)" */
	departureCity: string;
	/** Arrival time string, e.g. "9:40" */
	arrivalTime: string;
	/** Arrival city/airport label, e.g. "San Jose" */
	arrivalCity: string;
	/** IATA flight number, e.g. "ZG002" */
	flightNumber: string;
	/** Flight duration label, e.g. "10H15M" */
	duration: string;
	/**
	 * Number of days added to arrival relative to departure.
	 * When set, renders "+N" superscript next to arrival time.
	 */
	previousDayIndicator?: boolean;
	nextDayIndicator?: boolean;
}

export interface EmergencySupportDialogProps {
	open: boolean;
	onClose: () => void;
	onAgree: () => void;
}

export interface CabinTypeLegendProps extends React.HTMLAttributes<HTMLDivElement> {
	/** List of cabin types to display */
	cabinTypes: CabinTypeItem[];
	/** Text before the link, e.g. "More information on" */
	infoText?: string;
	/** Clickable link text, e.g. "Standard & ZIP Full-Flat" */
	infoLinkText?: string;
	/** href for the info link */
	infoLinkHref?: string;
	/** Called when the info link is clicked */
	onInfoLinkClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
}

export interface SeatTypeSelectorProps {
	seatType: SeatType;
	onChange: (seatType: SeatType) => void;
	isChild: boolean;
	variant: "desktop" | "mobile";
}

export interface DateTabNavigationProps {
	oneWay: boolean;
	activeTab: "outbound" | "inbound";
	outboundDate: Date | null;
	inboundDate: Date | null;
	onTabChange: (tab: "outbound" | "inbound") => void;
	tabListClassName?: string;
}

export interface CabinCardProps extends React.HTMLAttributes<HTMLDivElement> {
	/** Display name for the cabin class e.g. "Standard", "Business" */
	cabinType: string;
	/** Mobile-specific cabin image (shown below md breakpoint) */
	mobileImage: ImageProps["src"];
	/** Desktop-specific cabin image (shown at md breakpoint and above) */
	desktopImage: ImageProps["src"];
	/**
	 * Passenger prices.
	 * Adult-only (no extras) → compact stacked layout.
	 * With extras        → full price-list layout.
	 */
	prices?: CabinPrices;
	/** Number of seats remaining — omits badge when undefined */
	seatsLeft?: number;
	/** Highlights the top border in brand green when true */
	selected?: boolean;
	/** Prevents cabin selection and swaps price content for the disabled message */
	isDisabled?: boolean;
	/** Message shown when the cabin is disabled */
	disabledMessage?: string;
}

export interface AirCalendarTabsProps {
	tabs: AirCalendarTab[];
	/** Controlled selected value */
	value?: string;
	/** Uncontrolled default selected value */
	defaultValue?: string;
	onValueChange?: (value: string) => void;
	/** Optional TabsContent children keyed by tab value */
	children?: React.ReactNode;
	className?: string;
}

export interface BoundDisplayProps {
	title: string;
	tabs: AirCalendarTab[];
	selectedDate: string;
	onDateChange: (date: string) => void;
	flights: FlightDisplayItem[];
	selectedCabins: FlightCabinState;
	onCabinSelect: (flightId: string, cabin: string) => void;
	standardCabinImage: StaticImageData;
	zipFullFlatImage: StaticImageData;
	standardDesktopImage: StaticImageData;
	zipfullflatDesktopImage: StaticImageData;
	isConnectingFlightBound?: boolean;
	connectingFlightErrors?: ConnectingFlightError[];
	disableCabinSelection?: boolean;
	showError?: boolean;
}

export type PassengerType = "adult" | "childA" | "childB" | "childC" | "infant";

export type FlightSelectionRequest = {
	routes: string;
	departureDateFrom: string;
	departureDateTo?: string;
	adult: number;
	childA?: number;
	childB?: number;
	childC?: number;
	infant?: number;
};

export type AirCalendarFare = {
	date: string;
	baseFareAmount: number;
	totalFareAmount: number;
};

export type PassengerWiseFare = {
	passengerType: PassengerType | string;
	count: number;
	amount: number;
};

export type PassengerWiseTax = {
	passengerType: PassengerType | string;
	count: number;
	amount: number;
};

export type TaxBreakDown = {
	taxCode: string;
	description: string;
	taxAmount: number;
	passengerWiseTaxes: PassengerWiseTax[];
};

export type BoundSummary = {
	totalFlightAmount: number;
	promotionalAmount: number;
	passengerWiseFares: PassengerWiseFare[];
	totalTaxAmount: number;
	taxBreakDown: TaxBreakDown[];
};

export type FareTax = {
	id: number;
	amount: number;
	taxCode: string;
	taxDesc: string;
};

export type FareDetail = {
	fareId: number;
	fareClass: string;
	fareBasisCode: string;
	passengerType: PassengerType | string;
	availableSeat: number;
	baseFareAmt: number;
	fareAmt: number;
	baseFareAmtInclTax: number;
	fareAmtInclTax: number;
	ptcTotalFare?: number;
	taxes: FareTax[];
};

export type FareInfo = {
	cabin: string;
	boundSummary: BoundSummary;
	fareDetails: FareDetail[];
};

export type ScheduledDepartureArrivalDateTime = {
	departureDateTime: string;
	departureDateTimeOffset: string;
	arrivalDateTime: string;
	arrivalDateTimeOffset: string;
};

export type FlightSelectionApiSegment = {
	previousDayIndicator: boolean;
	nextDayIndicator: boolean;
	carrierCode: string;
	origin: string;
	destination: string;
	scheduledDepartureArrivalDateTime: ScheduledDepartureArrivalDateTime;
	flightTime: string;
	flightNumber: string;
	pfid: number;
	lfid: number;
	fareInfos: FareInfo[];
};

export type FlightSelectionApiFlight = {
	transitTime: string;
	overallFlightTime: string;
	segments: FlightSelectionApiSegment[];
};

export type FlightsByDate = {
	date: string;
	flights: FlightSelectionApiFlight[];
};

export type FlightSelectionBound = {
	airCalendarFare: AirCalendarFare[];
	flightsByDate: FlightsByDate[];
};

export type FlightSelectionApiResponse = {
	data: {
		outbound: FlightSelectionBound;
		inbound?: FlightSelectionBound;
	};
};

export interface AirCalendarTab {
	value: string;
	date: string;
	price: string;
	disabled?: boolean;
}

export interface PaxPriceRow {
	label: string;
	price: string;
}

export interface CabinPrices {
	adult: string;
	extras?: PaxPriceRow[];
}

export type FlightCabinState = Record<string, string | null>;

export interface ConnectingFlightError {
	groupId: string;
	message: string;
}

export interface FlightFare {
	passengerType: string;
	count: number;
	passengerCount: number;
	baseFareAmtInclTax?: number;
	fareAmtInclTax: number;
	ptcTotalFare?: number;
	amount: number;
	availableSeat?: number;
}

export interface SegmentCabinFares {
	standard?: FlightFare[];
	zipFullFlat?: FlightFare[];
}

export interface FlightdetailsSegment {
	carrierCode: string;
	origin: string;
	destination: string;
	flightTime: string;
	flightNumber: string;
	scheduledDepartureArrivalDateTime: {
		departureDateTime: string;
		arrivalDateTime: string;
	};
	previousDayIndicator: boolean;
	nextDayIndicator: boolean;
}

export interface Flightdetails {
	carrierCode: string;
	origin: string;
	destination: string;
	flightTime?: string;
	transitTime: string;
	overallFlightTime: string;
	flightNumber: string;
	scheduledDepartureArrivalDateTime: {
		departureDateTime: string;
		arrivalDateTime: string;
	};
	segments: FlightdetailsSegment[];
	isConnectingFlight: boolean;
	cabinFares: Array<{ cabin: string; fares: FlightFare[] }>;
	fares: FlightFare[];
	segmentFaresList: SegmentCabinFares[];
	standardSeatsLeft?: number;
	zipSeatsLeft?: number;
	standardSeatsLeftBySegment?: Array<number | undefined>;
	zipSeatsLeftBySegment?: Array<number | undefined>;
}

export interface FlightDisplaySegment {
	departureTime: string;
	departureCity: string;
	arrivalTime: string;
	arrivalCity: string;
	flightNumber: string;
	duration: string;
	previousDayIndicator?: boolean;
	nextDayIndicator?: boolean;
}

export interface FlightDisplayFare {
	passengerType: string;
}

export interface FlightDisplayItem {
	id: string;
	departureTime: string;
	departureCity: string;
	arrivalTime: string;
	arrivalCity: string;
	flightNumber: string;
	duration: string;
	dayOffset?: number;
	previousDayIndicator?: boolean;
	nextDayIndicator?: boolean;
	standardPrices: CabinPrices | undefined;
	zipPrices: CabinPrices | undefined;
	zipSeatsLeft?: number;
	standardSeatsLeft?: number;
	standardSeatsLeftBySegment?: Array<number | undefined>;
	zipSeatsLeftBySegment?: Array<number | undefined>;
	isConnectingFlight?: boolean;
	transitTime?: string;
	overallFlightTime: string;
	segments: FlightDisplaySegment[];
	fares: FlightDisplayFare[];
	segmentFaresList?: SegmentCabinFares[];
	hasZipFullFlat?: boolean;
	hasStandardCabin?: boolean;
	isZipDisabled?: boolean;
}
export interface CabinTypeItem {
	/** Display label for the cabin, e.g. "Standard", "ZIP Full-Flat" */
	label: string;

	icon?: string;
}
