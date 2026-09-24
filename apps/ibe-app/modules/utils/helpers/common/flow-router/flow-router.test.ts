import { describe, expect, it } from "vitest";
import {
	FLOW_ROUTE_SEQUENCE,
	getBookingDirectionFromStage,
	getBookingDirectionLabel,
	getBookingFlowType,
	getBookingStageRoute,
	getBookingStageSegment,
	getNextBookingFlowPath,
	getNextBookingFlowRoute,
	getPreviousBookingFlowPath,
	getPreviousBookingFlowRoute,
	isBookingStageSegment,
} from "@/modules/utils/helpers/common/flow-router/flow-router";
import type { ConfirmedFlightPayload } from "@/store/slices/flight-selection/flight-selection.slice";

const createConfirmedFlight = ({
	tripType,
	outboundSegments,
	hasInbound = false,
}: {
	tripType: "oneway" | "roundtrip";
	outboundSegments: number;
	hasInbound?: boolean;
}): Pick<ConfirmedFlightPayload, "tripType" | "flights"> =>
	({
		tripType,
		flights: {
			outbound: {
				segments: Array.from({ length: outboundSegments }, (_, index) => ({
					pfid: index,
					lfid: index,
					carrierCode: "ZG",
					origin: index === 0 ? "NRT" : "BKK",
					destination: index === outboundSegments - 1 ? "SIN" : "BKK",
					flightNumber: `ZG${index + 1}`,
					scheduledDepartureArrivalDateTime: {
						departureDateTime: "2026-07-23T10:00:00+09:00",
						departureDateTimeOffset: "+09:00",
						arrivalDateTime: "2026-07-23T15:00:00+09:00",
						arrivalDateTimeOffset: "+09:00",
					},
					flightTime: "05:00",
					selectedCabin: "economy",
					fareDetails: [],
				})),
				selectedFareInfos: [],
				passengerFareBreakdown: [],
				totalFlightAmount: 0,
			},
			...(hasInbound
				? {
						inbound: {
							segments: [
								{
									pfid: 10,
									lfid: 10,
									carrierCode: "ZG",
									origin: "SIN",
									destination: "NRT",
									flightNumber: "ZG10",
									scheduledDepartureArrivalDateTime: {
										departureDateTime: "2026-07-24T10:00:00+09:00",
										departureDateTimeOffset: "+09:00",
										arrivalDateTime: "2026-07-24T18:00:00+09:00",
										arrivalDateTimeOffset: "+09:00",
									},
									flightTime: "08:00",
									selectedCabin: "economy",
									fareDetails: [],
								},
							],
							selectedFareInfos: [],
							passengerFareBreakdown: [],
							totalFlightAmount: 0,
						},
					}
				: {}),
		},
	}) satisfies Pick<ConfirmedFlightPayload, "tripType" | "flights">;

