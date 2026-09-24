import { SdkRequestError } from "@repo/sdk";
import { describe, expect, it, vi } from "vitest";
import type { CalendarFaresApiError } from "@/modules/utils/helpers/calendar-fare/calendar-fare-utils";
import reducer, {
	addLoadedRange,
	type CalendarFaresRequest,
	fetchCalendarFares,
	isSameCalendarRequest,
	resetCalendarFares,
} from "./calendar-fares.slice";

const { mockSearchCalendarFaresGetBySdk } = vi.hoisted(() => ({
	mockSearchCalendarFaresGetBySdk: vi.fn(async () => ({
		data: {
			outbound: [
				{
					cabin: "STANDARD",
					dates: [
						{ date: "2026-07-10T00:00:00Z", lowestPrice: 12000, baseFareForPromotion: 13000 },
					],
				},
			],
			inbound: [
				{
					cabin: "ZIPFULLFLAT",
					dates: [{ date: "2026-07-14", lowestPrice: 23000 }],
				},
			],
		},
	})),
}));

vi.mock("@/modules/services/calendar-fare-service/calendar-fares.service", () => ({
	searchCalendarFaresGetBySdk: mockSearchCalendarFaresGetBySdk,
}));

const request: CalendarFaresRequest = {
	routes: "NRT,BKK",
	departureDateFrom: "2026-07-01",
	language: "en",
	currency: "JPY",
};

const structuredError: CalendarFaresApiError = {
	status: 404,
	code: "NEXUZR002E051",
	description: "Requested Bound is not available",
	message: "Requested Bound is not available",
};

