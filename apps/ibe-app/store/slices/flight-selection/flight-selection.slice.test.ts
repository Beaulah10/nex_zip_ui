import { describe, expect, it, vi } from "vitest";
import type { RootState } from "@/store";
import reducer, {
	type ConfirmedFlightPayload,
	clearConfirmedFlight,
	clearFlightSelection,
	confirmFlightSelection,
	fetchFlightSelection,
	type SelectedFlightBound,
	selectBookingPayload,
	selectConfirmedFlight,
	selectConfirmedInboundFlight,
	selectConfirmedOutboundFlight,
	selectConfirmedTotalAmount,
	selectFlightSearchRequest,
	selectHasConnectingOutbound,
	setFlightSelectionRequest,
} from "@/store/slices/flight-selection/flight-selection.slice";
import type {
	FlightSelectionApiResponse,
	FlightSelectionRequest,
} from "@/types/flight-selection/flight-selection.types";

const { flightSelectionMock } = vi.hoisted(() => ({
	flightSelectionMock: vi.fn(),
}));

vi.mock("@/modules/services/flight-selection/flight-selection.service", () => ({
	flightSelection: flightSelectionMock,
}));

// ─────────────────────────────────────────────────────────────────────────────
// Factories
// ─────────────────────────────────────────────────────────────────────────────

function makeRequest(overrides?: Partial<FlightSelectionRequest>): FlightSelectionRequest {
	return {
		routes: "NRT,BKK",
		departureDateFrom: "2026-08-01",
		adult: 2,
		...overrides,
	};
}

function makeApiResponse(
	overrides?: Partial<FlightSelectionApiResponse>
): FlightSelectionApiResponse {
	return {
		data: {
			outbound: {
				airCalendarFare: [],
				flightsByDate: [],
			},
		},
		...overrides,
	};
}

function makeBound(overrides?: Partial<SelectedFlightBound>): SelectedFlightBound {
	return {
		segments: [],
		selectedFareInfos: [],
		passengerFareBreakdown: [],
		totalFlightAmount: 15000,
		...overrides,
	};
}

function makeConfirmedFlight(overrides?: Partial<ConfirmedFlightPayload>): ConfirmedFlightPayload {
	return {
		tripType: "roundtrip",
		selectedCabinsOutbound: { "NRT-BKK": "STANDARD" },
		selectedCabinsInbound: { "BKK-NRT": "STANDARD" },
		flights: {
			outbound: makeBound(),
			inbound: makeBound(),
		},
		grandTotalAmount: 30000,
		currency: "JPY",
		language: "en",
		...overrides,
	};
}

function makeRootState(sliceState: ReturnType<typeof reducer>): RootState {
	return { flightSelection: sliceState } as unknown as RootState;
}

const thunkArgs = { locale: "en", request: makeRequest() };

// ─────────────────────────────────────────────────────────────────────────────
// Initial state
// ─────────────────────────────────────────────────────────────────────────────

describe("initial state", () => {
	it("has correct defaults", () => {
		const state = reducer(undefined, { type: "@@INIT" });
		expect(state.isPending).toBe(false);
		expect(state.request).toBeUndefined();
		expect(state.data).toBeUndefined();
		expect(state.error).toBeUndefined();
		expect(state.confirmedFlight).toBeUndefined();
	});
});

// ─────────────────────────────────────────────────────────────────────────────
// setFlightSelectionRequest
// ─────────────────────────────────────────────────────────────────────────────

describe("setFlightSelectionRequest", () => {
	it("stores the request in state", () => {
		const req = makeRequest();
		const state = reducer(undefined, setFlightSelectionRequest(req));
		expect(state.request).toEqual(req);
	});

	it("overwrites a previous request", () => {
		const first = makeRequest({ routes: "NRT,BKK" });
		const second = makeRequest({ routes: "BKK,NRT" });
		let state = reducer(undefined, setFlightSelectionRequest(first));
		state = reducer(state, setFlightSelectionRequest(second));
		expect(state.request?.routes).toBe("BKK,NRT");
	});
});

// ─────────────────────────────────────────────────────────────────────────────
// confirmFlightSelection
// ─────────────────────────────────────────────────────────────────────────────

