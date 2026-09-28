import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { ConfirmedFlightPayload } from "@/store/slices/flight-selection/flight-selection.slice";
import type {
	FlightSelectionApiResponse,
	FlightSelectionRequest,
} from "@/types/flight-selection/flight-selection.types";
import { flightSelectionData } from "./flight-selection-data";

// ─────────────────────────────────────────────────────────────────────────────
// Hoisted mocks
// ─────────────────────────────────────────────────────────────────────────────

const {
	dispatchMock,
	selectConfirmedFlightMock,
	clearFlightSelectionMock,
	fetchFlightSelectionMock,
	getFlightDetailsFromBoundMock,
	getFlightDisplayItemsMock,
	getFlightsByDateMock,
	airCalendarTabsMock,
	outboundCabinSelectionMock,
	inboundCabinSelectionMock,
} = vi.hoisted(() => {
	const dispatchMock = vi.fn().mockResolvedValue({});
	const selectConfirmedFlightMock = vi.fn();
	const clearAction = { type: "flightSelection/clear" };
	const fetchAction = { type: "flightSelection/fetch" };
	return {
		dispatchMock,
		selectConfirmedFlightMock,
		clearFlightSelectionMock: vi.fn(() => clearAction),
		fetchFlightSelectionMock: vi.fn(() => fetchAction),
		getFlightDetailsFromBoundMock: vi.fn(() => [] as unknown[]),
		getFlightDisplayItemsMock: vi.fn(() => [] as unknown[]),
		getFlightsByDateMock: vi.fn(() => [] as unknown[]),
		airCalendarTabsMock: vi.fn(() => [] as unknown[]),
		outboundCabinSelectionMock: vi.fn(
			(current: Record<string, string>, id: string, cabin: string) => ({ ...current, [id]: cabin })
		),
		inboundCabinSelectionMock: vi.fn(
			(current: Record<string, string>, id: string, cabin: string) => ({ ...current, [id]: cabin })
		),
	};
});

// Mutable selector state – mutate between tests to control hook inputs
const flightSelState: {
	data: FlightSelectionApiResponse | null | undefined;
	request: FlightSelectionRequest | undefined;
	isPending: boolean;
	error: string | null | undefined;
} = { data: null, request: undefined, isPending: false, error: null };

const confirmedFlightRef: { value: ConfirmedFlightPayload | null } = { value: null };

vi.mock("@/store/hooks", () => ({
	useAppDispatch: () => dispatchMock,
	useAppSelector: (selector: (state: unknown) => unknown) =>
		selector === selectConfirmedFlightMock ? confirmedFlightRef.value : flightSelState,
}));

vi.mock("@/store/slices/flight-selection/flight-selection.slice", () => ({
	clearFlightSelection: clearFlightSelectionMock,
	fetchFlightSelection: fetchFlightSelectionMock,
	selectConfirmedFlight: selectConfirmedFlightMock,
}));

vi.mock(
	"@/modules/utils/helpers/flight-selection/flight-mapper-utils/flight-mapper-utils.ts",
	() => ({
		getFlightDetailsFromBound: getFlightDetailsFromBoundMock,
		getFlightDisplayItems: getFlightDisplayItemsMock,
	})
);

vi.mock("@/modules/utils/helpers/flight-selection/flight-date-utils/flight-date-utils", () => ({
	getFlightsByDate: getFlightsByDateMock,
}));

vi.mock(
	"@/modules/utils/helpers/flight-selection/air-calendar-tabs-utils/air-calendar-tabs-utils",
	() => ({ airCalendarTabs: airCalendarTabsMock })
);

vi.mock("@/modules/utils/helpers/flight-selection/cabin-utils/cabin-utils", () => ({
	outboundCabinSelection: outboundCabinSelectionMock,
	inboundCabinSelection: inboundCabinSelectionMock,
}));

// ─────────────────────────────────────────────────────────────────────────────
// Factories
// ─────────────────────────────────────────────────────────────────────────────

const baseRequest: FlightSelectionRequest = {
	routes: "NRT,BKK",
	departureDateFrom: "2026-08-01",
	adult: 2,
};

const roundtripRequest: FlightSelectionRequest = {
	...baseRequest,
	departureDateTo: "2026-08-10",
};

function makeApiResponse(withInbound = false): FlightSelectionApiResponse {
	return {
		data: {
			outbound: { airCalendarFare: [], flightsByDate: [] },
			...(withInbound && { inbound: { airCalendarFare: [], flightsByDate: [] } }),
		},
	};
}

