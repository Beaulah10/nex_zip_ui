/**
 * File: use-inflight-meal-prefill.ts
 * Description: Custom hook that hydrates inflight meal selection state from
 * existing passenger meal services when the inflight meals dialog is opened.
 * It restores previously selected meals, calculates passenger meal pricing,
 * applies bundle meal rules, and initializes meal selection data to ensure
 * a consistent editing experience across dialog sessions.
 */
import { useEffect } from "react";
import { recalculatePassengerMealItems } from "@/modules/utils/helpers/customize/inflight-meals/inflight-meal-selection.utils/inflight-meal-selection.utils";
import type { UseInflightMealHydrationParams } from "@/types/customize/inflight-meals/inflight-meal-hooks.types";
import type { SelectedMealLineItem } from "@/types/customize/inflight-meals/inflight-meals.types";

export function useInflightMealPrefill({
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
}: UseInflightMealHydrationParams) {
	useEffect(() => {
		if (!open) {
			hasHydratedSelectionStateRef.current = false;
			return;
		}

		if (hasHydratedSelectionStateRef.current) {
			return;
		}

		if (servicePassengers.length === 0 || passengers.length === 0) {
			return;
		}

		const nextConfirmedMealIdsByPassenger: Record<string, string[]> = {};
		const nextSelectedMealsByPassenger: Record<string, SelectedMealLineItem[]> = {};
		const nextMealPrices: Record<string, number> = {};

		for (const servicePassenger of servicePassengers) {
			const passenger = passengers.find((entry) => entry.id === servicePassenger.id);
			if (!passenger) {
				continue;
			}

			const scopedMealServices = (passenger.services?.meals ?? []).filter((service) => {
				const mappedMeal = mealServiceMap[service.serviceID.toString()];
				return mappedMeal ? service.lfid === mappedMeal.service.lfid : false;
			});
			if (scopedMealServices.length === 0) {
				continue;
			}

			const selectedMealItemsById = new Map<string, SelectedMealLineItem>();
			for (const service of scopedMealServices) {
				const mealId = service.serviceID.toString();
				selectedMealItemsById.set(mealId, {
					mealId,
					label: mealOptionNameById[mealId] ?? service.description ?? mealId,
					price: service.amount,
				});
			}

			const confirmedMealIds = Array.from(selectedMealItemsById.keys());
			const selectedMealItems = Array.from(selectedMealItemsById.values());
			const { lineItems } = recalculatePassengerMealItems({
				currentMeals: selectedMealItems,
				bundleIncludedMealCodes: bundleIncludedMealCodesByPassengerId[servicePassenger.id],
				mealServiceMap,
			});

			nextConfirmedMealIdsByPassenger[servicePassenger.id] = confirmedMealIds;
			nextSelectedMealsByPassenger[servicePassenger.id] = lineItems;
			nextMealPrices[servicePassenger.id] = lineItems.reduce(
				(sum, mealItem) => sum + mealItem.price,
				0
			);
		}

		setConfirmedMealIdsByPassenger(nextConfirmedMealIdsByPassenger);
		setSelectedMealsByPassenger(nextSelectedMealsByPassenger);
		setMealPrices(nextMealPrices);
		setPendingRemovalsByPassenger({});
		hasHydratedSelectionStateRef.current = true;
	}, [
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
	]);
}
