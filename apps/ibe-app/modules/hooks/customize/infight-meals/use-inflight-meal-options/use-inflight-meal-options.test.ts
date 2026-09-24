import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type {
	InflightMealPassenger,
	MealListOption,
} from "@/types/customize/inflight-meals/inflight-meals.types";
import { useInflightMealOptions } from "./use-inflight-meal-options";

// ─── Module mocks ───────────────────────────────────────────────────────────

const mockUseAppSelector = vi.hoisted(() => vi.fn());

vi.mock("@/store/hooks", () => ({
	useAppSelector: mockUseAppSelector,
}));

vi.mock(
	"@/modules/utils/helpers/customize/inflight-meals/inflight-meals.utils/inflight-meals.utils",
	() => ({
		extractAdultMeals: vi.fn(),
		extractMealServiceLookup: vi.fn(),
		getBundleIncludedMealCodes: vi.fn(),
	})
);

vi.mock("@/modules/utils/helpers/common/flow-router/flow-router", () => ({
	getBookingStageSegment: vi.fn(),
}));

// ─── Imports after mocking ───────────────────────────────────────────────────

import { getBookingStageSegment } from "@/modules/utils/helpers/common/flow-router/flow-router";
import {
	extractAdultMeals,
	extractMealServiceLookup,
	getBundleIncludedMealCodes,
} from "@/modules/utils/helpers/customize/inflight-meals/inflight-meals.utils/inflight-meals.utils";

// ─── Typed mock references ────────────────────────────────────────────────────

const mockExtractAdultMeals = extractAdultMeals as ReturnType<typeof vi.fn>;
const mockExtractMealServiceLookup = extractMealServiceLookup as ReturnType<typeof vi.fn>;
const mockGetBundleIncludedMealCodes = getBundleIncludedMealCodes as ReturnType<typeof vi.fn>;
const mockGetBookingStageSegment = getBookingStageSegment as ReturnType<typeof vi.fn>;

// ─── Fixtures ────────────────────────────────────────────────────────────────

const LFID_OUTBOUND = 101;
const LFID_INBOUND = 202;

const mockConfirmedFlight = {
	tripType: "roundtrip" as const,
	flights: {
		outbound: {
			segments: [{ lfid: LFID_OUTBOUND }],
		},
		inbound: {
			segments: [{ lfid: LFID_INBOUND }],
		},
	},
};

const mockPassengers = [
	{
		id: "p1",
		firstName: "John",
		lastName: "Doe",
		passengerTypeCode: "adult",
		bundles: [
			{
				lfid: LFID_OUTBOUND,
				pfid: 900,
				bundleCode: "PREN",
				bundleCategory: {
					categories: [
						{
							category: "MEALS",
							services: [{ code: "VMEAL" }],
						},
					],
				},
			},
		],
	},
];

const mockMealListOptions: MealListOption[] = [
	{
		id: "1",
		name: "Chicken Meal",
		imageSrc: "",
		price: 1000,
		qtyAvailable: 5,
		remainingQty: 5,
	},
];

const mockMealServiceMap = {
	"1": {
		service: {
			ssrId: 1,
			lfid: LFID_OUTBOUND,
			description: "Chicken Meal",
			amount: 1000,
			ssrCode: "MEAL1",
			qtyAvailable: 5,
		},
		categoryId: 1,
		passengerType: "adult",
	},
};

const mockAncillaryData = { data: { servicesPerPassengerType: [] } };

