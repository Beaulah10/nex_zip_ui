/**
 * file name: use-seat-selection.ts
 *
 * description:
 * This custom hook manages seat selection and seat assignment for passengers.
 * It handles seat assignment, reassignment, and deselection while preventing
 * duplicate seat selections. The hook also tracks the active passenger,
 * assigned seats, and calculates the total seat cost.
 */

"use client";

import { useCallback, useMemo, useState } from "react";
import type {
	Assignments,
	ExpandedSeat,
	UseSeatSelectionReturn,
} from "@/types/seat-map/seat-map.types";

interface SelectionState {
	activePassengerIndex: number;
	assignments: Assignments;
}

/**
 * Finds the first passenger who does not have a seat assigned.
 * Returns the passenger index of the first unassigned passenger.
 * Returns -1 when all passengers already have seat assignments.
 */
function findFirstUnassigned(assignments: Assignments, count: number): number {
	for (let i = 0; i < count; i++) {
		if (!assignments.has(i)) return i;
	}
	return -1;
}

/**
 * Manages per-passenger seat assignment with ordered focus progression.
 *
 * Assignment rules:
 * - New assignment → advance focus to first unassigned passenger (from P1).
 * - Reassignment (swap) → keep focus on same passenger.
 * - Deselection → keep focus on same passenger.
 * - Duplicate assignment to another passenger is prevented.
 */
export function useSeatSelection(passengerCount: number): UseSeatSelectionReturn {
	const [{ activePassengerIndex, assignments }, setState] = useState<SelectionState>({
		activePassengerIndex: 0,
		assignments: new Map(),
	});

	const setInitialAssignments = useCallback((nextAssignments: Assignments) => {
		setState((prev) => ({
			...prev,
			assignments: new Map(nextAssignments),
		}));
	}, []);
	/**
	 * Handles seat selection for the active passenger.
	 * Assigns a new seat, updates an existing assignment, or removes the seat
	 * when the same seat is selected again.
	 */
	const handleSeatSelect = useCallback(
		(seat: ExpandedSeat) => {
			if (!seat.isSeatAvailable) return;

			setState((prevState) => {
				const { activePassengerIndex: activeIdx, assignments: prevMap } = prevState;
				const next = new Map(prevMap);

				// Check if the seat is already owned by another passenger
				const owner = [...next.entries()].find(([, a]) => a.seatCode === seat.code);

				// Allow deselection of an already-selected seat for a non-active passenger.
				if (owner && owner[0] !== activeIdx) {
					next.delete(owner[0]);
					const nextActive = findFirstUnassigned(next, passengerCount);
					return {
						activePassengerIndex: nextActive === -1 ? activeIdx : nextActive,
						assignments: next,
					};
				}

				const currentAssignment = next.get(activeIdx);
				const isDeselect = currentAssignment?.seatCode === seat.code;

				if (isDeselect) {
					next.delete(activeIdx);
					const nextActive = findFirstUnassigned(next, passengerCount);
					return {
						activePassengerIndex: nextActive === -1 ? activeIdx : nextActive,
						assignments: next,
					};
				}

				next.set(activeIdx, {
					seatCode: seat.code,
					amount: seat.amount,
					serviceCode: seat.serviceCode,
					seatType: seat.type,
				});

				// New assignment or reassignment: advance focus to first unassigned passenger.
				// When all passengers are assigned (nextActive === -1), keep focus on the
				// current passenger (preserves swap-in-place behaviour).
				const nextActive = findFirstUnassigned(next, passengerCount);
				return {
					activePassengerIndex: nextActive === -1 ? activeIdx : nextActive,
					assignments: next,
				};
			});
		},
		[passengerCount]
	);

	const setActivePassenger = useCallback((index: number) => {
		setState((prev) => ({ ...prev, activePassengerIndex: index }));
	}, []);

	const resetAssignments = useCallback(() => {
		setState({ activePassengerIndex: 0, assignments: new Map() });
	}, []);

	/**
	 * Creates a lookup map of seat codes to passenger indexes.
	 * Helps identify which passenger currently owns a selected seat.
	 */
	const assignedSeatToPassengerIndex = useMemo(() => {
		const map: Record<string, number> = {};
		for (const [pIdx, a] of assignments.entries()) {
			map[a.seatCode] = pIdx;
		}
		return map;
	}, [assignments]);

	/**
	 * Calculates the total cost of all selected seats.
	 * Sums the seat amount for every passenger with an assigned seat.
	 */
	const totalSeatCost = useMemo(() => {
		let total = 0;
		for (const a of assignments.values()) total += a.amount;
		return total;
	}, [assignments]);

	return {
		activePassengerIndex,
		assignments,
		assignedSeatToPassengerIndex,
		totalSeatCost,
		handleSeatSelect,
		setActivePassenger,
		resetAssignments,
		setInitialAssignments,
	};
}
