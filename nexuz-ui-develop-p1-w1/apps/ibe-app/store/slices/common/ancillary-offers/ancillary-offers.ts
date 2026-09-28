import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type {
	NEXUZR004OffersAncillaryRequestServiceCategoryEnum,
	NEXUZR004OffersAncillaryResponse,
} from "@repo/sdk";
import { retrieveOfferAncillariesBySdk } from "@/modules/services/common/offer-ancillary/offer-ancillary.service";
import { getAncillaryServiceOffer } from "@/modules/utils/helpers/ancillary/ancillary-service";
import {
	getAncillaryOffersApiError,
	getAncillaryOffersBoundaryError,
} from "@/modules/utils/helpers/common/ancillary-error-code/ancillary.errors";
import type { RootState } from "@/store";
import type {
	AncillaryOffersDirectionState,
	AncillaryOffersScope,
	AncillaryOffersState,
} from "@/types/common/ancillary-offers.type";
import type { OffersAncillariesRequest } from "@/types/common.type";
import type { Passenger } from "@/types/customer-information/customer-information.types";
import type {
	ConfirmedFlightPayload,
	SelectedSegment,
} from "../../flight-selection/flight-selection.slice";

type PassengerTypeCounts = {
	adult: number;
	childA: number;
	childB: number;
	childC: number;
	infant: number;
};

const initialState: AncillaryOffersState = {};

function createAncillaryOffersDirectionState(): AncillaryOffersDirectionState {
	return {
		requestByServiceCategory: {},
		dataByServiceCategory: {},
		errorByServiceCategory: {},
		isPending: false,
	};
}

function getAncillaryOffersDirectionState(
	state: AncillaryOffersState,
	scope: AncillaryOffersScope
): AncillaryOffersDirectionState {
	const directionState = state[scope];

	if (directionState) {
		return directionState;
	}

	const nextDirectionState = createAncillaryOffersDirectionState();
	state[scope] = nextDirectionState;

	return nextDirectionState;
}

function getAncillaryOffersDirectionStateView(
	state: AncillaryOffersState,
	scope: AncillaryOffersScope
): AncillaryOffersDirectionState {
	return state[scope] ?? createAncillaryOffersDirectionState();
}

export function shouldFetchAncillaryOffers(
	state: AncillaryOffersState,
	scope: AncillaryOffersScope
) {
	return !state[scope]?.isPending;
}

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

function toDepartureDate(rawDateTime?: string): string {
	if (!rawDateTime) {
		throw new Error("Unable to build ancillary offers request: departure date is missing");
	}

	const departureDate = rawDateTime.split("T")[0];

	const parsedDate = new Date(rawDateTime);

	if (!departureDate || Number.isNaN(parsedDate.getTime())) {
		throw new Error("Unable to build ancillary offers request: departure date is invalid");
	}

	return departureDate;
}

export function buildRetrieveOfferAncillariesRequest({
	confirmedFlight,
	segment,
	passengers,
	serviceCategory,
}: {
	confirmedFlight: ConfirmedFlightPayload;
	segment: SelectedSegment;
	passengers: Passenger[];
	serviceCategory: NEXUZR004OffersAncillaryRequestServiceCategoryEnum;
}): OffersAncillariesRequest {
	if (!confirmedFlight.currency) {
		throw new Error("Unable to build ancillary offers request: currency is missing");
	}

	if (!segment.origin || !segment.destination) {
		throw new Error("Unable to build ancillary offers request: route is missing");
	}

	const passengerTypeCounts = countPassengers(passengers);

	if (passengerTypeCounts.adult <= 0) {
		throw new Error("Unable to build ancillary offers request: at least one adult is required");
	}

	return {
		currency: confirmedFlight.currency,
		departureDate: toDepartureDate(segment.scheduledDepartureArrivalDateTime?.departureDateTime),
		lfid: segment.lfid,
		origin: segment.origin,
		destination: segment.destination,
		serviceCategory,
		passengers: {
			adult: passengerTypeCounts.adult,
			...(passengerTypeCounts.childA > 0 ? { childA: passengerTypeCounts.childA } : {}),
			...(passengerTypeCounts.childB > 0 ? { childB: passengerTypeCounts.childB } : {}),
			...(passengerTypeCounts.childC > 0 ? { childC: passengerTypeCounts.childC } : {}),
			...(passengerTypeCounts.infant > 0 ? { infant: passengerTypeCounts.infant } : {}),
		},
	};
}

