import { describe, expect, it } from "vitest";
import { formatPrice } from "./currency-formatter";

describe("formatPrice", () => {
	it("formats amounts as JPY with no fraction digits", () => {
		expect(formatPrice(12345)).toBe("￥12,345");
	});
});
