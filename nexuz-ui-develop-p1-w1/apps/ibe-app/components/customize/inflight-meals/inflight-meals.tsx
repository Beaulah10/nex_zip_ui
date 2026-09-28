/**
 * File: inflight-meals.tsx
 * Description: Main Inflight Meals dialog component that manages meal selection
 * for passengers during the booking customization flow. It displays passenger-specific
 * meal services, handles meal selection and validation, manages navigation between
 * passenger, meal list, and meal detail views, and tracks the overall meal selection
 * summary and pricing before confirmation.
 */

"use client";

import { Alert, AlertTitle } from "@repo/ui/components/alert";
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
import { useEffect, useRef, useState } from "react";
import { PassengerService } from "@/components/common/passenger-service/passenger-service";
import { MealSelectionFlow } from "@/components/customize/inflight-meals/meal-selection-flow/meal-selection-flow";
import { useInflightMealOptions } from "@/modules/hooks/customize/infight-meals/use-inflight-meal-options/use-inflight-meal-options";
import { useInflightMealSelection } from "@/modules/hooks/customize/infight-meals/use-inflight-meal-selection/use-inflight-meal-selection";
import {
	isPremiumBundleCode,
	isValueBundleCode,
} from "@/modules/utils/helpers/common/bundle-code-check/bundle-code-check.utils";
import { setFocusOnInvalidInput } from "@/modules/utils/helpers/common/field-focus/field-focus";
import { formatPrice } from "@/modules/utils/helpers/currency-formatter";
import { isMandatoryMealPassenger } from "@/modules/utils/helpers/customize/inflight-meals/inflight-meal-selection.utils/inflight-meal-selection.utils";
import { buildMealDetailsMap } from "@/modules/utils/helpers/customize/inflight-meals/inflight-meals.utils/inflight-meals.utils";
import { useAppDispatch } from "@/store/hooks";
import type {
	InflightMealsDialogProps,
	MealSelectionFlowHandle,
	MealSelectionFlowProps,
} from "@/types/customize/inflight-meals/inflight-meals.types";