// Module-level (non-persisted) marker: reset by a full page load, unlike the persisted slice state.
const prefetchedAncillaryOffersInPageSession = new Set<string>();

function getAncillaryOffersPageSessionKey(
	scope: AncillaryOffersScope,
	serviceCategory: NEXUZR004OffersAncillaryRequestServiceCategoryEnum
) {
	return `${scope}:${serviceCategory}`;
}

/** Records that offers for this scope/category were prefetched for a later step in the current page session. */
export function setAncillaryPrefetched(
	scope: AncillaryOffersScope,
	serviceCategory: NEXUZR004OffersAncillaryRequestServiceCategoryEnum
) {
	prefetchedAncillaryOffersInPageSession.add(
		getAncillaryOffersPageSessionKey(scope, serviceCategory)
	);
}

export function hasPrefetchedAncillaryOffersInPageSession(
	scope: AncillaryOffersScope,
	serviceCategory: NEXUZR004OffersAncillaryRequestServiceCategoryEnum
) {
	return prefetchedAncillaryOffersInPageSession.has(
		getAncillaryOffersPageSessionKey(scope, serviceCategory)
	);
}

export const fetchAncillaryOffers = createAsyncThunk<
	NEXUZR004OffersAncillaryResponse,
	{ scope: AncillaryOffersScope; request: OffersAncillariesRequest },
	{ state: RootState; rejectValue: string }
>(
	"ancillaryOffers/fetch",
	async ({ request }, thunkApi) => {
		try {
			const response = await retrieveOfferAncillariesBySdk(request);
			return response;
		} catch (error) {
			const apiError = getAncillaryOffersApiError(error);
			const boundaryError = getAncillaryOffersBoundaryError(apiError);

			if (boundaryError) {
				return thunkApi.rejectWithValue(boundaryError.message);
			}

			const errorMessage = apiError.message || "Unable to fetch ancillary offers";
			return thunkApi.rejectWithValue(errorMessage);
		}
	},
	{
		condition: (arg, { getState }) => {
			const state = selectAncillaryOffersState(getState());
			return shouldFetchAncillaryOffers(state, arg.scope);
		},
		dispatchConditionRejection: false,
	}
);

const ancillaryOffersSlice = createSlice({
	name: "ancillaryOffers",
	initialState,
	reducers: {
		clearAncillaryOffers(state) {
			state.outbound = undefined;
			state.inbound = undefined;
			state.segment1 = undefined;
			state.segment2 = undefined;
		},
		markCategoriesOutOfStock(
			state,
			action: {
				payload: {
					scope: AncillaryOffersScope;
					serviceCategory: NEXUZR004OffersAncillaryRequestServiceCategoryEnum;
					isOutOfStock: boolean;
				};
			}
		) {
			const { scope, serviceCategory, isOutOfStock } = action.payload;
			const directionState = getAncillaryOffersDirectionState(state, scope);
			const responseData = directionState.dataByServiceCategory[serviceCategory];

			if (responseData?.data?.servicesPerPassengerType) {
				responseData.data.servicesPerPassengerType.forEach((service) => {
					if (service.categories) {
						service.categories.forEach((category: any) => {
							category.outOfStock = isOutOfStock;
						});
					}
				});
			}
		},
	},
	extraReducers: (builder) => {
		builder
			.addCase(fetchAncillaryOffers.pending, (state, action) => {
				const { scope, request } = action.meta.arg;
				const { serviceCategory } = request;
				const directionState = getAncillaryOffersDirectionState(state, scope);

				directionState.requestByServiceCategory[serviceCategory] = request;
				directionState.isPending = true;
				directionState.errorByServiceCategory[serviceCategory] = undefined;
			})
			.addCase(fetchAncillaryOffers.fulfilled, (state, action) => {
				const { scope, request } = action.meta.arg;
				const { serviceCategory } = request;
				const directionState = getAncillaryOffersDirectionState(state, scope);

				// Preserve outOfStock flag from previous state if it exists
				const previousOutOfStockState = directionState.dataByServiceCategory[
					serviceCategory
				]?.data?.servicesPerPassengerType?.map((service) =>
					service.categories?.map((cat: any) => cat.outOfStock)
				);

				directionState.dataByServiceCategory[serviceCategory] = action.payload;
				directionState.isPending = false;
				directionState.errorByServiceCategory[serviceCategory] = undefined;

				// Restore outOfStock flags from previous state
				if (previousOutOfStockState && action.payload?.data?.servicesPerPassengerType) {
					action.payload.data.servicesPerPassengerType.forEach((service, idx) => {
						if (service.categories && previousOutOfStockState[idx]) {
							service.categories.forEach((cat: any, catIdx) => {
								if (previousOutOfStockState[idx]?.[catIdx] === true) {
									cat.outOfStock = true;
								}
							});
						}
					});
				}
			})
			.addCase(fetchAncillaryOffers.rejected, (state, action) => {
				const { scope, request } = action.meta.arg;
				const { serviceCategory } = request;
				const directionState = getAncillaryOffersDirectionState(state, scope);
				const errorMessage =
					action.payload ?? action.error.message ?? "Unable to fetch ancillary offers";

				directionState.errorByServiceCategory[serviceCategory] = errorMessage;
				directionState.isPending = false;
			});
	},
});

