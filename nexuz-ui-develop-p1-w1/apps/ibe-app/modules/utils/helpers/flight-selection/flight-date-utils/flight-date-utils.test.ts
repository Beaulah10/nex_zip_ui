import { describe, expect, it } from "vitest";
import type { Flightdetails } from "@/types/flight-selection/flight-selection.types";
import { getFlightsByDate } from "./flight-date-utils";

const getDateFromMonthDay = (value: string): Date => {
	const [month, day] = value.split("-").map(Number);
	return new Date(2026, (month ?? 1) - 1, day ?? 1);
};

describe("flight-date-utils", () => {
	const buildFlight = (departureDateTime: string): Flightdetails => ({
		carrierCode: "ZG",
		origin: "NRT",
		destination: "SIN",
		transitTime: "",
		overallFlightTime: "",
		flightNumber: "001",
		scheduledDepartureArrivalDateTime: {
			departureDateTime,
			arrivalDateTime: "2026-07-21T14:00:00Z",
		},
		segments: [
			{
				carrierCode: "ZG",
				origin: "NRT",
				destination: "SIN",
				flightTime: "6h",
				flightNumber: "001",
				scheduledDepartureArrivalDateTime: {
					departureDateTime,
					arrivalDateTime: "2026-07-21T14:00:00Z",
				},
				previousDayIndicator: false,
				nextDayIndicator: false,
			},
		],
		isConnectingFlight: false,
		cabinFares: [],
		fares: [],
		segmentFaresList: [],
	});

	it("converts month-day strings into dates", () => {
		const date = getDateFromMonthDay("7-21");

		expect(date.getMonth()).toBe(6);
		expect(date.getDate()).toBe(21);
	});

	it("filters flights by departure date", () => {
		const flights = [
			buildFlight("2026-07-21T10:00:00Z"),
			buildFlight("2026-07-22T10:00:00Z"),
			buildFlight(""),
		];

		expect(getFlightsByDate(flights, "7-21")).toEqual([flights[0]]);
		expect(getFlightsByDate(flights, "7-22")).toEqual([flights[1]]);
		expect(getFlightsByDate(flights, "7-23")).toEqual([]);
	});

	it("handles incomplete month-day input", () => {
		const date = getDateFromMonthDay("7");

		expect(date.getMonth()).toBe(6);
		expect(date.getDate()).toBe(1);
	});
});
