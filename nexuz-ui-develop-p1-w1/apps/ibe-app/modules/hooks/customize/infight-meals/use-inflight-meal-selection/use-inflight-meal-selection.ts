/**
 * File: use-inflight-meal-selection.ts
 * Description: Custom hook that manages the inflight meal selection workflow.
 * It handles meal selection, removal, pricing calculations, stock validation,
 * mandatory meal validation, state synchronization, and confirmation processing
 * for passengers throughout the inflight meals customization
 **/

import { useMemo, useRef, useState } from "react";
import { useInflightMealAvailability } from "@/modules/hooks/customize/infight-meals/use-inflight-meal-availability/use-inflight-meal-availability";
import { useInflightMealValidation } from "@/modules/hooks/customize/infight-meals/use-inflight-meal-validation/use-inflight-meal-validation";
import { useInflightMealPrefill } from "@/modules/hooks/customize/infight-meals/use-inflightmeal-prefill/use-inflightmeal-prefill";
import {
	isMandatoryMealPassenger,
	normalizeServiceCode,
	recalculatePassengerMealItems,
} from "@/modules/utils/helpers/customize/inflight-meals/inflight-meal-selection.utils/inflight-meal-selection.utils";
import { toPassengerService } from "@/modules/utils/helpers/customize/inflight-meals/inflight-meals.utils/inflight-meals.utils";
import { addService, removeService } from "@/store/slices/passenger/passenger.slice";
import type { UseInflightMealSelectionParams } from "@/types/customize/inflight-meals/inflight-meal-hooks.types";
import type { SelectedMealLineItem } from "@/types/customize/inflight-meals/inflight-meals.types";

function syncPassengerMealServices({
	passengerId,
	lineItems,
	mealServiceMap,
	dispatch,
}: {
	passengerId: string;
	lineItems: SelectedMealLineItem[];
	mealServiceMap: UseInflightMealSelectionParams["mealServiceMap"];
	dispatch: UseInflightMealSelectionParams["dispatch"];
}): void {
	for (const lineItem of lineItems) {
		const entry = mealServiceMap[lineItem.mealId];
		if (!entry) {
			continue;
		}

		const service = toPassengerService(entry);
		dispatch(
			addService({
				passengerId,
				lfid: entry.service.lfid,
				service: { ...service, applicableAmount: lineItem.price },
				serviceCategory: "meals",
			})
		);
	}
}

