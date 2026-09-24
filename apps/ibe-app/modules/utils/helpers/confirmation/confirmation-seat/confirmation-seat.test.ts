import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/modules/utils/helpers/airport", () => ({
	getAirportRouteLabel: vi.fn(() => "NRT - SIN"),
}));

vi.mock("@/modules/utils/helpers/common/flow-router/flow-router", () => ({
	getBookingStageSegment: vi.fn(),
}));

vi.mock("@/modules/utils/helpers/seat-map/build-seat-map-utils/build-seat-map-utils", () => ({
	buildSeatMapFromApiResponse: vi.fn(),
}));

vi.mock("@/modules/utils/helpers/seat-map/seat-map-api-error/seat-map-api-error", () => ({
	isNoAvailableSeatsSeatMapError: vi.fn(),
}));

vi.mock(
	"@/modules/utils/helpers/seat-map/seat-selection-availability/seat-selection-availability",
	() => ({
		getSeatSelectionAvailabilityDialog: vi.fn(),
		toSeatValidationPassengers: vi.fn((passengers) => passengers),
	})
);

vi.mock(
	"@/modules/utils/helpers/seat-map/seat-selection-cancellation/seat-selection-cancellation",
	() => ({
		buildAvailableSeatCodeSet: vi.fn(),
		getCancelledSeatSelections: vi.fn(),
	})
);

vi.mock("@/store/slices/seat-map/seat-map.slice", () => {
	const fetchSeatMapOffers = Object.assign(
		vi.fn((payload) => ({ type: "seatMap/fetch", payload })),
		{
			fulfilled: { match: vi.fn() },
			rejected: { match: vi.fn() },
		}
	);

	return {
		buildRetrieveSeatMapRequest: vi.fn(),
		clearSeatMap: vi.fn(() => ({ type: "seatMap/clear" })),
		fetchSeatMapOffers,
	};
});

import { getBookingStageSegment } from "@/modules/utils/helpers/common/flow-router/flow-router";
import { buildSeatMapFromApiResponse } from "@/modules/utils/helpers/seat-map/build-seat-map-utils/build-seat-map-utils";
import { isNoAvailableSeatsSeatMapError } from "@/modules/utils/helpers/seat-map/seat-map-api-error/seat-map-api-error";
import {
	getSeatSelectionAvailabilityDialog,
	toSeatValidationPassengers,
} from "@/modules/utils/helpers/seat-map/seat-selection-availability/seat-selection-availability";
import {
	buildAvailableSeatCodeSet,
	getCancelledSeatSelections,
} from "@/modules/utils/helpers/seat-map/seat-selection-cancellation/seat-selection-cancellation";
import {
	buildRetrieveSeatMapRequest,
	clearSeatMap,
	fetchSeatMapOffers,
} from "@/store/slices/seat-map/seat-map.slice";
import {
	buildConfirmationSeatErrorState,
	buildConfirmationSeatRouteLabel,
	buildConfirmationSeatUnavailableErrorState,
	getConfirmationEmergencyExitRestrictedPassengerIds,
	getConfirmationSeatSegment,
	getSeatMapDialogAction,
	prepareConfirmationSeatDialog,
} from "./confirmation-seat";

function makeSegment(overrides: Record<string, unknown> = {}) {
	return {
		lfid: 1,
		pfid: 2,
		origin: "NRT",
		destination: "SIN",
		selectedCabin: "STANDARD",
		scheduledDepartureArrivalDateTime: { departureDateTime: "2026-07-23T01:30:00Z" },
		...overrides,
	} as any;
}

function makeConfirmedFlight(overrides: Record<string, unknown> = {}) {
	return {
		tripType: "roundtrip",
		currency: "JPY",
		flights: {
			outbound: { segments: [makeSegment()] },
			inbound: { segments: [makeSegment({ lfid: 3, pfid: 4, origin: "SIN", destination: "NRT" })] },
		},
		...overrides,
	} as any;
}

