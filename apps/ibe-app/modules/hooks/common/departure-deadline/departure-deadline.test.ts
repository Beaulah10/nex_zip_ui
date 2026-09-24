import { renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import {
	getBundleDeadlineHours,
	getRemainingHours,
	is24HourDeadlineExceeded,
	is48HourDeadlineExceeded,
	is96HourDeadlineExceeded,
	isBookingCutoffExceeded,
	isBundlePurchaseDeadlineExceeded,
	isDeadlineExceeded,
	resolveDepartureDateTime,
	useDepartureDeadline,
} from "@/modules/hooks/common/departure-deadline/departure-deadline";

const mocks = vi.hoisted(() => ({
	confirmedFlight: null as null | Record<string, unknown>,
	getBundleSegment: vi.fn(),
	isNRTToICNRoute: vi.fn(),
	useAppSelector: vi.fn(),
}));

vi.mock("@/modules/utils/helpers/bundle/bundle.helpers", () => ({
	getBundleSegment: mocks.getBundleSegment,
}));

vi.mock("@/modules/utils/helpers/common/country-utils/country-utils", () => ({
	isNRTToICNRoute: mocks.isNRTToICNRoute,
}));

vi.mock("@/store/hooks", () => ({
	useAppSelector: mocks.useAppSelector,
}));

vi.mock("@/store/slices/flight-selection/flight-selection.slice", () => ({
	selectConfirmedFlight: vi.fn(),
}));

describe("departure timestamp handling", () => {
	it("uses the full departure timestamp instead of an offset-only value", () => {
		const now = new Date("2026-08-01T00:00:00Z");
		expect(isDeadlineExceeded("2026-08-02T00:00:00+09:00", 24, now)).toBe(true);
	});

	it("prefers a valid combined offset timestamp and falls back through the available sources", () => {
		expect(
			resolveDepartureDateTime({
				departureDateTime: "2026-08-02T00:00:00",
				departureDateTimeOffset: "+09:00",
			})
		).toBe("2026-08-02T00:00:00+09:00");

		expect(
			resolveDepartureDateTime({
				departureDateTime: "invalid",
				departureDateTimeOffset: "2026-08-02T00:00:00+09:00",
			})
		).toBe("2026-08-02T00:00:00+09:00");

		expect(
			resolveDepartureDateTime({
				departureDateTime: "2026-08-02T00:00:00Z",
				departureDateTimeOffset: "invalid",
			})
		).toBe("2026-08-02T00:00:00Z");

		expect(
			resolveDepartureDateTime({
				departureDateTime: undefined,
				departureDateTimeOffset: "not-a-date",
			})
		).toBe("not-a-date");
	});

	it("checks the booking cutoff window separately from the day-based deadlines", () => {
		const soon = new Date(Date.now() + 30 * 60 * 1000).toISOString();
		const later = new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString();

		expect(isBookingCutoffExceeded(soon)).toBe(true);
		expect(isBookingCutoffExceeded(later)).toBe(false);
	});
});

describe("is24HourDeadlineExceeded", () => {
	it("returns true when departure is less than 24 hours away", () => {
		const soon = new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString();
		expect(is24HourDeadlineExceeded(soon)).toBe(true);
	});

	it("returns false when departure is more than 24 hours away", () => {
		const later = new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString();
		expect(is24HourDeadlineExceeded(later)).toBe(false);
	});

	it("returns true when departure is in the past", () => {
		const past = new Date(Date.now() - 60 * 60 * 1000).toISOString();
		expect(is24HourDeadlineExceeded(past)).toBe(true);
	});
});

describe("is48HourDeadlineExceeded", () => {
	it("returns true when departure is less than 48 hours away", () => {
		const soon = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
		expect(is48HourDeadlineExceeded(soon)).toBe(true);
	});

	it("returns false when departure is more than 48 hours away", () => {
		const later = new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString();
		expect(is48HourDeadlineExceeded(later)).toBe(false);
	});

	it("returns true when departure is in the past", () => {
		const past = new Date(Date.now() - 60 * 60 * 1000).toISOString();
		expect(is48HourDeadlineExceeded(past)).toBe(true);
	});
});

describe("is96HourDeadlineExceeded", () => {
	it("returns true when departure is less than 96 hours away", () => {
		const soon = new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString();
		expect(is96HourDeadlineExceeded(soon)).toBe(true);
	});

	it("returns false when departure is more than 96 hours away", () => {
		const later = new Date(Date.now() + 120 * 60 * 60 * 1000).toISOString();
		expect(is96HourDeadlineExceeded(later)).toBe(false);
	});

	it("returns true when departure is in the past", () => {
		const past = new Date(Date.now() - 60 * 60 * 1000).toISOString();
		expect(is96HourDeadlineExceeded(past)).toBe(true);
	});
});

describe("getBundleDeadlineHours", () => {
	it("returns 24 for NRT to ICN route", () => {
		mocks.isNRTToICNRoute.mockReturnValue(true);
		expect(getBundleDeadlineHours([{ origin: "NRT", destination: "ICN" }] as any)).toBe(24);
	});

	it("returns 48 for non NRT to ICN route", () => {
		mocks.isNRTToICNRoute.mockReturnValue(false);
		expect(getBundleDeadlineHours([{ origin: "HNL", destination: "NRT" }] as any)).toBe(48);
	});
});

describe("isBundlePurchaseDeadlineExceeded", () => {
	it("returns true when departure is within the route-specific deadline", () => {
		mocks.isNRTToICNRoute.mockReturnValue(true); // 24h deadline
		const soon = new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString();
		expect(isBundlePurchaseDeadlineExceeded(soon, [] as any)).toBe(true);
	});

	it("returns false when departure is beyond the route-specific deadline", () => {
		mocks.isNRTToICNRoute.mockReturnValue(false); // 48h deadline
		const later = new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString();
		expect(isBundlePurchaseDeadlineExceeded(later, [] as any)).toBe(false);
	});

	it("accepts an explicit now parameter", () => {
		mocks.isNRTToICNRoute.mockReturnValue(false);
		const now = new Date("2026-01-01T00:00:00Z");
		const departure = new Date("2026-01-03T12:00:00Z").toISOString(); // >48h from now
		expect(isBundlePurchaseDeadlineExceeded(departure, [] as any, now)).toBe(false);
	});
});

describe("getRemainingHours", () => {
	it("returns a positive number for a future departure", () => {
		const future = new Date(Date.now() + 5 * 60 * 60 * 1000).toISOString();
		const hours = getRemainingHours(future);
		expect(hours).toBeGreaterThan(4.9);
		expect(hours).toBeLessThan(5.1);
	});

	it("returns a negative number for a past departure", () => {
		const past = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();
		expect(getRemainingHours(past)).toBeLessThan(0);
	});
});

describe("useDepartureDeadline", () => {
	const makeSegment = (departureDateTime: string) => ({
		scheduledDepartureArrivalDateTime: { departureDateTime },
	});

	const makeConfirmedFlight = (departureDateTime: string) => ({
		flights: {
			outbound: { segments: [makeSegment(departureDateTime)] },
		},
	});

	it("returns false flags when departure is far in the future", () => {
		const farFuture = new Date(Date.now() + 200 * 60 * 60 * 1000).toISOString();
		const confirmedFlight = makeConfirmedFlight(farFuture);
		mocks.useAppSelector.mockReturnValue(confirmedFlight);
		mocks.getBundleSegment.mockReturnValue(makeSegment(farFuture));
		mocks.isNRTToICNRoute.mockReturnValue(false);

		const { result } = renderHook(() => useDepartureDeadline("outbound"));

		expect(result.current.is24HourDeadlineExceeded).toBe(false);
		expect(result.current.is48HourDeadlineExceeded).toBe(false);
		expect(result.current.is96HourDeadlineExceeded).toBe(false);
		expect(result.current.isBundlePurchaseDeadlineExceeded).toBe(false);
		expect(result.current.bundleDeadlineHours).toBe(48);
	});

	it("returns true flags when departure is imminent", () => {
		const past = new Date(Date.now() - 60 * 60 * 1000).toISOString();
		const confirmedFlight = makeConfirmedFlight(past);
		mocks.useAppSelector.mockReturnValue(confirmedFlight);
		mocks.getBundleSegment.mockReturnValue(makeSegment(past));
		mocks.isNRTToICNRoute.mockReturnValue(false);

		const { result } = renderHook(() => useDepartureDeadline());

		expect(result.current.is24HourDeadlineExceeded).toBe(true);
		expect(result.current.is48HourDeadlineExceeded).toBe(true);
		expect(result.current.is96HourDeadlineExceeded).toBe(true);
		expect(result.current.isBundlePurchaseDeadlineExceeded).toBe(true);
	});

	it("uses 24h bundle deadline for NRT->ICN route", () => {
		const farFuture = new Date(Date.now() + 200 * 60 * 60 * 1000).toISOString();
		const confirmedFlight = makeConfirmedFlight(farFuture);
		mocks.useAppSelector.mockReturnValue(confirmedFlight);
		mocks.getBundleSegment.mockReturnValue(makeSegment(farFuture));
		mocks.isNRTToICNRoute.mockReturnValue(true);

		const { result } = renderHook(() => useDepartureDeadline("outbound"));

		expect(result.current.bundleDeadlineHours).toBe(24);
	});

	it("handles no confirmedFlight gracefully (empty departure string)", () => {
		mocks.useAppSelector.mockReturnValue(null);
		mocks.getBundleSegment.mockReturnValue(undefined);
		mocks.isNRTToICNRoute.mockReturnValue(false);

		const { result } = renderHook(() => useDepartureDeadline("outbound"));

		// Empty departureDateTime → isDeadlineExceeded("",...) → departure is NaN → difference is NaN → NaN <= threshold is false
		expect(typeof result.current.is24HourDeadlineExceeded).toBe("boolean");
	});

	it("uses the requested direction when resolving the bundle segment", () => {
		const farFuture = new Date(Date.now() + 200 * 60 * 60 * 1000).toISOString();
		const confirmedFlight = makeConfirmedFlight(farFuture);
		mocks.useAppSelector.mockReturnValue(confirmedFlight);
		mocks.getBundleSegment.mockReturnValue(makeSegment(farFuture));
		mocks.isNRTToICNRoute.mockReturnValue(false);

		renderHook(() => useDepartureDeadline("inbound"));

		expect(mocks.getBundleSegment).toHaveBeenCalledWith(confirmedFlight, "inbound");
	});
});
