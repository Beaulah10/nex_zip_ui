/**
 * File: summary-row.tsx
 * Description: Renders a detailed fare summary row within a passenger summary card,
 * displaying grouped booking items, pricing information, optional notes, and change actions.
 * Used to present fare components such as bundles, baggage, seats, and ancillary services.
 */
import { Button } from "@repo/ui/components/button";
import Icon from "@repo/ui/components/icon";
import { cn } from "@repo/ui/lib";
import { useTranslations } from "next-intl";
import { formatPrice } from "@/modules/utils/helpers/currency-formatter";
import type { SummaryRowProps } from "@/types/confirmation/confirmation.types";

/** Single labeled row of the passenger price-summary accordion, e.g. "Bundle" or "Baggage". */
export function SummaryRow({
	passengerName,
	icon,
	label,
	groups,
	changeLabel,
	actionDisabled,
	onChange,
	changeDisabled = false,
	unavailableStatus,
	className,
}: SummaryRowProps) {
	const t = useTranslations("confirmation_page");
	return (
		<div
			className={cn(
				"summary-row flex flex-col gap-2 md:flex-row md:items-center md:gap-4",
				className
			)}
		>
			{/* Mobile: label and Change/Add button share a row; the button moves inside the box on desktop. */}
			<div className="flex items-start justify-between gap-2 md:w-[390px] md:max-w-[390px] md:shrink-0">
				<div className="summary-row__label flex min-w-0 items-center gap-2">
					<Icon name={icon} size={24} fill={1} className="shrink-0 text-primary-700" />
					<span className="break-words font-bold text-brand-japan-black text-xl leading-8">
						{label}
					</span>
				</div>
				{changeLabel && (onChange || changeDisabled) && (
					<Button
						aria-label={
							passengerName
								? t("aria_labels.service_change_add_button_passenger", {
										changeLabel,
										label,
										passengerName,
									})
								: t("aria_labels.service_change_add_button", {
										changeLabel,
										label,
									})
						}
						variant="primary"
						outline
						size="md"
						disabled={actionDisabled || changeDisabled}
						onClick={onChange}
						className="shrink-0 rounded-lg px-4 md:hidden"
					>
						{changeLabel}
					</Button>
				)}
			</div>

			<div className="summary-row__box flex flex-1 flex-col items-stretch gap-3 rounded-lg border border-base-300 bg-white p-4 md:flex-row md:items-center md:gap-4">
				<div className="flex flex-1 flex-col gap-2">
					{unavailableStatus ? (
						<span className="font-normal text-base text-base-500 leading-6">
							{unavailableStatus}
						</span>
					) : (
						groups.map((group, groupIndex) => (
							<div
								key={group.items[0]?.label ?? groupIndex}
								className={cn(
									"flex flex-col gap-2",
									groupIndex > 0 && "border-base-200 border-t pt-2"
								)}
							>
								{group.items.map((item) => (
									<div key={item.label} className="flex flex-col gap-1 py-1">
										{item.title && (
											<span className="font-bold text-base text-brand-japan-black leading-6">
												{item.title}
											</span>
										)}
										<div className="flex items-center justify-between gap-2">
											<span className="min-w-0 break-words font-normal text-base text-base-700 leading-6">
												{item.label}
											</span>
											{item.price === undefined && item.originalPrice === undefined && item.note ? (
												<span className="max-w-80 shrink-0 self-start break-words text-right text-base-700 text-sm leading-6">
													{item.note}
												</span>
											) : item.price !== undefined || item.originalPrice !== undefined ? (
												<div className="flex shrink-0 items-center gap-2 text-right">
													{item.note && (
														<span className="max-w-48 break-words text-base-700 text-sm leading-6">
															{item.note}
														</span>
													)}
													<div className="flex items-center gap-2">
														{item.originalPrice !== undefined && !item.hideOriginalPrice && (
															<span className="font-bold text-base text-base-400 leading-6 line-through">
																{formatPrice(item.originalPrice)}
															</span>
														)}
														{item.price !== undefined && (
															<span className="font-bold text-base text-primary-700 leading-6">
																{formatPrice(item.price)}
															</span>
														)}
													</div>
												</div>
											) : null}
										</div>
									</div>
								))}
							</div>
						))
					)}
				</div>

				{changeLabel && (onChange || changeDisabled) && (
					<>
						<div className="hidden bg-base-200 md:block md:h-auto md:w-px md:self-stretch" />
						<Button
							aria-label={
								passengerName
									? t("aria_labels.service_change_add_button_passenger", {
											changeLabel,
											label,
											passengerName,
										})
									: t("aria_labels.service_change_add_button", {
											changeLabel,
											label,
										})
							}
							variant="primary"
							outline
							size="md"
							disabled={actionDisabled || changeDisabled}
							onClick={onChange}
							className="hidden shrink-0 rounded-lg px-6 md:inline-flex"
						>
							{changeLabel}
						</Button>
					</>
				)}
			</div>
		</div>
	);
}
