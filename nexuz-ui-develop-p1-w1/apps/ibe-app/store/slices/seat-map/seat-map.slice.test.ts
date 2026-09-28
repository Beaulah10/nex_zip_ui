import { configureStore } from "@reduxjs/toolkit";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { SerializableSeatMapRequest } from "@/modules/services/seat-map/seat-map.service";
import reducer, {
	buildRetrieveSeatMapRequest,
	clearSeatMap,
	fetchSeatMapOffers,
	selectBuiltSeatMap,
	selectSeatMapData,
	selectSeatMapError,
	selectSeatMapIsPending,
	selectSeatMapRequest,
	selectSeatMapState,
} from "./seat-map.slice";

const mocks = vi.hoisted(() => ({
	retrieveSeatMapBySdk: vi.fn(),
	buildSeatMapFromApiResponse: vi.fn(),
	getSeatMapApiError: vi.fn(),
}));

vi.mock("@/modules/services/seat-map/seat-map.service", () => ({
	retrieveSeatMapBySdk: mocks.retrieveSeatMapBySdk,
}));

vi.mock("@/modules/utils/helpers/seat-map/build-seat-map-utils/build-seat-map-utils", () => ({
	buildSeatMapFromApiResponse: mocks.buildSeatMapFromApiResponse,
}));

vi.mock("@/modules/utils/helpers/seat-map/seat-map-api-error/seat-map-api-error", () => ({
	getSeatMapApiError: mocks.getSeatMapApiError,
}));

const request: SerializableSeatMapRequest = {
	cabin: "STANDARD",
	currency: "JPY",
	departureDateTime: "2026-01-01T10:00:00",
	routes: "NRT,BKK",
	logicalFlightId: 1,
};
const apiResponse = {
	data: {
		seatInfo: [
			{
				cabinName: "Standard",
			},
		],
	},
};

const apiError = {
	title: "Seat map error",
	body: "Unable to retrieve seat map.",
};

const confirmedFlight = {
	currency: "JPY",
	flights: {
		outbound: {
			segments: [
				{
					selectedCabin: "Standard",
					origin: "NRT",
					destination: "BKK",
					lfid: "LF001",
					scheduledDepartureArrivalDateTime: {
						departureDateTime: "2026-01-01T10:00:00",
					},
				},
			],
		},
	},
};

