/**
 * File: priority-availability.ts
 * Confirmation-specific out-of-stock handling for priority service selections.
 */

import type { NEXUZR004OffersAncillaryResponse } from "@repo/sdk";
import { ANCILLARY_SERVICE_CONFIG } from "@/modules/utils/constants/ancillary-service.constants";
import { UNDER_SIX_DEPENDENT_TYPES } from "@/modules/utils/constants/priority-service/passenger-types.constants";
import { resolveAncillaryServiceOffer } from "@/modules/utils/helpers/ancillary/ancillary-service";
import type {
	PriorityAvailabilityActionResult,
	PriorityServiceToRemove,
	ResolvedPriorityAvailabilityIssue,
	UnavailablePriorityServiceEntry,
} from "@/types/confirmation/confirmation.types";
import type { PassengerValues } from "@/types/passenger/passenger.type";

/**
 * Expands affected passenger ids to include linked dependents.
 * This keeps adult and dependent priority changes in sync.
 */
function expandPassengerIdsWithAssociatedDependents(
	storedPassengers: PassengerValues[],
	passengerIds: string[]
) {
	const affectedPassengerIds = new Set(passengerIds);

	for (const passenger of storedPassengers) {
		const associatedAdultId = passenger.associateWithPassengerId?.trim();

		if (associatedAdultId && affectedPassengerIds.has(associatedAdultId)) {
			affectedPassengerIds.add(passenger.id);
		}
	}

	return Array.from(affectedPassengerIds);
}

/**
 * Collects priority services that should be removed for one segment.
 * It can limit the result to a selected set of passengers.
 */
function getPriorityServicesToRemove(
	storedPassengers: PassengerValues[],
	lfid: number,
	passengerIds?: Set<string>
) {
	const servicesToRemove: PriorityServiceToRemove[] = [];

	for (const passenger of storedPassengers) {
		if (passengerIds && !passengerIds.has(passenger.id)) {
			continue;
		}

		for (const service of passenger.services?.express ?? []) {
			if (service.lfid !== lfid) {
				continue;
			}

			servicesToRemove.push({
				passengerId: passenger.id,
				lfid: service.lfid,
				ssrCode: service.ssrCode,
				serviceID: service.serviceID,
			});
		}
	}

	return servicesToRemove;
}

/**
 * Detects whether saved priority selections still match current stock.
 * It returns either no action, full removal, or partial removal details.
 */
