import { describe, expect, it, vi } from "vitest";
import type { RootState } from "@/store";
import reducer, {
	buildRetrieveOfferBundlesRequest,
	fetchBundleOffers,
	resetBundleOffers,
	selectBundleOffersData,
	selectBundleOffersError,
	selectBundleOffersIsPending,
	selectBundleOffersRequest,
	selectBundleOffersState,
	selectSelectedBundlesBySegment,
	setSelectedBundles,
	shouldFetchBundleOffers,
} from "@/store/slices/bundle-offers/bundle-offers.slice";
import type { ConfirmedFlightPayload } from "@/store/slices/flight-selection/flight-selection.slice";
import type { Passenger } from "@/types/customer-information/customer-information.types";

const { retrieveOfferBundlesBySdkMock } = vi.hoisted(() => ({
	retrieveOfferBundlesBySdkMock: vi.fn(),
}));

vi.mock("@/modules/services/bundle-offers/bundle-offers.service", () => ({
	retrieveOfferBundlesBySdk: retrieveOfferBundlesBySdkMock,
}));

function makeConfirmedFlight(
	overrides: Partial<ConfirmedFlightPayload> = {}
): ConfirmedFlightPayload {
	return {
		tripType: "roundtrip",
		selectedCabinsOutbound: {},
		selectedCabinsInbound: {},
		flights: {
			outbound: {
				segments: [
					{
						pfid: 10,
						lfid: 1001,
						carrierCode: "ZG",
						origin: "BKK",
						destination: "NRT",
						flightNumber: "101",
						scheduledDepartureArrivalDateTime: {
							departureDateTime: "2026-08-01T10:20:00",
							departureDateTimeOffset: "+07:00",
							arrivalDateTime: "2026-08-01T18:00:00",
							arrivalDateTimeOffset: "+09:00",
						},
						flightTime: "06:40",
						selectedCabin: "STANDARD",
						fareDetails: [
							{
								fareId: 1,
								fareClass: "OUT-FCLASS",
								fareBasisCode: "OUT-FBC",
								passengerType: "adult",
								availableSeat: 2,
								baseFareAmt: 100,
								fareAmt: 120,
								baseFareAmtInclTax: 130,
								fareAmtInclTax: 140,
								taxes: [],
							},
						],
					},
				],
				selectedFareInfos: [],
				passengerFareBreakdown: [],
				totalFlightAmount: 0,
			},
			inbound: {
				segments: [
					{
						pfid: 11,
						lfid: 1002,
						carrierCode: "ZG",
						origin: "NRT",
						destination: "BKK",
						flightNumber: "102",
						scheduledDepartureArrivalDateTime: {
							departureDateTime: "2026-08-10T13:10:00",
							departureDateTimeOffset: "+09:00",
							arrivalDateTime: "2026-08-10T17:40:00",
							arrivalDateTimeOffset: "+07:00",
						},
						flightTime: "06:30",
						selectedCabin: "ZIPFULLFLAT",
						fareDetails: [
							{
								fareId: 2,
								fareClass: "IN-FCLASS",
								fareBasisCode: "IN-FBC",
								passengerType: "adult",
								availableSeat: 2,
								baseFareAmt: 200,
								fareAmt: 220,
								baseFareAmtInclTax: 230,
								fareAmtInclTax: 240,
								taxes: [],
							},
						],
					},
				],
				selectedFareInfos: [],
				passengerFareBreakdown: [],
				totalFlightAmount: 0,
			},
		},
		grandTotalAmount: 0,
		currency: "JPY",
		language: "en",
		...overrides,
	};
}

function makePassenger(overrides: Partial<Passenger> = {}): Passenger {
	return {
		id: "p1",
		firstName: "Test",
		lastName: "Passenger",
		passengerTypeCode: "adult",
		...overrides,
	};
}
function makePassengers(): Passenger[] {
	return [
		makePassenger({ id: "p1", passengerTypeCode: "adult" }),
		makePassenger({ id: "p2", passengerTypeCode: "adult" }),
		makePassenger({ id: "p3", passengerTypeCode: "childA" }),
		makePassenger({ id: "p4", passengerTypeCode: "infant" }),
	];
}

