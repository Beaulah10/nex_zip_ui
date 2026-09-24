import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

/**
 * Parameters accepted by {@link generatePageMetadata}.
 *
 * @property params    - Next.js App Router route segment params containing the
 *   active `locale` slug (e.g. `"en"`, `"ja"`). Provided as a Promise.
 * @property namespace - The `next-intl` message namespace to look up. The
 *   namespace must expose a `title` key that holds the translated page title.
 */
type GeneratePageMetadataParams = {
	params: Promise<{ locale: string }>;
	namespace: string;
};

/**
 * Shared helper that generates Next.js {@link Metadata} for a page route.
 * Metadata resolution logic is not duplicated across routes.
 *
 * @param params - Route segment params containing the current `locale` slug.
 *   Passed as a Promise in Next.js App Router.
 * @param namespace - The `next-intl` message namespace used to look up the
 *   translated page title (e.g. `"flight_selection_page"`).
 * @returns A Next.js {@link Metadata} object with the `title` field set to the
 *   translated value of `<namespace>.title` for the active locale.
 */
export async function generatePageMetadata({
	params,
	namespace,
}: GeneratePageMetadataParams): Promise<Metadata> {
	const { locale } = await params;
	const pageTitle = await getTranslations({ locale, namespace });
	return {
		title: pageTitle("title"),
	};
}
