import { describe, expect, it } from "vitest";
import type { FlightDisplayItem } from "@/types/flight-selection/flight-selection.types";
import {
	getConnectingFlightSelectionErrors,
	isOutboundSelectionIncomplete,
} from "./flight-selection-utils";

describe("flight-selection-utils", () => {
	const buildFlightDisplayItem = (
		id: string,
		segmentCount: number,
		isConnectingFlight = true
	): FlightDisplayItem => ({
		id,
		departureTime: "10:00",
		departureCity: "NRT",
		arrivalTime: "14:00",
		arrivalCity: "SIN",
		flightNumber: "ZG001",
		duration: "6h",
		overallFlightTime: "6h",
		standardPrices: undefined,
		zipPrices: undefined,
		segments: Array.from({ length: segmentCount }, (_, index) => ({
			departureTime: "10:00",
			departureCity: `C${index}`,
			arrivalTime: "11:00",
			arrivalCity: `C${index + 1}`,
			flightNumber: `ZG00${index + 1}`,
			duration: "1h",
		})),
		fares: [],
		isConnectingFlight,
	});

	it("detects incomplete outbound selections", () => {
		expect(isOutboundSelectionIncomplete({}, [buildFlightDisplayItem("f1", 2)])).toBe(true);
		expect(
			isOutboundSelectionIncomplete({ "f1-cabin": "selected" }, [buildFlightDisplayItem("f1", 2)])
		).toBe(false);
		expect(
			isOutboundSelectionIncomplete({ "f1-segment-0": "selected" }, [
				buildFlightDisplayItem("f1", 2),
			])
		).toBe(true);
		expect(
			isOutboundSelectionIncomplete({ "f1-segment-0": "selected", "f1-segment-1": "selected" }, [
				buildFlightDisplayItem("f1", 2),
			])
		).toBe(false);
		expect(
			isOutboundSelectionIncomplete({ "-segment-0": "selected" }, [buildFlightDisplayItem("f1", 2)])
		).toBe(false);
	});

	it("builds connecting-flight selection errors", () => {
		const t = (key: string, values?: Record<string, string | number | Date>) =>
			values ? `${key}:${values.number}` : key;

		expect(
			getConnectingFlightSelectionErrors(
				[buildFlightDisplayItem("f1", 2), buildFlightDisplayItem("f2", 2)],
				{},
				t
			)
		).toEqual([
			{ groupId: "f1", message: "flight_selection_error_label" },
			{ groupId: "f2", message: "flight_selection_error_label" },
		]);

		expect(
			getConnectingFlightSelectionErrors(
				[buildFlightDisplayItem("f1", 3)],
				{ "f1-segment-0": "selected", "f1-segment-2": "selected" },
				t
			)
		).toEqual([{ groupId: "f1", message: "segment_selection_error_label:2" }]);

		expect(
			getConnectingFlightSelectionErrors(
				[buildFlightDisplayItem("f1", 2)],
				{ "f1-segment-0": "selected", "f1-segment-1": "selected" },
				t
			)
		).toEqual([]);
	});
});
