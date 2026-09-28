import { useMemo } from "react";
import {
	isPremiumBundleCode,
	isValueBundleCode,
} from "@/modules/utils/helpers/common/bundle-code-check/bundle-code-check.utils";
import type { InflightMealPassenger } from "@/types/customize/inflight-meals/inflight-meals.types";
import type { PassengerValues } from "@/types/passenger/passenger.type";

export type UseInflightMealSummaryParams = {
	selectedAncillarySegmentLfid?: number;
	servicePassengers: InflightMealPassenger[];
	storedPassengers: PassengerValues[];
	unavailablePassengerIds?: ReadonlySet<string>;
};

export function useInflightMealSummary({
	selectedAncillarySegmentLfid,
	servicePassengers,
	storedPassengers,
	unavailablePassengerIds,
}: UseInflightMealSummaryParams) {
	const eligiblePassengerIds = useMemo(() => {
		const isCurrentDirectionICNRoute = servicePassengers.some((passenger) => passenger.isIcnRoute);
		return new Set(
			servicePassengers
				.filter((passenger) => {
					if (unavailablePassengerIds?.has(passenger.id)) {
						return false;
					}

					if (isCurrentDirectionICNRoute) {
						return isPremiumBundleCode(passenger.bundleCode);
					}

					return (
						isValueBundleCode(passenger.bundleCode) || isPremiumBundleCode(passenger.bundleCode)
					);
				})
				.map((passenger) => passenger.id)
		);
	}, [servicePassengers, unavailablePassengerIds]);

	const selectedMealPassengerCount = useMemo(() => {
		return storedPassengers.reduce((count, passenger) => {
			if (!eligiblePassengerIds.has(passenger.id)) {
				return count;
			}

			const selectedMeals = (passenger.services?.meals ?? []).filter((service) =>
				selectedAncillarySegmentLfid ? service.lfid === selectedAncillarySegmentLfid : true
			);

			return selectedMeals.length > 0 ? count + 1 : count;
		}, 0);
	}, [eligiblePassengerIds, selectedAncillarySegmentLfid, storedPassengers]);

	return {
		eligibleMealPassengerCount: eligiblePassengerIds.size,
		selectedMealPassengerCount,
		requiredMealSelectionCount: Math.max(
			sizeToCount(eligiblePassengerIds.size) - selectedMealPassengerCount,
			0
		),
	};
}

function sizeToCount(size: number): number {
	return size;
}
