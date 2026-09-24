import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "@/store";
import { confirmFlightSelection } from "@/store/slices/flight-selection/flight-selection.slice";
import type { ConfirmationDisabledFlagsState } from "@/types/confirmation/confirmation.types";

const initialState: ConfirmationDisabledFlagsState = {
	seat: {},
	baggage: {},
	extras: {},
	lounge: {},
	transport: {},
	priority: {},
	meal: [],
	bundle: {},
};
/**
 * Redux slice that stores disabled flags for seats, baggage, meals, transport, and other confirmation ancillaries.
 */
const confirmationDisabledFlagsSlice = createSlice({
	name: "confirmationDisabledFlags",
	initialState,
	reducers: {
		saveConfirmationDisabledFlags(
			state,
			action: PayloadAction<Partial<ConfirmationDisabledFlagsState>>
		) {
			Object.assign(state, action.payload);
		},

		clearConfirmationDisabledFlags() {
			return initialState;
		},
	},
	extraReducers: (builder) => {
		builder.addCase(confirmFlightSelection, () => initialState);
	},
});

export const { saveConfirmationDisabledFlags, clearConfirmationDisabledFlags } =
	confirmationDisabledFlagsSlice.actions;
/**
 * Selector to get the confirmation disabled flags from the Redux store.
 */
export const selectConfirmationDisabledFlags = (state: RootState): ConfirmationDisabledFlagsState =>
	state.confirmationDisabledFlags;

export default confirmationDisabledFlagsSlice.reducer;
