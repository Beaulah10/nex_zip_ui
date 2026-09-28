import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
	ADJACENT_FREE_SEAT_MANDATORY_ERROR,
	BUNDLE_MANDATORY_ERROR,
	EMERGENCY_EXIT_ERROR,
	LIMITED_RECLINING_WARNING,
} from "@/modules/utils/constants/seat-map/seat-map.constants";
import { useSeatMapDialog } from "./use-seat-map-dialog";

const mocks = vi.hoisted(() => ({
	state: {} as Record<string, any>,
	dispatch: vi.fn(),
	getBundleSeatServiceCodes: vi.fn(
		(passenger: { seatBundleCodes?: string[] }) => new Set(passenger.seatBundleCodes ?? [])
	),
	orderedPassengersWithNames: [
		{
			id: "p1",
			firstName: "ZIP",
			lastName: "TARO",
			passengerTypeCode: "adult",
			mappedAdultId: "",
		},
		{
			id: "p2",
			firstName: "ZIP",
			lastName: "HANAKO",
			passengerTypeCode: "adult",
			mappedAdultId: "",
		},
	],
	seatMapPassengerPanel: {
		flightCode: "NRT-BKK",
		passengers: [{ name: "ZIP TARO" }, { name: "ZIP HANAKO" }],
	},
	initialAssignments: new Map<number, any>(),
	handleSeatSelectSpy: vi.fn(),
	setInitialAssignmentsSpy: vi.fn(),
	resetAssignmentsSpy: vi.fn(),
	is48HourDeadlineExceeded: vi.fn(() => false),
	getAdjacentSeatInfoBannerMessages: vi.fn(() => [{ text: "Adjacent info" }]),
	getSeatRulesInfoMessages: vi.fn(() => ["Rule 1"]),
	getSeatValidationErrorMessage: vi.fn((_: unknown, type: string) => ({
		type,
		title: `error:${type}`,
		body: `body:${type}`,
	})),
	getSeatWarningBannerMessage: vi.fn((_: unknown, type: string) => ({
		type,
		title: `warning:${type}`,
		body: `body:${type}`,
	})),
	isBundleSeatEligible: vi.fn((bundleCode?: string) => bundleCode === "FREE"),
	getActiveSeatMapSegment: vi.fn(() => ({
		lfid: 101,
		pfid: 202,
		scheduledDepartureArrivalDateTime: {
			departureDateTime: "2099-01-01T00:00:00Z",
		},
	})),
	getPassengerBundleCodeByLfid: vi.fn((passenger: { bundleCode?: string }) => passenger.bundleCode),
	getAdjacentFreePassengerIds: vi.fn(() => new Set<string>()),
	getAdjacentRuleVariant: vi.fn(() => "ZERO_TO_SIX"),
	getSeatRecliningWarningType: vi.fn((seat: { code: string }) =>
		seat.code === "12A" || seat.code === "12B" ? LIMITED_RECLINING_WARNING : undefined
	),
	isEmergencyExitSeat: vi.fn((seat: { serviceCode: string }) => seat.serviceCode === "STEX"),
	isSeatRestrictedWithin48Hours: vi.fn(() => false),
	validateAdultSeatAgainstChildren: vi.fn(() => ({ isValid: true })),
	validateAllAdjacentSeatAssignments: vi.fn(() => ({ isValid: true })),
	validateSeatSelection: vi.fn(() => ({ isValid: true })),
	isYvrRoute: vi.fn(() => false),
	addSeat: vi.fn((payload: Record<string, unknown>) => ({
		type: "passenger/addSeat",
		payload,
	})),
	removeSeat: vi.fn((payload: Record<string, unknown>) => ({
		type: "passenger/removeSeat",
		payload,
	})),
	clearSeatMap: vi.fn(() => ({ type: "seat-map/clear" })),
}));

vi.mock("next-intl", () => ({
	useTranslations: () => (key: string) => key,
}));

vi.mock("@/components/customize/seat-map/expand-cabin-rows/expand-cabin-rows", () => ({
	expandCabinRows: (cabin: { rows: Array<{ row: number; seats: unknown[] }> }) => cabin.rows,
}));

vi.mock("@/modules/hooks/common/departure-deadline/departure-deadline", () => ({
	is48HourDeadlineExceeded: mocks.is48HourDeadlineExceeded,
}));