describe("seat-map.slice", () => {
	beforeEach(() => {
		vi.clearAllMocks();

		mocks.getSeatMapApiError.mockReturnValue(apiError);

		mocks.buildSeatMapFromApiResponse.mockReturnValue([
			{
				name: "Standard cabin",
				class: "Standard",
				rows: [],
			},
		]);
	});

	it("returns the initial state", () => {
		const state = reducer(undefined, { type: "unknown" });

		expect(state).toEqual({
			isPending: false,
			outOfStockByScope: {},
		});
	});

	it("clears data and error but preserves request and out-of-stock flags", () => {
		const previousState = {
			request,
			data: apiResponse,
			isPending: false,
			error: apiError,
			outOfStockByScope: {
				outbound: true,
			},
		};

		const state = reducer(previousState as any, clearSeatMap());

		expect(state.isPending).toBe(false);
		expect(state.request).toEqual(request);
		expect(state.outOfStockByScope).toEqual({
			outbound: true,
		});

		expect(state.data).toBeUndefined();
		expect(state.error).toBeUndefined();
	});

	it("builds retrieve seat map request with default STANDARD cabin", () => {
		const result = buildRetrieveSeatMapRequest(confirmedFlight as any);

		expect(result).toEqual({
			cabin: "STANDARD",
			currency: "JPY",
			departureDateTime: "2026-01-01T10:00:00",
			routes: "NRT,BKK",
			logicalFlightId: "LF001",
		});
	});

	it("builds retrieve seat map request with ZIPFULLFLAT cabin", () => {
		const segment = {
			selectedCabin: "ZIPFULLFLAT",
			origin: "NRT",
			destination: "BKK",
			lfid: "LF002",
			scheduledDepartureArrivalDateTime: {
				departureDateTime: "2026-01-02T10:00:00",
			},
		};

		const result = buildRetrieveSeatMapRequest(confirmedFlight as any, segment as any);

		expect(result).toEqual({
			cabin: "ZIPFULLFLAT",
			currency: "JPY",
			departureDateTime: "2026-01-02T10:00:00",
			routes: "NRT,BKK",
			logicalFlightId: "LF002",
		});
	});

	it("throws error when currency is missing", () => {
		expect(() =>
			buildRetrieveSeatMapRequest({
				...confirmedFlight,
				currency: undefined,
			} as any)
		).toThrow("Unable to build seat map request: currency is missing");
	});

	it("throws error when segment is missing", () => {
		expect(() =>
			buildRetrieveSeatMapRequest({
				currency: "JPY",
				flights: {
					outbound: {
						segments: [],
					},
				},
			} as any)
		).toThrow("Unable to build seat map request: segment is missing");
	});

	it("throws error when departure date is missing", () => {
		expect(() =>
			buildRetrieveSeatMapRequest({
				currency: "JPY",
				flights: {
					outbound: {
						segments: [
							{
								selectedCabin: "Standard",
								origin: "NRT",
								destination: "BKK",
								lfid: "LF001",
								scheduledDepartureArrivalDateTime: {},
							},
						],
					},
				},
			} as any)
		).toThrow("Unable to build seat map request: departure date is missing");
	});

	it("sets pending state when fetchSeatMapOffers is pending", () => {
		const locale = "en";
		const request = {
			cabin: "STANDARD" as const,
			currency: "JPY",
			departureDateTime: "2026-01-01T10:00:00",
			routes: "NRT,HNL",
			logicalFlightId: 1,
		};

		const previousState = {
			isPending: false,
			outOfStockByScope: {},
		};

		const pendingAction = fetchSeatMapOffers.pending("requestId", { locale, request });
		const state = reducer(previousState, pendingAction);

		expect(state).toEqual({
			request,
			isPending: true,
			error: undefined,
			outOfStockByScope: {},
		});
	});

	it("sets data when fetchSeatMapOffers is fulfilled", () => {
		const pendingState = {
			request,
			isPending: true,
			error: undefined,
		};

		const state = reducer(
			pendingState as any,
			fetchSeatMapOffers.fulfilled(apiResponse as any, "request-id", {
				locale: "en",
				request,
			})
		);

		expect(state.data).toEqual(apiResponse);
		expect(state.isPending).toBe(false);
	});

	it("sets error when fetchSeatMapOffers is rejected with payload", () => {
		const pendingState = {
			request,
			data: apiResponse,
			isPending: true,
			error: undefined,
		};

		const state = reducer(
			pendingState as any,
			fetchSeatMapOffers.rejected(
				null,
				"request-id",
				{
					locale: "en",
					request,
				},
				apiError as any
			)
		);

		expect(state.data).toBeUndefined();
		expect(state.error).toEqual(apiError);
		expect(state.isPending).toBe(false);
	});

	it("sets fallback error when fetchSeatMapOffers is rejected without payload", () => {
		const pendingState = {
			request,
			data: apiResponse,
			isPending: true,
			error: undefined,
		};

		const state = reducer(
			pendingState as any,
			fetchSeatMapOffers.rejected(new Error("Network error"), "request-id", {
				locale: "en",
				request,
			})
		);

		expect(mocks.getSeatMapApiError).toHaveBeenCalledWith("Network error");
		expect(state.data).toBeUndefined();
		expect(state.error).toEqual(apiError);
		expect(state.isPending).toBe(false);
	});

	it("dispatches fetchSeatMapOffers successfully", async () => {
		mocks.retrieveSeatMapBySdk.mockResolvedValue(apiResponse);

		const store = configureStore({
			reducer: {
				seatMap: reducer,
			},
		});

		await store.dispatch(
			fetchSeatMapOffers({
				locale: "en",
				request,
			}) as any
		);

		expect(mocks.retrieveSeatMapBySdk).toHaveBeenCalledWith("en", request);

		const state = store.getState().seatMap;

		expect(state.request).toEqual(request);
		expect(state.data).toEqual(apiResponse);
		expect(state.isPending).toBe(false);
		expect(state.error).toBeUndefined();
	});

	it("dispatches fetchSeatMapOffers failure", async () => {
		const error = new Error("API failed");

		mocks.retrieveSeatMapBySdk.mockRejectedValue(error);

		const store = configureStore({
			reducer: {
				seatMap: reducer,
			},
		});

		await store.dispatch(
			fetchSeatMapOffers({
				locale: "en",
				request,
			}) as any
		);

		expect(mocks.getSeatMapApiError).toHaveBeenCalledWith(error);

		const state = store.getState().seatMap;

		expect(state.request).toEqual(request);
		expect(state.data).toBeUndefined();
		expect(state.error).toEqual(apiError);
		expect(state.isPending).toBe(false);
	});

	it("selects seat map state values", () => {
		const rootState = {
			seatMap: {
				request,
				data: apiResponse,
				isPending: true,
				error: apiError,
			},
		};

		expect(selectSeatMapState(rootState as any)).toEqual(rootState.seatMap);
		expect(selectSeatMapIsPending(rootState as any)).toBe(true);
		expect(selectSeatMapData(rootState as any)).toEqual(apiResponse);
		expect(selectSeatMapRequest(rootState as any)).toEqual(request);
		expect(selectSeatMapError(rootState as any)).toEqual(apiError);
	});

	it("returns undefined when built seat map has no data", () => {
		const rootState = {
			seatMap: {
				isPending: false,
				data: undefined,
			},
		};

		const result = selectBuiltSeatMap(rootState as any, "Standard");

		expect(result).toBeUndefined();
		expect(mocks.buildSeatMapFromApiResponse).not.toHaveBeenCalled();
	});

	it("returns undefined when built seat map has empty seat info", () => {
		const rootState = {
			seatMap: {
				isPending: false,
				data: {
					data: {
						seatInfo: [],
					},
				},
			},
		};

		const result = selectBuiltSeatMap(rootState as any, "Standard");

		expect(result).toBeUndefined();
		expect(mocks.buildSeatMapFromApiResponse).not.toHaveBeenCalled();
	});

	it("builds seat map from API response seat info", () => {
		const rootState = {
			seatMap: {
				isPending: false,
				data: apiResponse,
			},
		};

		const result = selectBuiltSeatMap(rootState as any, "Standard");

		expect(mocks.buildSeatMapFromApiResponse).toHaveBeenCalledWith(
			apiResponse.data.seatInfo,
			"Standard"
		);

		expect(result).toEqual([
			{
				name: "Standard cabin",
				class: "Standard",
				rows: [],
			},
		]);
	});
});
