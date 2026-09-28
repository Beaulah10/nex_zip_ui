import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { FlightSearchFormValues } from "@/types/flight-search/flight-search.types";

/**
 * Redux state shape for flight search form data.
 * @typedef {Object} FlightSearchFormState
 * @property {FlightSearchFormValues | null} data - The flight search form values (origin, destination, dates, passengers, trip type) or null if not set
 */
type FlightSearchFormState = {
	data: FlightSearchFormValues | null;
	hasSubmittedSearch: boolean;
};

/**
 * Initial state for the flight search form slice.
 * Starts with no form data until the user fills out and submits the flight search form.
 */
const initialState: FlightSearchFormState = {
	data: null,
	hasSubmittedSearch: false,
};

/**
 * Redux slice for managing flight search form state.
 *
 * Handles storing and clearing flight search form data (origin, destination, dates, passengers, trip type)
 * that persists across navigation and is used to populate flight search results.
 *
 * State shape:
 * ```
 * {
 *   flightSearchForm: {
 *     data: FlightSearchFormValues | null
 *   }
 * }
 * ```
 */
const flightSearchFormSlice = createSlice({
	name: "flightSearchForm",
	initialState,
	reducers: {
		setDraftFormData(state, action: PayloadAction<FlightSearchFormValues>) {
			state.data = action.payload;
			state.hasSubmittedSearch = false;
		},

		/**
		 * Sets the flight search form data in Redux state.
		 *
		 * @param {FlightSearchFormState} state - Current Redux state
		 * @param {PayloadAction<FlightSearchFormValues>} action - Action payload containing the form data
		 *
		 * @example
		 * dispatch(setFormData({
		 *   origin: "NRT",
		 *   destination: "KIX",
		 *   travelDates: { outboundDate: "2024-12-25", returnDate: "2025-01-01" },
		 *   passengerCounts: { adult: 2, child12to14: 0, child7to11: 0, child2to6: 0, infant0to1: 0 },
		 *   tripType: "round-trip"
		 * }))
		 */
		setFormData(state, action: PayloadAction<FlightSearchFormValues>) {
			state.data = action.payload;
			state.hasSubmittedSearch = true;
		},

		/**
		 * Clears the flight search form data from Redux state.
		 * Sets data to null, effectively resetting the form.
		 *
		 * @param {FlightSearchFormState} state - Current Redux state
		 *
		 * @example
		 * dispatch(clearFormData())
		 */
		clearFormData(state) {
			state.data = null;
			state.hasSubmittedSearch = false;
		},
	},
});

/**
 * Action creators for flight search form state mutations.
 *
 * @typedef {Object} FlightSearchFormActions
 * @property {Function} setFormData - Stores flight search form data
 * @property {Function} clearFormData - Clears flight search form data
 */
export const { clearFormData, setDraftFormData, setFormData } = flightSearchFormSlice.actions;

/**
 * Flight search form reducer.
 * Manages state updates for flight search form data.
 *
 * @type {Reducer<FlightSearchFormState>}
 */
export default flightSearchFormSlice.reducer;
