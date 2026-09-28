/**
 * File: seat-selection-cancellation.ts
 * Description: Helper functions for handling previously selected seats that are no longer
 * available in the latest seat map response.
 */

import { expandCabinRows } from "@/components/customize/seat-map/expand-cabin-rows/expand-cabin-rows";
import { getBundleSeatServiceCodes } from "@/modules/utils/helpers/seat-map/bundle-seat-pricing/bundle-seat-pricing";
import { formatFullName } from "@/modules/utils/helpers/seat-map/seat-map-passenger-panel/seat-map-passenger-panel";
import type { PassengerSeat, PassengerValues } from "@/types/passenger/passenger.type";
import type { Cabin, CancelledSeatSelection } from "@/types/seat-map/seat-map.types";

type SeatCancellationPassenger = {
	id: string;
	firstName: string;
	lastName: string;
	passengerTypeCode?: string;
	mappedAdultId?: string;
	associateWithPassengerId?: string;
};

function getAssociatedAdultId(
	passenger: Pick<SeatCancellationPassenger, "mappedAdultId" | "associateWithPassengerId">
): string | undefined {
	return passenger.mappedAdultId?.trim() || passenger.associateWithPassengerId?.trim() || undefined;
}

function buildDependentIdsByAdultId(
	orderedPassengersWithNames: SeatCancellationPassenger[]
): Map<string, string[]> {
	const dependentIdsByAdultId = new Map<string, string[]>();

	for (const passenger of orderedPassengersWithNames) {
		const associatedAdultId = getAssociatedAdultId(passenger);

		if (!associatedAdultId) {
			continue;
		}

		const currentDependentIds = dependentIdsByAdultId.get(associatedAdultId) ?? [];
		currentDependentIds.push(passenger.id);
		dependentIdsByAdultId.set(associatedAdultId, currentDependentIds);
	}

	return dependentIdsByAdultId;
}

/**
 * Converts stored seat data into a seat code.
 */
export function getStoredSeatCode(seat: PassengerSeat): string {
	return `${seat.row}${seat.column}`;
}

/**
 * Builds a lookup set of currently available seat codes.
 */
export function buildAvailableSeatCodeSet(cabins: Cabin[]): Set<string> {
	const availableSeatCodes = new Set<string>();

	for (const cabin of cabins) {
		for (const row of expandCabinRows(cabin)) {
			for (const seat of row.seats) {
				if (seat.isSeatAvailable) {
					availableSeatCodes.add(seat.code);
				}
			}
		}
	}

	return availableSeatCodes;
}

/**
 * Finds previously selected seats that are no longer available.
 */
export function getCancelledSeatSelections({
	orderedPassengersWithNames,
	storedPassengers,
	lfid,
	pfid,
	availableSeatCodes,
}: {
	orderedPassengersWithNames: SeatCancellationPassenger[];
	storedPassengers: Array<{
		id: string;
		seats?: PassengerSeat[];
	}>;
	lfid: number;
	pfid: number;
	availableSeatCodes: Set<string>;
}): CancelledSeatSelection[] {
	const passengersById = new Map(
		orderedPassengersWithNames.map((passenger) => [passenger.id, passenger])
	);
	const dependentIdsByAdultId = buildDependentIdsByAdultId(orderedPassengersWithNames);
	const storedSeatByPassengerId = new Map(
		storedPassengers
			.map((storedPassenger) => {
				const storedSeat = storedPassenger.seats?.find(
					(seat) => seat.lfid === lfid && seat.pfid === pfid
				);

				return storedSeat ? [storedPassenger.id, storedSeat] : undefined;
			})
			.filter((entry): entry is [string, PassengerSeat] => !!entry)
	);
	const cancelledPassengerIds = new Set<string>();
	const adjacentSeatRelatedPassengerIds = new Set<string>();
	const queue: string[] = [];

	for (const passenger of orderedPassengersWithNames) {
		const storedSeat = storedSeatByPassengerId.get(passenger.id);

		if (!storedSeat) {
			continue;
		}

		const seatCode = getStoredSeatCode(storedSeat);

		if (availableSeatCodes.has(seatCode)) {
			continue;
		}

		cancelledPassengerIds.add(passenger.id);
		queue.push(passenger.id);
	}

	while (queue.length > 0) {
		const currentPassengerId = queue.shift();

		if (!currentPassengerId) {
			continue;
		}

		const currentPassenger = passengersById.get(currentPassengerId);

		if (!currentPassenger) {
			continue;
		}

		const associatedAdultId = getAssociatedAdultId(currentPassenger);
		const linkedPassengerIds = new Set<string>();

		if (associatedAdultId && storedSeatByPassengerId.has(associatedAdultId)) {
			linkedPassengerIds.add(associatedAdultId);
		}

		for (const dependentPassengerId of dependentIdsByAdultId.get(currentPassengerId) ?? []) {
			if (storedSeatByPassengerId.has(dependentPassengerId)) {
				linkedPassengerIds.add(dependentPassengerId);
			}
		}

		if (associatedAdultId) {
			for (const dependentPassengerId of dependentIdsByAdultId.get(associatedAdultId) ?? []) {
				if (storedSeatByPassengerId.has(dependentPassengerId)) {
					linkedPassengerIds.add(dependentPassengerId);
				}
			}
		}

		if (linkedPassengerIds.size > 0) {
			adjacentSeatRelatedPassengerIds.add(currentPassengerId);
		}

		for (const linkedPassengerId of linkedPassengerIds) {
			adjacentSeatRelatedPassengerIds.add(linkedPassengerId);

			if (cancelledPassengerIds.has(linkedPassengerId)) {
				continue;
			}

			cancelledPassengerIds.add(linkedPassengerId);
			queue.push(linkedPassengerId);
		}
	}

	return orderedPassengersWithNames.flatMap((passenger) => {
		if (!cancelledPassengerIds.has(passenger.id)) {
			return [];
		}

		const storedSeat = storedSeatByPassengerId.get(passenger.id);

		if (!storedSeat) {
			return [];
		}

		return [
			{
				passengerId: passenger.id,
				passengerName: formatFullName(passenger.firstName, passenger.lastName),
				seatCode: getStoredSeatCode(storedSeat),
				lfid,
				pfid,
				isAdjacentSeatRelated: adjacentSeatRelatedPassengerIds.has(passenger.id),
			},
		];
	});
}

/**
 * Returns true when at least one cancelled seat belongs to a passenger
 * whose cancelled seat service code is included in a selected bundle on the current flight segment.
 */
export function hasBundleSeatUnavailable({
	cancelledSelections,
	storedPassengers,
	lfid,
}: {
	cancelledSelections: CancelledSeatSelection[];
	storedPassengers: PassengerValues[];
	lfid: number;
}): boolean {
	if (cancelledSelections.length === 0) {
		return false;
	}

	const passengerById = new Map(storedPassengers.map((passenger) => [passenger.id, passenger]));

	return cancelledSelections.some((selection) => {
		const passenger = passengerById.get(selection.passengerId);
		const storedSeat = passenger?.seats?.find(
			(seat) => seat.lfid === selection.lfid && seat.pfid === selection.pfid
		);

		if (!passenger || !storedSeat?.serviceCode) {
			return false;
		}

		const bundleSeatServiceCodes = getBundleSeatServiceCodes(passenger, lfid);

		return bundleSeatServiceCodes.has(storedSeat.serviceCode);
	});
}
