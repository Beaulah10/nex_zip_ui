import Icon from "@repo/ui/components/icon";
import { RadioGroup, RadioGroupItem } from "@repo/ui/components/radio-group";
import { Table, TableBody, TableCell, TableRow } from "@repo/ui/components/table";
import { useTranslations } from "next-intl";
import {
	BundleRadioCell,
	PassengerCell,
} from "@/components/bundle/bundle-package-selection/passenger-bundle-selection/bundle-table-cells/bundle-table-cells";
import { BUNDLE_CODES } from "@/modules/utils/constants/bundle/bundle.constants";
import { applyBundleToAll } from "@/modules/utils/helpers/bundle/bundle.helpers";
import type { BundleId, PassengerBundleTableDesktopProps } from "@/types/bundle/bundle.types";

/** Desktop passenger bundle table. */
export default function PassengerBundleTableDesktop({
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
	selectedBundleIds,
}: PassengerBundleTableDesktopProps) {
	const t = useTranslations("bundle_page");
	const isFlexBizBundle = (bundleId: BundleId) => BUNDLE_CODES.FLEX_BIZ.includes(bundleId);
	return (
		<div className="hidden w-full overflow-x-auto rounded-lg border border-base-300 md:block">
			<Table className="min-w-190 table-fixed">
				<colgroup>
					<col className="w-72" />
					{bundles.map((bundle) => (
						<col key={bundle.id} />
					))}
				</colgroup>
				<TableBody className="[&>tr]:border-b-0 [&_tr:last-child>td]:border-b-0">
					{isCollapsed ? (
						<TableRow>
							<TableCell
								className={`sticky left-0 z-10 border-base-300 border-r border-b px-6 py-2 font-bold text-sm ${!firstEntryUnavailable && isCollapsedInvalid ? "bg-danger-100" : "bg-white"}`}
							>
								<span className="flex items-center gap-2">
									<Icon name="person" color="text-primary-700" fill={1} />
									<span className="flex flex-col">
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
								</span>
							</TableCell>
							{firstEntryUnavailable ? (
								<>
									<TableCell className="border-base-300 border-r border-b bg-primary-50 text-center">
										<RadioGroup value="NOBN" className="flex items-center justify-center">
											<RadioGroupItem
												value="NOBN"
												disabled
												aria-label={t("aria_labels.no_bundle")}
												indicator="check"
												className="size-5 border-primary-700 bg-primary-700"
											/>
										</RadioGroup>
									</TableCell>
									<TableCell
										colSpan={bundles.length - 1}
										className="border-base-300 border-b bg-base-100 px-4"
									>
										<span className="flex items-center gap-2 font-bold text-primary-700 text-sm leading-6">
											<Icon name="error" color="text-primary-700" fill={1} />
											{t("selection_table_bundle_selection_unavailable")}
										</span>
									</TableCell>
								</>
							) : (
								bundles.map((bundle) => (
									<BundleRadioCell
										key={bundle.id}
										bundle={bundle}
										selected={allValue}
										onSelect={(value) => {
											if (isCollapsedBundleLimited(value)) {
												onLimitedBundleAttempt(value);
												return;
											}
											if (isFlexBizBundle(value) && onFlexBizRequest) {
												onFlexBizRequest();
												return;
											}
											if (onApplyBundleToAllChange) {
												onApplyBundleToAllChange(value, bundleCapacities?.get(value) ?? null);
												return;
											}

											applyBundleToAll(
												passengers,
												value,
												bundleCapacities?.get(value) ?? null,
												onSelectionChange
											);
										}}
										disabled={
											isBundleDisabled(bundle.id) || limitedCollapsedBundleIds.includes(bundle.id)
										}
										invalid={isCollapsedInvalid}
									/>
								))
							)}
						</TableRow>
					) : (
						passengers.map((entry) =>
							entry.kind === "unavailable-group" ? (
								<TableRow key={entry.id}>
									<TableCell className="sticky left-0 z-10 border-base-300 border-r border-b bg-white p-0 font-bold text-sm">
										{entry.passengers.map((passenger) => (
											<div
												key={passenger.id}
												className="flex h-12 items-center gap-2 border-base-300 border-b px-6 py-2 last:border-b-0"
											>
												{typeof passenger.icon === "string" ? (
													<Icon name={passenger.icon} color="text-primary-700" fill={1} />
												) : (
													passenger.icon
												)}
												{passenger.name}
											</div>
										))}
									</TableCell>
									<TableCell className="border-base-300 border-r border-b bg-base-100 p-0 text-center">
										{entry.passengers.map((passenger, index) => (
											<span
												key={passenger.id}
												className={`flex h-12 items-center justify-center py-2 ${index > 0 ? "border-base-300 border-t" : ""}`}
											>
												<RadioGroup value="NOBN">
													<RadioGroupItem
														value="NOBN"
														disabled
														aria-label={t("aria_labels.no_bundle")}
														indicator="check"
														className="size-5 border-base-400 bg-base-400 data-[state=checked]:border-base-400 data-[state=checked]:bg-base-400"
													/>
												</RadioGroup>
											</span>
										))}
									</TableCell>
									<TableCell
										colSpan={bundles.length - 1}
										className="border-base-300 border-b bg-base-100 px-4"
									>
										<span className="flex items-center gap-2 font-bold text-primary-700 text-sm leading-6">
											<Icon name="error" color="text-primary-700" fill={1} />
											{entry.message}
										</span>
									</TableCell>
								</TableRow>
							) : (
								<TableRow key={entry.id}>
									<PassengerCell passenger={entry} invalid={invalidPassengerIds?.has(entry.id)} />
									{bundles.map((bundle) => (
										<BundleRadioCell
											key={bundle.id}
											bundle={bundle}
											selected={selection[entry.id] ?? null}
											onSelect={(value) => {
												if (isFlexBizBundle(value) && onFlexBizRequest) {
													onFlexBizRequest(entry.id);
													return;
												}
												onSelectionChange(entry.id, value);
											}}
											disabled={isPassengerBundleDisabled(bundle.id, entry.id)}
											invalid={invalidPassengerIds?.has(entry.id)}
											columnHighlighted={selectedBundleIds.has(bundle.id)}
										/>
									))}
								</TableRow>
							)
						)
					)}
				</TableBody>
			</Table>
		</div>
	);
}
