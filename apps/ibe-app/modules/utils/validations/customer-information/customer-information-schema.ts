/**
 * File: customer-information-schema.ts
 * Description: Zod schema definitions and validation configuration for the Customer Information workflow.
 * It defines passenger information data structures, field validation rules, route-specific business validations, and form schemas used for customer information collection and processing.
 */

import type { useTranslations } from "next-intl";
import { z } from "zod";
import {
	isHalfWidthAlphabetString,
	isHalfWidthAlphaNumericString,
	isValidEmail,
} from "@/modules/utils/helpers/common/string-utils/string-utils";
import {
	validateAssistanceRequirements,
	validateWheelchairDetails,
} from "@/modules/utils/validations/customer-information/assistance-service/assistance-service";
import {
	validateEmailForUSCanadaRoute,
	validatePhoneNumber,
} from "@/modules/utils/validations/customer-information/contact-information/contact-information";
import { validateAddressFields } from "@/modules/utils/validations/customer-information/destination-address-information/destination-address-information";
import { isPassportExpired } from "@/modules/utils/validations/customer-information/passport-information/passport-information";
import {
	validatePassengerDateOfBirth,
	validateWeightAndHeight,
} from "@/modules/utils/validations/customer-information/personal-information/personal-information";
import { validatePregnancy } from "@/modules/utils/validations/customer-information/pregnancy-information/pregnancy-information";
import { validateServiceDog } from "@/modules/utils/validations/customer-information/service-dog-information/service-dog-information";
import {
	validateTravelDocuments,
	validateUSRouteFields,
} from "@/modules/utils/validations/customer-information/travel-information/travel-information";

// Type definition for passenger categories
export type PassengerType = "adult" | "childA" | "childB" | "childC" | "infant";
export type PassengerErrorLabels = ReturnType<typeof useTranslations<"customer_information_page">>;

// ──────────────────────────────────────────────────────────────────────────────
// Constants & Utilities (to be imported from external files)
// ──────────────────────────────────────────────────────────────────────────────

// These should be imported from: ../utils/constants
export const MAX_FIELD_LENGTHS = {
	lastName: 64,
	firstName: 64,
	middleName: 64,
	passportNumber: 16,
	phoneNumber: 15,
	hotelName: 64,
	city: 50,
	state: 32,
	postalCode: 10,
	redressNumber: 25,
	documentNumber: 20,
	accompanyingPersonName: 64,
	serviceDogBreed: 64,
	wheelchairDimension: 999,
	pregnancyWeeks: 42,
	serviceDogWeight: 999,
	knownTravelerNumber: 9,
};

export const MIN_FIELD_LENGTHS = {
	passportNumber: 2,
	phoneNumber: 1,
	postalCode: 2,
	documentNumber: 2,
	wheelchairDimension: 1,
	pregnancyWeeks: 1,
	serviceDogWeight: 1,
};

// These should be imported from: ../utils/customerInformationUtils
//const LAST_FLIGHT_ARRIVAL_DATE = new Date(); // Placeholder - should come from config

/**
 * Validates date format
 */
const datePartSchema = z.object({
	year: z.preprocess((v) => v ?? "", z.string()),
	month: z.preprocess((v) => v ?? "", z.string()),
	day: z.preprocess((v) => v ?? "", z.string()),
});

// ──────────────────────────────────────────────────────────────────────────────
// Base Passenger Schema
// ──────────────────────────────────────────────────────────────────────────────

