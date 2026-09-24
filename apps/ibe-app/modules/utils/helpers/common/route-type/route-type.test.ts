import { describe, expect, it } from "vitest";
import { isYvrRoute } from "@/modules/utils/helpers/common/route-type/route-type";

describe("route-type", () => {
	it("detects YVR route when the route string contains YVR", () => {
		expect(isYvrRoute("YVR-sin")).toBe(true);
		expect(isYvrRoute("koc-YVR")).toBe(true);
		expect(isYvrRoute("koc-sin")).toBe(false);
	});
});
