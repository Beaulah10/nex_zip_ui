import { describe, expect, it, vi } from "vitest";
import {
	getAncillaryOffersApiError,
	getAncillaryOffersBoundaryError,
	getAncillaryOffersErrorCodeFromBoundaryError,
	getAncillaryOffersErrorTitleKey,
} from "./ancillary.errors";

vi.mock("@repo/sdk", () => ({
	COMMON_ERROR_CONFIG: [
		{
			status: 500,
			code: "SYSTEM_ERROR",
			titleKey: "system_error_title",
		},
	],

	getSdkApiError: vi.fn((error, fallback) => ({
		error,
		message: fallback,
	})),

	resolveErrorTitleKey: vi.fn((code, config, fallback) => {
		const match = config.find((item: { code: string }) => item.code === code);

		return match?.titleKey ?? fallback;
	}),

	getBoundaryErrorFromStatusCode: vi.fn((error, config, prefix) => {
		const match = config.find(
			(item: { status: number; code: string }) =>
				item.status === error?.status && item.code === error?.code
		);

		return match ? new Error(`${prefix}${match.code}`) : new Error(`${prefix}SYSTEM_ERROR`);
	}),

	getErrorCodeFromBoundaryError: vi.fn((error, prefix, config) => {
		if (!error?.message?.startsWith(prefix)) {
			return null;
		}

		const code = error.message.replace(prefix, "");

		return config.some((item: { code: string }) => item.code === code) ? code : null;
	}),
}));

describe("ancillary.errors", () => {
	it("returns normalized ancillary offers api error", () => {
		const result = getAncillaryOffersApiError(new Error("network"));

		expect(result).toEqual({
			error: expect.any(Error),
			message: "Unable to fetch ancillary offers",
		});
	});

	it("returns title key for supported 404 code", () => {
		expect(getAncillaryOffersErrorTitleKey("NEXUZCMNE004")).toBe("error_titles.NEXUZCMNE004");
	});

	it("returns title key for supported 422 code", () => {
		expect(getAncillaryOffersErrorTitleKey("NEXUZR004E101")).toBe("error_titles.NEXUZCMNE004");
	});

	it("creates boundary error for matching status/code", () => {
		const result = getAncillaryOffersBoundaryError({
			status: 404,
			code: "NEXUZCMNE004",
		});

		expect(result).toEqual(new Error("ANCILLARY_OFFERS_API_ERROR:NEXUZCMNE004"));
	});

	it("creates fallback boundary error for unknown status/code", () => {
		const result = getAncillaryOffersBoundaryError({
			status: 500,
			code: "UNKNOWN",
		});

		expect(result).toEqual(new Error("ANCILLARY_OFFERS_API_ERROR:SYSTEM_ERROR"));
	});

	it("returns null when boundary error is undefined", () => {
		expect(getAncillaryOffersErrorCodeFromBoundaryError(undefined)).toBeNull();
	});

	it("returns null when prefix does not match", () => {
		expect(
			getAncillaryOffersErrorCodeFromBoundaryError(new Error("OTHER_PREFIX:NEXUZCMNE004"))
		).toBeNull();
	});

	it("returns error code when message contains valid ancillary error code", () => {
		expect(
			getAncillaryOffersErrorCodeFromBoundaryError(
				new Error("ANCILLARY_OFFERS_API_ERROR:NEXUZCMNE004")
			)
		).toBe("NEXUZCMNE004");
	});

	it("returns null for unsupported error code", () => {
		expect(
			getAncillaryOffersErrorCodeFromBoundaryError(
				new Error("ANCILLARY_OFFERS_API_ERROR:UNKNOWN_CODE")
			)
		).toBeNull();
	});
});
