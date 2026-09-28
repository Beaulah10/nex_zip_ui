import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { ConfirmedFlightPayload } from "@/store/slices/flight-selection/flight-selection.slice";
import type { Passenger } from "@/types/customer-information/customer-information.types";
import {
	buildRetrieveOfferBundlesRequest,
	fetchOfferBundles,
	retrieveOfferBundlesBySdk,
} from "./bundle-offers.service";

const {
	createSdkClientContextMock,
	getAuthorizedSdkClientContextForRequestMock,
	retrieveOfferBundlesMock,
	buildClientRefMock,
	cookiesMock,
} = vi.hoisted(() => {
	const retrieveOfferBundlesMock = vi.fn();
	const getApiMock = vi.fn(() => ({ retrieveOfferBundles: retrieveOfferBundlesMock }));
	const createSdkClientContextMock = vi.fn(() => ({ getApi: getApiMock }));
	const getAuthorizedSdkClientContextForRequestMock = vi.fn(async () => ({ getApi: getApiMock }));
	const buildClientRefMock = vi.fn(() => "test-client-ref");
	const cookiesMock = vi.fn(() => ({ cookie: "value" }));

	return {
		createSdkClientContextMock,
		getAuthorizedSdkClientContextForRequestMock,
		getApiMock,
		retrieveOfferBundlesMock,
		buildClientRefMock,
		cookiesMock,
	};
});

vi.mock("@repo/sdk", () => ({
	COMMON_ERROR_CONFIG: [],
	OffersApi: class OffersApi {},
	createSdkClientContext: createSdkClientContextMock,
	getAuthorizedSdkClientContextForRequest: getAuthorizedSdkClientContextForRequestMock,
}));

vi.mock("@repo/ui/lib", () => ({
	buildClientRef: buildClientRefMock,
}));

vi.mock("next/headers", () => ({
	cookies: cookiesMock,
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
							departureDateTime: "2026-08-01T10:20:00.000Z",
							departureDateTimeOffset: "+07:00",
							arrivalDateTime: "2026-08-01T18:00:00.000Z",
							arrivalDateTimeOffset: "+09:00",
						},
						flightTime: "06:40",
						selectedCabin: "standard",
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
							departureDateTime: "2026-08-10T13:10:00.000Z",
							departureDateTimeOffset: "+09:00",
							arrivalDateTime: "2026-08-10T17:40:00.000Z",
							arrivalDateTimeOffset: "+07:00",
						},
						flightTime: "06:30",
						selectedCabin: "zipfullflat",
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
		makePassenger({ id: "p2", passengerTypeCode: "childA" }),
		makePassenger({ id: "p3", passengerTypeCode: "childB" }),
		makePassenger({ id: "p4", passengerTypeCode: "childC" }),
		makePassenger({ id: "p5", passengerTypeCode: "infant" }),
		makePassenger({ id: "p6", passengerTypeCode: "mystery" }),
	];
}

beforeEach(() => {
	vi.clearAllMocks();
	vi.unstubAllGlobals();
});

afterEach(() => {
	vi.unstubAllGlobals();
});

describe("buildRetrieveOfferBundlesRequest", () => {
	it("maps route, cabins, and fare details", () => {
		const request = buildRetrieveOfferBundlesRequest({
			confirmedFlight: makeConfirmedFlight(),
			passengers: makePassengers(),
		});

		expect(request).toEqual({
			currency: "JPY",
			nEXUZR004OffersBundleRequest: {
				routes: "BKK,NRT",
				adult: 1,
				childA: 1,
				childB: 1,
				childC: 1,
				infant: 1,
				outbound: [
					{
						departureDate: "2026-08-01T10:20:00.000Z",
						cabin: "STANDARD",
						lfid: 1001,
						fareBasisCode: "OUT-FBC",
						fareClass: "OUT-FCLASS",
					},
				],
				inbound: [
					{
						departureDate: "2026-08-10T13:10:00.000Z",
						cabin: "ZIPFULLFLAT",
						lfid: 1002,
						fareBasisCode: "IN-FBC",
						fareClass: "IN-FCLASS",
					},
				],
			},
		});
	});

	it("uses fallback fare details and omits inbound when none exist", () => {
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
									departureDateTime: "2026-08-01T10:20:00.000Z",
									departureDateTimeOffset: "+07:00",
									arrivalDateTime: "2026-08-01T18:00:00.000Z",
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

		expect(request.nEXUZR004OffersBundleRequest.outbound[0]).toMatchObject({
			cabin: "STANDARD",
			fareBasisCode: "ALT-FBC",
			fareClass: "ALT-FCLASS",
		});
		expect(request.nEXUZR004OffersBundleRequest.inbound).toBeUndefined();
	});

	it("ignores unknown passenger codes and omits zero-value buckets", () => {
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
									departureDateTime: "2026-08-01T10:20:00.000Z",
									departureDateTimeOffset: "+07:00",
									arrivalDateTime: "2026-08-01T18:00:00.000Z",
									arrivalDateTimeOffset: "+09:00",
								},
								flightTime: "06:40",
								selectedCabin: "standard",
								fareDetails: [],
							},
						],
						selectedFareInfos: [],
						passengerFareBreakdown: [],
						totalFlightAmount: 0,
					},
					inbound: undefined,
				},
			}),
			passengers: [makePassenger({ id: "p1", passengerTypeCode: "adult" })],
		});

		expect(request.nEXUZR004OffersBundleRequest).toMatchObject({
			routes: "BKK,NRT",
			adult: 1,
			outbound: [
				{
					departureDate: "2026-08-01T10:20:00.000Z",
					cabin: "STANDARD",
					lfid: 1001,
				},
			],
		});
		expect(request.nEXUZR004OffersBundleRequest.outbound[0]).toMatchObject({
			departureDate: "2026-08-01T10:20:00.000Z",
			cabin: "STANDARD",
			lfid: 1001,
		});
		expect(request.nEXUZR004OffersBundleRequest.outbound[0]?.fareBasisCode).toBeUndefined();
		expect(request.nEXUZR004OffersBundleRequest.outbound[0]?.fareClass).toBeUndefined();
	});

	it("falls back to empty routes when outbound first segment is missing", () => {
		const request = buildRetrieveOfferBundlesRequest({
			confirmedFlight: makeConfirmedFlight({
				flights: {
					outbound: {
						segments: [],
						selectedFareInfos: [],
						passengerFareBreakdown: [],
						totalFlightAmount: 0,
					},
					inbound: undefined,
				},
			}),
			passengers: [makePassenger({ id: "p1", passengerTypeCode: "adult" })],
		});

		expect(request.nEXUZR004OffersBundleRequest.routes).toBe(",");
		expect(request.nEXUZR004OffersBundleRequest.outbound).toEqual([]);
	});

	it("throws when departure date is missing", () => {
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
									selectedCabin: "standard",
									fareDetails: [],
								},
							],
							selectedFareInfos: [],
							passengerFareBreakdown: [],
							totalFlightAmount: 0,
						},
						inbound: undefined,
					},
				}),
				passengers: [makePassenger({ id: "p1", passengerTypeCode: "adult" })],
			})
		).toThrow();
	});
});

