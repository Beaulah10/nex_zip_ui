/**
 * File: assistance-service.ts
 * Description: Validates passenger assistance requirements, accompanying passenger details,
 * and wheelchair-related information based on business rules and eligibility conditions.
 */

import type { z } from "zod";
import { isUppercaseAlphabet } from "@/modules/utils/helpers/common/string-utils/string-utils";
import {
	type basePassengerSchema,
	MAX_FIELD_LENGTHS,
	type PassengerErrorLabels,
} from "@/modules/utils/validations/customer-information/customer-information-schema";
import { validateNumberRangeField } from "@/modules/utils/validations/customer-information/validate-number-range-field/validate-number-range-field";

const BLOCKED_ASSISTANCE_REASONS = ["illness", "medical-devices", "intellectual"] as const;

//.......... validation for assistance requirements ..........//
export const validateAssistanceRequirements = (
	pax: z.infer<ReturnType<typeof basePassengerSchema>>,
	ctx: z.RefinementCtx,
	t: PassengerErrorLabels
) => {
	if (!pax.requestingAssistance) return;

	// C1
	if (!pax.canManagePersonalNeeds) {
		ctx.addIssue({
			code: "custom",
			message: t("error_can_manage_personal_needs_required"),
			path: ["canManagePersonalNeeds"],
		});
		return;
	}

	// C2
	if (!pax.boardingWithAccompanion) {
		ctx.addIssue({
			code: "custom",
			message: t("error_boarding_with_accompanion_required"),
			path: ["boardingWithAccompanion"],
		});
		return;
	}

	// HARD BLOCK (MD: cannot proceed)
	if (pax.canManagePersonalNeeds === "no" && pax.boardingWithAccompanion === "no") {
		ctx.addIssue({
			code: "custom",
			message: t("error_boarding_with_accompanion_block_proceed"),
			path: ["boardingWithAccompanion"],
		});
		return;
	}

	//  C3
	if (pax.boardingWithAccompanion === "yes") {
		const hasValidAccompanyingPersonName = validateAccompanyingPersonName(
			pax.accompanyingPersonName,
			ctx,
			t
		);

		if (!hasValidAccompanyingPersonName) {
			return;
		}
	}

	// C4
	if (!pax.assistanceReasons?.length) {
		ctx.addIssue({
			code: "custom",
			message: t("error_assistance_reasons_required"),
			path: ["assistanceReasons"],
		});
		return;
	}

	// C5 — Blocking: restricted reasons require contact center, cannot proceed
	const hasBlockedReason = pax.assistanceReasons?.some((r) =>
		BLOCKED_ASSISTANCE_REASONS.includes(r as (typeof BLOCKED_ASSISTANCE_REASONS)[number])
	);
	if (hasBlockedReason) {
		ctx.addIssue({
			code: "custom",
			message: t("error_assistance_reason_block_proceed"),
			path: ["assistanceReasons"],
		});
	}
};

//............. validation for accompanying person name ............//
const validateAccompanyingPersonName = (
	accompanyingPersonName: string | undefined,
	ctx: z.RefinementCtx,
	t: PassengerErrorLabels
) => {
	if (!accompanyingPersonName) {
		ctx.addIssue({
			code: "custom",
			message: t("error_accompanying_person_name_required"),
			path: ["accompanyingPersonName"],
		});
		return false;
	}

	if (!isUppercaseAlphabet(accompanyingPersonName)) {
		ctx.addIssue({
			code: "custom",
			message: t("error_accompanying_person_name_uppercase"),
			path: ["accompanyingPersonName"],
		});
		return false;
	} else if (accompanyingPersonName.length > MAX_FIELD_LENGTHS.accompanyingPersonName) {
		ctx.addIssue({
			code: "custom",
			message: t("error_accompanying_person_name_length", {
				max: MAX_FIELD_LENGTHS.accompanyingPersonName,
			}),
			path: ["accompanyingPersonName"],
		});
		return false;
	}
	return true;
};

// ............... validation for wheelchair ...............//
export const validateWheelchairDimensions = (
	pax: z.infer<ReturnType<typeof basePassengerSchema>>,
	ctx: z.RefinementCtx,
	t: PassengerErrorLabels
) => {
	validateNumberRangeField(pax.wheelchairHeight, "wheelchairHeight", "height", ctx, t);
	validateNumberRangeField(pax.wheelchairWidth, "wheelchairWidth", "width", ctx, t);
	validateNumberRangeField(pax.wheelchairDepth, "wheelchairDepth", "depth", ctx, t);
	validateNumberRangeField(pax.wheelchairWeight, "wheelchairWeight", "weight", ctx, t);
};

export const validateWheelchairDetails = (
	pax: z.infer<ReturnType<typeof basePassengerSchema>>,
	ctx: z.RefinementCtx,
	t: PassengerErrorLabels
) => {
	if (!pax.requestingAssistance) return;
	if (!pax.assistanceReasons?.includes("wheelchair")) return;

	// C5: Must answer
	if (!pax.canWalk) {
		ctx.addIssue({
			code: "custom",
			message: t("error_can_walk_required"),
			path: ["canWalk"],
		});
		return;
	}

	//C6 (only if YES)
	if (pax.canWalk === "yes") {
		if (!pax.canGoUpDownStairs) {
			ctx.addIssue({
				code: "custom",
				message: t("error_can_go_upstairs_required"),
				path: ["canGoUpDownStairs"],
			});
			return;
		}
	}

	// C7 (ONLY if NO)
	if (pax.canWalk === "no") {
		if (!pax.needsOnboardWheelchair) {
			ctx.addIssue({
				code: "custom",
				message: t("error_needs_onboard_wheelchair_required"),
				path: ["needsOnboardWheelchair"],
			});
			return;
		}
	}

	// Only proceed AFTER C6 or C7
	const canProceed =
		(pax.canWalk === "yes" && pax.canGoUpDownStairs) ||
		(pax.canWalk === "no" && pax.needsOnboardWheelchair);

	if (!canProceed) return;

	// C8
	if (!pax.reasonForWheelchair) {
		ctx.addIssue({
			code: "custom",
			message: t("error_reason_for_wheelchair_required"),
			path: ["reasonForWheelchair"],
		});
		return;
	}

	// C9
	if (!pax.bringingOwnWheelchair) {
		ctx.addIssue({
			code: "custom",
			message: t("error_bringing_own_wheelchair_required"),
			path: ["bringingOwnWheelchair"],
		});
		return;
	}

	// Flow stop (as per MD)
	if (pax.bringingOwnWheelchair === "no") {
		return;
	}

	// C10
	if (!pax.wheelchairType) {
		ctx.addIssue({
			code: "custom",
			message: t("error_wheelchair_type_required"),
			path: ["wheelchairType"],
		});
		return;
	}

	// C11
	if (pax.wheelchairType === "manual") {
		if (!pax.isFoldable) {
			ctx.addIssue({
				code: "custom",
				message: t("error_is_foldable_required"),
				path: ["isFoldable"],
			});
			return;
		}
	}

	// C12
	if (pax.wheelchairType === "electric") {
		if (!pax.wheelchairBatteryRemovable) {
			ctx.addIssue({
				code: "custom",
				message: t("error_wheelchair_battery_removable_required"),
				path: ["wheelchairBatteryRemovable"],
			});
			return;
		}

		if (!pax.wheelchairBatteryType) {
			ctx.addIssue({
				code: "custom",
				message: t("error_wheelchair_battery_type_required"),
				path: ["wheelchairBatteryType"],
			});
			return;
		}
	}

	// C13 (Dimensions always after type)
	validateWheelchairDimensions(pax, ctx, t);
};
