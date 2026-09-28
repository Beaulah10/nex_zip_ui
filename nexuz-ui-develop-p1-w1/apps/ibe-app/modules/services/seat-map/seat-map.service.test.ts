import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
	fetchSeatMap,
	retrieveSeatMapBySdk,
	type SerializableSeatMapRequest,
	toSdkRetrieveSeatMapRequest,
} from "./seat-map.service";

const {
	createSdkClientContextMock,
	getAuthorizedSdkClientContextForRequestMock,
	retrieveSeatMapMock,
	buildClientRefMock,
	cookiesMock,
	sdkClientContextOptions,
} = vi.hoisted(() => {
	const retrieveSeatMapMock = vi.fn();
	const getApiMock = vi.fn(() => ({ retrieveSeatMap: retrieveSeatMapMock }));
	const sdkClientContextOptions = { value: undefined as unknown };
	const createSdkClientContextMock = vi.fn((options?: unknown) => {
		sdkClientContextOptions.value = options;
		return { getApi: getApiMock };
	});
	const getAuthorizedSdkClientContextForRequestMock = vi.fn(async () => ({ getApi: getApiMock }));
	const buildClientRefMock = vi.fn(() => "test-client-ref");
	const cookiesMock = vi.fn(() => ({ session: "cookie-store" }));

	return {
		createSdkClientContextMock,
		getAuthorizedSdkClientContextForRequestMock,
		retrieveSeatMapMock,
		buildClientRefMock,
		cookiesMock,
		sdkClientContextOptions,
	};
});

vi.mock("@repo/sdk", () => ({
	SeatMapApi: class SeatMapApi {},
	createSdkClientContext: createSdkClientContextMock,
	getAuthorizedSdkClientContextForRequest: getAuthorizedSdkClientContextForRequestMock,
}));

vi.mock("@repo/ui/lib", () => ({
	buildClientRef: buildClientRefMock,
}));

vi.mock("next/headers", () => ({
	cookies: cookiesMock,
}));

function makeSerializableSeatMapRequest(
	overrides: Partial<SerializableSeatMapRequest> = {}
): SerializableSeatMapRequest {
	return {
		cabin: "STANDARD",
		currency: "JPY",
		departureDateTime: "2026-09-01T12:00:00.000Z",
		routes: "NRT,BKK",
		logicalFlightId: 1234,
		...overrides,
	};
}

beforeEach(() => {
	vi.clearAllMocks();
	vi.unstubAllGlobals();
});

afterEach(() => {
	vi.unstubAllGlobals();
});

describe("toSdkRetrieveSeatMapRequest", () => {
	it("maps the serializable request into the SDK request shape", () => {
		const request = makeSerializableSeatMapRequest();

		expect(toSdkRetrieveSeatMapRequest(request)).toEqual({
			nEXUZR004OffersSeatMapRequest: {
				cabin: "STANDARD",
				currency: "JPY",
				departureDateTime: "2026-09-01T12:00:00.000Z",
				routes: "NRT,BKK",
				logicalFlightId: 1234,
			},
		});
	});
});

describe("retrieveSeatMapBySdk", () => {
	it("calls the SDK seat-map endpoint with a client-ref middleware and localized BFF base URL", async () => {
		retrieveSeatMapMock.mockResolvedValueOnce({ data: { cabins: [] } });
		const request = makeSerializableSeatMapRequest();

		const result = await retrieveSeatMapBySdk("en", request);

		expect(createSdkClientContextMock).toHaveBeenCalledWith(
			expect.objectContaining({
				baseUrl: expect.stringMatching(/\/booking\/api$/),
				middleware: expect.any(Array),
			})
		);

		const sdkContextOptions = sdkClientContextOptions.value as {
			middleware?: Array<{
				pre: (context: { url: string; init: { headers: Headers } }) => Promise<{
					url: string;
					init: { headers: Headers };
				}>;
			}>;
		};
		const middleware = sdkContextOptions.middleware?.[0];

		if (!middleware) {
			throw new Error("Expected client-ref middleware to be defined");
		}

		const middlewareResult = await middleware.pre({
			url: "https://example.com/offers/seatMap",
			init: { headers: new Headers({ existing: "value" }) },
		});

		expect(new Headers(middlewareResult.init.headers).get("client-ref")).toBe("test-client-ref");
		expect(new Headers(middlewareResult.init.headers).get("existing")).toBe("value");
		expect(retrieveSeatMapMock).toHaveBeenCalledWith(toSdkRetrieveSeatMapRequest(request), {
			cache: "no-store",
		});
		expect(result).toEqual({ data: { cabins: [] } });
	});

	it("falls back to the relative booking api path when window is unavailable", async () => {
		retrieveSeatMapMock.mockResolvedValueOnce({ data: { cabins: [] } });
		vi.stubGlobal("window", undefined);

		await retrieveSeatMapBySdk("en", makeSerializableSeatMapRequest());

		expect(createSdkClientContextMock).toHaveBeenCalledWith(
			expect.objectContaining({
				baseUrl: "/booking/api",
			})
		);
	});
});

describe("fetchSeatMap", () => {
	it("calls the authorized server-side SDK with cookies and client-ref header", async () => {
		retrieveSeatMapMock.mockResolvedValueOnce({ data: { cabins: [] } });
		const sdkRequest = toSdkRetrieveSeatMapRequest(makeSerializableSeatMapRequest());

		const result = await fetchSeatMap(sdkRequest);

		expect(getAuthorizedSdkClientContextForRequestMock).toHaveBeenCalledWith({
			cookieStore: { session: "cookie-store" },
			headers: {
				"client-ref": "test-client-ref",
			},
		});
		expect(retrieveSeatMapMock).toHaveBeenCalledWith(sdkRequest, { cache: "no-store" });
		expect(result).toEqual({ data: { cabins: [] } });
	});
});
