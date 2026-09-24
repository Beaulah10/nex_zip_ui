import Icon from "@repo/ui/components/icon";
import { RadioGroup, RadioGroupItem } from "@repo/ui/components/radio-group";
import { useTranslations } from "next-intl";
import { BUNDLE_CODES } from "@/modules/utils/constants/bundle/bundle.constants";
import { applyBundleToAll as applyBundleToAllUnchecked } from "@/modules/utils/helpers/bundle/bundle.helpers";
import type { BundleId, PassengerBundleTableMobileProps } from "@/types/bundle/bundle.types";

/** Mobile passenger bundle table. */
export default function PassengerBundleTableMobile({
	isCollapsed,
	firstEntryUnavailable,
	isCollapsedInvalid,
	firstPassengerName,
	totalPassengerCount,
	passengers,
	bundles,
	allValue,
	isBundleDisabled,
	bundleCapacities,
	onApplyBundleToAllChange,
	onSelectionChange,
	onFlexBizRequest,
	onLimitedBundleAttempt,
	limitedCollapsedBundleIds,
	isCollapsedBundleLimited,
	invalidPassengerIds,
	selection,
	isPassengerBundleDisabled,
	mobileCollapsedHeaderClass,
	selectedBundleIds,
}: PassengerBundleTableMobileProps) {
	const t = useTranslations("bundle_page");
	const isFlexBizBundle = (bundleId: BundleId) => BUNDLE_CODES.FLEX_BIZ.includes(bundleId);
	const handleSelectionChange = (id: string, bundleId: BundleId) => {
		if (isFlexBizBundle(bundleId) && onFlexBizRequest) {
			onFlexBizRequest(id);
			return;
		}
		onSelectionChange(id, bundleId);
	};
	const applyBundleToAll = (value: BundleId, capacity: number | null) => {
		if (isCollapsedBundleLimited(value)) {
			onLimitedBundleAttempt(value);
			return;
		}
		if (isFlexBizBundle(value) && onFlexBizRequest) {
			onFlexBizRequest();
			return;
		}
		if (onApplyBundleToAllChange) {
			onApplyBundleToAllChange(value, capacity);
			return;
		}
		applyBundleToAllUnchecked(passengers, value, capacity, onSelectionChange);
	};
	return (
		<div className="overflow-hidden border-base-300 border-x border-b md:hidden [&>div:last-child>div.flex.bg-base-100>div:first-child>div:last-child]:border-b-0 [&>div:last-child>div:last-child>div]:border-b-0">
			{isCollapsed ? (
				<div>
					<div className={mobileCollapsedHeaderClass}>
						<Icon name="person" color="text-primary-700" fill={1} />
						<span className="flex flex-wrap items-center gap-x-1">
							<span>{firstPassengerName ?? t("selection_table_passenger")}</span>
							{totalPassengerCount > 1 && (
								<span>
									{totalPassengerCount > 2
										? t("selection_table_other_passengers_many", {
												count: totalPassengerCount - 1,
											})
										: t("selection_table_other_passengers_one", {
												count: totalPassengerCount - 1,
											})}
								</span>
							)}
						</span>
					</div>
					{firstEntryUnavailable ? (
						<div className="flex bg-base-100">
							<div className="flex min-h-10 flex-1 basis-0 items-center justify-center border-base-300 border-r bg-primary-50">
								<RadioGroup value="NOBN">
									<RadioGroupItem
										value="NOBN"
										disabled
										aria-label={t("aria_labels.no_bundle")}
										className="size-4 border-primary-700 bg-primary-700"
									/>
								</RadioGroup>
							</div>
							<div
								className={`flex min-h-10 items-center gap-2 px-4 font-bold text-primary-700 ${bundles.length === 3 ? "flex-2" : "flex-3"}`}
							>
								<Icon name="error" color="text-primary-700" />
								{t("selection_table_bundle_selection_unavailable")}
							</div>
						</div>
					) : (
						<div className="flex">
							{bundles.map((bundle) => {
								const disabled =
									isBundleDisabled(bundle.id) ||
									limitedCollapsedBundleIds.includes(bundle.id) ||
									(bundleCapacities?.get(bundle.id) ?? null) === 0;
								return (
									// biome-ignore lint/a11y/useSemanticElements: contains nested interactive RadioGroup that cannot be inside a <button>
									<div
										key={bundle.id}
										className={`flex min-h-10 flex-1 basis-0 items-center justify-center border-base-300 border-r border-b last:border-r-0 ${disabled ? "cursor-not-allowed bg-base-100" : allValue === bundle.id ? "cursor-pointer bg-primary-50" : isCollapsedInvalid ? "cursor-pointer bg-danger-100" : "cursor-pointer bg-white"}`}
										onClick={() => {
											if (!disabled) {
												applyBundleToAll(bundle.id, bundleCapacities?.get(bundle.id) ?? null);
											}
										}}
										onKeyDown={(e) => {
											if (!disabled && (e.key === "Enter" || e.key === " ")) {
												e.preventDefault();
												applyBundleToAll(bundle.id, bundleCapacities?.get(bundle.id) ?? null);
											}
										}}
										role="button"
										tabIndex={disabled ? -1 : 0}
									>
										<RadioGroup
											value={allValue ?? undefined}
											onValueChange={(value) =>
												applyBundleToAll(
													value as BundleId,
													bundleCapacities?.get(value as BundleId) ?? null
												)
											}
										>
											<RadioGroupItem
												value={bundle.id}
												aria-label={bundle.name}
												aria-invalid={isCollapsedInvalid && !disabled}
												disabled={disabled}
												indicator="check"
												className="size-4 border-base-300 data-[state=checked]:border-primary-700 data-[state=checked]:bg-primary-700"
											/>
										</RadioGroup>
									</div>
								);
							})}
						</div>
					)}
				</div>
			) : (
				passengers.map((entry) =>
					entry.kind === "unavailable-group" ? (
						<div key={entry.id}>
							<div className="border-base-300 border-b bg-base-50 font-bold text-sm">
								{entry.passengers.map((passenger) => (
									<div
										key={passenger.id}
										className="flex min-h-10 items-center gap-2 border-base-300 border-b px-4 last:border-b-0"
									>
										{typeof passenger.icon === "string" ? (
											<Icon name={passenger.icon} color="text-primary-700" fill={1} />
										) : (
											passenger.icon
										)}
										{passenger.name}
									</div>
								))}
							</div>
							<div className="flex bg-base-100">
								<div className="flex flex-1 basis-0 flex-col border-base-300 border-r">
									{entry.passengers.map((passenger, index) => (
										<div
											key={passenger.id}
											className={`flex min-h-10 items-center justify-center border-base-300 border-b ${index > 0 ? "border-t" : ""}`}
										>
											<RadioGroup value="NOBN">
												<RadioGroupItem
													value="NOBN"
													disabled
													aria-label={t("aria_labels.no_bundle")}
													className="size-4"
												/>
											</RadioGroup>
										</div>
									))}
								</div>
								<div
									className={`flex min-h-10 items-center gap-2 border-base-300 border-b px-4 font-bold text-primary-700 ${bundles.length === 3 ? "flex-2" : "flex-3"}`}
								>
									<Icon name="error" color="text-primary-700" />
									{entry.message}
								</div>
							</div>
						</div>
					) : (
						<div key={entry.id}>
							<div
								className={`flex items-center gap-2 border-base-300 border-b px-4 py-2.5 font-bold text-sm ${invalidPassengerIds?.has(entry.id) ? "bg-danger-100" : "bg-base-50"}`}
							>
								{typeof entry.icon === "string" ? (
									<Icon name={entry.icon} color="text-primary-700" fill={1} />
								) : (
									entry.icon
								)}
								{entry.name}
							</div>
							<div className="flex">
								{bundles.map((bundle) => {
									const selected = selection[entry.id] ?? null;
									const disabled = isPassengerBundleDisabled(bundle.id, entry.id);
									const invalid = invalidPassengerIds?.has(entry.id);
									const columnHighlighted = selectedBundleIds.has(bundle.id);
									return (
										// biome-ignore lint/a11y/useSemanticElements: contains nested interactive RadioGroup that cannot be inside a <button>
										<div
											key={bundle.id}
											className={`flex min-h-10 flex-1 basis-0 items-center justify-center border-base-300 border-r border-b last:border-r-0 ${disabled ? "cursor-not-allowed bg-base-100" : selected === bundle.id ? "cursor-pointer bg-primary-50" : invalid ? "cursor-pointer bg-danger-100" : columnHighlighted ? "cursor-pointer bg-primary-50" : "cursor-pointer bg-white"}`}
											onClick={() => {
												if (!disabled) handleSelectionChange(entry.id, bundle.id);
											}}
											onKeyDown={(e) => {
												if (!disabled && (e.key === "Enter" || e.key === " ")) {
													e.preventDefault();
													handleSelectionChange(entry.id, bundle.id);
												}
											}}
											role="button"
											tabIndex={disabled ? -1 : 0}
										>
											<RadioGroup
												value={selected ?? undefined}
												onValueChange={(value) =>
													handleSelectionChange(entry.id, value as BundleId)
												}
											>
												<RadioGroupItem
													value={bundle.id}
													aria-label={bundle.name}
													aria-invalid={invalid && !disabled}
													disabled={disabled}
													indicator="check"
													className="size-4 border-base-300 data-[state=checked]:border-primary-700 data-[state=checked]:bg-primary-700"
												/>
											</RadioGroup>
										</div>
									);
								})}
							</div>
						</div>
					)
				)
			)}
		</div>
	);
}
