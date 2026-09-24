import { useTranslations } from "next-intl";
import PassengerBundleTable from "@/components/bundle/bundle-package-selection/passenger-bundle-selection/passenger-bundle-table/passenger-bundle-table";
import { BookingFooter } from "@/components/common/booking-footer/booking-footer";
import type { PassengerBundleSelectionProps } from "@/types/bundle/bundle.types";
/** Passenger bundle selection section. */
export default function PassengerBundleSelection({
	stageLabel,
	passengers,
	bundles,
	applyToAll,
	onApplyToAllChange,
	onApplyBundleToAllChange,
	selection,
	onSelectionChange,
	onFlexBizRequest,
	onLimitedBundleAttempt,
	limitedCollapsedBundleIds,
	isBundleDisabled = () => false,
	bundleCapacities = null,
	validationMessage = null,
	invalidPassengerIds,
	purchaseDeadlineExceeded = false,
	onProceed,
}: PassengerBundleSelectionProps) {
	const t = useTranslations("bundle_page");
	const bundlePrices = new Map(bundles.map((bundle) => [bundle.id, bundle.price ?? 0]));
	const totalAmount = Object.values(selection).reduce(
		(total, bundleId) => total + (bundleId ? (bundlePrices.get(bundleId) ?? 0) : 0),
		0
	);

	return (
		<>
			<PassengerBundleTable
				title={t("bundle_selection_title", { stageLabel })}
				passengers={passengers}
				bundles={bundles}
				applyToAll={applyToAll}
				onApplyToAllChange={onApplyToAllChange}
				onApplyBundleToAllChange={onApplyBundleToAllChange}
				selection={selection}
				onSelectionChange={onSelectionChange}
				onFlexBizRequest={onFlexBizRequest}
				onLimitedBundleAttempt={onLimitedBundleAttempt}
				limitedCollapsedBundleIds={limitedCollapsedBundleIds}
				isBundleDisabled={isBundleDisabled}
				purchaseDeadlineExceeded={purchaseDeadlineExceeded}
				bundleCapacities={bundleCapacities}
				validationMessage={validationMessage}
				invalidPassengerIds={invalidPassengerIds}
			/>
			<div className="mx-4 md:mx-0">
				<BookingFooter amountValue={totalAmount} onProceed={onProceed} />
			</div>
		</>
	);
}
