/**
 * File: baggage-selection.tsx
 * Description: Component that manages baggage selection for passengers.
 */

"use client";
import { Alert, AlertDescription, AlertTitle } from "@repo/ui/components/alert";
import { Badge } from "@repo/ui/components/badge";
import Icon from "@repo/ui/components/icon";
import {
	RadioGroupWithPrice,
	RadioGroupWithPriceItem,
} from "@repo/ui/components/radio-group-with-price";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useMemo, useRef } from "react";
import { InfantIcon } from "@/assets/images/infant-icon";
import { CounterCard } from "@/components/customize/baggage-service/baggage-selection/baggage-counter-card/baggage-counter-card";
import { useDepartureDeadline } from "@/modules/hooks/common/departure-deadline/departure-deadline";
import {
	MAX_BAGGAGE_QUANTITY_PER_ITEM,
	MAX_ITEMS_FOR_BAGGAGE_SELECTION,
} from "@/modules/utils/constants/baggage-service/baggage-selection-constants";
import {
	getCarryOnCharge,
	getCheckedBaggageCharge,
} from "@/modules/utils/helpers/baggage-service/baggage-pricing/baggage-pricing";
import { formatPrice } from "@/modules/utils/helpers/currency-formatter";
import type { BaggageSelectionProps } from "@/types/baggage-selection/baggage-selection.types";

// Section heading component
function SectionHeading({
	title,
	id,
	ariaLabel,
	className,
}: Readonly<{ title: string; id: string; ariaLabel?: string; className?: string }>) {
	return (
		<div className="flex flex-col gap-1 self-stretch">
			<h4
				id={id}
				className={`font-bold text-primary-700 ${className ?? "text-lg leading-7"}`}
				aria-label={ariaLabel}
			>
				{title}
			</h4>
			{id !== "sports-equipment-heading" && <div className="h-px w-full bg-base-200" />}
		</div>
	);
}

// Current number row component
function CurrentNumberRow({
	count,
	max,
	disabled,
}: Readonly<{ count: number; max: number; disabled?: boolean }>) {
	const baggageServiceLabels = useTranslations("baggage_service");
	return (
		<div
			className={`flex flex-wrap items-center justify-between gap-7 rounded-lg px-2 py-4 md:px-4 md:py-5 ${disabled ? "cursor-not-allowed bg-base-50" : "bg-green-50"}`}
		>
			<div className="flex items-center gap-2">
				<Icon
					name="luggage"
					fill={1}
					color={disabled ? "text-base-400" : "text-primary-700"}
					className={`shrink-0 ${disabled ? "text-base-400" : "text-primary-700"}`}
				/>
				<p
					className={`wrap-break-word w-40 md:w-123 ${disabled ? "text-base-400" : "text-brand-japan-black"}`}
				>
					<span className="font-bold text-base leading-6">
						{baggageServiceLabels("current_number")}
					</span>
					<span className="block font-normal text-xs leading-5 md:inline md:text-base md:leading-6">
						{baggageServiceLabels("max_checked_in_baggage_info", { max })}
					</span>
				</p>
			</div>
			<span
				className={`self-start font-bold text-2xl md:self-center ${disabled ? "text-base-400" : "text-primary-700"} leading-9`}
			>
				{baggageServiceLabels("selected_items", { count })}
			</span>
		</div>
	);
}

