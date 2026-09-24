import {
	createAsyncThunk,
	createSelector,
	createSlice,
	type PayloadAction,
} from "@reduxjs/toolkit";
import type { NEXUZR004OffersBundleResponse, NEXUZR004OffersFlightCabinEnum } from "@repo/sdk";
import { retrieveOfferBundlesBySdk } from "@/modules/services/bundle-offers/bundle-offers.service";
import { getBundleApiError } from "@/modules/utils/helpers/bundle/bundle-api-error/bundle-api-error";
import type { RootState } from "@/store";
import type {
	BundleApiError,
	BundleRequest,
	BundleSelectionMap,
	FlightDetails,
	RetrieveOfferBundlesRequest,
} from "@/types/bundle/bundle.types";
import type { Passenger } from "@/types/customer-information/customer-information.types";
import type {
	ConfirmedFlightPayload,
	SelectedFlightBound,
	SelectedSegment,
} from "../flight-selection/flight-selection.slice";

type PassengerTypeCounts = {
	adult: number;
	childA: number;
	childB: number;
	childC: number;
	infant: number;
};

/**
 * Redux state for bundle-offers request lifecycle and user selections.
 */
export interface BundleOffersState {
	request?: RetrieveOfferBundlesRequest;
	data?: NEXUZR004OffersBundleResponse;
	isPending: boolean;
	error?: BundleApiError;
	selectedBundlesBySegment?: Record<string, BundleSelectionMap>;
}

function createInitialState(): BundleOffersState {
	return {
		isPending: false,
		selectedBundlesBySegment: {},
	};
}

const initialState = createInitialState();

/**
 * Guards duplicate fetches while existing request is still pending.
 */
export function shouldFetchBundleOffers(state: BundleOffersState) {
	return !state.isPending;
}

/**
 * Maps selected cabin string to offers API cabin enum.
 * Only ZIPFULLFLAT is preserved, all other values default to STANDARD.
 */
function toOffersCabin(value: string | undefined): NEXUZR004OffersFlightCabinEnum {
	const normalizedValue = value?.toUpperCase();

	if (normalizedValue === "ZIPFULLFLAT") {
		return "ZIPFULLFLAT";
	}

	return "STANDARD";
}

/**
 * Extracts fare metadata for offers request.
 * Prefers ADULT fare detail, then falls back to first available fare detail.
 */
function getSegmentFareMeta(
	segment: SelectedSegment,
	fallbackSegmentFareDetails: SelectedSegment["fareDetails"] = []
): Pick<FlightDetails, "fareBasisCode" | "fareClass"> {
	const fareDetails = segment.fareDetails.length ? segment.fareDetails : fallbackSegmentFareDetails;
	const preferredFareDetail =
		fareDetails.find((fareDetail) => fareDetail.passengerType?.toLowerCase() === "adult") ??
		fareDetails[0];

	return {
		fareBasisCode: preferredFareDetail?.fareBasisCode,
		fareClass: preferredFareDetail?.fareClass,
	};
}

/**
 * Converts selected bound segments into offers-flight payload.
 * Validates departure datetime and throws when missing or invalid.
 */
function toOffersFlights(bound: SelectedFlightBound): FlightDetails[] {
	return bound.segments.map((segment, index) => {
		const departureDateTime = segment.scheduledDepartureArrivalDateTime?.departureDateTime;
		const departureDate = departureDateTime?.split("T")[0];
		const parsedDepartureDateTime = departureDateTime ? new Date(departureDateTime) : undefined;
		const fallbackSegmentFareDetails = bound.selectedFareInfos[index]?.fareDetails ?? [];
		const fareMeta = getSegmentFareMeta(segment, fallbackSegmentFareDetails);

		if (
			!departureDateTime ||
			!departureDate ||
			!parsedDepartureDateTime ||
			Number.isNaN(parsedDepartureDateTime.getTime())
		) {
			throw new Error("Unable to build offers request: invalid segment departure date");
		}

		return {
			departureDate,
			cabin: toOffersCabin(segment.selectedCabin),
			lfid: segment.lfid,
			...fareMeta,
		};
	});
}

/**
 * Aggregates passenger counts by API-supported passenger type buckets.
 * Unknown passenger types are ignored.
 */
function countPassengers(passengers: Passenger[]): PassengerTypeCounts {
	return passengers.reduce<PassengerTypeCounts>(
		(accumulator, passenger) => {
			const passengerTypeCode = passenger.passengerTypeCode?.toLowerCase();

			switch (passengerTypeCode) {
				case "adult":
				case "adt":
					accumulator.adult += 1;
					break;
				case "childa":
				case "chd":
					accumulator.childA += 1;
					break;
				case "childb":
					accumulator.childB += 1;
					break;
				case "childc":
					accumulator.childC += 1;
					break;
				case "infant":
				case "inf":
					accumulator.infant += 1;
					break;
				default:
					break;
			}

			return accumulator;
		},
		{ adult: 0, childA: 0, childB: 0, childC: 0, infant: 0 }
	);
}

/**
 * Builds API request payload for offers endpoint from confirmed itinerary and passengers.
 */
