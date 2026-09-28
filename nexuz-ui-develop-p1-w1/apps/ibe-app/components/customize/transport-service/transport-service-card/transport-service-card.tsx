/**
 * File: transport-service-card.tsx
 * Description: Renders transport service details, pricing information, and selectable service options.
 * Supports service images, pricing matrices, and additional service actions.
 */
import { Button } from "@repo/ui/components/button";
import Icon from "@repo/ui/components/icon";
import { cn } from "@repo/ui/lib";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { cloneElement } from "react";
import { formatPrice } from "@/modules/utils/helpers/currency-formatter";
import type { TransportServiceCardProps } from "@/types/customize/transport-service/transport-service.types";

/**
 * Renders a transport service card with pricing matrix and selectable service rows.
 */
function TransportServiceCard({
	imageSrc,
	mobileImageSrc,
	desktopImageSrc,
	imageAlt,
	title,
	moreInfoHref,
	onMoreInfoClick,
	description,
	ageGroupLabels,
	durationLabel,
	pricingRows,
	footnote,
	services,
	className,
}: TransportServiceCardProps) {
	const transportServiceLabels = useTranslations("transportation_service");
	const durationTextLabel = durationLabel ?? transportServiceLabels("duration");
	const tripTypeLabel = transportServiceLabels("trip_type");
	const hasAgeGroups = ageGroupLabels.length > 0;
	const moreInfoContent = (
		<>
			<span className="line-clamp-1 text-base text-primary-700 underline">
				{transportServiceLabels("more_info")}
			</span>
			<Icon name="open_in_new" size={24} color="text-primary-700" aria-hidden="true" />
		</>
	);

	return (
		<div className={cn("flex w-full flex-col items-start gap-4", className)}>
			<div className="w-full overflow-hidden rounded-lg bg-white">
				{mobileImageSrc ? (
					<>
						<Image
							src={mobileImageSrc}
							alt={imageAlt ?? title}
							className={cn("w-full object-cover md:hidden")}
						/>
						<Image
							src={desktopImageSrc ?? imageSrc}
							alt={imageAlt ?? title}
							className={cn("hidden w-full object-cover md:block")}
						/>
					</>
				) : (
					<Image src={imageSrc} alt={imageAlt ?? title} className={cn("w-full object-cover")} />
				)}
			</div>

			<div className="flex w-full items-end gap-4">
				<h2 className="min-w-0 flex-1 font-bold text-2xl text-primary-700 leading-9">{title}</h2>

				{moreInfoHref ? (
					<a
						href={moreInfoHref}
						className="flex shrink-0 items-center gap-2"
						aria-label={`${transportServiceLabels("aria_labels.more_info_aria_label")} ${title}`}
					>
						{moreInfoContent}
					</a>
				) : (
					<button
						type="button"
						onClick={onMoreInfoClick}
						className="flex shrink-0 items-center gap-2"
					>
						{moreInfoContent}
					</button>
				)}
			</div>

			<p className="w-full text-base-700 text-sm leading-6">{description}</p>

			<div className="flex w-full flex-col items-start gap-2">
				<div className="flex w-full items-center justify-between gap-2">
					<span
						className={cn(
							"flex-1 text-brand-japan-black text-sm leading-6",
							durationTextLabel === tripTypeLabel ? "font-bold" : "font-normal"
						)}
					>
						{durationTextLabel}
					</span>
					{ageGroupLabels.map((label) => (
						<span
							key={label}
							className="flex-1 text-center font-medium text-brand-japan-black text-sm leading-6"
						>
							{label}
						</span>
					))}
				</div>
				<div className="h-px w-full bg-base-300" />

				{pricingRows.map((row) => (
					<div key={row.label} className="flex w-full flex-col items-start gap-2">
						<div className="flex w-full items-center justify-between gap-2">
							<span className="flex-1 font-bold text-brand-japan-black text-sm leading-6">
								{row.label}
							</span>
							{row.prices.map((price) => (
								<span
									key={`${row.label}-${price}`}
									className={cn(
										"font-bold text-base text-primary-700 leading-6",
										hasAgeGroups ? "flex-1 text-center" : "text-right"
									)}
								>
									{formatPrice(price)}
								</span>
							))}
						</div>
						<div className="h-px w-full bg-base-300" />
					</div>
				))}

				{footnote && (
					<span className="w-full text-right font-medium text-primary-700 text-xs leading-5">
						{footnote}
					</span>
				)}
			</div>

			<div className="flex w-full flex-col items-start gap-4">
				{services.map((service) => {
					let addButtonLabel = transportServiceLabels("add_button");
					if (service.selected) {
						addButtonLabel = transportServiceLabels("selected_button");
					}
					const addButton = (
						<Button
							type="button"
							variant="primary"
							outline
							size="md"
							disabled={service.disabled}
							onClick={service.onAdd}
							aria-label={`${addButtonLabel} ${service.label}`}
							className={cn(
								service.selected && "border-primary-600 bg-primary-800 text-primary-foreground"
							)}
						>
							{addButtonLabel}
						</Button>
					);

					return (
						<div
							key={service.label}
							className={cn(
								"flex w-full items-center justify-between gap-4 rounded-lg border border-base-300 p-4",
								service.disabled && "bg-base-100"
							)}
						>
							<div className="min-w-0 flex-1">
								<span className="font-bold text-brand-japan-black text-sm leading-6">
									{service.label}
								</span>
								{service.disabledReason && (
									<p className="mt-1 text-base-700 text-xs leading-5">{service.disabledReason}</p>
								)}
							</div>
							{!service.disabled && service.dialog
								? cloneElement(service.dialog, { trigger: addButton })
								: addButton}
						</div>
					);
				})}
			</div>
		</div>
	);
}

export { TransportServiceCard };
