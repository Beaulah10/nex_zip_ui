import { describe, expect, it, vi } from "vitest";
import type { BaggageCategoryId } from "@/types/baggage-selection/baggage-selection.types";
import {
	dispatchBaggageChanges,
	getConnectingSegmentInfo,
	getDefaultBaggageActions,
	getFlightSegment,
	hasBaggageService,
} from "./baggage-selection-utils";

const getBookingStagSegmentMock = vi.hoisted(() => vi.fn());

vi.mock("@/modules/utils/helpers/common/flow-router/flow-router", () => ({
	getBookingStageSegment: getBookingStagSegmentMock,
}));

type FlightSegmentArgs = Parameters<typeof getFlightSegment>[0];
type ConnectingSegmentArgs = Parameters<typeof getConnectingSegmentInfo>[0];
type DefaultBaggageActionsArgs = Parameters<typeof getDefaultBaggageActions>[0];

const createSelectedSegment = (
	lfid: number,
	pfid = lfid + 100,
	origin = "NRT",
	destination = "BKK"
) => ({
	pfid,
	lfid,
	carrierCode: "ZG",
	origin,
	destination,
	flightNumber: `ZG${lfid}`,
	scheduledDepartureArrivalDateTime: {
		departureDateTime: "2026-08-14T09:00:00",
		departureDateTimeOffset: "+09:00",
		arrivalDateTime: "2026-08-14T12:00:00",
		arrivalDateTimeOffset: "+09:00",
	},
	flightTime: "03:00",
	selectedCabin: "standard",
	fareDetails: [],
});

const createBound = (segments: ReturnType<typeof createSelectedSegment>[]) => ({
	segments,
	selectedFareInfos: [],
	passengerFareBreakdown: [],
	totalFlightAmount: 0,
});

const createConfirmedFlight = (): FlightSegmentArgs["confirmedFlight"] => ({
	tripType: "roundtrip",
	selectedCabinsOutbound: {},
	selectedCabinsInbound: {},
	grandTotalAmount: 0,
	currency: "JPY",
	language: "en",
	flights: {
		outbound: createBound([
			createSelectedSegment(1001, 1101, "NRT", "BKK"),
			createSelectedSegment(1002, 1102, "BKK", "SIN"),
		]),
		inbound: createBound([createSelectedSegment(2001, 2101, "SIN", "NRT")]),
	},
});

const createServicePassenger = (
	overrides: Partial<DefaultBaggageActionsArgs["servicePassengers"][number]>
): DefaultBaggageActionsArgs["servicePassengers"][number] => ({
	id: "passenger1",
	name: "John Doe",
	passengerTypeCode: "adult",
	bundleCode: "PRMK",
	bundleLabel: "Premium",
	mealfeatures: [],
	baggagefeatures: [],
	...overrides,
	isIcnRoute: overrides.isIcnRoute ?? false,
	isValueBundle: overrides.isValueBundle ?? overrides.bundleCode === "VALK",
});

const createOrderedPassenger = (
	overrides: Partial<DefaultBaggageActionsArgs["orderedPassengersWithNames"][number]>
): DefaultBaggageActionsArgs["orderedPassengersWithNames"][number] => ({
	id: "passenger1",
	firstName: "John",
	lastName: "Doe",
	mappedAdultId: "passenger1",
	passengerTypeCode: "adult",
	services: { baggage: [] },
	...overrides,
});

const createBaggageService = (overrides: Record<string, unknown> = {}) => ({
	lfid: 1001,
	pfid: 0,
	categoryId: 143,
	cutOffHours: 0,
	maxCountServiceLevel: 999,
	passengerType: "adult",
	qtyAvailable: 10,
	serviceID: 1221,
	chargeComment: "",
	bundleCode: "PRMK",
	ssrCode: "BAGN",
	description: "Checked-in Baggage",
	amount: 7500,
	...overrides,
});