vi.mock("@/modules/hooks/common/passenger-order/passenger-order", () => ({
	usePassengerOrder: () => ({
		orderedPassengersWithNames: mocks.orderedPassengersWithNames,
	}),
}));

vi.mock(
	"@/modules/hooks/seat-map/use-seat-map-passenger-panel/use-seat-map-passenger-panel",
	() => ({
		useSeatMapPassengerPanel: () => mocks.seatMapPassengerPanel,
	})
);

vi.mock("@/modules/hooks/seat-map/use-seat-selection/use-seat-selection", async () => {
	const React = await import("react");

	return {
		useSeatSelection: (passengerCount: number) => {
			const [activePassengerIndex, setActivePassengerIndex] = React.useState(0);
			const [assignments, setAssignments] = React.useState<Map<number, any>>(
				() => new Map(mocks.initialAssignments)
			);

			const handleSeatSelect = (seat: any) => {
				mocks.handleSeatSelectSpy(seat);

				if (!seat.isSeatAvailable) {
					return;
				}

				setAssignments((prev) => {
					const next = new Map(prev);
					const current = next.get(activePassengerIndex);
					const existingOwner = [...next.entries()].find(
						([, assignment]) => assignment.seatCode === seat.code
					)?.[0];

					if (existingOwner !== undefined && existingOwner !== activePassengerIndex) {
						next.delete(existingOwner);
						return next;
					}

					if (current?.seatCode === seat.code) {
						next.delete(activePassengerIndex);
						return next;
					}

					next.set(activePassengerIndex, {
						seatCode: seat.code,
						amount: seat.amount,
						serviceCode: seat.serviceCode,
						seatType: seat.type,
					});

					return next;
				});

				setActivePassengerIndex((current) => Math.min(current + 1, passengerCount - 1));
			};

			const assignedSeatToPassengerIndex = Object.fromEntries(
				[...assignments.entries()].map(([idx, assignment]) => [assignment.seatCode, idx])
			);

			return {
				activePassengerIndex,
				assignments,
				assignedSeatToPassengerIndex,
				totalSeatCost: [...assignments.values()].reduce(
					(total, assignment) => total + assignment.amount,
					0
				),
				handleSeatSelect,
				setActivePassenger: setActivePassengerIndex,
				resetAssignments: () => {
					mocks.resetAssignmentsSpy();
					setAssignments(new Map());
					setActivePassengerIndex(0);
				},
				setInitialAssignments: (next: Map<number, any>) => {
					mocks.setInitialAssignmentsSpy(next);
					setAssignments(new Map(next));
				},
			};
		},
	};
});

vi.mock("@/modules/utils/helpers/common/route-type/route-type", () => ({
	isYvrRoute: mocks.isYvrRoute,
}));

vi.mock("@/modules/utils/helpers/seat-map/seat-map-error-message/seat-map-error-message", () => ({
	getAdjacentSeatInfoBannerMessages: mocks.getAdjacentSeatInfoBannerMessages,
	getSeatRulesInfoMessages: mocks.getSeatRulesInfoMessages,
	getSeatValidationErrorMessage: mocks.getSeatValidationErrorMessage,
	getSeatWarningBannerMessage: mocks.getSeatWarningBannerMessage,
}));

vi.mock("@/modules/utils/helpers/seat-map/bundle-seat-pricing/bundle-seat-pricing", () => ({
	getBundleSeatPrice: ({
		amount,
		serviceCode,
		bundleSeatServiceCodes,
	}: {
		amount: number;
		serviceCode?: string;
		bundleSeatServiceCodes: ReadonlySet<string>;
	}) => ({
		originalAmount: amount,
		effectiveAmount: serviceCode && bundleSeatServiceCodes.has(serviceCode) ? 0 : amount,
		isBundleIncluded: !!serviceCode && bundleSeatServiceCodes.has(serviceCode),
	}),
	getBundleSeatServiceCodes: mocks.getBundleSeatServiceCodes,
}));

vi.mock(
	"@/modules/utils/helpers/seat-map/seat-map-passenger-panel/seat-map-passenger-panel",
	() => ({
		isBundleSeatEligible: mocks.isBundleSeatEligible,
	})
);

