import { describe, expect, it, vi } from "vitest";
import { getIpLocation } from "@/modules/services/flight-search/flight-search.services";
import type {
	FlightSearchFormValues,
	MessageAirport,
	RouteGroups,
} from "@/types/flight-search/flight-search.types";
import {
	buildFlightSelectionPath,
	DEFAULT_PASSENGER_COUNTS,
	getDestinations,
	getMessageAirportByIata,
	getPassengerCount,
	getRoundTripDestinations,
	getTooltipText,
	isConnectingFlightRoute,
	mapFormDataToFlightSearchApiParams,
} from "./flight-search.helpers";

const airportsFixture: MessageAirport[] = [
	{
		iata_code: "NRT",
		city: "Tokyo",
		airport: "Narita International Airport",
		country: "Japan",
		display_order: 1,
	},
	{
		iata_code: "SIN",
		city: "Singapore",
		airport: "Changi Airport",
		country: "Singapore",
		display_order: 2,
	},
];

const routesFixture: RouteGroups = [
	[{ origin: "NRT", destination: "ICN" }],
	[
		{ origin: "BKK", destination: "NRT" },
		{ origin: "NRT", destination: "SIN" },
	],
	[
		{ origin: "BKK", destination: "NRT" },
		{ origin: "NRT", destination: "YVR" },
	],
	[
		{ origin: "BKK", destination: "NRT" },
		{ origin: "NRT", destination: "BKK" },
	],
];

describe("flight-search helper", () => {
	it("finds airport by iata case-insensitively", () => {
		const airport = getMessageAirportByIata(airportsFixture, "nrt");
		expect(airport?.city).toBe("Tokyo");
	});
	it("returns round-trip destinations from direct segments", () => {
		expect(getRoundTripDestinations(routesFixture, "NRT")).toEqual(["ICN", "SIN", "YVR", "BKK"]);
	});
	it("returns one-way destinations from connected journeys", () => {
		expect(getDestinations(routesFixture, "BKK", "one-way")).toEqual(["NRT", "SIN", "YVR"]);
	});
	it("returns empty destinations when origin is missing", () => {
		expect(getDestinations(routesFixture, "", "round-trip")).toEqual([]);
	});
	it("calculates passenger totals", () => {
		expect(getPassengerCount(DEFAULT_PASSENGER_COUNTS)).toBe(1);
	});
	it("returns default origin when ip lookup cannot be resolved", async () => {
		const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue({
			ok: false,
			json: async () => ({ cloudfrontViewerCountry: "" }),
		} as Response);

		await expect(getIpLocation()).resolves.toBe("NRT");
		await expect(getIpLocation()).resolves.toBe("NRT");

		fetchSpy.mockRestore();
	});
	it("detects when one-way should become connecting flight", () => {
		expect(isConnectingFlightRoute("one-way", "BKK", "SIN")).toBe(true);
		expect(isConnectingFlightRoute("one-way", "NRT", "SIN")).toBe(false);
		expect(isConnectingFlightRoute("round-trip", "BKK", "SIN")).toBe(false);
	});
	it("builds tooltip text for arrival and departure", () => {
		expect(getTooltipText(true, "")).toContain("You have not selected an arrival destination");
		expect(getTooltipText(false, "NRT")).toContain("change the Departure Location");
	});
	it("maps form payload to API params for connecting flights", () => {
		const formData: FlightSearchFormValues = {
			tripType: "connecting-flight",
			origin: "BKK",
			destination: "SIN",
			travelDates: { outboundDate: "2026-10-01", returnDate: "2026-10-10" },
			passengerCounts: { adult: 2, childA: 1, childB: 0, childC: 1, infant: 1 },
			promotionCode: "",
		};
		expect(mapFormDataToFlightSearchApiParams(formData)).toEqual({
			routes: "BKK,NRT,SIN",
			departureDateFrom: "2026-10-01",
			adult: "2",
			childA: "1",
			childC: "1",
			infant: "1",
		});
	});
	it("maps round-trip payload with selected return date as departureDateTo", () => {
		const formData: FlightSearchFormValues = {
			tripType: "round-trip",
			origin: "NRT",
			destination: "ICN",
			travelDates: { outboundDate: "2026-10-01", returnDate: "2026-10-10" },
			passengerCounts: { adult: 1, childA: 0, childB: 0, childC: 0, infant: 0 },
			promotionCode: "",
		};
		expect(mapFormDataToFlightSearchApiParams(formData)).toEqual({
			routes: "NRT,ICN",
			departureDateFrom: "2026-10-01",
			departureDateTo: "2026-10-10",
			adult: "1",
		});
	});
	it("builds a local ibe-app flight selection URL in development", () => {
		const originalEnv = { ...process.env };

		process.env.NODE_ENV;
		delete process.env.NEXT_PUBLIC_IBE_APP_ORIGIN;

		Object.assign(process.env, {
			NODE_ENV: "development",
		});

		const formData: FlightSearchFormValues = {
			tripType: "round-trip",
			origin: "NRT",
			destination: "ICN",
			travelDates: {
				outboundDate: "2026-10-01",
				returnDate: "2026-10-10",
			},
			passengerCounts: {
				adult: 1,
				childA: 0,
				childB: 0,
				childC: 0,
				infant: 0,
			},
			promotionCode: "",
		};

		expect(buildFlightSelectionPath(formData, "en")).toBe(
			"http://localhost:3000/booking/en/flight-selection?routes=NRT%2CICN&departureDateFrom=2026-10-01&departureDateTo=2026-10-10&adult=1"
		);

		process.env = originalEnv;
	});
});
