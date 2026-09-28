import { getSdkApiError, SdkRequestError } from "@repo/sdk";
import { NextResponse } from "next/server";
import {
	fetchPaymentStatus,
	type PaymentStatusRequestParams,
} from "@/modules/services/payment-status/payment-status.service";

export async function POST(
	request: Request,
	{ params }: { params: Promise<{ statusCheckKey: string }> }
) {
	try {
		const { statusCheckKey } = await params;

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

		const requestParameters: PaymentStatusRequestParams = {
			orderId: statusCheckKey,
			paymentReferenceId: Number(rawBody.paymentReferenceId),
			currency,
			language,
		};

		const response = await fetchPaymentStatus(requestParameters);

		return NextResponse.json(response);
	} catch (error) {
		const status = error instanceof SdkRequestError ? (error.status ?? 502) : 502;

		const apiError = getSdkApiError(error, "Unable to retrieve payment status");

		return NextResponse.json(
			{
				error: apiError.message,
				...(apiError.code ? { code: apiError.code } : {}),
			},
			{
				status: apiError.status ?? status,
			}
		);
	}
}
