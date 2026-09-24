import type { NEXUZR004OffersBundleResponse } from "@repo/sdk";
import { describe, expect, it, vi } from "vitest";
import type { ConfirmedFlightPayload } from "@/store/slices/flight-selection/flight-selection.slice";
import type { PassengerEntry } from "@/types/bundle/bundle.types";
import {
	applyBundleToAll,
	buildSelectedBundle,
	getAvailableBundleIds,
	getBundleCapacities,
	getBundleName,
	getBundlePrices,
	getBundleSegment,
	getLocaleFromParam,
	getPassengerDisplayName,
	getUnavailableBundleIds,
	isAdultPassengerTypeCode,
	isAllBundlesUnavailable,
	isBundleUnavailable,
	isRouteConnectedToAirport,
} from "./bundle.helpers";

// --- Fixtures ---

function makeSegment(lfid: number, pfid = lfid, origin = "NRT", destination = "TYO") {
	return {
		pfid,
		lfid,
		carrierCode: "ZG",
		origin,
		destination,
		flightNumber: "ZG001",
		scheduledDepartureArrivalDateTime: {
			departureDateTime: "2026-07-23T10:00:00+09:00",
			departureDateTimeOffset: "+09:00",
			arrivalDateTime: "2026-07-23T15:00:00+09:00",
			arrivalDateTimeOffset: "+09:00",
		},
		flightTime: "05:00",
		selectedCabin: "economy",
		fareDetails: [],
	};
}

function makeBound(segments: ReturnType<typeof makeSegment>[]) {
	return { segments, selectedFareInfos: [], passengerFareBreakdown: [], totalFlightAmount: 0 };
}

function makeConfirmedFlight({
	tripType = "oneway" as "oneway" | "roundtrip",
	outboundSegments = [makeSegment(1)],
	inboundSegment,
}: {
	tripType?: "oneway" | "roundtrip";
	outboundSegments?: ReturnType<typeof makeSegment>[];
	inboundSegment?: ReturnType<typeof makeSegment>;
} = {}): ConfirmedFlightPayload {
	return {
		tripType,
		selectedCabinsOutbound: {},
		selectedCabinsInbound: {},
		flights: {
			outbound: makeBound(outboundSegments),
			...(inboundSegment ? { inbound: makeBound([inboundSegment]) } : {}),
		},
		grandTotalAmount: 0,
		currency: "JPY",
		language: "en",
	};
}

function makePassengerType(
	type: string,
	amount: number,
	actualQuantity: number,
	bundleQuantity: number
) {
	return { type, amount, actualQuantity, bundleQuantity, categoryId: 1 };
}

function makeBundle(bundleCode: string, passengerTypes: ReturnType<typeof makePassengerType>[]) {
	return { bundleCode, passengerTypes };
}

function makeOffers(
	data: Array<{ lfid: number; bundles: ReturnType<typeof makeBundle>[] }>
): NEXUZR004OffersBundleResponse {
	return { data } as NEXUZR004OffersBundleResponse;
}

// --- Tests ---

