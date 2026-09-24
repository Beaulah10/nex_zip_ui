import { describe, expect, it } from "vitest";
import { getSeatStatusFromServiceCode } from "./seat-status-utils";

describe("getSeatStatusFromServiceCode", () => {
	it("returns central for zip full flat service code", () => {
		expect(getSeatStatusFromServiceCode("STZF", "Window")).toBe("central");
	});

	it("maps known codes and falls back to front-tier", () => {
		expect(getSeatStatusFromServiceCode("STEX", "Aisle")).toBe("exit-row");
		expect(getSeatStatusFromServiceCode("UNKNOWN", "Middle")).toBe("front-tier");
	});
});