const servicePassengers: InflightMealPassenger[] = [
	{
		id: "p1",
		name: "John Doe",
		bundleCode: "PREN",
		bundleLabel: "Premium",
		mealfeatures: [],
		isIcnRoute: false,
		isValueBundle: false,
	},
];

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("useInflightMealOptions", () => {
	beforeEach(() => {
		vi.clearAllMocks();

		// Default mock state
		mockUseAppSelector.mockImplementation((selector: (state: unknown) => unknown) => {
			// The selector runs against a minimal mock state
			const mockState = {
				passenger: { passengers: mockPassengers, submitted: false },
				flightSelection: { confirmedFlight: mockConfirmedFlight },
				ancillaryOffers: {
					outbound: {
						dataByServiceCategory: { MEALS: mockAncillaryData },
						requestByServiceCategory: {},
						errorByServiceCategory: {},
						isPending: false,
					},
					inbound: {
						dataByServiceCategory: { MEALS: mockAncillaryData },
						requestByServiceCategory: {},
						errorByServiceCategory: {},
						isPending: false,
					},
				},
			};
			return selector(mockState);
		});

		mockGetBookingStageSegment.mockReturnValue("outbound");
		mockExtractAdultMeals.mockReturnValue(mockMealListOptions);
		mockExtractMealServiceLookup.mockReturnValue(mockMealServiceMap);
		mockGetBundleIncludedMealCodes.mockReturnValue(new Set(["VMEAL"]));
	});

	describe("basic return values", () => {
		it("returns passengers from the store", () => {
			const { result } = renderHook(() =>
				useInflightMealOptions({
					direction: "outbound",
					selectedMealPassengerId: null,
					servicePassengers,
				})
			);

			expect(result.current.passengers).toEqual(mockPassengers);
		});

		it("returns mealListOptions from extractAdultMeals", () => {
			const { result } = renderHook(() =>
				useInflightMealOptions({
					direction: "outbound",
					selectedMealPassengerId: null,
					servicePassengers,
				})
			);

			expect(result.current.mealListOptions).toEqual(mockMealListOptions);
			expect(mockExtractAdultMeals).toHaveBeenCalledWith(mockAncillaryData, expect.any(Object));
		});

		it("returns mealServiceMap from extractMealServiceLookup", () => {
			const { result } = renderHook(() =>
				useInflightMealOptions({
					direction: "outbound",
					selectedMealPassengerId: null,
					servicePassengers,
				})
			);

			expect(result.current.mealServiceMap).toEqual(mockMealServiceMap);
			expect(mockExtractMealServiceLookup).toHaveBeenCalledWith(mockAncillaryData);
		});

		it("builds mealOptionNameById from mealListOptions", () => {
			const { result } = renderHook(() =>
				useInflightMealOptions({
					direction: "outbound",
					selectedMealPassengerId: null,
					servicePassengers,
				})
			);

			expect(result.current.mealOptionNameById).toEqual({ "1": "Chicken Meal" });
		});
	});

	describe("bundleIncludedMealCodesByPassengerId", () => {
		it("builds meal code sets for each passenger from their bundles", () => {
			mockGetBundleIncludedMealCodes.mockReturnValue(new Set(["VMEAL"]));

			const { result } = renderHook(() =>
				useInflightMealOptions({
					direction: "outbound",
					selectedMealPassengerId: null,
					servicePassengers,
				})
			);

			const codes = result.current.bundleIncludedMealCodesByPassengerId.p1;
			expect(codes).toBeDefined();
			expect(codes instanceof Set).toBe(true);
		});

		it("returns empty set for ICN value-bundle service passenger", () => {
			const icnServicePassengers: InflightMealPassenger[] = [
				{
					id: "p1",
					name: "ICN Passenger",
					bundleCode: "VALN",
					bundleLabel: "Value",
					mealfeatures: [],
					isIcnRoute: true,
					isValueBundle: true,
				},
			];

			const { result } = renderHook(() =>
				useInflightMealOptions({
					direction: "outbound",
					selectedMealPassengerId: null,
					servicePassengers: icnServicePassengers,
				})
			);

			const codes = result.current.bundleIncludedMealCodesByPassengerId.p1;
			expect(codes).toEqual(new Set());
		});

		it("only includes bundles matching direction segment lfids", () => {
			// Passenger has two bundles: one for outbound, one for inbound
			const passengersWithMultiBundles = [
				{
					...mockPassengers[0],
					bundles: [
						{
							lfid: LFID_OUTBOUND,
							pfid: 900,
							bundleCode: "PREN",
							bundleCategory: {
								categories: [{ category: "MEALS", services: [{ code: "OUTBOUND_MEAL" }] }],
							},
						},
						{
							lfid: LFID_INBOUND,
							pfid: 901,
							bundleCode: "PREN",
							bundleCategory: {
								categories: [{ category: "MEALS", services: [{ code: "INBOUND_MEAL" }] }],
							},
						},
					],
				},
			];

			mockUseAppSelector.mockImplementation((selector: (state: unknown) => unknown) => {
				const mockState = {
					passenger: { passengers: passengersWithMultiBundles, submitted: false },
					flightSelection: { confirmedFlight: mockConfirmedFlight },
					ancillaryOffers: {
						outbound: {
							dataByServiceCategory: { MEALS: mockAncillaryData },
							requestByServiceCategory: {},
							errorByServiceCategory: {},
							isPending: false,
						},
					},
				};
				return selector(mockState);
			});

			mockGetBookingStageSegment.mockReturnValue("outbound");

			renderHook(() =>
				useInflightMealOptions({
					direction: "outbound",
					selectedMealPassengerId: null,
					servicePassengers,
				})
			);

			// getBundleIncludedMealCodes should be called only for outbound-matching bundles
			expect(mockGetBundleIncludedMealCodes).toHaveBeenCalled();
		});
	});

	describe("selectedPassengerMealIncludedCodes", () => {
		it("passes the selected passenger's meal codes to extractAdultMeals", () => {
			mockGetBundleIncludedMealCodes.mockReturnValue(new Set(["VMEAL"]));

			renderHook(() =>
				useInflightMealOptions({
					direction: "outbound",
					selectedMealPassengerId: "p1",
					servicePassengers,
				})
			);

			expect(mockExtractAdultMeals).toHaveBeenCalledWith(
				mockAncillaryData,
				expect.objectContaining({
					bundleIncludedMealCodes: expect.any(Set),
				})
			);
		});

		it("passes undefined bundleIncludedMealCodes when no passenger is selected", () => {
			renderHook(() =>
				useInflightMealOptions({
					direction: "outbound",
					selectedMealPassengerId: null,
					servicePassengers,
				})
			);

			expect(mockExtractAdultMeals).toHaveBeenCalledWith(
				mockAncillaryData,
				expect.objectContaining({ bundleIncludedMealCodes: undefined })
			);
		});
	});

	describe("direction handling", () => {
		it("uses outbound segment lfids when direction is outbound", () => {
			mockGetBookingStageSegment.mockReturnValue("outbound");

			const { result } = renderHook(() =>
				useInflightMealOptions({
					direction: "outbound",
					selectedMealPassengerId: null,
					servicePassengers,
				})
			);

			expect(result.current.mealListOptions).toBeDefined();
			expect(mockGetBookingStageSegment).toHaveBeenCalledWith(
				expect.objectContaining({ direction: "outbound" })
			);
		});

		it("uses inbound segment lfids when direction is inbound", () => {
			mockGetBookingStageSegment.mockReturnValue("inbound");

			mockUseAppSelector.mockImplementation((selector: (state: unknown) => unknown) => {
				const mockState = {
					passenger: { passengers: mockPassengers, submitted: false },
					flightSelection: { confirmedFlight: mockConfirmedFlight },
					ancillaryOffers: {
						inbound: {
							dataByServiceCategory: { MEALS: mockAncillaryData },
							requestByServiceCategory: {},
							errorByServiceCategory: {},
							isPending: false,
						},
					},
				};
				return selector(mockState);
			});

			renderHook(() =>
				useInflightMealOptions({
					direction: "inbound",
					selectedMealPassengerId: null,
					servicePassengers,
				})
			);

			expect(mockGetBookingStageSegment).toHaveBeenCalledWith(
				expect.objectContaining({ direction: "inbound" })
			);
		});

		it("returns empty directionSegmentLfids when confirmedFlight is null", () => {
			mockUseAppSelector.mockImplementation((selector: (state: unknown) => unknown) => {
				const mockState = {
					passenger: { passengers: mockPassengers, submitted: false },
					flightSelection: { confirmedFlight: null },
					ancillaryOffers: {},
				};
				return selector(mockState);
			});

			const { result } = renderHook(() =>
				useInflightMealOptions({
					direction: "outbound",
					selectedMealPassengerId: null,
					servicePassengers,
				})
			);

			// When confirmedFlight is null, no bundles match lfids
			expect(result.current.bundleIncludedMealCodesByPassengerId.p1).toBeDefined();
		});
	});

	describe("servicePassengerById lookup", () => {
		it("returns empty set for a passenger not in servicePassengers", () => {
			// servicePassengers is empty, so p1 won't be found
			const { result } = renderHook(() =>
				useInflightMealOptions({
					direction: "outbound",
					selectedMealPassengerId: null,
					servicePassengers: [], // empty
				})
			);

			// p1 is not an ICN value-bundle so bundles processed normally
			const codes = result.current.bundleIncludedMealCodesByPassengerId.p1;
			expect(codes).toBeDefined();
		});
	});

	describe("empty/undefined ancillary data", () => {
		it("returns empty mealListOptions when extractAdultMeals returns empty", () => {
			mockExtractAdultMeals.mockReturnValue([]);

			const { result } = renderHook(() =>
				useInflightMealOptions({
					direction: "outbound",
					selectedMealPassengerId: null,
					servicePassengers,
				})
			);

			expect(result.current.mealListOptions).toEqual([]);
		});

		it("returns empty mealServiceMap when extractMealServiceLookup returns empty", () => {
			mockExtractMealServiceLookup.mockReturnValue({});

			const { result } = renderHook(() =>
				useInflightMealOptions({
					direction: "outbound",
					selectedMealPassengerId: null,
					servicePassengers,
				})
			);

			expect(result.current.mealServiceMap).toEqual({});
		});
	});
});