describe("retrieveOfferBundlesBySdk", () => {
	it("uses browser origin and forwards client ref header", async () => {
		const request = buildRetrieveOfferBundlesRequest({
			confirmedFlight: makeConfirmedFlight(),
			passengers: [makePassenger({ id: "p1", passengerTypeCode: "adult" })],
		});
		retrieveOfferBundlesMock.mockResolvedValueOnce({ data: { ok: true } });

		const result = await retrieveOfferBundlesBySdk("en", request);

		expect(createSdkClientContextMock).toHaveBeenCalledWith(
			expect.objectContaining({
				baseUrl: "http://localhost:3000/booking/api",
				middleware: expect.any(Array),
			})
		);

		const sdkContextCalls = createSdkClientContextMock.mock.calls as unknown as Array<[unknown]>;
		const firstCall = sdkContextCalls[0]?.[0];
		if (!firstCall) {
			throw new Error("Expected SDK context options to be passed");
		}

		const middleware = (
			firstCall as unknown as {
				middleware?: Array<{
					pre: (context: { url: string; init: { headers: Headers } }) => Promise<{
						url: string;
						init: { headers: Headers };
					}>;
				}>;
			}
		).middleware?.[0];

		if (!middleware) {
			throw new Error("Expected middleware to be defined");
		}

		const middlewareResult = await middleware.pre({
			url: "https://example.com",
			init: { headers: new Headers({ existing: "value" }) },
		});

		expect(new Headers(middlewareResult.init.headers).get("nexuz-client-ref")).toBe(
			"test-client-ref"
		);
		expect(new Headers(middlewareResult.init.headers).get("existing")).toBe("value");
		expect(retrieveOfferBundlesMock).toHaveBeenCalledWith(
			{
				currency: "JPY",
				nEXUZR004OffersBundleRequest: expect.objectContaining({
					outbound: [
						expect.objectContaining({
							departureDate: new Date("2026-08-01T10:20:00.000Z"),
						}),
					],
				}),
			},
			{ cache: "no-store" }
		);
		expect(result).toEqual({ data: { ok: true } });
	});

	it("falls back to booking api base url when window is unavailable", async () => {
		vi.stubGlobal("window", undefined);
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
									departureDateTime: "2026-08-01T10:20:00.000Z",
									departureDateTimeOffset: "+07:00",
									arrivalDateTime: "2026-08-01T18:00:00.000Z",
									arrivalDateTimeOffset: "+09:00",
								},
								flightTime: "06:40",
								selectedCabin: "standard",
								fareDetails: [],
							},
						],
						selectedFareInfos: [],
						passengerFareBreakdown: [],
						totalFlightAmount: 0,
					},
					inbound: undefined,
				},
			}),
			passengers: [makePassenger({ id: "p1", passengerTypeCode: "adult" })],
		});
		retrieveOfferBundlesMock.mockResolvedValueOnce({ data: { ok: true } });

		await retrieveOfferBundlesBySdk("en", request);

		expect(createSdkClientContextMock).toHaveBeenCalledWith(
			expect.objectContaining({
				baseUrl: "/booking/api",
			})
		);
	});
});

describe("fetchOfferBundles", () => {
	it("uses authorized request context and cookies", async () => {
		const request = {
			currency: "JPY",
			nEXUZR004OffersBundleRequest: {
				routes: "BKK,NRT",
				adult: 1,
				outbound: [
					{
						departureDate: new Date("2026-08-01T10:20:00.000Z"),
						cabin: "STANDARD",
						lfid: 1001,
					},
				],
			},
		};
		retrieveOfferBundlesMock.mockResolvedValueOnce({ data: { ok: true } });

		const result = await fetchOfferBundles(request as never);

		expect(cookiesMock).toHaveBeenCalledTimes(1);
		expect(getAuthorizedSdkClientContextForRequestMock).toHaveBeenCalledWith(
			expect.objectContaining({
				cookieStore: { cookie: "value" },
				headers: {
					"nexuz-client-ref": "test-client-ref",
				},
			})
		);
		expect(retrieveOfferBundlesMock).toHaveBeenCalledWith(request, { cache: "no-store" });
		expect(result).toEqual({ data: { ok: true } });
	});
});
