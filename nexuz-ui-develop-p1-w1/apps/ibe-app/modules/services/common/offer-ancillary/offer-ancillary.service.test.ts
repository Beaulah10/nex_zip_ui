import * as sdk from "@repo/sdk";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
	fetchOfferAncillaries,
	retrieveOfferAncillariesBySdk,
	toSdkOffersAncillariesPostRequest,
} from "@/modules/services/common/offer-ancillary/offer-ancillary.service";

const offersAncillariesPostMock = vi.fn();

vi.mock("@repo/ui/lib", () => ({
	buildClientRef: vi.fn(() => "test-client-ref"),
}));

vi.mock("@repo/sdk", () => ({
	AncillariesApi: class {},
	createSdkClientContext: vi.fn(),
	getAuthorizedSdkClientContextForRequest: vi.fn(),
}));

vi.mock("next/headers", () => ({
	cookies: vi.fn(() => ({}) as any),
}));

describe("offers-ancillaries", () => {
	const request: any = {
		currency: "JPY",
		departureDate: "2026-08-20",
		lfid: 123,
		origin: "NRT",
		destination: "CTS",
		serviceCategory: "TRANSPORT",
		passengers: {
			adults: 1,
		},
	};

	beforeEach(() => {
		vi.clearAllMocks();

		offersAncillariesPostMock.mockResolvedValue({
			success: true,
		});

		vi.mocked(sdk.createSdkClientContext).mockReturnValue({
			getApi: vi.fn().mockReturnValue({
				offersAncillariesPost: offersAncillariesPostMock,
			}),
		} as any);

		vi.mocked(sdk.getAuthorizedSdkClientContextForRequest).mockResolvedValue({
			getApi: vi.fn().mockReturnValue({
				offersAncillariesPost: offersAncillariesPostMock,
			}),
		} as any);
	});

	describe("toSdkOffersAncillariesPostRequest", () => {
		it("should transform request", () => {
			const result = toSdkOffersAncillariesPostRequest(request);

			expect(result.currency).toBe("JPY");

			expect(result.nEXUZR004OffersAncillaryRequest).toEqual({
				departureDate: request.departureDate,
				lfid: request.lfid,
				origin: request.origin,
				destination: request.destination,
				serviceCategory: request.serviceCategory,
				passengers: request.passengers,
			});
		});

		it("should clone passengers", () => {
			const result = toSdkOffersAncillariesPostRequest(request);

			expect(result.nEXUZR004OffersAncillaryRequest.passengers).not.toBe(request.passengers);
		});
	});

	describe("retrieveOfferAncillariesBySdk", () => {
		it("should use browser origin", async () => {
			Object.defineProperty(globalThis, "window", {
				configurable: true,
				value: {
					location: {
						origin: "https://example.com",
					},
				},
			});

			await retrieveOfferAncillariesBySdk(request);

			expect(sdk.createSdkClientContext).toHaveBeenCalledWith(
				expect.objectContaining({
					baseUrl: "https://example.com/booking/api",
				})
			);
		});

		it("should invoke offersAncillariesPost", async () => {
			await retrieveOfferAncillariesBySdk(request);

			expect(offersAncillariesPostMock).toHaveBeenCalledTimes(1);

			expect(offersAncillariesPostMock).toHaveBeenCalledWith(expect.any(Object), {
				cache: "no-store",
			});
		});
	});

	describe("fetchOfferAncillaries", () => {
		it("should create authorized context", async () => {
			await fetchOfferAncillaries(request);

			expect(sdk.getAuthorizedSdkClientContextForRequest).toHaveBeenCalled();
		});

		it("should call api with no-store cache", async () => {
			await fetchOfferAncillaries(request);

			expect(offersAncillariesPostMock).toHaveBeenCalledWith(expect.any(Object), {
				cache: "no-store",
			});
		});

		it("should return response", async () => {
			const response = {
				test: true,
			};

			offersAncillariesPostMock.mockResolvedValueOnce(response);

			const result = await fetchOfferAncillaries(request);

			expect(result).toEqual(response);
		});
	});
});
