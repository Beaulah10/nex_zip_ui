/**
 * File: use-inflight-meal-options.ts
 * Description: Custom hook that prepares inflight meal option data for the meal
 * selection experience. It retrieves passenger, flight, and ancillary meal data,
 * determines bundle-included meal eligibility, builds meal option lists and lookup
 * maps, and provides the required meal configuration for the inflight meal
 * customization flow.
 */
import { useMemo } from "react";
import { getBookingStageSegment } from "@/modules/utils/helpers/common/flow-router/flow-router";
import {
	extractAdultMeals,
	extractMealServiceLookup,
	getBundleIncludedMealCodes,
} from "@/modules/utils/helpers/customize/inflight-meals/inflight-meals.utils/inflight-meals.utils";
import { useAppSelector } from "@/store/hooks";
import { selectAncillaryOffersDataByDirectionAndServiceCategory } from "@/store/slices/common/ancillary-offers/ancillary-offers";
import { selectConfirmedFlight } from "@/store/slices/flight-selection/flight-selection.slice";
import { selectPassengers } from "@/store/slices/passenger/passenger.slice";
import type { UseInflightMealOptionsParams } from "@/types/customize/inflight-meals/inflight-meal-hooks.types";

export function useInflightMealOptions({
	direction,
	selectedMealPassengerId,
	servicePassengers,
}: UseInflightMealOptionsParams) {
	const passengers = useAppSelector(selectPassengers);
	const confirmedFlight = useAppSelector(selectConfirmedFlight);
	const scope = getBookingStageSegment({
		confirmedFlight: confirmedFlight ?? undefined,
		direction,
	});
	const ancillaryData = useAppSelector((state) =>
		selectAncillaryOffersDataByDirectionAndServiceCategory(state, scope, "MEALS")
	);

	const directionSegmentLfids = useMemo(() => {
		if (!confirmedFlight) {
			return new Set<number>();
		}

		if (direction === "outbound") {
			return new Set(confirmedFlight.flights.outbound.segments.map((segment) => segment.lfid));
		}

		return new Set(
			(confirmedFlight.flights.inbound?.segments ?? []).map((segment) => segment.lfid)
		);
	}, [confirmedFlight, direction]);

	const bundleIncludedMealCodesByPassengerId = useMemo(() => {
		const servicePassengerById = Object.fromEntries(
			servicePassengers.map((passenger) => [passenger.id, passenger])
		);

		return Object.fromEntries(
			passengers.map((passenger) => {
				const servicePassenger = servicePassengerById[passenger.id];
				if (servicePassenger?.isIcnRoute && servicePassenger.isValueBundle) {
					return [passenger.id, new Set<string>()];
				}

				const includedMealCodes = new Set<string>();
				const passengerBundles = (passenger.bundles ?? []).filter((bundle) =>
					directionSegmentLfids.has(bundle.lfid)
				);

				for (const bundle of passengerBundles) {
					const bundleIncludedCodes = getBundleIncludedMealCodes(bundle.bundleCategory?.categories);

					for (const code of bundleIncludedCodes) {
						includedMealCodes.add(code);
					}
				}

				return [passenger.id, includedMealCodes];
			})
		);
	}, [passengers, directionSegmentLfids, servicePassengers]);

	const selectedPassengerMealIncludedCodes = useMemo(() => {
		if (!selectedMealPassengerId) {
			return undefined;
		}

		return bundleIncludedMealCodesByPassengerId[selectedMealPassengerId];
	}, [selectedMealPassengerId, bundleIncludedMealCodesByPassengerId]);

	const mealListOptions = useMemo(
		() =>
			extractAdultMeals(ancillaryData, {
				bundleIncludedMealCodes: selectedPassengerMealIncludedCodes,
			}),
		[ancillaryData, selectedPassengerMealIncludedCodes]
	);

	const mealServiceMap = useMemo(() => extractMealServiceLookup(ancillaryData), [ancillaryData]);
	const mealOptionNameById = useMemo(
		() =>
			Object.fromEntries(mealListOptions.map((meal) => [meal.id, meal.name])) as Record<
				string,
				string
			>,
		[mealListOptions]
	);

	return {
		passengers,
		bundleIncludedMealCodesByPassengerId,
		mealListOptions,
		mealServiceMap,
		mealOptionNameById,
	};
}
