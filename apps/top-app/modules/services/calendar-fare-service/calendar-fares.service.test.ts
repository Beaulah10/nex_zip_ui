import { describe, expect, it, vi } from "vitest";
import { fetchCalendarFares, searchCalendarFaresGetBySdk } from "./calendar-fares.service";

const {
	searchCalendarFaresGet,
	getApi,
	getAuthorizedSdkClientContextForRequest,
	createSdkClientContext,
	sdkClientContextOptions,
} = vi.hoisted(() => {
	const searchCalendarFaresGet = vi.fn<(...args: unknown[]) => Promise<unknown>>();
	const getApi = vi.fn((..._args: unknown[]) => ({ searchCalendarFaresGet }));
	const getAuthorizedSdkClientContextForRequest = vi.fn(async (..._args: unknown[]) => ({
		getApi,
	}));
	const sdkClientContextOptions = { value: undefined as unknown };
	const createSdkClientContext = vi.fn((options?: unknown) => {
		sdkClientContextOptions.value = options;
		return { getApi };
	});

	return {
		searchCalendarFaresGet,
		getApi,
		getAuthorizedSdkClientContextForRequest,
		createSdkClientContext,
		sdkClientContextOptions,
	};
});

vi.mock("@repo/sdk", () => ({
	SearchApi: class SearchApi {},
	getAuthorizedSdkClientContextForRequest,
	createSdkClientContext,
}));

vi.mock("next/headers", () => ({
	cookies: vi.fn(() => ({})),
}));

vi.mock("@repo/ui/lib", () => ({
	buildClientRef: vi.fn(() => "test-client-ref"),
}));

describe("fetchCalendarFares", () => {
	it("calls authorized SDK search endpoint", async () => {
		searchCalendarFaresGet.mockResolvedValueOnce({ data: { outbound: [] } });
		const params = {
			routes: "NRT,BKK",
			departureDateFrom: "2026-07-01",
			language: "en",
			currency: "JPY",
		};

		const result = await fetchCalendarFares(params);
		expect(getAuthorizedSdkClientContextForRequest).toHaveBeenCalledWith(
			expect.objectContaining({
				headers: {
					"nexuz-client-ref": expect.any(String),
				},
			})
		);
		expect(searchCalendarFaresGet).toHaveBeenCalledWith(params, { cache: "no-store" });
		expect(result).toEqual({ data: { outbound: [] } });
	});
});

describe("searchCalendarFaresGetBySdk", () => {
	it("calls SDK with locale-aware BFF base URL", async () => {
		searchCalendarFaresGet.mockResolvedValueOnce({ data: { outbound: [] } });
		const params = {
			routes: "NRT,BKK",
			departureDateFrom: "2026-07-01",
			language: "en",
			currency: "JPY",
		};

		const result = await searchCalendarFaresGetBySdk(params);
		expect(createSdkClientContext).toHaveBeenCalled();
		const sdkContextOptions = sdkClientContextOptions.value as any;
		const middleware = sdkContextOptions?.middleware?.[0] as
			| {
					pre: (context: { url: string; init: { headers: Headers } }) => Promise<{
						url: string;
						init: { headers: Headers };
					}>;
			  }
			| undefined;
		expect(middleware).toBeDefined();
		if (!middleware) {
			throw new Error("Expected SDK middleware to be defined");
		}
		const middlewareResult = await middleware.pre({
			url: "https://example.com",
			init: { headers: new Headers() },
		});
		expect(new Headers(middlewareResult.init.headers).get("nexuz-client-ref")).toBe(
			"test-client-ref"
		);
		expect(getApi).toHaveBeenCalled();
		expect(searchCalendarFaresGet).toHaveBeenCalledWith(params, { cache: "no-store" });
		expect(result).toEqual({ data: { outbound: [] } });
	});
});
