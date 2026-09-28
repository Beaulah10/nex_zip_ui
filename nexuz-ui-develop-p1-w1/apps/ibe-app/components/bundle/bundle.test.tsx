import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
	BUNDLE_UNAVAILABLE_ERROR_CODE,
	NO_BUNDLE_ID,
} from "@/modules/utils/constants/bundle/bundle.constants";
import BundleSelection from "./bundle";

const bundleMocks = vi.hoisted(() => ({
	state: {
		storedPassengerBundles: [] as Array<{
			id: string;
			bundles?: Array<{ lfid: string; bundleCode: string }>;
		}>,
		params: { locale: "en" as string | string[] | undefined },
		pathname: "/en/bundles/outbound",
		dispatch: vi.fn(),
		isPending: false,
		bundleOffersData: undefined as
			| {
					data: Array<{
						lfid: string;
						bundles: Array<{
							bundleCode: string;
							passengerTypes: Array<Record<string, unknown>>;
						}>;
					}>;
			  }
			| undefined,
		bundleOffersRequest: undefined as Record<string, unknown> | undefined,
		bundleOffersError: undefined as { code?: string } | undefined,
		passengers: [] as Array<{ id: string; passengerTypeCode?: string }>,
		confirmedFlight: undefined as Record<string, unknown> | undefined,
		bundlePackageSelectionProps: undefined as any,
	},
	useParams: vi.fn(),
	usePathname: vi.fn(),
	useAppDispatch: vi.fn(),
	useAppSelector: vi.fn(),
	buildRetrieveOfferBundlesRequest: vi.fn(),
	fetchBundleOffers: vi.fn((payload) => ({ type: "fetchBundleOffers", payload })),
	resetBundleOffers: vi.fn(() => ({ type: "resetBundleOffers" })),
	selectBundleOffersData: vi.fn(),
	selectBundleOffersRequest: vi.fn(),
	selectBundleOffersError: vi.fn(),
	selectBundleOffersIsPending: vi.fn(),
	setSelectedBundles: vi.fn((payload) => ({ type: "setSelectedBundles", payload })),
	clearSeatsForPassengers: vi.fn((payload) => ({ type: "clearSeatsForPassengers", payload })),
	clearServicesForPassengers: vi.fn((payload) => ({ type: "clearServicesForPassengers", payload })),
	selectPassengerList: vi.fn(),
	selectConfirmedFlight: vi.fn(),
	buildSelectedBundle: vi.fn(),
	getBundleSegment: vi.fn(),
	getLocaleFromParam: vi.fn((param) => (Array.isArray(param) ? param[0] : param)),
	isRouteConnectedToAirport: vi.fn(),
	getBundleBoundaryError: vi.fn((error) => new Error(`boundary:${error.code ?? "unknown"}`)),
	setBundles: vi.fn((payload) => ({ type: "setBundles", payload })),
	BundleHeading: vi.fn(({ stage }: { stage: string }) => (
		<div data-testid="bundle-heading" data-stage={stage} />
	)),
	BundlePackageSelection: vi.fn((props: Record<string, unknown>) => {
		bundleMocks.state.bundlePackageSelectionProps = props;
		return <div data-testid="bundle-package-selection" />;
	}),
	LoadingOverlay: vi.fn(() => <div data-testid="loading-overlay" />),
}));

vi.mock("next/navigation", () => ({
	useParams: bundleMocks.useParams,
	usePathname: bundleMocks.usePathname,
}));

vi.mock("@/components/bundle/bundle-heading/bundle-heading", () => ({
	default: bundleMocks.BundleHeading,
}));

vi.mock("@/components/bundle/bundle-package-selection/bundle-package-selection", () => ({
	default: bundleMocks.BundlePackageSelection,
}));

vi.mock("@/components/common/loading-overlay/loading-overlay", () => ({
	LoadingOverlay: bundleMocks.LoadingOverlay,
}));

vi.mock("@/modules/utils/helpers/bundle/bundle.helpers", () => ({
	buildSelectedBundle: bundleMocks.buildSelectedBundle,
	getBundleSegment: bundleMocks.getBundleSegment,
	getLocaleFromParam: bundleMocks.getLocaleFromParam,
	isRouteConnectedToAirport: bundleMocks.isRouteConnectedToAirport,
}));

vi.mock("@/modules/utils/helpers/bundle/bundle-api-error/bundle-api-error", () => ({
	getBundleBoundaryError: bundleMocks.getBundleBoundaryError,
}));

vi.mock("@/store/hooks", () => ({
	useAppDispatch: bundleMocks.useAppDispatch,
	useAppSelector: bundleMocks.useAppSelector,
}));

