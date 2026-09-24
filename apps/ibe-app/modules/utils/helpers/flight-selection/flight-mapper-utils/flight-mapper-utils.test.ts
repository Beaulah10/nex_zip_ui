import type { useTranslations } from "next-intl";
import { describe, expect, it } from "vitest";
import formatFlightTime from "@/modules/utils/helpers/flightTime-formatter";
import type {
	FareDetail,
	FareInfo,
	Flightdetails,
	FlightFare,
	FlightSelectionApiSegment,
	FlightSelectionBound,
} from "@/types/flight-selection/flight-selection.types";
import { getFlightDetailsFromBound, getFlightDisplayItems } from "./flight-mapper-utils.ts";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

// Cast to the complex useTranslations return type so the utilities accept it.
const t = ((key: string) => key) as unknown as ReturnType<typeof useTranslations>;

const buildFareDetail = (
	passengerType: string,
	fareAmtInclTax: number,
	availableSeat = 5
): FareDetail => ({
	fareId: 1,
	fareClass: "Y",
	fareBasisCode: "Y",
	passengerType,
	availableSeat,
	baseFareAmt: fareAmtInclTax * 0.8,
	fareAmt: fareAmtInclTax,
	baseFareAmtInclTax: fareAmtInclTax * 0.9,
	fareAmtInclTax,
	taxes: [],
});

const buildFareInfo = (
	cabin: string,
	passengerType = "adult",
	fareAmtInclTax = 10000,
	availableSeat = 5
): FareInfo => ({
	cabin,
	boundSummary: {
		totalFlightAmount: fareAmtInclTax,
		promotionalAmount: 0,
		passengerWiseFares: [{ passengerType, count: 2, amount: fareAmtInclTax }],
		totalTaxAmount: 0,
		taxBreakDown: [],
	},
	fareDetails: [buildFareDetail(passengerType, fareAmtInclTax, availableSeat)],
});

const buildApiSegment = (
	origin: string,
	destination: string,
	departureDateTime: string,
	arrivalDateTime: string,
	fareInfos: FareInfo[] = [],
	options?: {
		carrierCode?: string;
		flightNumber?: string;
		prevDay?: boolean;
		nextDay?: boolean;
	}
): FlightSelectionApiSegment => ({
	carrierCode: options?.carrierCode ?? "ZG",
	origin,
	destination,
	flightTime: "6:00",
	flightNumber: options?.flightNumber ?? "001",
	pfid: 1,
	lfid: 1,
	fareInfos,
	previousDayIndicator: options?.prevDay ?? false,
	nextDayIndicator: options?.nextDay ?? false,
	scheduledDepartureArrivalDateTime: {
		departureDateTime,
		departureDateTimeOffset: departureDateTime,
		arrivalDateTime,
		arrivalDateTimeOffset: arrivalDateTime,
	},
});

const buildBound = (
	segmentGroups: FlightSelectionApiSegment[][],
	date = "2026-08-21"
): FlightSelectionBound => ({
	airCalendarFare: [],
	flightsByDate: [
		{
			date,
			flights: segmentGroups.map((segments) => ({
				transitTime: "1:30",
				overallFlightTime: "8:30",
				segments,
			})),
		},
	],
});

const DEP = "2026-08-21T01:00:00.000Z";
const ARR = "2026-08-21T07:00:00.000Z";

// Derive expected time strings from the same Date conversion the SUT uses so
// the tests remain timezone-agnostic.
const expectedDepTime = new Date(DEP).toLocaleTimeString([], {
	hour: "2-digit",
	minute: "2-digit",
	hour12: false,
});
const expectedArrTime = new Date(ARR).toLocaleTimeString([], {
	hour: "2-digit",
	minute: "2-digit",
	hour12: false,
});

// ---------------------------------------------------------------------------
// getFlightDetailsFromBound
// ---------------------------------------------------------------------------

