/**
 * File: contact-information.ts
 * Description: Validation utilities for passenger contact information and communication details.
 * It contains business rules and field validations for phone numbers, emergency contact information, and route-specific email requirements used within the Customer Information workflow.
 */

import type { z } from "zod";
import { isOnlyNumbers } from "@/modules/utils/helpers/common/string-utils/string-utils";
import {
	type basePassengerSchema,
	MAX_FIELD_LENGTHS,
	MIN_FIELD_LENGTHS,
	type PassengerErrorLabels,
} from "@/modules/utils/validations/customer-information/customer-information-schema";

//........... validate Phone Number and Emergency Contact Information ...........//
export const validatePhoneNumber = (
	pax: z.infer<ReturnType<typeof basePassengerSchema>>,
	isUsRoute: boolean,
	ctx: z.RefinementCtx,
	t: PassengerErrorLabels
) => {
	if (!pax.phoneExtension) {
		ctx.addIssue({
			code: "custom",
			message: t("error_phone_extension_required"),
			path: ["phoneExtension"],
		});
	}

	if (!pax.phoneNumber) {
		ctx.addIssue({
			code: "custom",
			message: t("error_phone_number_required"),
			path: ["phoneNumber"],
		});
	} else {
		if (!isOnlyNumbers(pax.phoneNumber)) {
			ctx.addIssue({
				code: "custom",
				message: t("error_input_half_width_number"),
				path: ["phoneNumber"],
			});
		}

		if (pax.phoneNumber.length > MAX_FIELD_LENGTHS.phoneNumber) {
			ctx.addIssue({
				code: "custom",
				message: t("error_phone_number_min_max_length", {
					min: MIN_FIELD_LENGTHS.phoneNumber,
					max: MAX_FIELD_LENGTHS.phoneNumber,
				}),
				path: ["phoneNumber"],
			});
		}
	}

	if (!isUsRoute) return;
	validateEmergencyContact(pax, ctx, t);
};

//............... Validate Emergency Contact Information ...............//
export const validateEmergencyContact = (
	pax: z.infer<ReturnType<typeof basePassengerSchema>>,
	ctx: z.RefinementCtx,
	t: PassengerErrorLabels
) => {
	if (!pax.emergencyExtension) {
		ctx.addIssue({
			code: "custom",
			message: t("error_phone_extension_required"),
			path: ["emergencyExtension"],
		});
	}

	if (!pax.emergencyNumber) {
		ctx.addIssue({
			code: "custom",
			message: t("error_phone_number_required"),
			path: ["emergencyNumber"],
		});
	} else {
		if (!isOnlyNumbers(pax.emergencyNumber)) {
			ctx.addIssue({
				code: "custom",
				message: t("error_input_half_width_number"),
				path: ["emergencyNumber"],
			});
		}

		if (pax.emergencyNumber.length > MAX_FIELD_LENGTHS.phoneNumber) {
			ctx.addIssue({
				code: "custom",
				message: t("error_phone_number_min_max_length", {
					min: MIN_FIELD_LENGTHS.phoneNumber,
					max: MAX_FIELD_LENGTHS.phoneNumber,
				}),
				path: ["emergencyNumber"],
			});
		}
	}

	if (
		pax.phoneNumber &&
		pax.emergencyNumber &&
		pax.emergencyNumber === pax.phoneNumber &&
		pax.emergencyExtension === pax.phoneExtension
	) {
		ctx.addIssue({
			code: "custom",
			message: t("error_emergency_number_same_as_phone_number"),
			path: ["emergencyNumber"],
		});
	}
};

//........ validate Email for US and Canada Routes ..............
export const validateEmailForUSCanadaRoute = (
	email: string | undefined,
	ctx: z.RefinementCtx,
	t: PassengerErrorLabels
) => {
	if (!email) return;

	if (email.includes("+") || email.includes("*")) {
		ctx.addIssue({
			code: "custom",
			message: t("error_email_invalid_for_us_canada"),
			path: ["email"],
		});
	}
};