vi.mock("@/store/slices/bundle-offers/bundle-offers.slice", () => ({
	buildRetrieveOfferBundlesRequest: bundleMocks.buildRetrieveOfferBundlesRequest,
	fetchBundleOffers: bundleMocks.fetchBundleOffers,
	resetBundleOffers: bundleMocks.resetBundleOffers,
	selectBundleOffersData: bundleMocks.selectBundleOffersData,
	selectBundleOffersRequest: bundleMocks.selectBundleOffersRequest,
	selectBundleOffersError: bundleMocks.selectBundleOffersError,
	selectBundleOffersIsPending: bundleMocks.selectBundleOffersIsPending,
	setSelectedBundles: bundleMocks.setSelectedBundles,
}));

vi.mock("@/store/slices/customer-information/passenger-selector/passenger-selector", () => ({
	selectPassengerList: bundleMocks.selectPassengerList,
}));

vi.mock("@/store/slices/flight-selection/flight-selection.slice", () => ({
	selectConfirmedFlight: bundleMocks.selectConfirmedFlight,
}));

vi.mock("@/store/slices/passenger/passenger.slice", () => ({
	setBundles: bundleMocks.setBundles,
	clearSeatsForPassengers: bundleMocks.clearSeatsForPassengers,
	clearServicesForPassengers: bundleMocks.clearServicesForPassengers,
}));

afterEach(() => {
	cleanup();
	vi.clearAllMocks();
});

beforeEach(() => {
	bundleMocks.state.params = { locale: "en" };
	bundleMocks.state.pathname = "/en/bundles/outbound";
	bundleMocks.state.dispatch = vi.fn();
	bundleMocks.state.isPending = false;
	bundleMocks.state.bundleOffersData = undefined;
	bundleMocks.state.bundleOffersRequest = undefined;
	bundleMocks.state.bundleOffersError = undefined;
	bundleMocks.state.passengers = [];
	bundleMocks.state.confirmedFlight = undefined;
	bundleMocks.state.bundlePackageSelectionProps = undefined;
	bundleMocks.state.storedPassengerBundles = [];

	bundleMocks.useParams.mockImplementation(() => bundleMocks.state.params);
	bundleMocks.usePathname.mockImplementation(() => bundleMocks.state.pathname);
	bundleMocks.useAppDispatch.mockReturnValue(bundleMocks.state.dispatch);
	bundleMocks.useAppSelector.mockImplementation((selector: (state: unknown) => unknown) =>
		selector({ passenger: { passengers: bundleMocks.state.storedPassengerBundles ?? [] } })
	);
	bundleMocks.selectBundleOffersData.mockImplementation(() => bundleMocks.state.bundleOffersData);
	bundleMocks.selectBundleOffersRequest.mockImplementation(
		() => bundleMocks.state.bundleOffersRequest
	);
	bundleMocks.selectBundleOffersError.mockImplementation(() => bundleMocks.state.bundleOffersError);
	bundleMocks.selectBundleOffersIsPending.mockImplementation(() => bundleMocks.state.isPending);
	bundleMocks.selectPassengerList.mockImplementation(() => bundleMocks.state.passengers);
	bundleMocks.selectConfirmedFlight.mockImplementation(() => bundleMocks.state.confirmedFlight);
	bundleMocks.buildRetrieveOfferBundlesRequest.mockReturnValue({ currency: "USD" });
	bundleMocks.fetchBundleOffers.mockImplementation((payload) => ({
		type: "fetchBundleOffers",
		payload,
	}));
	bundleMocks.resetBundleOffers.mockImplementation(() => ({ type: "resetBundleOffers" }));
	bundleMocks.setSelectedBundles.mockImplementation((payload) => ({
		type: "setSelectedBundles",
		payload,
	}));
	bundleMocks.setBundles.mockImplementation((payload) => ({ type: "setBundles", payload }));
	bundleMocks.clearSeatsForPassengers.mockImplementation((payload) => ({
		type: "clearSeatsForPassengers",
		payload,
	}));
	bundleMocks.clearServicesForPassengers.mockImplementation((payload) => ({
		type: "clearServicesForPassengers",
		payload,
	}));
	bundleMocks.getLocaleFromParam.mockImplementation((param) =>
		Array.isArray(param) ? param[0] : param
	);
	bundleMocks.isRouteConnectedToAirport.mockReturnValue(false);
	bundleMocks.getBundleBoundaryError.mockImplementation(
		(error) => new Error(`boundary:${error.code ?? "unknown"}`)
	);
});

