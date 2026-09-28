import {
	createSdkClientContext,
	getAuthorizedSdkClientContextForRequest,
	type Middleware,
	SearchApi,
	type SearchCalendarFaresGetRequest,
} from "@repo/sdk";
import { buildClientRef } from "@repo/ui/lib";
import type { CalendarFaresResponse } from "@/store/slices/calendar-fares/calendar-fares.slice";
import type { CalendarFaresServiceResponse } from "@/types/calendar.types";

/**
 * Client-side: calls the localized BFF calendar-fares endpoint via generated SDK client.
 */
export async function searchCalendarFaresGetBySdk(
	_locale: string,
	params: SearchCalendarFaresGetRequest
): Promise<CalendarFaresServiceResponse> {
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
	return searchApi.searchCalendarFaresGet(params, {
		cache: "no-store",
	});
}

/**
 * Server-side: calls the calendar fares SDK endpoint using an authorized server-side SDK client.
 */
export async function fetchCalendarFares(
	params: SearchCalendarFaresGetRequest
): Promise<CalendarFaresResponse> {
	const { cookies } = await import("next/headers");
	const context = await getAuthorizedSdkClientContextForRequest({
		cookieStore: cookies(),
		headers: {
			"nexuz-client-ref": buildClientRef(),
		},
	});
	const searchApi = context.getApi(SearchApi);

	return searchApi.searchCalendarFaresGet(params, {
		cache: "no-store",
	});
}
