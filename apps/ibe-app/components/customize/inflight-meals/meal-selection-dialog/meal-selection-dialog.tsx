/**
 * File: meal-selection-dialog.tsx
 * Description: Meal selection dialog and content components used in the inflight meals customization flow.
 * It displays detailed meal information, including pricing, stock availability, allergies, and nutritional details,
 * and allows passengers to review and confirm their meal selection. The dialog provides a dedicated experience
 * for viewing meal details before adding the selected meal to a booking.
 */

"use client";

import { Alert, AlertTitle } from "@repo/ui/components/alert";
import { Badge } from "@repo/ui/components/badge";
import { Button } from "@repo/ui/components/button";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogFooter,
	DialogTrigger,
} from "@repo/ui/components/dialog";
import Icon from "@repo/ui/components/icon";
// Set drink and Timing of delivery sections are not in scope — imports commented out
// import {
// 	RadioCheckGroupWithPrice,
// 	RadioCheckGroupWithPriceItem,
// } from "@repo/ui/components/radio-check-group-with-price";
import { cn } from "@repo/ui/lib";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { formatPrice } from "@/modules/utils/helpers/currency-formatter";
import type {
	MealSelectionContentProps,
	MealSelectionDialogProps,
	MealSelectionOption,
} from "@/types/customize/inflight-meals/inflight-meals.types";

export type { MealSelectionContentProps, MealSelectionDialogProps, MealSelectionOption };

function SectionHeading({ title }: { title: string }) {
	return <h3 className="font-bold text-base text-primary-700 leading-6">{title}</h3>;
}

function MealSelectionBody({
	passengerName,
	imageSrc,
	imageAlt,
	dishName,
	showBundleChargeWarning,
	bundleLabel,
	originalPrice,
	price,
	remainingQty,
	stockLabel,
	isOutOfStock,
	allergies,
	allergyDetails,
	nutrition,
	// drinkNote,               // Set drink — not in scope
	// drinkOptions,             // Set drink — not in scope
	// deliveryTimingOptions,    // Timing of delivery — not in scope
	// drinkId,                  // Set drink — not in scope
	// setDrinkId,               // Set drink — not in scope
	// timingId,                 // Timing of delivery — not in scope
	// setTimingId,              // Timing of delivery — not in scope
}: {
	passengerName: string;
	imageSrc: string;
	imageAlt?: string;
	dishName: string;
	showBundleChargeWarning?: boolean;
	bundleLabel?: string;
	originalPrice?: number;
	price: number;
	remainingQty?: number;
	stockLabel?: string;
	isOutOfStock?: boolean;
	allergies?: string;
	allergyDetails?: string;
	nutrition?: string;
	// drinkNote?: string;                          // Set drink — not in scope
	// drinkOptions: MealSelectionOption[];         // Set drink — not in scope
	// deliveryTimingOptions: MealSelectionOption[];// Timing of delivery — not in scope
	// drinkId: string | undefined;                 // Set drink — not in scope
	// setDrinkId: (id: string) => void;            // Set drink — not in scope
	// timingId: string | undefined;                // Timing of delivery — not in scope
	// setTimingId: (id: string) => void;           // Timing of delivery — not in scope
}) {
	const t = useTranslations("meals_service");
	const formatStockText = (label: string) =>
		label === "remaining_quantity" ? t(label, { quantity: remainingQty ?? 0 }) : t(label);
	return (
		<div className="flex flex-1 flex-col gap-4 overflow-y-auto px-4 py-2 md:px-6">
			{showBundleChargeWarning && (
				<Alert variant="warning">
					<AlertTitle>{t("warning_bundle")}</AlertTitle>
				</Alert>
			)}

			<div className="flex items-center gap-2">
				<Icon name="person" size={24} fill={1} className="text-primary-700" aria-hidden="true" />
				<span className="font-bold text-2xl text-brand-japan-black leading-9">{passengerName}</span>
			</div>

			<div className="flex flex-col items-start gap-4 md:flex-row md:gap-4">
				{/* ── Left: image only ── */}
				<div className="relative h-56 w-full shrink-0 md:h-120 md:w-119">
					<Image
						src={imageSrc}
						alt={imageAlt ?? dishName}
						fill
						className="rounded-lg object-cover"
					/>
				</div>

				{/* ── Right: dish info + allergies + nutrition + drink + timing ── */}
				<div className="flex w-full flex-col gap-4">
					<div className="flex flex-col gap-2">
						<h2 className="font-bold text-2xl text-brand-japan-black leading-9">{dishName}</h2>
						<div className="flex flex-wrap items-center gap-6">
							{bundleLabel && <Badge variant="info">{bundleLabel}</Badge>}
							<div className="flex items-center gap-2">
								{originalPrice !== undefined && (
									<span className="text-2xl text-base-400 leading-9 line-through">
										{formatPrice(originalPrice)}
									</span>
								)}
								<span className="font-bold text-2xl text-primary-700 leading-9">
									{formatPrice(price)}
								</span>
							</div>
						</div>
						{stockLabel && (
							<p
								className={cn(
									"font-bold text-xs leading-5",
									isOutOfStock ? "text-base-400" : "text-primary-700"
								)}
							>
								{formatStockText(stockLabel)}
							</p>
						)}
					</div>

					{allergies && (
						<div className="flex flex-col gap-2">
							<SectionHeading title={t("allergies_title")} />
							<p className="text-base-700 text-sm leading-6">{allergies}</p>
							{allergyDetails && (
								<p className="text-base text-base-700 leading-6">{allergyDetails}</p>
							)}
						</div>
					)}

					{nutrition && (
						<div className="flex flex-col gap-2">
							<SectionHeading title={t("nutritional_information_title")} />
							<p className="text-base-700 text-sm leading-6">{nutrition}</p>
						</div>
					)}

					{/* Set drink — not in scope */}
					{/* {drinkOptions.length > 0 && (
						<div className="flex flex-col gap-2">
							<SectionHeading title="Set drink" />
							{drinkNote && <p className="text-base-700 text-sm leading-6">{drinkNote}</p>}
							<RadioCheckGroupWithPrice
								name="meal-drink"
								value={drinkId}
								onValueChange={setDrinkId}
								className="flex flex-col gap-2"
							>
								{drinkOptions.map((option) => (
									<RadioCheckGroupWithPriceItem
										key={option.id}
										value={option.id}
										label={option.label}
										originalPrice={option.originalPrice}
										price={option.price}
									/>
								))}
							</RadioCheckGroupWithPrice>
						</div>
					)} */}

					{/* Timing of delivery — not in scope */}
					{/* {deliveryTimingOptions.length > 0 && (
						<div className="flex flex-col gap-2">
							<SectionHeading title="Timing of delivery" />
							<p className="text-base-700 text-sm leading-6">
								Timing may vary slightly depending on flight conditions.
							</p>
							<p className="text-base-700 text-sm leading-6">
								Meal will be delivered 1 to 2 hours after takeoff if not specified.
							</p>
							<RadioCheckGroupWithPrice
								name="meal-timing"
								value={timingId}
								onValueChange={setTimingId}
								className="flex flex-col gap-2"
							>
								{deliveryTimingOptions.map((option) => (
									<RadioCheckGroupWithPriceItem
										key={option.id}
										value={option.id}
										label={option.label}
										originalPrice={option.originalPrice}
										price={option.price}
									/>
								))}
							</RadioCheckGroupWithPrice>
						</div>
					)} */}
				</div>
			</div>
		</div>
	);
}

