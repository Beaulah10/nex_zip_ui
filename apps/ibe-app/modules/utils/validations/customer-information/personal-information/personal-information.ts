/**
 * File: personal-information.ts
 * Description: Validation utilities for passenger personal information and age-related travel requirements.
 * It contains business rules for validating passenger date of birth, passenger type eligibility, and infant-specific height and weight requirements within the Customer Information workflow.
 */

import type { z } from "zod";
import {
	isNewbornUnderAgeLimit,
	isValidAgeForPassengerType,
} from "@/modules/utils/helpers/common/age-utils/age-utils";
import type {
	basePassengerSchema,
	PassengerErrorLabels,
	PassengerType,
} from "@/modules/utils/validations/customer-information/customer-information-schema";

//............... Validate Date of Birth for Passenger Type ...............//
export const validatePassengerDateOfBirth = (
	pax: z.infer<ReturnType<typeof basePassengerSchema>>,
	type: PassengerType,
	departureDate: Date | undefined,
	ctx: z.RefinementCtx,
	t: PassengerErrorLabels
) => {
	if (!pax.dateOfBirth.year || !pax.dateOfBirth.month || !pax.dateOfBirth.day) return;

	if (!pax.dateOfBirth.year || !pax.dateOfBirth.month || !pax.dateOfBirth.day) return;

	if (!isValidAgeForPassengerType(pax.dateOfBirth, type, departureDate)) {
		ctx.addIssue({
			code: "custom",
			message: t("error_date_of_birth_incorrect"),
			path: ["dateOfBirth"],
		});
	}

	if (type === "infant" && isNewbornUnderAgeLimit(pax.dateOfBirth, departureDate)) {
		ctx.addIssue({
			code: "custom",
			message: t("error_date_of_birth_under_1_year"),
			path: ["dateOfBirth"],
		});
	}
};

//............ Validate Height and Weight for Infant Type Passenger ............//
export const validateWeightAndHeight = (
	pax: z.infer<ReturnType<typeof basePassengerSchema>>,
	passengerType: PassengerType,
	ctx: z.RefinementCtx,
	t: PassengerErrorLabels
) => {
	if (passengerType !== "infant") return;
	if (!pax.bodyWeight) {
		ctx.addIssue({
			code: "custom",
			message: t("error_body_weight_required"),
			path: ["bodyWeight"],
		});
	}
	if (!pax.bodyHeight) {
		ctx.addIssue({
			code: "custom",
			message: t("error_body_height_required"),
			path: ["bodyHeight"],
		});
	}
};
