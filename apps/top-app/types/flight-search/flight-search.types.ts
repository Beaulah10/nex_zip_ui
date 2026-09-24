/**
 * A direct route segment between two airports.
 */
export type Route = {
	/** Origin airport IATA code (e.g. NRT). */
	origin: string;
	/** Destination airport IATA code (e.g. ICN). */
	destination: string;
};

/**
 * Route groups returned by the backend.
 * Each inner array represents a connected journey path.
 */
export type RouteGroups = Route[][];

/**
 * Airport metadata used in location selectors.
 */
export type Airport = {
	/** IATA airport code. */
	iata: string;
	/** City name. */
	city: string;
	/** Airport display name. */
	airport: string;
	/** Country name. */
	country: string;
};

/**
 * Airport metadata shape from localized message files.
 */
export type MessageAirport = {
	/** IATA airport code. */
	iata_code: string;
	/** Airport display name. */
	airport: string;
	/** City name. */
	city: string;
	/** Country name. */
	country: string;
	/** Sort/display order in UI. */
	display_order: number;
};

/**
 * Props for location modal/list menu items.
 */
export type MenuItemProps = {
	/** Callback when a location item is selected. */
	onClick: (value: string) => void;
	/** Currently selected value. */
	value: string;
	/** Item value to render/select. */
	item: string;
	/** Indicates the route involves Tokyo Narita connection. */
	isViaTokyoNarita?: boolean;
};

/**
 * Props used by IATA-based location selectors.
 */
export type IataProps = {
	/** Available IATA options. */
	iata: string[];
	/** Current selected IATA code. */
	value: string;
	/** Active trip mode. */
	tripType: TripType;
	/** Selected origin IATA code. */
	origin: string;
	/** Callback when a new IATA value is selected. */
	onClick: (value: string) => void;
};

/** Supported trip modes in flight search. */
export type TripType = "round-trip" | "one-way" | "connecting-flight";

/**
 * Selected travel dates for outbound and return legs.
 */
export type FlightDates = {
	/** Outbound date (YYYY-MM-DD). */
	outboundDate: string;
	/** Return date (YYYY-MM-DD); blank for one-way. */
	returnDate: string;
};

/** API response payload for route discovery. */
export type FlightSearchResponse = {
	/** Grouped route graph from backend. */
	routeInfo: RouteGroups;
};

/**
 * Passenger counts per age bucket.
 */
export interface PassengerCounts {
	/** Adults aged 15 and above. */
	adult: number;
	/** Children aged 12-14. */
	childA: number;
	/** Children aged 7-11. */
	childB: number;
	/** Children aged 2-6. */
	childC: number;
	/** Infants aged 0-1. */
	infant: number;
}

/**
 * Client form model used by flight search UI and validation.
 */
export type FlightSearchFormValues = {
	/** Selected trip mode. */
	tripType: TripType;
	/** Departure IATA code. */
	origin: string;
	/** Arrival IATA code. */
	destination: string;
	/** Passengers grouped by age bucket. */
	passengerCounts: PassengerCounts;
	/** Outbound/return date selection. */
	travelDates: FlightDates;
	/** Optional promotion code entered by user. */
	promotionCode?: string;
};

/**
 * Props for passenger modal component.
 */
export type PaxModalProps = {
	/** Whether modal is visible. */
	open: boolean;
	/** Current origin airport code. */
	origin: string;
	/** Current destination airport code. */
	destination: string;
	/** Open-state change handler. */
	onOpenChange: (value: boolean) => void;
	/** Current passenger counts. */
	value: PassengerCounts;
	/** Callback when counts are confirmed. */
	onChange: (value: PassengerCounts) => void;
	/** Optional validation errors for display. */
	errors?: Array<{ message?: string }>;
};

/** Mapped API request parameters for the flight search endpoint */
export type FlightSearchApiParams = {
	/** Comma-separated origin-destination codes; e.g. "NRT,ICN" or "BKK,NRT,ICN" */
	routes: string;
	/** Outbound departure date (YYYY-MM-DD) */
	departureDateFrom: string;
	/** Inbound departure date for round trip (YYYY-MM-DD, optional) */
	departureDateTo?: string;
	promocode?: string;
	/** Count of adult passengers */
	adult: string;
	/** Count of 12–14 year passengers (optional) */
	childA?: string;
	/** Count of 7–11 year passengers (optional) */
	childB?: string;
	/** Count of 2–6 year passengers (optional) */
	childC?: string;
	/** Count of 0–1 year passengers (optional) */
	infant?: string;
	language?: string;
	currency?: string;
};

/**
 * Bundles validated form data with mapped backend params.
 */
export type FlightSearchSubmitData = {
	/** Raw UI form values. */
	formData: FlightSearchFormValues;
	/** API-ready query parameters. */
	apiParams: FlightSearchApiParams;
};