describe("getFlightDetailsFromBound", () => {
	it("returns an empty array when bound is undefined", () => {
		expect(getFlightDetailsFromBound(undefined)).toEqual([]);
	});

	it("returns an empty array when flightsByDate is empty", () => {
		expect(getFlightDetailsFromBound({ airCalendarFare: [], flightsByDate: [] })).toEqual([]);
	});

	it("maps a single-segment flight into a normalized Flightdetails object", () => {
		const segment = buildApiSegment("NRT", "SIN", DEP, ARR);
		const bound = buildBound([[segment]]);

		const [flight] = getFlightDetailsFromBound(bound);

		expect(flight?.carrierCode).toBe("ZG");
		expect(flight?.origin).toBe("NRT");
		expect(flight?.destination).toBe("SIN");
		expect(flight?.flightNumber).toBe("001");
		expect(flight?.scheduledDepartureArrivalDateTime.departureDateTime).toBe(DEP);
		expect(flight?.scheduledDepartureArrivalDateTime.arrivalDateTime).toBe(ARR);
		expect(flight?.isConnectingFlight).toBe(false);
	});

	it("marks a multi-segment flight as a connecting flight", () => {
		const seg1 = buildApiSegment("NRT", "ICN", DEP, ARR);
		const seg2 = buildApiSegment("ICN", "SIN", ARR, "2026-08-21T12:00:00.000Z");
		const bound = buildBound([[seg1, seg2]]);

		const [flight] = getFlightDetailsFromBound(bound);

		expect(flight?.isConnectingFlight).toBe(true);
	});

	it("uses the first segment's origin and the last segment's destination for connecting flights", () => {
		const seg1 = buildApiSegment("NRT", "ICN", DEP, ARR);
		const seg2 = buildApiSegment("ICN", "SIN", ARR, "2026-08-21T12:00:00.000Z");
		const bound = buildBound([[seg1, seg2]]);

		const [flight] = getFlightDetailsFromBound(bound);

		expect(flight?.origin).toBe("NRT");
		expect(flight?.destination).toBe("SIN");
	});

	it("derives arrivalDateTime from the last segment", () => {
		const lastArrival = "2026-08-21T15:00:00.000Z";
		const seg1 = buildApiSegment("NRT", "ICN", DEP, ARR);
		const seg2 = buildApiSegment("ICN", "SIN", ARR, lastArrival);
		const bound = buildBound([[seg1, seg2]]);

		const [flight] = getFlightDetailsFromBound(bound);

		expect(flight?.scheduledDepartureArrivalDateTime.arrivalDateTime).toBe(lastArrival);
	});

	it("extracts cabinFares from the first segment's fareInfos", () => {
		const fareInfo = buildFareInfo("STANDARD", "adult", 12000, 8);
		const seg = buildApiSegment("NRT", "SIN", DEP, ARR, [fareInfo]);
		const bound = buildBound([[seg]]);

		const [flight] = getFlightDetailsFromBound(bound);

		expect(flight?.cabinFares).toHaveLength(1);
		expect(flight?.cabinFares[0]?.cabin).toBe("STANDARD");
		expect(flight?.cabinFares[0]?.fares[0]?.fareAmtInclTax).toBe(12000);
	});

	it("derives standardSeatsLeft from the adult fare detail in the STANDARD cabin", () => {
		const fareInfo = buildFareInfo("STANDARD", "adult", 10000, 7);
		const seg = buildApiSegment("NRT", "SIN", DEP, ARR, [fareInfo]);
		const bound = buildBound([[seg]]);

		const [flight] = getFlightDetailsFromBound(bound);

		expect(flight?.standardSeatsLeft).toBe(7);
	});

	it("derives zipSeatsLeft from the ZIPFULLFLAT cabin", () => {
		const fareInfo = buildFareInfo("ZIPFULLFLAT", "adult", 20000, 3);
		const seg = buildApiSegment("NRT", "SIN", DEP, ARR, [fareInfo]);
		const bound = buildBound([[seg]]);

		const [flight] = getFlightDetailsFromBound(bound);

		expect(flight?.zipSeatsLeft).toBe(3);
	});

	it("sets standardSeatsLeft to undefined when no STANDARD cabin exists", () => {
		const seg = buildApiSegment("NRT", "SIN", DEP, ARR, []);
		const bound = buildBound([[seg]]);

		const [flight] = getFlightDetailsFromBound(bound);

		expect(flight?.standardSeatsLeft).toBeUndefined();
	});

	it("builds segmentFaresList with one entry per segment", () => {
		const standardInfo = buildFareInfo("STANDARD", "adult", 10000);
		const zipInfo = buildFareInfo("ZIPFULLFLAT", "adult", 20000);
		const seg1 = buildApiSegment("NRT", "ICN", DEP, ARR, [standardInfo, zipInfo]);
		const seg2 = buildApiSegment("ICN", "SIN", ARR, "2026-08-21T12:00:00.000Z", [standardInfo]);
		const bound = buildBound([[seg1, seg2]]);

		const [flight] = getFlightDetailsFromBound(bound);

		expect(flight?.segmentFaresList).toHaveLength(2);
		expect(flight?.segmentFaresList[0]?.standard).toHaveLength(1);
		expect(flight?.segmentFaresList[0]?.zipFullFlat).toHaveLength(1);
		expect(flight?.segmentFaresList[1]?.standard).toHaveLength(1);
		expect(flight?.segmentFaresList[1]?.zipFullFlat).toHaveLength(0);
	});

	it("accumulates flights from multiple flightsByDate entries", () => {
		const seg = buildApiSegment("NRT", "SIN", DEP, ARR);
		const bound: FlightSelectionBound = {
			airCalendarFare: [],
			flightsByDate: [
				{
					date: "2026-08-21",
					flights: [{ transitTime: "", overallFlightTime: "", segments: [seg] }],
				},
				{
					date: "2026-08-22",
					flights: [
						{ transitTime: "", overallFlightTime: "", segments: [seg] },
						{ transitTime: "", overallFlightTime: "", segments: [seg] },
					],
				},
			],
		};

		expect(getFlightDetailsFromBound(bound)).toHaveLength(3);
	});

	it("falls back to empty strings for missing scheduledDepartureArrivalDateTime values", () => {
		// Provide a segment with no dateTime values set
		const seg: FlightSelectionApiSegment = {
			carrierCode: "",
			origin: "",
			destination: "",
			flightTime: "",
			flightNumber: "",
			pfid: 0,
			lfid: 0,
			fareInfos: [],
			previousDayIndicator: false,
			nextDayIndicator: false,
			// @ts-expect-error – intentionally omitting optional nested values
			scheduledDepartureArrivalDateTime: {},
		};
		const bound = buildBound([[seg]]);
		const [flight] = getFlightDetailsFromBound(bound);

		expect(flight?.scheduledDepartureArrivalDateTime.departureDateTime).toBe("");
		expect(flight?.scheduledDepartureArrivalDateTime.arrivalDateTime).toBe("");
	});

	it("falls back to first fareDetail availableSeat when no adult fare exists in a cabin", () => {
		// Covers getCabinSeatsLeft: `adultFare?.availableSeat ?? fareDetails[0]?.availableSeat`
		const fareInfo: FareInfo = {
			cabin: "STANDARD",
			boundSummary: {
				totalFlightAmount: 0,
				promotionalAmount: 0,
				passengerWiseFares: [],
				totalTaxAmount: 0,
				taxBreakDown: [],
			},
			fareDetails: [buildFareDetail("childA", 5000, 3)], // non-adult passenger
		};
		const seg = buildApiSegment("NRT", "SIN", DEP, ARR, [fareInfo]);
		const bound = buildBound([[seg]]);

		const [flight] = getFlightDetailsFromBound(bound);

		// No adult fare → falls back to fareDetails[0].availableSeat = 3
		expect(flight?.standardSeatsLeft).toBe(3);
	});

	it("sets passengerCount to 0 when no matching passengerWise entry exists for a fare detail", () => {
		// Covers `matchedPassenger?.count ?? 0` inside getFlightFares
		const fareInfo: FareInfo = {
			cabin: "STANDARD",
			boundSummary: {
				totalFlightAmount: 0,
				promotionalAmount: 0,
				passengerWiseFares: [], // no matching passenger entry
				totalTaxAmount: 0,
				taxBreakDown: [],
			},
			fareDetails: [buildFareDetail("adult", 10000, 5)],
		};
		const seg = buildApiSegment("NRT", "SIN", DEP, ARR, [fareInfo]);
		const bound = buildBound([[seg]]);

		const [flight] = getFlightDetailsFromBound(bound);

		expect(flight?.cabinFares[0]?.fares[0]?.passengerCount).toBe(0);
	});

	it("handles a FlightSelectionApiFlight with an empty segments array", () => {
		// Covers `firstSegment?.* ?? ""` branches in getFlightDetails (lines 86-111)
		const bound: FlightSelectionBound = {
			airCalendarFare: [],
			flightsByDate: [
				{
					date: "2026-08-21",
					flights: [{ transitTime: "", overallFlightTime: "", segments: [] }],
				},
			],
		};

		const [flight] = getFlightDetailsFromBound(bound);

		expect(flight?.carrierCode).toBe("");
		expect(flight?.origin).toBe("");
		expect(flight?.destination).toBe("");
		expect(flight?.flightNumber).toBe("");
		expect(flight?.scheduledDepartureArrivalDateTime.departureDateTime).toBe("");
		expect(flight?.scheduledDepartureArrivalDateTime.arrivalDateTime).toBe("");
		expect(flight?.isConnectingFlight).toBe(false);
	});

	it("handles a segment with a null scheduledDepartureArrivalDateTime in getDisplaySegment", () => {
		// Covers the `scheduledDepartureArrivalDateTime?.departureDateTime ?? ""` branch (lines 36-37)
		const bound: FlightSelectionBound = {
			airCalendarFare: [],
			flightsByDate: [
				{
					date: "2026-08-21",
					flights: [
						{
							transitTime: "",
							overallFlightTime: "",
							segments: [
								{
									carrierCode: "ZG",
									origin: "NRT",
									destination: "SIN",
									flightTime: "6:00",
									flightNumber: "001",
									pfid: 1,
									lfid: 1,
									fareInfos: [],
									previousDayIndicator: false,
									nextDayIndicator: false,
									// @ts-expect-error – testing null-safety branch
									scheduledDepartureArrivalDateTime: undefined,
								},
							],
						},
					],
				},
			],
		};

		const [flight] = getFlightDetailsFromBound(bound);

		expect(flight?.segments[0]?.scheduledDepartureArrivalDateTime.departureDateTime).toBe("");
		expect(flight?.segments[0]?.scheduledDepartureArrivalDateTime.arrivalDateTime).toBe("");
	});

	it("handles a FareInfo whose fareDetails is undefined in getCabinSeatsLeft", () => {
		// Covers `cabinFareInfo.fareDetails?.find(...)` null-safety branch (line 71)
		const fareInfoWithUndefinedDetails: FareInfo = {
			cabin: "STANDARD",
			boundSummary: {
				totalFlightAmount: 0,
				promotionalAmount: 0,
				passengerWiseFares: [],
				totalTaxAmount: 0,
				taxBreakDown: [],
			},
			// @ts-expect-error – testing null-safety branch for fareDetails
			fareDetails: undefined,
		};
		const seg = buildApiSegment("NRT", "SIN", DEP, ARR, [fareInfoWithUndefinedDetails]);
		const bound = buildBound([[seg]]);

		const [flight] = getFlightDetailsFromBound(bound);

		// getCabinSeatsLeft returns undefined when fareDetails is undefined
		expect(flight?.standardSeatsLeft).toBeUndefined();
	});

	it("sets previousDayIndicator and nextDayIndicator from each segment", () => {
		const seg = buildApiSegment("NRT", "SIN", DEP, ARR, [], {
			prevDay: false,
			nextDay: true,
		});
		const bound = buildBound([[seg]]);

		const [flight] = getFlightDetailsFromBound(bound);

		expect(flight?.segments[0]?.previousDayIndicator).toBe(false);
		expect(flight?.segments[0]?.nextDayIndicator).toBe(true);
	});
});