describe("confirmFlightSelection", () => {
	it("stores the confirmed flight payload", () => {
		const confirmed = makeConfirmedFlight();
		const state = reducer(undefined, confirmFlightSelection(confirmed));
		expect(state.confirmedFlight).toEqual(confirmed);
	});

	it("overwrites a previous confirmed flight", () => {
		const first = makeConfirmedFlight({ grandTotalAmount: 10000 });
		const second = makeConfirmedFlight({ grandTotalAmount: 20000 });
		let state = reducer(undefined, confirmFlightSelection(first));
		state = reducer(state, confirmFlightSelection(second));
		expect(state.confirmedFlight?.grandTotalAmount).toBe(20000);
	});
});

// ─────────────────────────────────────────────────────────────────────────────
// clearConfirmedFlight
// ─────────────────────────────────────────────────────────────────────────────

describe("clearConfirmedFlight", () => {
	it("removes the confirmed flight", () => {
		let state = reducer(undefined, confirmFlightSelection(makeConfirmedFlight()));
		state = reducer(state, clearConfirmedFlight());
		expect(state.confirmedFlight).toBeUndefined();
	});

	it("does not affect request or data", () => {
		let state = reducer(undefined, setFlightSelectionRequest(makeRequest()));
		state = reducer(state, fetchFlightSelection.fulfilled(makeApiResponse(), "id", thunkArgs));
		state = reducer(state, confirmFlightSelection(makeConfirmedFlight()));
		state = reducer(state, clearConfirmedFlight());
		expect(state.request).toEqual(makeRequest());
		expect(state.data).toEqual(makeApiResponse());
	});
});

// ─────────────────────────────────────────────────────────────────────────────
// clearFlightSelection
// ─────────────────────────────────────────────────────────────────────────────

describe("clearFlightSelection", () => {
	it("resets request, data, error and isPending", () => {
		let state = reducer(undefined, setFlightSelectionRequest(makeRequest()));
		state = reducer(state, fetchFlightSelection.fulfilled(makeApiResponse(), "id", thunkArgs));
		state = reducer(state, clearFlightSelection());

		expect(state.request).toBeUndefined();
		expect(state.data).toBeUndefined();
		expect(state.error).toBeUndefined();
		expect(state.isPending).toBe(false);
	});

	it("clears error set by a previous rejected fetch", () => {
		let state = reducer(
			undefined,
			fetchFlightSelection.rejected(null, "id", thunkArgs, "some error")
		);
		state = reducer(state, clearFlightSelection());
		expect(state.error).toBeUndefined();
	});

	it("does not clear confirmedFlight", () => {
		let state = reducer(undefined, confirmFlightSelection(makeConfirmedFlight()));
		state = reducer(state, clearFlightSelection());
		expect(state.confirmedFlight).toBeDefined();
	});
});

// ─────────────────────────────────────────────────────────────────────────────
// fetchFlightSelection thunk – reducer behaviour
// ─────────────────────────────────────────────────────────────────────────────