function makeRootState(sliceState: Partial<ReturnType<typeof reducer>> = {}) {
	return {
		bundleOffers: {
			isPending: false,
			selectedBundlesBySegment: {},
			...sliceState,
		},
	};
}

function makeThunkRootState(sliceState: Partial<ReturnType<typeof reducer>> = {}) {
	return makeRootState(sliceState) as RootState;
}

function makeBundleOffersState(
	overrides: Partial<Parameters<typeof shouldFetchBundleOffers>[0]> = {}
) {
	return {
		isPending: false,
		...overrides,
	};
}

describe("buildRetrieveOfferBundlesRequest", () => {
	it("builds request using confirmed route, segment details, and passenger counts", () => {
		const request = buildRetrieveOfferBundlesRequest({
			confirmedFlight: makeConfirmedFlight(),
			passengers: makePassengers(),
		});

		expect(request.currency).toBe("JPY");
		expect(request.nEXUZR004OffersBundleRequest.routes).toBe("BKK,NRT");
		expect(request.nEXUZR004OffersBundleRequest.adult).toBe(2);
		expect(request.nEXUZR004OffersBundleRequest.childA).toBe(1);
		expect(request.nEXUZR004OffersBundleRequest.infant).toBe(1);
		expect(request.nEXUZR004OffersBundleRequest.outbound).toHaveLength(1);
		expect(request.nEXUZR004OffersBundleRequest.inbound).toHaveLength(1);
		expect(request.nEXUZR004OffersBundleRequest.outbound[0]?.cabin).toBe("STANDARD");
		expect(request.nEXUZR004OffersBundleRequest.outbound[0]?.fareClass).toBe("OUT-FCLASS");
		expect(request.nEXUZR004OffersBundleRequest.outbound[0]?.fareBasisCode).toBe("OUT-FBC");
		expect(request.nEXUZR004OffersBundleRequest.inbound?.[0]?.cabin).toBe("ZIPFULLFLAT");
		expect(request.nEXUZR004OffersBundleRequest.inbound?.[0]?.fareClass).toBe("IN-FCLASS");
		expect(request.nEXUZR004OffersBundleRequest.inbound?.[0]?.fareBasisCode).toBe("IN-FBC");
	});

	it("includes stopovers in outbound route for connecting flights", () => {
		const confirmedFlight = makeConfirmedFlight();
		const firstSegment = confirmedFlight.flights.outbound.segments[0];

		if (!firstSegment) {
			throw new Error("Test fixture is missing outbound segment");
		}

		confirmedFlight.flights.outbound.segments.push({
			...firstSegment,
			lfid: 1003,
			origin: "NRT",
			destination: "HNL",
		});

		const request = buildRetrieveOfferBundlesRequest({
			confirmedFlight,
			passengers: makePassengers(),
		});

		expect(request.nEXUZR004OffersBundleRequest.routes).toBe("BKK,NRT,HNL");
	});

	it("uses selected fare info when segment fare details are empty", () => {
		const request = buildRetrieveOfferBundlesRequest({
			confirmedFlight: makeConfirmedFlight({
				flights: {
					outbound: {
						segments: [
							{
								pfid: 10,
								lfid: 1001,
								carrierCode: "ZG",
								origin: "BKK",
								destination: "NRT",
								flightNumber: "101",
								scheduledDepartureArrivalDateTime: {
									departureDateTime: "2026-08-01T10:20:00",
									departureDateTimeOffset: "+07:00",
									arrivalDateTime: "2026-08-01T18:00:00",
									arrivalDateTimeOffset: "+09:00",
								},
								flightTime: "06:40",
								selectedCabin: "standard",
								fareDetails: [],
							},
						],
						selectedFareInfos: [
							{
								fareDetails: [
									{
										fareId: 3,
										fareClass: "ALT-FCLASS",
										fareBasisCode: "ALT-FBC",
										passengerType: "childB",
										availableSeat: 1,
										baseFareAmt: 90,
										fareAmt: 110,
										baseFareAmtInclTax: 120,
										fareAmtInclTax: 130,
										taxes: [],
									},
								],
								cabin: "STANDARD",
								boundSummary: {
									totalFlightAmount: 0,
									promotionalAmount: 0,
									passengerWiseFares: [],
									totalTaxAmount: 0,
									taxBreakDown: [],
								},
							},
						],
						passengerFareBreakdown: [],
						totalFlightAmount: 0,
					},
					inbound: {
						segments: [],
						selectedFareInfos: [],
						passengerFareBreakdown: [],
						totalFlightAmount: 0,
					},
				},
			}),
			passengers: [makePassenger({ id: "p1", passengerTypeCode: "adult" })],
		});

		expect(request.nEXUZR004OffersBundleRequest.outbound[0]?.fareClass).toBe("ALT-FCLASS");
		expect(request.nEXUZR004OffersBundleRequest.outbound[0]?.fareBasisCode).toBe("ALT-FBC");
		expect(request.nEXUZR004OffersBundleRequest.inbound).toBeUndefined();
	});

	it("builds request when selected fare info lacks fare details", () => {
		const request = buildRetrieveOfferBundlesRequest({
			confirmedFlight: makeConfirmedFlight({
				flights: {
					outbound: {
						segments: [
							{
								pfid: 10,
								lfid: 1001,
								carrierCode: "ZG",
								origin: "BKK",
								destination: "NRT",
								flightNumber: "101",
								scheduledDepartureArrivalDateTime: {
									departureDateTime: "2026-08-01T10:20:00",
									departureDateTimeOffset: "+07:00",
									arrivalDateTime: "2026-08-01T18:00:00",
									arrivalDateTimeOffset: "+09:00",
								},
								flightTime: "06:40",
								selectedCabin: "STANDARD",
								fareDetails: [],
							},
						],
						selectedFareInfos: [{} as never],
						passengerFareBreakdown: [],
						totalFlightAmount: 0,
					},
					inbound: {
						segments: [],
						selectedFareInfos: [],
						passengerFareBreakdown: [],
						totalFlightAmount: 0,
					},
				},
			}),
			passengers: [makePassenger({ id: "p1", passengerTypeCode: "adult" })],
		});

		expect(request.nEXUZR004OffersBundleRequest.outbound[0]?.fareClass).toBeUndefined();
		expect(request.nEXUZR004OffersBundleRequest.outbound[0]?.fareBasisCode).toBeUndefined();
	});

	it("counts extra child buckets and ignores unknown passenger types", () => {
		const request = buildRetrieveOfferBundlesRequest({
			confirmedFlight: makeConfirmedFlight(),
			passengers: [
				makePassenger({ id: "p1", passengerTypeCode: "childB" }),
				makePassenger({ id: "p2", passengerTypeCode: "childC" }),
				makePassenger({ id: "p3", passengerTypeCode: "mystery" }),
			],
		});

		expect(request.nEXUZR004OffersBundleRequest.childB).toBe(1);
		expect(request.nEXUZR004OffersBundleRequest.childC).toBe(1);
		expect(request.nEXUZR004OffersBundleRequest.adult).toBe(0);
		expect(request.nEXUZR004OffersBundleRequest.infant).toBeUndefined();
	});

	it("throws when currency missing", () => {
		expect(() =>
			buildRetrieveOfferBundlesRequest({
				confirmedFlight: makeConfirmedFlight({ currency: undefined }),
				passengers: makePassengers(),
			})
		).toThrow("Unable to build offers request: currency is missing");
	});

	it("throws when outbound route missing", () => {
		expect(() =>
			buildRetrieveOfferBundlesRequest({
				confirmedFlight: makeConfirmedFlight({
					flights: {
						outbound: {
							segments: [
								{
									pfid: 10,
									lfid: 1001,
									carrierCode: "ZG",
									origin: "",
									destination: "NRT",
									flightNumber: "101",
									scheduledDepartureArrivalDateTime: {
										departureDateTime: "2026-08-01T10:20:00",
										departureDateTimeOffset: "+07:00",
										arrivalDateTime: "2026-08-01T18:00:00",
										arrivalDateTimeOffset: "+09:00",
									},
									flightTime: "06:40",
									selectedCabin: "STANDARD",
									fareDetails: [],
								},
							],
							selectedFareInfos: [],
							passengerFareBreakdown: [],
							totalFlightAmount: 0,
						},
						inbound: {
							segments: [],
							selectedFareInfos: [],
							passengerFareBreakdown: [],
							totalFlightAmount: 0,
						},
					},
				}),
				passengers: makePassengers(),
			})
		).toThrow("Unable to build offers request: outbound route is missing");
	});

	it("throws when outbound destination missing", () => {
		expect(() =>
			buildRetrieveOfferBundlesRequest({
				confirmedFlight: makeConfirmedFlight({
					flights: {
						outbound: {
							segments: [
								{
									pfid: 10,
									lfid: 1001,
									carrierCode: "ZG",
									origin: "BKK",
									destination: "",
									flightNumber: "101",
									scheduledDepartureArrivalDateTime: {
										departureDateTime: "2026-08-01T10:20:00",
										departureDateTimeOffset: "+07:00",
										arrivalDateTime: "2026-08-01T18:00:00",
										arrivalDateTimeOffset: "+09:00",
									},
									flightTime: "06:40",
									selectedCabin: "STANDARD",
									fareDetails: [],
								},
							],
							selectedFareInfos: [],
							passengerFareBreakdown: [],
							totalFlightAmount: 0,
						},
						inbound: {
							segments: [],
							selectedFareInfos: [],
							passengerFareBreakdown: [],
							totalFlightAmount: 0,
						},
					},
				}),
				passengers: makePassengers(),
			})
		).toThrow("Unable to build offers request: outbound route is missing");
	});

	it("throws when departure datetime invalid", () => {
		expect(() =>
			buildRetrieveOfferBundlesRequest({
				confirmedFlight: makeConfirmedFlight({
					flights: {
						outbound: {
							segments: [
								{
									pfid: 10,
									lfid: 1001,
									carrierCode: "ZG",
									origin: "BKK",
									destination: "NRT",
									flightNumber: "101",
									scheduledDepartureArrivalDateTime: {
										departureDateTime: "not-a-date",
										departureDateTimeOffset: "+07:00",
										arrivalDateTime: "2026-08-01T18:00:00",
										arrivalDateTimeOffset: "+09:00",
									},
									flightTime: "06:40",
									selectedCabin: "STANDARD",
									fareDetails: [],
								},
							],
							selectedFareInfos: [],
							passengerFareBreakdown: [],
							totalFlightAmount: 0,
						},
						inbound: {
							segments: [],
							selectedFareInfos: [],
							passengerFareBreakdown: [],
							totalFlightAmount: 0,
						},
					},
				}),
				passengers: makePassengers(),
			})
		).toThrow("Unable to build offers request: invalid segment departure date");
	});

	it("throws when departure datetime missing", () => {
		expect(() =>
			buildRetrieveOfferBundlesRequest({
				confirmedFlight: makeConfirmedFlight({
					flights: {
						outbound: {
							segments: [
								{
									pfid: 10,
									lfid: 1001,
									carrierCode: "ZG",
									origin: "BKK",
									destination: "NRT",
									flightNumber: "101",
									scheduledDepartureArrivalDateTime: {
										departureDateTime: undefined as never,
										departureDateTimeOffset: "+07:00",
										arrivalDateTime: "2026-08-01T18:00:00",
										arrivalDateTimeOffset: "+09:00",
									},
									flightTime: "06:40",
									selectedCabin: "STANDARD",
									fareDetails: [],
								},
							],
							selectedFareInfos: [],
							passengerFareBreakdown: [],
							totalFlightAmount: 0,
						},
						inbound: {
							segments: [],
							selectedFareInfos: [],
							passengerFareBreakdown: [],
							totalFlightAmount: 0,
						},
					},
				}),
				passengers: makePassengers(),
			})
		).toThrow("Unable to build offers request: invalid segment departure date");
	});

	it("throws when departure datetime object missing", () => {
		expect(() =>
			buildRetrieveOfferBundlesRequest({
				confirmedFlight: makeConfirmedFlight({
					flights: {
						outbound: {
							segments: [
								{
									pfid: 10,
									lfid: 1001,
									carrierCode: "ZG",
									origin: "BKK",
									destination: "NRT",
									flightNumber: "101",
									scheduledDepartureArrivalDateTime: undefined as never,
									flightTime: "06:40",
									selectedCabin: "STANDARD",
									fareDetails: [],
								},
							],
							selectedFareInfos: [],
							passengerFareBreakdown: [],
							totalFlightAmount: 0,
						},
						inbound: {
							segments: [],
							selectedFareInfos: [],
							passengerFareBreakdown: [],
							totalFlightAmount: 0,
						},
					},
				}),
				passengers: makePassengers(),
			})
		).toThrow("Unable to build offers request: invalid segment departure date");
	});

	it("omits optional child counters when they are zero", () => {
		const request = buildRetrieveOfferBundlesRequest({
			confirmedFlight: makeConfirmedFlight(),
			passengers: [makePassenger({ id: "p1", passengerTypeCode: "adult" })],
		});

		expect(request.nEXUZR004OffersBundleRequest.childA).toBeUndefined();
		expect(request.nEXUZR004OffersBundleRequest.childB).toBeUndefined();
		expect(request.nEXUZR004OffersBundleRequest.childC).toBeUndefined();
		expect(request.nEXUZR004OffersBundleRequest.infant).toBeUndefined();
	});

	it("counts shorthand passenger type codes used by booking payloads", () => {
		const request = buildRetrieveOfferBundlesRequest({
			confirmedFlight: makeConfirmedFlight(),
			passengers: [
				makePassenger({ id: "p1", passengerTypeCode: "ADT" }),
				makePassenger({ id: "p2", passengerTypeCode: "CHD" }),
				makePassenger({ id: "p3", passengerTypeCode: "INF" }),
			],
		});

		expect(request.nEXUZR004OffersBundleRequest.adult).toBe(1);
		expect(request.nEXUZR004OffersBundleRequest.childA).toBe(1);
		expect(request.nEXUZR004OffersBundleRequest.infant).toBe(1);
	});

	it("preserves selected local departure calendar date for offers request", () => {
		const request = buildRetrieveOfferBundlesRequest({
			confirmedFlight: makeConfirmedFlight({
				flights: {
					outbound: {
						segments: [
							{
								pfid: 10,
								lfid: 1001,
								carrierCode: "ZG",
								origin: "NRT",
								destination: "ICN",
								flightNumber: "101",
								scheduledDepartureArrivalDateTime: {
									departureDateTime: "2026-09-19T00:10:00",
									departureDateTimeOffset: "+09:00",
									arrivalDateTime: "2026-09-19T03:00:00",
									arrivalDateTimeOffset: "+09:00",
								},
								flightTime: "02:50",
								selectedCabin: "STANDARD",
								fareDetails: [
									{
										fareId: 1,
										fareClass: "OUT-FCLASS",
										fareBasisCode: "OUT-FBC",
										passengerType: "adult",
										availableSeat: 2,
										baseFareAmt: 100,
										fareAmt: 120,
										baseFareAmtInclTax: 130,
										fareAmtInclTax: 140,
										taxes: [],
									},
								],
							},
						],
						selectedFareInfos: [],
						passengerFareBreakdown: [],
						totalFlightAmount: 0,
					},
				},
			}),
			passengers: [makePassenger({ id: "p1", passengerTypeCode: "adult" })],
		});

		expect(request.nEXUZR004OffersBundleRequest.outbound[0]?.departureDate).toBe("2026-09-19");
	});
});

