import {
	type AssetService,
	createAssetService,
	getServerAssetSource,
} from "@repo/cms/services/asset-service";
import { type AppLocale, routing } from "../modules/utils/locales";

export type { AssetService };

/**
 * Asset Service Configuration for top-app
 *
 * Configures the asset service to fetch media from Prismic:
 * - Global assets document: "global_assets" (singleton)
 * - Locales: en, ja
 * - Locale mapping: en→en-us, ja→ja-jp
 *
 * Usage:
 * const assets = await getTopAppAssets("en");
 * assets.banner_image       // Image asset
 * assets.icon_set          // Icon collection
 * assets.pdf_guide         // PDF document
 * assets.video_content     // Video asset
 */

const assetService = createAssetService({
	applicationName: "top-app",
	defaultLocale: routing.defaultLocale,
	locales: routing.locales,
	globalAssetsDocumentType: "global_assets",
	prismicLocaleMap: {
		en: "en-us",
		ja: "ja-jp",
	},
});

/**
 * Fetch assets for top-app with automatic locale resolution and caching.
 *
 * @param locale - Application locale (e.g., "en", "ja")
 * @returns Complete Prismic asset document data (raw, uncontracted)
 *
 * @example
 * const assets = await getTopAppAssets("en");
 * // Returns raw Prismic document.data:
 * // {
 * //   banner_image: { url: "...", alt: "..." },
 * //   icon_set: { url: "...", alt: "..." },
 * //   pdf_guide: { url: "...", type: "pdf" },
 * //   video_content: { url: "...", thumbnail: "..." },
 * // }
 */
export const getTopAppAssets = assetService.getAssets;

/**
 * Normalize locale to app's supported locales.
 * Falls back to default locale if not recognized.
 */
export function resolveAssetLocale(locale: string | undefined): AppLocale {
	return assetService.resolveLocale(locale) as AppLocale;
}

export { getServerAssetSource };