describe("fetchFlightSelection", () => {
	describe("pending", () => {
		it("sets isPending to true", () => {
			const action = fetchFlightSelection.pending("id", thunkArgs);
			const state = reducer(undefined, action);
			expect(state.isPending).toBe(true);
		});

		it("stores the request from meta.arg", () => {
			const req = makeRequest({ routes: "BKK,NRT" });
			const action = fetchFlightSelection.pending("id", { locale: "en", request: req });
			const state = reducer(undefined, action);
			expect(state.request).toEqual(req);
		});

		it("clears data and error", () => {
			let state = reducer(
				undefined,
				fetchFlightSelection.fulfilled(makeApiResponse(), "id1", thunkArgs)
			);
			state = reducer(state, fetchFlightSelection.pending("id2", thunkArgs));
			expect(state.data).toBeUndefined();
			expect(state.error).toBeUndefined();
		});
	});

	describe("fulfilled", () => {
		it("stores the API response in data", () => {
			const apiResponse = makeApiResponse();
			const state = reducer(
				undefined,
				fetchFlightSelection.fulfilled(apiResponse, "id", thunkArgs)
			);
			expect(state.data).toEqual(apiResponse);
		});

		it("sets isPending to false", () => {
			let state = reducer(undefined, fetchFlightSelection.pending("id", thunkArgs));
			state = reducer(state, fetchFlightSelection.fulfilled(makeApiResponse(), "id", thunkArgs));
			expect(state.isPending).toBe(false);
		});
	});

	describe("rejected", () => {
		it("stores the string rejectValue as error", () => {
			const action = fetchFlightSelection.rejected(null, "id", thunkArgs, "API failed");
			const state = reducer(undefined, action);
			expect(state.error).toBe("API failed");
		});

		it("falls back to error.message when no rejectValue payload", () => {
			const action = fetchFlightSelection.rejected(new Error("network error"), "id", thunkArgs);
			const state = reducer(undefined, action);
			expect(state.error).toBe("network error");
		});

		it("uses RTK default error message when no payload and null error supplied", () => {
			// RTK miniSerializeError produces { message: "Rejected" } when error is null
			const action = fetchFlightSelection.rejected(null, "id", thunkArgs);
			const state = reducer(undefined, action);
			expect(state.error).toBe("Rejected");
		});

		it("sets isPending to false", () => {
			let state = reducer(undefined, fetchFlightSelection.pending("id", thunkArgs));
			state = reducer(state, fetchFlightSelection.rejected(null, "id", thunkArgs, "error"));
			expect(state.isPending).toBe(false);
		});

		it("clears data", () => {
			let state = reducer(
				undefined,
				fetchFlightSelection.fulfilled(makeApiResponse(), "id1", thunkArgs)
			);
			state = reducer(state, fetchFlightSelection.rejected(null, "id2", thunkArgs, "error"));
			expect(state.data).toBeUndefined();
		});
	});

	describe("async dispatch", () => {
		it("dispatches fulfilled on successful service call", async () => {
			flightSelectionMock.mockResolvedValueOnce(makeApiResponse());
			const dispatch = vi.fn().mockImplementation((action: unknown) => Promise.resolve(action));

			await fetchFlightSelection(thunkArgs)(dispatch, vi.fn(), undefined);

			const types = dispatch.mock.calls.map(
				(call) => (call[0] as { type: string } | undefined)?.type ?? ""
			);
			expect(types).toContain("flightSelection/fetch/fulfilled");
		});

		it("dispatches rejected on failed service call", async () => {
			flightSelectionMock.mockRejectedValueOnce(new Error("fetch failed"));
			const dispatch = vi.fn().mockImplementation((action: unknown) => Promise.resolve(action));

			await fetchFlightSelection(thunkArgs)(dispatch, vi.fn(), undefined);

			const types = dispatch.mock.calls.map(
				(call) => (call[0] as { type: string } | undefined)?.type ?? ""
			);
			expect(types).toContain("flightSelection/fetch/rejected");
		});
	});
});

// ─────────────────────────────────────────────────────────────────────────────
// Selectors
// ─────────────────────────────────────────────────────────────────────────────

