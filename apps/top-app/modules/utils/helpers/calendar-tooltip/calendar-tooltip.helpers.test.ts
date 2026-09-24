import { describe, expect, it } from "vitest";
import {
	generateTooltipText,
	getTooltipState,
	shouldShowTooltip,
	type TooltipContext,
} from "./calendar-tooltip.helpers";

const baseContext: TooltipContext = {
	date: new Date(2026, 6, 12),
	seatType: "standard",
	currencySymbol: "¥",
	fareData: {
		"2026-07-12": { standard: 12000, zipFullFlat: 21000 },
	},
	isOutOfRange: false,
	isBeforeDeparture: false,
	isLoading: false,
};

describe("calendar-tooltip-helpers", () => {
	it("resolves tooltip states for edge cases", () => {
		expect(getTooltipState({ ...baseContext, isOutOfRange: true })).toBe("past-date");
		expect(getTooltipState({ ...baseContext, isLoading: true })).toBe("loading");
		expect(getTooltipState({ ...baseContext, isBeforeDeparture: true })).toBe("invalid-date");
		expect(getTooltipState({ ...baseContext, fareData: {} })).toBe("no-seats");
		expect(
			getTooltipState({
				...baseContext,
				seatType: "zip",
				fareData: { "2026-07-12": { standard: 12000 } },
			})
		).toBe("alt-seat");
		expect(getTooltipState(baseContext)).toBe("available");
	});

	it("builds tooltip text by state", () => {
		expect(generateTooltipText(baseContext)).toContain("¥12,000");
		expect(generateTooltipText({ ...baseContext, fareData: {} })).toContain(
			"There are no available seats"
		);
		expect(generateTooltipText({ ...baseContext, isBeforeDeparture: true })).toContain(
			"This date cannot be selected"
		);
		expect(generateTooltipText({ ...baseContext, isLoading: true })).toBe("");
	});

	it("hides tooltip for non-display states", () => {
		expect(shouldShowTooltip("available")).toBe(true);
		expect(shouldShowTooltip("loading")).toBe(false);
		expect(shouldShowTooltip("past-date")).toBe(false);
	});
});
