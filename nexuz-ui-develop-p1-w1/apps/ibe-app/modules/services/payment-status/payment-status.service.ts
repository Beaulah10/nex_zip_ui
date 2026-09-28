/**
 * File: modules/services/payment-status/payment-status.service.ts
 * Description: Service layer for payment status API integration.
 * Provides client-side and server-side functions to retrieve payment status via SDK.
 * Uses the real payment status API through the SDK for both client-side and server-side requests.
 */

import type { Middleware, NEXUZR006PaymentPaymentStatusResponse } from "@repo/sdk";
import {
	createSdkClientContext,
	getAuthorizedSdkClientContextForRequest,
	PaymentStatusApi,
} from "@repo/sdk";
import { buildClientRef } from "@repo/ui/lib";

/**
 * Type for payment status request parameters.
 */
export interface PaymentStatusRequestParams {
	/** Order ID / Status Check Key */
	orderId: string;

	/** Payment Reference ID returned from Create Order API */
	paymentReferenceId: number;

	/** Reservation currency (e.g., "JPY", "USD") */
	currency: string;

	/** Reservation language (e.g., "en", "ja") */
	language: string;
}

/**
 * Builds the request payload for payment status API call.
 *
 * Expected payload:
 * {
 *   statusCheckKey: "...",
 *   currency: "...",
 *   language: "...",
 *   nEXUZR006PaymentPaymentStatusRequest: {
 *     paymentReferenceId: 1234567
 *   }
 * }
 *
 * @param params - Payment status request parameters
 * @returns SDK request object
 */
function buildPaymentStatusRequest(params: PaymentStatusRequestParams) {
	return {
		statusCheckKey: params.orderId,
		currency: params.currency,
		language: params.language,
		nEXUZR006PaymentPaymentStatusRequest: {
			paymentReferenceId: params.paymentReferenceId,
		},
	};
}

/**
 * Client-side: Retrieves payment status from the payment status API via SDK.
 * Uses a custom SDK context configured for the local BFF endpoint with nexuz-client-ref header.
 *
 * Called from: Redux thunk in payment-status.slice.ts
 * Endpoint: POST /payment/{statusCheckKey}/status
 *
 * @param params - Payment status request parameters
 * @returns Payment status response
 * @throws Error if API call fails
 */
export async function retrievePaymentStatusBySdk(
	params: PaymentStatusRequestParams
): Promise<NEXUZR006PaymentPaymentStatusResponse> {
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

	const paymentStatusApi = context.getApi(PaymentStatusApi);

	const request = buildPaymentStatusRequest(params);

	try {
		const response = await paymentStatusApi.retrievePaymentStatus(request, {
			cache: "no-store",
		});

		return response;
	} catch (error) {
		if (error instanceof Error) {
			throw new Error(`Payment status API error: ${error.message}`);
		}

		throw new Error("Unknown error retrieving payment status");
	}
}

/**
 * Server-side: Retrieves payment status using authorized server-side SDK context.
 * Used by Next.js server components or API routes that need authenticated access.
 *
 * @param params - Payment status request parameters
 * @returns Payment status response
 * @throws Error if API call fails
 */
export async function fetchPaymentStatus(
	params: PaymentStatusRequestParams
): Promise<NEXUZR006PaymentPaymentStatusResponse> {
	const { cookies } = await import("next/headers");

	const context = await getAuthorizedSdkClientContextForRequest({
		cookieStore: cookies(),
		headers: {
			"nexuz-client-ref": buildClientRef(),
		},
	});

	const paymentStatusApi = context.getApi(PaymentStatusApi);

	const request = buildPaymentStatusRequest(params);

	console.log("Payment Status Request:", request);

	try {
		const response = await paymentStatusApi.retrievePaymentStatus(request, {
			cache: "no-store",
		});

		return response;
	} catch (error) {
		if (error instanceof Error) {
			throw new Error(`Payment status API error: ${error.message}`);
		}

		throw new Error("Unknown error retrieving payment status");
	}
}
