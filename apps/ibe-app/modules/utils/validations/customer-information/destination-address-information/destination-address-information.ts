/**
 * File: destination-address-information.ts
 * Description: Validation utilities for destination address and accommodation information used in passenger travel requirements.
 * It contains field-level validation rules for hotel details, postal codes, city, state, and accommodation-related information required for customer information processing.
 */

import type { z } from "zod";
import {
	isHalfWidthAlphaNumericSpaceString,
	isOnlyNumbers,
} from "@/modules/utils/helpers/common/string-utils/string-utils";
import {
	type basePassengerSchema,
	MAX_FIELD_LENGTHS,
	MIN_FIELD_LENGTHS,
	type PassengerErrorLabels,
} from "@/modules/utils/validations/customer-information/customer-information-schema";

const validateAddressHotel = (
	hotelName: string | undefined,
	ctx: z.RefinementCtx,
	t: PassengerErrorLabels
) => {
	if (!hotelName) return;

	if (!isHalfWidthAlphaNumericSpaceString(hotelName)) {
		ctx.addIssue({
			code: "custom",
			message: t("error_input_half_width_alpha_numeric_with_space"),
			path: ["hotelName"],
		});
		return;
	}

	if (hotelName.length > MAX_FIELD_LENGTHS.hotelName) {
		ctx.addIssue({
			code: "custom",
			message: t("error_address_input_max_length", { max: MAX_FIELD_LENGTHS.hotelName }),
			path: ["hotelName"],
		});
	}
};

const validateAddressPostalCode = (
	postalCode: string | undefined,
	ctx: z.RefinementCtx,
	t: PassengerErrorLabels
) => {
	if (!postalCode) return;

	if (!isOnlyNumbers(postalCode)) {
		ctx.addIssue({
			code: "custom",
			message: t("error_address_input_half_width_number"),
			path: ["postalCode"],
		});
		return;
	}

	if (
		postalCode.length < MIN_FIELD_LENGTHS.postalCode ||
		postalCode.length > MAX_FIELD_LENGTHS.postalCode
	) {
		ctx.addIssue({
			code: "custom",
			message: t("error_postal_code_length", {
				min: MIN_FIELD_LENGTHS.postalCode,
				max: MAX_FIELD_LENGTHS.postalCode,
			}),
			path: ["postalCode"],
		});
	}
};

const validateAddressCity = (
	city: string | undefined,
	ctx: z.RefinementCtx,
	t: PassengerErrorLabels
) => {
	if (!city) return;

	if (!isHalfWidthAlphaNumericSpaceString(city)) {
		ctx.addIssue({
			code: "custom",
			message: t("error_input_half_width_alpha_numeric_with_space"),
			path: ["city"],
		});
		return;
	}

	if (city.length > MAX_FIELD_LENGTHS.city) {
		ctx.addIssue({
			code: "custom",
			message: t("error_city_length", { length: MAX_FIELD_LENGTHS.city }),
			path: ["city"],
		});
	}
};

const validateAddressState = (
	state: string | undefined,
	ctx: z.RefinementCtx,
	t: PassengerErrorLabels
) => {
	if (!state) return;

	if (!isHalfWidthAlphaNumericSpaceString(state)) {
		ctx.addIssue({
			code: "custom",
			message: t("error_input_half_width_alpha_numeric_with_space"),
			path: ["state"],
		});
		return;
	}

	if (state.length > MAX_FIELD_LENGTHS.state) {
		ctx.addIssue({
			code: "custom",
			message: t("error_state_length", { length: MAX_FIELD_LENGTHS.state }),
			path: ["state"],
		});
	}
};

export const validateAddressFields = (
	pax: z.infer<ReturnType<typeof basePassengerSchema>>,
	requiresAccommodation: boolean,
	ctx: z.RefinementCtx,
	t: PassengerErrorLabels
) => {
	if (!requiresAccommodation) return;
	validateAddressHotel(pax.hotelName, ctx, t);
	validateAddressPostalCode(pax.postalCode, ctx, t);
	validateAddressCity(pax.city, ctx, t);
	validateAddressState(pax.state, ctx, t);
};
