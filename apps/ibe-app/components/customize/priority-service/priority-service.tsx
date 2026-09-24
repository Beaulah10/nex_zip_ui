/**
 * File: priority-service.tsx
 * Description: Express Service dialog component that displays service details,
 * allows passenger selection, shows stock availability warnings, and
 * confirms Express Service purchases for selected passengers.
 */
"use client";

import { Alert, AlertDescription, AlertTitle } from "@repo/ui/components/alert";
import { Button } from "@repo/ui/components/button";
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@repo/ui/components/dialog";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { useState } from "react";
import expressServiceImageAsset from "@/assets/images/express-service.png";
import { SelectCustomers } from "@/components/common/select-customers/select-customers";
import { getSeeMoreItems } from "@/modules/hooks/common/airport-lounge/airport-lounge";
import { formatPrice } from "@/modules/utils/helpers/currency-formatter";
import type { PriorityServiceDialogProps } from "@/types/priority-service/priority-services.types";
import { cn } from "../../../../../packages/ui/lib/utils";

/**
 * Displays the Express Service selection dialog.
 * Allows passengers to be selected, shows service details,
 * stock availability warnings, and confirms the selection.
 * @param props Dialog configuration, passenger data, pricing, and event handlers.
 */
export function PriorityServiceDialog({
	open,
	onOpenChange,
	stageLabel,
	routeLabel,
	passengers,
	highlightedPassengerId,
	hasOutOfStockPassengers,
	remainingStocksLabel,
	showTransitApplicabilityWarning,
	totalAmount,
	onPassengerChange,
	onSelectAllChange,
	onConfirmSelection,
}: PriorityServiceDialogProps) {
	const t = useTranslations("express_service");
	const expressServiceTitle = t("express_title");
	const expressBulletKeys = [
		"express_bullet_1",
		"express_bullet_2",
		"express_bullet_3",
		"express_bullet_4",
		"express_bullet_5",
		"express_bullet_6",
	] as const;
	const [showFullDescription, setShowFullDescription] = useState(false);
	const mobileBulletKeys = getSeeMoreItems(expressBulletKeys, showFullDescription, 2);
	const commonLabel = useTranslations("common");
	const selectCustomersTitle = useTranslations("extras_page");
	const allPassengersLockedAndChecked =
		passengers.length > 0 &&
		passengers.every((passenger) => passenger.disabled && passenger.checked);

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent
				desktopWidth={1024}
				className="flex max-h-[calc(100svh-48px)] w-[calc(100%-32px)] flex-col gap-0"
			>
				<DialogHeader>
					<DialogTitle>{`${t("express_dialog_title")} - ${stageLabel}`}</DialogTitle>
					<span className="text-base-700 text-xs leading-5">{routeLabel}</span>
				</DialogHeader>
				{showTransitApplicabilityWarning && (
					<div className="flex flex-col gap-2 md:px-6">
						<Alert variant="warning" className="order-1 md:order-0">
							<AlertTitle>{t("express_warning_title")}</AlertTitle>
							<AlertDescription>
								<p>{t("express_warning_message1")}</p>
								<p>{t("express_warning_message2")}</p>
							</AlertDescription>
						</Alert>
					</div>
				)}
				{hasOutOfStockPassengers && (
					<div className="px-4 pt-4 md:px-6 md:pt-6">
						<Alert variant="warning" className="order-1 md:order-0">
							<AlertTitle>{commonLabel("exceeds_available_stock_title")}</AlertTitle>
							<AlertDescription>{commonLabel("exceeds_available_stock_message")}</AlertDescription>
						</Alert>
					</div>
				)}
				<div
					className={`flex flex-1 flex-col gap-6 overflow-y-auto px-4 py-4 md:flex-row md:items-start md:px-6 ${
						hasOutOfStockPassengers ? "md:py-4" : "md:py-6"
					}`}
				>
					<div className="flex flex-1 flex-col gap-4">
						<div className="order-3 flex flex-col gap-1 md:order-1">
							<h2 className="font-bold text-2xl text-primary-700 leading-9">
								{expressServiceTitle}
							</h2>
							{!hasOutOfStockPassengers && remainingStocksLabel && (
								<span className="text-primary-700 text-xs leading-5">{remainingStocksLabel}</span>
							)}
						</div>

						<div className="relative order-2 h-60 w-full shrink-0 overflow-hidden rounded-lg md:order-2 md:h-[15.625rem]">
							<Image
								src={expressServiceImageAsset}
								alt={expressServiceTitle}
								fill
								sizes="(min-width: 1024px) 560px, (min-width: 768px) 60vw, 100vw"
								className="object-cover"
							/>
						</div>

						<div className="order-4 flex flex-col gap-1 md:order-3">
							<ul className="hidden flex-col gap-1 pl-4 text-base-700 text-sm leading-6 md:flex">
								{expressBulletKeys.map((key) => (
									<li key={key} className="list-disc marker:text-base-700">
										{t(key)}
									</li>
								))}
							</ul>
							<ul className="flex flex-col gap-1 pl-4 text-base-700 text-sm leading-6 md:hidden">
								{mobileBulletKeys.map((key, index) => (
									<li key={key} className="list-disc marker:text-base-700">
										{t(key)}
										{!showFullDescription && index === mobileBulletKeys.length - 1 && (
											<button
												type="button"
												onClick={() => setShowFullDescription(true)}
												className="ml-1 inline text-primary-700 underline"
											>
												See More
											</button>
										)}
									</li>
								))}
							</ul>
							<p className="text-primary-700 text-sm leading-6">{t("express_note")}</p>
						</div>
					</div>

					<div className="order-5 h-px w-full shrink-0 bg-base-300 md:order-0 md:h-auto md:w-px md:self-stretch" />

					<div className="order-6 w-full md:order-0 md:w-[20.375rem] md:flex-none md:shrink-0">
						<SelectCustomers
							title={selectCustomersTitle("select_customers")}
							passengers={passengers}
							onPassengerChange={onPassengerChange}
							onSelectAllChange={onSelectAllChange}
							highlightedPassengerId={highlightedPassengerId}
							selectAllOverride={
								allPassengersLockedAndChecked ? { checked: true, disabled: true } : undefined
							}
						/>
					</div>
				</div>

				<DialogFooter className="flex h-auto shrink-0 flex-col items-end justify-center gap-4 border-base-300 border-t px-4 md:h-auto md:shrink md:flex-row md:items-center md:justify-end md:gap-6 md:py-3">
					<div className="total-amount flex items-baseline gap-2">
						<span className="font-normal text-brand-japan-black text-sm leading-6">
							{t("total_amount_label")}
						</span>
						<span
							className={cn(
								"font-bold text-4xl leading-13",
								totalAmount === 0 ? "text-base-400" : "text-primary-700"
							)}
						>
							{formatPrice(totalAmount)}
						</span>
					</div>
					<Button
						className="w-full rounded-lg bg-primary-600 px-[95.5px] py-3.5 md:w-auto md:min-w-48 md:px-[28.5px] md:py-3.5"
						variant="primary"
						size="xl"
						onClick={onConfirmSelection}
					>
						{t("express_confirm")}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