describe("confirmation-seat", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.mocked(getBookingStageSegment).mockImplementation(({ direction }: any) => direction);
		vi.mocked(buildRetrieveSeatMapRequest).mockReturnValue({ cabin: "STANDARD" } as any);
		vi.mocked(buildSeatMapFromApiResponse).mockReturnValue([{ class: "Standard" }] as any);
		vi.mocked(buildAvailableSeatCodeSet).mockReturnValue(new Set(["12A"]));
		vi.mocked(getCancelledSeatSelections).mockReturnValue([]);
		vi.mocked(getSeatSelectionAvailabilityDialog).mockReturnValue(undefined);
		vi.mocked(isNoAvailableSeatsSeatMapError).mockReturnValue(false);
		vi.mocked(fetchSeatMapOffers.fulfilled.match).mockReturnValue(false);
		vi.mocked(fetchSeatMapOffers.rejected.match).mockReturnValue(false);
	});

	it("maps seat dialog actions by dialog type", () => {
		expect(getSeatMapDialogAction("NO_AVAILABLE_SEATS")).toBe("close");
		expect(getSeatMapDialogAction("NO_ADJACENT_SEATS")).toBe("returnToTop");
		expect(getSeatMapDialogAction("UNAVAILABLE_SELECTED_SEAT")).toBe("returnToTop");
	});

	it("builds unavailable error state with translated service message", () => {
		expect(buildConfirmationSeatUnavailableErrorState((key) => key)).toEqual({
			open: true,
			title: "service_unavailable_session_title",
			content: "service_unavailable_session_message",
			action: "close",
			unavailableSeatSelections: [],
		});
	});

	it("builds a seat error state with optional content suffix and adjacent message", () => {
		expect(
			buildConfirmationSeatErrorState({
				dialogType: "UNAVAILABLE_SELECTED_SEAT",
				seatLabels: (key) => key,
				seatSelectionsToRemove: [{ passengerId: "P1", seatCode: "12A" } as any],
				contentSuffix: "12A : JOHN DOE",
			})
		).toEqual({
			open: true,
			title: "error_labels.cancelled_selection_title",
			content:
				"error_labels.cancelled_selection_content_line_1 error_labels.cancelled_selection_content_line_2\n\n12A : JOHN DOE",
			buttonLabel: "error_labels.cancelled_selection_ok_button",
			action: "returnToTop",
			unavailableSeatSelections: [{ passengerId: "P1", seatCode: "12A" }],
		});

		expect(
			buildConfirmationSeatErrorState({
				dialogType: "UNAVAILABLE_SELECTED_SEAT",
				seatLabels: (key) => key,
				useAdjacentSeatCancellationMessage: true,
			}).content
		).toBe("error_labels.cancelled_adjacent_selection_content");
	});

	it("builds the confirmation route label from leg itinerary codes", () => {
		expect(
			buildConfirmationSeatRouteLabel({
				itinerary: { departureAirportCode: "NRT", arrivalAirportCode: "SIN" },
			} as any)
		).toBe("NRT - SIN");
	});

	it("returns restricted passenger ids for special assistance passengers in emergency exit seats", () => {
		const confirmedFlight = makeConfirmedFlight();
		const storedPassengers = [
			{
				id: "P1",
				services: { "non-chargeable": [{ ssrCode: "WCHR" }] },
				seats: [{ lfid: 1, pfid: 2, serviceCode: "STEX", row: "46", column: "A" }],
			},
			{
				id: "P2",
				services: { "non-chargeable": [{ ssrCode: "OTHR" }] },
				seats: [{ lfid: 1, pfid: 2, serviceCode: "STEX", row: "46", column: "A" }],
			},
		] as any;

		expect(
			getConfirmationEmergencyExitRestrictedPassengerIds({
				confirmedFlight,
				direction: "outbound",
				storedPassengers,
			})
		).toEqual(["P1"]);
	});

	it("returns an empty list when no seat segment exists", () => {
		expect(
			getConfirmationEmergencyExitRestrictedPassengerIds({
				confirmedFlight: makeConfirmedFlight({ flights: { outbound: { segments: [] } } }),
				direction: "outbound",
				storedPassengers: [],
			})
		).toEqual([]);
	});

	it("resolves the confirmation seat segment for connecting and roundtrip cases", () => {
		const confirmedFlight = makeConfirmedFlight({
			flights: {
				outbound: { segments: [makeSegment({ lfid: 11 }), makeSegment({ lfid: 22 })] },
				inbound: { segments: [makeSegment({ lfid: 33 })] },
			},
		});

		vi.mocked(getBookingStageSegment).mockReturnValueOnce("segment1" as any);
		expect(getConfirmationSeatSegment({ confirmedFlight, direction: "outbound" })?.lfid).toBe(11);

		vi.mocked(getBookingStageSegment).mockReturnValueOnce("segment2" as any);
		expect(getConfirmationSeatSegment({ confirmedFlight, direction: "inbound" })?.lfid).toBe(33);

		vi.mocked(getBookingStageSegment).mockReturnValueOnce("inbound" as any);
		expect(getConfirmationSeatSegment({ confirmedFlight, direction: "inbound" })?.lfid).toBe(33);
	});

	it("falls back to outbound segment 1 when segment2 has no inbound data", () => {
		const confirmedFlight = makeConfirmedFlight({
			flights: { outbound: { segments: [makeSegment({ lfid: 11 }), makeSegment({ lfid: 22 })] } },
		});
		vi.mocked(getBookingStageSegment).mockReturnValue("segment2" as any);

		expect(getConfirmationSeatSegment({ confirmedFlight, direction: "inbound" })?.lfid).toBe(22);
	});

	it("returns noop when prepareConfirmationSeatDialog cannot resolve a segment", async () => {
		const result = await prepareConfirmationSeatDialog({
			dispatch: vi.fn() as any,
			locale: "en",
			confirmedFlight: makeConfirmedFlight({ flights: { outbound: { segments: [] } } }),
			direction: "outbound",
			passengerId: "P1",
			stageLabel: "Outbound",
			routeLabel: "NRT - SIN",
			orderedPassengersWithNames: [],
			storedPassengers: [],
		});

		expect(result).toEqual({ type: "noop" });
	});

	it("returns service-unavailable when the request cannot be built", async () => {
		vi.mocked(buildRetrieveSeatMapRequest).mockImplementation(() => {
			throw new Error("bad request");
		});

		const result = await prepareConfirmationSeatDialog({
			dispatch: vi.fn() as any,
			locale: "en",
			confirmedFlight: makeConfirmedFlight(),
			direction: "outbound",
			passengerId: "P1",
			stageLabel: "Outbound",
			routeLabel: "NRT - SIN",
			orderedPassengersWithNames: [],
			storedPassengers: [],
		});

		expect(result).toEqual({ type: "service-unavailable" });
	});

	it("returns selected seat cancellation dialog when unavailable selections are found", async () => {
		vi.mocked(fetchSeatMapOffers.fulfilled.match).mockReturnValue(true);
		vi.mocked(getCancelledSeatSelections).mockReturnValue([
			{ seatCode: "12A", passengerName: "JOHN DOE", passengerId: "P1" } as any,
		]);

		const dispatch = vi.fn().mockResolvedValue({ payload: { data: { seatInfo: [] } } });
		const result = await prepareConfirmationSeatDialog({
			dispatch: dispatch as any,
			locale: "en",
			confirmedFlight: makeConfirmedFlight(),
			direction: "outbound",
			passengerId: "P1",
			stageLabel: "Outbound",
			routeLabel: "NRT - SIN",
			orderedPassengersWithNames: [
				{ id: "P1", firstName: "John", lastName: "Doe", passengerTypeCode: "adult" } as any,
			],
			storedPassengers: [],
		});

		expect(result).toEqual({
			type: "open-seat-error-dialog",
			dialogType: "UNAVAILABLE_SELECTED_SEAT",
			seatDialogState: {
				open: false,
				direction: "outbound",
				passengerId: "P1",
				stageLabel: "Outbound",
				routeLabel: "NRT - SIN",
			},
			seatSelectionsToRemove: [{ seatCode: "12A", passengerName: "JOHN DOE", passengerId: "P1" }],
			contentSuffix: "12A : JOHN DOE",
		});
		expect(toSeatValidationPassengers).toHaveBeenCalled();
	});

	it("clears seat map and returns availability dialog when seat validation fails", async () => {
		vi.mocked(fetchSeatMapOffers.fulfilled.match).mockReturnValue(true);
		vi.mocked(getSeatSelectionAvailabilityDialog).mockReturnValue("NO_ADJACENT_SEATS");

		const dispatch = vi.fn().mockResolvedValue({ payload: { data: { seatInfo: [] } } });
		const result = await prepareConfirmationSeatDialog({
			dispatch: dispatch as any,
			locale: "en",
			confirmedFlight: makeConfirmedFlight(),
			direction: "outbound",
			passengerId: "P1",
			stageLabel: "Outbound",
			routeLabel: "NRT - SIN",
			orderedPassengersWithNames: [],
			storedPassengers: [],
		});

		expect(dispatch).toHaveBeenCalledWith(vi.mocked(clearSeatMap)());
		expect(result).toEqual({
			type: "open-seat-error-dialog",
			dialogType: "NO_ADJACENT_SEATS",
			seatDialogState: {
				open: false,
				direction: "outbound",
				passengerId: "P1",
				stageLabel: "Outbound",
				routeLabel: "NRT - SIN",
			},
		});
	});

	it("returns an open seat dialog when the seat map is valid", async () => {
		vi.mocked(fetchSeatMapOffers.fulfilled.match).mockReturnValue(true);
		vi.mocked(buildRetrieveSeatMapRequest).mockReturnValue({ cabin: "ZIPFULLFLAT" } as any);

		const result = await prepareConfirmationSeatDialog({
			dispatch: vi.fn().mockResolvedValue({ payload: { data: { seatInfo: [] } } }) as any,
			locale: "en",
			confirmedFlight: makeConfirmedFlight(),
			direction: "outbound",
			passengerId: "P1",
			stageLabel: "Outbound",
			routeLabel: "NRT - SIN",
			orderedPassengersWithNames: [],
			storedPassengers: [],
		});

		expect(buildSeatMapFromApiResponse).toHaveBeenCalledWith([], "ZipFullFlat");
		expect(result).toEqual({
			type: "open-seat-dialog",
			seatDialogState: {
				open: true,
				direction: "outbound",
				passengerId: "P1",
				stageLabel: "Outbound",
				routeLabel: "NRT - SIN",
			},
		});
	});

	it("returns noop when the thunk was skipped by condition", async () => {
		const result = await prepareConfirmationSeatDialog({
			dispatch: vi.fn().mockResolvedValue({ meta: { condition: true } }) as any,
			locale: "en",
			confirmedFlight: makeConfirmedFlight(),
			direction: "outbound",
			passengerId: "P1",
			stageLabel: "Outbound",
			routeLabel: "NRT - SIN",
			orderedPassengersWithNames: [],
			storedPassengers: [],
		});

		expect(result).toEqual({ type: "noop" });
	});

	it("returns no available seats error when the rejected payload matches that API error", async () => {
		vi.mocked(fetchSeatMapOffers.rejected.match).mockReturnValue(true);
		vi.mocked(isNoAvailableSeatsSeatMapError).mockReturnValue(true);

		const result = await prepareConfirmationSeatDialog({
			dispatch: vi.fn().mockResolvedValue({ payload: { code: "NA" }, meta: {} }) as any,
			locale: "en",
			confirmedFlight: makeConfirmedFlight(),
			direction: "outbound",
			passengerId: "P1",
			stageLabel: "Outbound",
			routeLabel: "NRT - SIN",
			orderedPassengersWithNames: [],
			storedPassengers: [],
		});

		expect(result).toEqual({ type: "open-seat-error-dialog", dialogType: "NO_AVAILABLE_SEATS" });
	});

	it("returns service-unavailable for other rejected responses", async () => {
		const result = await prepareConfirmationSeatDialog({
			dispatch: vi.fn().mockResolvedValue({ payload: { code: "OTHER" }, meta: {} }) as any,
			locale: "en",
			confirmedFlight: makeConfirmedFlight(),
			direction: "outbound",
			passengerId: "P1",
			stageLabel: "Outbound",
			routeLabel: "NRT - SIN",
			orderedPassengersWithNames: [],
			storedPassengers: [],
		});

		expect(result).toEqual({ type: "service-unavailable" });
	});
});
