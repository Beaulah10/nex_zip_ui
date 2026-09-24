import { beforeEach, describe, expect, it, vi } from "vitest";

const {
	mockSearchRoutesGet,
	mockGetApi,
	mockGetAuthorizedSdkClientContextForRequest,
	mockAuthorizedContextOptions,
} = vi.hoisted(() => {
	const searchRoutesGet = vi.fn<(...args: unknown[]) => Promise<unknown>>();
	const getApi = vi.fn((..._args: unknown[]) => ({
		searchRoutesGet,
	}));
	const authorizedContextOptions = { value: undefined as unknown };
	const getContext = vi.fn(async (options?: unknown) => {
		authorizedContextOptions.value = options;
		return {
			getApi,
		};
	});

	return {
		mockSearchRoutesGet: searchRoutesGet,
		mockGetApi: getApi,
		mockGetAuthorizedSdkClientContextForRequest: getContext,
		mockAuthorizedContextOptions: authorizedContextOptions,
	};
});

vi.mock("@repo/sdk", () => ({
	SearchApi: Symbol("SearchApi"),
	getAuthorizedSdkClientContextForRequest: mockGetAuthorizedSdkClientContextForRequest,
}));

vi.mock("next/headers", () => ({
	cookies: vi.fn(() => ({})),
}));

vi.mock("@repo/ui/lib", () => ({
	buildClientRef: vi.fn(() => "test-client-ref"),
}));

import { SearchApi } from "@repo/sdk";
import { getRoutes } from "@/modules/services/flight-search/flight-search.services";

describe("getRoutes", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mockAuthorizedContextOptions.value = undefined;
	});

	it("uses trimmed language code and returns route data", async () => {
		const routeInfo = [[{ origin: "NRT", destination: "ICN" }]];
		mockSearchRoutesGet.mockResolvedValueOnce({
			data: { routeInfo },
		});

		const result = await getRoutes(" ja ");

		expect(mockGetAuthorizedSdkClientContextForRequest).toHaveBeenCalled();
		const requestContextOptions = mockAuthorizedContextOptions.value as any;
		const middleware = requestContextOptions?.middleware?.[0] as
			| {
					pre: (context: { url: string; init: { headers: Headers } }) => Promise<{
						url: string;
						init: { headers: Headers };
					}>;
			  }
			| undefined;
		expect(middleware).toBeDefined();
		if (!middleware) {
			throw new Error("Expected request middleware to be defined");
		}
		const middlewareResult = await middleware.pre({
			url: "https://example.com",
			init: { headers: new Headers() },
		});
		expect(new Headers(middlewareResult.init.headers).get("nexuz-client-ref")).toBe(
			"test-client-ref"
		);
		expect(mockGetApi).toHaveBeenCalledWith(SearchApi);
		expect(mockSearchRoutesGet).toHaveBeenCalledWith(
			{ language: "ja" },
			{
				cache: "force-cache",
				next: {
					revalidate: 900,
					tags: ["flight-routes", "flight-routes-ja"],
				},
			}
		);
		expect(result).toEqual(routeInfo);
	});

	it("falls back to english when language code is blank", async () => {
		mockSearchRoutesGet.mockResolvedValueOnce({
			data: { routeInfo: [] },
		});

		await getRoutes("   ");

		expect(mockGetAuthorizedSdkClientContextForRequest).toHaveBeenCalled();
		expect(mockSearchRoutesGet).toHaveBeenCalledWith(
			{ language: "en" },
			{
				cache: "force-cache",
				next: {
					revalidate: 900,
					tags: ["flight-routes", "flight-routes-en"],
				},
			}
		);
	});
});