function BaggageSelection({
	passengerName,
	bundleId,
	bundleLabel,
	carryOnOptions,
	checkedInBaggagePrice,
	equipment,
	value,
	onChange,
	showHeader = true,
	availableInventory = {},
	segmentValidationMessage,
	onValidationChange,
	adultType,
}: BaggageSelectionProps) {
	const baggageServiceLabels = useTranslations("baggage_service");
	const ancillaryServiceLabels = useTranslations("ancillary_service");
	const limitExceededRef = useRef<HTMLDivElement>(null);
	const segmentMismatchRef = useRef<HTMLDivElement>(null);
	const carryOnId = value?.carryOnId ?? carryOnOptions[0]?.id ?? "";
	const checkedInBaggageCount =
		value?.checkedInBaggageCount ?? (bundleId === "VALUE" || bundleId === "PREMIUM" ? 1 : 0);
	const equipmentCounts = value?.equipmentCounts ?? {};

	const carryOnGroupName = "carry-on-baggage";
	const equipmentItemCount = Object.values(equipmentCounts).reduce((sum, count) => sum + count, 0);
	const maxItemsIncludingSports = MAX_ITEMS_FOR_BAGGAGE_SELECTION;
	const totalItems = checkedInBaggageCount + equipmentItemCount;
	const { is24HourDeadlineExceeded: isDepartureTimeLessThan24Hour } = useDepartureDeadline();

	const limitExceeded = totalItems > MAX_ITEMS_FOR_BAGGAGE_SELECTION;

	const validateBaggageSelection = useCallback(() => {
		if (!limitExceeded) {
			return true;
		}

		limitExceededRef.current?.scrollIntoView({
			behavior: "smooth",
			block: "center",
		});

		limitExceededRef.current?.focus({
			preventScroll: true,
		});

		return false;
	}, [limitExceeded]);
	useEffect(() => {
		if (segmentValidationMessage) {
			segmentMismatchRef.current?.scrollIntoView({
				behavior: "smooth",
				block: "center",
			});

			segmentMismatchRef.current?.focus({
				preventScroll: true,
			});
		}
	}, [segmentValidationMessage]);
	useEffect(() => {
		onValidationChange?.(validateBaggageSelection);
	}, [onValidationChange, validateBaggageSelection]);
	const inventoryValidation = useMemo(() => {
		const availableCheckedInQty = availableInventory.BAGN ?? 0;
		const isCheckedInAvailable =
			availableCheckedInQty !== 0 && availableCheckedInQty >= checkedInBaggageCount;
		const isCarryOnAvailable = (availableInventory.CABN ?? 0) > 0;
		const sportsAvailability = equipment.map((item) => {
			const requestedQty = equipmentCounts[item.id] ?? 0;
			const availableQty = availableInventory[item.ssrCode] ?? 0;
			return {
				...item,
				requestedQty,
				availableQty,
				isAvailable: availableQty >= requestedQty && availableQty > 0,
			};
		});

		const unavailableSportsItems = sportsAvailability.filter((item) => !item.isAvailable);
		const availableSportsItems = sportsAvailability.filter((item) => item.isAvailable);
		return {
			availableCheckedInQty,
			isCheckedInAvailable,
			isCarryOnAvailable,
			areSomeSportsItemsUnavailable:
				unavailableSportsItems.length > 0 && availableSportsItems.length > 0,
			areAllSportsItemsUnavailable:
				sportsAvailability.length > 0 &&
				unavailableSportsItems.length === sportsAvailability.length,
			unavailableSportsItems,
		};
	}, [availableInventory, checkedInBaggageCount, equipment, equipmentCounts]);

	const hasInventoryIssue =
		!inventoryValidation.isCarryOnAvailable ||
		(!inventoryValidation.isCheckedInAvailable && inventoryValidation.areAllSportsItemsUnavailable);
	const availableCheckedInQty = inventoryValidation.availableCheckedInQty;
	const updateSelection = useCallback(
		(updates: Partial<NonNullable<typeof value>>) => {
			onChange?.({
				carryOnId,
				checkedInBaggageCount,
				equipmentCounts,
				...updates,
			});
		},
		[carryOnId, checkedInBaggageCount, equipmentCounts, onChange]
	);

	const handleCarryOnChange = useCallback(
		(carryOnId: string) => {
			updateSelection({ carryOnId });
		},
		[updateSelection]
	);

	const handleCheckedInChange = useCallback(
		(nextCount: number) => {
			updateSelection({
				checkedInBaggageCount: nextCount,
			});
		},
		[updateSelection]
	);

	const updateEquipmentCount = useCallback(
		(id: string, nextCount: number) => {
			updateSelection({
				equipmentCounts: {
					...equipmentCounts,
					[id]: nextCount,
				},
			});
		},
		[equipmentCounts, updateSelection]
	);

	const effectiveEquipment = equipment.map((item) => ({
		...item,
		count: equipmentCounts[item.id] ?? 0,
		stockLabel: "",
		maxSelectable: maxItemsIncludingSports,
		isSoldOut: false,
	}));

	const checkedInPrice =
		getCheckedBaggageCharge(checkedInBaggageCount, bundleId, checkedInBaggagePrice) ?? 0;

	return (
		<>
			{showHeader && (
				<div className="flex items-start gap-2">
					{adultType && adultType.toLowerCase() === "infant" ? (
						<InfantIcon className="mt-1.5 text-primary-700" />
					) : (
						<Icon name="person" size={24} fill={1} className="py-1.5 text-primary-700" />
					)}
					<div className="flex flex-col gap-1">
						<h3 className="font-bold text-2xl text-brand-japan-black leading-9">{passengerName}</h3>
						<Badge variant="info">{ancillaryServiceLabels(bundleLabel)}</Badge>
					</div>
				</div>
			)}
			{hasInventoryIssue && (
				<Alert variant="warning">
					<AlertTitle>
						{baggageServiceLabels("error_labels.error_title_exceeds_available_stock")}
					</AlertTitle>
					<AlertDescription>
						{baggageServiceLabels("error_labels.error_description_out_of_stock")}
					</AlertDescription>
				</Alert>
			)}
			{!hasInventoryIssue &&
				(inventoryValidation.areSomeSportsItemsUnavailable ||
					!inventoryValidation.isCheckedInAvailable) && (
					<Alert variant="warning">
						<AlertTitle>
							{baggageServiceLabels("error_labels.error_title_exceeds_available_stock")}
						</AlertTitle>
						<AlertDescription className="[&_a]:no-underline">
							{baggageServiceLabels("error_labels.error_description_limited_stock")}
						</AlertDescription>
					</Alert>
				)}
			{segmentValidationMessage && (
				<div ref={segmentMismatchRef} tabIndex={-1}>
					<Alert variant="error">
						<AlertTitle>
							{baggageServiceLabels("error_labels.error_title_segment_mismatch")}
						</AlertTitle>
						<AlertDescription>{segmentValidationMessage}</AlertDescription>
					</Alert>
				</div>
			)}
			<div className="flex flex-1 flex-col gap-4">
				<div className="flex flex-col gap-4">
					<SectionHeading
						id="carry-on-baggage-heading"
						ariaLabel={baggageServiceLabels("aria_labels.carry_on_baggage")}
						title={baggageServiceLabels("baggage_selection_carry_on_baggage")}
					/>
					<RadioGroupWithPrice
						aria-label={baggageServiceLabels("aria_labels.carry_on_baggage")}
						name={carryOnGroupName}
						value={isDepartureTimeLessThan24Hour ? "" : carryOnId}
						onValueChange={handleCarryOnChange}
						className="flex flex-col gap-2 md:flex-row md:flex-wrap md:items-stretch md:gap-4"
					>
						{carryOnOptions.map((option) => {
							const isOutOfStock =
								option.ssrCode === "CABN" ? (availableInventory[option.ssrCode] ?? 0) <= 0 : false;
							const shouldDisableForBundle = bundleId === "PREMIUM" || bundleId === "FLEXBIZ";
							const availableCabnQty = availableInventory.CABN ?? 0;
							const remainingCabnQty =
								option.ssrCode === "CABN" && carryOnId === option.id
									? Math.max(availableCabnQty - 1, 0)
									: availableCabnQty;
							const description =
								option.ssrCode === "CABN" && availableCabnQty <= 10 && availableCabnQty > 0
									? baggageServiceLabels("remaining_available_stocks", {
											availableQty: remainingCabnQty,
										})
									: "";
							return (
								<RadioGroupWithPriceItem
									key={option.id}
									value={option.id}
									icon="trip"
									label={baggageServiceLabels(option.label)}
									description={description}
									price={formatPrice(getCarryOnCharge(option.ssrCode, bundleId, option.price))}
									disabled={isDepartureTimeLessThan24Hour || shouldDisableForBundle || isOutOfStock}
								/>
							);
						})}
					</RadioGroupWithPrice>
				</div>

				<div className="flex flex-col gap-4">
					<SectionHeading
						id="checked-in-baggage-heading"
						ariaLabel={baggageServiceLabels("aria_labels.checked_in_baggage")}
						title={baggageServiceLabels("baggage_selection_checked_in_baggage")}
					/>
					{limitExceeded && (
						<div ref={limitExceededRef} tabIndex={-1} aria-live="polite">
							<Alert variant="error">
								<AlertDescription className="break-words font-bold [&_a]:no-underline">
									{baggageServiceLabels("error_labels.error_max_checked_in_baggage", {
										max: MAX_ITEMS_FOR_BAGGAGE_SELECTION,
									})}
								</AlertDescription>
							</Alert>
						</div>
					)}
					<div className="flex flex-col gap-2 md:gap-4">
						<CurrentNumberRow
							count={totalItems}
							max={maxItemsIncludingSports}
							disabled={
								availableCheckedInQty <= 0 && inventoryValidation.areAllSportsItemsUnavailable
							}
						/>
						<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
							<CounterCard
								icon="luggage"
								label={baggageServiceLabels("add_baggage")}
								description={
									availableCheckedInQty <= 10 && availableCheckedInQty > 0
										? baggageServiceLabels("remaining_available_stocks", {
												availableQty: availableCheckedInQty - checkedInBaggageCount,
											})
										: ""
								}
								price={checkedInPrice}
								count={checkedInBaggageCount}
								min={bundleId === "PREMIUM" || bundleId === "VALUE" ? 1 : 0}
								incrementDisabled={
									checkedInBaggageCount >= MAX_BAGGAGE_QUANTITY_PER_ITEM ||
									availableCheckedInQty <= 0 ||
									availableCheckedInQty <= checkedInBaggageCount
								}
								onChange={handleCheckedInChange}
								disabled={availableCheckedInQty <= 0}
							/>
						</div>
					</div>
				</div>

				<div className="flex flex-col gap-4">
					<SectionHeading
						className="text-base leading-6"
						id="sports-equipment-heading"
						ariaLabel={baggageServiceLabels("aria_labels.sports_equipment")}
						title={baggageServiceLabels("baggage_selection_sports_equipments")}
					/>
					<div className="grid grid-cols-1 gap-2.5 md:grid-cols-2 md:gap-4">
						{effectiveEquipment.map((item) => {
							const count = Number(item.count ?? equipmentCounts[item.id] ?? 0);
							const availableQty = availableInventory[item.ssrCode] ?? 0;
							const remainingQty = availableQty > 0 ? availableQty - count : 0;
							return (
								<CounterCard
									key={item.id}
									icon={item.icon}
									label={baggageServiceLabels(item.label)}
									description={
										availableQty <= 10 && availableQty > 0 && remainingQty > 0
											? baggageServiceLabels("remaining_available_stocks", {
													availableQty: remainingQty,
												})
											: ""
									}
									price={Number(item.price ?? 0) * Number(count ?? 0)}
									count={count}
									incrementDisabled={
										count >= MAX_BAGGAGE_QUANTITY_PER_ITEM ||
										availableQty <= 0 ||
										availableQty <= count
									}
									disabled={availableQty <= 0}
									onChange={(next) => updateEquipmentCount(item.id, next)}
								/>
							);
						})}
					</div>
				</div>
			</div>
		</>
	);
}

export { BaggageSelection };
