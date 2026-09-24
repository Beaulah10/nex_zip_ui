import type { Metadata } from "next";
import { FlightSelection } from "@/components/flight-selection/flight-selection";
import { getIbeAssets } from "@/i18n/asset-service-config";
import { generatePageMetadata } from "@/modules/utils/common/meta-data";
import { getFlightSelectionAssets } from "@/modules/utils/helpers/flight-selection/flight-selection-assets";
import type { PageProps } from "@/types/common.type";

export default async function FlightSelectionPage({ params }: PageProps) {
	const { locale } = await params;
	const assets = await getIbeAssets(locale);
	const flightSelectionAssets = getFlightSelectionAssets(assets);

	return (
		<div className="mx-auto max-w-5xl">
			<FlightSelection locale={locale} flightSelectionAssets={flightSelectionAssets} />
		</div>
	);
}

/**
 * Generates dynamic metadata for the locale-specific layout segment.
 *
 * @param params - Route segment params containing the current `locale` slug
 *   (e.g. `"en"`, `"ja"`). Passed as a Promise in Next.js App Router.
 * @returns A Next.js {@link Metadata} object with at minimum the page `title`
 *   translated into the requested locale.
 *
 * @example
 * // Result for locale "en": { title: "ZIPAIR" }
 */
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
	return generatePageMetadata({ params, namespace: "flight_selection_page" });
}
