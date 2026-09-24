import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useBundlePackageSelection } from "./use-bundle-package-selection";

type SelectionMap = Record<string, "NOBN" | "FLBS" | "VALN" | "PREN" | "VALK" | null>;

const mockPush = vi.fn();
const mockSearchParamsGet = vi.fn();
const mockSearchParamsToString = vi.fn();

let mockLocaleParam: string | string[] | undefined;
let mockDeadlineExceeded = false;
let mockRouterPush = mockPush;
let mockState: any;

vi.mock("next/navigation", () => ({
	useRouter: () => ({ push: mockRouterPush }),
	useParams: () => ({ locale: mockLocaleParam }),
	useSearchParams: () => ({
		get: mockSearchParamsGet,
		toString: mockSearchParamsToString,
	}),
}));

vi.mock("next-intl", () => ({
	useTranslations: () => (key: string, values?: Record<string, string>) => {
		if (key === "stage_labels_outbound") return "Outbound";
		if (key === "stage_labels_inbound") return "Inbound";
		if (key === "error_labels.select_any_bundle_to_proceed") {
			return `select_any_bundle_to_proceed ${values?.stageLabel ?? ""}`.trim();
		}
		if (key === "error_labels.select_bundle_for_passengers") {
			return `select_bundle_for_passengers ${values?.passengers ?? ""} ${values?.stageLabel ?? ""}`.trim();
		}
		if (key === "selection_table_only_no_bundle_available_for_these_passengers") {
			return "No bundle available for these passengers";
		}

		return key;
	},
}));

vi.mock("@/modules/hooks/common/departure-deadline/departure-deadline", () => ({
	useDepartureDeadline: () => ({
		isBundlePurchaseDeadlineExceeded: mockDeadlineExceeded,
		bundleDeadlineHours: 24,
	}),
}));

vi.mock("@/store/hooks", () => ({
	useAppSelector: (selector: (state: any) => unknown) => selector(mockState),
}));

function buildConfirmedFlight({
	tripType = "roundtrip",
	outboundOrigin = "NRT",
	outboundDestination = "BKK",
	inboundOrigin = "BKK",
	inboundDestination = "NRT",
	outboundLfid = 101,
	inboundLfid = 202,
}: {
	tripType?: "oneway" | "roundtrip";
	outboundOrigin?: string;
	outboundDestination?: string;
	inboundOrigin?: string;
	inboundDestination?: string;
	outboundLfid?: number;
	inboundLfid?: number;
} = {}) {
	return {
		tripType,
		selectedCabinsOutbound: {},
		selectedCabinsInbound: {},
		flights: {
			outbound: {
				segments: [
					{
						lfid: outboundLfid,
						pfid: outboundLfid + 100,
						origin: outboundOrigin,
						destination: outboundDestination,
					},
				],
				selectedFareInfos: [],
				passengerFareBreakdown: [],
				totalFlightAmount: 0,
			},
			inbound: {
				segments: [
					{
						lfid: inboundLfid,
						pfid: inboundLfid + 100,
						origin: inboundOrigin,
						destination: inboundDestination,
					},
				],
				selectedFareInfos: [],
				passengerFareBreakdown: [],
				totalFlightAmount: 0,
			},
		},
		grandTotalAmount: 0,
		currency: "USD",
		language: "en",
	};
}

function buildBundleOffersData({
	lfid = 101,
	includeFlexBiz = true,
	includePremium = true,
}: {
	lfid?: number;
	includeFlexBiz?: boolean;
	includePremium?: boolean;
} = {}) {
	return {
		data: [
			{
				lfid,
				bundles: [
					{
						bundleCode: "VALN",
						passengerTypes: [
							{
								type: "adult",
								actualQuantity: 2,
								bundleQuantity: 2,
								amount: 120,
							},
						],
					},
					...(includeFlexBiz
						? [
								{
									bundleCode: "FLBS",
									passengerTypes: [
										{
											type: "adult",
											actualQuantity: 1,
											bundleQuantity: 1,
											amount: 150,
										},
									],
								},
							]
						: []),
					...(includePremium
						? [
								{
									bundleCode: "PREN",
									passengerTypes: [
										{ type: "adult", actualQuantity: 1, bundleQuantity: 1, amount: 200 },
									],
								},
							]
						: []),
				],
			},
		],
	};
}