export function InflightMeals({
	open,
	onOpenChange,
	triggerRef,
	stageLabel,
	routeLabel,
	direction,
	servicePassengers,
	unavailablePassengerIds,
	onMealSelectionSummaryChange,
	initialSelectedMealPassengerId,
	hideHeaderBackButtonOnMealList,
	closeOnMealConfirm,
}: InflightMealsDialogProps) {
	const dispatch = useAppDispatch();
	const mealFlowRef = useRef<MealSelectionFlowHandle>(null);
	const [selectedMealPassengerId, setSelectedMealPassengerId] = useState<string | null>(null);
	const [mealFlowStep, setMealFlowStep] = useState<"list" | "detail">("list");
	const scrollContainerRef = useRef<HTMLDivElement>(null);
	const savedScrollTopRef = useRef(0);

	// Save scroll position when entering Screen 2; restore it when returning to Screen 1
	useEffect(() => {
		const container = scrollContainerRef.current;
		if (!container) return;
		if (selectedMealPassengerId !== null) {
			savedScrollTopRef.current = container.scrollTop;
			container.scrollTop = 0;
		} else {
			container.scrollTop = savedScrollTopRef.current;
		}
	}, [selectedMealPassengerId]);
	const t = useTranslations("meals_service");
	const passengerNameLabels = useTranslations("passenger_name_page");

	const {
		passengers,
		bundleIncludedMealCodesByPassengerId,
		mealListOptions,
		mealServiceMap,
		mealOptionNameById,
	} = useInflightMealOptions({ direction, selectedMealPassengerId, servicePassengers });

	const {
		mealPrices,
		confirmedMealIdsByPassenger,
		selectedMealsByPassenger,
		stockAwareMealListOptions,
		mealListDisplayOptions,
		selectedPassengerWarningMessage,
		mandatoryMealErrorMessage,
		outerValidationMessage,
		incompleteMandatoryPassengerNames,
		mealTotal,
		onConfirmMeal,
		onRemoveMeal,
		handleConfirmSelection,
		handleDialogOpenChange,
	} = useInflightMealSelection({
		open,
		servicePassengers,
		unavailablePassengerIds,
		onOpenChange,
		closeOnMealConfirm,
		selectedMealPassengerId,
		setSelectedMealPassengerId,
		mealFlowStep,
		setMealFlowStep,
		passengers,
		bundleIncludedMealCodesByPassengerId,
		mealListOptions,
		mealServiceMap,
		mealOptionNameById,
		dispatch,
	});

	const translatedSelectedPassengerWarningMessage = selectedPassengerWarningMessage
		? t("service_not_included_in_bundle")
		: undefined;
	const selectedMealPassenger = servicePassengers.find(
		(passenger) => passenger.id === selectedMealPassengerId
	);
	const hasBundleIncludedMeal = selectedMealPassenger
		? isMandatoryMealPassenger(selectedMealPassenger)
		: false;
	const translatedMandatoryMealErrorMessage = mandatoryMealErrorMessage
		? t(mandatoryMealErrorMessage)
		: undefined;
	const translatedOuterValidationMessage =
		outerValidationMessage && incompleteMandatoryPassengerNames.length > 0
			? t(outerValidationMessage, {
					passengers: incompleteMandatoryPassengerNames
						.map((name: string) => `"${name}"`)
						.join(", "),
				})
			: undefined;

	useEffect(() => {
		if (!open) {
			return;
		}

		setSelectedMealPassengerId(initialSelectedMealPassengerId ?? null);
		setMealFlowStep("list");
	}, [open, initialSelectedMealPassengerId]);

	const showHeaderBackButton =
		selectedMealPassengerId !== null &&
		!(hideHeaderBackButtonOnMealList && mealFlowStep === "list");

	const handleMealFlowConfirm: NonNullable<MealSelectionFlowProps["onConfirm"]> = (
		mealId,
		values,
		totalPrice
	) => {
		const result = onConfirmMeal(mealId, values, totalPrice);

		if (result !== false && closeOnMealConfirm) {
			handleDialogOpenChange(false);
		}

		return result;
	};

	useEffect(() => {
		if (translatedOuterValidationMessage || translatedMandatoryMealErrorMessage) {
			setFocusOnInvalidInput();
		}
	}, [translatedOuterValidationMessage, translatedMandatoryMealErrorMessage]);

	useEffect(() => {
		if (!onMealSelectionSummaryChange) {
			return;
		}

		const isIcnRoute = servicePassengers.some((passenger) => passenger.isIcnRoute);
		const eligiblePassengerIds = new Set(
			servicePassengers
				.filter((passenger) => {
					if (isIcnRoute) {
						return isPremiumBundleCode(passenger.bundleCode);
					}
					return (
						isValueBundleCode(passenger.bundleCode) || isPremiumBundleCode(passenger.bundleCode)
					);
				})
				.map((passenger) => passenger.id)
		);

		const selectedEligiblePassengerCount = [...eligiblePassengerIds].reduce(
			(count, passengerId) => {
				const selectedMeals = selectedMealsByPassenger[passengerId] ?? [];
				return selectedMeals.length > 0 ? count + 1 : count;
			},
			0
		);

		onMealSelectionSummaryChange(selectedEligiblePassengerCount);
	}, [onMealSelectionSummaryChange, selectedMealsByPassenger, servicePassengers]);

	return (
		<Dialog open={open} onOpenChange={handleDialogOpenChange}>
			<DialogContent
				desktopWidth={1024}
				onCloseAutoFocus={(event) => {
					event.preventDefault();
					triggerRef?.current?.focus({ preventScroll: true });
				}}
				className="flex max-h-[calc(100svh-48px)] w-[calc(100%-32px)] flex-col"
			>
				<DialogHeader>
					<div className="flex items-center gap-4">
						{showHeaderBackButton && (
							<button
								type="button"
								aria-label="Back"
								onClick={() => mealFlowRef.current?.goBack()}
								className="shrink-0 text-base-950"
							>
								<Icon
									name="arrow_back"
									size={24}
									className="text-current"
									color="text-gray-900"
									aria-hidden="true"
								/>
							</button>
						)}
						<div className="flex flex-col gap-1">
							<DialogTitle>{`${t("title")} - ${stageLabel}`}</DialogTitle>
							<span className="text-base-700 text-xs leading-5">{routeLabel}</span>
						</div>
					</div>
				</DialogHeader>

				<div
					ref={scrollContainerRef}
					className={cn(
						"flex flex-1 flex-col overflow-y-auto",
						mealFlowStep === "detail" ? "" : "gap-4 px-4 py-2 md:px-6"
					)}
				>
					{selectedMealPassengerId === null ? (
						<>
							{translatedOuterValidationMessage && (
								<Alert variant="error" aria-invalid="true">
									<AlertTitle>{translatedOuterValidationMessage}</AlertTitle>
								</Alert>
							)}
							{servicePassengers.map((passenger) => (
								<PassengerService
									key={passenger.id}
									name={passenger.name}
									bundleLabelKey={passenger.bundleLabel}
									features={passenger.mealfeatures}
									totalPrice={
										(selectedMealsByPassenger[passenger.id] ?? []).length > 0
											? mealPrices[passenger.id]
											: undefined
									}
									categories={
										(selectedMealsByPassenger[passenger.id] ?? []).length > 0
											? [
													{
														items: (selectedMealsByPassenger[passenger.id] ?? []).map((meal) => ({
															label: meal.label,
															price: meal.price,
														})),
													},
												]
											: undefined
									}
									onAdd={() => setSelectedMealPassengerId(passenger.id)}
									onChange={() => setSelectedMealPassengerId(passenger.id)}
								/>
							))}
						</>
					) : (
						<MealSelectionFlow
							ref={mealFlowRef}
							initialConfirmedMealIds={
								selectedMealPassengerId
									? (confirmedMealIdsByPassenger[selectedMealPassengerId] ?? [])
									: []
							}
							passengerName={selectedMealPassenger?.name || ""}
							hasBundleIncludedMeal={hasBundleIncludedMeal}
							warningMessage={translatedSelectedPassengerWarningMessage}
							errorMessage={translatedMandatoryMealErrorMessage}
							meals={mealListDisplayOptions}
							mealDetailsMap={buildMealDetailsMap(
								stockAwareMealListOptions,
								selectedMealPassenger?.name || "",
								routeLabel
							)}
							onConfirm={handleMealFlowConfirm}
							onRemoveMeal={onRemoveMeal}
							onBack={() => {
								setSelectedMealPassengerId(null);
								setMealFlowStep("list");
							}}
							onStepChange={setMealFlowStep}
						/>
					)}
				</div>

				{!(selectedMealPassengerId !== null && mealFlowStep === "detail") && (
					<DialogFooter className="mt-auto flex flex-col items-end gap-3 py-4 md:mt-0 md:flex-row md:items-center md:justify-end md:gap-6 md:py-3">
						<div className="flex w-full items-end justify-end gap-2 md:w-auto">
							<span className="text-brand-japan-black text-sm leading-6">
								{passengerNameLabels("total_amount_label")}
							</span>
							<span
								className={cn(
									"font-bold text-4xl leading-13",
									mealTotal > 0 ? "text-primary-700" : "text-base-400"
								)}
							>
								{formatPrice(mealTotal)}
							</span>
						</div>
						<Button
							className="w-full md:w-auto"
							type="button"
							variant="primary"
							size="xl"
							onClick={() => {
								handleConfirmSelection();
								if (translatedOuterValidationMessage || translatedMandatoryMealErrorMessage) {
									setFocusOnInvalidInput();
								}
							}}
						>
							{t("confirm_selection")}
						</Button>
					</DialogFooter>
				)}
			</DialogContent>
		</Dialog>
	);
}
