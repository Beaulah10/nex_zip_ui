/**
 * File: service-dog-information.ts
 * Description: Validation utilities for service dog information and travel requirements.
 * It contains business rules and field validations for service dog details, breed and weight information, cage requirements, and cage dimension constraints used within the Customer Information workflow.
 */

import type { z } from "zod";
import {
	isOnlyNumbers,
	isUppercaseAlphabet,
} from "@/modules/utils/helpers/common/string-utils/string-utils";
import {
	type basePassengerSchema,
	MAX_FIELD_LENGTHS,
	MIN_FIELD_LENGTHS,
	type PassengerErrorLabels,
} from "@/modules/utils/validations/customer-information/customer-information-schema";

//........... validation for service dog dimensions ...........//
const validateServiceDogDimensions = (
	pax: z.infer<ReturnType<typeof basePassengerSchema>>,
	ctx: z.RefinementCtx,
	t: PassengerErrorLabels
) => {
	const height = pax.serviceDogCageHeight;
	const width = pax.serviceDogCageWidth;
	const depth = pax.serviceDogCageDepth;
	const weight = pax.serviceDogCageWeight;
	const MIN_DIMENSION_VALUE = 1;

	// 🔹 HEIGHT
	if (!height) {
		ctx.addIssue({
			code: "custom",
			message: t("error_service_dog_cage_height_required"),
			path: ["serviceDogCageHeight"],
		});
	} else if (!isOnlyNumbers(height)) {
		ctx.addIssue({
			code: "custom",
			message: t("error_service_dog_cage_height_numbers_only"),
			path: ["serviceDogCageHeight"],
		});
	} else if (Number(height) < MIN_DIMENSION_VALUE) {
		ctx.addIssue({
			code: "custom",
			message: t("error_service_dog_cage_height_min", { min: MIN_DIMENSION_VALUE }),
			path: ["serviceDogCageHeight"],
		});
	}

	// 🔹 WIDTH
	if (!width) {
		ctx.addIssue({
			code: "custom",
			message: t("error_service_dog_cage_width_required"),
			path: ["serviceDogCageWidth"],
		});
	} else if (!isOnlyNumbers(width)) {
		ctx.addIssue({
			code: "custom",
			message: t("error_service_dog_cage_width_numbers_only"),
			path: ["serviceDogCageWidth"],
		});
	} else if (Number(width) < MIN_DIMENSION_VALUE) {
		ctx.addIssue({
			code: "custom",
			message: t("error_service_dog_cage_width_min", { min: MIN_DIMENSION_VALUE }),
			path: ["serviceDogCageWidth"],
		});
	}

	// 🔹 DEPTH
	if (!depth) {
		ctx.addIssue({
			code: "custom",
			message: t("error_service_dog_cage_depth_required"),
			path: ["serviceDogCageDepth"],
		});
	} else if (!isOnlyNumbers(depth)) {
		ctx.addIssue({
			code: "custom",
			message: t("error_service_dog_cage_depth_numbers_only"),
			path: ["serviceDogCageDepth"],
		});
	} else if (Number(depth) < MIN_DIMENSION_VALUE) {
		ctx.addIssue({
			code: "custom",
			message: t("error_service_dog_cage_depth_min", { min: MIN_DIMENSION_VALUE }),
			path: ["serviceDogCageDepth"],
		});
	}

	// 🔹 SUM VALIDATION
	if (
		height &&
		width &&
		depth &&
		isOnlyNumbers(height) &&
		isOnlyNumbers(width) &&
		isOnlyNumbers(depth)
	) {
		const sum = Number(height) + Number(width) + Number(depth);

		if (sum > CAGE_MAX_TOTAL_CM) {
			for (const field of ["serviceDogCageHeight", "serviceDogCageWidth", "serviceDogCageDepth"]) {
				ctx.addIssue({
					code: "custom",
					message: t("error_service_dog_cage_dimensions_sum_exceeded", { max: CAGE_MAX_TOTAL_CM }),
					path: [field],
				});
			}
		}
	}

	// 🔹 WEIGHT
	if (!weight) {
		ctx.addIssue({
			code: "custom",
			message: t("error_service_dog_cage_weight_required"),
			path: ["serviceDogCageWeight"],
		});
	} else if (!isOnlyNumbers(weight)) {
		ctx.addIssue({
			code: "custom",
			message: t("error_service_dog_cage_weight_numbers_only"),
			path: ["serviceDogCageWeight"],
		});
	} else if (Number(weight) < 1 || Number(weight) > 32) {
		ctx.addIssue({
			code: "custom",
			message: t("error_service_dog_cage_weight_range", { min: 1, max: 32 }),
			path: ["serviceDogCageWeight"],
		});
	}
};

