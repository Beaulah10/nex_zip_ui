/**
 * File: seat-map-error-message.ts
 * Description: Provides localized seat selection validation, warning banner, information banner,
 * seat rules, and availability dialog messages used throughout the seat map experience.
 */

import { ADJACENT_SEATING_GUIDANCE_URL } from "@/modules/utils/constants/seat-map/seat-map.constants";
import type {
	AdjacentInfoBannerMessage,
	SeatSelectionDialogType,
} from "@/types/seat-map/seat-map.types";
import type {
	AdjacentRuleVariant,
	CabinType,
	SeatValidationError,
	SeatValidationErrorType,
	SeatWarningBanner,
	SeatWarningBannerType,
} from "@/types/seat-map/seat-validation.types";

type TranslateFn = (key: string) => string;

function createAdjacentInfoMessage(
	t: TranslateFn,
	text: string,
	includeGuidanceLink = false
): AdjacentInfoBannerMessage {
	return includeGuidanceLink
		? {
				text,
				linkText: t("adjacent_info_guidance_link_text"),
				linkHref: ADJACENT_SEATING_GUIDANCE_URL,
				linkTarget: "_blank",
			}
		: { text };
}

export interface SeatSelectionAvailabilityDialogMessage {
	title: string;
	content: string;
	buttonLabel: string;
}

export function getSeatValidationErrorMessage(
	t: TranslateFn,
	errorType: SeatValidationErrorType
): SeatValidationError {
	switch (errorType) {
		case "NON_ADJACENT_OR_WRONG_ADULT":
			return {
				type: errorType,
				title: t("error_labels.cant_select_seat_title"),
				body: t("error_labels.cant_select_seat_body"),
			};
		case "ADJACENT_FREE_SEAT_MANDATORY":
			return {
				type: errorType,
				title: t("error_labels.bundle_mandatory_title"),
				body: t("error_labels.adjacent_free_seat_mandatory_body"),
			};
		case "EMERGENCY_EXIT_INELIGIBLE":
			return {
				type: errorType,
				title: t("error_labels.emergency_exit_title"),
				body: t("error_labels.emergency_exit_body"),
			};
		case "SEAT_SELECTION_48_HOUR_UNAVAILABLE":
			return {
				type: errorType,
				title: t("error_labels.seat_selection_48_hour_title"),
				body: t("error_labels.seat_selection_48_hour_body"),
			};
		case "BUNDLE_SEAT_MANDATORY":
			return {
				type: errorType,
				title: t("error_labels.bundle_mandatory_title"),
				body: t("error_labels.bundle_mandatory_body"),
			};
	}
}

export function getSeatWarningBannerMessage(
	t: TranslateFn,
	warningType: SeatWarningBannerType
): SeatWarningBanner {
	switch (warningType) {
		case "NON_RECLINING":
			return {
				type: warningType,
				title: t("error_labels.non_reclining_title"),
				body: t("error_labels.non_reclining_body"),
			};
		case "LIMITED_RECLINING":
			return {
				type: warningType,
				title: t("error_labels.limited_reclining_title"),
				body: t("error_labels.limited_reclining_body"),
			};
	}
}

export function getAdjacentSeatInfoBannerMessages(
	t: TranslateFn,
	ruleVariant: AdjacentRuleVariant
): AdjacentInfoBannerMessage[] {
	if (ruleVariant === "SEVEN_TO_FOURTEEN_ZIP_FULL_FLAT") {
		return [
			createAdjacentInfoMessage(t, t("adjacent_info_zip_full_flat_item_1")),
			createAdjacentInfoMessage(t, t("adjacent_info_zip_full_flat_item_2")),
			createAdjacentInfoMessage(t, t("adjacent_info_zip_full_flat_item_3"), true),
		];
	}

	if (ruleVariant === "ZERO_TO_FOURTEEN_VANCOUVER") {
		return [
			createAdjacentInfoMessage(t, t("adjacent_info_standard_vancouver_item_1")),
			createAdjacentInfoMessage(t, t("adjacent_info_standard_vancouver_item_2")),
			createAdjacentInfoMessage(t, t("adjacent_info_standard_item_3"), true),
		];
	}

	return [
		createAdjacentInfoMessage(t, t("adjacent_info_standard_item_1")),
		createAdjacentInfoMessage(t, t("adjacent_info_standard_item_2")),
		createAdjacentInfoMessage(t, t("adjacent_info_standard_item_3"), true),
	];
}

export function getSeatRulesInfoMessages(t: TranslateFn, cabinType: CabinType): string[] {
	if (cabinType === "ZIP_FULL_FLAT") {
		return [t("seat_rules_zip_full_flat_item_1")];
	}

	return [
		t("seat_rules_standard_item_1"),
		t("seat_rules_standard_item_2"),
		t("seat_rules_standard_item_3"),
		t("seat_rules_standard_item_4"),
		t("seat_rules_standard_item_5"),
	];
}

export function getSeatSelectionAvailabilityDialogMessage(
	t: TranslateFn,
	dialogType: SeatSelectionDialogType,
	options?: {
		useAdjacentSeatCancellationMessage?: boolean;
	}
): SeatSelectionAvailabilityDialogMessage {
	switch (dialogType) {
		case "NO_AVAILABLE_SEATS":
			return {
				title: t("error_labels.no_available_seats_title"),
				content: t("error_labels.no_available_seats_content"),
				buttonLabel: t("error_labels.no_available_seats_button"),
			};

		case "NO_ADJACENT_SEATS":
			return {
				title: t("error_labels.no_adjacent_seats_title"),
				content: t("error_labels.no_adjacent_seats_content"),
				buttonLabel: t("error_labels.no_adjacent_seats_button"),
			};

		case "UNAVAILABLE_SELECTED_SEAT":
			return {
				title: t("error_labels.cancelled_selection_title"),
				content: options?.useAdjacentSeatCancellationMessage
					? t("error_labels.cancelled_adjacent_selection_content")
					: [
							t("error_labels.cancelled_selection_content_line_1"),
							t("error_labels.cancelled_selection_content_line_2"),
						].join(" "),
				buttonLabel: t("error_labels.cancelled_selection_ok_button"),
			};
	}
}
