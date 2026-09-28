/**
 * File: lounge-availability-cancellation.ts
 * Pure detection helper for airport lounge out-of-stock cancellation scenarios
 * on the confirmation page. All store mutations are performed by the caller.
 */

import type { NEXUZR004OffersAncillaryResponse } from "@repo/sdk";
import { UNDER_SIX_DEPENDENT_TYPES } from "@/modules/utils/constants/priority-service/passenger-types.constants";
import { extractLoungeServices } from "@/modules/utils/lounge.utils";
import type {
	LoungeAvailabilityActionResult,
	LoungeToRemove,
	ResolvedLoungeAvailabilityIssue,
	UnavailableLoungeEntry,
} from "@/types/confirmation/confirmation.types";
import type { PassengerValues } from "@/types/passenger/passenger.type";

function getAffectedPassengerIdsWithAssociatedDependents(
	storedPassengers: PassengerValues[],
	passengerIds: string[]
) {
	const affectedPassengerIds = new Set(passengerIds);

	for (const passenger of storedPassengers) {
		if (!passenger.associateWithPassengerId) {
			continue;
		}

		if (affectedPassengerIds.has(passenger.associateWithPassengerId)) {
			affectedPassengerIds.add(passenger.id);
		}
	}

	return Array.from(affectedPassengerIds);
}

/**
 * Collects lounge services that should be removed for one segment.
 * It can limit the result to a selected set of passengers.
 */
function getLoungesToRemove(
	storedPassengers: PassengerValues[],
	lfid: number,
	passengerIds?: Set<string>
): LoungeToRemove[] {
	const loungesToRemove: LoungeToRemove[] = [];

	for (const passenger of storedPassengers) {
		if (passengerIds && !passengerIds.has(passenger.id)) {
			continue;
		}

		for (const lounge of passenger.services?.lounge ?? []) {
			if (lounge.lfid !== lfid) {
				continue;
			}

			loungesToRemove.push({
				passengerId: passenger.id,
				lfid: lounge.lfid,
				ssrCode: lounge.ssrCode,
				serviceID: lounge.serviceID,
			});
		}
	}

	return loungesToRemove;
}

/**
 * Detects whether saved lounge selections exceed current lounge availability.
 * When stock is insufficient, the last assigned passengers lose the selection first.
 */
