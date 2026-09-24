import { SdkRequestError, type SearchCalendarFaresGetRequest } from "@repo/sdk";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { NextResponse } from "next/server";
import { fetchCalendarFares } from "@/modules/services/calendar-fare-service/calendar-fares.service";
import { getCalendarFaresApiError } from "@/modules/utils/helpers/calendar-fare/calendar-fare-utils";

/**
 * Handles calendar fares search requests for the localized API route.
 *
 * Common query parameters:
 * - `routes`
 * - `departureDateFrom`
 * - `language`
 * - `currency`
 *
 * Optional query parameters:
 * - `departureDateTo`
 * - `promoCode` or `promotionCode`
 *
 * Forwards the request to the calendar fares service and returns the SDK
 * response as JSON. Backend handles request validation and error codes.
 *
 * @param request - Incoming GET request containing the query string.
 * @returns A JSON response with calendar fares data or an error payload.
 */
export async function GET(request: Request) {
	try {
		const url = new URL(request.url);

		// Do not validate required inputs in this BFF route.
		// Backend owns validation and returns domain-specific error codes.
		const routes = url.searchParams.get("routes")?.trim() ?? "";
		const departureDateFrom = url.searchParams.get("departureDateFrom")?.trim() ?? "";
		const language = url.searchParams.get("language")?.trim() ?? "";
		const currency = url.searchParams.get("currency")?.trim() ?? "";

		const params: SearchCalendarFaresGetRequest = {
			routes,
			departureDateFrom,
			departureDateTo: url.searchParams.get("departureDateTo")?.trim() || undefined,
			language,
			currency,
			promotionCode:
				url.searchParams.get("promoCode")?.trim() ||
				url.searchParams.get("promotionCode")?.trim() ||
				undefined,
		};

		const response = await fetchCalendarFares(params);

		// Response from SDK already has { data: {...} } structure
		return NextResponse.json(response);
	} catch (error) {
		if (isRedirectError(error)) {
			throw error;
		}

		const normalizedError =
			error instanceof SdkRequestError
				? getCalendarFaresApiError(error)
				: {
						status: 502,
						code: "NEXUZCMNE002",
						description: "Unable to fetch calendar fares",
						message: "Unable to fetch calendar fares",
					};

		return NextResponse.json(
			{
				code: normalizedError.code,
				description: normalizedError.description,
				message: normalizedError.message,
			},
			{ status: normalizedError.status }
		);
	}
}
