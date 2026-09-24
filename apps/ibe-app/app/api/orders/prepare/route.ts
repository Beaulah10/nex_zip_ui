import { getSdkApiError, SdkRequestError } from "@repo/sdk";
import { NextResponse } from "next/server";
import {
	fetchOrderPrepare,
	type OrderPrepareRequest,
} from "@/modules/services/order-prepare/order-prepare.service";

export async function POST(request: Request) {
	try {
		const url = new URL(request.url);
		const currency = url.searchParams.get("currency")?.trim();
		const language = url.searchParams.get("language")?.trim();

		if (!currency) {
			return NextResponse.json({ error: "Missing required parameter: currency" }, { status: 400 });
		}

		if (!language) {
			return NextResponse.json({ error: "Missing required parameter: language" }, { status: 400 });
		}

		const rawBody = await request.json();
		const requestParameters: OrderPrepareRequest = {
			currency,
			language,
			nEXUZR005APIsSummaryRequest: rawBody,
		};

		const response = await fetchOrderPrepare(requestParameters);
		return NextResponse.json(response);
	} catch (error) {
		const status = error instanceof SdkRequestError ? (error.status ?? 502) : 502;
		const apiError = getSdkApiError(error, "Unable to prepare order");

		return NextResponse.json(
			{
				error: apiError.message,
				...(apiError.code ? { code: apiError.code } : {}),
			},
			{ status: apiError.status ?? status }
		);
	}
}
