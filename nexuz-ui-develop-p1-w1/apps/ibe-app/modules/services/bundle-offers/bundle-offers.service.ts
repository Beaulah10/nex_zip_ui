import {
	createSdkClientContext,
	getAuthorizedSdkClientContextForRequest,
	type Middleware,
	type NEXUZR004OffersBundleResponse,
	type NEXUZR004OffersFlight,
	type NEXUZR004OffersFlightCabinEnum,
	OffersApi,
	type RetrieveOfferBundlesRequest as SdkRetrieveOfferBundlesRequest,
} from "@repo/sdk";
import { buildClientRef } from "@repo/ui/lib";
import {
	BUNDLE_OFFER_PASSENGER_TYPE_CODES,
	STANDARD_CABIN_CODE,
	ZIP_FULL_FLAT_CABIN_CODE,
} from "@/modules/utils/constants/bundle/bundle.constants";
import type {
	ConfirmedFlightPayload,
	SelectedFlightBound,
	SelectedSegment,
} from "@/store/slices/flight-selection/flight-selection.slice";
import type {
	BundleRequest,
	FlightDetails,
	PassengerTypeCounts,
	RetrieveOfferBundlesRequest,
} from "@/types/bundle/bundle.types";
import type { Passenger } from "@/types/customer-information/customer-information.types";

/**
 * Maps selected cabin value to offers API cabin enum.
 * Only zip full flat is preserved; everything else maps to standard.
 */
function toOffersCabin(value: string | undefined): NEXUZR004OffersFlightCabinEnum {
	return value?.toUpperCase() === ZIP_FULL_FLAT_CABIN_CODE
		? ZIP_FULL_FLAT_CABIN_CODE
		: STANDARD_CABIN_CODE;
}

/**
 * Extracts fare basis/class for one segment, preferring adult fare details.
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
 * Converts selected bound into serializable offers-flight entries.
 * Departure date is serialized as ISO string and validated before inclusion.
 */
function toOffersFlights(bound: SelectedFlightBound): FlightDetails[] {
	return bound.segments.map((segment, index) => {
		const departureDateTime = segment.scheduledDepartureArrivalDateTime?.departureDateTime;
		const departureDate = new Date(departureDateTime ?? "");

		const fallbackSegmentFareDetails = bound.selectedFareInfos[index]?.fareDetails ?? [];
		const fareMeta = getSegmentFareMeta(segment, fallbackSegmentFareDetails);

		return {
			departureDate: departureDate.toISOString(),
			cabin: toOffersCabin(segment.selectedCabin),
			lfid: segment.lfid,
			...fareMeta,
		};
	});
}

/**
 * Aggregates passengers into offers API passenger buckets.
 * Unknown passenger type codes are ignored.
 */
function countPassengers(passengers: Passenger[]): PassengerTypeCounts {
	return passengers.reduce<PassengerTypeCounts>(
		(accumulator, passenger) => {
			const passengerTypeCode = passenger.passengerTypeCode?.toLowerCase();

			switch (passengerTypeCode) {
				case BUNDLE_OFFER_PASSENGER_TYPE_CODES.ADULT:
					accumulator.adult += 1;
					break;
				case BUNDLE_OFFER_PASSENGER_TYPE_CODES.CHILD_A:
					accumulator.childA += 1;
					break;
				case BUNDLE_OFFER_PASSENGER_TYPE_CODES.CHILD_B:
					accumulator.childB += 1;
					break;
				case BUNDLE_OFFER_PASSENGER_TYPE_CODES.CHILD_C:
					accumulator.childC += 1;
					break;
				case BUNDLE_OFFER_PASSENGER_TYPE_CODES.INFANT:
					accumulator.infant += 1;
					break;
			}

			return accumulator;
		},
		{ adult: 0, childA: 0, childB: 0, childC: 0, infant: 0 }
	);
}

/**
 * Builds serializable offers-request body from confirmed itinerary and passenger counts.
 */
function buildBundleRequestBody(
	confirmedFlight: ConfirmedFlightPayload,
	passengerTypeCounts: PassengerTypeCounts
): BundleRequest {
	const firstOutboundSegment = confirmedFlight.flights.outbound.segments[0];

	const outbound = toOffersFlights(confirmedFlight.flights.outbound);
	const inboundBound = confirmedFlight.flights.inbound;
	const inbound = inboundBound?.segments.length ? toOffersFlights(inboundBound) : undefined;

	return {
		routes: `${firstOutboundSegment?.origin ?? ""},${firstOutboundSegment?.destination ?? ""}`,
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
 * Creates serializable request payload expected by bundle offers flow state and BFF.
 */
export function buildRetrieveOfferBundlesRequest({
	confirmedFlight,
	passengers,
}: {
	confirmedFlight: ConfirmedFlightPayload;
	passengers: Passenger[];
}): RetrieveOfferBundlesRequest {
	const passengerTypeCounts = countPassengers(passengers);
	const nEXUZR004OffersBundleRequest = buildBundleRequestBody(confirmedFlight, passengerTypeCounts);

	return {
		currency: confirmedFlight.currency,
		nEXUZR004OffersBundleRequest,
	};
}

/**
 * Converts serializable request (string dates) into SDK request (Date objects).
 */
export function toSdkRetrieveOfferBundlesRequest(
	request: RetrieveOfferBundlesRequest
): SdkRetrieveOfferBundlesRequest {
	const mapFlights = (flights: FlightDetails[]): NEXUZR004OffersFlight[] =>
		flights.map((flight) => ({
			...flight,
			departureDate: new Date(flight.departureDate),
		}));
	const { outbound, inbound, ...restBundleFields } = request.nEXUZR004OffersBundleRequest;

	return {
		currency: request.currency,
		nEXUZR004OffersBundleRequest: {
			...restBundleFields,
			outbound: mapFlights(outbound),
			...(inbound ? { inbound: mapFlights(inbound) } : {}),
		},
	};
}

/**
 * Client-side: calls localized BFF offers/bundles endpoint via generated SDK client.
 */
export async function retrieveOfferBundlesBySdk(
	_locale: string,
	requestParameters: RetrieveOfferBundlesRequest
): Promise<NEXUZR004OffersBundleResponse> {
	const origin = typeof window !== "undefined" ? window.location.origin : "";
	const baseUrl = origin ? `${origin}/booking/api` : "/booking/api";
	const clientRefMiddleware: Middleware = {
		pre: async (context) => {
			const headers = new Headers(context.init.headers);
			headers.set("nexuz-client-ref", buildClientRef());

			return {
				url: context.url,
				init: {
					...context.init,
					headers,
				},
			};
		},
	};
	const context = createSdkClientContext({
		baseUrl,
		middleware: [clientRefMiddleware],
	});
	const offersApi = context.getApi(OffersApi);
	const sdkRequest = toSdkRetrieveOfferBundlesRequest(requestParameters);

	return offersApi.retrieveOfferBundles(sdkRequest, {
		cache: "no-store",
	});
}

/**
 * Server-side: calls offers/bundles backend using authorized server-side SDK context.
 */
export async function fetchOfferBundles(
	requestParameters: SdkRetrieveOfferBundlesRequest
): Promise<NEXUZR004OffersBundleResponse> {
	const { cookies } = await import("next/headers");
	const context = await getAuthorizedSdkClientContextForRequest({
		cookieStore: cookies(),
		headers: {
			"nexuz-client-ref": buildClientRef(),
		},
	});
	const offersApi = context.getApi(OffersApi);

	return offersApi.retrieveOfferBundles(requestParameters, {
		cache: "no-store",
	});
}