describe("shouldFetchBundleOffers", () => {
	it("allows refetch for same request after success or failure", () => {
		expect(shouldFetchBundleOffers(makeBundleOffersState({ data: { data: [] } }))).toBe(true);

		expect(
			shouldFetchBundleOffers(makeBundleOffersState({ error: { status: 500, message: "boom" } }))
		).toBe(true);
	});

	it("blocks fetch while a request is pending", () => {
		expect(shouldFetchBundleOffers(makeBundleOffersState({ isPending: true }))).toBe(false);
	});
});

describe("bundleOffersSlice reducer", () => {
	it("resets bundle offers state", () => {
		const state = reducer(
			{
				isPending: true,
				data: { data: [{ lfid: 9999, bundles: [] }] },
				error: { status: 500, message: "boom" },
				request: {
					currency: "JPY",
					nEXUZR004OffersBundleRequest: {
						routes: "BKK,NRT",
						adult: 1,
						outbound: [],
					},
				},
				selectedBundlesBySegment: { "1001": { STANDARD: "PREM" } },
			},
			resetBundleOffers()
		);

		expect(state).toEqual({
			isPending: false,
			selectedBundlesBySegment: {},
		});
	});

	it("sets pending state when fetch starts", () => {
		const pendingAction = fetchBundleOffers.pending("request-id", {
			locale: "en",
			request: {
				currency: "JPY",
				nEXUZR004OffersBundleRequest: {
					routes: "BKK,NRT",
					adult: 1,
					outbound: [
						{
							departureDate: "2026-08-01T10:20:00.000Z",
							cabin: "STANDARD",
							lfid: 1001,
						},
					],
				},
			},
		});

		const state = reducer(undefined, pendingAction);

		expect(state.isPending).toBe(true);
		expect(state.error).toBeUndefined();
	});

	it("stores API data and clears pending when fulfilled", () => {
		const fulfilledAction = fetchBundleOffers.fulfilled(
			{
				data: [],
			},
			"request-id",
			{
				locale: "en",
				request: {
					currency: "JPY",
					nEXUZR004OffersBundleRequest: {
						routes: "BKK,NRT",
						adult: 1,
						outbound: [
							{
								departureDate: "2026-08-01T10:20:00.000Z",
								cabin: "STANDARD",
								lfid: 1001,
							},
						],
					},
				},
			}
		);

		const state = reducer(
			{
				isPending: true,
			},
			fulfilledAction
		);

		expect(state.isPending).toBe(false);
		expect(state.data).toEqual({ data: [] });
	});

	it("stores rejected payload error and clears data", () => {
		const rejectedAction = fetchBundleOffers.rejected(
			new Error("request failed"),
			"request-id",
			{
				locale: "en",
				request: {
					currency: "JPY",
					nEXUZR004OffersBundleRequest: {
						routes: "BKK,NRT",
						adult: 1,
						outbound: [],
					},
				},
			},
			{ status: 502, message: "bad gateway" }
		);

		const state = reducer(
			{
				isPending: true,
				data: { data: [{ lfid: 9999, bundles: [] }] },
			},
			rejectedAction
		);

		expect(state.isPending).toBe(false);
		expect(state.data).toBeUndefined();
		expect(state.error).toEqual({ status: 502, message: "bad gateway" });
	});

	it("falls back to thunk error message when rejected without payload", () => {
		const rejectedAction = fetchBundleOffers.rejected(new Error("network down"), "request-id", {
			locale: "en",
			request: {
				currency: "JPY",
				nEXUZR004OffersBundleRequest: {
					routes: "BKK,NRT",
					adult: 1,
					outbound: [],
				},
			},
		});

		const state = reducer(undefined, rejectedAction);

		expect(state.error).toMatchObject({
			status: 500,
			message: "Unable to fetch bundle offers",
		});
	});

	it("stores selected bundles by segment lfid", () => {
		const state = reducer(
			undefined,
			setSelectedBundles({
				lfid: 1001,
				selections: { STANDARD: "PREM" },
			})
		);

		expect(state.selectedBundlesBySegment?.["1001"]).toEqual({ STANDARD: "PREM" });
	});

	it("initializes selected bundle map when slice field missing", () => {
		const state = reducer(
			{
				isPending: false,
				selectedBundlesBySegment: undefined,
			},
			setSelectedBundles({
				lfid: 1002,
				selections: { STANDARD: null },
			})
		);

		expect(state.selectedBundlesBySegment?.["1002"]).toEqual({ STANDARD: null });
	});
});

