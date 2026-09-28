/**
 * File: confirmation-proceed.ts
 * Shared helpers for confirmation-page proceed validation.
 * They keep the confirmation component focused on rendering while reusing
 * existing seat and meal eligibility rules.
 */

import { isMandatoryMealPassenger } from "@/modules/utils/helpers/customize/inflight-meals/inflight-meal-selection.utils/inflight-meal-selection.utils";
import { isBundleSeatEligible } from "@/modules/utils/helpers/seat-map/seat-map-passenger-panel/seat-map-passenger-panel";
import { toSeatValidationPassengers } from "@/modules/utils/helpers/seat-map/seat-selection-availability/seat-selection-availability";
import { getAdjacentFreePassengerIds } from "@/modules/utils/validations/seat-map/seat-validation";
import type {
	ConfirmationPassengerDisplay,
	ConfirmationTopProceedIssue,
	OrderedPassengerWithNames,
} from "@/types/confirmation/confirmation.types";
import type { InflightMealPassenger } from "@/types/customize/inflight-meals/inflight-meals.types";
import type { PassengerValues } from "@/types/passenger/passenger.type";

export function buildConfirmationPassengerNameMap(
	passengers: ConfirmationPassengerDisplay[]
): ReadonlyMap<string, string> {
	return new Map(passengers.map((passenger) => [passenger.id, passenger.name]));
}

export function getConfirmationAdjacentRequiredSeatPassengerIds(
	passengers: OrderedPassengerWithNames[]
): Set<string> {
	return getAdjacentFreePassengerIds(toSeatValidationPassengers(passengers));
}

export function getOrderedPassengerNames({
	passengerIds,
	nameByPassengerId,
	orderedPassengerIds,
}: {
	passengerIds: string[];
	nameByPassengerId: ReadonlyMap<string, string>;
	orderedPassengerIds: string[];
}): string[] {
	const uniquePassengerIds = new Set(passengerIds);
	const orderedNames = orderedPassengerIds
		.filter((passengerId) => uniquePassengerIds.has(passengerId))
		.map((passengerId) => nameByPassengerId.get(passengerId))
		.filter((name): name is string => Boolean(name));

	if (orderedNames.length > 0) {
		return orderedNames;
	}

	return passengerIds
		.map((passengerId) => nameByPassengerId.get(passengerId))
		.filter((name): name is string => Boolean(name));
}

export function getUniquePassengerNames(...passengerNameLists: string[][]): string[] {
	return Array.from(new Set(passengerNameLists.flat()));
}

export function resolveConfirmationTopProceedIssue({
	hasSeatIssue,
	hasMealIssue,
	hasAgreementIssue,
}: {
	hasSeatIssue: boolean;
	hasMealIssue: boolean;
	hasAgreementIssue: boolean;
}): ConfirmationTopProceedIssue {
	if (hasSeatIssue) {
		return "seat";
	}

	if (hasMealIssue) {
		return "meal";
	}

	if (hasAgreementIssue) {
		return "agreement";
	}

	return "none";
}

export function getMissingConfirmationSeatPassengerNames({
	servicePassengers,
	adjacentRequiredSeatPassengerIds,
	storedPassengers,
	currentLfid,
	currentPfid,
	nameByPassengerId,
	orderedPassengerIds,
}: {
	servicePassengers: Pick<InflightMealPassenger, "id" | "bundleCode">[];
	adjacentRequiredSeatPassengerIds: ReadonlySet<string>;
	storedPassengers: PassengerValues[];
	currentLfid?: number;
	currentPfid?: number;
	nameByPassengerId: ReadonlyMap<string, string>;
	orderedPassengerIds: string[];
}): string[] {
	if (!currentLfid) {
		return [];
	}

	const missingPassengerIds = servicePassengers
		.filter(
			(passenger) =>
				isBundleSeatEligible(passenger.bundleCode) ||
				adjacentRequiredSeatPassengerIds.has(passenger.id)
		)
		.map((passenger) => passenger.id)
		.filter(
			(passengerId) =>
				!storedPassengers.some(
					(passenger) =>
						passenger.id === passengerId &&
						(passenger.seats?.some(
							(seat) => seat.lfid === currentLfid && seat.pfid === currentPfid
						) ??
							false)
				)
		);

	return getOrderedPassengerNames({
		passengerIds: missingPassengerIds,
		nameByPassengerId,
		orderedPassengerIds,
	});
}

export function getMissingConfirmationMealPassengerNames({
	servicePassengers,
	passengersWithUnavailableMeals,
	storedPassengers,
	currentLfid,
	nameByPassengerId,
	orderedPassengerIds,
}: {
	servicePassengers: Pick<InflightMealPassenger, "id" | "bundleCode" | "isIcnRoute">[];
	passengersWithUnavailableMeals: ReadonlySet<string>;
	storedPassengers: PassengerValues[];
	currentLfid?: number;
	nameByPassengerId: ReadonlyMap<string, string>;
	orderedPassengerIds: string[];
}): string[] {
	if (!currentLfid) {
		return [];
	}

	const missingPassengerIds = servicePassengers
		.filter(
			(passenger) =>
				!passengersWithUnavailableMeals.has(passenger.id) && isMandatoryMealPassenger(passenger)
		)
		.map((passenger) => passenger.id)
		.filter(
			(passengerId) =>
				!storedPassengers.some(
					(passenger) =>
						passenger.id === passengerId &&
						(passenger.services?.meals?.some((meal) => meal.lfid === currentLfid) ?? false)
				)
		);

	return getOrderedPassengerNames({
		passengerIds: missingPassengerIds,
		nameByPassengerId,
		orderedPassengerIds,
	});
}
