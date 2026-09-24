/**
 * File: use-transport-service-persistence.ts
 * Description: Persists selected transport services for passengers by adding or removing SSRs.
 * Synchronizes transport service selections with the passenger store.
 */
import { useCallback } from "react";
import { isInfantPassenger } from "@/modules/utils/helpers/customize/transport-service/transport-service-passenger-utils/transport-passenger-utils";
import {
	findSpecialService,
	mapServiceIdToSsrCode,
	passengerType,
} from "@/modules/utils/helpers/customize/transport-service/transport-service-response/transport-service-api-response";
import { useAppDispatch } from "@/store/hooks";
import { addService, removeService } from "@/store/slices/passenger/passenger.slice";
import type { UseTransportServicePersistenceParams } from "@/types/customize/transport-service/transport-service.types";

/**
 * Handles persistence of transport service selections
 * by updating passenger ancillary services in the store.
 */
export function useTransportServicePersistence({
	selectedTransportServiceId,
	transportServicePax,
	transportationData,
}: UseTransportServicePersistenceParams) {
	const dispatch = useAppDispatch();

	/**
	 * Saves the curren* transport service selection for e*ch passenger.
	 */
	const persistSelectedTransportService = useCallback(() => {
		if (!selectedTransportServiceId) {
			return;
		}

		const ssrCode = mapServiceIdToSsrCode(selectedTransportServiceId);
		if (!ssrCode) {
			return;
		}

		for (const passenger of transportServicePax) {
			if (isInfantPassenger(passenger.passengerTypeCode)) {
				continue;
			}

			const specialService = findSpecialService(
				transportationData,
				passenger.passengerTypeCode,
				ssrCode
			);

			if (!specialService) {
				continue;
			}

			if (typeof specialService.lfid !== "number" || typeof specialService.ssrId !== "number") {
				continue;
			}

			const lfid = specialService.lfid;
			const serviceID = specialService.ssrId;

			if (passenger.checked) {
				dispatch(
					addService({
						passengerId: passenger.id,
						lfid,
						serviceCategory: "travel",
						service: {
							lfid,
							pfid: specialService.pfid ?? 0,
							amount: specialService.amount,
							categoryId: 0,
							cutOffHours: specialService.cutOffHours,
							description: specialService.description,
							maxCountServiceLevel: specialService.maxCountServiceLevel,
							passengerType: passengerType(passenger.passengerTypeCode),
							qtyAvailable: specialService.qtyAvailable,
							ssrCode: specialService.ssrCode,
							serviceID,
							chargeComment: specialService.currency,
							bundleCode: "",
						},
					})
				);
			} else {
				dispatch(
					removeService({
						passengerId: passenger.id,
						lfid,
						ssrCode,
						serviceID,
					})
				);
			}
		}
	}, [selectedTransportServiceId, transportServicePax, transportationData, dispatch]);

	return { persistSelectedTransportService };
}