describe("selectors", () => {
	describe("selectConfirmedFlight", () => {
		it("returns undefined when no confirmed flight", () => {
			const state = makeRootState(reducer(undefined, { type: "@@INIT" }));
			expect(selectConfirmedFlight(state)).toBeUndefined();
		});

		it("returns the confirmed flight payload", () => {
			const confirmed = makeConfirmedFlight();
			const state = makeRootState(reducer(undefined, confirmFlightSelection(confirmed)));
			expect(selectConfirmedFlight(state)).toEqual(confirmed);
		});
	});

	describe("selectConfirmedOutboundFlight", () => {
		it("returns undefined when no confirmed flight", () => {
			const state = makeRootState(reducer(undefined, { type: "@@INIT" }));
			expect(selectConfirmedOutboundFlight(state)).toBeUndefined();
		});

		it("returns the outbound bound", () => {
			const outbound = makeBound({ totalFlightAmount: 12000 });
			const confirmed = makeConfirmedFlight({ flights: { outbound } });
			const state = makeRootState(reducer(undefined, confirmFlightSelection(confirmed)));
			expect(selectConfirmedOutboundFlight(state)).toEqual(outbound);
		});
	});

	describe("selectFlightSearchRequest", () => {
		it("returns undefined when no request set", () => {
			const state = makeRootState(reducer(undefined, { type: "@@INIT" }));
			expect(selectFlightSearchRequest(state)).toBeUndefined();
		});

		it("returns the stored request", () => {
			const req = makeRequest();
			const state = makeRootState(reducer(undefined, setFlightSelectionRequest(req)));
			expect(selectFlightSearchRequest(state)).toEqual(req);
		});
	});

	describe("selectHasConnectingOutbound", () => {
		it("returns false when data is not loaded", () => {
			const state = makeRootState(reducer(undefined, { type: "@@INIT" }));
			expect(selectHasConnectingOutbound(state)).toBe(false);
		});

		it("returns false when all flights are direct (one segment each)", () => {
			const apiResponse = makeApiResponse({
				data: {
					outbound: {
						airCalendarFare: [],
						flightsByDate: [
							{
								date: "2026-08-01",
								flights: [
									{
										transitTime: "",
										overallFlightTime: "6:00",
										segments: [{ carrierCode: "ZG" } as never],
									},
								],
							},
						],
					},
				},
			});
			const state = makeRootState(
				reducer(undefined, fetchFlightSelection.fulfilled(apiResponse, "id", thunkArgs))
			);
			expect(selectHasConnectingOutbound(state)).toBe(false);
		});

		it("returns true when at least one outbound flight has multiple segments", () => {
			const apiResponse = makeApiResponse({
				data: {
					outbound: {
						airCalendarFare: [],
						flightsByDate: [
							{
								date: "2026-08-01",
								flights: [
									{
										transitTime: "1:00",
										overallFlightTime: "8:00",
										segments: [{ carrierCode: "ZG" } as never, { carrierCode: "ZG" } as never],
									},
								],
							},
						],
					},
				},
			});
			const state = makeRootState(
				reducer(undefined, fetchFlightSelection.fulfilled(apiResponse, "id", thunkArgs))
			);
			expect(selectHasConnectingOutbound(state)).toBe(true);
		});
	});

	describe("selectConfirmedInboundFlight", () => {
		it("returns undefined when no confirmed flight", () => {
			const state = makeRootState(reducer(undefined, { type: "@@INIT" }));
			expect(selectConfirmedInboundFlight(state)).toBeUndefined();
		});

		it("returns the inbound bound", () => {
			const inbound = makeBound({ totalFlightAmount: 8000 });
			const confirmed = makeConfirmedFlight({
				flights: { outbound: makeBound(), inbound },
			});
			const state = makeRootState(reducer(undefined, confirmFlightSelection(confirmed)));
			expect(selectConfirmedInboundFlight(state)).toEqual(inbound);
		});

		it("returns undefined for a oneway trip", () => {
			const confirmed = makeConfirmedFlight({
				tripType: "oneway",
				flights: { outbound: makeBound() },
			});
			const state = makeRootState(reducer(undefined, confirmFlightSelection(confirmed)));
			expect(selectConfirmedInboundFlight(state)).toBeUndefined();
		});
	});

	describe("selectConfirmedTotalAmount", () => {
		it("returns 0 when no confirmed flight", () => {
			const state = makeRootState(reducer(undefined, { type: "@@INIT" }));
			expect(selectConfirmedTotalAmount(state)).toBe(0);
		});

		it("returns the grand total amount", () => {
			const confirmed = makeConfirmedFlight({ grandTotalAmount: 45000 });
			const state = makeRootState(reducer(undefined, confirmFlightSelection(confirmed)));
			expect(selectConfirmedTotalAmount(state)).toBe(45000);
		});
	});

	describe("selectBookingPayload", () => {
		it("returns undefined when no confirmed flight", () => {
			const state = makeRootState(reducer(undefined, { type: "@@INIT" }));
			expect(selectBookingPayload(state)).toBeUndefined();
		});

		it("returns only tripType, flights, currency and language", () => {
			const confirmed = makeConfirmedFlight();
			const state = makeRootState(reducer(undefined, confirmFlightSelection(confirmed)));
			expect(selectBookingPayload(state)).toEqual({
				tripType: confirmed.tripType,
				flights: confirmed.flights,
				currency: confirmed.currency,
				language: confirmed.language,
			});
		});

		it("does not include grandTotalAmount or selectedCabins fields", () => {
			const confirmed = makeConfirmedFlight();
			const state = makeRootState(reducer(undefined, confirmFlightSelection(confirmed)));
			const payload = selectBookingPayload(state);
			expect(payload).not.toHaveProperty("grandTotalAmount");
			expect(payload).not.toHaveProperty("selectedCabinsOutbound");
			expect(payload).not.toHaveProperty("selectedCabinsInbound");
		});
	});
});
