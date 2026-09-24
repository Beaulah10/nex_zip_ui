import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
	dispatch: vi.fn(),

	confirmedFlight: {
		flights: {
			outbound: {
				segments: [
					{
						lfid: 100,
						pfid: 900,
					},
					{
						lfid: 200,
						pfid: 901,
					},
				],
			},
			inbound: {
				segments: [
					{
						lfid: 300,
						pfid: 902,
					},
				],
			},
		},
	} as any,

	orderedPassengersWithNames: [
		{
			id: "p1",
			firstName: "John",
			lastName: "Doe",
			passengerTypeCode: "adt",
		},
		{
			id: "p2",
			firstName: "Jane",
			lastName: "Smith",
			passengerTypeCode: "adt",
		},
		{
			id: "p3",
			firstName: "Baby",
			lastName: "Doe",
			passengerTypeCode: "infant",
			mappedAdultId: "p1",
		},
	] as any[],

	savedPassengers: [] as any[],

	expressPricing: {
		amount: 1500,
		quantityAvailable: 2,
	},

	bookingStageSegment: "segment1" as string,

	selectedSegment: {
		lfid: 100,
		pfid: 900,
	} as any,

	expressService: {
		amount: 1500,
		qtyAvailable: 2,
		categoryId: 10,
		passengerType: "adt",
		service: {
			lfid: 100,
			pfid: 900,
			amount: 1500,
			cutOffHours: 24,
			description: "Express Service",
			maxCountServiceLevel: 2,
			qtyAvailable: 2,
			ssrCode: "EXPS",
			ssrId: 500,
		},
	} as any,

	addService: vi.fn((payload) => ({
		type: "passenger/addService",
		payload,
	})),

	removeService: vi.fn((payload) => ({
		type: "passenger/removeService",
		payload,
	})),
}));

vi.mock("next-intl", () => ({
	useTranslations: () => (key: string, values?: { count?: number }) => {
		const labels: Record<string, string> = {
			out_of_stock_message: "Out of stock",
			remaining_stocks_label: `${values?.count ?? 0} remaining`,
		};

		return labels[key] ?? key;
	},
}));

vi.mock("@/components/common/select-customers/select-customers", () => ({
	createSelectCustomerListItems: (passengers: any[]) =>
		passengers.map((passenger) => ({
			id: passenger.id,
			name: `${passenger.firstName ?? ""} ${passenger.lastName ?? ""}`.trim(),
			category: passenger.passengerTypeCode ?? "Passenger",
			price: 0,
			checked: false,
			disabled: false,
			passengerTypeCode: passenger.passengerTypeCode,
			mappedAdultId: passenger.mappedAdultId,
		})),
}));

vi.mock("@/components/customize/customize", () => ({
	getSelectedAncillarySegment: vi.fn(() => mocks.selectedSegment),
}));

vi.mock("@/modules/hooks/common/passenger-order/passenger-order", () => ({
	usePassengerOrder: () => ({
		orderedPassengersWithNames: mocks.orderedPassengersWithNames,
	}),
}));

vi.mock("@/modules/utils/constants/ancillary-service.constants", () => ({
	ANCILLARY_SERVICE_CONFIG: {
		express: {
			serviceCategory: "EXPRESS",
			ssrCode: "EXPS",
			pricingPassengerType: "adt",
		},
	},
}));

vi.mock("@/modules/utils/constants/priority-service/passenger-types.constants", () => ({
	UNDER_SIX_DEPENDENT_TYPES: new Set(["infant"]),
	INFANT_PASSENGER_TYPES: new Set(["infant"]),
}));

vi.mock("@/modules/utils/helpers/ancillary/ancillary-service", () => ({
	resolveAncillaryServiceOffer: vi.fn(() => mocks.expressService),
}));

vi.mock("@/modules/utils/helpers/common/flow-router/flow-router", () => ({
	getBookingStageSegment: vi.fn(() => mocks.bookingStageSegment),
	getFlightSegmentByDirection: vi.fn(() => mocks.selectedSegment),
}));

