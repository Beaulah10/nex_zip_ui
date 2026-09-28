/**
 * File Name: seat-map.slice.ts
 *
 * Description:
 * This module manages the Redux state for flight seat map data.
 * It builds the seat map request from confirmed flight details, handles the async API call
 * to retrieve seat map offers, and provides selectors to access seat map state, data,
 * loading status, request details, and errors.
 */

import {
	createAsyncThunk,
	createSelector,
	createSlice,
	type PayloadAction,
} from "@reduxjs/toolkit";
import type {
	NEXUZR004OffersFlightSeatMapResponse,
	NEXUZR004OffersSeatMapRequestCabinEnum,
} from "@repo/sdk";
import {
	retrieveSeatMapBySdk,
	type SerializableSeatMapRequest,
} from "@/modules/services/seat-map/seat-map.service";
import { buildSeatMapFromApiResponse } from "@/modules/utils/helpers/seat-map/build-seat-map-utils/build-seat-map-utils";
import type { SeatMapApiError } from "@/modules/utils/helpers/seat-map/seat-map-api-error/seat-map-api-error";
import { getSeatMapApiError } from "@/modules/utils/helpers/seat-map/seat-map-api-error/seat-map-api-error";
import type { RootState } from "@/store";
import type {
	ConfirmedFlightPayload,
	SelectedSegment,
} from "@/store/slices/flight-selection/flight-selection.slice";
import type { Cabin } from "@/types/seat-map/seat-map.types";

export interface SeatMapState {
	request?: SerializableSeatMapRequest;
	data?: NEXUZR004OffersFlightSeatMapResponse;
	isPending: boolean;
	error?: SeatMapApiError;
	/** Persisted independent of request/data resets — keyed by ancillary scope (e.g. "outbound", "inbound"). */
	outOfStockByScope: Record<string, boolean>;
}

const initialState: SeatMapState = {
	isPending: false,
	outOfStockByScope: {},
};

function toSeatMapCabin(value: string | undefined): NEXUZR004OffersSeatMapRequestCabinEnum {
	const normalizedValue = value?.toUpperCase();

	if (normalizedValue === "ZIPFULLFLAT") {
		return "ZIPFULLFLAT";
	}

	return "STANDARD";
}

export function buildRetrieveSeatMapRequest(
	confirmedFlight: ConfirmedFlightPayload,
	segment?: SelectedSegment
): SerializableSeatMapRequest {
	if (!confirmedFlight.currency) {
		throw new Error("Unable to build seat map request: currency is missing");
	}

	const targetSegment = segment ?? confirmedFlight.flights.outbound.segments[0];

	if (!targetSegment) {
		throw new Error("Unable to build seat map request: segment is missing");
	}

	const departureDateTime = targetSegment.scheduledDepartureArrivalDateTime?.departureDateTime;

	if (!departureDateTime) {
		throw new Error("Unable to build seat map request: departure date is missing");
	}

	return {
		cabin: toSeatMapCabin(targetSegment.selectedCabin),
		currency: confirmedFlight.currency,
		departureDateTime,
		routes: `${targetSegment.origin},${targetSegment.destination}`,
		logicalFlightId: targetSegment.lfid,
	};
}

export const fetchSeatMapOffers = createAsyncThunk<
	NEXUZR004OffersFlightSeatMapResponse,
	{ locale: string; request: SerializableSeatMapRequest },
	{ rejectValue: SeatMapApiError }
>("seatMap/fetch", async ({ locale, request }, thunkApi) => {
	try {
		const response = await retrieveSeatMapBySdk(locale, request);
		return response;
	} catch (error) {
		return thunkApi.rejectWithValue(getSeatMapApiError(error));
	}
});

const seatMapSlice = createSlice({
	name: "seatMap",
	initialState,
	reducers: {
		clearSeatMap: (state) => {
			// Preserve out-of-stock flags AND the last request across clears — only reset
			// data/error/pending. We need `request` to survive so the out-of-stock banner
			// can verify it reflects the currently selected flight (via logicalFlightId).
			return {
				...initialState,
				outOfStockByScope: state.outOfStockByScope,
				request: state.request,
			};
		},
		setSeatMapOutOfStock: (
			state,
			action: PayloadAction<{ scope: string; isOutOfStock: boolean }>
		) => {
			const { scope, isOutOfStock } = action.payload;
			state.outOfStockByScope[scope] = isOutOfStock;
		},
	},
	extraReducers: (builder) => {
		builder
			.addCase(fetchSeatMapOffers.pending, (state, action) => {
				state.request = action.meta.arg.request;
				state.isPending = true;
				state.error = undefined;
			})
			.addCase(fetchSeatMapOffers.fulfilled, (state, action) => {
				state.data = action.payload;
				state.isPending = false;
			})
			.addCase(fetchSeatMapOffers.rejected, (state, action) => {
				state.data = undefined;
				state.error = action.payload ?? getSeatMapApiError(action.error.message);
				state.isPending = false;
			});
	},
});

export const { clearSeatMap, setSeatMapOutOfStock } = seatMapSlice.actions;

export const selectSeatMapState = (state: RootState) => state.seatMap;

export const selectSeatMapIsPending = createSelector(
	selectSeatMapState,
	(state) => state.isPending
);

export const selectSeatMapData = createSelector(selectSeatMapState, (state) => state.data);

export const selectSeatMapRequest = createSelector(selectSeatMapState, (state) => state.request);

export const selectSeatMapError = createSelector(selectSeatMapState, (state) => state.error);

/**
 * Returns whether seat selection is marked out of stock for the given ancillary scope
 * (e.g. "outbound", "inbound", "segment1", "segment2").
 */
export const selectSeatMapOutOfStock = (state: RootState, scope: string | undefined): boolean =>
	scope ? Boolean(state.seatMap.outOfStockByScope[scope]) : false;

/**
 * Selector factory that transforms the raw API response into a Cabin array
 * for a given cabin class. Returns undefined while the API hasn't responded yet.
 *
 * Usage: useAppSelector((state) => selectBuiltSeatMap(state, selectedCabin))
 */
export function selectBuiltSeatMap(
	state: RootState,
	cabinClass: Cabin["class"]
): Cabin[] | undefined {
	const seatInfo = state.seatMap.data?.data?.seatInfo;
	if (!seatInfo || seatInfo.length === 0) return undefined;
	return buildSeatMapFromApiResponse(seatInfo, cabinClass);
}

export default seatMapSlice.reducer;
