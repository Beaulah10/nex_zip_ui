/**
 * File: baggage-validation.ts
 * Description: Utility functions for validating baggage selections. It includes functions to check if baggage selections are valid based on available inventory and passenger selections.
 */

import type {
	PassengerBaggageServices,
	PassengerServiceForCarryOn,
	PassengerServiceWithQuantity,
	PassengerWithBaggageSelection,
	SegmentComparisonResult,
} from "@/types/baggage-selection/baggage-selection.types";

// check if carry-on service is selected for a passenger
export const hasCabn = (carryOn: PassengerServiceForCarryOn) => Boolean(carryOn.CABN);

// get the quantity of a specific service for a passenger
export const getQuantity = (services: PassengerServiceWithQuantity, ssrCode: string) =>
	services[ssrCode]?.quantity ?? 0;

// ............. segment mismatch helpers ...................
export const compareSegmentSelections = (
	currentSelection: PassengerWithBaggageSelection,
	otherSelection: PassengerWithBaggageSelection
): SegmentComparisonResult => {
	const currentMap: Record<string, number> = {};
	const otherMap: Record<string, number> = {};

	// Carry-on
	currentMap.CABN = hasCabn(currentSelection.baggageServices.carryOn) ? 1 : 0;
	otherMap.CABN = hasCabn(otherSelection.baggageServices.carryOn) ? 1 : 0;

	// Checked-in
	for (const [ssrCode, item] of Object.entries(currentSelection.baggageServices.checkedIn)) {
		currentMap[ssrCode] = item.quantity;
	}

	for (const [ssrCode, item] of Object.entries(otherSelection.baggageServices.checkedIn)) {
		otherMap[ssrCode] = item.quantity;
	}

	// Sports
	for (const [ssrCode, item] of Object.entries(currentSelection.baggageServices.sportsEquipment)) {
		currentMap[ssrCode] = item.quantity;
	}

	for (const [ssrCode, item] of Object.entries(otherSelection.baggageServices.sportsEquipment)) {
		otherMap[ssrCode] = item.quantity;
	}

	const allSsrCodes = new Set([...Object.keys(currentMap), ...Object.keys(otherMap)]);

	const currentGreater: string[] = [];
	const otherGreater: string[] = [];

	for (const ssrCode of allSsrCodes) {
		const currentQty = currentMap[ssrCode] ?? 0;
		const otherQty = otherMap[ssrCode] ?? 0;

		if (currentQty > otherQty) {
			currentGreater.push(ssrCode);
		}

		if (otherQty > currentQty) {
			otherGreater.push(ssrCode);
		}
	}

	return {
		currentGreater,
		otherGreater,
		hasCurrentGreater: currentGreater.length > 0,
		hasOtherGreater: otherGreater.length > 0,
	};
};

// ............... Baggage Selection Checkers ....................
export const hasAnyBaggageSelection = (selection: PassengerWithBaggageSelection) => {
	const hasCarryOn = hasCabn(selection.baggageServices.carryOn);

	const hasCheckedIn = Object.keys(selection.baggageServices.checkedIn).length > 0;

	const hasSports = Object.keys(selection.baggageServices.sportsEquipment).length > 0;

	return hasCarryOn || hasCheckedIn || hasSports;
};
// ...................compare segment selection .......................
export const compareBaggageServices = (
	currentSelection: PassengerBaggageServices,
	otherSelection: PassengerBaggageServices
): SegmentComparisonResult => {
	const currentMap: Record<string, number> = {};
	const otherMap: Record<string, number> = {};

	currentMap.CABN = hasCabn(currentSelection.carryOn) ? 1 : 0;
	otherMap.CABN = hasCabn(otherSelection.carryOn) ? 1 : 0;

	for (const [ssrCode, item] of Object.entries(currentSelection.checkedIn)) {
		currentMap[ssrCode] = item.quantity;
	}

	for (const [ssrCode, item] of Object.entries(otherSelection.checkedIn)) {
		otherMap[ssrCode] = item.quantity;
	}

	for (const [ssrCode, item] of Object.entries(currentSelection.sportsEquipment)) {
		currentMap[ssrCode] = item.quantity;
	}

	for (const [ssrCode, item] of Object.entries(otherSelection.sportsEquipment)) {
		otherMap[ssrCode] = item.quantity;
	}

	const allSsrCodes = new Set([...Object.keys(currentMap), ...Object.keys(otherMap)]);

	const currentGreater: string[] = [];
	const otherGreater: string[] = [];

	for (const ssrCode of allSsrCodes) {
		const currentQty = currentMap[ssrCode] ?? 0;
		const otherQty = otherMap[ssrCode] ?? 0;

		if (currentQty > otherQty) {
			currentGreater.push(ssrCode);
		}

		if (otherQty > currentQty) {
			otherGreater.push(ssrCode);
		}
	}

	return {
		currentGreater,
		otherGreater,
		hasCurrentGreater: currentGreater.length > 0,
		hasOtherGreater: otherGreater.length > 0,
	};
};

export const collectBaggageSegmentMismatchPassengerIds = ({
	passengerIds,
	segment1Selections,
	segment2Selections,
}: {
	passengerIds: string[];
	segment1Selections: Record<string, PassengerBaggageServices>;
	segment2Selections: Record<string, PassengerBaggageServices>;
}) => {
	const segment1LessThanSegment2PassengerIds: string[] = [];
	const segment1GreaterThanSegment2PassengerIds: string[] = [];

	for (const passengerId of passengerIds) {
		const segment1Selection = segment1Selections[passengerId];
		const segment2Selection = segment2Selections[passengerId];

		if (!segment1Selection || !segment2Selection) {
			continue;
		}

		const comparison = compareBaggageServices(segment1Selection, segment2Selection);

		if (comparison.hasOtherGreater) {
			segment1LessThanSegment2PassengerIds.push(passengerId);
		}

		if (comparison.hasCurrentGreater) {
			segment1GreaterThanSegment2PassengerIds.push(passengerId);
		}
	}

	return {
		segment1LessThanSegment2PassengerIds,
		segment1GreaterThanSegment2PassengerIds,
	};
};
