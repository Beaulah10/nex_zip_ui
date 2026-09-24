import { describe, expect, it } from "vitest";
import {
	getAirportDisplayName,
	getAirportFullName,
	getAirportFullNameMap,
	getAirportName,
	getAirportRouteLabel,
	getConnectingAirportRoutes,
} from "./airport";

const airportFullNameMap = getAirportFullNameMap({
	flight_selection_page: {
		airports: [
			{ iata_code: "NRT", airport: "Narita International Airport" },
			{ iata_code: "BKK", airport: "Suvarnabhumi Airport" },
		],
	},
});

describe("airport helper", () => {
	it("resolves airport names and display names", () => {
		expect(getAirportName("nrt")).toBe("Tokyo");
		expect(getAirportName("zzz")).toBe("zzz");
		expect(getAirportName()).toBe("");

		expect(getAirportFullName("nrt", airportFullNameMap)).toBe("Narita International Airport");
		expect(getAirportFullName("bkk", airportFullNameMap)).toBe("Suvarnabhumi Airport");
		expect(getAirportFullName("zzz")).toBe("zzz");
		expect(getAirportFullName()).toBe("");

		expect(getAirportDisplayName("nrt")).toBe("Tokyo (NRT)");
		expect(getAirportDisplayName("zzz")).toBe("zzz");
		expect(getAirportDisplayName()).toBe("");
	});

	it("builds airport route labels", () => {
		expect(getAirportRouteLabel(undefined)).toBe("");
		expect(getAirportRouteLabel([])).toBe("");
		expect(
			getAirportRouteLabel([
				{ origin: "NRT", destination: "BKK" },
				{ origin: "BKK", destination: "SIN" },
			])
		).toBe("Tokyo (NRT) – Singapore (SIN)");
	});

	it("builds connecting airport routes for each itinerary shape", () => {
		expect(getConnectingAirportRoutes([], false)).toEqual([]);
		expect(getConnectingAirportRoutes(["NRT"], true)).toEqual([]);
		expect(getConnectingAirportRoutes(["NRT", "BKK"], false)).toEqual([
			{ origin: "NRT", destination: "BKK" },
		]);
		expect(getConnectingAirportRoutes(["NRT", "BKK"], true)).toEqual([
			{ origin: "NRT", destination: "BKK" },
			{ origin: "BKK", destination: "NRT" },
		]);
		expect(getConnectingAirportRoutes(["NRT", "BKK", "SIN"], false)).toEqual([
			{ origin: "NRT", destination: "SIN", via: ["BKK"] },
		]);
	});

	it("builds a full-name map from runtime messages", () => {
		expect(airportFullNameMap).toEqual({
			NRT: "Narita International Airport",
			BKK: "Suvarnabhumi Airport",
		});
	});
});
