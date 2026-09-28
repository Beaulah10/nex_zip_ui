import { describe, expect, it, vi } from "vitest";
import { getActiveSeatMapSegment, getPassengerBundleCodeByLfid } from "./seat-map-segment-utils";

vi.mock("@/modules/utils/helpers/common/flow-router/flow-router", () => ({
	getBookingStageSegment: vi.fn(({ direction }: { direction: string }) => direction),
}));

const confirmedFlight = {
	flights: {
		outbound: {
			segments: [
				{ lfid: 1, origin: "NRT", destination: "BKK" },
				{ lfid: 2, origin: "BKK", destination: "SIN" },
			],
		},
		inbound: { segments: [{ lfid: 3, origin: "SIN", destination: "NRT" }] },
	},
} as any;

describe("seat-map-segment-utils", () => {
	it("prefers logical flight id matches and falls back by stage", () => {
		expect(
			getActiveSeatMapSegment({ confirmedFlight, direction: "outbound", logicalFlightId: 3 })?.lfid
		).toBe(3);
		expect(getActiveSeatMapSegment({ confirmedFlight, direction: "segment2" as any })?.lfid).toBe(
			3
		);
		expect(getActiveSeatMapSegment({ confirmedFlight, direction: "inbound" as any })?.lfid).toBe(3);
		expect(getActiveSeatMapSegment({ confirmedFlight, direction: "outbound" as any })?.lfid).toBe(
			1
		);
		expect(
			getActiveSeatMapSegment({ confirmedFlight: undefined, direction: "outbound" as any })
		).toBeUndefined();
	});

	it("gets passenger bundle codes by lfid", () => {
		expect(
			getPassengerBundleCodeByLfid({ bundles: [{ lfid: 1, bundleCode: "VALK" }] } as any, 1)
		).toBe("VALK");
		expect(
			getPassengerBundleCodeByLfid({ bundles: [{ lfid: 1, bundleCode: "VALK" }] } as any, 2)
		).toBeUndefined();
		expect(getPassengerBundleCodeByLfid({} as any, undefined)).toBeUndefined();
	});
});
