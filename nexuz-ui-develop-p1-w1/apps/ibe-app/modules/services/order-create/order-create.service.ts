/**
 * File: order-create.service.ts
 * Description: Provides client-side and server-side utilities for invoking the
 * Create Order API through the SDK. Handles SDK context initialization,
 * authenticated request execution, custom middleware registration, client
 * reference header generation, and API configuration required for order
 * creation requests. Supports both browser and server environments while
 * ensuring consistent request headers, authorization context, and non-cached
 * booking order operations.
 */

import {
	CreateOrderApi,
	createSdkClientContext,
	getAuthorizedSdkClientContextForRequest,
	type Middleware,
	type NEXUZR005APIsCreateOrderRequest,
	type NEXUZR005APIsCreateOrderResponse,
} from "@repo/sdk";
import { buildClientRef } from "@repo/ui/lib";

export type CreateOrderRequest = {
	currency: string;
	language: string;
	nEXUZR005APIsCreateOrderRequest: NEXUZR005APIsCreateOrderRequest;
};

function createOrderMiddleware(): Middleware[] {
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

	return [clientRefMiddleware];
}

export async function createOrderBySdk(
	requestParameters: CreateOrderRequest
): Promise<NEXUZR005APIsCreateOrderResponse> {
	const origin = typeof window !== "undefined" ? window.location.origin : "";
	const baseUrl = origin ? `${origin}/booking/api` : "/booking/api";
	const context = createSdkClientContext({
		baseUrl,
		middleware: createOrderMiddleware(),
	});
	const createOrderApi = context.getApi(CreateOrderApi);

	return createOrderApi.createOrder(requestParameters, {
		cache: "no-store",
	});
}

export async function fetchCreateOrder(
	requestParameters: CreateOrderRequest
): Promise<NEXUZR005APIsCreateOrderResponse> {
	const { cookies } = await import("next/headers");
	const context = await getAuthorizedSdkClientContextForRequest({
		cookieStore: cookies(),
		headers: {
			"nexuz-client-ref": buildClientRef(),
		},
		middleware: createOrderMiddleware(),
	});
	const createOrderApi = context.getApi(CreateOrderApi);

	return createOrderApi.createOrder(requestParameters, {
		cache: "no-store",
	});
}