vi.mock("@/modules/utils/helpers/seat-map/seat-map-segment-utils/seat-map-segment-utils", () => ({
	getActiveSeatMapSegment: mocks.getActiveSeatMapSegment,
	getPassengerBundleCodeByLfid: mocks.getPassengerBundleCodeByLfid,
}));

vi.mock("@/modules/utils/validations/seat-map/seat-validation", () => ({
	getAdjacentFreePassengerIds: mocks.getAdjacentFreePassengerIds,
	getAdjacentRuleVariant: mocks.getAdjacentRuleVariant,
	getSeatRecliningWarningType: mocks.getSeatRecliningWarningType,
	isEmergencyExitSeat: mocks.isEmergencyExitSeat,
	isSeatRestrictedWithin48Hours: mocks.isSeatRestrictedWithin48Hours,
	validateAdultSeatAgainstChildren: mocks.validateAdultSeatAgainstChildren,
	validateAllAdjacentSeatAssignments: mocks.validateAllAdjacentSeatAssignments,
	validateSeatSelection: mocks.validateSeatSelection,
}));

vi.mock("@/store/hooks", () => ({
	useAppDispatch: () => mocks.dispatch,
	useAppSelector: (selector: (state: Record<string, any>) => unknown) => selector(mocks.state),
}));

vi.mock("@/store/slices/flight-selection/flight-selection.slice", () => ({
	selectConfirmedFlight: (state: Record<string, any>) => state.confirmedFlight,
}));

vi.mock("@/store/slices/passenger/passenger.slice", () => ({
	addSeat: mocks.addSeat,
	removeSeat: mocks.removeSeat,
	selectPassengers: (state: Record<string, any>) => state.passengers,
}));

vi.mock("@/store/slices/seat-map/seat-map.slice", () => ({
	clearSeatMap: mocks.clearSeatMap,
	selectBuiltSeatMap: (state: Record<string, any>, cabin: string) => state.seatMapData[cabin],
	selectSeatMapRequest: (state: Record<string, any>) => state.seatMapRequest,
}));

