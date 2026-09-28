import { SdkRequestError } from "@repo/sdk";
import { describe, expect, it } from "vitest";
import {
	getAirportRoutesApiError,
	getAirportRoutesBoundaryError,
	getAirportRoutesBoundaryErrorFromCode,
	getAirportRoutesErrorCodeFromBoundaryError,
	getAirportRoutesErrorTitleKey,
} from "./airport-routes-utils";

describe("airport-routes-utils", () => {
	it("extracts api error details from sdk request errors", () => {
		const sdkError = new SdkRequestError({
			message: "Response returned an error code",
			method: "GET",
			responseBody: JSON.stringify({
				code: "NEXUZR002E001",
				description: "Failed to Retrieve Airport Route",
			}),
			status: 422,
			url: "http://localhost:3000/api/search/airport-routes",
		});

		expect(getAirportRoutesApiError(sdkError)).toEqual({
			status: 422,
			code: "NEXUZR002E001",
			description: "Failed to Retrieve Airport Route",
			message: "Failed to Retrieve Airport Route",
		});
	});

	it("handles invalid sdk response bodies safely", () => {
		const invalidJsonError = new SdkRequestError({
			message: "Response returned an error code",
			method: "GET",
			responseBody: "not-json",
			status: 500,
			url: "http://localhost:3000/api/search/airport-routes",
		});

		expect(getAirportRoutesApiError(invalidJsonError)).toEqual({
			status: 500,
			message: "Response returned an error code",
		});
	});

	it("builds boundary errors for supported and generic server errors", () => {
		expect(getAirportRoutesBoundaryError({ status: 422, code: "NEXUZR002E001" })?.message).toBe(
			"AIRPORT_ROUTES_API_ERROR:NEXUZR002E001"
		);
		expect(getAirportRoutesBoundaryError({ status: 503, code: undefined })?.message).toBe(
			"AIRPORT_ROUTES_API_ERROR:GENERIC"
		);
		expect(getAirportRoutesBoundaryError({ status: 400, code: undefined })).toBeNull();
	});

	it("creates code-based boundary errors and extracts supported codes", () => {
		expect(getAirportRoutesBoundaryErrorFromCode("NEXUZCMNE001")?.message).toBe(
			"AIRPORT_ROUTES_API_ERROR:NEXUZCMNE001"
		);
		expect(getAirportRoutesBoundaryErrorFromCode("UNKNOWN")?.message).toBe(
			"AIRPORT_ROUTES_API_ERROR:GENERIC"
		);

		expect(
			getAirportRoutesErrorCodeFromBoundaryError({
				message: "AIRPORT_ROUTES_API_ERROR:NEXUZCMNE002",
			})
		).toBe("NEXUZCMNE002");
		expect(
			getAirportRoutesErrorCodeFromBoundaryError({ message: "AIRPORT_ROUTES_API_ERROR:GENERIC" })
		).toBeNull();
	});

	it("resolves title keys and falls back for unknown codes", () => {
		expect(getAirportRoutesErrorTitleKey("NEXUZR002E001")).toBe("error_titles.NEXUZR002E001");
		expect(getAirportRoutesErrorTitleKey("NEXUZCMNE003")).toBe("error_titles.NEXUZCMNE003");
	});
});