function buildBundleRequestBody(
	confirmedFlight: ConfirmedFlightPayload,
	passengerTypeCounts: PassengerTypeCounts
): BundleRequest {
	const firstOutboundSegment = confirmedFlight.flights.outbound.segments[0];

	if (!firstOutboundSegment?.origin || !firstOutboundSegment.destination) {
		throw new Error("Unable to build offers request: outbound route is missing");
	}

	const outbound = toOffersFlights(confirmedFlight.flights.outbound);
	const inboundBound = confirmedFlight.flights.inbound;
	const inbound = inboundBound?.segments.length ? toOffersFlights(inboundBound) : undefined;

	return {
		routes: [
			firstOutboundSegment.origin,
			...confirmedFlight.flights.outbound.segments.map((segment) => segment.destination),
		].join(","),
		adult: passengerTypeCounts.adult,
		...(passengerTypeCounts.childA > 0 ? { childA: passengerTypeCounts.childA } : {}),
		...(passengerTypeCounts.childB > 0 ? { childB: passengerTypeCounts.childB } : {}),
		...(passengerTypeCounts.childC > 0 ? { childC: passengerTypeCounts.childC } : {}),
		...(passengerTypeCounts.infant > 0 ? { infant: passengerTypeCounts.infant } : {}),
		outbound,
		...(inbound ? { inbound } : {}),
	};
}

/**
 * Creates top-level retrieve-offer-bundles request expected by SDK.
 */
export function buildRetrieveOfferBundlesRequest({
	confirmedFlight,
	passengers,
}: {
	confirmedFlight: ConfirmedFlightPayload;
	passengers: Passenger[];
}): RetrieveOfferBundlesRequest {
	if (!confirmedFlight.currency) {
		throw new Error("Unable to build offers request: currency is missing");
	}

	const passengerTypeCounts = countPassengers(passengers);
	const nEXUZR004OffersBundleRequest = buildBundleRequestBody(confirmedFlight, passengerTypeCounts);

	return {
		currency: confirmedFlight.currency,
		nEXUZR004OffersBundleRequest,
	};
}

/**
 * Fetches offer bundles through SDK and maps failures to normalized bundle API error.
 */
export const fetchBundleOffers = createAsyncThunk<
	NEXUZR004OffersBundleResponse,
	{ locale: string; request: RetrieveOfferBundlesRequest },
	{ state: RootState; rejectValue: BundleApiError }
>(
	"bundleOffers/fetch",
	async ({ locale, request }, thunkApi) => {
		try {
			const response = await retrieveOfferBundlesBySdk(locale, request);
			return response;
		} catch (error) {
			return thunkApi.rejectWithValue(getBundleApiError(error));
		}
	},
	{
		condition: (_arg, { getState }) => {
			const state = selectBundleOffersState(getState());
			return shouldFetchBundleOffers(state);
		},
		dispatchConditionRejection: false,
	}
);

const bundleOffersSlice = createSlice({
	name: "bundleOffers",
	initialState,
	reducers: {
		/** Resets bundle offers state when leaving bundle flow. */
		resetBundleOffers: () => createInitialState(),
		/**
		 * Stores chosen bundle map for one segment, keyed by segment lfid.
		 */
		setSelectedBundles(
			state,
			action: PayloadAction<{ lfid: number; selections: BundleSelectionMap }>
		) {
			if (!state.selectedBundlesBySegment) {
				state.selectedBundlesBySegment = {};
			}
			state.selectedBundlesBySegment[String(action.payload.lfid)] = action.payload.selections;
		},
	},
	extraReducers: (builder) => {
		builder
			.addCase(fetchBundleOffers.pending, (state, action) => {
				state.request = action.meta.arg.request;
				state.isPending = true;
				state.error = undefined;
			})
			.addCase(fetchBundleOffers.fulfilled, (state, action) => {
				state.data = action.payload;
				state.isPending = false;
			})
			.addCase(fetchBundleOffers.rejected, (state, action) => {
				state.data = undefined;
				state.error = action.payload ?? getBundleApiError(action.error.message);
				state.isPending = false;
			});
	},
});

export const { resetBundleOffers, setSelectedBundles } = bundleOffersSlice.actions;

/** Returns bundle-offers slice root state. */
export const selectBundleOffersState = (state: RootState) => state.bundleOffers;

/** Returns pending status for bundle-offers request. */
export const selectBundleOffersIsPending = createSelector(
	selectBundleOffersState,
	(state) => state.isPending
);

/** Returns latest bundle-offers response data. */
export const selectBundleOffersData = createSelector(
	selectBundleOffersState,
	(state) => state.data
);

/** Returns selected bundles grouped by segment lfid. */
export const selectSelectedBundlesBySegment = createSelector(
	selectBundleOffersState,
	(state) => state.selectedBundlesBySegment ?? {}
);

/** Returns last request payload sent for bundle offers. */
export const selectBundleOffersRequest = createSelector(
	selectBundleOffersState,
	(state) => state.request
);

/** Returns normalized bundle-offers error. */
export const selectBundleOffersError = createSelector(
	selectBundleOffersState,
	(state) => state.error
);

export default bundleOffersSlice.reducer;
