import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useSeatSelection } from "./use-seat-selection";

const availableSeat = {
	code: "12A",
	column: "A",
	type: "Window",
	status: "central",
	isSeatAvailable: true,
	amount: 1000,
	serviceCode: "STOT",
} as const;

const secondAvailableSeat = {
	code: "12B",
	column: "B",
	type: "Middle",
	status: "front-tier",
	isSeatAvailable: true,
	amount: 2000,
	serviceCode: "STFW",
} as const;

const unavailableSeat = {
	code: "14C",
	column: "C",
	type: "Aisle",
	status: "not-selectable",
	isSeatAvailable: false,
	amount: 3000,
	serviceCode: "STNA",
} as const;

describe("useSeatSelection", () => {
	it("assigns seats, tracks totals and exposes lookup maps", () => {
		const { result } = renderHook(() => useSeatSelection(2));

		act(() => {
			result.current.handleSeatSelect(availableSeat);
		});

		expect(result.current.activePassengerIndex).toBe(1);
		expect(result.current.assignments.get(0)).toEqual({
			seatCode: "12A",
			amount: 1000,
			serviceCode: "STOT",
			seatType: "Window",
		});
		expect(result.current.assignedSeatToPassengerIndex).toEqual({ "12A": 0 });
		expect(result.current.totalSeatCost).toBe(1000);

		act(() => {
			result.current.handleSeatSelect(secondAvailableSeat);
		});

		expect(result.current.activePassengerIndex).toBe(1);
		expect(result.current.assignedSeatToPassengerIndex).toEqual({
			"12A": 0,
			"12B": 1,
		});
		expect(result.current.totalSeatCost).toBe(3000);
	});

	it("ignores unavailable seats and supports explicit active passenger changes", () => {
		const { result } = renderHook(() => useSeatSelection(2));

		act(() => {
			result.current.setActivePassenger(1);
			result.current.handleSeatSelect(unavailableSeat);
		});

		expect(result.current.activePassengerIndex).toBe(1);
		expect(result.current.assignments.size).toBe(0);
		expect(result.current.totalSeatCost).toBe(0);
	});

	it("deselects the same seat for the active passenger", () => {
		const { result } = renderHook(() => useSeatSelection(2));

		act(() => {
			result.current.handleSeatSelect(availableSeat);
		});

		act(() => {
			result.current.setActivePassenger(0);
			result.current.handleSeatSelect(availableSeat);
		});

		expect(result.current.assignments.size).toBe(0);
		expect(result.current.activePassengerIndex).toBe(0);
		expect(result.current.totalSeatCost).toBe(0);
	});

	it("releases a seat when another passenger selects an already-owned seat", () => {
		const { result } = renderHook(() => useSeatSelection(3));

		act(() => {
			result.current.handleSeatSelect(availableSeat);
			result.current.handleSeatSelect(secondAvailableSeat);
		});

		act(() => {
			result.current.setActivePassenger(2);
			result.current.handleSeatSelect(availableSeat);
		});

		expect(result.current.assignments.has(0)).toBe(false);
		expect(result.current.assignments.get(1)?.seatCode).toBe("12B");
		expect(result.current.assignments.has(2)).toBe(false);
		expect(result.current.activePassengerIndex).toBe(0);
	});

	it("can preload and reset assignments", () => {
		const { result } = renderHook(() => useSeatSelection(2));

		act(() => {
			result.current.setInitialAssignments(
				new Map([
					[
						1,
						{
							seatCode: "22K",
							amount: 4200,
							serviceCode: "STAF",
							seatType: "Window",
						},
					],
				])
			);
		});

		expect(result.current.assignments.get(1)?.seatCode).toBe("22K");
		expect(result.current.totalSeatCost).toBe(4200);

		act(() => {
			result.current.resetAssignments();
		});

		expect(result.current.activePassengerIndex).toBe(0);
		expect(result.current.assignments.size).toBe(0);
		expect(result.current.totalSeatCost).toBe(0);
	});
});