const mockRawFlight = {
	isConnectingFlight: false,
	scheduledDepartureArrivalDateTime: { departureDateTime: "2026-08-01T09:00:00" },
} as never;

// ─────────────────────────────────────────────────────────────────────────────
// Tests
// ─────────────────────────────────────────────────────────────────────────────

describe("flightSelectionData", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		flightSelState.data = null;
		flightSelState.request = undefined;
		flightSelState.isPending = false;
		flightSelState.error = null;
		confirmedFlightRef.value = null;
		dispatchMock.mockResolvedValue({});
	});

	it("dispatches on mount and returns oneway defaults", () => {
		const { result } = renderHook(() => flightSelectionData("en", baseRequest));

		expect(dispatchMock).toHaveBeenCalledWith({ type: "flightSelection/clear" });
		expect(dispatchMock).toHaveBeenCalledWith({ type: "flightSelection/fetch" });
		expect(result.current.tripType).toBe("oneway");
		expect(result.current.isRoundTrip).toBe(false);
		expect(result.current.activeRequest).toBe(baseRequest);
		expect(result.current.error).toBeNull();
	});

	it("uses storedRequest as activeRequest when Redux has one", () => {
		const stored: FlightSelectionRequest = {
			routes: "BKK,NRT",
			departureDateFrom: "2026-09-01",
			adult: 1,
		};
		flightSelState.request = stored;

		const { result } = renderHook(() => flightSelectionData("en", baseRequest));

		expect(result.current.activeRequest).toBe(stored);
	});

	it("returns roundtrip type when departureDateTo is present", () => {
		const { result } = renderHook(() => flightSelectionData("en", roundtripRequest));

		expect(result.current.tripType).toBe("roundtrip");
		expect(result.current.isRoundTrip).toBe(true);
	});

	it("processes outbound flightData, sets tabs, and resets inbound for oneway trip", () => {
		flightSelState.data = makeApiResponse();
		getFlightDetailsFromBoundMock
			.mockReturnValueOnce([mockRawFlight]) // outbound
			.mockReturnValueOnce([]); // no inbound
		airCalendarTabsMock.mockReturnValue([{ value: "8-1", date: "2026-08-01", price: "12000" }]);
		getFlightsByDateMock.mockReturnValue([]);

		const { result } = renderHook(() => flightSelectionData("en", baseRequest));

		expect(airCalendarTabsMock).toHaveBeenCalledTimes(1);
		expect(result.current.calendarTabsOutbound).toHaveLength(1);
		expect(result.current.calendarTabsInbound).toHaveLength(0);
		expect(result.current.selectedDateInbound).toBe("");
	});

	it("processes inbound flightData and sets inbound date for roundtrip", () => {
		flightSelState.data = makeApiResponse(true);
		getFlightDetailsFromBoundMock
			.mockReturnValueOnce([mockRawFlight]) // outbound
			.mockReturnValueOnce([
				{
					isConnectingFlight: false,
					scheduledDepartureArrivalDateTime: { departureDateTime: "2026-08-10T09:00:00" },
				},
			]); // inbound
		airCalendarTabsMock.mockReturnValue([]);
		getFlightsByDateMock.mockReturnValue([]);

		const { result } = renderHook(() => flightSelectionData("en", roundtripRequest));

		expect(airCalendarTabsMock).toHaveBeenCalledTimes(2);
		expect(result.current.selectedDateInbound).not.toBe("");
	});

	it("restores cabin selections from confirmedFlight", () => {
		confirmedFlightRef.value = {
			tripType: "roundtrip",
			selectedCabinsOutbound: { "flight-1": "standard" },
			selectedCabinsInbound: { "flight-2": "zipfullflat" },
			flights: {
				outbound: {
					segments: [],
					selectedFareInfos: [],
					passengerFareBreakdown: [],
					totalFlightAmount: 0,
				},
			},
			grandTotalAmount: 0,
			currency: "JPY",
			language: "en",
		};

		const { result } = renderHook(() => flightSelectionData("en", baseRequest));

		expect(result.current.selectedCabinsOutbound).toEqual({ "flight-1": "standard" });
		expect(result.current.selectedCabinsInbound).toEqual({ "flight-2": "zipfullflat" });
	});

	it("filters outbound flights by date and clears cabins when no confirmedFlight", () => {
		flightSelState.data = makeApiResponse();
		getFlightDetailsFromBoundMock.mockReturnValueOnce([mockRawFlight]).mockReturnValueOnce([]);
		getFlightsByDateMock.mockReturnValue([mockRawFlight]);
		airCalendarTabsMock.mockReturnValue([]);

		const { result } = renderHook(() => flightSelectionData("en", baseRequest));

		expect(getFlightsByDateMock).toHaveBeenCalled();
		expect(result.current.filteredFlightsOutbound).toEqual([mockRawFlight]);
		expect(result.current.selectedCabinsOutbound).toEqual({});
	});

	it("preserves selectedCabinsOutbound when confirmedFlight is set on date change", () => {
		confirmedFlightRef.value = {
			tripType: "oneway",
			selectedCabinsOutbound: { "flight-1": "standard" },
			selectedCabinsInbound: {},
			flights: {
				outbound: {
					segments: [],
					selectedFareInfos: [],
					passengerFareBreakdown: [],
					totalFlightAmount: 0,
				},
			},
			grandTotalAmount: 0,
			currency: "JPY",
			language: "en",
		};
		flightSelState.data = makeApiResponse();
		getFlightDetailsFromBoundMock.mockReturnValueOnce([mockRawFlight]).mockReturnValueOnce([]);
		getFlightsByDateMock.mockReturnValue([mockRawFlight]);
		airCalendarTabsMock.mockReturnValue([]);

		const { result } = renderHook(() => flightSelectionData("en", baseRequest));

		expect(result.current.selectedCabinsOutbound).toEqual({ "flight-1": "standard" });
	});

	it("onSelectOutboundCabin updates cabin for a non-connecting flight", () => {
		const { result } = renderHook(() => flightSelectionData("en", baseRequest));

		act(() => {
			result.current.onSelectOutboundCabin("flight-1", "standard");
		});

		expect(outboundCabinSelectionMock).toHaveBeenCalledWith({}, "flight-1", "standard");
	});

	it("onSelectOutboundCabin clears other connecting segments (covers isSelectedConnectingSegment + clearOtherConnectingSelections)", () => {
		flightSelState.data = makeApiResponse();
		getFlightDetailsFromBoundMock.mockReturnValueOnce([mockRawFlight]).mockReturnValueOnce([]);
		getFlightsByDateMock.mockReturnValue([mockRawFlight]);
		airCalendarTabsMock.mockReturnValue([]);
		getFlightDisplayItemsMock.mockReturnValue([
			{
				id: "conn-1",
				isConnectingFlight: true,
				segments: [{ flightNumber: "NU101" }, { flightNumber: "NU102" }],
			},
			{
				id: "conn-2",
				isConnectingFlight: true,
				segments: [{ flightNumber: "NU201" }],
			},
		]);

		const { result } = renderHook(() => flightSelectionData("en", baseRequest));

		// First select conn-2 to populate its cabin
		act(() => {
			result.current.onSelectOutboundCabin("conn-2-segment-0", "standard");
		});

		// Then select conn-1 – clearOtherConnectingSelections must remove conn-2 entry
		act(() => {
			result.current.onSelectOutboundCabin("conn-1-segment-0", "zipfullflat");
		});

		expect(outboundCabinSelectionMock).toHaveBeenLastCalledWith(
			expect.not.objectContaining({ "conn-2-segment-0": expect.anything() }),
			"conn-1-segment-0",
			"zipfullflat"
		);
	});

	it("onSelectInboundCabin delegates to inboundCabinSelection", () => {
		const { result } = renderHook(() => flightSelectionData("en", baseRequest));

		act(() => {
			result.current.onSelectInboundCabin("inbound-1", "standard");
		});

		expect(inboundCabinSelectionMock).toHaveBeenCalledWith({}, "inbound-1", "standard");
	});

	it("reflects error from Redux state", () => {
		flightSelState.error = "Network error";

		const { result } = renderHook(() => flightSelectionData("en", baseRequest));

		expect(result.current.error).toBe("Network error");
	});

	it("hasConnectingOutbound is true when an outbound flight is connecting", () => {
		flightSelState.data = makeApiResponse();
		getFlightDetailsFromBoundMock
			.mockReturnValueOnce([
				{
					isConnectingFlight: true,
					scheduledDepartureArrivalDateTime: { departureDateTime: "2026-08-01T09:00:00" },
				},
			])
			.mockReturnValueOnce([]);
		getFlightsByDateMock.mockReturnValue([]);
		airCalendarTabsMock.mockReturnValue([]);

		const { result } = renderHook(() => flightSelectionData("en", baseRequest));

		expect(result.current.hasConnectingOutbound).toBe(true);
	});
});