const bundleQuantityScenariosMock = {
	data: [
		{
			lfid: 101,
			bundles: [
				{
					bundleCode: "VALN",
					passengerTypes: [{ type: "adult", actualQuantity: 3, bundleQuantity: 3, amount: 120 }],
				},
				{
					bundleCode: "PREN",
					passengerTypes: [{ type: "adult", actualQuantity: 1, bundleQuantity: 1, amount: 200 }],
				},
				{
					bundleCode: "FLBS",
					passengerTypes: [{ type: "adult", actualQuantity: 0, bundleQuantity: 0, amount: 150 }],
				},
			],
		},
	],
};

function makePassenger({
	id,
	passengerTypeCode,
	firstName,
	lastName,
	hasAccompanyingAdult = false,
	accompanyingAdult,
}: {
	id: string;
	passengerTypeCode?: string;
	firstName?: string;
	lastName?: string;
	hasAccompanyingAdult?: boolean;
	accompanyingAdult?: string;
}) {
	return {
		id,
		passengerTypeCode,
		firstName,
		lastName,
		hasAccompanyingAdult,
		associateWithPassengerId: accompanyingAdult,
		accompanyingAdult,
		isCompleted: true,
	};
}

function setState({
	confirmedFlight,
	bundleOffersData,
	bundleOffersError,
	selectedBundlesBySegment,
	passengers,
	storedPassengers,
}: {
	confirmedFlight?: any;
	bundleOffersData?: any;
	bundleOffersError?: { code: string };
	selectedBundlesBySegment?: Record<string, SelectionMap>;
	passengers?: any[];
	storedPassengers?: any[];
}) {
	mockState = {
		bundleOffers: {
			data: bundleOffersData,
			error: bundleOffersError,
			selectedBundlesBySegment: selectedBundlesBySegment ?? {},
		},
		customerInformation: {
			values: passengers ?? [],
		},
		flightSelection: {
			confirmedFlight,
		},
		passenger: {
			passengers: storedPassengers ?? [],
		},
	};
}

beforeEach(() => {
	mockPush.mockReset();
	mockSearchParamsGet.mockReset();
	mockSearchParamsToString.mockReset();
	mockSearchParamsGet.mockReturnValue(null);
	mockSearchParamsToString.mockReturnValue("");
	mockRouterPush = mockPush;
	mockLocaleParam = undefined;
	mockDeadlineExceeded = false;
});

