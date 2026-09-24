import { describe, expect, it } from "vitest";
import {
	buildTransitInfo,
	getFlightItineraryProps,
	getSegmentItineraryProps,
} from "./confirmation-itinerary";

function makeSegment(overrides: Record<string, unknown> = {}) {
	return {
		origin: "NRT",
		destination: "SIN",
		carrierCode: "ZG",
		flightNumber: "123",
		flightTime: "07:05",
		scheduledDepartureArrivalDateTime: {
			departureDateTime: "2026-07-23T01:30:00Z",
			arrivalDateTime: "2026-07-23T08:35:00Z",
		},
		...overrides,
	} as any;
}

describe("confirmation-itinerary", () => {
	it("builds itinerary props for a single segment", () => {
		const segment = makeSegment();
		const airportMap = { NRT: "Narita International Airport", SIN: "Singapore Changi Airport" };

		expect(getSegmentItineraryProps(segment, "Leg 1", airportMap)).toEqual({
			departureAirportCode: "NRT",
			departureAirportName: "Narita International Airport",
			arrivalAirportCode: "SIN",
			arrivalAirportName: "Singapore Changi Airport",
			departureTime: "01:30",
			departureDate: "Thu, Jul 23, 2026",
			arrivalTime: "08:35",
			arrivalDate: "Thu, Jul 23, 2026",
			duration: "7h 5m",
			legLabel: "Leg 1",
			flightNumber: "ZG 123",
		});
	});

	it("returns blank formatted values for invalid dates", () => {
		const segment = makeSegment({
			scheduledDepartureArrivalDateTime: {
				departureDateTime: "bad-date",
				arrivalDateTime: "also-bad",
			},
			flightTime: "bad",
		});

		const result = getSegmentItineraryProps(segment, "Leg 1");
		expect(result.departureTime).toBe("");
		expect(result.departureDate).toBe("");
		expect(result.arrivalTime).toBe("");
		expect(result.arrivalDate).toBe("");
		expect(result.duration).toBe("");
	});

	it("builds transit info with layover and total journey durations", () => {
		const segment1 = makeSegment({
			destination: "BKK",
			scheduledDepartureArrivalDateTime: {
				departureDateTime: "2026-07-23T01:30:00Z",
				arrivalDateTime: "2026-07-23T05:00:00Z",
			},
		});
		const segment2 = makeSegment({
			origin: "BKK",
			destination: "SIN",
			scheduledDepartureArrivalDateTime: {
				departureDateTime: "2026-07-23T07:15:00Z",
				arrivalDateTime: "2026-07-23T11:45:00Z",
			},
		});

		expect(buildTransitInfo(segment1, segment2, { BKK: "Bangkok" })).toEqual({
			airportName: "Bangkok",
			airportCode: "BKK",
			transitDuration: "2 hours 15 minutes",
			totalDuration: "10 hours 15 mins",
		});
	});

	it("returns undefined when any transit timestamps are invalid", () => {
		const segment1 = makeSegment({
			scheduledDepartureArrivalDateTime: {
				departureDateTime: "bad",
				arrivalDateTime: "2026-07-23T05:00:00Z",
			},
		});

		expect(buildTransitInfo(segment1, makeSegment())).toBeUndefined();
	});

	it("builds itinerary props across the first and last bound segments", () => {
		const bound = {
			segments: [
				makeSegment({ origin: "NRT", destination: "BKK", flightTime: "06:15" }),
				makeSegment({
					origin: "BKK",
					destination: "SIN",
					flightTime: "02:45",
					scheduledDepartureArrivalDateTime: {
						departureDateTime: "2026-07-23T09:30:00Z",
						arrivalDateTime: "2026-07-23T12:15:00Z",
					},
				}),
			],
		} as any;

		expect(getFlightItineraryProps(bound, "Outbound", { NRT: "Narita", SIN: "Singapore" })).toEqual(
			{
				departureAirportCode: "NRT",
				departureAirportName: "Narita",
				arrivalAirportCode: "SIN",
				arrivalAirportName: "Singapore",
				departureTime: "01:30",
				departureDate: "Thu, Jul 23, 2026",
				arrivalTime: "12:15",
				arrivalDate: "Thu, Jul 23, 2026",
				duration: "9h 0m",
				legLabel: "Outbound",
				flightNumber: "ZG 123",
			}
		);
	});

	it("returns an empty-state itinerary when the bound has no segments", () => {
		expect(getFlightItineraryProps({ segments: [] } as any, "Outbound")).toEqual({
			departureAirportCode: "",
			departureAirportName: "",
			arrivalAirportCode: "",
			arrivalAirportName: "",
			departureTime: "",
			departureDate: "",
			arrivalTime: "",
			arrivalDate: "",
			duration: "",
			legLabel: "Outbound",
			flightNumber: "",
		});
	});
});
