"use client";

import { Alert } from "@repo/ui/components/alert";
import { Button } from "@repo/ui/components/button";
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@repo/ui/components/dialog";
import Icon from "@repo/ui/components/icon";
import { cn } from "@repo/ui/lib";
import { useTranslations } from "next-intl";
import {
	SelectCustomers,
	type selectCustomersListItem,
} from "@/components/common/select-customers/select-customers";
import { formatPrice } from "@/modules/utils/helpers/currency-formatter";
import type { ExtrasProductModalProps } from "@/types/extras/extras.type";

export function ExtrasProductModal({
	open,
	product,
	routeLabel,
	currentImageIndex,
	passengers,
	passengerSelections,
	bundledPassengerIds,
	isDialogSelectionFull,
	dialogTotal,
	shouldShowOutOfStockAlert,
	onClose,
	onCloseAutoFocus,
	onPreviousImage,
	onNextImage,
	onPassengerChange,
	onSelectAllChange,
	onConfirm,
}: ExtrasProductModalProps) {
	const t = useTranslations("extras_page");
	if (!product) {
		return null;
	}

	const bundledPassengerIdSetForDialog = new Set(bundledPassengerIds);
	const dialogPassengers: selectCustomersListItem[] = passengers.map((passenger) => {
		const isBundled = bundledPassengerIdSetForDialog.has(passenger.id);
		const isSelected = passengerSelections[passenger.id];
		const isOutOfStock = isDialogSelectionFull && !isSelected && !isBundled;

		return {
			...passenger,
			price: isBundled ? 0 : product.price,
			checked: isSelected || isBundled,
			disabled: isBundled || isOutOfStock,
			status: isOutOfStock ? t("error_labels.out_of_stock") : undefined,
		};
	});

	const dialogImages = product.images;

	return (
		<Dialog open={open} onOpenChange={onClose}>
			<DialogContent
				desktopWidth={1024}
				className="flex max-h-[calc(100svh-48px)] w-[calc(100%-32px)] flex-col gap-0! overflow-hidden p-0!"
				onCloseAutoFocus={onCloseAutoFocus}
			>
				<DialogHeader>
					<div className="flex gap-2 md:gap-6">
						<button
							type="button"
							onClick={onClose}
							aria-label={t("aria_labels.back_button")}
							className="shrink-0 text-base-950"
						>
							<Icon name="arrow_back" size={24} color="" className="text-current" />
						</button>
						<div className="flex flex-col gap-2 md:gap-1">
							<div className="flex items-center gap-3">
								<DialogTitle>{t("modal_title")}</DialogTitle>
							</div>
							<span className="text-secondary-700 text-xs leading-5">{routeLabel}</span>
						</div>
					</div>
				</DialogHeader>

				<div className="flex flex-1 flex-col gap-6 overflow-y-auto px-4 py-4 md:px-6">
					{shouldShowOutOfStockAlert && (
						<Alert variant="warning" className="rounded-lg">
							<div className="flex flex-col gap-1">
								<p className="font-bold text-sm text-warning-800 leading-6">
									{t("error_labels.exceeds_available_stock_title")}
								</p>
								<p className="font-normal text-sm text-warning-800 leading-6">
									{t("error_labels.out_of_stock_description")}
								</p>
							</div>
						</Alert>
					)}

					<div className="flex flex-1 flex-col gap-6 md:flex-row">
						<div className="flex flex-1 flex-col gap-4">
							<div className="order-2 flex flex-col gap-2">
								<h2 className="font-bold text-2xl text-primary-700 leading-9">{product.name}</h2>
								{product.remainingLabel && (
									<span className="text-primary-700 text-xs leading-5">
										{product.remainingLabel}
									</span>
								)}
							</div>

							<div className="relative order-1 h-62.5 w-full shrink-0 overflow-hidden rounded-lg border border-base-200 bg-white md:order-2">
								{/* biome-ignore lint/performance/noImgElement: mock content uses remote preview images */}
								<img
									src={dialogImages[currentImageIndex]}
									alt={product.name}
									className="h-full w-full object-contain"
								/>
								{dialogImages.length > 1 && (
									<>
										<button
											type="button"
											onClick={onPreviousImage}
											aria-label={t("aria_labels.previous_image_button")}
											disabled={currentImageIndex === 0}
											className="absolute top-1/2 left-2 flex size-9 -translate-y-1/2 items-center justify-center rounded-full border border-primary-700 bg-white disabled:opacity-40"
										>
											<Icon name="chevron_left" size={20} className="text-primary-700" />
										</button>
										<button
											type="button"
											onClick={onNextImage}
											aria-label={t("aria_labels.next_image_button")}
											disabled={currentImageIndex === dialogImages.length - 1}
											className="absolute top-1/2 right-2 flex size-9 -translate-y-1/2 items-center justify-center rounded-full border border-primary-700 bg-white disabled:opacity-40"
										>
											<Icon name="chevron_right" size={20} className="text-primary-700" />
										</button>
									</>
								)}
							</div>

							<div className="order-3 flex flex-col">
								{product.description && (
									<p className="text-brand-japan-black text-xs leading-5">{product.description}</p>
								)}
								<p className="text-brand-japan-black text-xs leading-5">
									{t("for_information")}
									<a
										href="https://www.zipair.net/en/service/amenity"
										target="_blank"
										rel="noreferrer"
										className="text-primary-700 underline"
									>
										https://www.zipair.net/en/service/amenity
									</a>
								</p>
							</div>
						</div>

						<div className="h-px w-full shrink-0 bg-base-300 md:h-auto md:w-px md:self-stretch" />

						<div className="w-full shrink-0 md:max-w-81.5">
							<SelectCustomers
								title={t("select_customers")}
								passengers={dialogPassengers}
								bundledPassengerIds={bundledPassengerIds}
								onPassengerChange={onPassengerChange}
								onSelectAllChange={onSelectAllChange}
							/>
						</div>
					</div>
				</div>

				<DialogFooter className="flex-col gap-4 border-secondary-300 border-t-1 bg-white md:items-center md:justify-end md:gap-8">
					<span
						className={cn(
							"text-right font-bold text-4xl leading-13",
							dialogTotal > 0 ? "text-primary-700" : "text-base-400"
						)}
					>
						{formatPrice(dialogTotal)}
					</span>
					<Button variant="primary" size={"xl"} className="text-base leading-6" onClick={onConfirm}>
						{t("confirm_selection")}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
