import { describe, expect, it, vi } from "vitest";
import {
	buildAvailableSeatCodeSet,
	getCancelledSeatSelections,
	getStoredSeatCode,
	hasBundleSeatUnavailable,
} from "./seat-selection-cancellation";

vi.mock("@/components/customize/seat-map/expand-cabin-rows/expand-cabin-rows", () => ({
	expandCabinRows: vi.fn((cabin: any) => cabin.rows),
}));

describe("seat-selection-cancellation", () => {
	it("builds available seat codes from expanded cabins", () => {
		const result = buildAvailableSeatCodeSet([
			{
				rows: [
					{
						seats: [
							{ code: "1A", isSeatAvailable: true },
							{ code: "1B", isSeatAvailable: false },
						],
					},
				],
			},
		] as any);

		expect(result).toEqual(new Set(["1A"]));
	});

	it("derives stored seat codes and cancelled selections", () => {
		expect(getStoredSeatCode({ row: "12", column: "A" } as any)).toBe("12A");

		const result = getCancelledSeatSelections({
			orderedPassengersWithNames: [
				{ id: "p1", firstName: "Zip", lastName: "One" },
				{ id: "p2", firstName: "Zip", lastName: "Two" },
			],
			storedPassengers: [
				{
					id: "p1",
					seats: [
						{
							lfid: 1,
							pfid: 2,
							row: "12",
							column: "A",
							serviceCode: "STFW",
							amount: 1000,
							bundleCode: "",
						},
					],
				},
				{
					id: "p2",
					seats: [
						{
							lfid: 1,
							pfid: 2,
							row: "12",
							column: "B",
							serviceCode: "STFW",
							amount: 1000,
							bundleCode: "",
						},
					],
				},
			],
			lfid: 1,
			pfid: 2,
			availableSeatCodes: new Set(["12B"]),
		});

		expect(result).toEqual([
			{
				passengerId: "p1",
				passengerName: "Zip One",
				seatCode: "12A",
				lfid: 1,
				pfid: 2,
				isAdjacentSeatRelated: false,
			},
		]);
	});

	it("cascades cancellations across associated adult and dependent seats", () => {
		const result = getCancelledSeatSelections({
			orderedPassengersWithNames: [
				{ id: "adult-1", firstName: "Adult", lastName: "One", passengerTypeCode: "adult" },
				{
					id: "child-1",
					firstName: "Child",
					lastName: "One",
					passengerTypeCode: "childC",
					associateWithPassengerId: "adult-1",
				},
			],
			storedPassengers: [
				{
					id: "adult-1",
					seats: [
						{
							lfid: 9,
							pfid: 4,
							row: "20",
							column: "A",
							serviceCode: "STFW",
							amount: 1000,
							bundleCode: "",
						},
					],
				},
				{
					id: "child-1",
					seats: [
						{
							lfid: 9,
							pfid: 4,
							row: "20",
							column: "B",
							serviceCode: "STFW",
							amount: 0,
							bundleCode: "",
						},
					],
				},
			],
			lfid: 9,
			pfid: 4,
			availableSeatCodes: new Set(["20B"]),
		});

		expect(result).toEqual([
			{
				passengerId: "adult-1",
				passengerName: "Adult One",
				seatCode: "20A",
				lfid: 9,
				pfid: 4,
				isAdjacentSeatRelated: true,
			},
			{
				passengerId: "child-1",
				passengerName: "Child One",
				seatCode: "20B",
				lfid: 9,
				pfid: 4,
				isAdjacentSeatRelated: true,
			},
		]);
	});

	it("returns true when a cancelled seat service code is included in the passenger bundle", () => {
		expect(
			hasBundleSeatUnavailable({
				cancelledSelections: [
					{
						passengerId: "p1",
						passengerName: "Zip One",
						seatCode: "12A",
						lfid: 1,
						pfid: 2,
						isAdjacentSeatRelated: false,
					},
				],
				storedPassengers: [
					{
						id: "p1",
						passengerTypeCode: "ADT",
						firstName: "Zip",
						lastName: "One",
						seats: [
							{
								lfid: 1,
								pfid: 2,
								row: "12",
								column: "A",
								serviceCode: "STFW",
								amount: 0,
							},
						],
						bundles: [
							{
								lfid: 1,
								pfid: 2,
								bundleCode: "VALU",
								bundleCategory: {
									categories: [
										{
											category: "SEAT",
											services: [{ code: "STFW" }],
										},
									],
								} as any,
							},
						],
					},
				],
				lfid: 1,
			})
		).toBe(true);
	});

	it("returns false when a cancelled passenger has a bundle but the seat is not bundle-included", () => {
		expect(
			hasBundleSeatUnavailable({
				cancelledSelections: [
					{
						passengerId: "p1",
						passengerName: "Zip One",
						seatCode: "12A",
						lfid: 1,
						pfid: 2,
						isAdjacentSeatRelated: false,
					},
				],
				storedPassengers: [
					{
						id: "p1",
						passengerTypeCode: "ADT",
						firstName: "Zip",
						lastName: "One",
						seats: [
							{
								lfid: 1,
								pfid: 2,
								row: "12",
								column: "A",
								serviceCode: "STEX",
								amount: 1200,
							},
						],
						bundles: [
							{
								lfid: 1,
								pfid: 2,
								bundleCode: "VALU",
								bundleCategory: {
									categories: [
										{
											category: "SEAT",
											services: [{ code: "STFW" }],
										},
									],
								} as any,
							},
						],
					},
				],
				lfid: 1,
			})
		).toBe(false);
	});
});
