import { SdkRequestError, type SearchCalendarFaresGetRequest } from "@repo/sdk";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { NextResponse } from "next/server";
import { fetchCalendarFares } from "@/modules/services/calendar-fare-service/calendar-fares.service";

/**
 * Localized BFF route for calendar fares.
 */
export async function GET(request: Request) {
	try {
		const url = new URL(request.url);

		const routes = url.searchParams.get("routes")?.trim();
		const departureDateFrom = url.searchParams.get("departureDateFrom")?.trim();
		const language = url.searchParams.get("language")?.trim();
		const currency = url.searchParams.get("currency")?.trim();

		if (!routes || !departureDateFrom || !language || !currency) {
			return NextResponse.json(
				{
					error: "Missing required parameters: routes, departureDateFrom, language, currency",
				},
				{ status: 400 }
			);
		}

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
		return NextResponse.json(response);
	} catch (error) {
		if (isRedirectError(error)) {
			throw error;
		}

		const status = error instanceof SdkRequestError ? (error.status ?? 502) : 502;

		return NextResponse.json(
			{
				error: "Unable to fetch calendar fares",
			},
			{ status }
		);
	}
}
