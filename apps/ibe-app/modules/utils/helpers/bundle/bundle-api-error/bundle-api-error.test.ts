import { SdkRequestError } from "@repo/sdk";
import { describe, expect, it } from "vitest";
import {
	getBundleApiError,
	getBundleBoundaryError,
	getBundleErrorCodeFromBoundaryError,
	getBundleErrorTitleKey,
} from "./bundle-api-error";

describe("bundle-api-error", () => {
	it("extracts api error details from sdk request errors", () => {
		const sdkError = new SdkRequestError({
			message: "Response returned an error code",
			method: "GET",
			responseBody: JSON.stringify({
				code: "NEXUZR004E001",
				description: "Bundle offer not available",
			}),
			status: 422,
			url: "http://localhost:3000/api/bundle/offers",
		});

		expect(getBundleApiError(sdkError)).toEqual({
			status: 422,
			code: "NEXUZR004E001",
			description: "Bundle offer not available",
			message: "Bundle offer not available",
		});
	});

	it("handles invalid sdk response bodies safely", () => {
		const invalidJsonError = new SdkRequestError({
			message: "Response returned an error code",
			method: "GET",
			responseBody: "not-json",
			status: 500,
			url: "http://localhost:3000/api/bundle/offers",
		});

		expect(getBundleApiError(invalidJsonError)).toEqual({
			status: 500,
			message: "Response returned an error code",
		});
	});

	it("normalizes plain errors and unknown values to fallback message", () => {
		expect(getBundleApiError(new Error("Network timeout"))).toEqual({
			status: 500,
			message: "Network timeout",
		});

		expect(getBundleApiError("string error")).toEqual({
			status: 500,
			message: "Unable to fetch bundle offers",
		});
	});

	it("resolves title keys for endpoint-specific, common, and unknown codes", () => {
		expect(getBundleErrorTitleKey("NEXUZR004E001")).toBe("error_titles.NEXUZR004E001");
		expect(getBundleErrorTitleKey("NEXUZR004E002")).toBe("error_titles.NEXUZR004E002");
		expect(getBundleErrorTitleKey("NEXUZR004E003")).toBe("error_titles.NEXUZR004E003");
		expect(getBundleErrorTitleKey("NEXUZCMNE004")).toBe("error_titles.NEXUZCMNE004");
		expect(getBundleErrorTitleKey("NEXUZCMNE001")).toBe("error_titles.NEXUZCMNE001");
		expect(getBundleErrorTitleKey("NEXUZCMNE002")).toBe("error_titles.NEXUZCMNE002");
		expect(getBundleErrorTitleKey("NEXUZCMNE003")).toBe("error_titles.NEXUZCMNE003");
	});

	it("builds boundary errors for matched status/code pairs", () => {
		expect(getBundleBoundaryError({ status: 422, code: "NEXUZR004E001" }).message).toBe(
			"BUNDLE_API_ERROR:NEXUZR004E001"
		);
		expect(getBundleBoundaryError({ status: 422, code: "NEXUZR004E002" }).message).toBe(
			"BUNDLE_API_ERROR:NEXUZR004E002"
		);
		expect(getBundleBoundaryError({ status: 422, code: "NEXUZR004E003" }).message).toBe(
			"BUNDLE_API_ERROR:NEXUZR004E003"
		);
		expect(getBundleBoundaryError({ status: 404, code: "NEXUZCMNE004" }).message).toBe(
			"BUNDLE_API_ERROR:NEXUZCMNE004"
		);
	});

	it("builds generic boundary error for 5xx status without code", () => {
		expect(getBundleBoundaryError({ status: 500, code: undefined }).message).toBe(
			"BUNDLE_API_ERROR:GENERIC"
		);
	});

	it("falls back to generic boundary error for non-5xx with no code or null input", () => {
		expect(getBundleBoundaryError({ status: 400, code: undefined }).message).toBe(
			"BUNDLE_API_ERROR:GENERIC"
		);
		expect(getBundleBoundaryError(null).message).toBe("BUNDLE_API_ERROR:GENERIC");
		expect(getBundleBoundaryError(undefined).message).toBe("BUNDLE_API_ERROR:GENERIC");
	});

	it("extracts known bundle error codes from boundary error messages", () => {
		expect(getBundleErrorCodeFromBoundaryError({ message: "BUNDLE_API_ERROR:NEXUZR004E001" })).toBe(
			"NEXUZR004E001"
		);
		expect(getBundleErrorCodeFromBoundaryError({ message: "BUNDLE_API_ERROR:NEXUZCMNE001" })).toBe(
			"NEXUZCMNE001"
		);
	});

	it("returns null for unknown suffix, wrong prefix, or null/undefined error", () => {
		expect(getBundleErrorCodeFromBoundaryError({ message: "BUNDLE_API_ERROR:GENERIC" })).toBeNull();
		expect(
			getBundleErrorCodeFromBoundaryError({ message: "OTHER_PREFIX:NEXUZR004E001" })
		).toBeNull();
		expect(getBundleErrorCodeFromBoundaryError(null)).toBeNull();
		expect(getBundleErrorCodeFromBoundaryError(undefined)).toBeNull();
	});
});
