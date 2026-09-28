import { describe, expect, it } from "vitest";
import { normalizePassengerType, toApiPassengerType } from "./passenger-type-code";

describe("passenger-type-code", () => {
	it("normalizes API aliases to shared internal keys", () => {
		expect(normalizePassengerType("ADT")).toBe("adult");
		expect(normalizePassengerType("CHD")).toBe("childa");
		expect(normalizePassengerType("CHDA")).toBe("childa");
		expect(normalizePassengerType("CHDB")).toBe("childb");
		expect(normalizePassengerType("CHDC")).toBe("childc");
		expect(normalizePassengerType("INF")).toBe("infant");
	});

	it("formats passenger types for API payloads", () => {
		expect(toApiPassengerType("adult")).toBe("Adult");
		expect(toApiPassengerType("ADT")).toBe("Adult");
		expect(toApiPassengerType("CHD")).toBe("ChildA");
		expect(toApiPassengerType("CHDB")).toBe("ChildB");
		expect(toApiPassengerType("CHDC")).toBe("ChildC");
		expect(toApiPassengerType("INF")).toBe("Infant");
	});
});
