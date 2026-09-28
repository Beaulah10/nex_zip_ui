/**
 * File: travel-documents-utils.test.ts
 * Classification: Helper
 * Description: Tests for travel document helper functions.
 * Covers route detection, document type options, deadline check, and segment-based helpers.
 */

import { describe, expect, it } from "vitest";
import {
	getRouteType,
	isAnyICNRoute,
	isAnyUSRoute,
	isDestinationCanada,
	isDestinationThai,
	isDestinationUS,
	isUSDeparture,
} from "@/modules/utils/helpers/common/country-utils/country-utils";
import {
	type FlightSegment,
	getDocumentTypeOptions,
	isNRTDirectOrRoundTrip,
} from "@/modules/utils/helpers/customer-information/travel-documents-utils/travel-documents-utils";

// ── getRouteType ──────────────────────────────────────────────────────────────

describe("getRouteType", () => {
	it("returns 'US' for HNL", () => expect(getRouteType("HNL")).toBe("US"));
	it("returns 'US' for SFO", () => expect(getRouteType("SFO")).toBe("US"));
	it("returns 'US' for LAX", () => expect(getRouteType("LAX")).toBe("US"));
	it("returns 'THAI' for BKK", () => expect(getRouteType("BKK")).toBe("THAI"));
	it("returns 'OTHER' for NRT", () => expect(getRouteType("NRT")).toBe("OTHER"));
	it("returns 'OTHER' for unknown code", () => expect(getRouteType("XYZ")).toBe("OTHER"));
});

// ── isUSRoute / isThaiRoute ───────────────────────────────────────────────────

describe("isDestinationUS", () => {
	it("returns true for HNL", () =>
		expect(isDestinationUS([{ origin: "SFO", destination: "HNL" }])).toBe(true));
	it("returns false for BKK", () =>
		expect(isDestinationUS([{ origin: "SFO", destination: "BKK" }])).toBe(false));
	it("returns false for NRT", () =>
		expect(isDestinationUS([{ origin: "SFO", destination: "NRT" }])).toBe(false));
});

describe("isDestinationThai", () => {
	it("returns true for BKK", () =>
		expect(isDestinationThai([{ origin: "SFO", destination: "BKK" }])).toBe(true));
	it("returns false for SFO", () =>
		expect(isDestinationThai([{ origin: "SFO", destination: "SFO" }])).toBe(false));
	it("returns false for NRT", () =>
		expect(isDestinationThai([{ origin: "SFO", destination: "NRT" }])).toBe(false));
});

describe("isDestinationCanada", () => {
	it("returns true for YVR", () =>
		expect(isDestinationCanada([{ origin: "SFO", destination: "YVR" }])).toBe(true));
	it("returns false for SFO", () =>
		expect(isDestinationCanada([{ origin: "SFO", destination: "SFO" }])).toBe(false));
	it("returns false for NRT", () =>
		expect(isDestinationCanada([{ origin: "SFO", destination: "NRT" }])).toBe(false));
});

// ── getDocumentTypeOptions ────────────────────────────────────────────────────

describe("getDocumentTypeOptions", () => {
	it("returns US options when isUS is true", () => {
		const opts = getDocumentTypeOptions(true);
		expect(opts.length).toBeGreaterThan(2);
		const values = opts.map((o) => o.value);
		expect(values).toContain("resident-alien-card");
		expect(values).toContain("military-id");
	});

	it("returns default options when isUS is false", () => {
		const opts = getDocumentTypeOptions(false);
		const values = opts.map((o) => o.value);
		expect(values).not.toContain("resident-alien-card");
		expect(values).not.toContain("military-id");
	});
});

// ── isAnyUSRoute ──────────────────────────────────────────────────────────────

describe("isAnyICNRoute", () => {
	it("returns true when a segment originates at ICN", () => {
		expect(isAnyICNRoute([{ origin: "ICN", destination: "NRT" }])).toBe(true);
	});

	it("returns true when a later segment arrives at ICN", () => {
		expect(
			isAnyICNRoute([
				{ origin: "NRT", destination: "SFO" },
				{ origin: "SFO", destination: "ICN" },
			])
		).toBe(true);
	});

	it("returns false when no segment involves ICN", () => {
		expect(isAnyICNRoute([{ origin: "NRT", destination: "SFO" }])).toBe(false);
	});
});

