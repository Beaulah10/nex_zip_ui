import { Alert, AlertDescription, AlertTitle } from "@repo/ui/components/alert";
import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
import type { BundlePackageSelectionAlertsProps } from "@/types/bundle/bundle.types";

/** Bundle availability and deadline alerts. */
export default function BundlePackageSelectionAlerts({
	allBundlesUnavailable,
	isBundlePurchaseDeadlineExceeded,
	stageLabel,
	bundleDeadlineHours,
	unavailableBundleIds,
	showOutOfStockAlert,
	bundles,
	hasSelectionInteraction,
	limitedBundleIds,
	applyToAll,
	topValidationMessage,
	validationAttempt,
}: BundlePackageSelectionAlertsProps) {
	const t = useTranslations("bundle_page");
	const hasValidationError = Boolean(topValidationMessage);
	const [hasEncounteredValidationError, setHasEncounteredValidationError] =
		useState(hasValidationError);
	const lastValidationAttemptRef = useRef<number | null>(null);
	const shouldHideWarnings = hasValidationError || hasEncounteredValidationError;

	useEffect(() => {
		if (hasValidationError && lastValidationAttemptRef.current !== validationAttempt) {
			lastValidationAttemptRef.current = validationAttempt;
			setHasEncounteredValidationError(true);
			window.scrollTo({ top: 0, behavior: "smooth" });
		}
	}, [hasValidationError, validationAttempt]);

	return (
		<div className="px-4 md:px-0">
			{!shouldHideWarnings && allBundlesUnavailable && (
				<Alert variant="warning" className="w-full">
					<AlertTitle>{t("alerts_no_bundles_available_title", { stageLabel })}</AlertTitle>
					<AlertDescription>{t("alerts_no_bundles_available_description")}</AlertDescription>
				</Alert>
			)}
			{!shouldHideWarnings && isBundlePurchaseDeadlineExceeded && (
				<Alert variant="warning" className="w-full">
					<AlertTitle>{t("alerts_deadline_title", { stageLabel })}</AlertTitle>
					<AlertDescription>
						{t("alerts_deadline_description", { bundleDeadlineHours })}
					</AlertDescription>
				</Alert>
			)}
			{!shouldHideWarnings &&
				showOutOfStockAlert &&
				!allBundlesUnavailable &&
				unavailableBundleIds.length > 0 && (
					<Alert variant="warning" className="w-full">
						<AlertTitle>{t("alerts_out_of_stock_title")}</AlertTitle>
						<AlertDescription>
							{unavailableBundleIds.map((bundleId) => (
								<p key={bundleId}>
									{t("alerts_out_of_stock_description", {
										bundleName: bundles.find((bundle) => bundle.id === bundleId)?.name ?? "",
									})}
								</p>
							))}
						</AlertDescription>
					</Alert>
				)}
			{!shouldHideWarnings && hasSelectionInteraction && limitedBundleIds.length > 0 && (
				<Alert variant="warning" className="w-full">
					<AlertTitle>
						{t("alerts_limited_title", {
							stageLabel,
							passengersLabel: applyToAll
								? t("selection_table_passengers")
								: t("selection_table_other_passengers"),
						})}
					</AlertTitle>
					<AlertDescription>
						{applyToAll
							? t("alerts_limited_description_apply_to_all")
							: t("alerts_limited_description_other")}
					</AlertDescription>
				</Alert>
			)}
			{topValidationMessage && (
				<Alert variant="error" className="w-full">
					<AlertTitle>{topValidationMessage}</AlertTitle>
				</Alert>
			)}
		</div>
	);
}