const createBaggageQuantityMap = ({
	ssrCode = "BAGN",
	quantity,
	bundleCode = "PRMK",
	categoryId = 143,
	amount = 7500,
}: {
	ssrCode?: string;
	quantity: number;
	bundleCode?: string;
	categoryId?: number;
	amount?: number;
}) => ({
	[ssrCode]: {
		service: createBaggageService({
			ssrCode,
			bundleCode,
			categoryId,
			amount,
		}),
		quantity,
	},
});

describe("baggage-selection-utils", () => {
	describe("getFlightSegment", () => {
		const mockConfirmedFlight = createConfirmedFlight();

		it("returns the first outbound segment when stageSegment is 'segment1'", () => {
			getBookingStagSegmentMock.mockReturnValue("segment1");

			const result = getFlightSegment({
				confirmedFlight: mockConfirmedFlight,
				direction: "outbound",
			});

			expect(result).toEqual(mockConfirmedFlight.flights.outbound.segments[0]);
		});

		it("returns the second outbound segment or first inbound segment when stageSegment is 'segment2'", () => {
			getBookingStagSegmentMock.mockReturnValue("segment2");

			const result = getFlightSegment({
				confirmedFlight: mockConfirmedFlight,
				direction: "outbound",
			});

			expect(result).toEqual(mockConfirmedFlight.flights.outbound.segments[1]);
		});

		it("returns the first outbound segment for non-connecting flights", () => {
			getBookingStagSegmentMock.mockReturnValue("outbound");

			const result = getFlightSegment({
				confirmedFlight: mockConfirmedFlight,
				direction: "outbound",
			});

			expect(result).toEqual(mockConfirmedFlight.flights.outbound.segments[0]);
		});

		it("returns the first inbound segment for inbound direction", () => {
			getBookingStagSegmentMock.mockReturnValue("inbound");

			const result = getFlightSegment({
				confirmedFlight: mockConfirmedFlight,
				direction: "inbound",
			});

			expect(result).toEqual(mockConfirmedFlight.flights.inbound?.segments[0]);
		});

		it("returns first outbound segment when no inbound exists", () => {
			const flightWithoutInbound: ConnectingSegmentArgs["confirmedFlight"] = {
				...mockConfirmedFlight,
				flights: {
					...mockConfirmedFlight.flights,
					inbound: undefined,
				},
			};

			getBookingStagSegmentMock.mockReturnValue("inbound");

			const result = getFlightSegment({
				confirmedFlight: flightWithoutInbound,
				direction: "inbound",
			});

			expect(result).toEqual(mockConfirmedFlight.flights.outbound.segments[0]);
		});

		it("returns the first inbound segment for segment2 when a second outbound segment does not exist", () => {
			const confirmedFlight = createConfirmedFlight();

			const flightWithSingleOutbound = {
				...confirmedFlight,
				flights: {
					...confirmedFlight.flights,
					outbound: createBound([createSelectedSegment(1001, 1101, "NRT", "SIN")]),
				},
			};

			getBookingStagSegmentMock.mockReturnValue("segment2");

			const result = getFlightSegment({
				confirmedFlight: flightWithSingleOutbound,
				direction: "outbound",
			});

			expect(result).toEqual(flightWithSingleOutbound.flights.inbound?.segments[0]);
		});
	});

	describe("getConnectingSegmentInfo", () => {
		const mockConfirmedFlight = createConfirmedFlight();

		it("returns correct info for segment1 in connecting flight", () => {
			getBookingStagSegmentMock.mockReturnValue("segment1");

			const result = getConnectingSegmentInfo({
				confirmedFlight: mockConfirmedFlight,
				direction: "outbound",
			});

			expect(result.isConnectingFlight).toBe(true);
			expect(result.otherStageLabel).toBe("Segment 2");
			expect(result.otherLfid).toBe(2001);
		});

		it("returns correct info for segment2 in connecting flight", () => {
			getBookingStagSegmentMock.mockReturnValue("segment2");

			const result = getConnectingSegmentInfo({
				confirmedFlight: mockConfirmedFlight,
				direction: "outbound",
			});

			expect(result.isConnectingFlight).toBe(true);
			expect(result.otherStageLabel).toBe("Segment 1");
			expect(result.otherLfid).toBe(1001);
		});

		it("returns isConnectingFlight false for non-connecting flights", () => {
			getBookingStagSegmentMock.mockReturnValue("outbound");

			const result = getConnectingSegmentInfo({
				confirmedFlight: mockConfirmedFlight,
				direction: "outbound",
			});

			expect(result.isConnectingFlight).toBe(false);
			expect(result.otherStageLabel).toBeUndefined();
			expect(result.otherLfid).toBeUndefined();
		});

		it("returns first outbound lfid for segment2 even when inbound is missing", () => {
			const flightWithoutInbound: ConnectingSegmentArgs["confirmedFlight"] = {
				...mockConfirmedFlight,
				flights: {
					...mockConfirmedFlight.flights,
					inbound: undefined,
				},
			};

			getBookingStagSegmentMock.mockReturnValue("segment2");

			const result = getConnectingSegmentInfo({
				confirmedFlight: flightWithoutInbound,
				direction: "outbound",
			});

			// When inbound is missing, otherLfid should be from outbound (1001)
			expect(result.otherLfid).toBe(1001);
		});
		it("uses the second outbound lfid for segment1 when inbound is missing", () => {
			const confirmedFlight = createConfirmedFlight();

			const flightWithoutInbound: ConnectingSegmentArgs["confirmedFlight"] = {
				...confirmedFlight,
				flights: {
					...confirmedFlight.flights,
					inbound: undefined,
				},
			};

			getBookingStagSegmentMock.mockReturnValue("segment1");

			const result = getConnectingSegmentInfo({
				confirmedFlight: flightWithoutInbound,
				direction: "outbound",
			});

			expect(result.isConnectingFlight).toBe(true);
			expect(result.otherStageLabel).toBe("Segment 2");
			expect(result.otherLfid).toBe(1002);
		});
		it("returns undefined otherLfid for segment1 when no other segment exists", () => {
			const confirmedFlight = createConfirmedFlight();

			const flightWithoutOtherSegment: ConnectingSegmentArgs["confirmedFlight"] = {
				...confirmedFlight,
				flights: {
					outbound: createBound([createSelectedSegment(1001, 1101, "NRT", "SIN")]),
					inbound: undefined,
				},
			};

			getBookingStagSegmentMock.mockReturnValue("segment1");

			const result = getConnectingSegmentInfo({
				confirmedFlight: flightWithoutOtherSegment,
				direction: "outbound",
			});

			expect(result).toEqual({
				isConnectingFlight: true,
				otherStageLabel: "Segment 2",
				otherLfid: undefined,
			});
		});
	});

	describe("dispatchBaggageChanges", () => {
		const mockDispatch = vi.fn();

		beforeEach(() => {
			vi.clearAllMocks();
		});

		it("dispatches carry-on toggle when adding", () => {
			dispatchBaggageChanges({
				dispatch: mockDispatch,
				passengerId: "passenger1",
				currentLfid: 1001,
				changeType: "carry-on",
				original: false,
				updated: true,
				service: {
					lfid: 1001,
					pfid: 0,
					categoryId: 144,
					cutOffHours: 0,
					maxCountServiceLevel: 100,
					passengerType: "adult",
					qtyAvailable: 5,
					serviceID: 1281,
					chargeComment: "",
					bundleCode: "PRMK",
					ssrCode: "CABN",
					description: "Carry-on Baggage",
					amount: 4000,
				},
			});

			expect(mockDispatch).toHaveBeenCalled();
		});

		it("omits bundleCode when adding a NOBN carry-on baggage service", () => {
			dispatchBaggageChanges({
				dispatch: mockDispatch,
				passengerId: "passenger1",
				currentLfid: 1001,
				changeType: "carry-on",
				original: false,
				updated: true,
				service: {
					lfid: 1001,
					pfid: 0,
					categoryId: 144,
					cutOffHours: 0,
					maxCountServiceLevel: 100,
					passengerType: "adult",
					qtyAvailable: 5,
					serviceID: 1281,
					chargeComment: "",
					bundleCode: "NOBN",
					ssrCode: "CABN",
					description: "Carry-on Baggage",
					amount: 4000,
				},
			});

			expect(mockDispatch).toHaveBeenCalledWith(
				expect.objectContaining({
					payload: expect.objectContaining({
						service: expect.not.objectContaining({
							bundleCode: expect.anything(),
						}),
					}),
				})
			);
		});

		it("dispatches carry-on toggle when removing", () => {
			dispatchBaggageChanges({
				dispatch: mockDispatch,
				passengerId: "passenger1",
				currentLfid: 1001,
				changeType: "carry-on",
				original: true,
				updated: false,
				service: {
					lfid: 1001,
					pfid: 0,
					categoryId: 144,
					cutOffHours: 0,
					maxCountServiceLevel: 100,
					passengerType: "adult",
					qtyAvailable: 5,
					serviceID: 1281,
					chargeComment: "",
					bundleCode: "PRMK",
					ssrCode: "CABN",
					description: "Carry-on Baggage",
					amount: 4000,
				},
			});

			expect(mockDispatch).toHaveBeenCalled();
		});

		it("does not dispatch when carry-on service is missing", () => {
			dispatchBaggageChanges({
				dispatch: mockDispatch,
				passengerId: "passenger1",
				currentLfid: 1001,
				changeType: "carry-on",
				original: false,
				updated: true,
				service: undefined,
			});

			expect(mockDispatch).not.toHaveBeenCalled();
		});

		it("handles checked-in baggage quantity changes", () => {
			const originalMap = {
				BAGN: {
					service: {
						ssrCode: "BAGN",
						amount: 7500,
						categoryId: 143,
						lfid: 1001,
						pfid: 0,
						cutOffHours: 0,
						maxCountServiceLevel: 999,
						passengerType: "adult",
						qtyAvailable: 10,
						serviceID: 1221,
						chargeComment: "",
						bundleCode: "PRMK",
						description: "Checked-in Baggage",
					},
					quantity: 1,
				},
			};

			const updatedMap = {
				BAGN: {
					service: originalMap.BAGN.service,
					quantity: 2,
				},
			};

			dispatchBaggageChanges({
				dispatch: mockDispatch,
				passengerId: "passenger1",
				currentLfid: 1001,
				changeType: "checked-in",
				original: originalMap,
				updated: updatedMap,
			});

			expect(mockDispatch).toHaveBeenCalled();
		});

		it("handles sports equipment changes", () => {
			const originalMap = {
				SKII: {
					service: {
						ssrCode: "SKII",
						amount: 7000,
						categoryId: 145,
						lfid: 1001,
						pfid: 0,
						cutOffHours: 0,
						maxCountServiceLevel: 999,
						passengerType: "adult",
						qtyAvailable: 2,
						serviceID: 184,
						chargeComment: "",
						bundleCode: "PRMK",
						description: "Ski Equipment",
					},
					quantity: 0,
				},
			};

			const updatedMap = {
				SKII: {
					service: originalMap.SKII.service,
					quantity: 1,
				},
			};

			dispatchBaggageChanges({
				dispatch: mockDispatch,
				passengerId: "passenger1",
				currentLfid: 1001,
				changeType: "sports",
				original: originalMap,
				updated: updatedMap,
			});

			expect(mockDispatch).toHaveBeenCalled();
		});

		it("does not dispatch when carry-on remains unselected", () => {
			dispatchBaggageChanges({
				dispatch: mockDispatch,
				passengerId: "passenger1",
				currentLfid: 1001,
				changeType: "carry-on",
				original: false,
				updated: false,
				service: createBaggageService({
					categoryId: 144,
					ssrCode: "CABN",
					serviceID: 1281,
				}),
			});

			expect(mockDispatch).not.toHaveBeenCalled();
		});

		it("does not dispatch when carry-on remains selected", () => {
			dispatchBaggageChanges({
				dispatch: mockDispatch,
				passengerId: "passenger1",
				currentLfid: 1001,
				changeType: "carry-on",
				original: true,
				updated: true,
				service: createBaggageService({
					categoryId: 144,
					ssrCode: "CABN",
					serviceID: 1281,
				}),
			});

			expect(mockDispatch).not.toHaveBeenCalled();
		});

		it("does not dispatch when carry-on remains unselected", () => {
			dispatchBaggageChanges({
				dispatch: mockDispatch,
				passengerId: "passenger1",
				currentLfid: 1001,
				changeType: "carry-on",
				original: false,
				updated: false,
				service: createBaggageService({
					categoryId: 144,
					ssrCode: "CABN",
					serviceID: 1281,
				}),
			});

			expect(mockDispatch).not.toHaveBeenCalled();
		});

		it("does not dispatch when carry-on remains selected", () => {
			dispatchBaggageChanges({
				dispatch: mockDispatch,
				passengerId: "passenger1",
				currentLfid: 1001,
				changeType: "carry-on",
				original: true,
				updated: true,
				service: createBaggageService({
					categoryId: 144,
					ssrCode: "CABN",
					serviceID: 1281,
				}),
			});

			expect(mockDispatch).not.toHaveBeenCalled();
		});
		it.each([
			["NOBN", 4000],
			["VALK", 4000],
			["PRMK", 0],
		])("adds carry-on using the expected applicable amount for %s bundle", (bundleCode, expectedApplicableAmount) => {
			dispatchBaggageChanges({
				dispatch: mockDispatch,
				passengerId: "passenger1",
				currentLfid: 1001,
				changeType: "carry-on",
				original: false,
				updated: true,
				service: createBaggageService({
					categoryId: 144,
					ssrCode: "CABN",
					serviceID: 1281,
					bundleCode,
					amount: 4000,
				}),
			});

			expect(mockDispatch).toHaveBeenCalledWith(
				expect.objectContaining({
					payload: expect.objectContaining({
						service: expect.objectContaining({
							applicableAmount: expectedApplicableAmount,
						}),
					}),
				})
			);
		});
		it("does not dispatch when baggage quantity is unchanged", () => {
			const original = createBaggageQuantityMap({
				quantity: 2,
			});

			const updated = createBaggageQuantityMap({
				quantity: 2,
			});

			dispatchBaggageChanges({
				dispatch: mockDispatch,
				passengerId: "passenger1",
				currentLfid: 1001,
				changeType: "checked-in",
				original,
				updated,
			});

			expect(mockDispatch).not.toHaveBeenCalled();
		});

		it("only processes the matching SSR code when ssrCodeFilter is provided", () => {
			const original = {
				...createBaggageQuantityMap({
					ssrCode: "SKII",
					quantity: 0,
					categoryId: 145,
				}),
				...createBaggageQuantityMap({
					ssrCode: "GOLF",
					quantity: 0,
					categoryId: 145,
				}),
			};

			const updated = {
				...createBaggageQuantityMap({
					ssrCode: "SKII",
					quantity: 1,
					categoryId: 145,
				}),
				...createBaggageQuantityMap({
					ssrCode: "GOLF",
					quantity: 1,
					categoryId: 145,
				}),
			};

			dispatchBaggageChanges({
				dispatch: mockDispatch,
				passengerId: "passenger1",
				currentLfid: 1001,
				changeType: "sports",
				original,
				updated,
				ssrCodeFilter: "SKII",
			});

			expect(mockDispatch).toHaveBeenCalledTimes(1);
			expect(mockDispatch).toHaveBeenCalledWith(
				expect.objectContaining({
					payload: expect.objectContaining({
						service: expect.objectContaining({
							ssrCode: "SKII",
						}),
					}),
				})
			);
		});
		it("adds only the sports equipment quantity delta", () => {
			const original = createBaggageQuantityMap({
				ssrCode: "SKII",
				quantity: 1,
				categoryId: 145,
				amount: 7000,
			});

			const updated = createBaggageQuantityMap({
				ssrCode: "SKII",
				quantity: 3,
				categoryId: 145,
				amount: 7000,
			});

			dispatchBaggageChanges({
				dispatch: mockDispatch,
				passengerId: "passenger1",
				currentLfid: 1001,
				changeType: "sports",
				original,
				updated,
			});

			expect(mockDispatch).toHaveBeenCalledTimes(2);
		});
		it("adds one free and remaining paid checked-in services for a premium initial selection", () => {
			const original = {};

			const updated = createBaggageQuantityMap({
				quantity: 3,
				bundleCode: "PRMK",
			});

			dispatchBaggageChanges({
				dispatch: mockDispatch,
				passengerId: "passenger1",
				currentLfid: 1001,
				changeType: "checked-in",
				original,
				updated,
			});

			expect(mockDispatch).toHaveBeenCalledTimes(3);

			const applicableAmounts = mockDispatch.mock.calls.map(
				([action]) => action.payload.service.applicableAmount
			);

			expect(applicableAmounts).toEqual([0, 7500, 7500]);
		});
		it("adds only the checked-in delta when paid baggage already exists", () => {
			const original = createBaggageQuantityMap({
				quantity: 2,
				bundleCode: "PRMK",
			});

			const updated = createBaggageQuantityMap({
				quantity: 4,
				bundleCode: "PRMK",
			});

			dispatchBaggageChanges({
				dispatch: mockDispatch,
				passengerId: "passenger1",
				currentLfid: 1001,
				changeType: "checked-in",
				original,
				updated,
			});

			expect(mockDispatch).toHaveBeenCalledTimes(2);
		});
		it("adds all checked-in baggage as paid for NOBN bundle", () => {
			const original = {};

			const updated = createBaggageQuantityMap({
				quantity: 2,
				bundleCode: "NOBN",
			});

			dispatchBaggageChanges({
				dispatch: mockDispatch,
				passengerId: "passenger1",
				currentLfid: 1001,
				changeType: "checked-in",
				original,
				updated,
			});

			expect(mockDispatch).toHaveBeenCalledTimes(2);

			for (const [action] of mockDispatch.mock.calls) {
				expect(action.payload.service.applicableAmount).toBe(7500);
			}
		});
		it("adds all checked-in baggage as paid for FLEXBIZ bundle", () => {
			const original = {};

			const updated = createBaggageQuantityMap({
				quantity: 2,
				bundleCode: "FLBF",
			});

			dispatchBaggageChanges({
				dispatch: mockDispatch,
				passengerId: "passenger1",
				currentLfid: 1001,
				changeType: "checked-in",
				original,
				updated,
			});

			expect(mockDispatch).toHaveBeenCalledTimes(2);

			for (const [action] of mockDispatch.mock.calls) {
				expect(action.payload.service.applicableAmount).toBe(7500);
			}
		});
		it("removes checked-in baggage without re-adding when quantity becomes zero", () => {
			const original = createBaggageQuantityMap({
				quantity: 2,
			});

			const updated = createBaggageQuantityMap({
				quantity: 0,
			});

			dispatchBaggageChanges({
				dispatch: mockDispatch,
				passengerId: "passenger1",
				currentLfid: 1001,
				changeType: "checked-in",
				original,
				updated,
			});

			expect(mockDispatch).toHaveBeenCalledTimes(1);
			expect(mockDispatch).toHaveBeenCalledWith(
				expect.objectContaining({
					payload: expect.objectContaining({
						passengerId: "passenger1",
						lfid: 1001,
						ssrCode: "BAGN",
					}),
				})
			);
		});
		it("removes and rebuilds premium checked-in baggage with one free service", () => {
			const original = createBaggageQuantityMap({
				quantity: 4,
				bundleCode: "PRMK",
			});

			const updated = createBaggageQuantityMap({
				quantity: 2,
				bundleCode: "PRMK",
			});

			dispatchBaggageChanges({
				dispatch: mockDispatch,
				passengerId: "passenger1",
				currentLfid: 1001,
				changeType: "checked-in",
				original,
				updated,
			});

			// One remove, one free add, one paid add.
			expect(mockDispatch).toHaveBeenCalledTimes(3);

			const addActions = mockDispatch.mock.calls
				.map(([action]) => action)
				.filter((action) => action.payload.service);

			expect(addActions).toHaveLength(2);
			expect(addActions.map((action) => action.payload.service.applicableAmount)).toEqual([
				0, 7500,
			]);
		});
		it("rebuilds only the free checked-in service when premium quantity decreases to one", () => {
			const original = createBaggageQuantityMap({
				quantity: 3,
				bundleCode: "PRMK",
			});

			const updated = createBaggageQuantityMap({
				quantity: 1,
				bundleCode: "PRMK",
			});

			dispatchBaggageChanges({
				dispatch: mockDispatch,
				passengerId: "passenger1",
				currentLfid: 1001,
				changeType: "checked-in",
				original,
				updated,
			});

			// One remove and one free add.
			expect(mockDispatch).toHaveBeenCalledTimes(2);

			const addAction = mockDispatch.mock.calls
				.map(([action]) => action)
				.find((action) => action.payload.service);

			expect(addAction.payload.service.applicableAmount).toBe(0);
		});
		it("removes and re-adds the remaining sports equipment quantity", () => {
			const original = createBaggageQuantityMap({
				ssrCode: "SKII",
				quantity: 3,
				categoryId: 145,
				amount: 7000,
			});

			const updated = createBaggageQuantityMap({
				ssrCode: "SKII",
				quantity: 1,
				categoryId: 145,
				amount: 7000,
			});

			dispatchBaggageChanges({
				dispatch: mockDispatch,
				passengerId: "passenger1",
				currentLfid: 1001,
				changeType: "sports",
				original,
				updated,
			});

			// One remove and one re-add.
			expect(mockDispatch).toHaveBeenCalledTimes(2);

			const addAction = mockDispatch.mock.calls
				.map(([action]) => action)
				.find((action) => action.payload.service);

			expect(addAction.payload.service).toMatchObject({
				ssrCode: "SKII",
				applicableAmount: 7000,
			});
		});
	});

	describe("hasBaggageService", () => {
		it("returns true when service exists with matching lfid, ssrCode, and categoryId", () => {
			const services = [
				{
					lfid: 1001,
					ssrCode: "CABN",
					categoryId: 144,
					serviceID: 1281,
					amount: 4000,
					pfid: 0,
					cutOffHours: 0,
					maxCountServiceLevel: 100,
					passengerType: "adult",
					qtyAvailable: 5,
					chargeComment: "",
					bundleCode: "PRMK",
					description: "Carry-on Baggage",
				},
			];

			const result = hasBaggageService({
				services,
				lfid: 1001,
				ssrCode: "CABN",
				categoryId: 144,
			});

			expect(result).toBe(true);
		});

		it("returns false when service does not exist", () => {
			const services = [
				{
					lfid: 1001,
					ssrCode: "CABN",
					categoryId: 144,
					serviceID: 1281,
					amount: 4000,
					pfid: 0,
					cutOffHours: 0,
					maxCountServiceLevel: 100,
					passengerType: "adult",
					qtyAvailable: 5,
					chargeComment: "",
					bundleCode: "PRMK",
					description: "Carry-on Baggage",
				},
			];

			const result = hasBaggageService({
				services,
				lfid: 2001,
				ssrCode: "BAGN",
				categoryId: 143,
			});

			expect(result).toBe(false);
		});

		it("returns false when services is undefined", () => {
			const result = hasBaggageService({
				services: undefined,
				lfid: 1001,
				ssrCode: "CABN",
				categoryId: 144,
			});

			expect(result).toBe(false);
		});

		it("returns false when services is empty", () => {
			const result = hasBaggageService({
				services: [],
				lfid: 1001,
				ssrCode: "CABN",
				categoryId: 144,
			});

			expect(result).toBe(false);
		});
		it.each([
			["lfid", 2001, "CABN", 144 as BaggageCategoryId],
			["ssrCode", 1001, "BAGN", 144 as BaggageCategoryId],
			["categoryId", 1001, "CABN", 143 as BaggageCategoryId],
		])("returns false when %s does not match", (_field, lfid, ssrCode, categoryId) => {
			const services = [
				createBaggageService({
					lfid: 1001,
					ssrCode: "CABN",
					categoryId: 144,
				}),
			];

			expect(
				hasBaggageService({
					services,
					lfid,
					ssrCode,
					categoryId,
				})
			).toBe(false);
		});
	});

	describe("getDefaultBaggageActions", () => {
		it("returns empty array when no service passengers", () => {
			const result = getDefaultBaggageActions({
				currentLfid: 1001,
				servicePassengers: [],
				orderedPassengersWithNames: [],
			});

			expect(result).toEqual([]);
		});

		it("returns empty array when passenger not found in ordered list", () => {
			const servicePassengers = [createServicePassenger({})];

			const result = getDefaultBaggageActions({
				currentLfid: 1001,
				servicePassengers,
				orderedPassengersWithNames: [],
			});

			expect(result).toEqual([]);
		});

		it("returns empty array when bundle is not a default baggage bundle", () => {
			const servicePassengers = [
				createServicePassenger({ bundleCode: "NOBN", bundleLabel: "None" }),
			];

			const orderedPassengersWithNames = [createOrderedPassenger({})];

			const result = getDefaultBaggageActions({
				currentLfid: 1001,
				servicePassengers,
				orderedPassengersWithNames,
			});

			expect(result).toEqual([]);
		});

		it("adds default baggage services for VALUE bundle", () => {
			const servicePassengers = [
				createServicePassenger({ bundleCode: "VALK", bundleLabel: "Value" }),
			];

			const orderedPassengersWithNames = [createOrderedPassenger({})];

			const result = getDefaultBaggageActions({
				currentLfid: 1001,
				servicePassengers,
				orderedPassengersWithNames,
			});

			// VALUE bundle has BAGN service by default
			expect(result.length).toBeGreaterThan(0);
			expect(result[0]?.payload.service.bundleCode).toBe("VALK");
		});

		it("does not add bundleCode to default baggage services for NOBN", () => {
			const servicePassengers = [
				createServicePassenger({ bundleCode: "NOBN", bundleLabel: "No bundle" }),
			];

			const result = getDefaultBaggageActions({
				currentLfid: 1001,
				currentPfid: 1101,
				servicePassengers,
				orderedPassengersWithNames: [
					createOrderedPassenger({
						services: { baggage: [] },
					}),
				],
			});

			expect(result).toEqual([]);
		});

		it("skips services that already exist", () => {
			const servicePassengers = [createServicePassenger({})];

			const orderedPassengersWithNames = [
				createOrderedPassenger({
					services: {
						baggage: [
							{
								lfid: 1001,
								ssrCode: "CABN",
								categoryId: 144,
								serviceID: 1281,
								amount: 4000,
								pfid: 0,
								cutOffHours: 0,
								maxCountServiceLevel: 100,
								passengerType: "adult",
								qtyAvailable: 5,
								chargeComment: "",
								bundleCode: "PRMK",
								description: "Carry-on Baggage",
							},
						],
					},
				}),
			];

			const result = getDefaultBaggageActions({
				currentLfid: 1001,
				servicePassengers,
				orderedPassengersWithNames,
			});

			// PREMIUM bundle has BAGN and CABN by default, but CABN already exists
			expect(result.length).toBeLessThanOrEqual(1);
		});

		it("adds the expected default checked-in baggage for VALUE bundle", () => {
			const result = getDefaultBaggageActions({
				currentLfid: 1001,
				servicePassengers: [
					createServicePassenger({
						bundleCode: "VALK",
						bundleLabel: "Value",
					}),
				],
				orderedPassengersWithNames: [
					createOrderedPassenger({
						services: undefined,
					}),
				],
			});

			expect(result).toHaveLength(1);
			expect(result[0]).toEqual(
				expect.objectContaining({
					payload: expect.objectContaining({
						passengerId: "passenger1",
						lfid: 1001,
						serviceCategory: "baggage",
						service: expect.objectContaining({
							ssrCode: "BAGN",
							categoryId: 143,
							bundleCode: "VALK",
							applicableAmount: 0,
						}),
					}),
				})
			);
		});
	});
});
