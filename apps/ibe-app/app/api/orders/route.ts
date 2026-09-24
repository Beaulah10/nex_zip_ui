import { getSdkApiError, SdkRequestError } from "@repo/sdk";
import { NextResponse } from "next/server";
import {
	type CreateOrderRequest,
	fetchCreateOrder,
} from "@/modules/services/order-create/order-create.service";

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
		const requestParameters: CreateOrderRequest = {
			currency,
			language,
			nEXUZR005APIsCreateOrderRequest: rawBody,
		};

		const response = await fetchCreateOrder(requestParameters);
		return NextResponse.json(response);
	} catch (error) {
		const status = error instanceof SdkRequestError ? (error.status ?? 502) : 502;
		const apiError = getSdkApiError(error, "Unable to create order");

		return NextResponse.json(
			{
				error: apiError.message,
				...(apiError.code ? { code: apiError.code } : {}),
			},
			{ status: apiError.status ?? status }
		);
	}
}
