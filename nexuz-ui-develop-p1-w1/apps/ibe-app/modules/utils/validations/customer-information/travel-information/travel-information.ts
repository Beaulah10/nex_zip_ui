/**
 * File: travel-information.ts
 * Description: Validation utilities for travel documents, route-specific travel requirements, and passenger travel information.
 * It contains business rules and field validations for travel documents, visa information, EVUS requirements, country of residence, and US route-specific passenger information used within the Customer Information workflow.
 */

import type { z } from "zod";
import { PURPOSE_OF_TRAVEL_B1B2_VALUE } from "@/modules/utils/constants/customer-information/constants";
import { isHalfWidthAlphaNumericString } from "@/modules/utils/helpers/common/string-utils/string-utils";
import {
	type basePassengerSchema,
	MAX_FIELD_LENGTHS,
	MIN_FIELD_LENGTHS,
	type PassengerErrorLabels,
} from "@/modules/utils/validations/customer-information/customer-information-schema";

//............ validation for travel documents ............//
export const validateTravelDocuments = (
	pax: z.infer<ReturnType<typeof basePassengerSchema>>,
	ctx: z.RefinementCtx,
	isUsRoute = false,
	t: PassengerErrorLabels,
	firstArrivalDate?: string
) => {
	if (!pax.hasTravelDocs) return;

	if (!pax.documentType) {
		ctx.addIssue({
			code: "custom",
			message: t("error_document_type_required"),
			path: ["documentType"],
		});
	}

	if (!pax.documentNumber) {
		ctx.addIssue({
			code: "custom",
			message: t("error_document_number_required"),
			path: ["documentNumber"],
		});
	} else if (!isHalfWidthAlphaNumericString(pax.documentNumber)) {
		ctx.addIssue({
			code: "custom",
			message: t("error_document_number_alpha_numeric"),
			path: ["documentNumber"],
		});
	} else if (pax.documentNumber.length < MIN_FIELD_LENGTHS.documentNumber) {
		ctx.addIssue({
			code: "custom",
			message: t("error_document_number_min_max_length", {
				min: MIN_FIELD_LENGTHS.documentNumber,
				max: MAX_FIELD_LENGTHS.documentNumber,
			}),
			path: ["documentNumber"],
		});
	} else if (pax.documentNumber.length > MAX_FIELD_LENGTHS.documentNumber) {
		ctx.addIssue({
			code: "custom",
			message: t("error_document_number_min_max_length", {
				min: MIN_FIELD_LENGTHS.documentNumber,
				max: MAX_FIELD_LENGTHS.documentNumber,
			}),
			path: ["documentNumber"],
		});
	}

	if (
		!pax.documentExpiryDate?.day ||
		!pax.documentExpiryDate?.month ||
		!pax.documentExpiryDate?.year
	) {
		ctx.addIssue({
			code: "custom",
			message: t("error_document_expiry_date_required"),
			path: ["documentExpiryDate"],
		});
	} else if (firstArrivalDate) {
		const expiry = new Date(
			`${pax.documentExpiryDate.year}-${pax.documentExpiryDate.month}-${pax.documentExpiryDate.day}`
		);
		const arrival = new Date(firstArrivalDate);
		expiry.setHours(0, 0, 0, 0);
		arrival.setHours(0, 0, 0, 0);
		if (expiry < arrival) {
			ctx.addIssue({
				code: "custom",
				message: t("error_document_expiry_date_after_arrival"),
				path: ["documentExpiryDate"],
			});
		}
	}

	if (!pax.issuingCountry) {
		ctx.addIssue({
			code: "custom",
			message: t("error_issuing_country_privacy_policy"),
			path: ["issuingCountry"],
		});
	}

	// Purpose of travel is required only for visa on US route
	if (pax.documentType === "visa" && isUsRoute && !pax.purposeOfTravel) {
		ctx.addIssue({
			code: "custom",
			message: t("error_purpose_of_travel_required"),
			path: ["purposeOfTravel"],
		});
	}

	const isChinese = pax.nationality === "CHN";
	const isB1B2Visa = pax.purposeOfTravel === PURPOSE_OF_TRAVEL_B1B2_VALUE;

	if (
		pax.hasTravelDocs &&
		isChinese &&
		isUsRoute &&
		pax.documentType === "visa" &&
		isB1B2Visa &&
		!pax.evusObtained
	) {
		ctx.addIssue({
			code: "custom",
			message: t("error_evus_obtained_check_box"),
			path: ["evusObtained"],
		});
	}
};

//............... validation for US route fields ...............//
export const validateUSRouteFields = (
	pax: z.infer<ReturnType<typeof basePassengerSchema>>,
	isUsRoute: boolean,
	hasAnyUSRoute: boolean,
	hasUSDeparture: boolean,
	ctx: z.RefinementCtx,
	t: PassengerErrorLabels
) => {
	if (hasAnyUSRoute) {
		if (pax.redressNumber) {
			if (!isHalfWidthAlphaNumericString(pax.redressNumber)) {
				ctx.addIssue({
					code: "custom",
					message: t("error_input_alpha_numeric_only"),
					path: ["redressNumber"],
				});
			}

			if (pax.redressNumber.length > MAX_FIELD_LENGTHS.redressNumber) {
				ctx.addIssue({
					code: "custom",
					message: t("error_redress_number_length", { length: MAX_FIELD_LENGTHS.redressNumber }),
					path: ["redressNumber"],
				});
			}
		}
	}
	if (hasUSDeparture) {
		if (pax.knownTravelerNumber) {
			if (!isHalfWidthAlphaNumericString(pax.knownTravelerNumber)) {
				ctx.addIssue({
					code: "custom",
					message: t("error_input_alpha_numeric_only"),
					path: ["knownTravelerNumber"],
				});
			}

			if (pax.knownTravelerNumber.length !== MAX_FIELD_LENGTHS.knownTravelerNumber) {
				ctx.addIssue({
					code: "custom",
					message: t("error_known_traveler_number_length", {
						length: MAX_FIELD_LENGTHS.knownTravelerNumber,
					}),
					path: ["knownTravelerNumber"],
				});
			}
		}
	}
	if (!isUsRoute) return;
	if (!pax.countryOfResidence || pax.countryOfResidence === "") {
		ctx.addIssue({
			code: "custom",
			message: t("error_county_of_residence_required"),
			path: ["countryOfResidence"],
		});
	}
};