describe("getBundleSegment", () => {
	it("returns undefined when confirmedFlight is absent", () => {
		expect(getBundleSegment(undefined, "outbound")).toBeUndefined();
	});

	it("returns outbound segment[0] for outbound direction on oneway flow", () => {
		const flight = makeConfirmedFlight({ tripType: "oneway" });
		expect(getBundleSegment(flight, "outbound")).toBe(flight.flights.outbound.segments[0]);
	});

	it("returns outbound segment[0] for segment1 on connecting flow", () => {
		const flight = makeConfirmedFlight({
			tripType: "oneway",
			outboundSegments: [makeSegment(1, 1, "NRT", "BKK"), makeSegment(2, 2, "BKK", "SIN")],
		});
		expect(getBundleSegment(flight, "outbound")).toBe(flight.flights.outbound.segments[0]);
	});

	it("returns inbound segment[0] for segment2 on connecting flow with inbound", () => {
		const inboundSeg = makeSegment(10, 10, "SIN", "NRT");
		const flight = makeConfirmedFlight({
			tripType: "oneway",
			outboundSegments: [makeSegment(1, 1, "NRT", "BKK"), makeSegment(2, 2, "BKK", "SIN")],
			inboundSegment: inboundSeg,
		});
		expect(getBundleSegment(flight, "inbound")).toBe(inboundSeg);
	});

	it("falls back to outbound segment[1] for segment2 when inbound is absent", () => {
		const seg2 = makeSegment(2, 2, "BKK", "SIN");
		const flight = makeConfirmedFlight({
			tripType: "oneway",
			outboundSegments: [makeSegment(1, 1, "NRT", "BKK"), seg2],
		});
		expect(getBundleSegment(flight, "inbound")).toBe(seg2);
	});

	it("returns inbound segment[0] for inbound direction on roundtrip flow with inbound", () => {
		const inboundSeg = makeSegment(10, 10, "SIN", "NRT");
		const flight = makeConfirmedFlight({
			tripType: "roundtrip",
			inboundSegment: inboundSeg,
		});
		expect(getBundleSegment(flight, "inbound")).toBe(inboundSeg);
	});

	it("falls back to outbound segment[0] for inbound direction on roundtrip when inbound absent", () => {
		const flight = makeConfirmedFlight({ tripType: "roundtrip" });
		expect(getBundleSegment(flight, "inbound")).toBe(flight.flights.outbound.segments[0]);
	});
});

describe("getBundleName", () => {
	it("returns correct names for known bundle codes", () => {
		expect(getBundleName("NOBN")).toBe("No Bundle");
		expect(getBundleName("FLBF")).toBe("Flex Biz");
		expect(getBundleName("PREM")).toBe("Premium");
		expect(getBundleName("VALB")).toBe("Value");
	});
});

describe("getAvailableBundleIds", () => {
	it("returns null when bundleOffersData is absent", () => {
		const flight = makeConfirmedFlight();
		expect(getAvailableBundleIds(undefined, flight, "outbound")).toBeNull();
	});

	it("returns null when confirmedFlight is absent", () => {
		expect(getAvailableBundleIds(makeOffers([]), undefined, "outbound")).toBeNull();
	});

	it("returns empty set when no offers match segment lfid", () => {
		const flight = makeConfirmedFlight({ outboundSegments: [makeSegment(99)] });
		const offers = makeOffers([{ lfid: 1, bundles: [makeBundle("VALB", [])] }]);
		expect(getAvailableBundleIds(offers, flight, "outbound")).toEqual(new Set());
	});

	it("returns bundle IDs for single matching segment", () => {
		const flight = makeConfirmedFlight({ outboundSegments: [makeSegment(1)] });
		const offers = makeOffers([
			{ lfid: 1, bundles: [makeBundle("VALB", []), makeBundle("PREM", [])] },
		]);
		expect(getAvailableBundleIds(offers, flight, "outbound")).toEqual(new Set(["VALB", "PREM"]));
	});

	it("returns intersection of bundle IDs across multiple matching rows", () => {
		const flight = makeConfirmedFlight({ outboundSegments: [makeSegment(1)] });
		const offers = makeOffers([
			{ lfid: 1, bundles: [makeBundle("VALB", []), makeBundle("PREM", [])] },
			{ lfid: 1, bundles: [makeBundle("VALB", [])] },
		]);
		const result = getAvailableBundleIds(offers, flight, "outbound");
		expect(result).toEqual(new Set(["VALB"]));
		expect(result?.has("PREM")).toBe(false);
	});
});

describe("isBundleUnavailable", () => {
	it("returns false for NOBN regardless of available set", () => {
		expect(isBundleUnavailable("NOBN", new Set())).toBe(false);
	});

	it("returns false when availableBundleIds is null", () => {
		expect(isBundleUnavailable("VALB", null)).toBe(false);
	});

	it("returns true when bundle is not in the available set", () => {
		expect(isBundleUnavailable("VALB", new Set(["PREM"]))).toBe(true);
	});

	it("returns false when bundle is in the available set", () => {
		expect(isBundleUnavailable("VALB", new Set(["VALB"]))).toBe(false);
	});
});

