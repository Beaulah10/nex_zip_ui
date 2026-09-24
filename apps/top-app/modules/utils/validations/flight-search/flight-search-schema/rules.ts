import type {
	FlightSearchFormValues,
	PassengerCounts,
} from "@/types/flight-search/flight-search.types";
import { resolveValidationLabels } from "./labels";
import type { FlightSearchTranslationFn, ValidationLabels } from "./types";

/**
 * Returns whether required date fields are missing for the selected trip type.
 */
export function hasMissingTravelDates(
	input: Pick<FlightSearchFormValues, "tripType" | "travelDates">
): boolean {
	const { tripType, travelDates } = input;
	const hasOutboundDate = travelDates.outboundDate.trim().length > 0;

	if (tripType === "round-trip") {
		const hasReturnDate = travelDates.returnDate.trim().length > 0;
		return !hasOutboundDate || !hasReturnDate;
	}

	return !hasOutboundDate;
}

/** Returns the total number of passengers across all age groups. */
function getPassengerTotal(counts: PassengerCounts): number {
	return Object.values(counts).reduce((total, count) => total + count, 0);
}

/** Returns true when either origin or destination is Vancouver (YVR). */
function isVancouverRoute(origin: string, destination: string): boolean {
	return origin === "YVR" || destination === "YVR";
}

/**
 * Builds passenger validation messages from route and ratio rules.
 */
export function getPassengerValidationMessages(
	input: Pick<FlightSearchFormValues, "origin" | "destination" | "passengerCounts">,
	labels: ValidationLabels
): string[] {
	const { origin, destination, passengerCounts } = input;
	const { adult, childA, childB, childC, infant } = passengerCounts;
	const messages: string[] = [];
	const hasMaxPassengersViolation = getPassengerTotal(passengerCounts) > 9;

	if (hasMaxPassengersViolation) {
		messages.push(labels.max_passengers_error);
	}

	if (isVancouverRoute(origin, destination)) {
		const childAndInfantCount = childA + childB + childC + infant;
		const hasInfantViolation = infant > adult;

		if (hasInfantViolation) {
			messages.push(labels.infant_per_adult_error);
		}

		if (childAndInfantCount > adult * 2) {
			messages.push(labels.vancouver_route_error);
		}

		return messages;
	}

	const hasInfantViolation = infant > adult;
	const hasChildCompanionViolation = childC + infant > adult * 2;

	if (hasMaxPassengersViolation && hasInfantViolation && hasChildCompanionViolation && childC > 0) {
		messages.push(labels.combined_children_per_adult_error, labels.combined_infant_per_adult_error);
		return messages;
	}

	if (hasChildCompanionViolation && childC > 0) {
		messages.push(labels.child_infant_per_adult_error);
		return messages;
	}

	if (hasInfantViolation) {
		messages.push(labels.infant_per_adult_error);
	}

	return messages;
}

/**
 * Returns passenger validation messages for inline field-level display.
 */
export function getFlightSearchPassengerMessages(
	input: Pick<FlightSearchFormValues, "origin" | "destination" | "passengerCounts">,
	t?: FlightSearchTranslationFn
): string[] {
	return getPassengerValidationMessages(input, resolveValidationLabels(t));
}

/**
 * Returns title and message list for passenger alert modals.
 */
export function getPassengerAlertContent(
	input: Pick<FlightSearchFormValues, "origin" | "destination" | "passengerCounts">,
	t?: FlightSearchTranslationFn
): {
	title: string;
	messages: string[];
} | null {
	const labels = resolveValidationLabels(t);
	const messages = getPassengerValidationMessages(input, labels);

	if (messages.length === 0) {
		return null;
	}

	return {
		title:
			messages.length > 1
				? labels.passenger_error_heading
				: (messages[0] ?? labels.passenger_error_heading),
		messages: messages.length > 1 ? messages : [],
	};
}
