import { createAsyncThunk, createSelector, createSlice } from "@reduxjs/toolkit";
import type { NEXUZR005APIsSummaryRequest, NEXUZR005APIsSummaryResponse } from "@repo/sdk";
import { prepareOrderBySdk } from "@/modules/services/order-prepare/order-prepare.service";
import type { RootState } from "@/store";
import type {
	OrderPrepareApiError,
	OrderPrepareState,
} from "@/types/order-prepare/order-prepare.types";

const initialState: OrderPrepareState = {
	isPending: false,
};

const PREPARE_ORDER_ERROR_CODE_PATTERN = /NEXUZ(?:R005E\d{3}|CMNE001)/;
function extractPrepareOrderErrorCode(
	error: unknown,
	visited = new WeakSet<object>()
): string | undefined {
	if (typeof error === "string") {
		return error.match(PREPARE_ORDER_ERROR_CODE_PATTERN)?.[0];
	}

	if (!error || typeof error !== "object") {
		return undefined;
	}

	if (visited.has(error)) {
		return undefined;
	}

	visited.add(error);

	for (const value of Object.values(error)) {
		const code = extractPrepareOrderErrorCode(value, visited);

		if (code) {
			return code;
		}
	}

	return undefined;
}
function getOrderPrepareApiError(error: unknown): OrderPrepareApiError {
	const code = extractPrepareOrderErrorCode(error);

	if (error && typeof error === "object") {
		const candidate = error as {
			error?: string;
			message?: string;
			status?: number;
		};

		return {
			message: candidate.error ?? candidate.message ?? "Unable to prepare order",
			...(code ? { code } : {}),
			...(candidate.status !== undefined ? { status: candidate.status } : {}),
		};
	}

	if (typeof error === "string") {
		return {
			message: error,
			...(code ? { code } : {}),
		};
	}

	return {
		message: "Unable to prepare order",
		...(code ? { code } : {}),
	};
}

export const prepareOrder = createAsyncThunk<
	NEXUZR005APIsSummaryResponse,
	{
		currency: string;
		language: string;
		request: NEXUZR005APIsSummaryRequest;
	},
	{ rejectValue: OrderPrepareApiError }
>("orderPrepare/prepare", async ({ currency, language, request }, thunkApi) => {
	try {
		return await prepareOrderBySdk({
			currency,
			language,
			nEXUZR005APIsSummaryRequest: request,
		});
	} catch (error) {
		return thunkApi.rejectWithValue(getOrderPrepareApiError(error));
	}
});

const orderPrepareSlice = createSlice({
	name: "orderPrepare",
	initialState,
	reducers: {
		clearOrderPrepare(state) {
			state.isPending = false;
			state.request = undefined;
			state.response = undefined;
			state.token = undefined;
			state.error = undefined;
		},
	},
	extraReducers: (builder) => {
		builder
			.addCase(prepareOrder.pending, (state, action) => {
				state.isPending = true;
				state.request = action.meta.arg.request;
				state.error = undefined;
			})
			.addCase(prepareOrder.fulfilled, (state, action) => {
				state.isPending = false;
				state.response = action.payload;
				state.token = action.payload.data.token;
			})
			.addCase(prepareOrder.rejected, (state, action) => {
				state.isPending = false;
				state.response = undefined;
				state.token = undefined;
				state.error = action.payload ?? getOrderPrepareApiError(action.error.message);
			});
	},
});

const selectOrderPrepareState = (state: RootState) => state.orderPrepare;

export const selectOrderPrepareIsPending = createSelector(
	selectOrderPrepareState,
	(state) => state.isPending
);

export const selectOrderPrepareToken = createSelector(
	selectOrderPrepareState,
	(state) => state.token
);

export const selectOrderPrepareError = createSelector(
	selectOrderPrepareState,
	(state) => state.error
);

export const { clearOrderPrepare } = orderPrepareSlice.actions;
export default orderPrepareSlice.reducer;
