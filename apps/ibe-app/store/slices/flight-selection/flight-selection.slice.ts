/**
 * flight-selection.slice.ts
 *
 * Handles flight selection API state (request, response, loading, error)
 * using Redux Toolkit thunk.
 *
 * Also stores the user-confirmed flight selection after "Confirm and Proceed"
 * is clicked, via the synchronous `confirmFlightSelection` action.
 */

import type { PayloadAction } from "@reduxjs/toolkit";
import { createAsyncThunk, createSelector, createSlice } from "@reduxjs/toolkit";
import { flightSelection } from "@/modules/services/flight-selection/flight-selection.service";
import type { RootState } from "@/store";
import type {
	FareDetail,
	FareInfo,
	FlightCabinState,
	FlightSelectionApiResponse,
	FlightSelectionRequest,
	PassengerWiseFare,
	ScheduledDepartureArrivalDateTime,
} from "@/types/flight-selection/flight-selection.types";

// ---------------------------------------------------------------------------
// Confirmed-selection types (re-exported so builder/selectors can import them)
// ---------------------------------------------------------------------------

export type SelectedSegment = {
	pfid: number;
	lfid: number;
	carrierCode: string;
	origin: string;
	destination: string;
	flightNumber: string;
	scheduledDepartureArrivalDateTime: ScheduledDepartureArrivalDateTime;
	flightTime: string;
	selectedCabin: string;
	fareDetails: FareDetail[];
};

export type SelectedFlightBound = {
	segments: SelectedSegment[];
	selectedFareInfos: FareInfo[];
	passengerFareBreakdown: PassengerWiseFare[];
	totalFlightAmount: number;
};

export type ConfirmedFlightPayload = {
	tripType: "oneway" | "roundtrip";

	selectedCabinsOutbound: FlightCabinState;
	selectedCabinsInbound: FlightCabinState;

	flights: {
		outbound: SelectedFlightBound;
		inbound?: SelectedFlightBound;
	};
	grandTotalAmount: number;
	currency: string;
	language: string;
};

// ---------------------------------------------------------------------------
// Slice state
// ---------------------------------------------------------------------------

type FlightSelectionState = {
	request?: FlightSelectionRequest;
	data?: FlightSelectionApiResponse;
	error?: string;
	isPending: boolean;
	/** Populated only after the user clicks the inner "Confirm and Proceed" button. */
	confirmedFlight?: ConfirmedFlightPayload;
};

const initialState: FlightSelectionState = {
	isPending: false,
};

export const fetchFlightSelection = createAsyncThunk<
	FlightSelectionApiResponse,
	{
		locale: string;
		request: FlightSelectionRequest;
	},
	{
		rejectValue: string;
	}
>("flightSelection/fetch", async (_args, thunkApi) => {
	try {
		const response = (await flightSelection()) as FlightSelectionApiResponse;
		return response;
	} catch (error) {
		return thunkApi.rejectWithValue(
			error instanceof Error ? error.message : "Unable to fetch flight selection"
		);
	}
});

const flightSelectionSlice = createSlice({
	name: "flightSelection",
	initialState,
	reducers: {
		/**
		 * Stores the confirmed flight selection when the user clicks the inner
		 * "Confirm and Proceed" button inside the passenger dialog.
		 * Only called after validation has passed.
		 */
		setFlightSelectionRequest(state, action: PayloadAction<FlightSelectionRequest>) {
			state.request = action.payload;
		},

		confirmFlightSelection(state, action) {
			state.confirmedFlight = action.payload;
		},

		/** Resets confirmed selection (e.g., user navigates back). */
		clearConfirmedFlight(state) {
			state.confirmedFlight = undefined;
		},
		clearFlightSelection(state) {
			state.request = undefined;
			state.data = undefined;
			state.error = undefined;
			state.isPending = false;
		},
	},

	extraReducers: (builder) => {
		builder
			.addCase(fetchFlightSelection.pending, (state, action) => {
				state.request = action.meta.arg.request;
				state.data = undefined;
				state.error = undefined;
				state.isPending = true;
			})
			.addCase(fetchFlightSelection.fulfilled, (state, action) => {
				state.data = action.payload;
				state.isPending = false;
			})
			.addCase(fetchFlightSelection.rejected, (state, action) => {
				state.data = undefined;
				state.error =
					typeof action.payload === "string"
						? action.payload
						: (action.error.message ?? "Unable to fetch flight selection");
				state.isPending = false;
			});
	},
});

export const {
	setFlightSelectionRequest,
	clearFlightSelection,
	confirmFlightSelection,
	clearConfirmedFlight,
} = flightSelectionSlice.actions;
export default flightSelectionSlice.reducer;

// ---------------------------------------------------------------------------
// Selectors
// ---------------------------------------------------------------------------
const selectFlightSelectionState = (state: RootState) => state.flightSelection;
const US_THAILAND_AIRPORTS = ["BKK", "HNL", "SFO", "SJC", "LAX", "IAH", "MCO"];

export const selectConfirmedFlight = createSelector(
	selectFlightSelectionState,
	(s) => s.confirmedFlight
);

export const selectRequiresDestinationAddress = createSelector(
	selectConfirmedFlight,
	(confirmed): boolean => {
		if (!confirmed) return false;

		const segments = [
			...(confirmed.flights.outbound?.segments ?? []),
			...(confirmed.flights.inbound?.segments ?? []),
		];

		return segments.some(
			(segment) =>
				US_THAILAND_AIRPORTS.includes(segment.origin) ||
				US_THAILAND_AIRPORTS.includes(segment.destination)
		);
	}
);

export const selectConfirmedOutboundFlight = createSelector(
	selectConfirmedFlight,
	(confirmed) => confirmed?.flights.outbound
);

export const selectFlightSearchRequest = createSelector(
	selectFlightSelectionState,
	(s) => s.request
);

export const selectHasConnectingOutbound = createSelector(
	selectFlightSelectionState,
	(state) =>
		state.data?.data.outbound.flightsByDate.some((day) =>
			day.flights.some((flight) => flight.segments.length > 1)
		) ?? false
);

export const selectConfirmedInboundFlight = createSelector(
	selectConfirmedFlight,
	(confirmed) => confirmed?.flights.inbound
);

export const selectConfirmedTotalAmount = createSelector(
	selectConfirmedFlight,
	(confirmed) => confirmed?.grandTotalAmount ?? 0
);

/**
 * Returns only the fields needed to build the next booking API request.
 * Shape: { tripType, flights, currency, language }
 */
export const selectBookingPayload = createSelector(
	selectConfirmedFlight,
	(
		confirmed
	): Pick<ConfirmedFlightPayload, "tripType" | "flights" | "currency" | "language"> | undefined => {
		if (!confirmed) return undefined;
		return {
			tripType: confirmed.tripType,
			flights: confirmed.flights,
			currency: confirmed.currency,
			language: confirmed.language,
		};
	}
);