export function detectPriorityAvailabilityIssue(params: {
	ancillaryData: NEXUZR004OffersAncillaryResponse | undefined;
	storedPassengers: PassengerValues[];
	orderedPassengerIds: string[];
	lfid: number;
}): PriorityAvailabilityActionResult {
	const { ancillaryData, storedPassengers, orderedPassengerIds, lfid } = params;

	const expressService = ancillaryData?.data?.servicesPerPassengerType
		? resolveAncillaryServiceOffer({
				servicesPerPassengerType: ancillaryData.data.servicesPerPassengerType,
				passengerType: ANCILLARY_SERVICE_CONFIG.express.pricingPassengerType,
				ssrCode: ANCILLARY_SERVICE_CONFIG.express.ssrCode,
				selectedSegmentLfid: lfid,
			})
		: undefined;

	// Find passengers who already selected Express Service.
	const orderedSelectedAdults = orderedPassengerIds
		.map((id) => storedPassengers.find((passenger) => passenger.id === id))
		.filter((passenger): passenger is PassengerValues => passenger !== undefined)
		.filter((passenger) => {
			const passengerTypeCode = passenger.passengerTypeCode ?? "";

			return !UNDER_SIX_DEPENDENT_TYPES.has(passengerTypeCode);
		})
		.filter((passenger) =>
			(passenger.services?.express ?? []).some((service) => service.lfid === lfid)
		);

	const quantityAvailable = expressService?.qtyAvailable ?? 0;

	// Scenario 2:
	// Passenger previously selected Express,
	// but latest availability is now zero.
	if (orderedSelectedAdults.length > 0 && quantityAvailable <= 0) {
		const adultIdsToRemove = new Set(orderedSelectedAdults.map((passenger) => passenger.id));

		const passengerIdsToRemove = new Set(
			expandPassengerIdsWithAssociatedDependents(storedPassengers, Array.from(adultIdsToRemove))
		);

		const unavailableServices: UnavailablePriorityServiceEntry[] = orderedSelectedAdults.map(
			(passenger) => {
				const service = passenger.services?.express?.find((item) => item.lfid === lfid);

				return {
					passengerId: passenger.id,
					passengerName: `${passenger.firstName} ${passenger.lastName}`.trim(),
					serviceName:
						service?.description ?? expressService?.service.description ?? "Express Service",
				};
			}
		);

		return {
			type: "selected-priority-unavailable",
			unavailableServices,
			servicesToRemove: getPriorityServicesToRemove(storedPassengers, lfid, passengerIdsToRemove),
			affectedPassengerIds: Array.from(adultIdsToRemove),
		};
	}

	// Scenario 1:
	// Nothing was selected and Express has no availability.
	if (!expressService || quantityAvailable <= 0) {
		return {
			type: "all-priority-unavailable",
			servicesToRemove: getPriorityServicesToRemove(storedPassengers, lfid),
		};
	}

	// Current stock still covers all selected passengers.
	if (quantityAvailable >= orderedSelectedAdults.length) {
		return {
			type: "noop",
		};
	}

	// Partial stock:
	// Remove selections which exceed latest availability.
	const adultsToRemove = orderedSelectedAdults.slice(
		-(orderedSelectedAdults.length - quantityAvailable)
	);

	const adultIdsToRemove = new Set(adultsToRemove.map((passenger) => passenger.id));
	const passengerIdsToRemove = new Set(
		expandPassengerIdsWithAssociatedDependents(storedPassengers, Array.from(adultIdsToRemove))
	);
	const unavailableServices: UnavailablePriorityServiceEntry[] = adultsToRemove.map((passenger) => {
		const service = passenger.services?.express?.find((item) => item.lfid === lfid);

		return {
			passengerId: passenger.id,
			passengerName: `${passenger.firstName} ${passenger.lastName}`.trim(),
			serviceName: service?.description ?? expressService.service.description,
		};
	});

	return {
		type: "selected-priority-unavailable",
		unavailableServices,
		servicesToRemove: getPriorityServicesToRemove(storedPassengers, lfid, passengerIdsToRemove),
		affectedPassengerIds: Array.from(adultIdsToRemove),
	};
}

/**
 * Converts the raw priority availability result into UI-friendly state.
 * It adds disabled passenger ids, dialog text, and reopen behavior.
 */
export function resolvePriorityAvailabilityIssue(params: {
	ancillaryData: NEXUZR004OffersAncillaryResponse | undefined;
	storedPassengers: PassengerValues[];
	orderedPassengerIds: string[];
	lfid: number;
	clickedPassengerId: string;
	allPassengerIds: string[];
}): ResolvedPriorityAvailabilityIssue {
	const {
		ancillaryData,
		storedPassengers,
		orderedPassengerIds,
		lfid,
		clickedPassengerId,
		allPassengerIds,
	} = params;
	const issue = detectPriorityAvailabilityIssue({
		ancillaryData,
		storedPassengers,
		orderedPassengerIds,
		lfid,
	});

	if (issue.type === "all-priority-unavailable") {
		return {
			type: "all-priority-unavailable",
			servicesToRemove: issue.servicesToRemove,
			disabledPassengerIds: allPassengerIds,
		};
	}

	if (issue.type === "selected-priority-unavailable") {
		const disabledPassengerIds = expandPassengerIdsWithAssociatedDependents(
			storedPassengers,
			issue.affectedPassengerIds
		);

		return {
			type: "selected-priority-unavailable",
			servicesToRemove: issue.servicesToRemove,
			disabledPassengerIds,
			contentSuffix: issue.unavailableServices
				.map((entry) => `${entry.serviceName} : ${entry.passengerName}`)
				.join("\n"),
			shouldReopenDialog: !disabledPassengerIds.includes(clickedPassengerId),
		};
	}

	return { type: "noop" };
}