vi.mock("@/store/hooks", () => ({
	useAppDispatch: () => mocks.dispatch,
	useAppSelector: (selector: any) => selector({}),
}));

vi.mock("@/store/slices/common/ancillary-offers/ancillary-offers", () => ({
	selectAncillaryPricingBySsrCode: vi.fn(() => mocks.expressPricing),
	selectAncillaryOffersDataByDirectionAndServiceCategory: vi.fn(() => ({
		data: {
			servicesPerPassengerType: [],
		},
	})),
}));

vi.mock("@/store/slices/flight-selection/flight-selection.slice", () => ({
	selectConfirmedFlight: vi.fn(() => mocks.confirmedFlight),
}));

vi.mock("@/store/slices/passenger/passenger.slice", () => ({
	selectPassengers: vi.fn(() => mocks.savedPassengers),
	addService: mocks.addService,
	removeService: mocks.removeService,
}));

import { usePriorityService } from "./priority-service";

describe("usePriorityService", () => {
	beforeEach(() => {
		vi.clearAllMocks();

		mocks.confirmedFlight = {
			flights: {
				outbound: {
					segments: [
						{
							lfid: 100,
							pfid: 900,
						},
						{
							lfid: 200,
							pfid: 901,
						},
					],
				},
				inbound: {
					segments: [
						{
							lfid: 300,
							pfid: 902,
						},
					],
				},
			},
		};

		mocks.orderedPassengersWithNames = [
			{
				id: "p1",
				firstName: "John",
				lastName: "Doe",
				passengerTypeCode: "adt",
			},
			{
				id: "p2",
				firstName: "Jane",
				lastName: "Smith",
				passengerTypeCode: "adt",
			},
			{
				id: "p3",
				firstName: "Baby",
				lastName: "Doe",
				passengerTypeCode: "infant",
				mappedAdultId: "p1",
			},
		];

		mocks.savedPassengers = [];

		mocks.expressPricing = {
			amount: 1500,
			quantityAvailable: 2,
		};

		mocks.bookingStageSegment = "segment1";

		mocks.selectedSegment = {
			lfid: 100,
			pfid: 900,
		};

		mocks.expressService = {
			amount: 1500,
			qtyAvailable: 2,
			categoryId: 10,
			passengerType: "adt",
			service: {
				lfid: 100,
				pfid: 900,
				amount: 1500,
				cutOffHours: 24,
				description: "Express Service",
				maxCountServiceLevel: 2,
				qtyAvailable: 2,
				ssrCode: "EXPS",
				ssrId: 500,
			},
		};
	});

	it("returns passenger rows with default values", () => {
		const { result } = renderHook(() => usePriorityService("outbound" as any));

		expect(result.current.priorityServicePassengers).toHaveLength(3);

		expect(result.current.priorityServicePassengers[0]).toMatchObject({
			id: "p1",
			name: "John Doe",
			price: 1500,
			checked: false,
			disabled: false,
			passengerTypeCode: "adt",
		});

		expect(result.current.priorityServicePassengers[2]).toMatchObject({
			id: "p3",
			name: "Baby Doe",
			price: 0,
			checked: false,
			disabled: true,
			passengerTypeCode: "infant",
		});

		expect(result.current.priorityServiceTotalAmount).toBe(0);
	});

	it("shows remaining stock label when stock is below threshold", () => {
		const { result } = renderHook(() => usePriorityService("outbound" as any));

		expect(result.current.remainingStocksLabel).toBe("2 remaining");
		expect(result.current.hasOutOfStockPassengers).toBe(false);
	});

	it("selects one adult passenger and updates total amount", () => {
		const { result } = renderHook(() => usePriorityService("outbound" as any));

		act(() => {
			result.current.togglePriorityPax("p1", true);
		});

		expect(result.current.priorityServicePassengers[0]?.checked).toBe(true);
		expect(result.current.priorityServiceTotalAmount).toBe(1500);
	});

	it("auto-selects dependent passenger when mapped adult is selected", () => {
		const { result } = renderHook(() => usePriorityService("outbound" as any));

		act(() => {
			result.current.togglePriorityPax("p1", true);
		});

		expect(result.current.priorityServicePassengers[2]).toMatchObject({
			id: "p3",
			checked: true,
			disabled: true,
			price: 0,
		});
	});

	it("does not allow selecting dependent passenger directly", () => {
		const { result } = renderHook(() => usePriorityService("outbound" as any));

		act(() => {
			result.current.togglePriorityPax("p3", true);
		});

		expect(result.current.priorityServicePassengers[2]?.checked).toBe(false);
		expect(result.current.priorityServiceTotalAmount).toBe(0);
	});

	it("selects all available adult passengers", () => {
		const { result } = renderHook(() => usePriorityService("outbound" as any));

		act(() => {
			result.current.togglePrioritySelectAll(true);
		});

		expect(result.current.priorityServicePassengers[0]?.checked).toBe(true);
		expect(result.current.priorityServicePassengers[1]?.checked).toBe(true);
		expect(result.current.priorityServiceTotalAmount).toBe(3000);
	});

	it("clears selected passengers", () => {
		const { result } = renderHook(() => usePriorityService("outbound" as any));

		act(() => {
			result.current.togglePrioritySelectAll(true);
		});

		act(() => {
			result.current.togglePrioritySelectAll(false);
		});

		expect(result.current.priorityServicePassengers[0]?.checked).toBe(false);
		expect(result.current.priorityServicePassengers[1]?.checked).toBe(false);
		expect(result.current.priorityServiceTotalAmount).toBe(0);
	});

	it("prevents selecting more passengers than available stock", () => {
		mocks.expressPricing = {
			amount: 1500,
			quantityAvailable: 1,
		};

		const { result } = renderHook(() => usePriorityService("outbound" as any));

		act(() => {
			result.current.togglePriorityPax("p1", true);
		});

		act(() => {
			result.current.togglePriorityPax("p2", true);
		});

		expect(result.current.priorityServicePassengers[0]?.checked).toBe(true);
		expect(result.current.priorityServicePassengers[1]?.checked).toBe(false);
		expect(result.current.priorityServicePassengers[1]?.disabled).toBe(true);
		expect(result.current.priorityServicePassengers[1]?.status).toBe("Out of stock");
		expect(result.current.hasOutOfStockPassengers).toBe(true);
	});

	it("does not reset passenger rows when dialog is closed", () => {
		const { result } = renderHook(() => usePriorityService("outbound" as any, false));

		expect(result.current.priorityServicePassengers).toHaveLength(3);
	});

	it("does not auto-select the clicked passenger when the dialog opens", () => {
		const { result } = renderHook(() => usePriorityService("outbound" as any));

		expect(result.current.priorityServicePassengers[0]?.checked).toBe(false);
		expect(result.current.priorityServicePassengers[1]?.checked).toBe(false);
		expect(result.current.priorityServiceTotalAmount).toBe(0);
	});

	it("loads persisted selected express passengers", () => {
		mocks.savedPassengers = [
			{
				id: "p1",
				passengerTypeCode: "adt",
				services: {
					express: [
						{
							lfid: 100,
						},
					],
				},
			},
		];

		const { result } = renderHook(() => usePriorityService("outbound" as any));

		expect(result.current.priorityServicePassengers[0]?.checked).toBe(true);
		expect(result.current.priorityServiceTotalAmount).toBe(1500);
	});

	it("shows transit applicability warning and locks already covered passengers on second segment", () => {
		mocks.bookingStageSegment = "segment2";

		mocks.selectedSegment = {
			lfid: 200,
			pfid: 901,
		};

		mocks.savedPassengers = [
			{
				id: "p1",
				passengerTypeCode: "adt",
				services: {
					express: [
						{
							lfid: 100,
						},
					],
				},
			},
		];

		const { result } = renderHook(() => usePriorityService("outbound" as any));

		expect(result.current.showTransitApplicabilityWarning).toBe(true);

		expect(result.current.priorityServicePassengers[0]).toMatchObject({
			id: "p1",
			checked: true,
			disabled: true,
		});
	});

	it("does not toggle transit locked passenger", () => {
		mocks.bookingStageSegment = "segment2";

		mocks.selectedSegment = {
			lfid: 200,
			pfid: 901,
		};

		mocks.savedPassengers = [
			{
				id: "p1",
				passengerTypeCode: "adt",
				services: {
					express: [
						{
							lfid: 100,
						},
					],
				},
			},
		];

		const { result } = renderHook(() => usePriorityService("outbound" as any));

		act(() => {
			result.current.togglePriorityPax("p1", false);
		});

		expect(result.current.priorityServicePassengers[0]?.checked).toBe(true);
		expect(result.current.priorityServicePassengers[0]?.disabled).toBe(true);
	});

	it("confirms selected adult and dependent passenger services", () => {
		const { result } = renderHook(() => usePriorityService("outbound" as any));

		act(() => {
			result.current.togglePriorityPax("p1", true);
		});

		act(() => {
			result.current.confirmPrioritySelection();
		});

		expect(mocks.addService).toHaveBeenCalledTimes(2);

		expect(mocks.addService).toHaveBeenCalledWith(
			expect.objectContaining({
				passengerId: "p1",
				lfid: 100,
				serviceCategory: "express",
				service: expect.objectContaining({
					amount: 1500,
					ssrCode: "EXPS",
					serviceID: 500,
				}),
			})
		);

		expect(mocks.addService).toHaveBeenCalledWith(
			expect.objectContaining({
				passengerId: "p3",
				lfid: 100,
				serviceCategory: "express",
				service: expect.objectContaining({
					amount: 0,
					ssrCode: "EXPS",
					serviceID: 500,
				}),
			})
		);

		expect(mocks.dispatch).toHaveBeenCalledTimes(2);
	});

	it("removes persisted services before confirming for non-transit segment", () => {
		mocks.savedPassengers = [
			{
				id: "p1",
				passengerTypeCode: "adt",
				services: {
					express: [
						{
							lfid: 100,
						},
					],
				},
			},
		];

		const { result } = renderHook(() => usePriorityService("outbound" as any));

		act(() => {
			result.current.togglePriorityPax("p1", true);
		});

		act(() => {
			result.current.confirmPrioritySelection();
		});

		expect(mocks.removeService).toHaveBeenCalledWith({
			passengerId: "p1",
			lfid: 100,
			ssrCode: "EXPS",
			serviceID: 500,
		});

		expect(mocks.addService).toHaveBeenCalled();
	});

	it("does not remove first segment services when confirming transit second segment", () => {
		mocks.bookingStageSegment = "segment2";

		mocks.selectedSegment = {
			lfid: 200,
			pfid: 901,
		};

		mocks.savedPassengers = [
			{
				id: "p1",
				passengerTypeCode: "adt",
				services: {
					express: [
						{
							lfid: 100,
						},
					],
				},
			},
		];

		const { result } = renderHook(() => usePriorityService("outbound" as any));

		act(() => {
			result.current.confirmPrioritySelection();
		});

		expect(mocks.removeService).not.toHaveBeenCalled();
	});

	it("does not confirm when express service is missing", () => {
		mocks.expressService = undefined as any;

		const { result } = renderHook(() => usePriorityService("outbound" as any));

		act(() => {
			result.current.togglePriorityPax("p1", true);
		});

		act(() => {
			result.current.confirmPrioritySelection();
		});

		expect(mocks.addService).not.toHaveBeenCalled();
		expect(mocks.removeService).not.toHaveBeenCalled();
		expect(mocks.dispatch).not.toHaveBeenCalled();
	});

	it("uses default pricing when confirmed flight is missing", () => {
		mocks.confirmedFlight = undefined as any;

		const { result } = renderHook(() => usePriorityService("outbound" as any));

		expect(result.current.priorityServicePassengers[0]?.price).toBe(0);
		expect(result.current.priorityServiceTotalAmount).toBe(0);
	});
});