export const { clearAncillaryOffers, markCategoriesOutOfStock } = ancillaryOffersSlice.actions;

export const selectAncillaryOffersState = (state: RootState) => state.ancillaryOffers;

export const selectAncillaryOffersDirectionState = (
	state: RootState,
	scope: AncillaryOffersScope
) => getAncillaryOffersDirectionStateView(state.ancillaryOffers, scope);

export const selectAncillaryOffersIsPendingByDirection = (
	state: RootState,
	scope: AncillaryOffersScope
) => selectAncillaryOffersDirectionState(state, scope).isPending;

export const selectAncillaryOffersDataByDirectionAndServiceCategory = (
	state: RootState,
	scope: AncillaryOffersScope,
	serviceCategory: NEXUZR004OffersAncillaryRequestServiceCategoryEnum
) => selectAncillaryOffersDirectionState(state, scope).dataByServiceCategory[serviceCategory];

export const selectAncillaryOffersErrorByDirectionAndServiceCategory = (
	state: RootState,
	scope: AncillaryOffersScope,
	serviceCategory: NEXUZR004OffersAncillaryRequestServiceCategoryEnum
) => selectAncillaryOffersDirectionState(state, scope).errorByServiceCategory[serviceCategory];

export const selectOutOfStockByDirectionAndServiceCategory = (
	state: RootState,
	scope: AncillaryOffersScope,
	serviceCategory: NEXUZR004OffersAncillaryRequestServiceCategoryEnum
) => {
	const responseData = selectAncillaryOffersDirectionState(state, scope).dataByServiceCategory[
		serviceCategory
	];

	if (!responseData?.data?.servicesPerPassengerType) {
		return false;
	}

	// Check if any category has outOfStock flag set to true
	return responseData.data.servicesPerPassengerType.some((service) =>
		service.categories?.some((category: any) => category.outOfStock === true)
	);
};

//Returns the stored ancillary request for the specified scope and service category.
export const selectAncillaryOffersRequestByDirectionAndServiceCategory = (
	state: RootState,
	scope: AncillaryOffersScope,
	serviceCategory: NEXUZR004OffersAncillaryRequestServiceCategoryEnum
) => selectAncillaryOffersDirectionState(state, scope).requestByServiceCategory[serviceCategory];

/**
 * Resolve the pricing and availability for the configured SSR code in a given ancillary scope.
 */
export const selectAncillaryPricingBySsrCode = (
	state: RootState,
	scope: AncillaryOffersScope,
	serviceCategory: NEXUZR004OffersAncillaryRequestServiceCategoryEnum,
	ssrCode: string,
	pricingPassengerType: string,
	selectedSegmentLfid?: number
) => {
	const servicesPerPassengerType =
		selectAncillaryOffersDirectionState(state, scope).dataByServiceCategory[serviceCategory]?.data
			.servicesPerPassengerType ?? [];

	const offer = getAncillaryServiceOffer({
		servicesPerPassengerType,
		passengerType: pricingPassengerType,
		ssrCode,
		selectedSegmentLfid,
	});

	return {
		amount: offer.amount,
		quantityAvailable: offer.qtyAvailable,
	};
};

export default ancillaryOffersSlice.reducer;