function MealSelectionContent({
	passengerName,
	imageSrc,
	imageAlt,
	dishName,
	showBundleChargeWarning,
	bundleLabel,
	originalPrice,
	price,
	remainingQty,
	stockLabel,
	isOutOfStock,
	allergies,
	allergyDetails,
	nutrition,
	// drinkNote,             // Set drink — not in scope
	// drinkOptions,          // Set drink — not in scope
	// deliveryTimingOptions, // Timing of delivery — not in scope
	// defaultDrinkId,        // Set drink — not in scope
	// defaultTimingId,       // Timing of delivery — not in scope
	onConfirm,
}: MealSelectionContentProps) {
	// const [drinkId, setDrinkId] = React.useState(defaultDrinkId ?? drinkOptions[0]?.id); // Set drink — not in scope
	// const [timingId, setTimingId] = React.useState(defaultTimingId); // Timing of delivery — not in scope
	// const drinkPrice = drinkOptions.find((option) => option.id === drinkId)?.price ?? 0;  // Set drink — not in scope
	// const timingPrice = deliveryTimingOptions.find((option) => option.id === timingId)?.price ?? 0; // Timing of delivery — not in scope
	const totalPrice = price; // drinkPrice + timingPrice removed — not in scope
	const passengerNameLabels = useTranslations("passenger_name_page");

	const handleConfirm = () => {
		onConfirm?.({ drinkId: undefined, timingId: undefined }, totalPrice);
	};
	const t = useTranslations("meals_service");

	return (
		<div className="flex flex-1 flex-col gap-0! overflow-hidden">
			<MealSelectionBody
				passengerName={passengerName}
				imageSrc={imageSrc}
				imageAlt={imageAlt}
				dishName={dishName}
				showBundleChargeWarning={showBundleChargeWarning}
				bundleLabel={bundleLabel}
				originalPrice={originalPrice}
				price={price}
				remainingQty={remainingQty}
				stockLabel={stockLabel}
				isOutOfStock={isOutOfStock}
				allergies={allergies}
				allergyDetails={allergyDetails}
				nutrition={nutrition}
				// drinkNote={drinkNote}                         // Set drink — not in scope
				// drinkOptions={drinkOptions}                   // Set drink — not in scope
				// deliveryTimingOptions={deliveryTimingOptions} // Timing of delivery — not in scope
				// drinkId={drinkId}                            // Set drink — not in scope
				// setDrinkId={setDrinkId}                      // Set drink — not in scope
				// timingId={timingId}                          // Timing of delivery — not in scope
				// setTimingId={setTimingId}                    // Timing of delivery — not in scope
			/>

			<DialogFooter className="flex flex-col items-end gap-3 py-4 md:flex-row md:items-center md:justify-end md:gap-6 md:py-3">
				<div className="flex w-full items-end justify-end gap-2 md:w-auto">
					<span className="text-brand-japan-black text-sm leading-6">
						{passengerNameLabels("total_amount_label")}
					</span>
					<span
						className={cn(
							"font-bold text-4xl leading-13",
							totalPrice > 0 ? "text-primary-700" : "text-base-400"
						)}
					>
						{formatPrice(totalPrice)}
					</span>
				</div>
				<Button
					className="w-full md:w-auto"
					type="button"
					variant="primary"
					size="xl"
					disabled={isOutOfStock}
					onClick={handleConfirm}
				>
					{t("confirm_selection")}
				</Button>
			</DialogFooter>
		</div>
	);
}

