/**
 * File: passenger.selector.test.ts
 * Description: Unit tests for passenger selectors.
 */

import { describe, expect, it } from "vitest";
import {
	selectHasIncompletePassengers,
	selectHasMultiplePassengers,
	selectPassengerList,
	selectPassengerState,
	selectPrimaryPassenger,
	selectPrimaryPassengerId,
} from "@/store/slices/customer-information/passenger-selector/passenger-selector";

describe("Passenger Selectors", () => {
	const mockState = {
		customerInformation: {
			values: [
				{
					id: "PAX001",
					passengerTypeCode: "adult",
					isCompleted: true,
				},
				{
					id: "PAX002",
					passengerTypeCode: "CHD",
					isCompleted: false,
				},
			],
		},
	} as any;

	it("selectPassengerState returns passenger slice", () => {
		expect(selectPassengerState(mockState)).toEqual(mockState.customerInformation);
	});

	it("selectPassengerList returns passenger values", () => {
		expect(selectPassengerList(mockState)).toEqual(mockState.customerInformation.values);
	});

	it("selectHasIncompletePassengers returns true when incomplete passenger exists", () => {
		expect(selectHasIncompletePassengers(mockState)).toBe(true);
	});

	it("selectHasIncompletePassengers returns false when all passengers are completed", () => {
		const state = {
			customerInformation: {
				values: [
					{
						id: "PAX001",
						passengerTypeCode: "adult",
						isCompleted: true,
					},
					{
						id: "PAX002",
						passengerTypeCode: "CHD",
						isCompleted: true,
					},
				],
			},
		} as any;

		expect(selectHasIncompletePassengers(state)).toBe(false);
	});

	it("selectHasMultiplePassengers returns true for multiple passengers", () => {
		expect(selectHasMultiplePassengers(mockState)).toBe(true);
	});

	it("selectHasMultiplePassengers returns false for single passenger", () => {
		const state = {
			customerInformation: {
				values: [
					{
						id: "PAX001",
						passengerTypeCode: "adult",
						isCompleted: true,
					},
				],
			},
		} as any;

		expect(selectHasMultiplePassengers(state)).toBe(false);
	});

	it("selectPrimaryPassenger returns adult passenger", () => {
		expect(selectPrimaryPassenger(mockState)).toEqual({
			id: "PAX001",
			passengerTypeCode: "adult",
			isCompleted: true,
		});
	});

	it("selectPrimaryPassenger returns undefined when no adult exists", () => {
		const state = {
			customerInformation: {
				values: [
					{
						id: "PAX002",
						passengerTypeCode: "CHD",
						isCompleted: true,
					},
				],
			},
		} as any;

		expect(selectPrimaryPassenger(state)).toBeUndefined();
	});

	it("selectPrimaryPassengerId returns primary passenger id", () => {
		expect(selectPrimaryPassengerId(mockState)).toBe("PAX001");
	});

	it("selectPrimaryPassengerId returns undefined when primary passenger does not exist", () => {
		const state = {
			customerInformation: {
				values: [
					{
						id: "PAX002",
						passengerTypeCode: "CHD",
						isCompleted: true,
					},
				],
			},
		} as any;

		expect(selectPrimaryPassengerId(state)).toBeUndefined();
	});

	it("handles empty passenger list", () => {
		const state = {
			customerInformation: {
				values: [],
			},
		} as any;

		expect(selectPassengerList(state)).toEqual([]);
		expect(selectHasIncompletePassengers(state)).toBe(false);
		expect(selectHasMultiplePassengers(state)).toBe(false);
		expect(selectPrimaryPassenger(state)).toBeUndefined();
		expect(selectPrimaryPassengerId(state)).toBeUndefined();
	});
});
