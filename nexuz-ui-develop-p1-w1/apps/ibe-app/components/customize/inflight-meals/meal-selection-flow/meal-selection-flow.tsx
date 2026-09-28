/**
 * File: meal-selection-flow.tsx
 * Description: Main inflight meal selection flow component that manages meal browsing,
 * category filtering, meal detail viewing, and meal confirmation for a passenger.
 * It displays available meal options, handles navigation between list and detail views,
 * tracks confirmed meal selections, and coordinates meal selection actions throughout
 * the inflight meals customization experience.
 */

"use client";

import { Alert, AlertDescription, AlertTitle } from "@repo/ui/components/alert";
import Icon from "@repo/ui/components/icon";
import { cn } from "@repo/ui/lib";
import { useTranslations } from "next-intl";
import {
	forwardRef,
	useCallback,
	useEffect,
	useImperativeHandle,
	useMemo,
	useRef,
	useState,
} from "react";
import { MealCard } from "@/components/customize/inflight-meals/meal-card/meal-card";
import { MealSelectionContent } from "@/components/customize/inflight-meals/meal-selection-dialog/meal-selection-dialog";
import { DEFAULT_INFLIGHT_MEAL_CATEGORIES } from "@/modules/utils/constants/inflight-meals/inflight-meal.constants";
import type {
	MealListCategory,
	MealListOption,
	MealSelectionFlowHandle,
	MealSelectionFlowProps,
} from "@/types/customize/inflight-meals/inflight-meals.types";

function MealListContentView({
	passengerName,
	warningMessage,
	errorMessage,
	categories = DEFAULT_INFLIGHT_MEAL_CATEGORIES,
	meals,
	selectedMealIds = [],
	onSelectMeal,
	onRemoveMeal,
}: {
	passengerName: string;
	warningMessage?: string;
	errorMessage?: string;
	categories?: MealListCategory[];
	meals: MealListOption[];
	selectedMealIds?: string[];
	onSelectMeal?: (meal: MealListOption) => void;
	onRemoveMeal?: (mealId: string) => void;
}) {
	const t = useTranslations("meals_service");
	const allergyNote = t("default_inflight_meal_allergy_note");
	const [activeCategory, setActiveCategory] = useState(categories[0]?.id ?? "all");

	const filteredMeals = useMemo(() => {
		if (activeCategory === "all") {
			return meals;
		}
		if (activeCategory === "bundle") {
			return meals.filter((meal) => Boolean(meal.bundleLabel));
		}
		return meals.filter((meal) => meal.category === activeCategory);
	}, [meals, activeCategory]);

	return (
		<div className="flex flex-1 flex-col gap-4">
			{errorMessage && (
				<Alert variant="error" aria-invalid="true">
					<AlertDescription>{errorMessage}</AlertDescription>
				</Alert>
			)}
			{warningMessage && (
				<Alert variant="warning">
					<AlertTitle>{warningMessage}</AlertTitle>
				</Alert>
			)}

			<div className="flex flex-col gap-2">
				<div className="flex items-center gap-2">
					<Icon name="person" size={24} fill={1} className="text-primary-700" aria-hidden="true" />
					<span className="font-bold text-2xl text-brand-japan-black leading-9">
						{passengerName}
					</span>
				</div>
				{allergyNote && <p className="text-base-700 text-xs leading-5">{allergyNote}</p>}
			</div>

			<div className="flex flex-wrap items-center gap-4">
				<h3 className="shrink-0 font-bold text-lg text-primary-700 leading-6">
					{t("choose_by_category")}
				</h3>
				<div className="flex flex-wrap items-center gap-2 md:gap-1">
					{categories.map((category) => {
						const isActive = category.id === activeCategory;
						return (
							<button
								key={category.id}
								type="button"
								aria-pressed={isActive}
								onClick={() => setActiveCategory(category.id)}
								className={cn(
									"flex cursor-pointer items-center gap-2 rounded-full border px-4 py-2 text-base leading-6 transition-colors",
									isActive
										? "border-primary-700 bg-green-50 font-bold text-primary-700"
										: "border-base-300 bg-white text-base-700 hover:border-base-400"
								)}
							>
								<Icon
									name={category.icon}
									size={24}
									fill={1}
									color=""
									className={isActive ? "text-primary-700" : "text-base-400"}
									aria-hidden="true"
								/>
								{category.label}
							</button>
						);
					})}
				</div>
			</div>

			{filteredMeals.length === 0 ? (
				<div className="flex flex-1 items-center justify-center py-8">
					<p className="text-center text-base-400 text-sm leading-6">{t("no_option_available")}</p>
				</div>
			) : (
				<div className="grid grid-cols-2 gap-2 sm:grid-cols-2 md:grid-cols-3 md:gap-4 lg:grid-cols-4">
					{filteredMeals.map((meal) => {
						const isSelected = selectedMealIds.includes(meal.id);
						return (
							<MealCard
								key={meal.id}
								imageSrc={meal.imageSrc}
								imageAlt={meal.imageAlt}
								dishName={meal.name}
								isHalal={meal.isHalal}
								hasDrink={meal.hasDrink}
								bundleLabel={meal.bundleLabel}
								originalPrice={meal.originalPrice}
								price={meal.price}
								remainingQty={meal.remainingQty}
								stockLabel={meal.stockLabel}
								disabled={meal.isOutOfStock && !isSelected}
								selected={isSelected}
								openOnCardClick
								onAdd={() => (isSelected ? onRemoveMeal?.(meal.id) : onSelectMeal?.(meal))}
							/>
						);
					})}
				</div>
			)}
		</div>
	);
}

