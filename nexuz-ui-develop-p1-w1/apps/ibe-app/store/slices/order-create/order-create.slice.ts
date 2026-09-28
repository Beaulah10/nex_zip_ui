import { createAsyncThunk, createSelector, createSlice } from "@reduxjs/toolkit";
import type { NEXUZR005APIsCreateOrderRequest, NEXUZR005APIsCreateOrderResponse } from "@repo/sdk";
import { createOrderBySdk } from "@/modules/services/order-create/order-create.service";
import type { RootState } from "@/store";
import type {
	OrderCreateApiError,
	OrderCreateState,
} from "@/types/order-create/order-create.types";

const initialState: OrderCreateState = {
	isPending: false,
};

function getOrderCreateApiError(error: unknown): OrderCreateApiError {
	if (error && typeof error === "object") {
		const candidate = error as {
			message?: string;
			code?: string;
			status?: number;
		};

		return {
			message: candidate.message ?? "Unable to create order",
			...(candidate.code ? { code: candidate.code } : {}),
			...(candidate.status ? { status: candidate.status } : {}),
		};
	}

	if (typeof error === "string") {
		return { message: error };
	}

	return { message: "Unable to create order" };
}

export const createOrder = createAsyncThunk<
	NEXUZR005APIsCreateOrderResponse,
	{
		currency: string;
		language: string;
		request: NEXUZR005APIsCreateOrderRequest;
	},
	{ rejectValue: OrderCreateApiError }
>("orderCreate/create", async ({ currency, language, request }, thunkApi) => {
	try {
		return await createOrderBySdk({
			currency,
			language,
			nEXUZR005APIsCreateOrderRequest: request,
		});
	} catch (error) {
		return thunkApi.rejectWithValue(getOrderCreateApiError(error));
	}
});

const orderCreateSlice = createSlice({
	name: "orderCreate",
	initialState,
	reducers: {
		clearOrderCreate(state) {
			state.isPending = false;
			state.request = undefined;
			state.response = undefined;
			state.error = undefined;
		},
	},
	extraReducers: (builder) => {
		builder
			.addCase(createOrder.pending, (state, action) => {
				state.isPending = true;
				state.request = action.meta.arg.request;
				state.error = undefined;
			})
			.addCase(createOrder.fulfilled, (state, action) => {
				state.isPending = false;
				state.response = action.payload;
			})
			.addCase(createOrder.rejected, (state, action) => {
				state.isPending = false;
				state.response = undefined;
				state.error = action.payload ?? getOrderCreateApiError(action.error.message);
			});
	},
});

const selectOrderCreateState = (state: RootState) => state.orderCreate;

export const selectOrderCreateIsPending = createSelector(
	selectOrderCreateState,
	(state) => state.isPending
);

export const selectOrderCreateError = createSelector(
	selectOrderCreateState,
	(state) => state.error
);

export const { clearOrderCreate } = orderCreateSlice.actions;
export default orderCreateSlice.reducer;