describe("fetchBundleOffers thunk", () => {
	it("dispatches sdk success response", async () => {
		retrieveOfferBundlesBySdkMock.mockResolvedValueOnce({ data: [{ lfid: 1001, bundles: [] }] });

		const dispatch = vi.fn();
		const getState = vi.fn(() => makeThunkRootState({ selectedBundlesBySegment: {} }));
		const request = {
			currency: "JPY",
			nEXUZR004OffersBundleRequest: {
				routes: "BKK,NRT",
				adult: 1,
				outbound: [],
			},
		};

		await fetchBundleOffers({ locale: "en", request })(dispatch, getState, undefined);

		expect(retrieveOfferBundlesBySdkMock).toHaveBeenCalledWith("en", request);
	});

	it("uses normalized error when sdk call fails", async () => {
		retrieveOfferBundlesBySdkMock.mockRejectedValueOnce(new Error("boom"));

		const dispatch = vi.fn();
		const getState = vi.fn(() => makeThunkRootState({ selectedBundlesBySegment: {} }));
		const request = {
			currency: "JPY",
			nEXUZR004OffersBundleRequest: {
				routes: "BKK,NRT",
				adult: 1,
				outbound: [],
			},
		};

		await fetchBundleOffers({ locale: "en", request })(dispatch, getState, undefined);

		expect(retrieveOfferBundlesBySdkMock).toHaveBeenCalledWith("en", request);
	});
});

