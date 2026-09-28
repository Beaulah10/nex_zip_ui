import { getSdkApiError, SdkRequestError } from "@repo/sdk";
import { NextResponse } from "next/server";
import {
	fetchOfferBundles,
	toSdkRetrieveOfferBundlesRequest,
} from "@/modules/services/bundle-offers/bundle-offers.service";
import type { RetrieveOfferBundlesRequest } from "@/types/bundle/bundle.types";

/**
 * Localized BFF route for offers bundles.
 */
export async function POST(request: Request) {
	try {
		const url = new URL(request.url);
		const currency = url.searchParams.get("currency")?.trim();

		if (!currency) {
			return NextResponse.json({ error: "Missing required parameter: currency" }, { status: 400 });
		}

		const rawBody = await request.json();

		const requestParameters: RetrieveOfferBundlesRequest = {
			currency,
			nEXUZR004OffersBundleRequest: rawBody,
		};

		const response = await fetchOfferBundles(toSdkRetrieveOfferBundlesRequest(requestParameters));
		return NextResponse.json(response);
	} catch (error) {
		const status = error instanceof SdkRequestError ? (error.status ?? 502) : 502;
		const apiError = getSdkApiError(error, "Unable to fetch bundle offers");

		return NextResponse.json(
			{
				error: apiError.message,
				...(apiError.code ? { code: apiError.code } : {}),
			},
			{ status: apiError.status ?? status }
		);
	}
}
