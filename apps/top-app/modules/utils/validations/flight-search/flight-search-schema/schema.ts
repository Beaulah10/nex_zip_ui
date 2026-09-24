import z from "zod";
import type { FlightSearchFormValues, TripType } from "@/types/flight-search/flight-search.types";
import { resolveValidationLabels } from "./labels";
import { getPassengerValidationMessages, hasMissingTravelDates } from "./rules";
import type { FlightSearchTranslationFn } from "./types";

/** Allowed trip types for search submission. */
const tripTypeSchema = z.enum(["round-trip", "one-way", "connecting-flight"] satisfies [
	TripType,
	...TripType[],
]);

/** Passenger counts grouped by age bucket. */
const passengerCountsSchema = z.object({
	/** Adult count (15+) must be at least one. */
	adult: z.number().int().min(1),
	/** Child count for 12-14 years. */
	childA: z.number().int().min(0),
	/** Child count for 7-11 years. */
	childB: z.number().int().min(0),
	/** Child count for 2-6 years. */
	childC: z.number().int().min(0),
	/** Infant count for 0-1 years. */
	infant: z.number().int().min(0),
});

/** Outbound and optional return travel dates. */
const travelDatesSchema = z.object({
	/** Outbound date in YYYY-MM-DD format. */
	outboundDate: z.string(),
	/** Return date in YYYY-MM-DD format for round-trip bookings. */
	returnDate: z.string(),
});

/**
 * Zod schema for the flight search form with cross-field business rules.
 */
export function createFlightSearchSchema(t?: FlightSearchTranslationFn) {
	const labels = resolveValidationLabels(t);

	return z
		.object({
			/** Flight search mode selected by the user. */
			tripType: tripTypeSchema,
			/** Departure airport IATA code. */
			origin: z.string().trim().min(1, labels.origin_required),
			/** Arrival airport IATA code. */
			destination: z.string().trim().min(1, labels.destination_required),
			/** Passenger counts by age category. */
			passengerCounts: passengerCountsSchema,
			/** Outbound/return date fields. */
			travelDates: travelDatesSchema,
			/** Optional promotion code (alphanumeric, max 64 chars). */
			promotionCode: z
				.string()
				.max(64, labels.promotion_code_max)
				.regex(/^[a-zA-Z0-9]*$/, labels.promotion_code_pattern)
				.optional(),
		})
		.superRefine((value: FlightSearchFormValues, ctx) => {
			const passengerMessages = getPassengerValidationMessages(value, labels);

			for (const message of passengerMessages) {
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					path: ["passengerCounts"],
					message,
				});
			}

			if (value.destination && hasMissingTravelDates(value)) {
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					path: ["travelDates"],
					message: labels.validation_travel_dates_error,
				});
			}
		});
}

export const flightSearchSchema = createFlightSearchSchema();
