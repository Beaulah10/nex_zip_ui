import type enMessages from "@/messages/en.json";

export type ValidationLabels = Pick<
	typeof enMessages.flight_search_page.error_titles,
	| "max_passengers_error"
	| "infant_per_adult_error"
	| "child_infant_per_adult_error"
	| "combined_children_per_adult_error"
	| "combined_infant_per_adult_error"
	| "vancouver_route_error"
	| "validation_travel_dates_error"
	| "passenger_error_heading"
	| "origin_required"
	| "destination_required"
	| "promotion_code_max"
	| "promotion_code_pattern"
>;
export type FlightSearchTranslationFn = (key: string) => string;
