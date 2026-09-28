/**
 * File: flight-selection-assets.ts
 * Description: Maps AssetService Prismic assets to Flight Selection image assets.
 * Handles missing assets gracefully with fallback support.
 */

/**
 * Prismic image asset structure
 */
interface PrismicImageAsset {
	url?: string | null;
	alt?: string;
	title?: string;
	[key: string]: unknown;
}

/**
 * Flight Selection image asset interface.
 * All fields are optional to support graceful fallbacks.
 */
export interface FlightSelectionAssets {
	standardCabinDesktopImage?: PrismicImageAsset;
	standardCabinMobileImage?: PrismicImageAsset;
	zipfullflatCabinDesktopImage?: PrismicImageAsset;
	zipfullflatCabinMobileImage?: PrismicImageAsset;
}

/**
 * Maps Prismic global_assets document to Flight Selection image assets.
 *
 * @param assets - Raw response from AssetService (Record<string, unknown>)
 * @returns Strongly typed FlightSelectionAssets object with optional fields
 */
export function getFlightSelectionAssets(assets: Record<string, unknown>): FlightSelectionAssets {
	const isImageAsset = (value: unknown): value is PrismicImageAsset => {
		if (typeof value !== "object" || value === null || Array.isArray(value)) {
			return false;
		}

		const obj = value as Record<string, unknown>;
		return typeof obj.url === "string";
	};

	return {
		standardCabinDesktopImage: isImageAsset(assets.standard_cabin_desktop_image)
			? assets.standard_cabin_desktop_image
			: undefined,
		standardCabinMobileImage: isImageAsset(assets.standard_cabin_mobile_image)
			? assets.standard_cabin_mobile_image
			: undefined,
		zipfullflatCabinDesktopImage: isImageAsset(assets.zipfullflat_cabin_desktop_image)
			? assets.zipfullflat_cabin_desktop_image
			: undefined,
		zipfullflatCabinMobileImage: isImageAsset(assets.zipfullflat_cabin_mobile_image)
			? assets.zipfullflat_cabin_mobile_image
			: undefined,
	};
}