describe("isAllBundlesUnavailable", () => {
	const offers = makeOffers([{ lfid: 1, bundles: [] }]);

	it("returns true when error contains BUNDLE_UNAVAILABLE_ERROR_CODE", () => {
		expect(isAllBundlesUnavailable(offers, new Set(["VALB"]), "NEXUZR004E003")).toBe(true);
	});

	it("is case-insensitive for the error code check", () => {
		expect(isAllBundlesUnavailable(offers, new Set(["VALB"]), "nexuzr004e003")).toBe(true);
	});

	it("returns false when bundleOffersData is absent", () => {
		expect(isAllBundlesUnavailable(undefined, new Set(["VALB"]))).toBe(false);
	});

	it("returns false when availableBundleIds is null", () => {
		expect(isAllBundlesUnavailable(offers, null)).toBe(false);
	});

	it("returns true when available set contains only NOBN", () => {
		expect(isAllBundlesUnavailable(offers, new Set(["NOBN"]))).toBe(true);
	});

	it("returns true when available set is empty", () => {
		expect(isAllBundlesUnavailable(offers, new Set())).toBe(true);
	});

	it("returns false when available set has at least one sellable bundle", () => {
		expect(isAllBundlesUnavailable(offers, new Set(["NOBN", "VALB"]))).toBe(false);
	});
});

describe("getUnavailableBundleIds", () => {
	it("returns empty array when availableBundleIds is null", () => {
		expect(getUnavailableBundleIds(["VALB"], null)).toEqual([]);
	});

	it("filters out unavailable bundle IDs", () => {
		expect(getUnavailableBundleIds(["VALB", "PREM"], new Set(["PREM"]))).toEqual(["VALB"]);
	});
});

describe("getBundleCapacities", () => {
	it("returns null when params are missing", () => {
		expect(getBundleCapacities(undefined, undefined, "outbound")).toBeNull();
		expect(getBundleCapacities(makeOffers([]), undefined, "outbound")).toBeNull();
	});

	it("returns empty map when no matching segments", () => {
		const flight = makeConfirmedFlight({ outboundSegments: [makeSegment(99)] });
		const offers = makeOffers([{ lfid: 1, bundles: [] }]);
		expect(getBundleCapacities(offers, flight, "outbound")).toEqual(new Map());
	});

	it("skips bundles with no adult passenger type", () => {
		const flight = makeConfirmedFlight({ outboundSegments: [makeSegment(1)] });
		const offers = makeOffers([
			{
				lfid: 1,
				bundles: [makeBundle("VALB", [makePassengerType("child", 1000, 5, 5)])],
			},
		]);
		expect(getBundleCapacities(offers, flight, "outbound")).toEqual(new Map());
	});

	it("uses minimum of actualQuantity and bundleQuantity for capacity", () => {
		const flight = makeConfirmedFlight({ outboundSegments: [makeSegment(1)] });
		const offers = makeOffers([
			{
				lfid: 1,
				bundles: [makeBundle("VALB", [makePassengerType("adult", 1000, 3, 5)])],
			},
		]);
		const result = getBundleCapacities(offers, flight, "outbound");
		expect(result?.get("VALB" as any)).toBe(3);
	});

	it("takes minimum capacity across multiple matching rows for same bundle", () => {
		const flight = makeConfirmedFlight({ outboundSegments: [makeSegment(1)] });
		const offers = makeOffers([
			{
				lfid: 1,
				bundles: [makeBundle("VALB", [makePassengerType("adult", 1000, 5, 5)])],
			},
			{
				lfid: 1,
				bundles: [makeBundle("VALB", [makePassengerType("ADT", 1000, 2, 5)])],
			},
		]);
		const result = getBundleCapacities(offers, flight, "outbound");
		expect(result?.get("VALB" as any)).toBe(2);
	});
});

