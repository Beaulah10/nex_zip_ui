import { describe, expect, it } from "vitest";
import {
	formatRequiredSeatSelectionText,
	formatSeatSelectedText,
	getSeatSelectionProgressSummary,
} from "@/modules/utils/helpers/seat-map/seat-selection-summary/seat-selection-summary";

const labels = {
	selectedSingle: (count: number) => `✓ ${count} seat selected`,
	selectedMultiple: (count: number) => `✓ ${count} seats selected`,
	requiredSingle: (count: number) => `! ${count} free seat selection required`,
	requiredMultiple: (count: number) => `! ${count} free seat selections required`,
	allSelected: "✓ All complimentary seats selected",
};

describe("seat-selection-summary", () => {
	it("formats seat selection labels", () => {
		expect(formatSeatSelectedText(0, labels)).toBeUndefined();
		expect(formatSeatSelectedText(1, labels)).toBe("✓ 1 seat selected");
		expect(formatSeatSelectedText(2, labels)).toBe("✓ 2 seats selected");

		expect(formatRequiredSeatSelectionText(0, labels)).toBeUndefined();
		expect(formatRequiredSeatSelectionText(1, labels)).toBe("! 1 free seat selection required");
		expect(formatRequiredSeatSelectionText(2, labels)).toBe("! 2 free seat selections required");
	});

	it("shows only remaining complimentary seat requirements when nothing is selected", () => {
		expect(
			getSeatSelectionProgressSummary({
				currentLfid: 1001,
				servicePassengers: [
					{ id: "P1", bundleCode: "VALB", passengerTypeCode: "adult" },
					{ id: "P2", bundleCode: "VALB", passengerTypeCode: "adult" },
				],
				adjacentPassengers: [
					{ id: "P1", passengerTypeCode: "adult" },
					{ id: "P2", passengerTypeCode: "adult" },
				],
				storedPassengers: [{ id: "P1" }, { id: "P2" }],
				labels,
			})
		).toMatchObject({
			selectedItemsText: undefined,
			freeItemsText: "! 2 free seat selections required",
			entitledSeatCount: 2,
			selectedSeatCount: 0,
			remainingBundleRequiredSeatCount: 2,
			remainingAdjacentRequiredSeatCount: 0,
			remainingRequiredSeatCount: 2,
		});
	});

	it("shows partial completion when some complimentary seats remain", () => {
		expect(
			getSeatSelectionProgressSummary({
				currentLfid: 1001,
				servicePassengers: [
					{ id: "P1", bundleCode: "VALB", passengerTypeCode: "adult" },
					{ id: "P2", bundleCode: "PREM", passengerTypeCode: "adult" },
				],
				adjacentPassengers: [
					{ id: "P1", passengerTypeCode: "adult" },
					{ id: "P2", passengerTypeCode: "adult" },
				],
				storedPassengers: [{ id: "P1", seats: [{ lfid: 1001 }] }, { id: "P2" }],
				labels,
			})
		).toMatchObject({
			selectedItemsText: "✓ 1 seat selected",
			freeItemsText: "! 1 free seat selection required",
			entitledSeatCount: 2,
			selectedSeatCount: 1,
			remainingBundleRequiredSeatCount: 1,
			remainingAdjacentRequiredSeatCount: 0,
			remainingRequiredSeatCount: 1,
		});
	});

	it("shows completion when all complimentary seats are selected", () => {
		expect(
			getSeatSelectionProgressSummary({
				currentLfid: 1001,
				servicePassengers: [
					{ id: "P1", bundleCode: "VALB", passengerTypeCode: "adult" },
					{ id: "P2", bundleCode: "PREM", passengerTypeCode: "adult" },
					{ id: "INF1", bundleCode: "VALB", passengerTypeCode: "infant" },
				],
				adjacentPassengers: [
					{ id: "P1", passengerTypeCode: "adult" },
					{ id: "P2", passengerTypeCode: "adult" },
					{ id: "INF1", passengerTypeCode: "infant" },
				],
				storedPassengers: [
					{ id: "P1", seats: [{ lfid: 1001 }] },
					{ id: "P2", seats: [{ lfid: 1001 }] },
					{ id: "INF1" },
				],
				labels,
			})
		).toMatchObject({
			selectedItemsText: "✓ All complimentary seats selected",
			freeItemsText: undefined,
			entitledSeatCount: 2,
			selectedSeatCount: 2,
			remainingBundleRequiredSeatCount: 0,
			remainingAdjacentRequiredSeatCount: 0,
			remainingRequiredSeatCount: 0,
		});
	});

	it("includes adjacent-seat complimentary entitlements in the remaining count", () => {
		expect(
			getSeatSelectionProgressSummary({
				currentLfid: 1001,
				servicePassengers: [
					{ id: "ADT1", bundleCode: "NOBN", passengerTypeCode: "adult" },
					{ id: "CHD1", bundleCode: "NOBN", passengerTypeCode: "child" },
				],
				adjacentPassengers: [
					{ id: "ADT1", passengerTypeCode: "adult" },
					{
						id: "CHD1",
						passengerTypeCode: "child",
						associateWithPassengerId: "ADT1",
					},
				],
				storedPassengers: [{ id: "ADT1" }, { id: "CHD1" }],
				labels,
			})
		).toMatchObject({
			selectedItemsText: undefined,
			freeItemsText: "! 2 free seat selections required",
			entitledSeatCount: 2,
			selectedSeatCount: 0,
			remainingBundleRequiredSeatCount: 0,
			remainingAdjacentRequiredSeatCount: 2,
			remainingRequiredSeatCount: 2,
		});
	});

	it("deduplicates bundle and adjacent-seat complimentary entitlements", () => {
		expect(
			getSeatSelectionProgressSummary({
				currentLfid: 1001,
				servicePassengers: [
					{ id: "ADT1", bundleCode: "VALB", passengerTypeCode: "adult" },
					{ id: "CHD1", bundleCode: "NOBN", passengerTypeCode: "child" },
				],
				adjacentPassengers: [
					{ id: "ADT1", passengerTypeCode: "adult" },
					{
						id: "CHD1",
						passengerTypeCode: "child",
						associateWithPassengerId: "ADT1",
					},
				],
				storedPassengers: [{ id: "ADT1", seats: [{ lfid: 1001 }] }, { id: "CHD1" }],
				labels,
			})
		).toMatchObject({
			selectedItemsText: "✓ 1 seat selected",
			freeItemsText: "! 1 free seat selection required",
			entitledSeatCount: 2,
			selectedSeatCount: 1,
			remainingBundleRequiredSeatCount: 0,
			remainingAdjacentRequiredSeatCount: 1,
			remainingRequiredSeatCount: 1,
		});
	});

	it("tracks bundle and adjacent remaining counts separately when both rules apply", () => {
		expect(
			getSeatSelectionProgressSummary({
				currentLfid: 1001,
				servicePassengers: [
					{ id: "ADT1", bundleCode: "VALB", passengerTypeCode: "adult" },
					{ id: "ADT2", bundleCode: "VALB", passengerTypeCode: "adult" },
					{ id: "CHD1", bundleCode: "NOBN", passengerTypeCode: "child" },
				],
				adjacentPassengers: [
					{ id: "ADT1", passengerTypeCode: "adult" },
					{ id: "ADT2", passengerTypeCode: "adult" },
					{
						id: "CHD1",
						passengerTypeCode: "child",
						associateWithPassengerId: "ADT1",
					},
				],
				storedPassengers: [{ id: "ADT1", seats: [{ lfid: 1001 }] }, { id: "ADT2" }, { id: "CHD1" }],
				labels,
			})
		).toMatchObject({
			remainingBundleRequiredSeatCount: 1,
			remainingAdjacentRequiredSeatCount: 1,
			remainingRequiredSeatCount: 2,
		});
	});
});
