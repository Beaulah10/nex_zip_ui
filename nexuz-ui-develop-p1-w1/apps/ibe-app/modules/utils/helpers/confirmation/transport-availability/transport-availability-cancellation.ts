import type { NEXUZR004OffersAncillaryResponse } from "@repo/sdk";
import { TRANSPORT_SERVICE_ID_TO_SSR_CODE } from "@/modules/utils/constants/customer-information/transport-service/transport-service-constants/transport-service.constants";
import { getAllTransportSpecialServices } from "@/modules/utils/helpers/customize/transport-service/transport-service-response/transport-service-api-response";
import type {
	ResolvedTransportAvailabilityIssue,
	TransportAvailabilityActionResult,
	TransportToRemove,
	UnavailableTransportEntry,
} from "@/types/confirmation/confirmation.types";
import type { PassengerService, PassengerValues } from "@/types/passenger/passenger.type";

const TRANSPORT_SSR_CODES: Set<string> = new Set(Object.values(TRANSPORT_SERVICE_ID_TO_SSR_CODE));

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

function getPassengerName(passenger: PassengerValues) {
	return `${passenger.firstName} ${passenger.lastName}`.trim();
}

function getTransportSelections(passenger: PassengerValues, lfid: number) {
	return (passenger.services?.travel ?? []).filter(
		(service) => service.lfid === lfid && TRANSPORT_SSR_CODES.has(service.ssrCode)
	);
}

function toRemoval(passengerId: string, service: PassengerService): TransportToRemove {
	return {
		passengerId,
		lfid: service.lfid,
		ssrCode: service.ssrCode,
		serviceID: service.serviceID,
	};
}

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
		getTransportSelections(passenger, lfid).map((service) => ({ passenger, service }))
	);

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
			disabledPassengerIds: allPassengerIds,
		};
	}

	if (issue.type === "selected-transport-unavailable") {
		const disabledPassengerIds = getAffectedPassengerIdsWithAssociatedDependents(
			storedPassengers,
			issue.affectedPassengerIds
		);

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