describe("getBundlePrices", () => {
	it("returns {NOBN: 0} when bundleOffersData is absent", () => {
		const flight = makeConfirmedFlight();
		expect(getBundlePrices(undefined, flight, "outbound")).toEqual({ NOBN: 0 });
	});

	it("returns {NOBN: 0} when confirmedFlight is absent", () => {
		expect(getBundlePrices(makeOffers([]), undefined, "outbound")).toEqual({ NOBN: 0 });
	});

	it("returns {NOBN: 0} when no segment matches", () => {
		const flight = makeConfirmedFlight({ outboundSegments: [makeSegment(99)] });
		const offers = makeOffers([{ lfid: 1, bundles: [] }]);
		expect(getBundlePrices(offers, flight, "outbound")).toEqual({ NOBN: 0 });
	});

	it("extracts adult prices and includes NOBN as zero", () => {
		const flight = makeConfirmedFlight({ outboundSegments: [makeSegment(1)] });
		const offers = makeOffers([
			{
				lfid: 1,
				bundles: [
					makeBundle("VALB", [makePassengerType("adult", 5000, 5, 5)]),
					makeBundle("PREM", [makePassengerType("child", 3000, 3, 3)]),
				],
			},
		]);
		expect(getBundlePrices(offers, flight, "outbound")).toEqual({ NOBN: 0, VALB: 5000 });
	});
});

describe("getLocaleFromParam", () => {
	it("returns first element of array when array is provided", () => {
		expect(getLocaleFromParam(["ja", "en"])).toBe("ja");
	});

	it("falls back to en when array is empty", () => {
		expect(getLocaleFromParam([])).toBe("en");
	});

	it("returns string param directly", () => {
		expect(getLocaleFromParam("ja")).toBe("ja");
	});

	it("returns en when param is undefined", () => {
		expect(getLocaleFromParam(undefined)).toBe("en");
	});
});

describe("isAdultPassengerTypeCode", () => {
	it("returns true for adult and ADT (case-insensitive)", () => {
		expect(isAdultPassengerTypeCode("adult")).toBe(true);
		expect(isAdultPassengerTypeCode("ADULT")).toBe(true);
		expect(isAdultPassengerTypeCode("adt")).toBe(true);
		expect(isAdultPassengerTypeCode("ADT")).toBe(true);
	});

	it("returns false for non-adult codes", () => {
		expect(isAdultPassengerTypeCode("child")).toBe(false);
		expect(isAdultPassengerTypeCode("infant")).toBe(false);
	});

	it("returns false for undefined or empty string", () => {
		expect(isAdultPassengerTypeCode(undefined)).toBe(false);
		expect(isAdultPassengerTypeCode("")).toBe(false);
	});
});

describe("getPassengerDisplayName", () => {
	it("builds full name as lastName firstName middleName", () => {
		expect(
			getPassengerDisplayName({ lastName: "Tanaka", firstName: "Yuki", middleName: "A" }, 0)
		).toBe("Tanaka Yuki A");
	});

	it("omits missing name parts", () => {
		expect(getPassengerDisplayName({ firstName: "Yuki" }, 0)).toBe("Yuki");
	});

	it("falls back to Passenger N+1 when all name fields are empty or absent", () => {
		expect(getPassengerDisplayName({}, 2)).toBe("Passenger 3");
		expect(getPassengerDisplayName({ firstName: "", lastName: "" }, 0)).toBe("Passenger 1");
	});
});

describe("isRouteConnectedToAirport", () => {
	it("returns false when confirmedFlight is absent", () => {
		expect(isRouteConnectedToAirport(undefined, "NRT")).toBe(false);
	});

	it("returns true when airport is origin of outbound segment", () => {
		const flight = makeConfirmedFlight({ outboundSegments: [makeSegment(1, 1, "NRT", "TYO")] });
		expect(isRouteConnectedToAirport(flight, "NRT")).toBe(true);
	});

	it("returns true when airport is destination of outbound segment", () => {
		const flight = makeConfirmedFlight({ outboundSegments: [makeSegment(1, 1, "NRT", "SIN")] });
		expect(isRouteConnectedToAirport(flight, "SIN")).toBe(true);
	});

	it("returns true when airport matches inbound segment", () => {
		const flight = makeConfirmedFlight({
			tripType: "roundtrip",
			inboundSegment: makeSegment(10, 10, "SIN", "NRT"),
		});
		expect(isRouteConnectedToAirport(flight, "SIN")).toBe(true);
	});

	it("returns false when airport is not in any segment", () => {
		const flight = makeConfirmedFlight({ outboundSegments: [makeSegment(1, 1, "NRT", "TYO")] });
		expect(isRouteConnectedToAirport(flight, "BKK")).toBe(false);
	});
});

