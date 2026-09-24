import { getSdkApiError, SdkRequestError } from "@repo/sdk";
import { NextResponse } from "next/server";
import { fetchOfferAncillaries } from "@/modules/services/common/offer-ancillary/offer-ancillary.service";
import type { OffersAncillariesRequest } from "@/types/common.type";

/**
 * Localized BFF route for offers ancillaries.
 */
export async function POST(request: Request) {
	try {
		const url = new URL(request.url);
		const currency = url.searchParams.get("currency")?.trim();

		if (!currency) {
			return NextResponse.json({ error: "Missing required parameter: currency" }, { status: 400 });
		}

		const rawBody = await request.json();
		const ancillaryRequest = rawBody?.nEXUZR004OffersAncillaryRequest ?? rawBody;
		const requestParameters: OffersAncillariesRequest = {
			currency,
			...ancillaryRequest,
		};

		const response = await fetchOfferAncillaries(requestParameters);

		return NextResponse.json(response);
	} catch (error) {
		const status = error instanceof SdkRequestError ? (error.status ?? 502) : 502;
		const apiError = getSdkApiError(error, "Unable to fetch ancillary offers");

		return NextResponse.json(
			{
				error: apiError.message,
				...(apiError.code ? { code: apiError.code } : {}),
			},
			{ status: apiError.status ?? status }
		);
	}
}
