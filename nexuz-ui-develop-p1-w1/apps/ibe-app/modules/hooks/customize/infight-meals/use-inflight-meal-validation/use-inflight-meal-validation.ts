/**
 * File: use-inflight-meal-selection.ts
 * Description: Custom hook that manages the inflight meal selection workflow.
 * It handles meal selection, removal, pricing calculations, stock validation,
 * mandatory meal validation, state synchronization, and confirmation processing
 * for passengers throughout the inflight meals customization experience.
 */
import { useEffect, useMemo, useState } from "react";
import { normalizeServiceCode } from "@/modules/utils/helpers/common/bundle-code-check/bundle-code-check.utils";
import {
	isMandatoryMealPassenger,
	recalculatePassengerMealItems,
} from "@/modules/utils/helpers/customize/inflight-meals/inflight-meal-selection.utils/inflight-meal-selection.utils";
import type { UseInflightMealValidationParams } from "@/types/customize/inflight-meals/inflight-meal-hooks.types";

export function useInflightMealValidation({
	selectedMealPassengerId,
	servicePassengers,
	unavailablePassengerIds,
	selectedMealsByPassenger,
	confirmedMealIdsByPassenger,
	pendingRemovalsByPassenger,
	bundleIncludedMealCodesByPassengerId,
	mealServiceMap,
}: UseInflightMealValidationParams) {
	const [showMealRequiredError, setShowMealRequiredError] = useState(false);
	const [showOuterValidationError, setShowOuterValidationError] = useState(false);

	const selectedPassengerWarningMessage = useMemo(() => {
		if (!selectedMealPassengerId) {
			return undefined;
		}

		if (unavailablePassengerIds?.has(selectedMealPassengerId)) {
			return undefined;
		}

		const passenger = servicePassengers.find((entry) => entry.id === selectedMealPassengerId);
		if (!passenger || !isMandatoryMealPassenger(passenger)) {
			return undefined;
		}

		const currentMeals = selectedMealsByPassenger[selectedMealPassengerId] ?? [];
		const pendingMealIds = new Set(pendingRemovalsByPassenger[selectedMealPassengerId] ?? []);
		const activeMeals = currentMeals.filter((meal) => !pendingMealIds.has(meal.mealId));
		const bundleIncludedCodes = bundleIncludedMealCodesByPassengerId[selectedMealPassengerId];
		const { bundleEligibleSelectedCount } = recalculatePassengerMealItems({
			currentMeals: activeMeals,
			bundleIncludedMealCodes: bundleIncludedCodes,
			mealServiceMap,
		});

		const hasNonBundleItems = activeMeals.some((meal) => {
			const entry = mealServiceMap[meal.mealId];
			const serviceCode = entry?.service.ssrCode
				? normalizeServiceCode(entry.service.ssrCode)
				: undefined;
			return serviceCode === undefined || bundleIncludedCodes?.has(serviceCode) !== true;
		});

		return bundleEligibleSelectedCount >= 2 || hasNonBundleItems ? "warning_bundle" : undefined;
	}, [
		selectedMealPassengerId,
		servicePassengers,
		selectedMealsByPassenger,
		pendingRemovalsByPassenger,
		bundleIncludedMealCodesByPassengerId,
		mealServiceMap,
		unavailablePassengerIds,
	]);

	// biome-ignore lint/correctness/useExhaustiveDependencies: selectedMealPassengerId is the intended trigger; state setter is stable
	useEffect(() => {
		setShowMealRequiredError(false);
	}, [selectedMealPassengerId]);

	const mandatoryMealErrorMessage = showMealRequiredError
		? "error_labels.mandatory_meal_required"
		: undefined;

	const incompleteMandatoryPassengerNames = useMemo(
		() =>
			servicePassengers
				.filter((passenger) => {
					if (unavailablePassengerIds?.has(passenger.id)) {
						return false;
					}

					if (!isMandatoryMealPassenger(passenger)) {
						return false;
					}

					const confirmed = confirmedMealIdsByPassenger[passenger.id] ?? [];
					const pending = new Set(pendingRemovalsByPassenger[passenger.id] ?? []);
					return confirmed.filter((id) => !pending.has(id)).length === 0;
				})
				.map((passenger) => passenger.name),
		[
			servicePassengers,
			confirmedMealIdsByPassenger,
			pendingRemovalsByPassenger,
			unavailablePassengerIds,
		]
	);

	const outerValidationMessage =
		showOuterValidationError && incompleteMandatoryPassengerNames.length > 0
			? "error_labels.outer_validation"
			: undefined;

	return {
		selectedPassengerWarningMessage,
		mandatoryMealErrorMessage,
		incompleteMandatoryPassengerNames,
		outerValidationMessage,
		showMealRequiredError,
		showOuterValidationError,
		setShowMealRequiredError,
		setShowOuterValidationError,
	};
}
