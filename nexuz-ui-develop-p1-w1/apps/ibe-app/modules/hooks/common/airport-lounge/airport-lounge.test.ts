import "@testing-library/jest-dom/vitest";
import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
	getAirportLoungeTotalAmount,
	getSeeMoreDescriptionText,
	getSeeMoreItems,
	useAirportLoungePassengerSelection,
} from "./airport-lounge";

const mockOrderedPassengers: any[] = [];
const mockSavedPassengers: any[] = [];

vi.mock("@/modules/hooks/common/passenger-order/passenger-order", () => ({
	usePassengerOrder: () => ({
		orderedPassengersWithNames: mockOrderedPassengers,
	}),
}));

vi.mock("@/store/hooks", () => ({
	useAppSelector: () => mockSavedPassengers,
}));

vi.mock("@/store/slices/passenger/passenger.slice", () => ({
	selectPassengers: vi.fn(),
}));

describe("getSeeMoreItems", () => {
	it("returns all items when showFull is true", () => {
		const items = [1, 2, 3, 4];

		expect(getSeeMoreItems(items, true, 2)).toEqual([1, 2, 3, 4]);
	});

	it("returns limited items when showFull is false", () => {
		expect(getSeeMoreItems([1, 2, 3, 4], false, 2)).toEqual([1, 2]);
	});

	it("returns empty array when initialCount is 0", () => {
		expect(getSeeMoreItems([1, 2, 3], false, 0)).toEqual([]);
	});

	it("returns empty array when initialCount is negative", () => {
		expect(getSeeMoreItems([1, 2, 3], false, -5)).toEqual([]);
	});

	it("returns empty array when items are empty", () => {
		expect(getSeeMoreItems([], false, 2)).toEqual([]);
	});

	it("returns all items when initialCount exceeds length", () => {
		expect(getSeeMoreItems([1, 2], false, 10)).toEqual([1, 2]);
	});
});

describe("getSeeMoreDescriptionText", () => {
	it("returns full text when showFull is true", () => {
		expect(getSeeMoreDescriptionText("Hello World", true, 5)).toEqual({
			text: "Hello World",
			isTruncated: false,
		});
	});

	it("returns full text when description length equals preview length", () => {
		expect(getSeeMoreDescriptionText("Hello", false, 5)).toEqual({
			text: "Hello",
			isTruncated: false,
		});
	});

	it("returns full text when description is shorter than preview length", () => {
		expect(getSeeMoreDescriptionText("Hey", false, 5)).toEqual({
			text: "Hey",
			isTruncated: false,
		});
	});

	it("returns truncated text when description is longer than preview length", () => {
		expect(getSeeMoreDescriptionText("Hello World", false, 5)).toEqual({
			text: "Hello...",
			isTruncated: true,
		});
	});

	it("returns truncated text for long descriptions", () => {
		expect(getSeeMoreDescriptionText("1234567890", false, 3)).toEqual({
			text: "123...",
			isTruncated: true,
		});
	});

	it("handles preview length of 0", () => {
		expect(getSeeMoreDescriptionText("Hello", false, 0)).toEqual({
			text: "...",
			isTruncated: true,
		});
	});
});

describe("getAirportLoungeTotalAmount", () => {
	it("returns 0 when no passengers are selected", () => {
		const passengers = [
			{
				checked: false,
				passengerTypeCode: "adt",
			},
		] as any;

		expect(getAirportLoungeTotalAmount(passengers, 1000)).toBe(0);
	});

	it("calculates amount for one selected passenger", () => {
		const passengers = [
			{
				checked: true,
				passengerTypeCode: "adt",
			},
		] as any;

		expect(getAirportLoungeTotalAmount(passengers, 1000)).toBe(1000);
	});

	it("calculates amount for multiple selected passengers", () => {
		const passengers = [
			{ checked: true, passengerTypeCode: "adt" },
			{ checked: true, passengerTypeCode: "adt" },
			{ checked: true, passengerTypeCode: "adt" },
		] as any;

		expect(getAirportLoungeTotalAmount(passengers, 1000)).toBe(3000);
	});

	it("ignores unselected passengers", () => {
		const passengers = [
			{ checked: true, passengerTypeCode: "adt" },
			{ checked: false, passengerTypeCode: "adt" },
		] as any;

		expect(getAirportLoungeTotalAmount(passengers, 1000)).toBe(1000);
	});

	it("handles undefined passengerTypeCode", () => {
		const passengers = [
			{
				checked: true,
			},
		] as any;

		expect(getAirportLoungeTotalAmount(passengers, 1000)).toBe(1000);
	});

	it("returns 0 when passenger list is empty", () => {
		expect(getAirportLoungeTotalAmount([], 1000)).toBe(0);
	});
});

describe("useAirportLoungePassengerSelection", () => {
	beforeEach(() => {
		mockOrderedPassengers.length = 0;
		mockSavedPassengers.length = 0;

		mockOrderedPassengers.push(
			{
				id: "1",
				firstName: "John",
				lastName: "Doe",
				passengerTypeCode: "adt",
			},
			{
				id: "2",
				firstName: "Jane",
				lastName: "Doe",
				passengerTypeCode: "adt",
				disabled: true,
			}
		);
	});

	it("creates passenger list", () => {
		const { result } = renderHook(() => useAirportLoungePassengerSelection());

		expect(result.current.airportLoungePassengers).toHaveLength(2);
	});

	it("toggles passenger checked state", () => {
		const { result } = renderHook(() => useAirportLoungePassengerSelection());

		act(() => {
			result.current.toggleAirportLoungePax("1", true);
		});

		expect(result.current.airportLoungePassengers.find((p) => p.id === "1")?.checked).toBe(true);
	});

	it("does not change passengers when id is not found", () => {
		const { result } = renderHook(() => useAirportLoungePassengerSelection());

		act(() => {
			result.current.toggleAirportLoungePax("999", true);
		});

		expect(result.current.airportLoungePassengers.every((p) => p.checked === false)).toBe(true);
	});

	it("selects all enabled passengers", () => {
		const { result } = renderHook(() => useAirportLoungePassengerSelection());

		act(() => {
			result.current.toggleAirportLoungeSelectAll(true);
		});

		expect(result.current.airportLoungePassengers.find((p) => p.id === "1")?.checked).toBe(true);
	});

	it("marks passenger checked when lounge service exists", () => {
		mockSavedPassengers.push({
			id: "1",
			services: {
				lounge: [
					{
						lfid: 100,
					},
				],
			},
		});

		const { result } = renderHook(() => useAirportLoungePassengerSelection());

		expect(result.current.airportLoungePassengers.find((p) => p.id === "1")?.checked).toBe(true);
	});

	it("checks passenger when segment lfid matches", () => {
		mockSavedPassengers.push({
			id: "1",
			services: {
				lounge: [
					{
						lfid: 200,
					},
				],
			},
		});

		const { result } = renderHook(() =>
			useAirportLoungePassengerSelection({
				segmentLfid: 200,
			})
		);

		expect(result.current.airportLoungePassengers.find((p) => p.id === "1")?.checked).toBe(true);
	});

	it("does not check passenger when segment lfid does not match", () => {
		mockSavedPassengers.push({
			id: "1",
			services: {
				lounge: [
					{
						lfid: 999,
					},
				],
			},
		});

		const { result } = renderHook(() =>
			useAirportLoungePassengerSelection({
				segmentLfid: 200,
			})
		);

		expect(result.current.airportLoungePassengers.find((p) => p.id === "1")?.checked).toBe(false);
	});
});
