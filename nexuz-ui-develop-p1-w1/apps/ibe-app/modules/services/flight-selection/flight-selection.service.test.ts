import { beforeEach, describe, expect, it, vi } from "vitest";
import { flightSelection, searchRoutes } from "./flight-selection.service";

const {
	searchFlights,
	getAuthorizedSdkClientContextForRequest,
	createSdkClientContext,
	cookiesMock,
} = vi.hoisted(() => {
	const searchFlights = vi.fn();
	const getApiMock = vi.fn(() => ({ searchFlights }));
	const getAuthorizedSdkClientContextForRequest = vi.fn(async () => ({ getApi: getApiMock }));
	const createSdkClientContext = vi.fn((options: unknown) => ({ getApi: getApiMock, options }));
	const cookiesMock = vi.fn(() => ({}));
	return {
		searchFlights,
		getApiMock,
		getAuthorizedSdkClientContextForRequest,
		createSdkClientContext,
		cookiesMock,
	};
});

vi.mock("@repo/sdk", () => ({
	SearchApi: class SearchApi {},
	getAuthorizedSdkClientContextForRequest,
	createSdkClientContext,
}));

vi.mock("@repo/ui/lib", () => ({
	buildClientRef: vi.fn(() => "test-client-ref"),
}));

vi.mock("next/headers", () => ({
	cookies: cookiesMock,
}));

const basePayload = {
	routes: "NRT,BKK",
	departureDateFrom: "2026-08-01",
	adult: "2",
	language: "en",
	currency: "JPY",
};

describe("flightSelection – client-side BFF call", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.stubGlobal("location", {
			origin: "http://localhost:3000",
			search: "?routes=NRT%2CBKK&departureDateFrom=2026-08-01&adult=2",
		});
	});

	it("builds baseUrl from origin, passes all params, and returns SDK response", async () => {
		const mockResponse = { data: { outbound: { flightsByDate: [] } } };
		searchFlights.mockResolvedValueOnce(mockResponse);

		const result = await flightSelection();

		expect(createSdkClientContext).toHaveBeenCalledWith(
			expect.objectContaining({ baseUrl: "http://localhost:3000/booking/api" })
		);
		expect(searchFlights).toHaveBeenCalledWith(
			expect.objectContaining({
				routes: "NRT,BKK",
				departureDateFrom: "2026-08-01",
				adult: "2",
				departureDateTo: "",
				childA: "",
				childB: "",
				childC: "",
				infant: "",
				language: "en",
				currency: "JPY",
			}),
			{ cache: "no-store" }
		);
		expect(result).toBe(mockResponse);
	});

	it("middleware pre hook injects nexuz-client-ref header", async () => {
		searchFlights.mockResolvedValueOnce({});

		await flightSelection();

		const fakeCtx = { url: "http://localhost/api", init: { headers: new Headers() } };
		const opts = createSdkClientContext.mock.calls[0]?.[0] as
			| { middleware?: Array<{ pre: (ctx: typeof fakeCtx) => Promise<typeof fakeCtx> }> }
			| undefined;
		if (!opts?.middleware?.[0]?.pre) {
			throw new Error("Expected middleware pre hook to be provided");
		}
		const result = await opts.middleware[0].pre(fakeCtx);
		expect(result.init.headers.get("nexuz-client-ref")).toBe("test-client-ref");
	});

	it.each([
		["routes", "?departureDateFrom=2026-08-01&adult=2"],
		["departureDateFrom", "?routes=NRT%2CBKK&adult=2"],
		["adult", "?routes=NRT%2CBKK&departureDateFrom=2026-08-01"],
	])("throws when %s param is missing", async (_param, search) => {
		vi.stubGlobal("location", { origin: "http://localhost:3000", search });
		await expect(flightSelection()).rejects.toThrow("Missing required search parameters");
	});
});

describe("searchRoutes – server-side authorized SDK call", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("calls authorized SDK with cookie store, client-ref header, and returns response", async () => {
		const fakeCookies = { get: vi.fn() };
		cookiesMock.mockReturnValueOnce(fakeCookies);
		const mockResponse = { data: { outbound: { flightsByDate: [] } } };
		searchFlights.mockResolvedValueOnce(mockResponse);

		const result = await searchRoutes(basePayload);

		expect(cookiesMock).toHaveBeenCalledTimes(1);
		expect(getAuthorizedSdkClientContextForRequest).toHaveBeenCalledWith(
			expect.objectContaining({
				cookieStore: fakeCookies,
				headers: { "nexuz-client-ref": "test-client-ref" },
			})
		);
		expect(searchFlights).toHaveBeenCalledWith(basePayload, { cache: "no-store" });
		expect(result).toBe(mockResponse);
	});
});
