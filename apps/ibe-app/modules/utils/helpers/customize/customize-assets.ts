/**
 * File: customize-assets.ts
 * Description: Maps AssetService Prismic assets to Customize page component.
 * Handles missing assets gracefully with fallback support.
 * Single source of truth for asset field mapping.
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
 * Customize page asset interface
 * All fields are optional to support graceful fallbacks
 */
export interface CustomizeAssets {
	seatImage?: PrismicImageAsset;
	baggageImage?: PrismicImageAsset;
	mealImage?: PrismicImageAsset;
	expressServiceImage?: PrismicImageAsset;
	// Lounge images
	naritaLoungeImage?: PrismicImageAsset;
	bangkokLoungeImage?: PrismicImageAsset;
	singaporeLoungeImage?: PrismicImageAsset;
	honoluluLoungeImage?: PrismicImageAsset;
	transportServiceImage?: PrismicImageAsset;
}

/**
 * Maps Prismic global_assets document to Customize-specific asset structure.
 *
 * Maps the following Prismic fields to Customize assets:
 * - seat_image → seatImage
 * - baggage_image → baggageImage
 * - meal_image → mealImage
 * - express_service_image → expressServiceImage
 * - transport_service_image → transportServiceImage
 *
 * @param assets - Raw response from AssetService (Record<string, unknown>)
 * @returns Strongly typed CustomizeAssets object with optional fields
 *
 * @example
 * const assets = await getIbeAppAssets(locale);
 * const customizeAssets = getCustomizeAssets(assets);
 * const seatImageUrl = customizeAssets.seatImage?.url ?? localSeatImage.src;
 */
export function getCustomizeAssets(assets: Record<string, unknown>): CustomizeAssets {
	// Type guard to check if a value is a valid image asset
	const isImageAsset = (value: unknown): value is PrismicImageAsset => {
		if (typeof value !== "object" || value === null || Array.isArray(value)) {
			return false;
		}
		const obj = value as Record<string, unknown>;
		// Minimal validation: must have a url property that is a string
		return typeof obj.url === "string";
	};

	return {
		seatImage: isImageAsset(assets.seat_image) ? assets.seat_image : undefined,
		baggageImage: isImageAsset(assets.baggage_image) ? assets.baggage_image : undefined,
		mealImage: isImageAsset(assets.inflight_meal) ? assets.inflight_meal : undefined,

		expressServiceImage: isImageAsset(assets.express_image) ? assets.express_image : undefined,

		naritaLoungeImage: isImageAsset(assets.narita_lounge_image)
			? assets.narita_lounge_image
			: undefined,

		bangkokLoungeImage: isImageAsset(assets.bangkok_lounge_image)
			? assets.bangkok_lounge_image
			: undefined,

		singaporeLoungeImage: isImageAsset(assets.singapore_lounge_image)
			? assets.singapore_lounge_image
			: undefined,

		honoluluLoungeImage: isImageAsset(assets.honolulu_lounge_image)
			? assets.honolulu_lounge_image
			: undefined,

		transportServiceImage: isImageAsset(assets.transport_service_image)
			? assets.transport_service_image
			: undefined,
	};
}