describe("flow-router", () => {
	it("routes oneway bookings through outbound-only steps", () => {
		const confirmedFlight = createConfirmedFlight({
			tripType: "oneway",
			outboundSegments: 1,
		});

		expect(getBookingFlowType(confirmedFlight)).toBe("oneway");
		expect(
			getNextBookingFlowRoute({
				confirmedFlight,
				currentRoute: "flight-selection",
			})
		).toBe("bundles/outbound");
		expect(
			getNextBookingFlowRoute({
				confirmedFlight,
				currentRoute: "bundles/outbound",
			})
		).toBe("customize/outbound");
		expect(
			getNextBookingFlowPath({
				locale: "en",
				confirmedFlight,
				currentRoute: "extras/outbound",
			})
		).toBe("/en/customer-information");
	});

	it("routes roundtrip bookings through outbound and inbound steps", () => {
		const confirmedFlight = createConfirmedFlight({
			tripType: "roundtrip",
			outboundSegments: 1,
			hasInbound: true,
		});

		expect(getBookingFlowType(confirmedFlight)).toBe("roundtrip");
		expect(
			getNextBookingFlowRoute({
				confirmedFlight,
				currentRoute: "bundles/outbound",
			})
		).toBe("customize/outbound");
		expect(
			getNextBookingFlowRoute({
				confirmedFlight,
				currentRoute: "extras/outbound",
			})
		).toBe("bundles/inbound");
		expect(
			getNextBookingFlowRoute({
				confirmedFlight,
				currentRoute: "bundles/inbound",
			})
		).toBe("customize/inbound");
	});

	it("treats multi-segment outbound itineraries as connecting flows", () => {
		const confirmedFlight = createConfirmedFlight({
			tripType: "oneway",
			outboundSegments: 2,
		});

		expect(getBookingFlowType(confirmedFlight)).toBe("connecting");
		expect(
			getNextBookingFlowRoute({
				confirmedFlight,
				currentRoute: "flight-selection",
			})
		).toBe("bundles/segment1");
		expect(
			getNextBookingFlowRoute({
				confirmedFlight,
				currentRoute: "bundles/segment1",
			})
		).toBe("customize/segment1");
		expect(
			getNextBookingFlowRoute({
				confirmedFlight,
				currentRoute: "extras/segment1",
			})
		).toBe("bundles/segment2");
		expect(
			getNextBookingFlowPath({
				locale: "en",
				confirmedFlight,
				currentRoute: "extras/segment2",
			})
		).toBe("/en/customer-information");
	});

	it("falls back to customer-information when confirmed flight is unavailable", () => {
		expect(
			getNextBookingFlowPath({
				locale: "en",
				currentRoute: "flight-selection",
			})
		).toBe("/en/customer-information");
	});

	it("returns undefined for next route when current route is outside detected flow", () => {
		const confirmedFlight = createConfirmedFlight({
			tripType: "oneway",
			outboundSegments: 1,
		});

		expect(
			getNextBookingFlowRoute({
				confirmedFlight,
				currentRoute: "bundles/inbound",
			})
		).toBeUndefined();
	});

	it("returns undefined for next route when no confirmed flight is provided", () => {
		expect(
			getNextBookingFlowRoute({
				currentRoute: "flight-selection",
			})
		).toBeUndefined();
	});

	it("resolves previous route and path with default and custom fallback behavior", () => {
		const confirmedFlight = createConfirmedFlight({
			tripType: "roundtrip",
			outboundSegments: 1,
			hasInbound: true,
		});

		expect(
			getPreviousBookingFlowRoute({
				confirmedFlight,
				currentRoute: "customize/outbound",
			})
		).toBe("bundles/outbound");

		expect(
			getPreviousBookingFlowRoute({
				confirmedFlight,
				currentRoute: "flight-selection",
			})
		).toBeUndefined();

		expect(
			getPreviousBookingFlowPath({
				locale: "en",
				confirmedFlight,
				currentRoute: "flight-selection",
			})
		).toBe("/en/flight-selection");

		expect(
			getPreviousBookingFlowPath({
				locale: "en",
				confirmedFlight,
				currentRoute: "flight-selection",
				fallbackRoute: "customer-information",
			})
		).toBeUndefined();
	});

	it("exposes the configured route sequence for each flow type", () => {
		expect(FLOW_ROUTE_SEQUENCE.oneway.at(-1)).toBe("customer-information");
		expect(FLOW_ROUTE_SEQUENCE.roundtrip).toContain("extras/inbound");
		expect(FLOW_ROUTE_SEQUENCE.connecting).toContain("customize/segment2");
	});

	it("resolves stage labels, segments, and stage routes", () => {
		const confirmedFlight = createConfirmedFlight({
			tripType: "roundtrip",
			outboundSegments: 1,
			hasInbound: true,
		});

		expect(
			getBookingDirectionLabel({
				confirmedFlight,
				direction: "outbound",
			})
		).toBe("Outbound");
		expect(
			getBookingDirectionLabel({
				confirmedFlight: createConfirmedFlight({
					tripType: "oneway",
					outboundSegments: 2,
				}),
				direction: "inbound",
			})
		).toBe("Segment 2");
		expect(
			getBookingDirectionLabel({
				confirmedFlight,
				direction: "inbound",
			})
		).toBe("Inbound");
		expect(
			getBookingStageSegment({
				confirmedFlight: createConfirmedFlight({
					tripType: "oneway",
					outboundSegments: 2,
				}),
				direction: "outbound",
			})
		).toBe("segment1");
		expect(
			getBookingStageSegment({
				confirmedFlight,
				direction: "inbound",
			})
		).toBe("inbound");
		expect(getBookingDirectionFromStage("segment1")).toBe("outbound");
		expect(getBookingDirectionFromStage("segment2")).toBe("inbound");
		expect(getBookingDirectionFromStage("unknown")).toBeUndefined();
		expect(isBookingStageSegment("segment1")).toBe(true);
		expect(isBookingStageSegment("random")).toBe(false);
		expect(
			getBookingStageRoute({
				section: "extras",
				confirmedFlight,
				direction: "inbound",
			})
		).toBe("extras/inbound");
		expect(
			getBookingStageRoute({
				section: "bundles",
				confirmedFlight: createConfirmedFlight({
					tripType: "oneway",
					outboundSegments: 2,
				}),
				direction: "inbound",
			})
		).toBe("bundles/segment2");
	});
});
