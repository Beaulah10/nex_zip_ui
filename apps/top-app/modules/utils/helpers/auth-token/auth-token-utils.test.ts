import { SdkRequestError } from "@repo/sdk";
import { describe, expect, it } from "vitest";
import {
	getAuthTokenApiError,
	getAuthTokenBoundaryErrorFromCode,
	getAuthTokenErrorCodeFromBoundaryError,
	getAuthTokenErrorTitleKey,
} from "./auth-token-utils";

describe("auth-token-utils", () => {
	it("extracts api error details from sdk request errors", () => {
		const sdkError = new SdkRequestError({
			message: "Response returned an error code",
			method: "POST",
			responseBody: JSON.stringify({
				code: "NEXUZR001E001",
				description: "Token WBS Call Failed",
			}),
			status: 422,
			url: "http://localhost:3000/auth/token",
		});

		expect(getAuthTokenApiError(sdkError)).toEqual({
			status: 422,
			code: "NEXUZR001E001",
			description: "Token WBS Call Failed",
			message: "Token WBS Call Failed",
		});
	});

	it("handles invalid sdk response bodies safely", () => {
		const invalidJsonError = new SdkRequestError({
			message: "Response returned an error code",
			method: "POST",
			responseBody: "not-json",
			status: 500,
			url: "http://localhost:3000/auth/token",
		});

		expect(getAuthTokenApiError(invalidJsonError)).toEqual({
			status: 500,
			message: "Response returned an error code",
		});
	});

	it("creates code-based boundary errors and extracts supported codes", () => {
		expect(getAuthTokenBoundaryErrorFromCode("NEXUZR001E001")?.message).toBe(
			"AUTH_TOKEN_API_ERROR:NEXUZR001E001"
		);
		expect(getAuthTokenBoundaryErrorFromCode("NEXUZCMNE002")?.message).toBe(
			"AUTH_TOKEN_API_ERROR:NEXUZCMNE002"
		);
		expect(getAuthTokenBoundaryErrorFromCode("UNKNOWN")?.message).toBe(
			"AUTH_TOKEN_API_ERROR:GENERIC"
		);

		expect(
			getAuthTokenErrorCodeFromBoundaryError({
				message: "AUTH_TOKEN_API_ERROR:NEXUZCMNE003",
			})
		).toBe("NEXUZCMNE003");
		expect(
			getAuthTokenErrorCodeFromBoundaryError({ message: "AUTH_TOKEN_API_ERROR:GENERIC" })
		).toBeNull();
	});

	it("resolves title keys for endpoint and common errors", () => {
		expect(getAuthTokenErrorTitleKey("NEXUZR001E001")).toBe("error_titles.NEXUZR001E001");
		expect(getAuthTokenErrorTitleKey("NEXUZCMNE002")).toBe("error_titles.NEXUZCMNE002");
	});
});
