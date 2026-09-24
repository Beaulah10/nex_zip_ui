/**
 * File: pregnancy-information.ts
 * Description: Validation utilities for pregnancy-related passenger information and travel requirements.
 * It contains business rules and field validations for pregnancy declarations and gestational week information used within the Customer Information workflow.
 */

import type { z } from "zod";
import { isOnlyNumbers } from "@/modules/utils/helpers/common/string-utils/string-utils";
import {
	type basePassengerSchema,
	MAX_FIELD_LENGTHS,
	MIN_FIELD_LENGTHS,
	type PassengerErrorLabels,
} from "@/modules/utils/validations/customer-information/customer-information-schema";
export const validatePregnancy = (
	pax: z.infer<ReturnType<typeof basePassengerSchema>>,
	ctx: z.RefinementCtx,
	t: PassengerErrorLabels
) => {
	if (!pax.isPregnant) return;

	if (!pax.pregnancyWeeks) {
		ctx.addIssue({
			code: "custom",
			message: t("error_pregnancy_gestational_weeks_required"),
			path: ["pregnancyWeeks"],
		});
		return;
	}

	if (!isOnlyNumbers(pax.pregnancyWeeks)) {
		ctx.addIssue({
			code: "custom",
			message: t("error_pregnany_gestational_weeks_only_numbers"),
			path: ["pregnancyWeeks"],
		});
		return;
	}

	const week = Number(pax.pregnancyWeeks);

	if (week < MIN_FIELD_LENGTHS.pregnancyWeeks || week > MAX_FIELD_LENGTHS.pregnancyWeeks) {
		ctx.addIssue({
			code: "custom",
			message: t("error_pregnancy_gestational_weeks_length", {
				min: MIN_FIELD_LENGTHS.pregnancyWeeks,
				max: MAX_FIELD_LENGTHS.pregnancyWeeks,
			}),
			path: ["pregnancyWeeks"],
		});
	}
};
