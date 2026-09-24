import { AxiosError } from "axios";
import { NextResponse } from "next/server";
import { searchRoutes } from "@/modules/services/flight-selection/flight-selection.service";
import { getApiErrorMessage } from "@/modules/utils/common/api-error";

export async function GET(request: Request) {
	try {
		const url = new URL(request.url);
		const routes = url.searchParams.get("routes")?.trim();
		const departureDateFrom = url.searchParams.get("departureDateFrom")?.trim();
		const departureDateTo = url.searchParams.get("departureDateTo")?.trim();

		const adult = url.searchParams.get("adult")?.trim();
		const childA = url.searchParams.get("childA")?.trim();
		const childB = url.searchParams.get("childB")?.trim();
		const childC = url.searchParams.get("childC")?.trim();
		const infant = url.searchParams.get("infant")?.trim();
		const language = url.searchParams.get("language")?.trim();
		const currency = url.searchParams.get("currency")?.trim();
		const promotionCode = url.searchParams.get("promotionCode")?.trim();
		const payload = {
			routes,
			departureDateFrom,
			adult,
			...(childA ? { childA } : {}),
			...(childB ? { childB } : {}),
			...(childC ? { childC } : {}),
			...(infant ? { infant } : {}),
			language,
			currency,
			...(departureDateTo ? { departureDateTo } : {}),
			...(promotionCode ? { promotionCode } : {}),
		};

		// biome-ignore lint/suspicious/noConsole: Search flights diagnostics aligned with top-app calendar-fares logging
		console.info("[flight-selection][route] incoming request", {
			path: url.pathname,
			params: payload,
		});

		if (!routes || !departureDateFrom || !adult || !language || !currency) {
			// biome-ignore lint/suspicious/noConsole: Search flights diagnostics aligned with top-app calendar-fares logging
			console.info("[flight-selection][route] validation error", {
				path: url.pathname,
				params: payload,
			});

			return NextResponse.json(
				{
					error:
						"Missing required parameters: routes, departureDateFrom, adult, language, currency",
				},
				{ status: 400 }
			);
		}

		const response = await searchRoutes({
			routes,
			departureDateFrom,
			adult,
			...(childA ? { childA } : {}),
			...(childB ? { childB } : {}),
			...(childC ? { childC } : {}),
			...(infant ? { infant } : {}),
			language,
			currency,
			...(departureDateTo ? { departureDateTo } : {}),
			...(promotionCode ? { promotionCode } : {}),
		});

		// biome-ignore lint/suspicious/noConsole: Search flights diagnostics aligned with top-app calendar-fares logging
		console.info("[flight-selection][route] upstream success", {
			path: url.pathname,
			params: payload,
		});

		return NextResponse.json(response);
	} catch (error) {
		const status = error instanceof AxiosError ? (error.response?.status ?? 502) : 502;
		const message = getApiErrorMessage(error, "Unable to search routes");

		// biome-ignore lint/suspicious/noConsole: Search flights diagnostics aligned with top-app calendar-fares logging
		console.info("[flight-selection][route] upstream error", {
			status,
			message,
			error: error instanceof Error ? error.message : String(error),
		});

		return NextResponse.json(
			{
				error: message,
			},
			{ status }
		);
	}
}