// ---------------------------------------------------------------------------
// getFlightDisplayItems
// ---------------------------------------------------------------------------

const buildFlightdetails = (
	override?: Partial<Flightdetails>,
	departureDateTime = DEP,
	arrivalDateTime = ARR
): Flightdetails => ({
	carrierCode: "ZG",
	origin: "NRT",
	destination: "SIN",
	flightTime: "6:00",
	transitTime: "1:30",
	overallFlightTime: "8:30",
	flightNumber: "001",
	scheduledDepartureArrivalDateTime: { departureDateTime, arrivalDateTime },
	segments: [
		{
			carrierCode: "ZG",
			origin: "NRT",
			destination: "SIN",
			flightTime: "6:00",
			flightNumber: "001",
			scheduledDepartureArrivalDateTime: { departureDateTime, arrivalDateTime },
			previousDayIndicator: false,
			nextDayIndicator: false,
		},
	],
	isConnectingFlight: false,
	cabinFares: [],
	fares: [],
	segmentFaresList: [],
	...override,
});

describe("getFlightDisplayItems", () => {
	it("returns an empty array when given no flights", () => {
		expect(getFlightDisplayItems([], "outbound", false, t)).toEqual([]);
	});

	it("prefixes outbound flight ids with 'flight-out-'", () => {
		const items = getFlightDisplayItems([buildFlightdetails()], "outbound", false, t);

		expect(items[0]?.id).toBe("flight-out-0");
	});

	it("prefixes inbound flight ids with 'flight-in-'", () => {
		const items = getFlightDisplayItems([buildFlightdetails()], "inbound", false, t);

		expect(items[0]?.id).toBe("flight-in-0");
	});

	it("formats departure and arrival times as HH:MM (24 h, no seconds)", () => {
		const items = getFlightDisplayItems([buildFlightdetails()], "outbound", false, t);

		expect(items[0]?.departureTime).toBe(expectedDepTime);
		expect(items[0]?.arrivalTime).toBe(expectedArrTime);
	});

	it("sets departureCity and arrivalCity from the flight's origin/destination", () => {
		const items = getFlightDisplayItems([buildFlightdetails()], "outbound", false, t);

		expect(items[0]?.departureCity).toBe("NRT");
		expect(items[0]?.arrivalCity).toBe("SIN");
	});

	it("builds the flightNumber as carrierCode + flightNumber", () => {
		const items = getFlightDisplayItems([buildFlightdetails()], "outbound", false, t);

		expect(items[0]?.flightNumber).toBe("ZG001");
	});

	it("formats the flight duration with formatFlightTime", () => {
		const items = getFlightDisplayItems([buildFlightdetails()], "outbound", false, t);

		expect(items[0]?.duration).toBe(formatFlightTime("6:00"));
	});

	it("sorts flights by departure time in ascending order", () => {
		const laterDep = "2026-08-21T08:00:00.000Z";
		const flights = [
			buildFlightdetails(undefined, laterDep, ARR),
			buildFlightdetails(undefined, DEP, ARR),
		];

		const items = getFlightDisplayItems(flights, "outbound", false, t);

		// Convert "HH:MM" to total minutes for comparison (mirrors the SUT's sort comparator)
		const toMinutes = (time: string) => {
			const [h = "0", m = "0"] = time.split(":");
			return Number(h) * 60 + Number(m);
		};

		expect(toMinutes(items[0]?.departureTime ?? "")).toBeLessThanOrEqual(
			toMinutes(items[1]?.departureTime ?? "")
		);
	});

	it("sets isZipDisabled to undefined for outbound flights", () => {
		const items = getFlightDisplayItems([buildFlightdetails()], "outbound", true, t);

		expect(items[0]?.isZipDisabled).toBeUndefined();
	});

	it("sets isZipDisabled to the hasYoungPassengers flag for inbound flights", () => {
		const withYoung = getFlightDisplayItems([buildFlightdetails()], "inbound", true, t);
		const withoutYoung = getFlightDisplayItems([buildFlightdetails()], "inbound", false, t);

		expect(withYoung[0]?.isZipDisabled).toBe(true);
		expect(withoutYoung[0]?.isZipDisabled).toBe(false);
	});

	it("uses raw transitTime for outbound and formatted transitTime for inbound", () => {
		const outItems = getFlightDisplayItems([buildFlightdetails()], "outbound", false, t);
		const inItems = getFlightDisplayItems([buildFlightdetails()], "inbound", false, t);

		// Outbound keeps the raw value; inbound formats it
		expect(outItems[0]?.transitTime).toBe("1:30");
		expect(inItems[0]?.transitTime).toBe(formatFlightTime("1:30"));
	});

	it("populates overallFlightTime for outbound and leaves it empty for inbound", () => {
		const outItems = getFlightDisplayItems([buildFlightdetails()], "outbound", false, t);
		const inItems = getFlightDisplayItems([buildFlightdetails()], "inbound", false, t);

		expect(outItems[0]?.overallFlightTime).toBe("8:30");
		expect(inItems[0]?.overallFlightTime).toBe("");
	});

	it("sets hasStandardCabin and hasZipFullFlat based on available cabin fares", () => {
		const withBothCabins = buildFlightdetails({
			cabinFares: [
				{ cabin: "STANDARD", fares: [] },
				{ cabin: "ZIPFULLFLAT", fares: [] },
			],
		});

		const [item] = getFlightDisplayItems([withBothCabins], "outbound", false, t);

		expect(item?.hasStandardCabin).toBe(true);
		expect(item?.hasZipFullFlat).toBe(true);
	});

	it("sets hasStandardCabin to false when the flight has no STANDARD cabin", () => {
		const noStandard = buildFlightdetails({
			cabinFares: [{ cabin: "ZIPFULLFLAT", fares: [] }],
		});

		const [item] = getFlightDisplayItems([noStandard], "outbound", false, t);

		expect(item?.hasStandardCabin).toBe(false);
		expect(item?.hasZipFullFlat).toBe(true);
	});

	it("sets standardPrices and zipPrices to undefined when cabin fares are empty", () => {
		const items = getFlightDisplayItems([buildFlightdetails()], "outbound", false, t);

		expect(items[0]?.standardPrices).toBeUndefined();
		expect(items[0]?.zipPrices).toBeUndefined();
	});

	it("populates standardPrices when a STANDARD cabin with fares is present", () => {
		const fare: FlightFare = {
			passengerType: "adult",
			count: 1,
			passengerCount: 1,
			fareAmtInclTax: 15000,
			amount: 15000,
		};
		const withStandard = buildFlightdetails({
			cabinFares: [{ cabin: "STANDARD", fares: [fare] }],
		});

		const [item] = getFlightDisplayItems([withStandard], "outbound", false, t);

		expect(item?.standardPrices).toBeDefined();
	});

	it("maps each flight segment into a display segment with formatted times", () => {
		const flight = buildFlightdetails({
			isConnectingFlight: true,
			segments: [
				{
					carrierCode: "ZG",
					origin: "NRT",
					destination: "ICN",
					flightTime: "2:30",
					flightNumber: "001",
					scheduledDepartureArrivalDateTime: { departureDateTime: DEP, arrivalDateTime: ARR },
					previousDayIndicator: false,
					nextDayIndicator: true,
				},
				{
					carrierCode: "ZG",
					origin: "ICN",
					destination: "SIN",
					flightTime: "6:00",
					flightNumber: "002",
					scheduledDepartureArrivalDateTime: {
						departureDateTime: ARR,
						arrivalDateTime: "2026-08-21T14:00:00.000Z",
					},
					previousDayIndicator: false,
					nextDayIndicator: false,
				},
			],
		});

		const [item] = getFlightDisplayItems([flight], "outbound", false, t);

		expect(item?.segments).toHaveLength(2);
		expect(item?.segments[0]?.departureCity).toBe("NRT");
		expect(item?.segments[0]?.arrivalCity).toBe("ICN");
		expect(item?.segments[0]?.nextDayIndicator).toBe(true);
		expect(item?.segments[1]?.departureCity).toBe("ICN");
		expect(item?.segments[1]?.arrivalCity).toBe("SIN");
	});

	it("carries nextDayIndicator from the first segment onto the display item", () => {
		const flight = buildFlightdetails({
			segments: [
				{
					carrierCode: "ZG",
					origin: "NRT",
					destination: "SIN",
					flightTime: "6:00",
					flightNumber: "001",
					scheduledDepartureArrivalDateTime: { departureDateTime: DEP, arrivalDateTime: ARR },
					previousDayIndicator: false,
					nextDayIndicator: true,
				},
			],
		});

		const [item] = getFlightDisplayItems([flight], "outbound", false, t);

		expect(item?.nextDayIndicator).toBe(true);
	});

	it("sets isConnectingFlight on the display item from the Flightdetails value", () => {
		const connecting = buildFlightdetails({ isConnectingFlight: true });
		const direct = buildFlightdetails({ isConnectingFlight: false });

		const [c] = getFlightDisplayItems([connecting], "outbound", false, t);
		const [d] = getFlightDisplayItems([direct], "outbound", false, t);

		expect(c?.isConnectingFlight).toBe(true);
		expect(d?.isConnectingFlight).toBe(false);
	});

	it("propagates standardSeatsLeft and zipSeatsLeft to display items", () => {
		const flight = buildFlightdetails({ standardSeatsLeft: 4, zipSeatsLeft: 2 });

		const [item] = getFlightDisplayItems([flight], "outbound", false, t);

		expect(item?.standardSeatsLeft).toBe(4);
		expect(item?.zipSeatsLeft).toBe(2);
	});

	it("uses empty string for duration when flightTime is undefined", () => {
		// Covers `flight.flightTime ?? ""` inside getFlightDisplayItems
		const flight = buildFlightdetails({ flightTime: undefined });

		const [item] = getFlightDisplayItems([flight], "outbound", false, t);

		expect(item?.duration).toBe("");
	});

	it("emits an empty inboundTransitTime string when the flight has no transitTime", () => {
		const noTransit = buildFlightdetails({ transitTime: "" });

		const [item] = getFlightDisplayItems([noTransit], "inbound", false, t);

		// formatFlightTime("") returns "" so inboundTransitTime = ""
		expect(item?.transitTime).toBe("");
	});
});
