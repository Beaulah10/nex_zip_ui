/**
 * File: use-inflight-meal-availability.ts
 * Description: Custom hook that manages inflight meal availability and stock calculations.
 * It tracks confirmed and pending meal selections across passengers, calculates remaining
 * meal inventory, determines out-of-stock status, and provides stock-aware meal options
 * for display and selection within the inflight meals customization flow.
 */

import { useMemo } from "react";
import { formatStockLabel } from "@/modules/utils/helpers/customize/inflight-meals/inflight-meal-selection.utils/inflight-meal-selection.utils";
import type { UseInflightMealStockParams } from "@/types/customize/inflight-meals/inflight-meal-hooks.types";

export function useInflightMealAvailability({
	passengers,
	mealListOptions,
	mealServiceMap,
	pendingRemovalsByPassenger,
	confirmedMealIdsByPassenger,
	selectedMealPassengerId,
}: UseInflightMealStockParams) {
	const confirmedDirectionServices = useMemo(
		() =>
			passengers.flatMap((passenger) =>
				(passenger.services?.meals ?? []).filter((service) => {
					const mappedMeal = mealServiceMap[service.serviceID.toString()];
					if (!mappedMeal) {
						return false;
					}

					return service.lfid === mappedMeal.service.lfid;
				})
			),
		[passengers, mealServiceMap]
	);

	const pendingRemovalCountsByMealId = useMemo(() => {
		const counts: Record<string, number> = {};

		for (const mealIds of Object.values(pendingRemovalsByPassenger)) {
			for (const mealId of mealIds) {
				if (!mealServiceMap[mealId]) {
					continue;
				}

				counts[mealId] = (counts[mealId] ?? 0) + 1;
			}
		}

		return counts;
	}, [pendingRemovalsByPassenger, mealServiceMap]);

	const confirmedStockUsageByMealId = useMemo(() => {
		const counts: Record<string, number> = {};

		for (const service of confirmedDirectionServices) {
			const mealId = service.serviceID.toString();
			counts[mealId] = (counts[mealId] ?? 0) + 1;
		}

		for (const [mealId, pendingCount] of Object.entries(pendingRemovalCountsByMealId)) {
			counts[mealId] = Math.max(0, (counts[mealId] ?? 0) - pendingCount);
		}

		return counts;
	}, [confirmedDirectionServices, pendingRemovalCountsByMealId]);

	const selectedPassengerConfirmedMealIds = useMemo(() => {
		if (!selectedMealPassengerId) {
			return new Set<string>();
		}

		const pendingMealIds = new Set(pendingRemovalsByPassenger[selectedMealPassengerId] ?? []);
		return new Set(
			(confirmedMealIdsByPassenger[selectedMealPassengerId] ?? []).filter(
				(mealId) => !pendingMealIds.has(mealId)
			)
		);
	}, [selectedMealPassengerId, confirmedMealIdsByPassenger, pendingRemovalsByPassenger]);

	const stockAwareMealListOptions = useMemo(
		() =>
			mealListOptions.map((meal) => {
				const confirmedCount = confirmedStockUsageByMealId[meal.id] ?? 0;
				const reservedBySelectedPassenger = selectedPassengerConfirmedMealIds.has(meal.id) ? 1 : 0;
				const remainingQty = Math.max(
					0,
					meal.qtyAvailable - confirmedCount + reservedBySelectedPassenger
				);

				return {
					...meal,
					remainingQty,
					stockLabel: formatStockLabel(remainingQty),
					isOutOfStock: remainingQty === 0,
				};
			}),
		[mealListOptions, confirmedStockUsageByMealId, selectedPassengerConfirmedMealIds]
	);

	const mealListOptionsById = useMemo(
		() => Object.fromEntries(stockAwareMealListOptions.map((meal) => [meal.id, meal])),
		[stockAwareMealListOptions]
	);

	const mealListDisplayOptions = useMemo(
		() => stockAwareMealListOptions,
		[stockAwareMealListOptions]
	);

	return {
		confirmedStockUsageByMealId,
		stockAwareMealListOptions,
		mealListOptionsById,
		mealListDisplayOptions,
	};
}
