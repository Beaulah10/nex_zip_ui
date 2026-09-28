/**
 * File: order-prepare.service.ts
 * Description: Provides client-side and server-side utilities for invoking the
 * Order Prepare (Summary PNR) API through the SDK. Handles SDK context
 * initialization, authenticated request execution, request middleware
 * configuration, client reference header injection, and payload transformation
 * required for order preparation workflows. Includes service code normalization
 * logic to ensure ancillary service data is formatted according to backend API
 * expectations before submission.
 */
import {
	createSdkClientContext,
	getAuthorizedSdkClientContextForRequest,
	type Middleware,
	type NEXUZR005APIsSummaryRequest,
	type NEXUZR005APIsSummaryResponse,
	SummaryPNRApi,
} from "@repo/sdk";
import { buildClientRef } from "@repo/ui/lib";

export type OrderPrepareRequest = {
	currency: string;
	language: string;
	nEXUZR005APIsSummaryRequest: NEXUZR005APIsSummaryRequest;
};

type OrderPreparePassengerPayload = {
	services?: Array<Record<string, unknown> & { ssrCode?: string }>;
};

type OrderPreparePayload = {
	passengers?: OrderPreparePassengerPayload[];
};

function rewriteOrderPrepareServiceCodes(body: RequestInit["body"]): RequestInit["body"] {
	if (typeof body !== "string") {
		return body;
	}

	const payload = JSON.parse(body) as OrderPreparePayload;

	if (!payload.passengers?.length) {
		return body;
	}

	return JSON.stringify({
		...payload,
		passengers: payload.passengers.map((passenger) => {
			if (!passenger.services?.length) {
				return passenger;
			}

			return {
				...passenger,
				services: passenger.services.map((service) => {
					if (typeof service.ssrCode !== "string" || service.ssrCode.length === 0) {
						return service;
					}

					const { ssrCode, ...rest } = service;
					return {
						...rest,
						serviceCode: ssrCode,
					};
				}),
			};
		}),
	});
}

function createOrderPrepareMiddleware(): Middleware[] {
	const clientRefMiddleware: Middleware = {
		pre: async (context) => {
			const headers = new Headers(context.init.headers);
			headers.set("nexuz-client-ref", buildClientRef());

			return {
				url: context.url,
				init: {
					...context.init,
					headers,
					body: rewriteOrderPrepareServiceCodes(context.init.body),
				},
			};
		},
	};

	return [clientRefMiddleware];
}

export async function prepareOrderBySdk(
	requestParameters: OrderPrepareRequest
): Promise<NEXUZR005APIsSummaryResponse> {
	const origin = typeof window !== "undefined" ? window.location.origin : "";
	const baseUrl = origin ? `${origin}/booking/api` : "/booking/api";
	const context = createSdkClientContext({
		baseUrl,
		middleware: createOrderPrepareMiddleware(),
	});
	const summaryPnrApi = context.getApi(SummaryPNRApi);

	return summaryPnrApi.summaryPNR(requestParameters, {
		cache: "no-store",
	});
}

export async function fetchOrderPrepare(
	requestParameters: OrderPrepareRequest
): Promise<NEXUZR005APIsSummaryResponse> {
	const { cookies } = await import("next/headers");
	const context = await getAuthorizedSdkClientContextForRequest({
		cookieStore: cookies(),
		headers: {
			"nexuz-client-ref": buildClientRef(),
		},
		middleware: createOrderPrepareMiddleware(),
	});
	const summaryPnrApi = context.getApi(SummaryPNRApi);

	return summaryPnrApi.summaryPNR(requestParameters, {
		cache: "no-store",
	});
}
