/**
 * File Name: route.ts
 *
 * Description:
 * retrieves seat map data from the backend service, and returns the response
 * with appropriate error handling.
 */

import { getSdkApiError, SdkRequestError } from "@repo/sdk";
import { NextResponse } from "next/server";
import {
	fetchSeatMap,
	type SerializableSeatMapRequest,
	toSdkRetrieveSeatMapRequest,
} from "@/modules/services/seat-map/seat-map.service";

/**
 * BFF route for offers seatMap.
 */
export async function POST(request: Request) {
	try {
		const rawBody: SerializableSeatMapRequest = await request.json();
		const sdkRequest = toSdkRetrieveSeatMapRequest(rawBody);
		const response = await fetchSeatMap(sdkRequest);
		return NextResponse.json(response);
	} catch (error) {
		const status = error instanceof SdkRequestError ? (error.status ?? 502) : 502;
		const apiError = getSdkApiError(error, "Unable to fetch seat map");

		return NextResponse.json(
			{
				error: apiError.message,
				...(apiError.code ? { code: apiError.code } : {}),
			},
			{ status: apiError.status ?? status }
		);
	}
}
