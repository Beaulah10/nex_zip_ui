import { useTranslations } from "next-intl";
import { useRef } from "react";
import BundleComparisonTable from "@/components/bundle/bundle-package-selection/bundle-offer-overview/bundle-comparison-table/bundle-comparison-table";
import BundlePriceCards from "@/components/bundle/bundle-package-selection/bundle-offer-overview/bundle-price-cards/bundle-price-cards";
import TicketChangeOptionDialog from "@/components/bundle/bundle-package-selection/bundle-offer-overview/ticket-change-option-dialog/ticket-change-option-dialog";
import UnavailableAlert from "@/components/bundle/bundle-package-selection/bundle-offer-overview/unavailable-alert/unavailable-alert";
import { getTranslatedBundleFeatures } from "@/modules/utils/constants/bundle/bundle-offer-overview.translations";
import type { BundleOfferOverviewProps } from "@/types/bundle/bundle.types";

/** Bundle offer comparison panel. */
export default function BundleOfferOverview({
	bundles,
	hasFlexBizData,
	isICNRoute,
	isYvrRoute,
	showEligibilityBanner,
	onFlexBizRequest,
	onFlexBizOpen,
	flexBizDialogOpen,
	onFlexBizDialogOpenChange,
}: BundleOfferOverviewProps) {
	const t = useTranslations("bundle_page");
	const features = getTranslatedBundleFeatures(t, isICNRoute);
	const flexBizTriggerRef = useRef<HTMLButtonElement | null>(null);

	return (
		<>
			{showEligibilityBanner && <UnavailableAlert isYvrRoute={isYvrRoute} />}
			<div className="flex w-full flex-col gap-4">
				<BundlePriceCards
					bundles={bundles}
					hasFlexBizData={hasFlexBizData}
					onFlexBizRequest={onFlexBizOpen}
					triggerRef={flexBizTriggerRef}
				/>
				<BundleComparisonTable bundles={bundles} features={features} />
				<TicketChangeOptionDialog
					open={flexBizDialogOpen}
					onOpenChange={onFlexBizDialogOpenChange}
					onConfirm={onFlexBizRequest}
					triggerRef={flexBizTriggerRef}
				/>
			</div>
		</>
	);
}
