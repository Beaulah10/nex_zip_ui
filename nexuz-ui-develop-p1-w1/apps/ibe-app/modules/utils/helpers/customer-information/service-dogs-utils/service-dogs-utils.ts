/**
 * File: service-dogs-utils.ts
 * Description: Helper utilities for the Service Dogs Cage section form fields,
 * including shared static props and handler factory for cage dimension inputs.
 */

import type { ChangeEvent } from "react";
import type { FieldErrors, UseFormSetValue, UseFormTrigger } from "react-hook-form";
import type { PassengerInformation } from "@/modules/utils/validations/customer-information/customer-information-schema";

export type CageDimensionField =
	| "serviceDogCageHeight"
	| "serviceDogCageWidth"
	| "serviceDogCageDepth";

export const CAGE_DIMENSION_FIELDS = [
	"serviceDogCageHeight",
	"serviceDogCageWidth",
	"serviceDogCageDepth",
] as const;

/** Shared static props common to all cage dimension FieldDimensionInput fields. */
export const CAGE_DIMENSION_STATIC_PROPS = {
	required: true,
	unit: "cm",
	min: 1,
	defaultValue: 0,
	placeholder: "0",
} as const;

/**
 * Returns `onChange` and `onBlur` handlers for a cage dimension input field
 * (height, width, or depth), encapsulating the shared validation-trigger logic.
 */
export function getCageDimensionHandlers({
	fieldName,
	fieldReg,
	setValue,
	trigger,
	errors,
	isSizeErrorActive,
	triggerCageDimensions,
}: {
	fieldName: CageDimensionField;
	fieldReg: { onChange: (e: ChangeEvent<HTMLInputElement>) => void };
	setValue: UseFormSetValue<PassengerInformation>;
	trigger: UseFormTrigger<PassengerInformation>;
	errors: FieldErrors<PassengerInformation>;
	isSizeErrorActive: () => boolean;
	triggerCageDimensions: (field: CageDimensionField) => void;
}) {
	return {
		onBlur: () => triggerCageDimensions(fieldName),
		onChange: (e: ChangeEvent<HTMLInputElement>) => {
			fieldReg.onChange(e);
			setValue(fieldName, e.target.value, { shouldValidate: false });
			if (isSizeErrorActive()) trigger(CAGE_DIMENSION_FIELDS);
			else if (errors[fieldName]) trigger(fieldName);
		},
	};
}
