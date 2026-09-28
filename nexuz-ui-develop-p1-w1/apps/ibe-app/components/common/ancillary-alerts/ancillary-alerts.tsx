/**
 * File: ancillary-alerts.tsx
 * Description: Renders conditional alert banners for ancillary services, including service availability warnings,
 * bundle completion reminders, and stock availability notifications.
 */
import { Alert, AlertDescription, AlertTitle } from "@repo/ui/components/alert";
import { useTranslations } from "next-intl";
import type { AncillaryAlertsProps } from "@/types/customize/ancillary-services/ancillary-services.types";

/** Displays ancillary service banners for availability warnings, bundle requirements, and stock status. */
export default function AncillaryAlerts({
	showAncillaryBanner,
	ancillaryResult,
	showBundleCompletionAlert,
	bundleCompletionAlertData,
	showStockBanner,
	stockBannerData,
	showBaggageSegmentMismatchBanner,
	baggageSegmentMismatchBannerData,
}: AncillaryAlertsProps) {
	const t = useTranslations("ancillary_service");
	return (
		<>
			{showAncillaryBanner && ancillaryResult && (
				<div className="w-full rounded-md bg-error-100 py-3 text-error-700 text-sm leading-6">
					<Alert variant="error">
						<AlertTitle>{ancillaryResult.bannerTitle}</AlertTitle>
						<AlertDescription>{ancillaryResult.bannerDescription}</AlertDescription>
					</Alert>
				</div>
			)}
			{showBundleCompletionAlert && (
				<div className="w-full rounded-md bg-error-100 py-3 text-error-700 text-sm leading-6">
					<Alert variant="error">
						<AlertTitle>
							{bundleCompletionAlertData?.title ??
								t("error_labels.mandatory_bundle_selection_error_title")}
						</AlertTitle>
					</Alert>
				</div>
			)}
			{showStockBanner && stockBannerData && (
				<div className="w-full rounded-md bg-warning-100 py-3 text-sm text-warning-700 leading-6">
					<Alert variant="warning">
						<AlertTitle>{stockBannerData.title}</AlertTitle>
						<AlertDescription>{stockBannerData.description}</AlertDescription>
					</Alert>
				</div>
			)}
			{showBaggageSegmentMismatchBanner && baggageSegmentMismatchBannerData && (
				<div className="w-full rounded-md bg-error-100 py-3 text-error-700 text-sm leading-6">
					<Alert variant="error">
						<AlertTitle>{baggageSegmentMismatchBannerData.title}</AlertTitle>
						<AlertDescription>{baggageSegmentMismatchBannerData.description}</AlertDescription>
					</Alert>
				</div>
			)}
		</>
	);
}
