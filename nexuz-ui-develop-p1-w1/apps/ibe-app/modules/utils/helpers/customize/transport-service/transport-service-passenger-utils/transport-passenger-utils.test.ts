import { describe, expect, it } from "vitest";
import type { selectCustomersListItem } from "@/components/common/select-customers/select-customers";
import {
	getRouteAirportCode,
	getSelectedNonInfantCount,
	isInfantPassenger,
	isTransportPassengerListequal,
	toggleTransportPassengerSelection,
	toggleTransportSelectAllPassengers,
} from "@/modules/utils/helpers/customize/transport-service/transport-service-passenger-utils/transport-passenger-utils";

const makePassenger = (
	overrides: Partial<{
		id: string;
		name: string;
		category: string;
		passengerTypeCode: string;
		checked: boolean;
		price: number;
		mappedAdultId: string;
	}> = {}
): selectCustomersListItem => ({
	id: overrides.id ?? "p1",
	name: overrides.name ?? "Test Passenger",
	category: overrides.category ?? "Adult",
	price: overrides.price ?? 0,
	passengerTypeCode: overrides.passengerTypeCode ?? "adult",
	checked: overrides.checked ?? false,
	mappedAdultId: overrides.mappedAdultId,
});

describe("transport-passenger-utils", () => {
	it("classifies isInfantPassenger as a utility and detects infants by normalized code", () => {
		expect(isInfantPassenger("INF")).toBe(true);
		expect(isInfantPassenger("adult")).toBe(false);
		expect(isInfantPassenger(undefined)).toBe(false);
	});

	it("counts only checked non-infant passengers", () => {
		const result = getSelectedNonInfantCount([
			makePassenger({ id: "adult-checked", checked: true }),
			makePassenger({ id: "child-checked", passengerTypeCode: "childA", checked: true }),
			makePassenger({ id: "infant-checked", passengerTypeCode: "INF", checked: true }),
			makePassenger({ id: "adult-unchecked", checked: false }),
		]);

		expect(result).toBe(2);
	});

	it("returns the original array when toggling a missing passenger", () => {
		const passengers = [makePassenger()];
		const result = toggleTransportPassengerSelection({
			passengers,
			targetId: "missing",
			nextChecked: true,
			stockLimit: null,
		});

		expect(result).toBe(passengers);
	});

	it("returns the original array when toggling an infant passenger", () => {
		const infantPassenger = makePassenger({ passengerTypeCode: "INF" });
		const passengers = [infantPassenger];
		const result = toggleTransportPassengerSelection({
			passengers,
			targetId: infantPassenger.id,
			nextChecked: true,
			stockLimit: null,
		});

		expect(result).toBe(passengers);
	});

	it("unchecks only the targeted passenger when nextChecked is false", () => {
		const result = toggleTransportPassengerSelection({
			passengers: [
				makePassenger({ id: "p1", checked: true }),
				makePassenger({ id: "p2", checked: true }),
			],
			targetId: "p2",
			nextChecked: false,
			stockLimit: 1,
		});

		expect(result).toEqual([
			makePassenger({ id: "p1", checked: true }),
			makePassenger({ id: "p2", checked: false }),
		]);
	});

	it("checks mapped infant when its adult is selected", () => {
		const result = toggleTransportPassengerSelection({
			passengers: [
				makePassenger({ id: "adult-1", checked: false }),
				makePassenger({
					id: "infant-1",
					passengerTypeCode: "INF",
					mappedAdultId: "adult-1",
					checked: false,
				}),
			],
			targetId: "adult-1",
			nextChecked: true,
			stockLimit: null,
		});

		expect(result).toEqual([
			makePassenger({ id: "adult-1", checked: true }),
			makePassenger({
				id: "infant-1",
				passengerTypeCode: "INF",
				mappedAdultId: "adult-1",
				checked: true,
			}),
		]);
	});

	it("unchecks mapped infant when its adult is unselected", () => {
		const result = toggleTransportPassengerSelection({
			passengers: [
				makePassenger({ id: "adult-1", checked: true }),
				makePassenger({
					id: "infant-1",
					passengerTypeCode: "INF",
					mappedAdultId: "adult-1",
					checked: true,
				}),
			],
			targetId: "adult-1",
			nextChecked: false,
			stockLimit: null,
		});

		expect(result).toEqual([
			makePassenger({ id: "adult-1", checked: false }),
			makePassenger({
				id: "infant-1",
				passengerTypeCode: "INF",
				mappedAdultId: "adult-1",
				checked: false,
			}),
		]);
	});

	it("does not select a new passenger when stock limit is reached", () => {
		const passengers = [
			makePassenger({ id: "p1", checked: true }),
			makePassenger({ id: "p2", checked: false }),
		];
		const result = toggleTransportPassengerSelection({
			passengers,
			targetId: "p2",
			nextChecked: true,
			stockLimit: 1,
		});

		expect(result).toBe(passengers);
	});

	it("selects the targeted passenger when stock remains", () => {
		const result = toggleTransportPassengerSelection({
			passengers: [
				makePassenger({ id: "p1", checked: true }),
				makePassenger({ id: "p2", checked: false }),
			],
			targetId: "p2",
			nextChecked: true,
			stockLimit: 2,
		});

		expect(result[1]?.checked).toBe(true);
	});

	it("unchecks all non-infants when select-all is turned off", () => {
		const result = toggleTransportSelectAllPassengers({
			passengers: [
				makePassenger({ id: "adult", checked: true }),
				makePassenger({ id: "infant", passengerTypeCode: "INF", checked: true }),
			],
			nextChecked: false,
			stockLimit: 1,
		});

		expect(result).toEqual([
			makePassenger({ id: "adult", checked: false }),
			makePassenger({ id: "infant", passengerTypeCode: "INF", checked: true }),
		]);
	});

	it("checks all non-infants when select-all is turned on without a stock limit", () => {
		const result = toggleTransportSelectAllPassengers({
			passengers: [
				makePassenger({ id: "adult", checked: false }),
				makePassenger({ id: "child", passengerTypeCode: "childA", checked: false }),
				makePassenger({
					id: "infant",
					passengerTypeCode: "INF",
					mappedAdultId: "adult",
					checked: false,
				}),
			],
			nextChecked: true,
			stockLimit: null,
		});

		expect(result).toEqual([
			makePassenger({ id: "adult", checked: true }),
			makePassenger({ id: "child", passengerTypeCode: "childA", checked: true }),
			makePassenger({
				id: "infant",
				passengerTypeCode: "INF",
				mappedAdultId: "adult",
				checked: true,
			}),
		]);
	});

	it("respects remaining stock slots when selecting all", () => {
		const result = toggleTransportSelectAllPassengers({
			passengers: [
				makePassenger({ id: "already-selected", checked: true }),
				makePassenger({ id: "next-1", checked: false }),
				makePassenger({ id: "next-2", checked: false }),
				makePassenger({ id: "infant", passengerTypeCode: "INF", checked: false }),
			],
			nextChecked: true,
			stockLimit: 2,
		});

		expect(result).toEqual([
			makePassenger({ id: "already-selected", checked: true }),
			makePassenger({ id: "next-1", checked: true }),
			makePassenger({ id: "next-2", checked: false }),
			makePassenger({ id: "infant", passengerTypeCode: "INF", checked: false }),
		]);
	});

	it("returns false when passenger lists have different lengths", () => {
		expect(isTransportPassengerListequal([makePassenger()], [])).toBe(false);
	});

	it("returns false when one list has a sparse missing entry", () => {
		const currentPassengers = [makePassenger({ id: "p1" }), makePassenger({ id: "p2" })];
		const nextPassengers = [
			makePassenger({ id: "p1" }),
			undefined,
		] as unknown as typeof currentPassengers;

		expect(isTransportPassengerListequal(currentPassengers, nextPassengers)).toBe(false);
	});

	it("returns false when any compared passenger field differs", () => {
		expect(
			isTransportPassengerListequal(
				[makePassenger({ id: "p1", checked: false })],
				[makePassenger({ id: "p1", checked: true })]
			)
		).toBe(false);
	});

	it("returns true when compared passenger lists are identical", () => {
		const passengers = [makePassenger({ id: "p1", checked: true })];

		expect(
			isTransportPassengerListequal(passengers, [makePassenger({ id: "p1", checked: true })])
		).toBe(true);
	});

	it("normalizes optional route airport codes", () => {
		expect(getRouteAirportCode(" nrt ")).toBe("NRT");
		expect(getRouteAirportCode(undefined)).toBe("");
	});
});
