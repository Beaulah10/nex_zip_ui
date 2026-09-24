import { describe, expect, it } from "vitest";
import {
	getAdjacentSeatInfoBannerMessages,
	getSeatRulesInfoMessages,
	getSeatSelectionAvailabilityDialogMessage,
	getSeatValidationErrorMessage,
	getSeatWarningBannerMessage,
} from "./seat-map-error-message";

const t = (key: string) => key;

describe("seat-map-error-message", () => {
	it("maps validation errors and warning banners", () => {
		expect(getSeatValidationErrorMessage(t, "NON_ADJACENT_OR_WRONG_ADULT")).toMatchObject({
			type: "NON_ADJACENT_OR_WRONG_ADULT",
			title: "error_labels.cant_select_seat_title",
		});
		expect(getSeatValidationErrorMessage(t, "ADJACENT_FREE_SEAT_MANDATORY")).toMatchObject({
			type: "ADJACENT_FREE_SEAT_MANDATORY",
			body: "error_labels.adjacent_free_seat_mandatory_body",
		});
		expect(getSeatValidationErrorMessage(t, "EMERGENCY_EXIT_INELIGIBLE")).toMatchObject({
			type: "EMERGENCY_EXIT_INELIGIBLE",
		});
		expect(getSeatValidationErrorMessage(t, "SEAT_SELECTION_48_HOUR_UNAVAILABLE")).toMatchObject({
			type: "SEAT_SELECTION_48_HOUR_UNAVAILABLE",
		});
		expect(getSeatValidationErrorMessage(t, "BUNDLE_SEAT_MANDATORY")).toMatchObject({
			type: "BUNDLE_SEAT_MANDATORY",
		});
		expect(getSeatWarningBannerMessage(t, "NON_RECLINING")).toMatchObject({
			type: "NON_RECLINING",
		});
		expect(getSeatWarningBannerMessage(t, "LIMITED_RECLINING")).toMatchObject({
			type: "LIMITED_RECLINING",
		});
	});

	it("builds adjacent info messages and rules by cabin type", () => {
		const zip = getAdjacentSeatInfoBannerMessages(t, "SEVEN_TO_FOURTEEN_ZIP_FULL_FLAT");
		expect(zip[2]).toMatchObject({
			linkText: "adjacent_info_guidance_link_text",
			linkHref: "https://www.zipair.net/en/ticket/u6",
		});
		const vancouver = getAdjacentSeatInfoBannerMessages(t, "ZERO_TO_FOURTEEN_VANCOUVER");
		expect(vancouver.map((message) => message.text)).toEqual([
			"adjacent_info_standard_vancouver_item_1",
			"adjacent_info_standard_vancouver_item_2",
			"adjacent_info_standard_item_3",
		]);
		expect(getAdjacentSeatInfoBannerMessages(t, "ZERO_TO_SIX")[0]?.text).toBe(
			"adjacent_info_standard_item_1"
		);
		expect(getSeatRulesInfoMessages(t, "ZIP_FULL_FLAT")).toEqual([
			"seat_rules_zip_full_flat_item_1",
		]);
		expect(getSeatRulesInfoMessages(t, "STANDARD")).toEqual([
			"seat_rules_standard_item_1",
			"seat_rules_standard_item_2",
			"seat_rules_standard_item_3",
			"seat_rules_standard_item_4",
			"seat_rules_standard_item_5",
		]);
	});

	it("builds availability dialog messages", () => {
		expect(getSeatSelectionAvailabilityDialogMessage(t, "NO_AVAILABLE_SEATS")).toMatchObject({
			title: "error_labels.no_available_seats_title",
		});
		expect(getSeatSelectionAvailabilityDialogMessage(t, "NO_ADJACENT_SEATS")).toMatchObject({
			title: "error_labels.no_adjacent_seats_title",
		});
		const content = getSeatSelectionAvailabilityDialogMessage(
			t,
			"UNAVAILABLE_SELECTED_SEAT"
		).content;

		expect(content).toContain("error_labels.cancelled_selection_content_line_1");

		expect(content).toContain("error_labels.cancelled_selection_content_line_2");

		expect(
			getSeatSelectionAvailabilityDialogMessage(t, "UNAVAILABLE_SELECTED_SEAT", {
				useAdjacentSeatCancellationMessage: true,
			}).content
		).toBe("error_labels.cancelled_adjacent_selection_content");
	});
});
