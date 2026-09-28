import {
	createSdkClientContext,
	getAuthorizedSdkClientContextForRequest,
	type Middleware,
	SearchApi,
	type SearchFlightsRequest,
} from "@repo/sdk";
import { buildClientRef } from "@repo/ui/lib";

/**
 * Client-side: calls the localized BFF calendar-fares endpoint via generated SDK client.
 */
export async function flightSelection(): Promise<unknown> {
	// POST with body for flight selection
	const origin = typeof window !== "undefined" ? window.location.origin : "";
	const baseUrl = origin ? `${origin}/booking/api` : `/booking/api`;
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
	const searchApi = context.getApi(SearchApi);
	const params = new URLSearchParams(window.location.search);
	const routes = params.get("routes");
	const departureDateFrom = params.get("departureDateFrom");
	const adult = params.get("adult");

	if (!routes || !departureDateFrom || !adult) {
		throw new Error("Missing required search parameters");
	}

	const requestPayload = {
		routes,
		departureDateFrom,
		departureDateTo: params.get("departureDateTo") ?? "",
		adult,
		childA: params.get("childA") ?? "",
		childB: params.get("childB") ?? "",
		childC: params.get("childC") ?? "",
		infant: params.get("infant") ?? "",
		language: "en",
		currency: "JPY",
	};

	return searchApi.searchFlights(requestPayload, {
		cache: "no-store",
	});
}

/**
 * Server-side: calls the calendar fares SDK endpoint using an authorized server-side SDK client.
 */
export async function searchRoutes(payload: SearchFlightsRequest): Promise<unknown> {
	const { cookies } = await import("next/headers");
	const context = await getAuthorizedSdkClientContextForRequest({
		cookieStore: cookies(),
		headers: {
			"nexuz-client-ref": buildClientRef(),
		},
	});

	const searchApi = context.getApi(SearchApi);
	return searchApi.searchFlights(payload, {
		cache: "no-store",
	});
}
