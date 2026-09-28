import {
	type AssetService,
	createAssetService,
	getServerAssetSource,
} from "@repo/cms/services/asset-service";
import { type AppLocale, routing } from "../modules/utils/locales";

export type { AssetService };

/**
 * Asset Service Configuration for ibe-app
 *
 * Configures the asset service to fetch media from Prismic:
 * - Global assets document: "global_assets" (singleton)
 * - Locales: en, ja
 * - Locale mapping: en→en-us, ja→ja-jp
 *
 * Usage:
 * const assets = await getIbeAssets("en");
 * assets.zipair_logo       // Image asset
 * assets.hero_banner       // Banner image
 * assets.cabin_image       // Product image
 * assets.airport_lounge    // Icon or PDF
 */

const assetService = createAssetService({
	applicationName: "ibe-app",
	defaultLocale: routing.defaultLocale,
	locales: routing.locales,
	globalAssetsDocumentType: "global_assets",
	prismicLocaleMap: {
		en: "en-us",
		ja: "ja-jp",
	},
});

/**
 * Fetch assets for ibe-app with automatic locale resolution and caching.
 *
 * @param locale - Application locale (e.g., "en", "ja")
 * @returns Complete Prismic asset document data (raw, uncontracted)
 *
 * @example
 * const assets = await getIbeAssets("en");
 * // Returns raw Prismic document.data:
 * // {
 * //   zipair_logo: { url: "...", alt: "..." },
 * //   hero_banner: { url: "...", alt: "..." },
 * //   cabin_image: { url: "...", alt: "..." },
 * // }
 */
export const getIbeAssets = assetService.getAssets;

/**
 * Normalize locale to app's supported locales.
 * Falls back to default locale if not recognized.
 */
export function resolveAssetLocale(locale: string | undefined): AppLocale {
	return assetService.resolveLocale(locale) as AppLocale;
}

export { getServerAssetSource };
