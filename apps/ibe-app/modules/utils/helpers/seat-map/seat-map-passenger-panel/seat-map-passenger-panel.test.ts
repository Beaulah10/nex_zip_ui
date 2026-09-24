import { describe, expect, it } from "vitest";
import {
	formatFullName,
	getBundleLabelFromCode,
	getFirstUnselectedPassengerIndex,
	getFlightCode,
	isBundleSeatEligible,
} from "./seat-map-passenger-panel";

describe("seat-map-passenger-panel helpers", () => {
	it("formats full names and falls back to an em dash when empty", () => {
		expect(formatFullName("ZIP", "TARO")).toBe("ZIP TARO");
		expect(formatFullName(" ZIP ", " TARO ")).toBe("ZIP TARO");
		expect(formatFullName("", "")).toBe("—");
	});

	it("detects seat-eligible bundle codes", () => {
		expect(isBundleSeatEligible("VALK")).toBe(true);
		expect(isBundleSeatEligible("VALN")).toBe(true);
		expect(isBundleSeatEligible("PRMK")).toBe(true);
		expect(isBundleSeatEligible("PREN")).toBe(true);
		expect(isBundleSeatEligible("FLBS")).toBe(true);
		expect(isBundleSeatEligible("NOBN")).toBe(false);
		expect(isBundleSeatEligible(undefined)).toBe(false);
	});

	it("maps all supported bundle variants to display labels", () => {
		const t = (key: string) => key;

		expect(getBundleLabelFromCode("NOBN", t)).toBe("bundle_labels_no_bundle");
		expect(getBundleLabelFromCode("VALB", t)).toBe("bundle_labels_value");
		expect(getBundleLabelFromCode("VALI", t)).toBe("bundle_labels_value");
		expect(getBundleLabelFromCode("VALK", t)).toBe("bundle_labels_value");
		expect(getBundleLabelFromCode("VALN", t)).toBe("bundle_labels_value");
		expect(getBundleLabelFromCode("VALT", t)).toBe("bundle_labels_value");
		expect(getBundleLabelFromCode("VALU", t)).toBe("bundle_labels_value");
		expect(getBundleLabelFromCode("PREM", t)).toBe("bundle_labels_premium");
		expect(getBundleLabelFromCode("PREN", t)).toBe("bundle_labels_premium");
		expect(getBundleLabelFromCode("PRMB", t)).toBe("bundle_labels_premium");
		expect(getBundleLabelFromCode("PRMI", t)).toBe("bundle_labels_premium");
		expect(getBundleLabelFromCode("PRMK", t)).toBe("bundle_labels_premium");
		expect(getBundleLabelFromCode("PRMT", t)).toBe("bundle_labels_premium");
		expect(getBundleLabelFromCode("FLBF", t)).toBe("bundle_labels_flex_biz");
		expect(getBundleLabelFromCode("FLBS", t)).toBe("bundle_labels_flex_biz");
		expect(getBundleLabelFromCode(undefined, t)).toBe("bundle_labels_no_bundle");
	});

	it("derives the flight code from the selected segment when available", () => {
		const confirmedFlight = {
			flights: {
				outbound: {
					segments: [{ origin: "NRT", destination: "BKK", lfid: 1 }],
				},
				inbound: {
					segments: [{ origin: "BKK", destination: "NRT", lfid: 2 }],
				},
			},
		} as Parameters<typeof getFlightCode>[0];

		expect(
			getFlightCode(confirmedFlight, "outbound", {
				origin: "SIN",
				destination: "NRT",
				lfid: 3,
			} as Parameters<typeof getFlightCode>[2])
		).toBe("SIN-NRT");
		expect(getFlightCode(confirmedFlight, "outbound")).toBe("NRT-BKK");
		expect(getFlightCode(confirmedFlight, "inbound")).toBe("BKK-NRT");
		expect(getFlightCode(undefined, "outbound")).toBe("");
	});
	it("returns the first passenger without a seat assignment", () => {
		expect(
			getFirstUnselectedPassengerIndex([
				{
					name: "Passenger 1",
					seatCode: "12A",
				},
				{
					name: "Passenger 2",
				},
				{
					name: "Passenger 3",
				},
			])
		).toBe(1);

		expect(
			getFirstUnselectedPassengerIndex([
				{
					name: "Passenger 1",
					seatCode: "12A",
				},
				{
					name: "Passenger 2",
					seatCode: "12B",
				},
				{
					name: "Passenger 3",
				},
			])
		).toBe(2);
	});

	it("returns the first passenger when all passengers have seats", () => {
		expect(
			getFirstUnselectedPassengerIndex([
				{
					name: "Passenger 1",
					seatCode: "12A",
				},
				{
					name: "Passenger 2",
					seatCode: "12B",
				},
				{
					name: "Passenger 3",
					seatCode: "12C",
				},
			])
		).toBe(0);
	});

	it("returns the first passenger when no passengers have seats", () => {
		expect(
			getFirstUnselectedPassengerIndex([
				{
					name: "Passenger 1",
				},
				{
					name: "Passenger 2",
				},
			])
		).toBe(0);
	});
});