export function detectLoungeAvailabilityIssue(params: {
	ancillaryData: NEXUZR004OffersAncillaryResponse | undefined;
	storedPassengers: PassengerValues[];
	orderedPassengerIds: string[];
	lfid: number;
}): LoungeAvailabilityActionResult {
	const { ancillaryData, storedPassengers, orderedPassengerIds, lfid } = params;
	const loungeOptions = extractLoungeServices(ancillaryData);
	const hasAvailableLounge = loungeOptions.some((option) => (option.service.qtyAvailable ?? 0) > 0);

	const selectedLounges = storedPassengers.flatMap((passenger) =>
		(passenger.services?.lounge ?? []).filter((lounge) => lounge.lfid === lfid)
	);

	/**
	 * Scenario 2:
	 * Passenger previously selected a Lounge,
	 * but latest availability is now zero.
	 */
	if (selectedLounges.length > 0 && !hasAvailableLounge) {
		const unavailableLounges: UnavailableLoungeEntry[] = [];

		for (const passenger of storedPassengers) {
			for (const lounge of passenger.services?.lounge ?? []) {
				if (lounge.lfid !== lfid) {
					continue;
				}

				unavailableLounges.push({
					passengerId: passenger.id,
					passengerName: `${passenger.firstName} ${passenger.lastName}`.trim(),
					loungeName: lounge.description,
				});
			}
		}

		return {
			type: "selected-lounge-unavailable",
			unavailableLounges,
			loungesToRemove: getLoungesToRemove(storedPassengers, lfid),
			affectedPassengerIds: unavailableLounges.map((entry) => entry.passengerId),
		};
	}

	/**
	 * Scenario 1:
	 * Nothing was selected and Lounge has no availability.
	 */
	if (!hasAvailableLounge) {
		return {
			type: "all-lounges-unavailable",
			loungesToRemove: getLoungesToRemove(storedPassengers, lfid),
		};
	}

	const availableQtyByServiceId: Record<string, number> = {};

	for (const option of loungeOptions) {
		const key = option.service.ssrId.toString();
		availableQtyByServiceId[key] = Math.max(
			availableQtyByServiceId[key] ?? 0,
			option.service.qtyAvailable ?? 0
		);
	}

	const orderedPassengers = orderedPassengerIds
		.map((id) => storedPassengers.find((passenger) => passenger.id === id))
		.filter((passenger): passenger is PassengerValues => passenger !== undefined);

	const passengersByLoungeId: Record<string, PassengerValues[]> = {};

	for (const passenger of orderedPassengers) {
		const passengerTypeCode = passenger.passengerTypeCode ?? "";

		if (UNDER_SIX_DEPENDENT_TYPES.has(passengerTypeCode)) {
			continue;
		}

		for (const lounge of passenger.services?.lounge ?? []) {
			if (lounge.lfid !== lfid) {
				continue;
			}

			const loungeId = lounge.serviceID.toString();
			if (!passengersByLoungeId[loungeId]) {
				passengersByLoungeId[loungeId] = [];
			}
			passengersByLoungeId[loungeId].push(passenger);
		}
	}

	const unavailableLounges: UnavailableLoungeEntry[] = [];
	const loungesToRemove: LoungeToRemove[] = [];
	const affectedPassengerIds: string[] = [];

	for (const [loungeId, passengerList] of Object.entries(passengersByLoungeId)) {
		const qtyAvailable = availableQtyByServiceId[loungeId];

		if (qtyAvailable !== undefined && qtyAvailable >= passengerList.length) {
			continue;
		}

		const removeCount =
			qtyAvailable === undefined || qtyAvailable <= 0
				? passengerList.length
				: passengerList.length - qtyAvailable;
		const passengersToRemove = passengerList.slice(-removeCount);

		for (const passenger of passengersToRemove) {
			const lounge = passenger.services?.lounge?.find(
				(service) => service.lfid === lfid && service.serviceID.toString() === loungeId
			);

			if (!lounge) {
				continue;
			}

			loungesToRemove.push({
				passengerId: passenger.id,
				lfid: lounge.lfid,
				ssrCode: lounge.ssrCode,
				serviceID: lounge.serviceID,
			});
			affectedPassengerIds.push(passenger.id);
			unavailableLounges.push({
				passengerId: passenger.id,
				passengerName: `${passenger.firstName} ${passenger.lastName}`.trim(),
				loungeName: lounge.description,
			});
		}
	}

	if (unavailableLounges.length > 0) {
		return {
			type: "selected-lounge-unavailable",
			unavailableLounges,
			loungesToRemove,
			affectedPassengerIds,
		};
	}

	return { type: "noop" };
}

export function resolveLoungeAvailabilityIssue(params: {
	ancillaryData: NEXUZR004OffersAncillaryResponse | undefined;
	storedPassengers: PassengerValues[];
	orderedPassengerIds: string[];
	lfid: number;
	clickedPassengerId: string;
	allPassengerIds: string[];
}): ResolvedLoungeAvailabilityIssue {
	const {
		ancillaryData,
		storedPassengers,
		orderedPassengerIds,
		lfid,
		clickedPassengerId,
		allPassengerIds,
	} = params;
	const issue = detectLoungeAvailabilityIssue({
		ancillaryData,
		storedPassengers,
		orderedPassengerIds,
		lfid,
	});

	if (issue.type === "all-lounges-unavailable") {
		return {
			type: "all-lounges-unavailable",
			loungesToRemove: issue.loungesToRemove,
			disabledPassengerIds: allPassengerIds,
		};
	}

	if (issue.type === "selected-lounge-unavailable") {
		const disabledPassengerIds = getAffectedPassengerIdsWithAssociatedDependents(
			storedPassengers,
			issue.affectedPassengerIds
		);

		return {
			type: "selected-lounge-unavailable",
			loungesToRemove: issue.loungesToRemove,
			disabledPassengerIds,
			contentSuffix: issue.unavailableLounges
				.map((entry) => `${entry.loungeName} : ${entry.passengerName}`)
				.join("\n"),
			shouldReopenDialog: !disabledPassengerIds.includes(clickedPassengerId),
		};
	}

	return { type: "noop" };
}