describe("BundleSelection", () => {
	it("renders loading overlay while pending", () => {
		bundleMocks.state.isPending = true;

		render(<BundleSelection />);

		expect(screen.getByTestId("loading-overlay")).toBeTruthy();
		expect(screen.queryByTestId("bundle-heading")).toBeNull();
	});

	it("throws boundary error for non-unavailable API failure", () => {
		bundleMocks.state.bundleOffersError = { code: "boom" };
		const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

		const { rerender } = render(<BundleSelection />);

		expect(() => rerender(<BundleSelection />)).toThrow("boundary:boom");
		expect(bundleMocks.getBundleBoundaryError).toHaveBeenCalledWith({ code: "boom" });

		consoleErrorSpy.mockRestore();
	});

	it("renders when unavailable bundle error is ignored", () => {
		bundleMocks.state.bundleOffersError = { code: BUNDLE_UNAVAILABLE_ERROR_CODE.toLowerCase() };
		bundleMocks.state.params = { locale: "fr" };

		render(<BundleSelection />);

		expect(screen.getByTestId("bundle-heading")).toHaveAttribute("data-stage", "outbound");
		expect(screen.getByTestId("bundle-package-selection")).toBeTruthy();
		expect(bundleMocks.BundlePackageSelection).toHaveBeenCalledWith(
			expect.objectContaining({ locale: "fr", direction: "outbound", isICNRoute: false }),
			undefined
		);
	});

	it("fetches bundle offers when request payload builds", async () => {
		bundleMocks.state.params = { locale: "jp" };
		bundleMocks.state.pathname = "/jp/bundles/outbound";
		bundleMocks.state.confirmedFlight = { id: "flight-1" };
		bundleMocks.state.passengers = [{ id: "p1" }];
		bundleMocks.buildRetrieveOfferBundlesRequest.mockReturnValue({ currency: "JPY" });

		render(<BundleSelection />);

		await waitFor(() => {
			expect(bundleMocks.fetchBundleOffers).toHaveBeenCalledWith({
				locale: "jp",
				request: { currency: "JPY" },
			});
		});
		expect(bundleMocks.buildRetrieveOfferBundlesRequest).toHaveBeenCalledWith({
			confirmedFlight: bundleMocks.state.confirmedFlight,
			passengers: bundleMocks.state.passengers,
		});
	});

	it("refetches when pathname changes on return to bundle screen", async () => {
		bundleMocks.state.confirmedFlight = { id: "flight-1" };
		bundleMocks.state.passengers = [{ id: "p1" }];
		bundleMocks.buildRetrieveOfferBundlesRequest.mockReturnValue({ currency: "JPY" });

		const { rerender } = render(<BundleSelection />);

		bundleMocks.state.pathname = "/en/flight-selection";
		rerender(<BundleSelection />);
		bundleMocks.state.pathname = "/en/bundles/outbound";
		rerender(<BundleSelection />);

		await waitFor(() => {
			expect(bundleMocks.fetchBundleOffers).toHaveBeenCalledTimes(2);
		});
	});

	it("skips fetch when request payload cannot be built", () => {
		bundleMocks.state.confirmedFlight = { id: "flight-1" };
		bundleMocks.state.passengers = [{ id: "p1" }];
		bundleMocks.buildRetrieveOfferBundlesRequest.mockImplementation(() => {
			throw new Error("bad request");
		});

		render(<BundleSelection />);

		expect(bundleMocks.fetchBundleOffers).not.toHaveBeenCalled();
	});

	it("clears bundle offers state on unmount", () => {
		const { unmount } = render(<BundleSelection />);

		unmount();

		expect(bundleMocks.resetBundleOffers).toHaveBeenCalledTimes(1);
		expect(bundleMocks.state.dispatch).toHaveBeenCalledWith({ type: "resetBundleOffers" });
	});

	it("does not persist bundles without offer data", () => {
		bundleMocks.state.confirmedFlight = { id: "flight-1" };
		bundleMocks.state.passengers = [{ id: "p1", passengerTypeCode: "ADT" }];
		render(<BundleSelection />);

		bundleMocks.state.bundlePackageSelectionProps.onProceed({
			outbound: { p1: "B1" },
			inbound: { p1: "I1" },
		});

		expect(bundleMocks.buildSelectedBundle).not.toHaveBeenCalled();
		expect(bundleMocks.setSelectedBundles).not.toHaveBeenCalled();
		expect(bundleMocks.setBundles).not.toHaveBeenCalled();
	});

	it("returns early when segment missing", () => {
		bundleMocks.state.confirmedFlight = { id: "flight-1" };
		bundleMocks.state.passengers = [{ id: "p1", passengerTypeCode: "ADT" }];
		bundleMocks.state.bundleOffersData = { data: [{ lfid: "lfid-1", bundles: [] }] };
		bundleMocks.buildSelectedBundle.mockReturnValue({
			passengers: [{ id: "p1", bundles: [{ lfid: "lfid-1", bundleCode: "B1" }] }],
		});
		bundleMocks.getBundleSegment.mockReturnValue(null);

		render(<BundleSelection />);

		bundleMocks.state.bundlePackageSelectionProps.onProceed({
			outbound: { p1: "B1" },
			inbound: { p1: "I1" },
		});

		expect(bundleMocks.buildSelectedBundle).toHaveBeenCalledTimes(1);
		expect(bundleMocks.setSelectedBundles).not.toHaveBeenCalled();
		expect(bundleMocks.setBundles).not.toHaveBeenCalled();
	});

	it("persists outbound selections", () => {
		bundleMocks.state.confirmedFlight = { id: "flight-1" };
		bundleMocks.state.passengers = [
			{ id: "p1", passengerTypeCode: "ADT" },
			{ id: "p2", passengerTypeCode: "CHD" },
		];
		bundleMocks.state.bundleOffersData = {
			data: [
				{
					lfid: "lfid-1",
					bundles: [
						{
							bundleCode: "B1",
							passengerTypes: [{ type: "ADT", label: "adult-category" }],
						},
						{
							bundleCode: "B2",
							passengerTypes: [{ type: "CHD", label: "child-category" }],
						},
					],
				},
			],
		};
		bundleMocks.getBundleSegment.mockReturnValue({ lfid: "lfid-1" });
		bundleMocks.buildSelectedBundle.mockReturnValue({
			passengers: [
				{ id: "p1", bundles: [{ lfid: "lfid-1", bundleCode: "B1" }] },
				{ id: "p2", bundles: [{ lfid: "lfid-1", bundleCode: "B2" }] },
			],
		});

		render(<BundleSelection />);

		bundleMocks.state.bundlePackageSelectionProps.onProceed({
			outbound: { p1: "B1", p2: "B2" },
			inbound: { p1: "I1", p2: "I2" },
		});

		expect(bundleMocks.buildSelectedBundle).toHaveBeenCalledWith(
			expect.objectContaining({ direction: "outbound" })
		);
		expect(bundleMocks.setSelectedBundles).toHaveBeenCalledWith({
			lfid: "lfid-1",
			selections: { p1: "B1", p2: "B2" },
		});
		expect(bundleMocks.setBundles).toHaveBeenNthCalledWith(1, {
			passengerId: "p1",
			lfid: "lfid-1",
			bundles: [
				{
					lfid: "lfid-1",
					bundleCode: "B1",
					bundleCategory: { type: "ADT", label: "adult-category" },
				},
			],
		});
		expect(bundleMocks.setBundles).toHaveBeenNthCalledWith(2, {
			passengerId: "p2",
			lfid: "lfid-1",
			bundles: [
				{
					lfid: "lfid-1",
					bundleCode: "B2",
					bundleCategory: { type: "CHD", label: "child-category" },
				},
			],
		});
	});

	it("persists inbound selections", () => {
		bundleMocks.state.confirmedFlight = { id: "flight-1" };
		bundleMocks.state.passengers = [{ id: "p1", passengerTypeCode: "ADT" }];
		bundleMocks.state.bundleOffersData = { data: [{ lfid: "lfid-1", bundles: [] }] };
		bundleMocks.getBundleSegment.mockReturnValue({ lfid: "lfid-1" });
		bundleMocks.buildSelectedBundle.mockReturnValue({
			passengers: [{ id: "p1", bundles: [{ lfid: "lfid-1", bundleCode: "B1" }] }],
		});

		render(<BundleSelection direction="inbound" />);

		bundleMocks.state.bundlePackageSelectionProps.onProceed({
			outbound: { p1: "B1" },
			inbound: { p1: "I1" },
		});

		expect(bundleMocks.setSelectedBundles).toHaveBeenCalledWith({
			lfid: "lfid-1",
			selections: { p1: "I1" },
		});
	});

	it("fills missing selections with no bundle id", () => {
		bundleMocks.state.confirmedFlight = { id: "flight-1" };
		bundleMocks.state.passengers = [
			{ id: "p1", passengerTypeCode: "ADT" },
			{ id: "p2", passengerTypeCode: "CHD" },
		];
		bundleMocks.state.bundleOffersData = { data: [{ lfid: "lfid-1", bundles: [] }] };
		bundleMocks.getBundleSegment.mockReturnValue({ lfid: "lfid-1" });
		bundleMocks.buildSelectedBundle.mockReturnValue({ passengers: [] });

		render(<BundleSelection />);

		bundleMocks.state.bundlePackageSelectionProps.onProceed({
			outbound: { p1: "B1" },
			inbound: { p1: "I1" },
		});

		expect(bundleMocks.setSelectedBundles).toHaveBeenCalledWith({
			lfid: "lfid-1",
			selections: { p1: "B1", p2: NO_BUNDLE_ID },
		});
	});

	it("clears seats and services when passenger bundle selection changes", () => {
		bundleMocks.state.confirmedFlight = { id: "flight-1" };
		bundleMocks.state.passengers = [{ id: "p1", passengerTypeCode: "ADT" }];
		bundleMocks.state.bundleOffersData = { data: [{ lfid: "lfid-1", bundles: [] }] };
		// Simulate passenger previously had bundle "OLD", changing to "B1"
		bundleMocks.useAppSelector.mockImplementation((selector: () => unknown) => {
			if (selector === bundleMocks.selectBundleOffersData)
				return bundleMocks.state.bundleOffersData;
			if (selector === bundleMocks.selectBundleOffersRequest)
				return bundleMocks.state.bundleOffersRequest;
			if (selector === bundleMocks.selectBundleOffersError)
				return bundleMocks.state.bundleOffersError;
			if (selector === bundleMocks.selectBundleOffersIsPending) return bundleMocks.state.isPending;
			if (selector === bundleMocks.selectPassengerList) return bundleMocks.state.passengers;
			if (selector === bundleMocks.selectConfirmedFlight) return bundleMocks.state.confirmedFlight;
			// Simulate stored passenger with existing bundle
			return [
				{
					id: "p1",
					bundles: [{ lfid: "lfid-1", bundleCode: "OLD" }],
				},
			];
		});
		bundleMocks.getBundleSegment.mockReturnValue({ lfid: "lfid-1" });
		bundleMocks.buildSelectedBundle.mockReturnValue({
			passengers: [{ id: "p1", bundles: [{ lfid: "lfid-1", bundleCode: "B1" }] }],
		});

		render(<BundleSelection />);

		bundleMocks.state.bundlePackageSelectionProps.onProceed({
			outbound: { p1: "B1" },
			inbound: { p1: "I1" },
		});

		expect(bundleMocks.clearSeatsForPassengers).toHaveBeenCalledWith({
			passengerIds: ["p1"],
			lfid: "lfid-1",
		});
		expect(bundleMocks.clearServicesForPassengers).toHaveBeenCalledWith({
			passengerIds: ["p1"],
			lfid: "lfid-1",
		});
	});

	it("skips clear when passenger bundle selection does not change", () => {
		bundleMocks.state.confirmedFlight = { id: "flight-1" };
		bundleMocks.state.passengers = [{ id: "p1", passengerTypeCode: "ADT" }];
		bundleMocks.state.bundleOffersData = { data: [{ lfid: "lfid-1", bundles: [] }] };
		// Same bundle code → no change
		bundleMocks.useAppSelector.mockImplementation((selector: () => unknown) => {
			if (selector === bundleMocks.selectBundleOffersData)
				return bundleMocks.state.bundleOffersData;
			if (selector === bundleMocks.selectBundleOffersRequest)
				return bundleMocks.state.bundleOffersRequest;
			if (selector === bundleMocks.selectBundleOffersError)
				return bundleMocks.state.bundleOffersError;
			if (selector === bundleMocks.selectBundleOffersIsPending) return bundleMocks.state.isPending;
			if (selector === bundleMocks.selectPassengerList) return bundleMocks.state.passengers;
			if (selector === bundleMocks.selectConfirmedFlight) return bundleMocks.state.confirmedFlight;
			return [{ id: "p1", bundles: [{ lfid: "lfid-1", bundleCode: "B1" }] }];
		});
		bundleMocks.getBundleSegment.mockReturnValue({ lfid: "lfid-1" });
		bundleMocks.buildSelectedBundle.mockReturnValue({
			passengers: [{ id: "p1", bundles: [{ lfid: "lfid-1", bundleCode: "B1" }] }],
		});

		render(<BundleSelection />);

		bundleMocks.state.bundlePackageSelectionProps.onProceed({
			outbound: { p1: "B1" },
			inbound: { p1: "I1" },
		});

		expect(bundleMocks.clearSeatsForPassengers).not.toHaveBeenCalled();
		expect(bundleMocks.clearServicesForPassengers).not.toHaveBeenCalled();
	});
});
