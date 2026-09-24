/**
 * File: customer-information.slice.ts
 * Description: Redux slice responsible for managing passenger information and customer details throughout the booking journey.
 */

import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
//import { passengerValues } from "@/modules/utils/constants/customer-information/constants";
import { buildPassengerList } from "@/modules/utils/helpers/customer-information/passenger-utils/passenger-utils";
import { setPassengerNames } from "@/store/slices/passenger/passenger.slice";
import type { ApisInfo, Passenger } from "@/types/customer-information/customer-information.types";

// Re-export Passenger type for convenience
export type { Passenger };

// ── Types ─────────────────────────────────────────────────────────────────────

export type PassengerNameState = {
	values: Passenger[];
	/** True after a successful confirm-and-proceed submission */
	submitted: boolean;
};

// ── Initial state ─────────────────────────────────────────────────────────────

const initialState: PassengerNameState = {
	values: [],
	submitted: false,
};

// ------------ helper function to deep merge two objects ----------------
type MergeObject = Record<string, unknown>;

function deepMerge<T extends Record<string, unknown>>(target: T, source: Partial<T>): T {
	const output = { ...target };

	for (const key of Object.keys(source)) {
		const k = key as keyof T;

		const sourceValue = source[k];
		const targetValue = target[k];

		if (sourceValue && typeof sourceValue === "object" && !Array.isArray(sourceValue)) {
			const targetObj: MergeObject = (targetValue as unknown as MergeObject) ?? {};
			output[k] = deepMerge(targetObj, sourceValue as MergeObject) as T[typeof k];
		} else if (sourceValue !== undefined) {
			output[k] = sourceValue as T[typeof k];
		}
	}

	return output;
}

// ── Slice ─────────────────────────────────────────────────────────────────────

const passengerSlice = createSlice({
	name: "passenger",
	initialState,
	extraReducers: (builder) => {
		builder.addCase(setPassengerNames, (state, action) => {
			const existingPassengersById = new Map(
				state.values.map((passenger) => [passenger.id, passenger])
			);

			state.values = action.payload.map((passengerValue) => {
				const existingPassenger = existingPassengersById.get(passengerValue.id);

				if (!existingPassenger) {
					return buildPassengerList([passengerValue])[0] as Passenger;
				}

				return deepMerge(existingPassenger, {
					id: passengerValue.id,
					passengerTypeCode: passengerValue.passengerTypeCode,
					firstName: passengerValue.firstName,
					middleName: passengerValue.middleName,
					lastName: passengerValue.lastName,
					associateWithPassengerId: passengerValue.associateWithPassengerId ?? "",
					hasAccompanyingAdult: Boolean(passengerValue.associateWithPassengerId),
				} as Partial<Passenger>);
			});
			state.submitted = false;
		});
	},
	reducers: {
		/** Inserts or replaces a passenger entry. Sets isCompleted based on the payload. */
		upsertPassenger(state, action: PayloadAction<Passenger>) {
			const index = state.values.findIndex((p) => p.id === action.payload.id);
			if (index !== -1) {
				state.values[index] = action.payload;
			} else {
				state.values.push(action.payload);
			}
		},

		/** Partially updates an existing passenger by id. */
		updatePassenger(state, action: PayloadAction<Passenger>) {
			const { id, ...updates } = action.payload;
			const index = state.values.findIndex((p) => p.id === id);
			const existing = (index !== -1 ? state.values[index] : { id }) as Passenger;
			const merged = deepMerge(existing, updates);
			if (index !== -1) {
				state.values[index] = merged;
			} else {
				state.values.push(merged);
			}
		},

		/** Marks the overall form as submitted (confirm-and-proceed). */
		setPassengersSubmitted(state) {
			state.submitted = true;
		},

		/** Clears all passenger data from the Redux store. */
		clearPassengerNames(state) {
			state.values = [];
			state.submitted = false;
		},

		/** updates existing passengers' accommodation details by id. */
		updateAllPassengersAccommodation(
			state,
			action: PayloadAction<{
				passengerId: string;
				passengerData: Passenger;
				destinationAddress: ApisInfo["destinationAddress"];
			}>
		) {
			const { passengerId, passengerData, destinationAddress } = action.payload;
			// Update current passenger with full data
			const currentIndex = state.values.findIndex((p) => p.id === passengerId);
			if (currentIndex !== -1) {
				state.values[currentIndex] = passengerData;
			}
			// Update all other passengers with only destination address
			for (const passenger of state.values) {
				if (passenger.id !== passengerId) {
					if (!passenger.apisInfo) {
						passenger.apisInfo = {
							passportNumber: "",
							passportExpiryDate: { year: "", month: "", day: "" },
							nationality: "",
							countryOfResidence: "",
							destinationAddress: {},
						};
					}
					passenger.apisInfo.destinationAddress = destinationAddress;
				}
			}
		},
		// set All Passenger
		setAllPassengers(state, action: PayloadAction<Passenger[]>) {
			state.values = action.payload;
		},
	},
});

export const {
	upsertPassenger,
	updatePassenger,
	setPassengersSubmitted,
	clearPassengerNames,
	updateAllPassengersAccommodation,
	setAllPassengers,
} = passengerSlice.actions;

export default passengerSlice.reducer;
