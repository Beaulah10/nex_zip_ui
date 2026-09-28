import type { NEXUZR004OffersSpecialService } from "@repo/sdk/swagger";
import { TRANSPORT_SERVICE_ID_TO_SSR_CODE } from "@/modules/utils/constants/customer-information/transport-service/transport-service-constants/transport-service.constants";
import { normalizePassengerType } from "@/modules/utils/helpers/common/passenger-type/passenger-type-code";
import type {
	TransportationOffersData,
	TransportServiceId,
	TransportServiceSsrCode,
} from "@/types/customize/transport-service/transport-service.types";
import type { PassengerValues } from "@/types/passenger/passenger.type";

export const SERVICE_ID_TO_SSR_CODE: Record<TransportServiceId, TransportServiceSsrCode> =
	TRANSPORT_SERVICE_ID_TO_SSR_CODE;

/**
 * Flattens all special services across passenger types and categories.
 */
export function getAllTransportSpecialServices(
	transportationData: TransportationOffersData
): NEXUZR004OffersSpecialService[] {
	return (
		transportationData?.data?.servicesPerPassengerType
			?.flatMap((item) => item.categories ?? [])
			?.flatMap((category) => category.specialServices ?? []) ?? []
	);
}

/**
 * Converts API passenger type values into normalized keys used in UI logic.
 */
export function passengerType(passengerTypeCode?: string): string {
	return normalizePassengerType(passengerTypeCode);
}

/**
 * Returns the best matching special service for a passenger type and SSR code.
 * Falls back to adult pricing when the requested passenger type is unavailable.
 */
export function findSpecialService(
	transportationData: TransportationOffersData,
	passengerTypeCode: string | undefined,
	ssrCode: string
): NEXUZR004OffersSpecialService | undefined {
	const normalizedPassengerTypeCode = passengerType(passengerTypeCode);

	if (!normalizedPassengerTypeCode || !ssrCode) {
		return undefined;
	}

	const servicePerPassengerType =
		transportationData?.data?.servicesPerPassengerType?.find(
			(passengerTypeData) =>
				passengerType(passengerTypeData.passengerType) === normalizedPassengerTypeCode
		) ??
		transportationData?.data?.servicesPerPassengerType?.find(
			(passengerTypeData) => passengerType(passengerTypeData.passengerType) === "adult"
		);

	return servicePerPassengerType?.categories
		?.flatMap((category) => category.specialServices ?? [])
		.find((service) => service.ssrCode === ssrCode);
}

/**
 * Gets the highest available quantity for a given SSR code across passenger types.
 */
export function getServiceStockLimit(
	transportationData: TransportationOffersData,
	ssrCode: string
): number | null {
	if (!ssrCode) {
		return null;
	}

	const qtyValues =
		getAllTransportSpecialServices(transportationData)
			?.filter((service) => service.ssrCode === ssrCode)
			?.map((service) => service.qtyAvailable)
			?.filter((qty): qty is number => Number.isFinite(qty)) ?? [];

	if (qtyValues.length === 0) {
		return null;
	}

	return Math.max(...qtyValues);
}

/**
 * Returns available quantity for adult passenger type for the selected SSR code.
 */
export function getAdultServiceQtyAvailable(
	transportationData: TransportationOffersData,
	ssrCode: string
): number | null {
	if (!ssrCode) {
		return null;
	}

	const adultService = findSpecialService(transportationData, "ADT", ssrCode);
	const qtyAvailable = adultService?.qtyAvailable;
	return typeof qtyAvailable === "number" && Number.isFinite(qtyAvailable) ? qtyAvailable : null;
}

/**
 * Checks whether a passenger already has a transport service persisted for an SSR and scope.
 */
export function hasStoredTransportServiceForPassenger({
	passengers,
	passengerId,
	ssrCode,
	lfid,
	serviceID,
}: {
	passengers: PassengerValues[];
	passengerId: string;
	ssrCode: string;
	lfid: number;
	serviceID: number;
}): boolean {
	const passenger = passengers.find((entry) => entry.id === passengerId);
	if (!passenger) {
		return false;
	}

	const travelServices = passenger.services?.travel ?? [];

	for (const selectedService of travelServices) {
		if (
			selectedService.ssrCode === ssrCode &&
			selectedService.lfid === lfid &&
			selectedService.serviceID === serviceID
		) {
			return true;
		}
	}

	return false;
}

/**
 * Checks if at least one passenger has selected this transport service in the active scope.
 */
export function hasStoredTransportServiceForScope({
	passengers,
	ssrCode,
	lfid,
}: {
	passengers: PassengerValues[];
	ssrCode: string;
	lfid: number;
}): boolean {
	return passengers.some((passenger) => {
		const travelServices = passenger.services?.travel ?? [];
		return travelServices.some((service) => service.ssrCode === ssrCode && service.lfid === lfid);
	});
}

/**
 * Creates a map of SSR code to LFID from all available special services.
 */
export function createLfidBySsrCodeMap(
	transportationData: TransportationOffersData
): Map<string, number> {
	const map = new Map<string, number>();
	const allSpecialServices = getAllTransportSpecialServices(transportationData);

	for (const service of allSpecialServices) {
		if (!service.ssrCode || typeof service.lfid !== "number") {
			continue;
		}

		map.set(service.ssrCode, service.lfid);
	}

	return map;
}

/**
 * Maps selected UI service id into its corresponding API SSR code.
 */
export function mapServiceIdToSsrCode(serviceId: TransportServiceId | null): string {
	if (!serviceId) {
		return "";
	}

	return TRANSPORT_SERVICE_ID_TO_SSR_CODE[serviceId];
}