describe("useSeatMapDialog", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mocks.initialAssignments = new Map();

		mocks.orderedPassengersWithNames = [
			{
				id: "p1",
				firstName: "ZIP",
				lastName: "TARO",
				passengerTypeCode: "adult",
				mappedAdultId: "",
			},
			{
				id: "p2",
				firstName: "ZIP",
				lastName: "HANAKO",
				passengerTypeCode: "adult",
				mappedAdultId: "",
			},
		];

		mocks.state = {
			confirmedFlight: { id: "flight-1" },
			passengers: [{ id: "p1" }, { id: "p2" }],
			seatMapRequest: {
				cabin: "STANDARD",
				logicalFlightId: 101,
				routes: "NRT-BKK",
			},
			seatMapData: {
				Standard: [
					{
						name: "Main Cabin",
						class: "Standard",
						rows: [
							{
								row: 12,
								layout: "3-3-3",
								seats: [
									{
										code: "12A",
										column: "A",
										type: "Window",
										status: "front-tier",
										isSeatAvailable: true,
										amount: 1000,
										serviceCode: "STFW",
									},
									{
										code: "12B",
										column: "B",
										type: "Middle",
										status: "front-tier",
										isSeatAvailable: true,
										amount: 1000,
										serviceCode: "STFW",
									},
									{
										code: "46A",
										column: "A",
										type: "Window",
										status: "exit-row",
										isSeatAvailable: true,
										amount: 1500,
										serviceCode: "STEX",
									},
								],
							},
						],
					},
				],
				ZipFullFlat: [],
			},
		};

		mocks.getAdjacentFreePassengerIds.mockReturnValue(new Set<string>());
		mocks.getAdjacentRuleVariant.mockReturnValue("ZERO_TO_SIX");
		mocks.getSeatRecliningWarningType.mockImplementation((seat: { code: string }) =>
			seat.code === "12A" ? LIMITED_RECLINING_WARNING : undefined
		);
		mocks.isBundleSeatEligible.mockImplementation((bundleCode?: string) => bundleCode === "FREE");
		mocks.getPassengerBundleCodeByLfid.mockImplementation(
			(passenger: { bundleCode?: string }) => passenger.bundleCode
		);
		mocks.getBundleSeatServiceCodes.mockImplementation(
			(passenger: { seatBundleCodes?: string[] }) => new Set(passenger.seatBundleCodes ?? [])
		);
		mocks.validateSeatSelection.mockReturnValue({
			isValid: true,
		});
		mocks.validateAdultSeatAgainstChildren.mockReturnValue({
			isValid: true,
		});
		mocks.validateAllAdjacentSeatAssignments.mockReturnValue({
			isValid: true,
		});
	});

	it("assigns a regular seat, exposes derived values and shows the warning banner", async () => {
		const { result } = renderHook(() =>
			useSeatMapDialog({
				open: true,
				onOpenChange: vi.fn(),
				direction: "outbound",
			})
		);

		act(() => {
			result.current.handleValidatedSeatSelect({
				code: "12A",
				column: "A",
				type: "Window",
				status: "front-tier",
				isSeatAvailable: true,
				amount: 1000,
				serviceCode: "STFW",
			});
		});

		await waitFor(() => {
			expect(result.current.seatPassengers[0]?.seatCode).toBe("12A");
		});

		expect(result.current.activePassengerIndex).toBe(1);
		expect(result.current.seatWarningBanner?.title).toBe(
			`warning:${LIMITED_RECLINING_WARNING.type}`
		);
		expect(result.current.legendPrices.selected).toBe(1000);
		expect(result.current.seatPassengers[0]?.price).toBe("¥1,000");
		expect(result.current.adjacentInfoBannerMessages).toEqual([{ text: "Adjacent info" }]);
		expect(result.current.seatRulesInfoMessages).toEqual(["Rule 1"]);
		expect(result.current.effectiveTotalSeatCost).toBe(1000);
	});

	it("applies bundle seat pricing only to matching seat service codes and legend items", async () => {
		mocks.state.passengers = [
			{
				id: "p1",
				bundleCode: "FREE",
				seatBundleCodes: ["STFW", "STOT"],
			},
			{ id: "p2" },
		];

		const { result } = renderHook(() =>
			useSeatMapDialog({
				open: true,
				onOpenChange: vi.fn(),
				direction: "outbound",
			})
		);

		expect(result.current.activePassengerBundleSeatServiceCodes).toEqual(new Set(["STFW", "STOT"]));
		expect(result.current.activePassengerComplimentaryLegendEligible).toBe(false);
		expect(result.current.bundleInfoMessage).toBe("bundle_info_message");

		act(() => {
			result.current.handleValidatedSeatSelect({
				code: "12A",
				column: "A",
				type: "Window",
				status: "front-tier",
				isSeatAvailable: true,
				amount: 1000,
				serviceCode: "STFW",
			});
		});

		await waitFor(() => {
			expect(result.current.seatPassengers[0]?.seatCode).toBe("12A");
		});

		expect(result.current.activePassengerIndex).toBe(1);
		expect(result.current.seatPassengers[0]?.price).toBe("¥0");
		expect(result.current.effectiveTotalSeatCost).toBe(0);
		expect(result.current.activePassengerSelectedSeatServiceCode).toBeUndefined();

		act(() => {
			result.current.handleConfirmSeatSelection();
		});

		expect(mocks.addSeat).toHaveBeenCalledWith({
			passengerId: "p1",
			lfid: 101,
			seat: {
				lfid: 101,
				pfid: 202,
				row: "12",
				column: "A",
				serviceCode: "STFW",
				amount: 0,
				applicableAmount: 0,
				bundleCode: "FREE",
			},
		});
	});

	it("keeps original pricing for non-matching bundle seat service codes", async () => {
		mocks.state.passengers = [
			{
				id: "p1",
				bundleCode: "FREE",
				seatBundleCodes: ["STFW", "STOT"],
			},
			{ id: "p2" },
		];

		mocks.state.seatMapData.Standard[0].rows[0].seats.push({
			code: "46B",
			column: "B",
			type: "Middle",
			status: "exit-row",
			isSeatAvailable: true,
			amount: 1500,
			serviceCode: "STEX",
		});

		const { result } = renderHook(() =>
			useSeatMapDialog({
				open: true,
				onOpenChange: vi.fn(),
				direction: "outbound",
			})
		);

		act(() => {
			result.current.handleValidatedSeatSelect({
				code: "46B",
				column: "B",
				type: "Middle",
				status: "exit-row",
				isSeatAvailable: true,
				amount: 1500,
				serviceCode: "STEX",
			});
		});

		expect(result.current.showingEmergencyExitSupport).toBe(true);
		expect(result.current.pendingEmergencyExitSeat?.code).toBe("46B");

		act(() => {
			result.current.handleConfirmEmergencyExitSupport();
		});

		await waitFor(() => {
			expect(result.current.seatPassengers[0]?.seatCode).toBe("46B");
		});

		expect(result.current.seatPassengers[0]?.price).toBe("¥1,500");
		expect(result.current.effectiveTotalSeatCost).toBe(1500);
		expect(result.current.showingEmergencyExitSupport).toBe(false);
		expect(result.current.pendingEmergencyExitSeat).toBeUndefined();
	});

	it("keeps the warning banner visible until all warning seats are deselected", async () => {
		mocks.getSeatRecliningWarningType.mockImplementation((seat: { code: string }) =>
			seat.code === "12A" || seat.code === "12B" ? LIMITED_RECLINING_WARNING : undefined
		);

		const { result } = renderHook(() =>
			useSeatMapDialog({
				open: true,
				onOpenChange: vi.fn(),
				direction: "outbound",
			})
		);

		act(() => {
			result.current.handleValidatedSeatSelect({
				code: "12A",
				column: "A",
				type: "Window",
				status: "front-tier",
				isSeatAvailable: true,
				amount: 1000,
				serviceCode: "STFW",
			});
		});

		await waitFor(() => {
			expect(result.current.seatPassengers[0]?.seatCode).toBe("12A");
		});

		expect(result.current.seatWarningBanner?.title).toBe(
			`warning:${LIMITED_RECLINING_WARNING.type}`
		);

		act(() => {
			result.current.handleValidatedSeatSelect({
				code: "12B",
				column: "B",
				type: "Middle",
				status: "front-tier",
				isSeatAvailable: true,
				amount: 1000,
				serviceCode: "STFW",
			});
		});

		await waitFor(() => {
			expect(result.current.seatPassengers[1]?.seatCode).toBe("12B");
		});

		expect(result.current.seatWarningBanner?.title).toBe(
			`warning:${LIMITED_RECLINING_WARNING.type}`
		);

		act(() => {
			result.current.handleValidatedSeatSelect({
				code: "12A",
				column: "A",
				type: "Window",
				status: "front-tier",
				isSeatAvailable: true,
				amount: 1000,
				serviceCode: "STFW",
			});
		});

		await waitFor(() => {
			expect(result.current.seatPassengers[0]?.seatCode).toBeUndefined();
		});

		expect(result.current.seatPassengers[1]?.seatCode).toBe("12B");

		await waitFor(() => {
			expect(result.current.seatWarningBanner?.title).toBe(
				`warning:${LIMITED_RECLINING_WARNING.type}`
			);
		});

		act(() => {
			result.current.handleValidatedSeatSelect({
				code: "12B",
				column: "B",
				type: "Middle",
				status: "front-tier",
				isSeatAvailable: true,
				amount: 1000,
				serviceCode: "STFW",
			});
		});

		await waitFor(() => {
			expect(result.current.seatPassengers[1]?.seatCode).toBeUndefined();
			expect(result.current.seatWarningBanner).toBeUndefined();
		});
	});

	it("restores the warning banner when reopening with an already selected warning seat", async () => {
		mocks.state = {
			...mocks.state,
			passengers: [
				{
					id: "p1",
					seats: [
						{
							lfid: 101,
							pfid: 202,
							row: "12",
							column: "A",
							amount: 1000,
							serviceCode: "STFW",
						},
					],
				},
				{ id: "p2" },
			],
		};

		const onOpenChange = vi.fn();
		const { result, rerender } = renderHook(
			({ open }: { open: boolean }) =>
				useSeatMapDialog({ open, onOpenChange, direction: "outbound" }),
			{ initialProps: { open: false } }
		);

		rerender({ open: true });

		await waitFor(() => {
			expect(result.current.seatPassengers[0]?.seatCode).toBe("12A");
		});

		expect(result.current.seatWarningBanner?.title).toBe(
			`warning:${LIMITED_RECLINING_WARNING.type}`
		);
	});

	it("opens and confirms the emergency-exit support sub-flow", async () => {
		const { result } = renderHook(() =>
			useSeatMapDialog({
				open: true,
				onOpenChange: vi.fn(),
				direction: "outbound",
			})
		);

		act(() => {
			result.current.handleValidatedSeatSelect({
				code: "46A",
				column: "A",
				type: "Window",
				status: "exit-row",
				isSeatAvailable: true,
				amount: 1500,
				serviceCode: "STEX",
			});
		});

		expect(result.current.showingEmergencyExitSupport).toBe(true);
		expect(result.current.pendingEmergencyExitSeat?.code).toBe("46A");

		act(() => {
			result.current.handleConfirmEmergencyExitSupport();
		});

		await waitFor(() => {
			expect(result.current.seatPassengers[0]?.seatCode).toBe("46A");
		});

		expect(result.current.activePassengerIndex).toBe(1);
		expect(result.current.showingEmergencyExitSupport).toBe(false);
		expect(result.current.pendingEmergencyExitSeat).toBeUndefined();
		expect(mocks.handleSeatSelectSpy).toHaveBeenCalled();
	});

	it("blocks confirm when a bundle-eligible passenger has no selected seat", () => {
		mocks.state.passengers = [
			{ id: "p1" },
			{
				id: "p2",
				bundleCode: "FREE",
				seatBundleCodes: ["STFW"],
			},
		];

		const { result } = renderHook(() =>
			useSeatMapDialog({
				open: true,
				onOpenChange: vi.fn(),
				direction: "outbound",
			})
		);

		act(() => {
			result.current.handleConfirmSeatSelection();
		});

		expect(result.current.activePassengerIndex).toBe(1);
		expect(result.current.bundleInfoMessage).toBe("bundle_info_message");
		expect(result.current.activePassengerComplimentaryLegendEligible).toBe(false);
		expect(result.current.seatValidationError?.title).toBe(`error:${BUNDLE_MANDATORY_ERROR.type}`);
	});

	it("blocks confirmation re-selection when a restricted passenger still has an emergency exit seat", async () => {
		mocks.state.passengers = [
			{
				id: "p1",
				services: {
					"non-chargeable": [{ ssrCode: "WCHR" }],
				},
			},
			{ id: "p2" },
		];
		const onOpenChange = vi.fn();

		const { result } = renderHook(() =>
			useSeatMapDialog({
				open: true,
				onOpenChange,
				direction: "outbound",
			})
		);

		act(() => {
			result.current.handleValidatedSeatSelect({
				code: "46A",
				column: "A",
				type: "Window",
				status: "exit-row",
				isSeatAvailable: true,
				amount: 1500,
				serviceCode: "STEX",
			});
		});

		act(() => {
			result.current.handleConfirmEmergencyExitSupport();
		});

		await waitFor(() => {
			expect(result.current.seatPassengers[0]?.seatCode).toBe("46A");
		});

		act(() => {
			result.current.handleConfirmSeatSelection();
		});

		expect(result.current.activePassengerIndex).toBe(0);
		expect(result.current.seatValidationError?.title).toBe(`error:${EMERGENCY_EXIT_ERROR.type}`);
		expect(onOpenChange).not.toHaveBeenCalledWith(false);
		expect(mocks.addSeat).not.toHaveBeenCalled();
	});

	it("keeps existing pricing when bundle has no seat category codes", () => {
		mocks.state.passengers = [
			{
				id: "p1",
				bundleCode: "FREE",
				seatBundleCodes: [],
			},
			{ id: "p2" },
		];

		const { result } = renderHook(() =>
			useSeatMapDialog({
				open: true,
				onOpenChange: vi.fn(),
				direction: "outbound",
			})
		);

		expect(result.current.bundleInfoMessage).toBeUndefined();
		expect(result.current.activePassengerBundleSeatServiceCodes).toEqual(new Set());
	});

	it("blocks confirm when an adjacent-free passenger has no selected seat and clears after selection", async () => {
		mocks.orderedPassengersWithNames = [
			{
				id: "p1",
				firstName: "ZIP",
				lastName: "TARO",
				passengerTypeCode: "adult",
				mappedAdultId: "",
			},
			{
				id: "p2",
				firstName: "ZIP",
				lastName: "HANAKO",
				passengerTypeCode: "child",
				mappedAdultId: "p1",
			},
		];

		mocks.getAdjacentFreePassengerIds.mockReturnValue(new Set(["p1", "p2"]));

		const onOpenChange = vi.fn();

		const { result } = renderHook(() =>
			useSeatMapDialog({
				open: true,
				onOpenChange,
				direction: "outbound",
			})
		);

		act(() => {
			result.current.handleValidatedSeatSelect({
				code: "12A",
				column: "A",
				type: "Window",
				status: "front-tier",
				isSeatAvailable: true,
				amount: 1000,
				serviceCode: "STFW",
			});
		});

		await waitFor(() => {
			expect(result.current.seatPassengers[0]?.seatCode).toBe("12A");
		});

		act(() => {
			result.current.handleConfirmSeatSelection();
		});

		expect(onOpenChange).not.toHaveBeenCalled();
		expect(result.current.activePassengerIndex).toBe(1);
		expect(result.current.seatValidationError?.title).toBe(
			`error:${ADJACENT_FREE_SEAT_MANDATORY_ERROR.type}`
		);

		act(() => {
			result.current.handleValidatedSeatSelect({
				code: "12B",
				column: "B",
				type: "Middle",
				status: "front-tier",
				isSeatAvailable: true,
				amount: 1000,
				serviceCode: "STFW",
			});
		});

		await waitFor(() => {
			expect(result.current.seatPassengers[1]?.seatCode).toBe("12B");
			expect(result.current.seatValidationError).toBeUndefined();
		});
	});

	it("allows a special-assistance passenger to deselect the same emergency exit seat", async () => {
		mocks.state.passengers = [
			{
				id: "p1",
				services: {
					"non-chargeable": [{ ssrCode: "WCHR" }],
				},
				seats: [
					{
						lfid: 101,
						pfid: 202,
						row: "46",
						column: "A",
						amount: 1500,
						serviceCode: "STEX",
					},
				],
			},
			{ id: "p2" },
		];

		const onOpenChange = vi.fn();

		const { result } = renderHook(() =>
			useSeatMapDialog({
				open: true,
				onOpenChange,
				direction: "outbound",
			})
		);

		await waitFor(() => {
			expect(result.current.seatPassengers[0]?.seatCode).toBe("46A");
		});

		act(() => {
			result.current.handleValidatedSeatSelect({
				code: "46A",
				column: "A",
				type: "Window",
				status: "exit-row",
				isSeatAvailable: true,
				amount: 1500,
				serviceCode: "STEX",
			});
		});

		await waitFor(() => {
			expect(result.current.seatPassengers[0]?.seatCode).toBeUndefined();
		});

		expect(result.current.showingEmergencyExitSupport).toBe(false);
		expect(result.current.pendingEmergencyExitSeat).toBeUndefined();
		expect(result.current.seatValidationError).toBeUndefined();
		expect(onOpenChange).not.toHaveBeenCalledWith(false);
	});

	it("dispatches seat updates and closes on a valid confirm", async () => {
		const onOpenChange = vi.fn();

		const { result } = renderHook(() =>
			useSeatMapDialog({
				open: true,
				onOpenChange,
				direction: "outbound",
			})
		);

		act(() => {
			result.current.handleValidatedSeatSelect({
				code: "12A",
				column: "A",
				type: "Window",
				status: "front-tier",
				isSeatAvailable: true,
				amount: 1000,
				serviceCode: "STFW",
			});
		});

		await waitFor(() => {
			expect(result.current.seatPassengers[0]?.seatCode).toBe("12A");
		});

		act(() => {
			result.current.handleConfirmSeatSelection();
		});

		expect(mocks.removeSeat).toHaveBeenCalledTimes(2);

		expect(mocks.addSeat).toHaveBeenCalledWith({
			passengerId: "p1",
			lfid: 101,
			seat: {
				lfid: 101,
				pfid: 202,
				row: "12",
				column: "A",
				serviceCode: "STFW",
				amount: 1000,
				applicableAmount: 1000,
			},
		});

		expect(mocks.dispatch).toHaveBeenCalledWith({
			type: "passenger/addSeat",
			payload: expect.any(Object),
		});

		expect(onOpenChange).toHaveBeenCalledWith(false);
	});

	it("resets assignments and clears the seat map when the dialog closes before confirm", async () => {
		const onOpenChange = vi.fn();

		const { result } = renderHook(() =>
			useSeatMapDialog({
				open: true,
				onOpenChange,
				direction: "outbound",
			})
		);

		act(() => {
			result.current.handleValidatedSeatSelect({
				code: "12A",
				column: "A",
				type: "Window",
				status: "front-tier",
				isSeatAvailable: true,
				amount: 1000,
				serviceCode: "STFW",
			});
		});

		await waitFor(() => {
			expect(result.current.seatPassengers[0]?.seatCode).toBe("12A");
		});

		act(() => {
			result.current.handleDialogOpenChange(false);
		});

		expect(onOpenChange).toHaveBeenCalledWith(false);
		expect(mocks.resetAssignmentsSpy).toHaveBeenCalledTimes(1);
		expect(mocks.dispatch).toHaveBeenCalledWith({
			type: "seat-map/clear",
		});
		expect(result.current.seatWarningBanner).toBeUndefined();
		expect(result.current.showingEmergencyExitSupport).toBe(false);
	});

	it("hydrates stored seats and supports backward-compatible emergency exit handlers", async () => {
		mocks.state.passengers = [
			{
				id: "p1",
				seats: [
					{
						lfid: 101,
						pfid: 202,
						row: "12",
						column: "A",
						serviceCode: "STFW",
						amount: 1000,
					},
				],
			},
			{ id: "p2" },
		];

		const { result } = renderHook(() =>
			useSeatMapDialog({
				open: true,
				onOpenChange: vi.fn(),
				direction: "outbound",
			})
		);

		await waitFor(() => {
			expect(mocks.setInitialAssignmentsSpy).toHaveBeenCalledTimes(1);
		});

		expect(result.current.seatPassengers[0]).toMatchObject({
			seatCode: "12A",
			seatType: "Window",
			price: "¥1,000",
		});

		act(() => {
			result.current.handleShowEmergencyExitSupport({
				code: "46A",
				column: "A",
				type: "Window",
				status: "exit-row",
				isSeatAvailable: true,
				amount: 1500,
				serviceCode: "STEX",
			});
		});

		expect(result.current.showingEmergencyExitSupport).toBe(true);
		expect(result.current.pendingEmergencyExitSeat?.code).toBe("46A");

		act(() => {
			result.current.handleCancelEmergencyExitSeat();
		});

		expect(result.current.pendingEmergencyExitSeat).toBeUndefined();
		expect(result.current.showingEmergencyExitSupport).toBe(true);

		act(() => {
			result.current.handleShowEmergencyExitSupport({
				code: "46A",
				column: "A",
				type: "Window",
				status: "exit-row",
				isSeatAvailable: true,
				amount: 1500,
				serviceCode: "STEX",
			});
		});

		expect(result.current.pendingEmergencyExitSeat?.code).toBe("46A");

		act(() => {
			result.current.handleConfirmEmergencyExitSeat();
		});

		await waitFor(() => {
			expect(result.current.seatPassengers[0]?.seatCode).toBe("46A");
		});

		expect(result.current.showingEmergencyExitSupport).toBe(true);
		expect(result.current.pendingEmergencyExitSeat).toBeUndefined();
	});

	it("clears stale local assignments when the segment no longer has stored seats", async () => {
		mocks.initialAssignments = new Map([
			[
				0,
				{
					seatCode: "12A",
					amount: 1000,
					serviceCode: "STFW",
					seatType: "Window",
				},
			],
		]);
		mocks.state.passengers = [{ id: "p1", seats: [] }, { id: "p2" }];

		const { result } = renderHook(() =>
			useSeatMapDialog({ open: true, onOpenChange: vi.fn(), direction: "outbound" })
		);

		await waitFor(() => {
			expect(mocks.setInitialAssignmentsSpy).toHaveBeenCalledWith(new Map());
		});

		expect(result.current.seatPassengers[0]?.seatCode).toBeUndefined();
	});
});
