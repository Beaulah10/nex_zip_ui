import { Alert, AlertTitle } from "@repo/ui/components/alert";
import Icon from "@repo/ui/components/icon";
import { Switch } from "@repo/ui/components/switch";
import { useTranslations } from "next-intl";
import PassengerBundleTableDesktop from "@/components/bundle/bundle-package-selection/passenger-bundle-selection/passenger-bundle-table-desktop/passenger-bundle-table-desktop";
import PassengerBundleTableMobile from "@/components/bundle/bundle-package-selection/passenger-bundle-selection/passenger-bundle-table-mobile/passenger-bundle-table-mobile";
import type {
	BundleId,
	PassengerBundleTableProps,
	PassengerEntry,
} from "@/types/bundle/bundle.types";

/** Passenger bundle table wrapper. */
export default function PassengerBundleTable({
	title,
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
	isBundleDisabled,
	bundleCapacities,
	validationMessage,
	invalidPassengerIds,
	purchaseDeadlineExceeded,
}: PassengerBundleTableProps) {
	const t = useTranslations("bundle_page");

	const isPassengerBundleDisabled = (bundleId: BundleId, passengerId: string) => {
		if (isBundleDisabled(bundleId)) return true;

		const capacity = bundleCapacities?.get(bundleId);
		// Explicitly disable zero inventory bundles
		if (capacity === 0) return true;
		if (capacity === undefined || selection[passengerId] === bundleId) return false;

		const selectedCount = Object.values(selection).filter((value) => value === bundleId).length;
		return selectedCount >= capacity;
	};

	const selectedBundleIds = new Set<BundleId>(
		Object.values(selection).filter((bundleId): bundleId is BundleId => Boolean(bundleId))
	);

	const firstPassengerId =
		passengers.length > 0 && passengers[0]?.kind === "passenger" ? passengers[0].id : null;
	const allValue = firstPassengerId ? (selection[firstPassengerId] ?? null) : null;

	const firstIndividualPassenger = passengers.find((p) => p.kind === "passenger") as
		| Extract<PassengerEntry, { kind: "passenger" }>
		| undefined;
	const firstPassenger = passengers[0];
	const firstEntryUnavailable =
		purchaseDeadlineExceeded || firstPassenger?.kind === "unavailable-group";
	const firstPassengerName =
		firstPassenger?.kind === "passenger"
			? firstPassenger.name
			: firstPassenger?.passengers[0]?.name;
	const hasUnaccompaniedPassenger = firstIndividualPassenger !== undefined;

	const totalPassengerCount = passengers.reduce(
		(count, entry) => count + (entry.kind === "passenger" ? 1 : entry.passengers.length),
		0
	);

	const showToggle =
		!purchaseDeadlineExceeded && totalPassengerCount > 1 && hasUnaccompaniedPassenger;
	const isCollapsed = purchaseDeadlineExceeded || (showToggle ? applyToAll : false);
	const isCollapsedBundleLimited = (bundleId: BundleId) => {
		if (bundleId === "NOBN") return false;
		const capacity = bundleCapacities?.get(bundleId);
		return capacity !== undefined && capacity < totalPassengerCount;
	};
	const isCollapsedInvalid = (invalidPassengerIds?.size ?? 0) > 0;
	const mobileCollapsedHeaderClass = `flex items-center gap-2 border-base-300 border-b px-4 py-2.5 font-bold text-sm ${!firstEntryUnavailable && isCollapsedInvalid ? "bg-danger-100" : "bg-base-50"}`;

	return (
		<section className="flex w-full flex-col gap-4">
			<div className="flex w-full flex-wrap items-center justify-between gap-3 px-4">
				<h2 className="flex items-center gap-2 font-bold text-2xl text-primary-700 leading-9">
					<Icon name="flight_takeoff" color="text-primary-700" fill={1} />
					{title}
				</h2>
				{showToggle && (
					<div className="flex items-center gap-2 font-medium text-sm">
						<span>{t("selection_table_apply_to_all")}</span>
						<Switch
							aria-label={t("aria_labels.select_bundle_for_all_travellers")}
							checked={!applyToAll}
							onCheckedChange={(checked) => onApplyToAllChange(!checked)}
						/>
					</div>
				)}
			</div>
			{validationMessage && (
				<Alert variant="error" className="w-full">
					<AlertTitle>{validationMessage}</AlertTitle>
				</Alert>
			)}
			<PassengerBundleTableDesktop
				isCollapsed={isCollapsed}
				firstEntryUnavailable={firstEntryUnavailable}
				isCollapsedInvalid={isCollapsedInvalid}
				firstPassengerName={firstPassengerName}
				totalPassengerCount={totalPassengerCount}
				passengers={passengers}
				bundles={bundles}
				allValue={allValue}
				isBundleDisabled={isBundleDisabled}
				bundleCapacities={bundleCapacities}
				onApplyBundleToAllChange={onApplyBundleToAllChange}
				onSelectionChange={onSelectionChange}
				onFlexBizRequest={onFlexBizRequest}
				onLimitedBundleAttempt={onLimitedBundleAttempt}
				limitedCollapsedBundleIds={limitedCollapsedBundleIds}
				isCollapsedBundleLimited={isCollapsedBundleLimited}
				invalidPassengerIds={invalidPassengerIds}
				selection={selection}
				isPassengerBundleDisabled={isPassengerBundleDisabled}
				selectedBundleIds={selectedBundleIds}
			/>
			<PassengerBundleTableMobile
				isCollapsed={isCollapsed}
				firstEntryUnavailable={firstEntryUnavailable}
				isCollapsedInvalid={isCollapsedInvalid}
				firstPassengerName={firstPassengerName}
				totalPassengerCount={totalPassengerCount}
				passengers={passengers}
				bundles={bundles}
				allValue={allValue}
				isBundleDisabled={isBundleDisabled}
				bundleCapacities={bundleCapacities}
				onApplyBundleToAllChange={onApplyBundleToAllChange}
				onSelectionChange={onSelectionChange}
				onFlexBizRequest={onFlexBizRequest}
				onLimitedBundleAttempt={onLimitedBundleAttempt}
				limitedCollapsedBundleIds={limitedCollapsedBundleIds}
				isCollapsedBundleLimited={isCollapsedBundleLimited}
				invalidPassengerIds={invalidPassengerIds}
				selection={selection}
				isPassengerBundleDisabled={isPassengerBundleDisabled}
				mobileCollapsedHeaderClass={mobileCollapsedHeaderClass}
				selectedBundleIds={selectedBundleIds}
			/>
		</section>
	);
}
