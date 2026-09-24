import { describe, expect, it, vi } from "vitest";
import {
	getSeatMapApiError,
	getSeatMapBoundaryError,
	getSeatMapErrorCodeFromBoundaryError,
	getSeatMapErrorTitleKey,
	isNoAvailableSeatsSeatMapError,
} from "./seat-map-api-error";

vi.mock("@repo/sdk", async (importOriginal) => {
	const actual = await importOriginal<typeof import("@repo/sdk")>();

	return {
		...actual,
		getSdkApiError: vi.fn((error: unknown, fallback: string) => ({ error, fallback })),
		resolveErrorTitleKey: vi.fn((code: string) => `title:${code}`),
		getBoundaryErrorFromStatusCode: vi.fn((error: unknown, _config: unknown, prefix: string) => ({
			error,
			prefix,
		})),
		getErrorCodeFromBoundaryError: vi.fn((error: unknown, prefix: string) =>
			error ? `${prefix}CODE` : null
		),
	};
});

describe("seat-map-api-error", () => {
	it("wraps sdk error helpers", () => {
		expect(getSeatMapApiError("boom")).toMatchObject({ fallback: "Unable to fetch seat map" });
		expect(getSeatMapErrorTitleKey("ABC")).toBe("title:ABC");
		expect(getSeatMapBoundaryError({ status: 500, code: "X" } as any)).toMatchObject({
			prefix: "SEAT_MAP_API_ERROR:",
		});
		expect(getSeatMapErrorCodeFromBoundaryError({ message: "x" })).toBe("SEAT_MAP_API_ERROR:CODE");
		expect(getSeatMapErrorCodeFromBoundaryError(null)).toBeNull();
	});

	it("identifies no-available-seats seat map errors", () => {
		expect(isNoAvailableSeatsSeatMapError({ code: "NEXUZR004E052" } as any)).toBe(true);
		expect(isNoAvailableSeatsSeatMapError({ code: "NEXUZR004E051" } as any)).toBe(false);
		expect(isNoAvailableSeatsSeatMapError(undefined)).toBe(false);
	});
});