describe("applyBundleToAll", () => {
	it("applies bundle to all passengers when capacity is null", () => {
		const onChange = vi.fn();
		const passengers: PassengerEntry[] = [
			{ kind: "passenger", id: "p1", name: "A", icon: null },
			{ kind: "passenger", id: "p2", name: "B", icon: null },
		];
		applyBundleToAll(passengers, "VALB", null, onChange);
		expect(onChange).toHaveBeenCalledWith("p1", "VALB");
		expect(onChange).toHaveBeenCalledWith("p2", "VALB");
	});

	it("assigns NOBN to passengers beyond capacity", () => {
		const onChange = vi.fn();
		const passengers: PassengerEntry[] = [
			{ kind: "passenger", id: "p1", name: "A", icon: null },
			{ kind: "passenger", id: "p2", name: "B", icon: null },
		];
		applyBundleToAll(passengers, "VALB", 1, onChange);
		expect(onChange).toHaveBeenCalledWith("p1", "VALB");
		expect(onChange).toHaveBeenCalledWith("p2", "NOBN");
	});

	it("assigns NOBN to all sub-passengers in unavailable-group entries", () => {
		const onChange = vi.fn();
		const passengers: PassengerEntry[] = [
			{
				kind: "unavailable-group",
				id: "g1",
				message: "unavailable",
				passengers: [
					{ id: "p3", name: "C", icon: null },
					{ id: "p4", name: "D", icon: null },
				],
			},
		];
		applyBundleToAll(passengers, "VALB", null, onChange);
		expect(onChange).toHaveBeenCalledWith("p3", "NOBN");
		expect(onChange).toHaveBeenCalledWith("p4", "NOBN");
	});
});

describe("buildSelectedBundle", () => {
	const passengers = [{ id: "p1" }, { id: "p2" }] as any;

	it("builds payload using outbound selection for outbound direction", () => {
		const flight = makeConfirmedFlight({ outboundSegments: [makeSegment(1, 5)] });
		const result = buildSelectedBundle({
			passengers,
			confirmedFlight: flight,
			outbound: { p1: "VALB", p2: "PREM" },
			inbound: {},
			direction: "outbound",
		});
		expect(result).toEqual({
			passengers: [
				{ id: "p1", bundles: [{ lfid: 1, pfid: 5, bundleCode: "VALB" }] },
				{ id: "p2", bundles: [{ lfid: 1, pfid: 5, bundleCode: "PREM" }] },
			],
		});
	});

	it("builds payload using inbound selection for inbound direction", () => {
		const inboundSeg = makeSegment(10, 20, "SIN", "NRT");
		const flight = makeConfirmedFlight({ tripType: "roundtrip", inboundSegment: inboundSeg });
		const result = buildSelectedBundle({
			passengers,
			confirmedFlight: flight,
			outbound: {},
			inbound: { p1: "PREM", p2: null },
			direction: "inbound",
		});
		expect(result).toEqual({
			passengers: [
				{ id: "p1", bundles: [{ lfid: 10, pfid: 20, bundleCode: "PREM" }] },
				{ id: "p2", bundles: [{ lfid: 10, pfid: 20, bundleCode: "NOBN" }] },
			],
		});
	});

	it("throws when no segment can be resolved", () => {
		const flight = makeConfirmedFlight({ outboundSegments: [] });
		expect(() =>
			buildSelectedBundle({
				passengers,
				confirmedFlight: flight,
				outbound: {},
				inbound: {},
				direction: "outbound",
			})
		).toThrow("Unable to build selected bundles: stage segment is missing");
	});
});
