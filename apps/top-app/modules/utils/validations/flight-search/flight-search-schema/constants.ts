import { defaultValidationLabels } from "./labels";

/** Maximum passengers allowed in a single booking. */
export const MAX_PASSENGERS_ERROR = defaultValidationLabels.max_passengers_error;
/** Infants (0-1 years) must not exceed the number of adults. */
export const INFANT_PER_ADULT_ERROR = defaultValidationLabels.infant_per_adult_error;
/** Children aged 2-6 and infants must comply with adult companion ratios. */
export const CHILD_INFANT_PER_ADULT_ERROR = defaultValidationLabels.child_infant_per_adult_error;
/** Combined companion limit for children aged 0-6 per adult. */
export const COMBINED_CHILDREN_PER_ADULT_ERROR =
	defaultValidationLabels.combined_children_per_adult_error;
/** Combined companion limit for infants aged 0-1 per adult. */
export const COMBINED_INFANT_PER_ADULT_ERROR =
	defaultValidationLabels.combined_infant_per_adult_error;
/** Route-specific ratio rule for Vancouver routes. */
export const VANCOUVER_ROUTE_ERROR = defaultValidationLabels.vancouver_route_error;
/** Generic travel date validation message. */
export const TRAVEL_DATES_ERROR = defaultValidationLabels.validation_travel_dates_error;
