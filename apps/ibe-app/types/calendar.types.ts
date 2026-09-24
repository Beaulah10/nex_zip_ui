/**
 * Props for the CalendarContent component.
 * Manages date selection modal content wrapped in Dialog component.
 */
export interface CalendarContentProps {
	/** Dialog open state (controlled by Dialog component) */
	open: boolean;
	/** Called when Dialog open state changes */
	onOpenChange: (open: boolean) => void;
	/** Callback when dates are confirmed. Includes the seat type selected at confirmation time. */
	onConfirm: (departure: Date, returnDate: Date | null, seatType: SeatType) => void;
	/** Callback when selection is reset */
	onReset?: () => void;
	/** Trip type: round-trip or one-way */
	tripType: "round-trip" | "one-way";
	/** Current origin airport code from live form state */
	origin?: string;
	/** Current destination airport code from live form state */
	destination?: string;
	/** Current promotion code from live form state */
	promotionCode?: string;
	/** Initial departure date */
	initialDeparture?: Date | null;
	/** Initial return date */
	initialReturn?: Date | null;
	/** Passenger type for special handling (e.g., child restrictions) */
	passengerType?: "adult" | "child";
	/** Initial seat type to set in the calendar (used to reset to standard after dates are cleared) */
	initialSeatType?: SeatType;
}

export interface CalendarMonthProps {
	year: number;
	month: number;
	departure: Date | null;
	returnDate: Date | null;
	hovered: Date | null;
	minDate: Date;
	maxDate: Date;
	prices?: Record<string, string>;
	/** Optional map of 'YYYY-MM-DD' → promo price string. Dates present here will
	 * show the original price struck-through and the promo price highlighted. */
	promoPrices?: Record<string, string>;
	showMonthTitle?: boolean;
	onSelect: (date: Date) => void;
	onHover: (date: Date | null) => void;
	oneWay?: boolean;
	/** When true, disables dates before and including the departure date for return date selection */
	isSelectingReturn?: boolean;
	/** When true, show loading skeletons instead of X placeholders */
	isLoading?: boolean;
	/** Current seat type for tooltip display */
	seatType?: "standard" | "zip";
	/** Raw fare data for tooltip generation */
	fareData?: Record<string, { standard?: number; zipFullFlat?: number }>;
	/** Currency symbol for tooltip (e.g., '¥') */
	currencySymbol?: string;
}

export interface DateSelectionModalProps {
	isOpen: boolean;
	onClose: () => void;
	onConfirm: (departure: Date, returnDate: Date) => void;
	/** Called when reset is triggered */
	onReset?: () => void;
	minDate?: Date;
	maxDate?: Date;
	initialDeparture?: Date | null;
	initialReturn?: Date | null;
	/** Initial seat type to restore when the modal reopens after a reset */
	initialSeatType?: SeatType;
	/** Map of "YYYY-MM-DD" → price string for outbound leg */
	outboundPrices?: Record<string, string>;
	/** Optional map of "YYYY-MM-DD" → promotional price for outbound leg */
	outboundPromoPrices?: Record<string, string>;
	/** Map of "YYYY-MM-DD" → price string for inbound leg */
	inboundPrices?: Record<string, string>;
	/** Optional map of "YYYY-MM-DD" → promotional price for inbound leg */
	inboundPromoPrices?: Record<string, string>;
	/** When true, only a single outbound date is selected (no return) */
	oneWay?: boolean;
	/** Called on confirm in one-way mode instead of onConfirm */
	onConfirmOneWay?: (outboundDate: Date) => void;
	/** Passenger type — 'child' disables ZIP Full-Flat on desktop and shows an alert */
	passengerType?: "adult" | "child";
	/** Optional callback when visible month changes (for lazy loading) */
	onVisibleMonthChange?: (visibleMonth: Date, secondVisibleMonth: Date) => void;
	/** Optional callback when seat type changes (standard or zip) */
	onSeatTypeChange?: (seatType: "standard" | "zip") => void;
	/** When true, show loading skeletons instead of X placeholders */
	isLoading?: boolean;
	/** Raw fare data for outbound leg (for tooltip generation) */
	outboundFareData?: Record<string, { standard?: number; zipFullFlat?: number }>;
	/** Raw fare data for inbound leg (for tooltip generation) */
	inboundFareData?: Record<string, { standard?: number; zipFullFlat?: number }>;
	/** Currency symbol for tooltip display (e.g., '¥') */
	currencySymbol?: string;
}

export interface CalendarLegendModalProps {
	isOpen: boolean;
	onClose: () => void;
	triggerRef: { current: { current: HTMLButtonElement | null } };
	/** Optional map of promotional prices. If provided, the promo legend item is displayed. */
	promoPrices?: Record<string, string>;
}

export type SeatType = "standard" | "zip";
export type LegendVariant = "available" | "promo" | "alt-seat" | "unavailable" | "past";

export interface LegendItem {
	variant: LegendVariant;
	description: string;
}

export type FareDateEntry = {
	date: string;
	baseFareForPromotion?: number;
	lowestPrice: number;
};

export type BoundFareData = {
	cabin: string;
	dates: FareDateEntry[];
};

export type CalendarFaresServiceResponse = {
	data: {
		outbound: BoundFareData[];
		inbound?: BoundFareData[];
	};
};