describe("useBundlePackageSelection", () => {
	it("uses bundle slice selection and proceeds with grouped passengers", async () => {
		setState({
			confirmedFlight: buildConfirmedFlight({ tripType: "roundtrip" }),
			bundleOffersData: buildBundleOffersData({ includePremium: false }),
			selectedBundlesBySegment: {
				101: { adult1: "VALN", adult2: "FLBS" },
			},
			passengers: [
				makePassenger({
					id: "adult1",
					passengerTypeCode: "adult",
					firstName: "Ada",
					lastName: "Lovelace",
				}),
				makePassenger({
					id: "adult2",
					passengerTypeCode: "adult",
					firstName: "Grace",
					lastName: "Hopper",
				}),
				makePassenger({
					id: "child2",
					passengerTypeCode: "childc",
					firstName: "Mina",
					lastName: "Park",
					hasAccompanyingAdult: true,
					accompanyingAdult: "adult2",
				}),
			],
			storedPassengers: [],
		});

		const onProceed = vi.fn();
		const { result } = renderHook(() =>
			useBundlePackageSelection({ locale: "en", direction: "outbound", onProceed })
		);

		await waitFor(() => {
			expect(result.current.passengerSelectionProps.selection).toEqual({
				adult1: "VALN",
				adult2: "FLBS",
			});

			expect(result.current.passengerSelectionProps.passengers[1]).toMatchObject({
				kind: "unavailable-group",
				id: "waived-seat-passengers-adult2",
			});
		});

		expect(result.current.alertProps.allBundlesUnavailable).toBe(false);
		expect(result.current.alertProps.showOutOfStockAlert).toBe(true);
		expect(result.current.offerOverviewProps.hasFlexBizData).toBe(true);
		expect(result.current.offerOverviewProps.isICNRoute).toBe(false);
		expect(result.current.offerOverviewProps.isYvrRoute).toBe(false);
		expect(result.current.passengerSelectionProps.passengers[0]).toMatchObject({
			kind: "passenger",
			id: "adult1",
		});
		expect(result.current.passengerSelectionProps.isBundleDisabled("NOBN")).toBe(false);
		expect(result.current.passengerSelectionProps.isBundleDisabled("PREN")).toBe(true);

		act(() => {
			result.current.passengerSelectionProps.onApplyToAllChange(false);
			result.current.passengerSelectionProps.onApplyToAllChange(true);
		});

		expect(result.current.passengerSelectionProps.selection).toEqual({
			adult1: "VALN",
			adult2: "FLBS",
		});

		act(() => {
			result.current.passengerSelectionProps.onSelectionChange("adult1", "NOBN");
		});

		expect(result.current.passengerSelectionProps.selection).toEqual({
			adult1: "NOBN",
			adult2: "FLBS",
		});

		act(() => {
			result.current.passengerSelectionProps.onSelectionChange("adult1", "FLBS");
		});

		expect(result.current.passengerSelectionProps.selection.adult1).toBe("FLBS");
		expect(result.current.offerOverviewProps.flexBizDialogOpen).toBe(false);

		act(() => {
			result.current.passengerSelectionProps.onSelectionChange("adult1", "VALN");
		});

		act(() => {
			result.current.passengerSelectionProps.onProceed();
		});

		expect(onProceed).toHaveBeenCalledWith({
			outbound: { adult1: "VALN", adult2: "FLBS" },
			inbound: {},
		});
		expect(mockPush).toHaveBeenCalledWith("/en/customize/outbound");
	});

	it("handles available, limited, and zero-quantity bundle scenarios", async () => {
		setState({
			confirmedFlight: buildConfirmedFlight(),
			bundleOffersData: bundleQuantityScenariosMock,
			passengers: [
				makePassenger({ id: "adult1", passengerTypeCode: "adult", firstName: "Ada" }),
				makePassenger({ id: "adult2", passengerTypeCode: "adult", firstName: "Grace" }),
				makePassenger({ id: "adult3", passengerTypeCode: "adult", firstName: "Katherine" }),
			],
			storedPassengers: [],
		});

		const { result } = renderHook(() =>
			useBundlePackageSelection({ locale: "en", direction: "outbound" })
		);

		await waitFor(() => {
			expect(result.current.passengerSelectionProps.isBundleDisabled("VALN")).toBe(false);
			expect(result.current.passengerSelectionProps.isBundleDisabled("PREN")).toBe(false);
			expect(result.current.passengerSelectionProps.isBundleDisabled("FLBS")).toBe(true);
			expect(result.current.passengerSelectionProps.isBundleDisabled("FLBF")).toBe(true);
		});

		act(() => {
			result.current.passengerSelectionProps.onLimitedBundleAttempt("PREN");
		});

		expect(result.current.alertProps.limitedBundleIds).toEqual(["PREN"]);
		expect(result.current.passengerSelectionProps.isBundleDisabled("NOBN")).toBe(false);
	});

	it("falls back to stored passenger bundles and validates partial selection", async () => {
		mockLocaleParam = ["ja", "en"];
		setState({
			confirmedFlight: buildConfirmedFlight({
				tripType: "roundtrip",
				outboundLfid: 101,
				inboundLfid: 202,
			}),
			bundleOffersData: buildBundleOffersData({
				lfid: 202,
				includePremium: false,
				includeFlexBiz: true,
			}),
			selectedBundlesBySegment: {},
			passengers: [
				makePassenger({
					id: "adult1",
					passengerTypeCode: "adult",
					firstName: "Ada",
					lastName: "Lovelace",
				}),
				makePassenger({
					id: "adult2",
					passengerTypeCode: "adt",
					firstName: "Grace",
					lastName: "Hopper",
				}),
			],
			storedPassengers: [
				{ id: "adult1", bundles: [{ lfid: 202, bundleCode: "FLBS" }] },
				{ id: "adult2", bundles: [] },
			],
		});

		const onProceed = vi.fn();
		const { result } = renderHook(() =>
			useBundlePackageSelection({ direction: "inbound", onProceed })
		);

		await waitFor(() => {
			expect(result.current.passengerSelectionProps.selection).toEqual({ adult1: "FLBS" });
		});

		expect(result.current.alertProps.showOutOfStockAlert).toBe(true);
		expect(result.current.offerOverviewProps.hasFlexBizData).toBe(true);
		expect(result.current.offerOverviewProps.isICNRoute).toBe(false);
		expect(result.current.passengerSelectionProps.validationMessage).toBeNull();
		expect(result.current.alertProps.topValidationMessage).toBeNull();
		expect(result.current.alertProps.limitedBundleIds).toEqual(["FLBS"]);

		act(() => {
			result.current.passengerSelectionProps.onProceed();
		});

		await waitFor(() => {
			expect(result.current.passengerSelectionProps.validationMessage).toBe(
				'select_bundle_for_passengers "Hopper Grace" Inbound'
			);
			expect(result.current.passengerSelectionProps.invalidPassengerIds).toEqual(
				new Set(["adult2"])
			);
		});

		expect(onProceed).not.toHaveBeenCalled();
		expect(mockPush).not.toHaveBeenCalled();

		act(() => {
			result.current.passengerSelectionProps.onApplyToAllChange(false);
			result.current.passengerSelectionProps.onApplyToAllChange(true);
		});

		expect(result.current.passengerSelectionProps.selection).toEqual({ adult1: "FLBS" });
	});

	it("returns empty selection without segment and keeps simple passenger rows", async () => {
		setState({
			confirmedFlight: undefined,
			bundleOffersData: undefined,
			selectedBundlesBySegment: {},
			passengers: [
				makePassenger({
					id: "child1",
					passengerTypeCode: "childa",
					firstName: "Nova",
					lastName: "Stone",
				}),
				makePassenger({
					id: "child2",
					passengerTypeCode: "infant",
					firstName: "Ivy",
					lastName: "Lane",
				}),
			],
			storedPassengers: [],
		});

		const onProceed = vi.fn();
		const { result } = renderHook(() =>
			useBundlePackageSelection({ direction: "outbound", onProceed })
		);

		await waitFor(() => {
			expect(result.current.passengerSelectionProps.selection).toEqual({});
		});

		expect(result.current.passengerSelectionProps.passengers).toEqual([
			{ kind: "passenger", id: "child1", name: "Stone Nova", icon: "person" },
			{ kind: "passenger", id: "child2", name: "Lane Ivy", icon: expect.any(Object) },
		]);
		expect(result.current.passengerSelectionProps.validationMessage).toBeNull();
		expect(result.current.alertProps.topValidationMessage).toBeNull();
		expect(result.current.alertProps.showOutOfStockAlert).toBe(true);

		act(() => {
			result.current.passengerSelectionProps.onProceed();
		});

		await waitFor(() => {
			expect(result.current.alertProps.topValidationMessage).toBe(
				"select_any_bundle_to_proceed Outbound"
			);
		});

		expect(result.current.alertProps.validationAttempt).toBe(1);

		act(() => {
			result.current.passengerSelectionProps.onProceed();
		});

		expect(result.current.alertProps.validationAttempt).toBe(2);
		expect(onProceed).not.toHaveBeenCalled();
		expect(mockPush).not.toHaveBeenCalled();
	});

	it("applies to all and flex biz on grouped passengers", async () => {
		setState({
			confirmedFlight: buildConfirmedFlight({ tripType: "roundtrip" }),
			bundleOffersData: buildBundleOffersData({ includePremium: false, includeFlexBiz: true }),
			selectedBundlesBySegment: {
				101: { adult1: "FLBS", child1: "FLBS" },
			},
			passengers: [
				makePassenger({
					id: "adult1",
					passengerTypeCode: "adult",
					firstName: "Ada",
					lastName: "Lovelace",
				}),
				makePassenger({
					id: "child1",
					passengerTypeCode: "childc",
					firstName: "Grace",
					lastName: "Hopper",
					hasAccompanyingAdult: true,
					accompanyingAdult: "adult1",
				}),
			],
			storedPassengers: [],
		});

		const { result } = renderHook(() =>
			useBundlePackageSelection({ locale: "en", direction: "outbound" })
		);

		await waitFor(() => {
			expect(result.current.passengerSelectionProps.selection).toEqual({
				adult1: "FLBS",
				child1: "FLBS",
			});
		});

		act(() => {
			result.current.passengerSelectionProps.onApplyToAllChange(true);
		});

		act(() => {
			result.current.offerOverviewProps.onFlexBizOpen();
		});

		act(() => {
			result.current.offerOverviewProps.onFlexBizRequest();
		});

		await waitFor(() => {
			expect(result.current.passengerSelectionProps.selection).toEqual({
				adult1: "NOBN",
				child1: "NOBN",
			});
		});
	});

	it("handles all-bundle fallback, eligibility banner, and flex biz flows", async () => {
		mockDeadlineExceeded = true;
		setState({
			confirmedFlight: buildConfirmedFlight({
				tripType: "roundtrip",
				outboundOrigin: "YVR",
				outboundDestination: "NRT",
			}),
			bundleOffersData: buildBundleOffersData({ includePremium: false, includeFlexBiz: true }),
			bundleOffersError: { code: "NEXUZR004E003" },
			selectedBundlesBySegment: {
				101: { adult1: "FLBS", child1: "FLBS" },
			},
			passengers: [
				makePassenger({
					id: "adult1",
					passengerTypeCode: "adult",
					firstName: "Ada",
					lastName: "Lovelace",
				}),
				makePassenger({
					id: "child1",
					passengerTypeCode: "childa",
					firstName: "Mira",
					lastName: "Stone",
					hasAccompanyingAdult: true,
					accompanyingAdult: "ghost-adult",
				}),
			],
			storedPassengers: [],
		});

		const onProceed = vi.fn();
		const { result, rerender } = renderHook(() =>
			useBundlePackageSelection({ direction: "outbound", isICNRoute: true, onProceed })
		);

		await waitFor(() => {
			expect(result.current.passengerSelectionProps.selection).toEqual({
				adult1: "NOBN",
				child1: "NOBN",
			});
		});

		expect(result.current.alertProps.isBundlePurchaseDeadlineExceeded).toBe(true);
		expect(result.current.alertProps.allBundlesUnavailable).toBe(true);
		expect(result.current.alertProps.showOutOfStockAlert).toBe(true);
		expect(result.current.offerOverviewProps.isICNRoute).toBe(true);
		expect(result.current.offerOverviewProps.isYvrRoute).toBe(true);
		expect(result.current.offerOverviewProps.showEligibilityBanner).toBe(true);
		expect(result.current.offerOverviewProps.hasFlexBizData).toBe(true);
		expect(result.current.passengerSelectionProps.purchaseDeadlineExceeded).toBe(true);
		expect(result.current.passengerSelectionProps.limitedCollapsedBundleIds).toEqual([]);
		expect(result.current.passengerSelectionProps.isBundleDisabled("NOBN")).toBe(false);
		expect(result.current.passengerSelectionProps.isBundleDisabled("VALK")).toBe(true);

		mockDeadlineExceeded = false;
		mockState.bundleOffers.error = undefined;
		rerender();

		act(() => {
			result.current.passengerSelectionProps.onApplyToAllChange(false);
		});

		expect(result.current.passengerSelectionProps.applyToAll).toBe(false);

		act(() => {
			result.current.passengerSelectionProps.onLimitedBundleAttempt("VALK");
		});

		expect(result.current.passengerSelectionProps.limitedCollapsedBundleIds).toEqual(["VALK"]);

		act(() => {
			result.current.offerOverviewProps.onFlexBizOpen();
		});

		expect(result.current.offerOverviewProps.flexBizDialogOpen).toBe(true);

		act(() => {
			result.current.offerOverviewProps.onFlexBizRequest();
		});

		expect(result.current.offerOverviewProps.flexBizDialogOpen).toBe(false);
		expect(result.current.alertProps.limitedBundleIds).toEqual(expect.arrayContaining(["VALK"]));
		expect(result.current.passengerSelectionProps.passengers).toEqual([
			{
				kind: "passenger",
				id: "adult1",
				name: "Lovelace Ada",
				icon: "person",
			},
			{
				kind: "passenger",
				id: "child1",
				name: "Stone Mira",
				icon: "person",
			},
		]);
	});

	it("throws when bundle code groups are empty", async () => {
		vi.resetModules();
		vi.doMock("@/modules/utils/constants/bundle/bundle.constants", () => ({
			BUNDLE_CODES: {
				NO_BUNDLE: [],
				FLEX_BIZ: [],
				VALUE: [],
				PREMIUM: [],
			},
		}));

		await expect(import("./use-bundle-package-selection")).rejects.toThrow("Missing bundle code");
	});
});