//............ validation for service dog information ...........//
export const validateServiceDog = (
	pax: z.infer<ReturnType<typeof basePassengerSchema>>,
	ctx: z.RefinementCtx,
	t: PassengerErrorLabels
) => {
	if (!pax.accompaniedByServiceDog) return;

	if (!pax.serviceDogType) {
		ctx.addIssue({
			code: "custom",
			message: t("error_service_dog_type_required"),
			path: ["serviceDogType"],
		});
	}

	if (!pax.serviceDogBreed || pax.serviceDogBreed.trim() === "") {
		ctx.addIssue({
			code: "custom",
			message: t("error_service_dog_breed_required"),
			path: ["serviceDogBreed"],
		});
	} else if (!isUppercaseAlphabet(pax.serviceDogBreed)) {
		ctx.addIssue({
			code: "custom",
			message: t("error_service_dog_breed_uppercase"),
			path: ["serviceDogBreed"],
		});
	} else if (pax.serviceDogBreed.length > MAX_FIELD_LENGTHS.serviceDogBreed) {
		ctx.addIssue({
			code: "custom",
			message: t("error_service_dog_breed_length", { max: MAX_FIELD_LENGTHS.serviceDogBreed }),
			path: ["serviceDogBreed"],
		});
	}

	const weight = pax.serviceDogWeight;

	if (!weight) {
		ctx.addIssue({
			code: "custom",
			message: t("error_service_dog_weight_required"),
			path: ["serviceDogWeight"],
		});
	} else if (!isOnlyNumbers(weight)) {
		ctx.addIssue({
			code: "custom",
			message: t("error_service_dog_weight_only_numbers"),
			path: ["serviceDogWeight"],
		});
	} else if (Number(weight) < MIN_FIELD_LENGTHS.serviceDogWeight) {
		ctx.addIssue({
			code: "custom",
			message: t("error_service_dog_weight_min", { min: MIN_FIELD_LENGTHS.serviceDogWeight }),
			path: ["serviceDogWeight"],
		});
	} else if (Number(weight) > MAX_FIELD_LENGTHS.serviceDogWeight) {
		ctx.addIssue({
			code: "custom",
			message: t("error_service_dog_weight_min_max", {
				min: MIN_FIELD_LENGTHS.serviceDogWeight,
				max: MAX_FIELD_LENGTHS.serviceDogWeight,
			}),
			path: ["serviceDogWeight"],
		});
	}
	if (!pax.serviceDogCagePresence) {
		ctx.addIssue({
			code: "custom",
			message: t("error_service_dog_presence_required"),
			path: ["serviceDogCagePresence"],
		});
	}

	if (pax.serviceDogCagePresence === "with-cage") {
		validateServiceDogDimensions(pax, ctx, t);
	}
};

//.............. cage dimension constants ..............//
/** Maximum allowed sum of cage height + width + depth in cm. */
export const CAGE_MAX_TOTAL_CM = 203;

/** Error message shown on all three dimension fields when sum exceeds the maximum. */
export const SIZE_ERROR_MSG = `The total size of the cage must be entered within ${CAGE_MAX_TOTAL_CM}cm.`;
