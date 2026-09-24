/**
 * File: transport-availability.ts
 * Confirmation-specific availability validation and resolution for transport service selections.
 * Detects unavailable transport services, determines impacted passengers, and generates
 * the actions required to keep selected transport services aligned with current inventory.
 */
import type { NEXUZR004OffersAncillaryResponse } from "@repo/sdk";
import { TRANSPORT_SERVICE_ID_TO_SSR_CODE } from "@/modules/utils/constants/customer-information/transport-service/transport-service-constants/transport-service.constants";
import { INFANT_DEPENDENT_TYPES } from "@/modules/utils/constants/priority-service/passenger-types.constants";
import { getAllTransportSpecialServices } from "@/modules/utils/helpers/customize/transport-service/transport-service-response/transport-service-api-response";
import type {
	ResolvedTransportAvailabilityIssue,
	TransportAvailabilityActionResult,
	TransportToRemove,
	UnavailableTransportEntry,
} from "@/types/confirmation/confirmation.types";
import type { PassengerService, PassengerValues } from "@/types/passenger/passenger.type";

const TRANSPORT_SSR_CODES: Set<string> = new Set(Object.values(TRANSPORT_SERVICE_ID_TO_SSR_CODE));
/**
 * Returns affected passenger IDs, including passengers associated with the provided passengers.
 */
function getAffectedPassengerIdsWithAssociatedDependents(
	storedPassengers: PassengerValues[],
	passengerIds: string[]
) {
	const affectedPassengerIds = new Set(passengerIds);

	for (const passenger of storedPassengers) {
		if (
			passenger.associateWithPassengerId &&
			affectedPassengerIds.has(passenger.associateWithPassengerId)
		) {
			affectedPassengerIds.add(passenger.id);
		}
	}

	return Array.from(affectedPassengerIds);
}
/**
 * Builds a display-friendly full name for a passenger.
 */
function getPassengerName(passenger: PassengerValues) {
	return `${passenger.firstName} ${passenger.lastName}`.trim();
}
/**
 * Retrieves selected transport services for a passenger on the specified flight segment.
 */
function getTransportSelections(passenger: PassengerValues, lfid: number) {
	return (passenger.services?.travel ?? []).filter(
		(service) => service.lfid === lfid && TRANSPORT_SSR_CODES.has(service.ssrCode)
	);
}
/**
 * Maps a passenger service selection into a transport removal payload.
 */
function toRemoval(passengerId: string, service: PassengerService): TransportToRemove {
	return {
		passengerId,
		lfid: service.lfid,
		ssrCode: service.ssrCode,
		serviceID: service.serviceID,
	};
}
/**
 * Detects transport selections that are no longer available and identifies affected passengers and services.
 */
