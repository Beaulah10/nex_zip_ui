/**
 * File: store/slices/payment-status/payment-status.slice.ts
 * Description: Redux slice for managing payment status state across completion,
 * payment-failure, and pending pages. Handles state persistence for refresh support.
 */

import type { PayloadAction } from "@reduxjs/toolkit";
import { createAsyncThunk, createSelector, createSlice } from "@reduxjs/toolkit";
import { retrievePaymentStatusBySdk } from "@/modules/services/payment-status/payment-status.service";
import type { RootState } from "@/store";
import type {
	FetchPaymentStatusThunkArg,
	PaymentInfo,
	PaymentStatus,
	PaymentStatusState,
} from "@/types/payment/payment.types";

const initialState: PaymentStatusState = {
	orderId: null,
	paymentReferenceId: null,
	paymentStatus: null,
	confirmationNumber: null,
	lastUpdated: null,
	isPending: false,
	error: null,
	paymentInfo: null,
};

export const fetchPaymentStatus = createAsyncThunk<
	PaymentInfo,
	FetchPaymentStatusThunkArg,
	{
		rejectValue: string;
	}
>("paymentStatus/fetch", async (args, thunkApi) => {
	try {
		const { orderId, paymentReferenceId, currency = "JPY", language = "en" } = args;

		// Call SDK service
		const response = await retrievePaymentStatusBySdk({
			orderId,
			paymentReferenceId,
			currency,
			language,
		});

		const paymentData = response.data;

		if (!paymentData) {
			throw new Error("No payment data in response");
		}

		// Transform API response to PaymentInfo
		const paymentInfo: PaymentInfo = {
			orderId,
			paymentReferenceId,
			paymentStatus: (paymentData.status as PaymentStatus) || "InProgress",
			confirmationNumber: paymentData.confirmationNumber ?? undefined,
			lastUpdated: new Date().toISOString(),
		};

		return paymentInfo;
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : "Failed to fetch payment status";
		return thunkApi.rejectWithValue(errorMessage);
	}
});

// ─────────────────────────────────────────────────────────────────────────────
// Redux Slice Definition
// ─────────────────────────────────────────────────────────────────────────────

const paymentStatusSlice = createSlice({
	name: "paymentStatus",
	initialState,

	// Synchronous reducers
	reducers: {
		setPaymentIdentifiers: (
			state,
			action: PayloadAction<{
				orderId: string;
				paymentReferenceId: number;
			}>
		) => {
			state.orderId = action.payload.orderId;
			state.paymentReferenceId = action.payload.paymentReferenceId;
		},

		clearPaymentStatus: () => initialState,

		/**
		 * Clear error state while keeping other fields.
		 * Used for error dismissal in UI.
		 */
		clearError: (state) => {
			state.error = null;
		},
	},

	// Async thunk handlers
	extraReducers: (builder) => {
		builder
			// ─── Pending state (API call in progress) ───
			.addCase(fetchPaymentStatus.pending, (state) => {
				state.isPending = true;
				state.error = null;
			})

			// ─── Fulfilled state (API call succeeded) ───
			.addCase(fetchPaymentStatus.fulfilled, (state, action) => {
				state.isPending = false;
				state.paymentInfo = action.payload;
				state.paymentStatus = action.payload.paymentStatus;
				state.confirmationNumber = action.payload.confirmationNumber ?? null;
				state.lastUpdated = action.payload.lastUpdated ?? null;
				state.error = null;
			})

			// ─── Rejected state (API call failed) ───
			.addCase(fetchPaymentStatus.rejected, (state, action) => {
				state.isPending = false;
				state.error = action.payload ?? "Unknown error occurred";
				// Keep existing paymentInfo for retry attempts
			});
	},
});

export const { setPaymentIdentifiers, clearPaymentStatus, clearError } = paymentStatusSlice.actions;

// ─────────────────────────────────────────────────────────────────────────────
// Selectors
// ─────────────────────────────────────────────────────────────────────────────

/** Select entire payment status state */
export const selectPaymentStatusState = (state: RootState) => state.paymentStatus;

/** Select order ID */
export const selectOrderId = createSelector(selectPaymentStatusState, (state) => state.orderId);

export const selectPaymentReferenceId = createSelector(
	selectPaymentStatusState,
	(state) => state.paymentReferenceId
);

export const selectPaymentStatus = createSelector(
	selectPaymentStatusState,
	(state) => state.paymentStatus
);

/** Select confirmation number */
export const selectConfirmationNumber = createSelector(
	selectPaymentStatusState,
	(state) => state.confirmationNumber
);

/** Select loading state */
export const selectPaymentStatusIsPending = createSelector(
	selectPaymentStatusState,
	(state) => state.isPending
);

/** Select error message */
export const selectPaymentStatusError = createSelector(
	selectPaymentStatusState,
	(state) => state.error
);

/** Select full payment info */
export const selectPaymentInfo = createSelector(
	selectPaymentStatusState,
	(state) => state.paymentInfo
);

/** Select if payment is successful */
export const selectIsPaymentSuccess = createSelector(
	selectPaymentStatus,
	(status) => status === "Success"
);

/** Select if payment failed */
export const selectIsPaymentFailure = createSelector(
	selectPaymentStatus,
	(status) => status === "Failure"
);

/** Select if payment is still in progress */
export const selectIsPaymentInProgress = createSelector(
	selectPaymentStatus,
	(status) => status === "InProgress"
);

// ─────────────────────────────────────────────────────────────────────────────
// Default Export
// ─────────────────────────────────────────────────────────────────────────────

export default paymentStatusSlice.reducer;
