import { notFound } from "next/navigation";
import { Customize } from "@/components/customize/customize";
import { getIbeAssets } from "@/i18n/asset-service-config";
import { getBookingDirectionFromStage } from "@/modules/utils/helpers/common/flow-router/flow-router";
import { getCustomizeAssets } from "@/modules/utils/helpers/customize/customize-assets";

export default async function CustomizeStagePage({
	params,
}: {
	params: Promise<{ locale: string; stage: string }>;
}) {
	const { locale, stage } = await params;
	const direction = getBookingDirectionFromStage(stage);

	const assets = await getIbeAssets(locale);
	// Map Prismic assets to Customize-specific structure
	const customizeAssets = getCustomizeAssets(assets);

	if (!direction) {
		notFound();
	}

	return (
		<div className="mx-auto max-w-5xl">
			<Customize locale={locale} direction={direction} customizeAssets={customizeAssets} />
		</div>
	);
}
