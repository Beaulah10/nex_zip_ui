import {
	TRANSPORT_CHILD_PRICING_PASSENGER_TYPES,
	TRANSPORT_OLDER_PRICING_PASSENGER_TYPES,
	TROLLEY_1_DAY_SSR_CODE,
	TROLLEY_4_DAYS_SSR_CODE,
	TROLLEY_7_DAYS_SSR_CODE,
} from "@/modules/utils/constants/customer-information/transport-service/transport-service-constants/transport-service.constants";
import { normalizePassengerType } from "@/modules/utils/helpers/common/passenger-type/passenger-type-code";
import type { TransportationOffersData } from "@/types/customize/transport-service/transport-service.types";
import { passengerType } from "../transport-service-response/transport-service-api-response";

const passengerTypeKey = (value: string | undefined) => normalizePassengerType(value);

const normalizeSsrCode = (value: string | undefined) => value?.trim().toUpperCase() ?? "";

function findAmountForSinglePtc(
	transportationData: TransportationOffersData,
	passengerType: string,
	ssrCode: string
): number | null {
	const normalizedPassengerType = passengerTypeKey(passengerType);
	const normalizedSsrCode = normalizeSsrCode(ssrCode);
	if (!normalizedPassengerType || !normalizedSsrCode) {
		return null;
	}

	for (const perType of transportationData?.data?.servicesPerPassengerType ?? []) {
		if (passengerTypeKey(perType.passengerType) !== normalizedPassengerType) {
			continue;
		}

		for (const category of perType.categories ?? []) {
			for (const service of category.specialServices ?? []) {
				if (
					normalizeSsrCode(service.ssrCode) === normalizedSsrCode &&
					typeof service.amount === "number"
				) {
					return service.amount;
				}
			}
		}
	}

	return null;
}

function findAmountforMultiplePassengerTypes(
	transportationData: TransportationOffersData,
	passengerTypes: string[],
	ssrCode: string
): number | null {
	for (const passengerType of passengerTypes) {
		const amount = findAmountForSinglePtc(transportationData, passengerType, ssrCode);
		if (amount !== null) {
			return amount;
		}
	}

	return null;
}

export const getAdultAmount = (transportationData: TransportationOffersData, ssrCode: string) =>
	findAmountForSinglePtc(transportationData, "adult", ssrCode) ?? 0;

export const getOlderAmount = (transportationData: TransportationOffersData, ssrCode: string) =>
	findAmountforMultiplePassengerTypes(
		transportationData,
		[...TRANSPORT_OLDER_PRICING_PASSENGER_TYPES],
		ssrCode
	) ?? 0;

export const getChildAmount = (transportationData: TransportationOffersData, ssrCode: string) =>
	findAmountforMultiplePassengerTypes(
		transportationData,
		[...TRANSPORT_CHILD_PRICING_PASSENGER_TYPES],
		ssrCode
	) ?? 0;

export const getAmountByPassengerTypeAndSsrCode = (
	transportationData: TransportationOffersData,
	passengerType: string,
	ssrCode: string
) => findAmountForSinglePtc(transportationData, passengerType, ssrCode) ?? 0;

/**
 * Resolves per-passenger pricing with trolley-specific PTC fallback behavior.
 */
export function getPassengerAmountByPricingSsr({
	transportationData,
	pricingSsrCode,
	passengerTypeCode,
}: {
	transportationData: TransportationOffersData;
	pricingSsrCode: string;
	passengerTypeCode?: string;
}): number {
	const normalizedPassengerType = passengerType(passengerTypeCode);
	const directAmount = getAmountByPassengerTypeAndSsrCode(
		transportationData,
		normalizedPassengerType,
		pricingSsrCode
	);

	if (directAmount > 0) {
		return directAmount;
	}

	const isTrolleyPricingSsr =
		pricingSsrCode === TROLLEY_7_DAYS_SSR_CODE ||
		pricingSsrCode === TROLLEY_4_DAYS_SSR_CODE ||
		pricingSsrCode === TROLLEY_1_DAY_SSR_CODE;
	if (!isTrolleyPricingSsr) {
		return directAmount;
	}

	if (normalizedPassengerType === "adult" || normalizedPassengerType === "childa") {
		return (
			getAmountByPassengerTypeAndSsrCode(transportationData, "adult", pricingSsrCode) ||
			getAmountByPassengerTypeAndSsrCode(transportationData, "childa", pricingSsrCode)
		);
	}

	if (normalizedPassengerType === "childb" || normalizedPassengerType === "childc") {
		return (
			getAmountByPassengerTypeAndSsrCode(transportationData, "childb", pricingSsrCode) ||
			getAmountByPassengerTypeAndSsrCode(transportationData, "childc", pricingSsrCode)
		);
	}

	return directAmount;
}
