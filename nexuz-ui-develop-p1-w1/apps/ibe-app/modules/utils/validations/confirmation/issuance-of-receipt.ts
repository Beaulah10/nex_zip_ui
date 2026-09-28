/**
 * File: issuance-of-receipt.ts
 * Validation utilities for confirmation receipt recipient selection and contact fields.
 */

import {
	isAnyCANADARoute,
	isAnyUSRoute,
} from "@/modules/utils/helpers/common/country-utils/country-utils";
import {
	isHalfWidthAlphabetString,
	isValidEmail,
} from "@/modules/utils/helpers/common/string-utils/string-utils";
import type {
	ReceiptEmailConfirmationValidationOptions,
	ReceiptEmailValidationOptions,
	ReceiptNameValidationOptions,
} from "@/types/confirmation/confirmation.types";

export const RECEIPT_MAX_NAME_LENGTH = 64;

export function validateReceiptName(
	value: string,
	options: ReceiptNameValidationOptions
): string | undefined {
	const normalizedValue = value.trim();

	if (options.required && normalizedValue.length === 0) {
		return options.requiredMessage;
	}

	if (normalizedValue.length > RECEIPT_MAX_NAME_LENGTH) {
		return options.maxLengthMessage;
	}

	if (normalizedValue.length > 0 && !isHalfWidthAlphabetString(normalizedValue)) {
		return options.invalidMessage;
	}

	return undefined;
}

export function validateReceiptEmail(
	value: string,
	options: ReceiptEmailValidationOptions
): string | undefined {
	const normalizedValue = value.trim();

	if (normalizedValue.length === 0) {
		return options.requiredMessage;
	}

	if (!isReceiptEmailValid(normalizedValue, options.isUsCanadaRoute)) {
		return options.invalidMessage;
	}

	return undefined;
}

export function validateReceiptEmailConfirmation(
	options: ReceiptEmailConfirmationValidationOptions
): string | undefined {
	const normalizedConfirmation = options.emailConfirmation.trim();
	const normalizedEmailAddress = options.emailAddress.trim();

	if (normalizedConfirmation.length === 0) {
		return options.requiredMessage;
	}

	if (!isReceiptEmailValid(normalizedConfirmation, options.isUsCanadaRoute)) {
		return options.invalidMessage;
	}

	if (normalizedConfirmation !== normalizedEmailAddress) {
		return options.mismatchMessage;
	}

	return undefined;
}

export function hasUsCanadaItinerary(
	segments: ReadonlyArray<{ origin: string; destination: string }>
): boolean {
	return isAnyUSRoute(segments) || isAnyCANADARoute(segments);
}

function isReceiptEmailValid(value: string, isUsCanadaRoute: boolean): boolean {
	if (!isValidEmail(value)) {
		return false;
	}

	if (isUsCanadaRoute && (value.includes("+") || value.includes("*"))) {
		return false;
	}

	return true;
}