describe("bundleOffers selectors", () => {
	it("reads bundle offers slice values", () => {
		const state = makeRootState({
			isPending: true,
			data: { data: [{ lfid: 1001, bundles: [] }] },
			error: { status: 400, message: "bad request" },
			request: {
				currency: "JPY",
				nEXUZR004OffersBundleRequest: {
					routes: "BKK,NRT",
					adult: 1,
					outbound: [],
				},
			},
			selectedBundlesBySegment: {
				"1001": { STANDARD: "PREM" },
			},
		});

		expect(selectBundleOffersState(state as never)).toBe(state.bundleOffers);
		expect(selectBundleOffersIsPending(state as never)).toBe(true);
		expect(selectBundleOffersData(state as never)).toEqual({ data: [{ lfid: 1001, bundles: [] }] });
		expect(selectBundleOffersError(state as never)).toEqual({
			status: 400,
			message: "bad request",
		});
		expect(selectBundleOffersRequest(state as never)).toEqual({
			currency: "JPY",
			nEXUZR004OffersBundleRequest: {
				routes: "BKK,NRT",
				adult: 1,
				outbound: [],
			},
		});
		expect(selectSelectedBundlesBySegment(state as never)).toEqual({
			"1001": { STANDARD: "PREM" },
		});
	});

	it("returns empty selected bundle map when slice field missing", () => {
		const state = makeRootState({ selectedBundlesBySegment: undefined });

		expect(selectSelectedBundlesBySegment(state as never)).toEqual({});
	});
});
