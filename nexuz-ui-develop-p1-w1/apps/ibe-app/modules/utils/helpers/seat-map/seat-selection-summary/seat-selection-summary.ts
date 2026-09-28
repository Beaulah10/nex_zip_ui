/**
 * File: seat-selection-summary.ts
 * Description: Pure helper functions for deriving the seat-card progress summary
 * shown on the Customize page for complimentary bundle and adjacent-seat selection.
 */

import { getBundleSeatServiceCodes } from "@/modules/utils/helpers/seat-map/bundle-seat-pricing/bundle-seat-pricing";
import { isBundleSeatEligible } from "@/modules/utils/helpers/seat-map/seat-map-passenger-panel/seat-map-passenger-panel";
import { toSeatValidationPassengers } from "@/modules/utils/helpers/seat-map/seat-selection-availability/seat-selection-availability";
import { getAdjacentFreePassengerIds } from "@/modules/utils/validations/seat-map/seat-validation";
import type {
	SeatSelectionProgressSummary,
	SeatSelectionSummaryAdjacentPassenger,
	SeatSelectionSummaryLabels,
	SeatSelectionSummaryPassenger,
	StoredPassengerSeatState,
} from "@/types/seat-map/seat-map.types";

export const formatSeatSelectedText = (
	count: number,
	labels: SeatSelectionSummaryLabels
): string | undefined => {
	if (count <= 0) {
		return undefined;
	}

	return count === 1 ? labels.selectedSingle(count) : labels.selectedMultiple(count);
};

export const formatRequiredSeatSelectionText = (
	count: number,
	labels: SeatSelectionSummaryLabels
): string | undefined => {
	if (count <= 0) {
		return undefined;
	}

	return count === 1 ? labels.requiredSingle(count) : labels.requiredMultiple(count);
};

export function getSeatSelectionProgressSummary({
	servicePassengers,
	adjacentPassengers = [],
	storedPassengers,
	currentLfid,
	currentPfid,
	labels,
}: {
	servicePassengers: SeatSelectionSummaryPassenger[];
	adjacentPassengers?: SeatSelectionSummaryAdjacentPassenger[];
	storedPassengers: StoredPassengerSeatState[];
	currentLfid?: number;
	currentPfid?: number;
	labels: SeatSelectionSummaryLabels;
}): SeatSelectionProgressSummary {
	const bundleEligiblePassengerIds = servicePassengers
		.filter((passenger) => {
			if (passenger.passengerTypeCode === "infant") {
				return false;
			}

			const storedPassenger = storedPassengers.find(
				(storedPassengerState) => storedPassengerState.id === passenger.id
			);

			if (storedPassenger?.bundles) {
				return getBundleSeatServiceCodes(storedPassenger, currentLfid).size > 0;
			}

			return isBundleSeatEligible(passenger.bundleCode);
		})
		.map((passenger) => passenger.id);

	const adjacentEligiblePassengerIds = getAdjacentFreePassengerIds(
		toSeatValidationPassengers(adjacentPassengers)
	);

	const eligiblePassengerIds = new Set([
		...bundleEligiblePassengerIds,
		...adjacentEligiblePassengerIds,
	]);
	const bundleEligiblePassengerIdSet = new Set(bundleEligiblePassengerIds);
	const adjacentEligiblePassengerIdSet = new Set(adjacentEligiblePassengerIds);

	const entitledSeatCount = eligiblePassengerIds.size;

	if (entitledSeatCount === 0) {
		return {
			entitledSeatCount: 0,
			selectedSeatCount: 0,
			remainingBundleRequiredSeatCount: 0,
			remainingAdjacentRequiredSeatCount: 0,
			remainingRequiredSeatCount: 0,
		};
	}

	if (!currentLfid) {
		return {
			freeItemsText: formatRequiredSeatSelectionText(entitledSeatCount, labels),
			entitledSeatCount,
			selectedSeatCount: 0,
			remainingBundleRequiredSeatCount: bundleEligiblePassengerIdSet.size,
			remainingAdjacentRequiredSeatCount: adjacentEligiblePassengerIdSet.size,
			remainingRequiredSeatCount: entitledSeatCount,
		};
	}

	let selectedSeatCount = 0;
	let selectedBundleSeatCount = 0;
	let selectedAdjacentSeatCount = 0;

	for (const passenger of storedPassengers) {
		const hasSelectedSeatForCurrentSegment = passenger.seats?.some(
			(seat) =>
				seat.lfid === currentLfid && (currentPfid === undefined || seat.pfid === currentPfid)
		);

		if (!hasSelectedSeatForCurrentSegment) {
			continue;
		}

		if (eligiblePassengerIds.has(passenger.id)) {
			selectedSeatCount += 1;
		}

		if (bundleEligiblePassengerIdSet.has(passenger.id)) {
			selectedBundleSeatCount += 1;
		}

		if (adjacentEligiblePassengerIdSet.has(passenger.id)) {
			selectedAdjacentSeatCount += 1;
		}
	}

	const remainingBundleRequiredSeatCount = Math.max(
		bundleEligiblePassengerIdSet.size - selectedBundleSeatCount,
		0
	);
	const remainingAdjacentRequiredSeatCount = Math.max(
		adjacentEligiblePassengerIdSet.size - selectedAdjacentSeatCount,
		0
	);
	const remainingRequiredSeatCount = Math.max(entitledSeatCount - selectedSeatCount, 0);

	if (remainingRequiredSeatCount === 0) {
		return {
			selectedItemsText: labels.allSelected,
			freeItemsText: undefined,
			entitledSeatCount,
			selectedSeatCount,
			remainingBundleRequiredSeatCount,
			remainingAdjacentRequiredSeatCount,
			remainingRequiredSeatCount,
		};
	}

	return {
		selectedItemsText: formatSeatSelectedText(selectedSeatCount, labels),
		freeItemsText: formatRequiredSeatSelectionText(remainingRequiredSeatCount, labels),
		entitledSeatCount,
		selectedSeatCount,
		remainingBundleRequiredSeatCount,
		remainingAdjacentRequiredSeatCount,
		remainingRequiredSeatCount,
	};
}
