import { SdkRequestError } from "@repo/sdk";
import { describe, expect, it, vi } from "vitest";
import { GET } from "./route";

const { mockFetchCalendarFares } = vi.hoisted(() => ({
	mockFetchCalendarFares: vi.fn(),
}));

vi.mock("@/modules/services/calendar-fare-service/calendar-fares.service", () => ({
	fetchCalendarFares: mockFetchCalendarFares,
}));

describe("calendar fares route", () => {
	it("forwards missing params to backend validation", async () => {
		mockFetchCalendarFares.mockRejectedValueOnce(
			new SdkRequestError({
				message: "Response returned an error code",
				method: "GET",
				responseBody: JSON.stringify({
					code: "NEXUZCMNE001",
					description: "Required Input is Missing",
				}),
				status: 400,
				url: "http://backend/search/calendar-fares",
			})
		);

		const request = new Request("http://localhost:3002/api/search/calendar-fares?routes=NRT,BKK");

		const response = await GET(request);
		const body = await response.json();

		expect(response.status).toBe(400);
		expect(body).toEqual({
			code: "NEXUZCMNE001",
			description: "Required Input is Missing",
			message: "Required Input is Missing",
		});
		expect(mockFetchCalendarFares).toHaveBeenCalledWith({
			routes: "NRT,BKK",
			departureDateFrom: "",
			language: "",
			currency: "",
			departureDateTo: undefined,
			promotionCode: undefined,
		});
	});

	it("forwards documented backend status and error code from sdk failures", async () => {
		mockFetchCalendarFares.mockRejectedValueOnce(
			new SdkRequestError({
				message: "Response returned an error code",
				method: "GET",
				responseBody: JSON.stringify({
					code: "NEXUZR002E051",
					description: "Requested Bound is not available",
				}),
				status: 404,
				url: "http://backend/search/calendar-fares",
			})
		);

		const request = new Request(
			"http://localhost:3002/api/search/calendar-fares?routes=NRT,BKK&departureDateFrom=2026-07-01&language=en&currency=JPY"
		);

		const response = await GET(request);
		const body = await response.json();

		expect(response.status).toBe(404);
		expect(body).toEqual({
			code: "NEXUZR002E051",
			description: "Requested Bound is not available",
			message: "Requested Bound is not available",
		});
	});

	it("returns fallback code for non-sdk failures", async () => {
		mockFetchCalendarFares.mockRejectedValueOnce(new Error("Network timeout"));

		const request = new Request(
			"http://localhost:3002/api/search/calendar-fares?routes=NRT,BKK&departureDateFrom=2026-07-01&language=en&currency=JPY"
		);

		const response = await GET(request);
		const body = await response.json();

		expect(response.status).toBe(502);
		expect(body).toEqual({
			code: "NEXUZCMNE002",
			description: "Unable to fetch calendar fares",
			message: "Unable to fetch calendar fares",
		});
	});
});