const MealSelectionFlow = forwardRef<MealSelectionFlowHandle, MealSelectionFlowProps>(
	function MealSelectionFlow(
		{
			passengerName,
			hasBundleIncludedMeal,
			warningMessage,
			errorMessage,
			categories,
			meals,
			mealDetailsMap,
			onConfirm,
			onBack,
			onStepChange,
			initialConfirmedMealIds = [],
			onRemoveMeal,
		},
		ref
	) {
		const [selectedMeal, setSelectedMeal] = useState<MealListOption | null>(null);
		const [detailOpen, setDetailOpen] = useState(false);
		const [confirmedMealIds, setConfirmedMealIds] = useState<string[]>(initialConfirmedMealIds);
		const lastReportedStepRef = useRef<"list" | "detail" | null>(null);

		useEffect(() => {
			setConfirmedMealIds((current) => {
				if (
					current.length === initialConfirmedMealIds.length &&
					current.every((mealId, index) => mealId === initialConfirmedMealIds[index])
				) {
					return current;
				}

				return initialConfirmedMealIds;
			});
		}, [initialConfirmedMealIds]);

		useEffect(() => {
			const nextStep = detailOpen ? "detail" : "list";
			if (lastReportedStepRef.current === nextStep) {
				return;
			}

			lastReportedStepRef.current = nextStep;
			onStepChange?.(nextStep);
		}, [detailOpen, onStepChange]);

		const handleSelectMeal = useCallback((meal: MealListOption) => {
			setSelectedMeal(meal);
			setDetailOpen(true);
		}, []);

		const handleBackFromDetail = useCallback(() => {
			setDetailOpen(false);
			setSelectedMeal(null);
		}, []);

		const handleRemoveConfirmedMeal = useCallback(
			(mealId: string) => {
				setConfirmedMealIds((ids) => ids.filter((id) => id !== mealId));
				onRemoveMeal?.(mealId);
			},
			[onRemoveMeal]
		);

		const handleConfirmMealSelection = useCallback(
			(values: { drinkId?: string; timingId?: string }, totalPrice: number) => {
				if (!selectedMeal) {
					return undefined;
				}

				const confirmResult = onConfirm?.(selectedMeal.id, values, totalPrice);
				if (confirmResult === false) {
					return undefined;
				}

				setConfirmedMealIds((ids) =>
					ids.includes(selectedMeal.id) ? ids : [...ids, selectedMeal.id]
				);
				setSelectedMeal(null);
				setDetailOpen(false);
				onBack?.();
				return undefined;
			},
			[selectedMeal, onConfirm, onBack]
		);

		useImperativeHandle(
			ref,
			() => ({
				goBack: () => {
					if (detailOpen) {
						handleBackFromDetail();
					} else {
						onBack?.();
					}
				},
			}),
			[detailOpen, handleBackFromDetail, onBack]
		);

		const mealDetails = selectedMeal ? mealDetailsMap[selectedMeal.id] : null;
		const bundleIncludedConfirmedCount = confirmedMealIds.reduce((count, mealId) => {
			const meal = meals.find((option) => option.id === mealId);
			return meal?.bundleLabel ? count + 1 : count;
		}, 0);
		const shouldShowBundleChargeWarning = Boolean(
			hasBundleIncludedMeal &&
				selectedMeal &&
				(selectedMeal.price > 0 ||
					(Boolean(selectedMeal.bundleLabel) && bundleIncludedConfirmedCount >= 1))
		);

		if (!detailOpen) {
			return (
				<MealListContentView
					passengerName={passengerName}
					warningMessage={warningMessage}
					errorMessage={errorMessage}
					categories={categories}
					meals={meals}
					selectedMealIds={confirmedMealIds}
					onSelectMeal={handleSelectMeal}
					onRemoveMeal={handleRemoveConfirmedMeal}
				/>
			);
		}

		if (mealDetails && selectedMeal) {
			return (
				<MealSelectionContent
					{...mealDetails}
					passengerName={passengerName}
					showBundleChargeWarning={shouldShowBundleChargeWarning}
					onConfirm={handleConfirmMealSelection}
				/>
			);
		}

		return null;
	}
);

export { MealSelectionFlow };
