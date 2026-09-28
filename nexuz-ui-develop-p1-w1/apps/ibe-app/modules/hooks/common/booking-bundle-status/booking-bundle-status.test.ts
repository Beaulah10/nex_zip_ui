import { renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useBookingBundleStatus } from "@/modules/hooks/common/booking-bundle-status/booking-bundle-status";

const mocks = vi.hoisted(() => ({
	servicePassengers: [] as Array<{ bundleLabel: string }>,
	useServicePassengers: vi.fn(),
}));

vi.mock("../service-passengers/service-passengers", () => ({
	useServicePassengers: mocks.useServicePassengers,
}));

beforeEach(() => {
	mocks.useServicePassengers.mockReturnValue({ servicePassengers: mocks.servicePassengers });
});

describe("useBookingBundleStatus", () => {
	it('returns "Bundle" when any passenger has "Value" bundle label', () => {
		mocks.useServicePassengers.mockReturnValue({
			servicePassengers: [{ bundleLabel: "Value" }, { bundleLabel: "NoBundle" }],
		});
		const { result } = renderHook(() => useBookingBundleStatus("outbound"));
		expect(result.current).toBe("Bundle");
	});

	it('returns "Bundle" when any passenger has "Premium" bundle label', () => {
		mocks.useServicePassengers.mockReturnValue({
			servicePassengers: [{ bundleLabel: "Premium" }],
		});
		const { result } = renderHook(() => useBookingBundleStatus("outbound"));
		expect(result.current).toBe("Bundle");
	});

	it('returns "Bundle" when any passenger has "Flex Biz" bundle label', () => {
		mocks.useServicePassengers.mockReturnValue({
			servicePassengers: [{ bundleLabel: "Flex Biz" }],
		});
		const { result } = renderHook(() => useBookingBundleStatus("inbound"));
		expect(result.current).toBe("Bundle");
	});

	it('returns "NoBundle" when no passengers have a bundle-included label', () => {
		mocks.useServicePassengers.mockReturnValue({
			servicePassengers: [{ bundleLabel: "nobundle_label" }, { bundleLabel: "other" }],
		});
		const { result } = renderHook(() => useBookingBundleStatus("outbound"));
		expect(result.current).toBe("NoBundle");
	});

	it('returns "NoBundle" when there are no passengers', () => {
		mocks.useServicePassengers.mockReturnValue({ servicePassengers: [] });
		const { result } = renderHook(() => useBookingBundleStatus("outbound"));
		expect(result.current).toBe("NoBundle");
	});

	it("passes the direction to useServicePassengers", () => {
		mocks.useServicePassengers.mockReturnValue({ servicePassengers: [] });
		renderHook(() => useBookingBundleStatus("inbound"));
		expect(mocks.useServicePassengers).toHaveBeenCalledWith("inbound");
	});
});
