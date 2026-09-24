import {
	getAuthorizedSdkClientContextForRequest,
	type Middleware,
	SearchApi,
	type SearchRoutesGetRequest,
} from "@repo/sdk";

import { buildClientRef } from "@repo/ui/lib";
import type { RouteGroups } from "@/types/flight-search/flight-search.types";

const ROUTES_REVALIDATE_SECONDS = 15 * 60;

export async function getRoutes(languageCode = "en"): Promise<RouteGroups> {
	const language = languageCode?.trim() || "en";
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

	const searchParams: SearchRoutesGetRequest = {
		language: language,
	};
	const { cookies } = await import("next/headers");

	const context = await getAuthorizedSdkClientContextForRequest({
		cookieStore: cookies(),
		middleware: [clientRefMiddleware],
		headers: {
			"nexuz-client-ref": buildClientRef(),
		},
	});
	const searchApi = context.getApi(SearchApi);

	const response = await searchApi.searchRoutesGet(searchParams, {
		cache: "force-cache",
		next: {
			revalidate: ROUTES_REVALIDATE_SECONDS,
			tags: ["flight-routes", `flight-routes-${language}`],
		},
	});

	return response.data.routeInfo;
}

export async function getIpLocation(): Promise<string> {
	const TOKYO_NARITA_IATA = "NRT";

	try {
		const response = await fetch("/api/debug-headers", {
			method: "GET",
			cache: "no-store",
		});

		if (!response.ok) {
			return TOKYO_NARITA_IATA;
		}

		const payload = (await response.json()) as {
			cloudfrontViewerCountry?: string;
		};
		const countryCode = payload.cloudfrontViewerCountry?.trim().toUpperCase();

		// Others → Tokyo (NRT)
		if (!countryCode) {
			return TOKYO_NARITA_IATA;
		}

		// Japan → Tokyo (NRT)
		if (countryCode === "JP") {
			return "NRT";
		}

		// Korea → Incheon (ICN)
		if (countryCode === "KR") {
			return "ICN";
		}

		// Thailand & nearby regions → Suvarnabhumi (BKK)
		if (["TH", "SG", "MY", "VN", "ID", "PH", "KH", "LA", "MM", "BN"].includes(countryCode)) {
			return "BKK";
		}

		// USA / Canada → Honolulu (HNL)
		if (countryCode === "US" || countryCode === "CA") {
			return "HNL";
		}

		return TOKYO_NARITA_IATA;
	} catch {
		return TOKYO_NARITA_IATA;
	}
}
