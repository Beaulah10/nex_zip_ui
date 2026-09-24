/**
 * File: passenger.selector.ts
 * Description: Redux selectors for retrieving and deriving passenger-related data from the application state.
 * It provides reusable selectors for passenger lists, completion status, primary passenger details, and passenger-specific workflow conditions.
 */

import { createSelector } from "@reduxjs/toolkit";
import type { RootState } from "@/store";

// ── Base selector ─────────────────────────────────────────────────────────────

export const selectPassengerState = (state: RootState) => state.customerInformation;

// ── Memoized selectors ────────────────────────────────────────────────────────

export const selectPassengerList = createSelector(
	selectPassengerState,
	(passenger) => passenger.values
);

export const selectHasIncompletePassengers = createSelector(selectPassengerList, (list) =>
	list.some((p) => !p.isCompleted)
);

export const selectHasMultiplePassengers = createSelector(
	selectPassengerList,
	(list) => list.length > 1
);

export const selectPrimaryPassenger = createSelector(selectPassengerList, (list) =>
	list.find((p) => p.passengerTypeCode === "adult")
);

export const selectPrimaryPassengerId = createSelector(
	selectPrimaryPassenger,
	(primaryPassenger) => primaryPassenger?.id
);
