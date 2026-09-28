import enMessages from "@/messages/en.json";
import type { FlightSearchTranslationFn, ValidationLabels } from "./types";

export const defaultValidationLabels: ValidationLabels = enMessages.flight_search_page.error_titles;

/**
 * Resolves validation labels from a translation function when available,
 * otherwise falls back to the default English labels.
 */
export function resolveValidationLabels(t?: FlightSearchTranslationFn): ValidationLabels {
	if (!t) {
		return defaultValidationLabels;
	}

	return {
		max_passengers_error: t("error_titles.max_passengers_error"),
		infant_per_adult_error: t("error_titles.infant_per_adult_error"),
		child_infant_per_adult_error: t("error_titles.child_infant_per_adult_error"),
		combined_children_per_adult_error: t("error_titles.combined_children_per_adult_error"),
		combined_infant_per_adult_error: t("error_titles.combined_infant_per_adult_error"),
		vancouver_route_error: t("error_titles.vancouver_route_error"),
		validation_travel_dates_error: t("error_titles.validation_travel_dates_error"),
		passenger_error_heading: t("error_titles.passenger_error_heading"),
		origin_required: t("error_titles.origin_required"),
		destination_required: t("error_titles.destination_required"),
		promotion_code_max: t("error_titles.promotion_code_max"),
		promotion_code_pattern: t("error_titles.promotion_code_pattern"),
	};
}
