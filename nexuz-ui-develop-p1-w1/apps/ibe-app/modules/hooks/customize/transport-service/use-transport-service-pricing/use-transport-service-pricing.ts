/**
 * File: use-transport-service-pricing.ts
 * Description: Calculates transport service pricing and manages the active pricing service selection.
 * Provides passenger-level pricing and aggregated transport service totals.
 */
import { useCallback, useMemo, useState } from "react";
import { getPassengerAmountByPricingSsr } from "@/modules/utils/helpers/customize/transport-service/transport-service-pricing/transport-service-pricing";
import { mapServiceIdToSsrCode } from "@/modules/utils/helpers/customize/transport-service/transport-service-response/transport-service-api-response";
import type {
	TransportServiceId,
	UseTransportServicePricingParams,
} from "@/types/customize/transport-service/transport-service.types";

/**
 * Provides transport service pricing calculations and
 * maintains the currently selected pricing service.
 * Scopes stored totals by the current leg (lfid) to prevent
 * outbound amounts from leaking into inbound.
 */
export function useTransportServicePricing({
	transportationData,
	selectedPassengers,
	currentLfid,
}: UseTransportServicePricingParams) {
	const [pricingTransportServiceId, setPricingTransportServiceId] =
		useState<TransportServiceId | null>(null);

	const pricingSsrCode = mapServiceIdToSsrCode(pricingTransportServiceId);

	/**
	 * Returns the applicable transport service amount
	 * for the specified passenger type.
	 */
	const getPassengerAmount = useCallback(
		(passengerTypeCode?: string) =>
			getPassengerAmountByPricingSsr({
				transportationData,
				pricingSsrCode,
				passengerTypeCode,
			}),
		[transportationData, pricingSsrCode]
	);

	const storedServicesTotal = useMemo(
		() =>
			selectedPassengers.reduce((total, passenger) => {
				const travelServices = passenger.services?.travel ?? [];
				return (
					total +
					travelServices
						.filter((service) => currentLfid === undefined || service.lfid === currentLfid)
						.reduce((sum, service) => sum + (service.amount ?? 0), 0)
				);
			}, 0),
		[selectedPassengers, currentLfid]
	);

	return {
		pricingTransportServiceId,
		setPricingTransportServiceId,
		getPassengerAmount,
		storedServicesTotal,
	};
}
