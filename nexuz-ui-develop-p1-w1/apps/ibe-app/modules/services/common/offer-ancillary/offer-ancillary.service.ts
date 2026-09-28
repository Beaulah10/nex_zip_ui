import {
	AncillariesApi,
	createSdkClientContext,
	getAuthorizedSdkClientContextForRequest,
	type Middleware,
	type NEXUZR004OffersAncillaryRequest,
	type NEXUZR004OffersAncillaryResponse,
	type NEXUZR004OffersPassengers,
	type OffersAncillariesPostRequest,
} from "@repo/sdk";
import { buildClientRef } from "@repo/ui/lib";
import type { OffersAncillariesRequest } from "@/types/common.type";

/**
 * Converts an ancillary request into the SDK request format.
 *
 * @param request - Ancillary request data.
 * @returns SDK-compatible ancillary request payload.
 */
export function toSdkOffersAncillariesPostRequest(
	request: OffersAncillariesRequest
): OffersAncillariesPostRequest {
	const ancillaryRequest: NEXUZR004OffersAncillaryRequest = {
		departureDate: request.departureDate,
		lfid: request.lfid,
		origin: request.origin,
		destination: request.destination,
		serviceCategory: request.serviceCategory,
		passengers: {
			...request.passengers,
		} as NEXUZR004OffersPassengers,
	};

	return {
		currency: request.currency,
		nEXUZR004OffersAncillaryRequest: ancillaryRequest,
	};
}

/**
 * Retrieves ancillary offers from the localized BFF endpoint using the generated SDK client.
 *
 * A unique client reference is attached to each request through middleware
 * and the response is fetched without caching.
 *
 * @param _locale - Locale associated with the current user session.
 * @param requestParameters - Ancillary offer search parameters.
 * @returns Ancillary offers response from the API.
 */
export async function retrieveOfferAncillariesBySdk(
	requestParameters: OffersAncillariesRequest
): Promise<NEXUZR004OffersAncillaryResponse> {
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

	const ancillariesApi = context.getApi(AncillariesApi);

	return ancillariesApi.offersAncillariesPost(
		toSdkOffersAncillariesPostRequest(requestParameters),
		{
			cache: "no-store",
		}
	);
}

/**
 * Server-side: calls the ancillary offers SDK endpoint using an authorized server-side SDK client.
 */
export async function fetchOfferAncillaries(
	requestParameters: OffersAncillariesRequest
): Promise<NEXUZR004OffersAncillaryResponse> {
	const { cookies } = await import("next/headers");
	const context = await getAuthorizedSdkClientContextForRequest({
		cookieStore: cookies(),
		headers: {
			"nexuz-client-ref": buildClientRef(),
		},
	});
	const ancillariesApi = context.getApi(AncillariesApi);

	return ancillariesApi.offersAncillariesPost(
		toSdkOffersAncillariesPostRequest(requestParameters),
		{
			cache: "no-store",
		}
	);
}
