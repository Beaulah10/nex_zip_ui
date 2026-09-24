import { describe, expect, it } from "vitest";
import { buildSeatMapFromApiResponse } from "./build-seat-map-utils";

describe("buildSeatMapFromApiResponse", () => {
	it("builds a standard cabin and filters aisle placeholders", () => {
		const result = buildSeatMapFromApiResponse(
			[
				{
					row: 12,
					seats: [
						{
							column: "A",
							isSeatAvailable: true,
							amount: 100,
							serviceCode: "STFW",
						},
						{
							column: "",
							isSeatAvailable: true,
							amount: 0,
							serviceCode: "",
						},
						{
							column: "Z",
							isSeatAvailable: false,
							amount: 200,
							serviceCode: "STEX",
						},
					],
				},
			] as any,
			"Standard"
		);

		expect(result[0]).toMatchObject({
			name: "Standard",
			class: "Standard",
		});

		const firstRow = result[0]?.rows[0] as any;

		expect(firstRow.layout).toBe("3-3-3");
		expect(firstRow.seats).toHaveLength(2);

		expect(firstRow.seats[1]).toMatchObject({
			seat: "12Z",
			type: "Middle",
			isSeatAvailable: false,
			amount: 200,
			serviceCode: "STEX",
		});
	});

	it("builds a zip full flat cabin name and layout", () => {
		const result = buildSeatMapFromApiResponse([{ row: 1, seats: [] }] as any, "ZipFullFlat");

		expect(result[0]).toMatchObject({
			name: "ZIP Full Flat",
			class: "ZipFullFlat",
		});

		expect(result[0]?.rows[0]?.layout).toBe("1-1");
	});
});
