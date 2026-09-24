import { describe, expect, it, vi } from "vitest";
import { expandCabinRows } from "./expand-cabin-rows";

vi.mock("@/modules/utils/helpers/seat-map/seat-status-utils/seat-status-utils", () => ({
	getSeatStatusFromServiceCode: vi.fn((serviceCode: string) =>
		serviceCode === "mapped" ? "rear-tier" : "front-tier"
	),
}));

describe("expandCabinRows", () => {
	it("expands fixed rows and marks unavailable seats as not-selectable", () => {
		const result = expandCabinRows({
			name: "Standard",
			class: "Standard",
			rows: [
				{
					row: 10,
					layout: "3-3-3",
					seats: [
						{
							seat: "10A",
							type: "Window",
							isSeatAvailable: false,
							amount: 100,
							serviceCode: "mapped",
						},
					],
				},
			],
		});

		expect(result[0]?.seats[0]).toMatchObject({
			code: "10A",
			column: "A",
			status: "not-selectable",
		});
	});

	it("expands template row ranges into synthetic seats", () => {
		const result = expandCabinRows({
			name: "ZIP Full Flat",
			class: "ZipFullFlat",
			rows: [{ rowRange: "1-2", layout: "1-1", templateSeats: [{ column: "A", type: "Window" }] }],
		});

		expect(result).toHaveLength(2);
		expect(result[0]?.seats[0]).toMatchObject({
			code: "1A",
			amount: 0,
			serviceCode: "",
			status: "front-tier",
		});
		expect(result[1]?.seats[0]).toMatchObject({ code: "2A" });
	});
});