export const basePassengerSchema = (t: PassengerErrorLabels) =>
	z
		.object({
			lastName: z
				.string()
				.trim()
				.nonempty(t("error_last_name_required"))
				.max(
					MAX_FIELD_LENGTHS.lastName,
					t("error_input_max_length", { max: MAX_FIELD_LENGTHS.lastName })
				)
				.transform((value) => value.toUpperCase())
				.refine(isHalfWidthAlphabetString, t("error_input_half_width_alphabet")),

			firstName: z
				.string()
				.trim()
				.nonempty(t("error_first_name_required"))
				.max(
					MAX_FIELD_LENGTHS.firstName,
					t("error_input_max_length", { max: MAX_FIELD_LENGTHS.firstName })
				)
				.transform((value) => value.toUpperCase())
				.refine(isHalfWidthAlphabetString, t("error_input_half_width_alphabet")),

			middleName: z
				.string()
				.trim()
				.max(
					MAX_FIELD_LENGTHS.middleName,
					t("error_input_max_length", { max: MAX_FIELD_LENGTHS.middleName })
				)
				.transform((value) => value.toUpperCase())
				.refine(
					(value) => value === "" || isHalfWidthAlphabetString(value),
					t("error_input_half_width_alphabet")
				)
				.optional(),

			gender: z
				.string()
				.min(1, t("error_gender_required"))
				.refine((value) => value === "male" || value === "female", t("error_gender_required")),

			dateOfBirth: datePartSchema.refine((date) => !!(date.year && date.month && date.day), {
				message: t("error_date_of_birth_required"),
			}),

			nationality: z.preprocess(
				(value) => value ?? "",
				z.string().min(1, t("error_nationality_required"))
			),
			countryOfResidence: z.string(),
			bodyWeight: z.string().optional(),
			bodyHeight: z.string().optional(),
			passportNumber: z
				.string()
				.trim()
				.min(1, t("error_passport_number_required"))
				.min(MIN_FIELD_LENGTHS.passportNumber, t("error_passport_number_min_max_length"))
				.max(MAX_FIELD_LENGTHS.passportNumber, t("error_passport_number_min_max_length"))
				.transform((value) => value.toUpperCase())
				.refine(isHalfWidthAlphaNumericString, t("error_input_alpha_numeric_characters")),

			passportExpiryDate: datePartSchema.refine((date) => !!(date.year && date.month && date.day), {
				message: t("error_passport_expiry_date_required"),
			}),
			phoneExtension: z.string(),

			phoneNumber: z.string(),
			emergencyExtension: z.string(),
			emergencyNumber: z.string(),
			email: z
				.string()
				.refine((value) => value.trim().length > 0, { message: t("error_email_required") })
				.refine(isValidEmail, {
					message: t("error_email_invalid"),
				}),

			emailConfirmation: z
				.string()
				.refine((value) => value.trim().length > 0, {
					message: t("error_email_confirmation_required"),
				})
				.refine(isValidEmail, {
					message: t("error_email_invalid"),
				}),

			hotelName: z
				.string()
				.trim()
				.optional()
				.transform((value) => value?.toUpperCase()),
			countryOfStay: z.string().optional(),
			postalCode: z.string().optional(),
			city: z
				.string()
				.trim()
				.optional()
				.transform((value) => value?.toUpperCase()),
			state: z
				.string()
				.trim()
				.optional()
				.transform((value) => value?.toUpperCase()),

			redressNumber: z.string().optional(),
			knownTravelerNumber: z.string().optional(),

			hasTravelDocs: z.boolean().default(false),
			documentType: z.preprocess(
				(val) => (val === "" ? undefined : val),
				z.enum(["visa", "permanent-residence", "resident-alien-card", "military-id"]).optional()
			),
			documentNumber: z.string().optional(),

			documentExpiryDate: datePartSchema.optional(),

			issuingCountry: z.string().optional(),
			purposeOfTravel: z.string().optional(),
			evusObtained: z.boolean().optional(),

			isPregnant: z.boolean().default(false),
			pregnancyWeeks: z.string().optional(),

			requestingAssistance: z.boolean().default(false),
			canManagePersonalNeeds: z.string().optional(),
			boardingWithAccompanion: z.string().optional(),
			accompanyingPersonName: z.string().optional(),
			assistanceReasons: z.array(z.string()).optional(),

			canWalk: z.string().optional(),
			canGoUpDownStairs: z.string().optional(),
			needsOnboardWheelchair: z.string().optional(),
			reasonForWheelchair: z.string().optional(),
			isFoldable: z.string().optional(),
			bringingOwnWheelchair: z.string().optional(),
			wheelchairType: z.string().optional(),
			wheelchairBatteryType: z.string().optional(),
			wheelchairBatteryRemovable: z.string().optional(),
			wheelchairHeight: z.string().optional(),
			wheelchairWidth: z.string().optional(),
			wheelchairDepth: z.string().optional(),
			wheelchairWeight: z.string().optional(),

			accompaniedByServiceDog: z.boolean().optional(),
			serviceDogType: z.string().optional(),
			serviceDogBreed: z.string().optional(),
			serviceDogWeight: z.string().optional(),
			serviceDogCagePresence: z.string().optional(),
			serviceDogCageHeight: z.string().optional(),
			serviceDogCageWidth: z.string().optional(),
			serviceDogCageDepth: z.string().optional(),
			serviceDogCageWeight: z.string().optional(),
		})
		.refine((data) => data.email === data.emailConfirmation, {
			message: t("error_email_confirmation_not_equal"),
			path: ["emailConfirmation"],
		});

export const buildSinglePassengerSchema = (
	t: PassengerErrorLabels,
	passengerType: PassengerType,
	isUsRoute: boolean,
	isThaiRoute: boolean,
	isUsCanadaRoute: boolean,
	hasAnyUSRoute: boolean,
	hasUSDeparture: boolean,
	departureDateTime: string,
	firstArrivalDate?: string,
	lastArrivalDate?: string
) => {
	const departureDate = departureDateTime ? new Date(departureDateTime) : undefined;

	return basePassengerSchema(t).superRefine((pax, ctx) => {
		const requiresAccommodation = isUsRoute || isThaiRoute;
		//personal Information validation
		validatePassengerDateOfBirth(pax, passengerType, departureDate, ctx, t);
		validateWeightAndHeight(pax, passengerType, ctx, t);
		//contact Information validation
		validatePhoneNumber(pax, isUsRoute, ctx, t);
		if (isUsCanadaRoute) {
			validateEmailForUSCanadaRoute(pax.email, ctx, t);
		}
		//destination Information validation
		if (requiresAccommodation) {
			validateAddressFields(pax, requiresAccommodation, ctx, t);
		}
		validateUSRouteFields(pax, isUsRoute, hasAnyUSRoute, hasUSDeparture, ctx, t);
		//Travel Information validation
		validateTravelDocuments(pax, ctx, isUsRoute, t, firstArrivalDate);

		if (lastArrivalDate) {
			const arrivalDate = new Date(lastArrivalDate);

			if (!isPassportExpired(pax.passportExpiryDate, arrivalDate)) {
				ctx.addIssue({
					code: "custom",
					message: t("error_passport_expiry_date_past_date"),
					path: ["passportExpiryDate"],
				});
			}
		}
		//pregnancy Information validation
		validatePregnancy(pax, ctx, t);
		//Assistance Information validation
		if (pax.requestingAssistance) {
			validateAssistanceRequirements(pax, ctx, t);
			validateWheelchairDetails(pax, ctx, t);
		}
		// Service Dog Information validation
		if (pax.accompaniedByServiceDog) {
			validateServiceDog(pax, ctx, t);
		}
	});
};

// ──────────────────────────────────────────────────────────────────────────────
// Type Exports
// ──────────────────────────────────────────────────────────────────────────────

export type PassengerInformation = z.infer<ReturnType<typeof basePassengerSchema>>;
export type SinglePassengerForm = z.infer<ReturnType<typeof buildSinglePassengerSchema>>;