describe("calendar-fares.slice", () => {
	it("compares calendar requests correctly", () => {
		expect(isSameCalendarRequest(request, { ...request })).toBe(true);
		expect(isSameCalendarRequest(request, { ...request, currency: "USD" })).toBe(false);
	});

	it("supports reset and loaded range actions", () => {
		const withRange = reducer(undefined, addLoadedRange({ from: "2026-07-01", to: "2026-09-30" }));
		expect(withRange.loadedRanges).toHaveLength(1);
		const reset = reducer(withRange, resetCalendarFares());
		expect(reset.loadedRanges).toEqual([]);
		expect(reset.outboundFares).toEqual({});
	});

	it("stores fares on fulfilled thunk and normalizes date keys", async () => {
		let state = reducer(undefined, {
			type: fetchCalendarFares.pending.type,
			meta: {
				arg: { locale: "en", request, loadedRange: { from: "2026-07-01", to: "2026-09-30" } },
			},
		});

		state = reducer(state, {
			type: fetchCalendarFares.fulfilled.type,
			payload: {
				data: {
					outbound: [
						{
							cabin: "STANDARD",
							dates: [
								{ date: "2026-07-10T00:00:00Z", lowestPrice: 12000, baseFareForPromotion: 13000 },
							],
						},
					],
					inbound: [
						{
							cabin: "ZIPFULLFLAT",
							dates: [{ date: "2026-07-14", lowestPrice: 23000 }],
						},
					],
				},
			},
			meta: {
				arg: { locale: "en", request, loadedRange: { from: "2026-07-01", to: "2026-09-30" } },
			},
		});

		expect(state.outboundFares["2026-07-10"]?.standard).toBe(13000);
		expect(state.outboundFares["2026-07-10"]?.standardPromo).toBe(12000);
		expect(state.inboundFares["2026-07-14"]?.zipFullFlat).toBe(23000);
		expect(state.loadedRanges).toHaveLength(1);
		expect(state.isPending).toBe(false);
	});

	it("merges results from concurrent calendar requests", () => {
		const firstRequest = { ...request, departureDateTo: "2026-07-01" };
		const secondRequest = {
			...firstRequest,
			departureDateFrom: "2026-10-01",
			departureDateTo: "2026-10-01",
		};
		let state = reducer(undefined, {
			type: fetchCalendarFares.pending.type,
			meta: {
				requestId: "first",
				arg: { request: firstRequest, loadedRange: { from: "2026-07-01", to: "2026-09-30" } },
			},
		});

		state = reducer(state, {
			type: fetchCalendarFares.pending.type,
			meta: {
				requestId: "second",
				arg: { request: secondRequest, loadedRange: { from: "2026-10-01", to: "2026-12-31" } },
			},
		});
		expect(state.isPending).toBe(true);

		state = reducer(state, {
			type: fetchCalendarFares.fulfilled.type,
			payload: { data: { outbound: [], inbound: [] } },
			meta: {
				requestId: "first",
				arg: { request: firstRequest, loadedRange: { from: "2026-07-01", to: "2026-09-30" } },
			},
		});
		expect(state.loadedRanges).toEqual([{ from: "2026-07-01", to: "2026-09-30" }]);
		expect(state.isPending).toBe(true);

		state = reducer(state, {
			type: fetchCalendarFares.fulfilled.type,
			payload: { data: { outbound: [], inbound: [] } },
			meta: {
				requestId: "second",
				arg: { request: secondRequest, loadedRange: { from: "2026-10-01", to: "2026-12-31" } },
			},
		});
		expect(state.loadedRanges).toEqual([
			{ from: "2026-07-01", to: "2026-09-30" },
			{ from: "2026-10-01", to: "2026-12-31" },
		]);
		expect(state.isPending).toBe(false);
	});

	it("stores error on rejected thunk for matching request", () => {
		let state = reducer(undefined, {
			type: fetchCalendarFares.pending.type,
			meta: {
				arg: { locale: "en", request, loadedRange: { from: "2026-07-01", to: "2026-09-30" } },
			},
		});

		state = reducer(state, {
			type: fetchCalendarFares.rejected.type,
			payload: structuredError,
			error: { message: "boom" },
			meta: {
				arg: { locale: "en", request, loadedRange: { from: "2026-07-01", to: "2026-09-30" } },
			},
		});

		expect(state.error).toEqual(structuredError);
		expect(state.isPending).toBe(false);
	});

	it("falls back to the reducer error message when a rejected action has no payload", () => {
		let state = reducer(undefined, {
			type: fetchCalendarFares.pending.type,
			meta: {
				arg: { locale: "en", request, loadedRange: { from: "2026-07-01", to: "2026-09-30" } },
			},
		});

		state = reducer(state, {
			type: fetchCalendarFares.rejected.type,
			payload: undefined,
			error: { message: "network exploded" },
			meta: {
				arg: { locale: "en", request, loadedRange: { from: "2026-07-01", to: "2026-09-30" } },
			},
		});

		expect(state.error).toEqual({
			status: 500,
			message: "network exploded",
		});
		expect(state.isPending).toBe(false);
	});

	it("dispatches the SDK thunk and surfaces a structured rejected payload for sdk failures", async () => {
		mockSearchCalendarFaresGetBySdk.mockRejectedValueOnce(
			new SdkRequestError({
				message: "Response returned an error code",
				method: "GET",
				responseBody: JSON.stringify({
					code: "NEXUZR002E050",
					description: "Failed to RetrieveFareQuoteDateRange",
				}),
				status: 422,
				url: "http://localhost:3002/api/search/calendar-fares",
			})
		);

		const dispatch = vi.fn();
		const getState = vi.fn();
		const result = await fetchCalendarFares({
			request,
			loadedRange: { from: "2026-07-01", to: "2026-09-30" },
		})(dispatch, getState, undefined as never);

		expect(mockSearchCalendarFaresGetBySdk).toHaveBeenCalledWith(request);
		expect(fetchCalendarFares.rejected.match(result)).toBe(true);
		expect(result.payload).toEqual({
			status: 422,
			code: "NEXUZR002E050",
			description: "Failed to RetrieveFareQuoteDateRange",
			message: "Failed to RetrieveFareQuoteDateRange",
		});
	});

	it("ignores fulfilled and rejected payloads for stale requests", () => {
		const state = reducer(undefined, {
			type: fetchCalendarFares.pending.type,
			meta: {
				arg: { locale: "en", request, loadedRange: { from: "2026-07-01", to: "2026-09-30" } },
			},
		});

		const staleRequest = { ...request, currency: "USD" };

		const afterStaleFulfilled = reducer(state, {
			type: fetchCalendarFares.fulfilled.type,
			payload: { data: { outbound: [] } },
			meta: {
				arg: {
					locale: "en",
					request: staleRequest,
					loadedRange: { from: "2026-07-01", to: "2026-09-30" },
				},
			},
		});

		expect(afterStaleFulfilled.outboundFares).toEqual({});

		const afterStaleRejected = reducer(afterStaleFulfilled, {
			type: fetchCalendarFares.rejected.type,
			payload: "stale",
			error: { message: "stale" },
			meta: {
				arg: {
					locale: "en",
					request: staleRequest,
					loadedRange: { from: "2026-07-01", to: "2026-09-30" },
				},
			},
		});

		expect(afterStaleRejected.error).toBeUndefined();
	});
});
