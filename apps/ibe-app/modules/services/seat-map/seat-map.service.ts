/**
 * File Name: seatMap.service.ts
 *
 * Description:
 * Handles flight seat map API operations for both client-side and server-side requests.
 * Provides request transformation utilities and SDK-based methods to retrieve seat map data.
 */

import {
	createSdkClientContext,
	getAuthorizedSdkClientContextForRequest,
	type Middleware,
	type NEXUZR004OffersFlightSeatMapResponse,
	type NEXUZR004OffersSeatMapRequestCabinEnum,
	type RetrieveSeatMapRequest,
	SeatMapApi,
} from "@repo/sdk";
import { buildClientRef } from "@repo/ui/lib";

export interface SerializableSeatMapRequest {
	cabin: NEXUZR004OffersSeatMapRequestCabinEnum;
	currency: string;
	departureDateTime: string;
	routes: string;
	logicalFlightId: number;
}

export function toSdkRetrieveSeatMapRequest(
	request: SerializableSeatMapRequest
): RetrieveSeatMapRequest {
	return {
		nEXUZR004OffersSeatMapRequest: {
			cabin: request.cabin,
			currency: request.currency,
			departureDateTime: request.departureDateTime,
			routes: request.routes,
			logicalFlightId: request.logicalFlightId,
		},
	};
}

/**
 * Client-side: calls localized BFF offers/seatMap endpoint via generated SDK client.
 */
export async function retrieveSeatMapBySdk(
	_locale: string,
	requestParameters: SerializableSeatMapRequest
): Promise<NEXUZR004OffersFlightSeatMapResponse> {
	const origin = typeof window !== "undefined" ? window.location.origin : "";
	const baseUrl = origin ? `${origin}/booking/api` : "/booking/api";
	const clientRefMiddleware: Middleware = {
		pre: async (context) => {
			const headers = new Headers(context.init.headers);
			headers.set("client-ref", buildClientRef());

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
	const seatMapApi = context.getApi(SeatMapApi);
	const sdkRequest = toSdkRetrieveSeatMapRequest(requestParameters);

	return seatMapApi.retrieveSeatMap(sdkRequest, {
		cache: "no-store",
	});
}

/**
 * Server-side: calls offers/seatMap backend using authorized server-side SDK context.
 */
export async function fetchSeatMap(
	requestParameters: RetrieveSeatMapRequest
): Promise<NEXUZR004OffersFlightSeatMapResponse> {
	const { cookies } = await import("next/headers");
	const context = await getAuthorizedSdkClientContextForRequest({
		cookieStore: cookies(),
		headers: {
			"client-ref": buildClientRef(),
		},
	});
	const seatMapApi = context.getApi(SeatMapApi);

	return seatMapApi.retrieveSeatMap(requestParameters, {
		cache: "no-store",
	});
}