function MealSelectionDialog({
	open,
	onOpenChange,
	passengerName,
	routeLabel,
	imageSrc,
	imageAlt,
	dishName,
	showBundleChargeWarning,
	remainingQty,
	bundleLabel,
	originalPrice,
	price,
	stockLabel,
	isOutOfStock,
	allergies,
	allergyDetails,
	nutrition,
	// drinkNote,             // Set drink — not in scope
	// drinkOptions,          // Set drink — not in scope
	// deliveryTimingOptions, // Timing of delivery — not in scope
	// defaultDrinkId,        // Set drink — not in scope
	// defaultTimingId,       // Timing of delivery — not in scope
	onConfirm,
	trigger,
}: MealSelectionDialogProps) {
	// const [drinkId, setDrinkId] = React.useState(defaultDrinkId ?? drinkOptions[0]?.id); // Set drink — not in scope
	// const [timingId, setTimingId] = React.useState(defaultTimingId); // Timing of delivery — not in scope
	// const drinkPrice = drinkOptions.find((option) => option.id === drinkId)?.price ?? 0;  // Set drink — not in scope
	// const timingPrice = deliveryTimingOptions.find((option) => option.id === timingId)?.price ?? 0; // Timing of delivery — not in scope
	const totalPrice = price; // drinkPrice + timingPrice removed — not in scope

	const handleConfirm = () => {
		onConfirm?.({ drinkId: undefined, timingId: undefined }, totalPrice);
		onOpenChange?.(false);
	};
	const t = useTranslations("meals_service");

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			{trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}

			<DialogContent
				showCloseButton={false}
				desktopWidth={1024}
				className="flex max-h-[calc(100svh-48px)] w-[calc(100%-32px)] flex-col gap-0! p-0!"
			>
				{/* ── Header ── */}
				<div className="flex items-center gap-6 border-base-300 border-b px-4 py-4 md:px-6">
					<DialogClose asChild>
						<button type="button" aria-label="Back" className="shrink-0 text-base-950">
							<Icon
								name="arrow_back"
								size={24}
								color=""
								className="text-current"
								aria-hidden="true"
							/>
						</button>
					</DialogClose>
					<div className="flex flex-1 flex-col gap-1">
						<span className="font-bold text-2xl text-brand-japan-black leading-9">
							{t("title")}
						</span>
						<span className="text-base-700 text-xs leading-5">{routeLabel}</span>
					</div>
					<DialogClose asChild>
						<button
							type="button"
							aria-label="Close"
							className="flex shrink-0 items-center justify-center rounded-full border border-base-300 bg-white p-3 hover:bg-base-50"
						>
							<Icon
								name="close"
								size={24}
								color=""
								className="text-brand-japan-black"
								aria-hidden="true"
							/>
						</button>
					</DialogClose>
				</div>

				<MealSelectionBody
					passengerName={passengerName}
					imageSrc={imageSrc}
					imageAlt={imageAlt}
					dishName={dishName}
					showBundleChargeWarning={showBundleChargeWarning}
					remainingQty={remainingQty}
					bundleLabel={bundleLabel}
					originalPrice={originalPrice}
					price={price}
					stockLabel={stockLabel}
					isOutOfStock={isOutOfStock}
					allergies={allergies}
					allergyDetails={allergyDetails}
					nutrition={nutrition}
					// drinkNote={drinkNote}                         // Set drink — not in scope
					// drinkOptions={drinkOptions}                   // Set drink — not in scope
					// deliveryTimingOptions={deliveryTimingOptions} // Timing of delivery — not in scope
					// drinkId={drinkId}                            // Set drink — not in scope
					// setDrinkId={setDrinkId}                      // Set drink — not in scope
					// timingId={timingId}                          // Timing of delivery — not in scope
					// setTimingId={setTimingId}                    // Timing of delivery — not in scope
				/>

				<DialogFooter className="md:items-center md:justify-end md:gap-8">
					<span
						className={cn(
							"text-right font-bold text-4xl leading-14",
							totalPrice > 0 ? "text-primary-700" : "text-base-400"
						)}
					>
						{formatPrice(totalPrice)}
					</span>
					<Button
						type="button"
						variant="primary"
						size="xl"
						disabled={isOutOfStock}
						onClick={handleConfirm}
					>
						{t("confirm_selection")}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

export { MealSelectionContent, MealSelectionDialog };
