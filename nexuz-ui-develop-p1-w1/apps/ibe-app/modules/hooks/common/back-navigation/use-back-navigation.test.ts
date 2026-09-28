import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useBackNavigation } from "@/modules/hooks/common/back-navigation/use-back-navigation";

const mocks = vi.hoisted(() => ({
	push: vi.fn(),
	useRouter: vi.fn(),
	usePathname: vi.fn(),
	useAppSelector: vi.fn(),
	handleBackNavigation: vi.fn(),
	selectConfirmedFlight: vi.fn(),
	selectFlightSearchRequest: vi.fn(),
}));

vi.mock("next/navigation", () => ({
	useRouter: mocks.useRouter,
	usePathname: mocks.usePathname,
}));

vi.mock("@/store/hooks", () => ({
	useAppSelector: mocks.useAppSelector,
}));

vi.mock("@/store/slices/flight-selection/flight-selection.slice", () => ({
	selectConfirmedFlight: mocks.selectConfirmedFlight,
	selectFlightSearchRequest: mocks.selectFlightSearchRequest,
}));

vi.mock("@/modules/utils/helpers/common/back-navigation", () => ({
	handleBackNavigation: mocks.handleBackNavigation,
}));

describe("useBackNavigation", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mocks.useRouter.mockReturnValue({ push: mocks.push });
		mocks.usePathname.mockReturnValue("/en/customize/outbound");
		mocks.useAppSelector.mockImplementation((selector: unknown) => {
			if (selector === mocks.selectConfirmedFlight) {
				return { tripType: "oneway", flights: { outbound: { segments: [] } } };
			}

			if (selector === mocks.selectFlightSearchRequest) {
				return { routes: "NRT,HNL", departureDateFrom: "2026-01-01" };
			}

			return undefined;
		});
	});

	it("pushes when handleBackNavigation returns push action", () => {
		mocks.handleBackNavigation.mockReturnValue({
			path: "/en/bundles/outbound",
			action: "push",
		});

		const { result } = renderHook(() => useBackNavigation());
		act(() => result.current());

		expect(mocks.handleBackNavigation).toHaveBeenCalledWith({
			pathname: "/en/customize/outbound",
			locale: "en",
			confirmedFlight: { tripType: "oneway", flights: { outbound: { segments: [] } } },
			flightSearchRequest: { routes: "NRT,HNL", departureDateFrom: "2026-01-01" },
		});
		expect(mocks.push).toHaveBeenCalledWith("/en/bundles/outbound");
	});

	it("does not push when helper returns redirect action", () => {
		mocks.handleBackNavigation.mockReturnValue({
			path: "/en",
			action: "redirect",
		});

		const { result } = renderHook(() => useBackNavigation());
		act(() => result.current());

		expect(mocks.push).not.toHaveBeenCalled();
	});

	it("does nothing when helper returns undefined", () => {
		mocks.handleBackNavigation.mockReturnValue(undefined);

		const { result } = renderHook(() => useBackNavigation());
		act(() => result.current());

		expect(mocks.push).not.toHaveBeenCalled();
	});

	it("uses empty locale when pathname does not contain one", () => {
		mocks.usePathname.mockReturnValue("/");
		mocks.handleBackNavigation.mockReturnValue(undefined);

		const { result } = renderHook(() => useBackNavigation());
		act(() => result.current());

		expect(mocks.handleBackNavigation).toHaveBeenCalledWith(
			expect.objectContaining({ locale: "" })
		);
	});
});