export function useInflightMealSelection({
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
}: UseInflightMealSelectionParams) {
	const [mealPrices, setMealPrices] = useState<Record<string, number>>({});
	const [confirmedMealIdsByPassenger, setConfirmedMealIdsByPassenger] = useState<
		Record<string, string[]>
	>({});
	const [selectedMealsByPassenger, setSelectedMealsByPassenger] = useState<
		Record<string, SelectedMealLineItem[]>
	>({});
	const [pendingRemovalsByPassenger, setPendingRemovalsByPassenger] = useState<
		Record<string, string[]>
	>({});
	const hasHydratedSelectionStateRef = useRef(false);

	const {
		stockAwareMealListOptions,
		mealListOptionsById,
		mealListDisplayOptions,
		confirmedStockUsageByMealId,
	} = useInflightMealAvailability({
		passengers,
		mealListOptions,
		mealServiceMap,
		pendingRemovalsByPassenger,
		confirmedMealIdsByPassenger,
		selectedMealPassengerId,
	});

	const {
		selectedPassengerWarningMessage,
		mandatoryMealErrorMessage,
		incompleteMandatoryPassengerNames,
		outerValidationMessage,
		setShowMealRequiredError,
		setShowOuterValidationError,
	} = useInflightMealValidation({
		selectedMealPassengerId,
		servicePassengers,
		unavailablePassengerIds,
		selectedMealsByPassenger,
		confirmedMealIdsByPassenger,
		pendingRemovalsByPassenger,
		bundleIncludedMealCodesByPassengerId,
		mealServiceMap,
	});

	useInflightMealPrefill({
		open,
		servicePassengers,
		passengers,
		mealOptionNameById,
		bundleIncludedMealCodesByPassengerId,
		mealServiceMap,
		setConfirmedMealIdsByPassenger,
		setSelectedMealsByPassenger,
		setMealPrices,
		setPendingRemovalsByPassenger,
		hasHydratedSelectionStateRef,
	});

	const mealTotal = useMemo(
		() => Object.values(mealPrices).reduce((sum, price) => sum + price, 0),
		[mealPrices]
	);

	const getRemainingQtyForPassenger = (mealId: string, passengerId: string | null): number => {
		const meal = mealListOptionsById[mealId];
		if (!meal) {
			return 0;
		}

		const pendingMealIds = new Set(
			passengerId ? (pendingRemovalsByPassenger[passengerId] ?? []) : []
		);
		const passengerHasConfirmedMeal =
			passengerId !== null &&
			(confirmedMealIdsByPassenger[passengerId] ?? []).includes(mealId) &&
			!pendingMealIds.has(mealId);

		return Math.max(
			0,
			meal.qtyAvailable -
				(confirmedStockUsageByMealId[mealId] ?? 0) +
				(passengerHasConfirmedMeal ? 1 : 0)
		);
	};

	const onConfirmMeal = (
		mealId: string,
		_values: unknown,
		totalPrice: number
	): false | undefined => {
		if (!selectedMealPassengerId) {
			return undefined;
		}

		const passengerId = selectedMealPassengerId;
		if (getRemainingQtyForPassenger(mealId, passengerId) === 0) {
			return false;
		}

		const entry = mealServiceMap[mealId];
		if (entry) {
			const passengerSelectedMeals = selectedMealsByPassenger[passengerId] ?? [];
			const bundleIncludedMealCodes = bundleIncludedMealCodesByPassengerId[passengerId];
			const selectedMealServiceCode = normalizeServiceCode(entry.service.ssrCode);
			const isBundleIncludedMeal = bundleIncludedMealCodes?.has(selectedMealServiceCode) === true;
			const hasPreviouslySelectedBundleMeal = passengerSelectedMeals.some((meal) => {
				const selectedMealEntry = mealServiceMap[meal.mealId];
				if (!selectedMealEntry || meal.mealId === mealId) {
					return false;
				}

				return (
					bundleIncludedMealCodes?.has(normalizeServiceCode(selectedMealEntry.service.ssrCode)) ===
					true
				);
			});
			const service = toPassengerService(entry);
			const applicableAmount =
				isBundleIncludedMeal && !hasPreviouslySelectedBundleMeal ? 0 : service.amount;
			dispatch(
				addService({
					passengerId,
					lfid: entry.service.lfid,
					service: { ...service, applicableAmount },
					serviceCategory: "meals",
				})
			);
		}

		setPendingRemovalsByPassenger((prev) => {
			const current = prev[passengerId] ?? [];
			if (!current.includes(mealId)) {
				return prev;
			}

			return {
				...prev,
				[passengerId]: current.filter((id) => id !== mealId),
			};
		});

		const mealLabel = mealListOptionsById[mealId]?.name ?? mealId;
		setSelectedMealsByPassenger((prev) => {
			const current = prev[passengerId] ?? [];
			const exists = current.some((meal) => meal.mealId === mealId);
			const nextRaw = exists
				? current.map((meal) =>
						meal.mealId === mealId ? { ...meal, label: mealLabel, price: totalPrice } : meal
					)
				: [...current, { mealId, label: mealLabel, price: totalPrice }];
			const { lineItems } = recalculatePassengerMealItems({
				currentMeals: nextRaw,
				bundleIncludedMealCodes: bundleIncludedMealCodesByPassengerId[passengerId],
				mealServiceMap,
			});

			syncPassengerMealServices({
				passengerId,
				lineItems,
				mealServiceMap,
				dispatch,
			});

			setMealPrices((pricePrev) => ({
				...pricePrev,
				[passengerId]: lineItems.reduce((sum, meal) => sum + meal.price, 0),
			}));

			return { ...prev, [passengerId]: lineItems };
		});

		setConfirmedMealIdsByPassenger((prev) => {
			const current = prev[passengerId] ?? [];
			return current.includes(mealId) ? prev : { ...prev, [passengerId]: [...current, mealId] };
		});

		setSelectedMealPassengerId(null);
		setMealFlowStep("list");
		return undefined;
	};

	const onRemoveMeal = (mealId: string): void => {
		if (!selectedMealPassengerId) {
			return;
		}

		const passengerId = selectedMealPassengerId;
		const entry = mealServiceMap[mealId];
		if (entry) {
			dispatch(
				removeService({
					passengerId,
					lfid: entry.service.lfid,
					ssrCode: entry.service.ssrCode,
					serviceID: entry.service.ssrId,
				})
			);
		}

		setConfirmedMealIdsByPassenger((prev) => {
			const current = prev[passengerId] ?? [];
			return {
				...prev,
				[passengerId]: current.filter((id) => id !== mealId),
			};
		});

		setSelectedMealsByPassenger((prev) => {
			const current = prev[passengerId] ?? [];
			const filteredMeals = current.filter((meal) => meal.mealId !== mealId);
			const { lineItems } = recalculatePassengerMealItems({
				currentMeals: filteredMeals,
				bundleIncludedMealCodes: bundleIncludedMealCodesByPassengerId[passengerId],
				mealServiceMap,
			});

			syncPassengerMealServices({
				passengerId,
				lineItems,
				mealServiceMap,
				dispatch,
			});

			setMealPrices((pricePrev) => ({
				...pricePrev,
				[passengerId]: lineItems.reduce((sum, meal) => sum + meal.price, 0),
			}));

			return {
				...prev,
				[passengerId]: lineItems,
			};
		});

		setPendingRemovalsByPassenger((prev) => {
			const current = prev[passengerId] ?? [];
			if (!current.includes(mealId)) {
				return prev;
			}

			return {
				...prev,
				[passengerId]: current.filter((id) => id !== mealId),
			};
		});
	};

	const handleConfirmSelection = (): void => {
		if (selectedMealPassengerId !== null && mealFlowStep === "list") {
			const passenger = servicePassengers.find((entry) => entry.id === selectedMealPassengerId);
			if (passenger && isMandatoryMealPassenger(passenger)) {
				const confirmed = confirmedMealIdsByPassenger[selectedMealPassengerId] ?? [];
				const pending = new Set(pendingRemovalsByPassenger[selectedMealPassengerId] ?? []);
				if (confirmed.filter((id) => !pending.has(id)).length === 0) {
					setShowMealRequiredError(true);
					return;
				}
			}
		}

		if (selectedMealPassengerId === null && incompleteMandatoryPassengerNames.length > 0) {
			setShowOuterValidationError(true);
			return;
		}

		const removalsByPassenger = pendingRemovalsByPassenger;
		for (const [passengerId, mealIds] of Object.entries(removalsByPassenger)) {
			for (const mealId of mealIds) {
				const entry = mealServiceMap[mealId];
				if (!entry) {
					continue;
				}

				dispatch(
					removeService({
						passengerId,
						lfid: entry.service.lfid,
						ssrCode: entry.service.ssrCode,
						serviceID: entry.service.ssrId,
					})
				);
			}
		}

		if (Object.keys(removalsByPassenger).length > 0) {
			setConfirmedMealIdsByPassenger((prev) => {
				const next = { ...prev };
				for (const [passengerId, mealIds] of Object.entries(removalsByPassenger)) {
					const removalSet = new Set(mealIds);
					next[passengerId] = (next[passengerId] ?? []).filter((id) => !removalSet.has(id));
				}
				return next;
			});

			setSelectedMealsByPassenger((prev) => {
				const next: Record<string, SelectedMealLineItem[]> = { ...prev };
				for (const [passengerId, mealIds] of Object.entries(removalsByPassenger)) {
					const removalSet = new Set(mealIds);
					const filteredMeals = (next[passengerId] ?? []).filter(
						(meal) => !removalSet.has(meal.mealId)
					);
					next[passengerId] = recalculatePassengerMealItems({
						currentMeals: filteredMeals,
						bundleIncludedMealCodes: bundleIncludedMealCodesByPassengerId[passengerId],
						mealServiceMap,
					}).lineItems;
				}

				setMealPrices((pricePrev) => {
					const nextPrices = { ...pricePrev };
					for (const [passengerId, meals] of Object.entries(next)) {
						nextPrices[passengerId] = meals.reduce((sum, meal) => sum + meal.price, 0);
					}
					return nextPrices;
				});

				return next;
			});
		}

		setPendingRemovalsByPassenger({});
		if (selectedMealPassengerId !== null && mealFlowStep === "list") {
			if (closeOnMealConfirm) {
				onOpenChange(false);
				return;
			}

			setSelectedMealPassengerId(null);
			setMealFlowStep("list");
			return;
		}

		onOpenChange(false);
	};

	const handleDialogOpenChange = (nextOpen: boolean): void => {
		onOpenChange(nextOpen);
		setSelectedMealPassengerId(null);
		setMealFlowStep("list");
		setShowOuterValidationError(false);
		setShowMealRequiredError(false);
	};

	return {
		mealPrices,
		confirmedMealIdsByPassenger,
		selectedMealsByPassenger,
		stockAwareMealListOptions,
		mealListDisplayOptions,
		selectedPassengerWarningMessage,
		mandatoryMealErrorMessage,
		incompleteMandatoryPassengerNames,
		outerValidationMessage,
		mealTotal,
		onConfirmMeal,
		onRemoveMeal,
		handleConfirmSelection,
		handleDialogOpenChange,
	};
}
