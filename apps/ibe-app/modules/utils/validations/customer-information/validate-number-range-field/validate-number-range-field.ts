/**
 * File: validate-number-range-field.ts
 * Description: Reusable validation utility for numeric input fields that require value range validation.
 * It provides common validation logic for numeric-only fields, required field checks, and minimum/maximum value constraints used throughout the Customer Information workflow.
 */

import type { z } from "zod";
import { isOnlyNumbers } from "@/modules/utils/helpers/common/string-utils/string-utils";
import {
	MAX_FIELD_LENGTHS,
	MIN_FIELD_LENGTHS,
	type PassengerErrorLabels,
} from "@/modules/utils/validations/customer-information/customer-information-schema";
export const validateNumberRangeField = (
	value: string | undefined,
	path: string,
	label: string,
	ctx: z.RefinementCtx,
	t: PassengerErrorLabels
) => {
	if (!value) {
		ctx.addIssue({
			code: "custom",
			message: t("error_wheel_chair_dimension_required", { label }),
			path: [path],
		});
		return;
	}

	if (!isOnlyNumbers(value)) {
		ctx.addIssue({
			code: "custom",
			message: t("error_wheel_chair_dimension_only_numbers", {
				label: label.charAt(0).toUpperCase() + label.slice(1),
			}),
			path: [path],
		});
		return;
	}

	const numericValue = Number(value);

	if (
		numericValue < MIN_FIELD_LENGTHS.wheelchairDimension ||
		numericValue > MAX_FIELD_LENGTHS.wheelchairDimension
	) {
		ctx.addIssue({
			code: "custom",
			message: t("error_wheel_chair_dimension_min_max", {
				label,
				min: MIN_FIELD_LENGTHS.wheelchairDimension,
				max: MAX_FIELD_LENGTHS.wheelchairDimension,
			}),
			path: [path],
		});
	}
};