describe("isAnyUSRoute", () => {
	it("returns true when a segment origin is a US airport", () => {
		const segments: FlightSegment[] = [{ origin: "SFO", destination: "NRT" }];
		expect(isAnyUSRoute(segments)).toBe(true);
	});

	it("returns true when a segment destination is a US airport", () => {
		const segments: FlightSegment[] = [{ origin: "NRT", destination: "HNL" }];
		expect(isAnyUSRoute(segments)).toBe(true);
	});

	it("returns false when no segment involves a US airport", () => {
		const segments: FlightSegment[] = [
			{ origin: "NRT", destination: "BKK" },
			{ origin: "BKK", destination: "NRT" },
		];
		expect(isAnyUSRoute(segments)).toBe(false);
	});

	it("returns false for empty segments array", () => {
		expect(isAnyUSRoute([])).toBe(false);
	});
});

// ── isUSDeparture ─────────────────────────────────────────────────────────────

describe("isUSDeparture", () => {
	it("returns true when first segment departure is a US airport", () => {
		const segments: FlightSegment[] = [{ origin: "LAX", destination: "NRT" }];
		expect(isUSDeparture(segments)).toBe(true);
	});

	it("returns false when first segment departure is not a US airport", () => {
		const segments: FlightSegment[] = [{ origin: "NRT", destination: "SFO" }];
		expect(isUSDeparture(segments)).toBe(false);
	});

	it("returns false for empty segments array", () => {
		expect(isUSDeparture([])).toBe(false);
	});
});
// ── isNRTDirectOrRoundTrip ────────────────────────────────────────────────────

describe("isNRTDirectOrRoundTrip", () => {
	it("returns true for a one-way flight to NRT", () => {
		const segments: FlightSegment[] = [{ origin: "SFO", destination: "NRT" }];
		expect(isNRTDirectOrRoundTrip(segments)).toBe(true);
	});

	it("returns false for a one-way flight away from NRT", () => {
		const segments: FlightSegment[] = [{ origin: "NRT", destination: "SFO" }];
		expect(isNRTDirectOrRoundTrip(segments)).toBe(false);
	});

	it("returns true for round trip NRT→X→NRT (origin is NRT)", () => {
		const segments: FlightSegment[] = [
			{ origin: "NRT", destination: "SFO" },
			{ origin: "SFO", destination: "NRT" },
		];
		expect(isNRTDirectOrRoundTrip(segments)).toBe(true);
	});

	it("returns true for round trip X→NRT→X (destination is NRT first)", () => {
		const segments: FlightSegment[] = [
			{ origin: "SFO", destination: "NRT" },
			{ origin: "NRT", destination: "SFO" },
		];
		expect(isNRTDirectOrRoundTrip(segments)).toBe(true);
	});

	it("returns false when 2 segments include NRT but are not reverse legs", () => {
		const segments: FlightSegment[] = [
			{ origin: "SFO", destination: "NRT" },
			{ origin: "NRT", destination: "BKK" },
		];
		expect(isNRTDirectOrRoundTrip(segments)).toBe(false);
	});

	it("returns false for a 3-segment itinerary (multi-city)", () => {
		const segments: FlightSegment[] = [
			{ origin: "SFO", destination: "ICN" },
			{ origin: "ICN", destination: "NRT" },
			{ origin: "NRT", destination: "SFO" },
		];
		expect(isNRTDirectOrRoundTrip(segments)).toBe(false);
	});

	it("returns false for empty segments array", () => {
		expect(isNRTDirectOrRoundTrip([])).toBe(false);
	});

	it("returns false when 2-segment route does not involve NRT as expected", () => {
		const segments: FlightSegment[] = [
			{ origin: "SFO", destination: "BKK" },
			{ origin: "BKK", destination: "SFO" },
		];
		expect(isNRTDirectOrRoundTrip(segments)).toBe(false);
	});
});
