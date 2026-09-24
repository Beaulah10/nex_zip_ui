import { describe, expect, it } from "vitest";
import { buildReceiptPassengerOptions, RECEIPT_MANUAL_VALUE } from "./issuance-of-receipt.utils";

describe("issuance-of-receipt.utils", () => {
	it("exports the manual receipt value constant", () => {
		expect(RECEIPT_MANUAL_VALUE).toBe("manual");
	});

	it("builds passenger options with uppercase names and trimmed emails", () => {
		expect(
			buildReceiptPassengerOptions([
				{
					id: "P1",
					firstName: "John",
					middleName: "Q",
					lastName: "Smith",
					contactInformation: { email: " john@example.com  " },
				},
			])
		).toEqual([
			{
				value: "P1",
				label: "JOHN Q SMITH",
				email: "john@example.com",
			},
		]);
	});

	it("falls back to id when no name parts are available", () => {
		expect(buildReceiptPassengerOptions([{ id: "P2" }])).toEqual([
			{ value: "P2", label: "P2", email: "" },
		]);
	});
});
