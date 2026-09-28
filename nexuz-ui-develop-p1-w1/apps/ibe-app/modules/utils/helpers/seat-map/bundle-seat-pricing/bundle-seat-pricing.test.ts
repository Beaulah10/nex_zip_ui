import type { NEXUZR004OffersCategory, NEXUZR004OffersPassengerType } from "@repo/sdk/swagger";
import { describe, expect, it } from "vitest";
import {
	getBundleSeatPrice,
	getBundleSeatServiceCodes,
	getSeatLegendServiceCode,
} from "@/modules/utils/helpers/seat-map/bundle-seat-pricing/bundle-seat-pricing";

function createOfferCategory(category: string, serviceCodes: string[]): NEXUZR004OffersCategory {
	return {
		category,
		services: serviceCodes.map((code) => ({
			code,
			quantityAvailable: 1,
			description: code,
		})),
	};
}

function createBundlePassengerType(
	categories: NEXUZR004OffersCategory[]
): NEXUZR004OffersPassengerType {
	return {
		type: "ADT",
		amount: 0,
		bundleQuantity: 1,
		actualQuantity: 1,
		categoryId: 1,
		serviceId: 1,
		cutoffHours: 0,
		categories,
	};
}

describe("bundle-seat-pricing", () => {
	it("returns zero effective amount only for matching bundle seat service codes", () => {
		expect(
			getBundleSeatPrice({
				amount: 8000,
				serviceCode: "STOT",
				bundleSeatServiceCodes: new Set(["STFW", "STOT"]),
			})
		).toEqual({
			effectiveAmount: 0,
			isBundleIncluded: true,
			originalAmount: 8000,
		});

		expect(
			getBundleSeatPrice({
				amount: 8000,
				serviceCode: "STEX",
				bundleSeatServiceCodes: new Set(["STFW", "STOT"]),
			})
		).toEqual({
			effectiveAmount: 8000,
			isBundleIncluded: false,
			originalAmount: 8000,
		});
	});

	it("extracts only SEAT category service codes for the current passenger bundle", () => {
		expect([
			...getBundleSeatServiceCodes(
				{
					bundles: [
						{
							lfid: 101,
							pfid: 1,
							bundleCode: "FLBS",
							bundleCategory: createBundlePassengerType([
								createOfferCategory("SEAT", ["STFW", "STOT"]),
								createOfferCategory("MEAL", ["FLXE"]),
							]),
						},
					],
				},
				101
			),
		]).toEqual(["STFW", "STOT"]);
	});

	it("maps legend items to the correct seat service codes for each cabin", () => {
		expect(
			getSeatLegendServiceCode({
				itemId: "central-seat",
				cabinClass: "Standard",
			})
		).toBe("STOT");

		expect(
			getSeatLegendServiceCode({
				itemId: "central-seat",
				cabinClass: "ZipFullFlat",
			})
		).toBe("STZF");

		expect(
			getSeatLegendServiceCode({
				itemId: "selected",
				cabinClass: "Standard",
				selectedServiceCode: "STFW",
			})
		).toBe("STFW");
	});
});