export function detectTransportAvailabilityIssue(params: {
	ancillaryData: NEXUZR004OffersAncillaryResponse | undefined;
	storedPassengers: PassengerValues[];
	orderedPassengerIds: string[];
	lfid: number;
}): TransportAvailabilityActionResult {
	const { ancillaryData, storedPassengers, orderedPassengerIds, lfid } = params;
	const transportServices = getAllTransportSpecialServices(ancillaryData).filter(
		(service) => service.lfid === lfid
	);
	const availableServices = transportServices.filter((service) => (service.qtyAvailable ?? 0) > 0);
	const scopedPassengers = orderedPassengerIds
		.map((id) => storedPassengers.find((passenger) => passenger.id === id))
		.filter((passenger): passenger is PassengerValues => passenger !== undefined);
	const scopedSelections = scopedPassengers.flatMap((passenger) =>
		getTransportSelections(passenger, lfid).map((service) => ({
			passenger,
			service,
		}))
	);

	/**
	 * Scenario 2
	 * Customer previously selected transport services,
	 * but latest availability is now completely unavailable.
	 */
	if (scopedSelections.length > 0 && availableServices.length === 0) {
		return {
			type: "selected-transport-unavailable",
			unavailableTransports: scopedSelections.map(({ passenger, service }) => ({
				passengerId: passenger.id,
				passengerName: getPassengerName(passenger),
				serviceName: service.description,
			})),
			transportsToRemove: scopedSelections.map(({ passenger, service }) =>
				toRemoval(passenger.id, service)
			),
			affectedPassengerIds: scopedSelections.map(({ passenger }) => passenger.id),
		};
	}

	/**
	 * Scenario 1
	 * Nothing selected (or transport screen opened)
	 * and no transport inventory exists.
	 */
	if (availableServices.length === 0) {
		return {
			type: "all-transports-unavailable",
			transportsToRemove: scopedSelections.map(({ passenger, service }) =>
				toRemoval(passenger.id, service)
			),
		};
	}

	const availableQuantityByService = new Map<string, number>();
	for (const service of transportServices) {
		if (typeof service.ssrId !== "number" || !service.ssrCode) {
			continue;
		}

		const serviceKey = `${service.ssrCode}:${service.ssrId}`;
		availableQuantityByService.set(
			serviceKey,
			Math.max(availableQuantityByService.get(serviceKey) ?? 0, service.qtyAvailable ?? 0)
		);
	}

	const selectedByService = new Map<
		string,
		Array<{ passenger: PassengerValues; service: (typeof scopedSelections)[number]["service"] }>
	>();
	for (const selection of scopedSelections) {
		const serviceKey = `${selection.service.ssrCode}:${selection.service.serviceID}`;
		const selections = selectedByService.get(serviceKey) ?? [];
		selections.push(selection);
		selectedByService.set(serviceKey, selections);
	}

	const unavailableTransports: UnavailableTransportEntry[] = [];
	const transportsToRemove: TransportToRemove[] = [];
	const affectedPassengerIds: string[] = [];

	for (const [serviceKey, selections] of selectedByService) {
		const availableQuantity = availableQuantityByService.get(serviceKey) ?? 0;
		const removeCount = Math.max(0, selections.length - availableQuantity);
		const selectionsToRemove =
			availableQuantity <= 0 ? selections : removeCount > 0 ? selections.slice(-removeCount) : [];

		for (const { passenger, service } of selectionsToRemove) {
			transportsToRemove.push(toRemoval(passenger.id, service));
			affectedPassengerIds.push(passenger.id);
			unavailableTransports.push({
				passengerId: passenger.id,
				passengerName: getPassengerName(passenger),
				serviceName: service.description,
			});
		}
	}

	if (unavailableTransports.length === 0) {
		return { type: "noop" };
	}

	return {
		type: "selected-transport-unavailable",
		unavailableTransports,
		transportsToRemove,
		affectedPassengerIds,
	};
}
/**
 * Resolves transport availability issues by determining removals, disabled passengers, and UI actions.
 */
export function resolveTransportAvailabilityIssue(params: {
	ancillaryData: NEXUZR004OffersAncillaryResponse | undefined;
	storedPassengers: PassengerValues[];
	orderedPassengerIds: string[];
	lfid: number;
	clickedPassengerId: string;
	allPassengerIds: string[];
}): ResolvedTransportAvailabilityIssue {
	const { storedPassengers, clickedPassengerId, allPassengerIds, ...detectionParams } = params;
	const issue = detectTransportAvailabilityIssue({ ...detectionParams, storedPassengers });

	if (issue.type === "all-transports-unavailable") {
		return {
			type: issue.type,
			transportsToRemove: issue.transportsToRemove,
			disabledPassengerIds: allPassengerIds.filter((id) => {
				const passenger = storedPassengers.find((p) => p.id === id);
				return passenger && !INFANT_DEPENDENT_TYPES.has(passenger.passengerTypeCode ?? "");
			}),
		};
	}

	if (issue.type === "selected-transport-unavailable") {
		const disabledPassengerIds = getAffectedPassengerIdsWithAssociatedDependents(
			storedPassengers,
			issue.affectedPassengerIds
		).filter((id) => {
			const passenger = storedPassengers.find((p) => p.id === id);
			return passenger && !INFANT_DEPENDENT_TYPES.has(passenger.passengerTypeCode ?? "");
		});

		return {
			type: issue.type,
			transportsToRemove: issue.transportsToRemove,
			disabledPassengerIds,
			contentSuffix: issue.unavailableTransports
				.map((entry) => `${entry.serviceName} : ${entry.passengerName}`)
				.join("\n"),
			shouldReopenDialog: !disabledPassengerIds.includes(clickedPassengerId),
		};
	}

	return { type: "noop" };
}
