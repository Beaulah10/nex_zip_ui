/**
 * File: use-transport-service-passengers.ts
 * Description: Manages passenger selection, stock validation, and pricing totals for transport services.
 * Syncs stored transport service selections with selectable passengers in the booking flow.
 */
import { useCallback, useEffect, useMemo, useState } from "react";
import {
	createSelectCustomerListItems,
	type selectCustomersListItem,
} from "@/components/common/select-customers/select-customers";
import { useAccompanyingSelectionHelpers } from "@/modules/hooks/common/accompanying-selection/accompanying-selection";
import { usePassengerOrder } from "@/modules/hooks/common/passenger-order/passenger-order";
import { INFANT_PASSENGER_TYPES } from "@/modules/utils/constants/priority-service/passenger-types.constants";
import {
	getSelectedNonInfantCount,
	isInfantPassenger,
	isTransportPassengerListequal,
	toggleTransportPassengerSelection,
	toggleTransportSelectAllPassengers,
} from "@/modules/utils/helpers/customize/transport-service/transport-service-passenger-utils/transport-passenger-utils";
import {
	findSpecialService,
	hasStoredTransportServiceForPassenger,
	hasStoredTransportServiceForScope,
	passengerType,
	SERVICE_ID_TO_SSR_CODE,
} from "@/modules/utils/helpers/customize/transport-service/transport-service-response/transport-service-api-response";
import type {
	TransportServiceId,
	UseTransportServicePassengersParams,
} from "@/types/customize/transport-service/transport-service.types";
/**
 * Manages transport service passenger selection, stock availability,
 * stored service synchronization, and pricing calculations.
 */
export function useTransportServicePassengers({
	transportationData,
	selectedPassengers,
	selectedTransportServiceId,
	selectedServiceStockLimit,
	getPassengerAmount,
	transportServiceLabels,
	open,
	lfidBySsrCode,
	setPricingTransportServiceId,
}: UseTransportServicePassengersParams) {
	const { orderedPassengersWithNames } = usePassengerOrder();
	const transportAccompanyingSelection = useAccompanyingSelectionHelpers({
		autoSelectPassengerTypes: INFANT_PASSENGER_TYPES,
		normalizePassengerTypeCode: passengerType,
		primaryRequiresNoMappedAdult: false,
	});

	const [transportServicePax, setTransportServicePax] = useState<selectCustomersListItem[]>(() =>
		createSelectCustomerListItems(orderedPassengersWithNames)
	);

	const selectedTransportPassengerCount = getSelectedNonInfantCount(transportServicePax);
	const selectableTransportPassengerCount = transportServicePax.filter(
		(passenger) => !isInfantPassenger(passenger.passengerTypeCode)
	).length;
	const hasStockLimit = selectedServiceStockLimit !== null;
	const hasOutOfStockPassengers =
		selectedTransportServiceId !== null &&
		hasStockLimit &&
		selectedTransportPassengerCount >= selectedServiceStockLimit &&
		selectableTransportPassengerCount > selectedServiceStockLimit;

	/**
	 * Synchronizes passenger selections with the currently selected
	 * transport service based on stored SSR assignments.
	 */
	const syncTransportPassengersByService = useCallback(
		(serviceId: TransportServiceId | null) => {
			const basePassengers = createSelectCustomerListItems(orderedPassengersWithNames);

			if (!serviceId) {
				setTransportServicePax((previousPassengers) =>
					isTransportPassengerListequal(previousPassengers, basePassengers)
						? previousPassengers
						: basePassengers
				);
				return;
			}

			const ssrCode = SERVICE_ID_TO_SSR_CODE[serviceId];
			const nextPassengers = basePassengers.map((passenger) => {
				const service = findSpecialService(
					transportationData,
					passenger.passengerTypeCode,
					ssrCode
				);

				if (!service || typeof service.lfid !== "number" || typeof service.ssrId !== "number") {
					return { ...passenger, checked: false };
				}

				const hasSelectedService = hasStoredTransportServiceForPassenger({
					passengers: selectedPassengers,
					passengerId: passenger.id,
					ssrCode,
					lfid: service.lfid,
					serviceID: service.ssrId,
				});

				return { ...passenger, checked: hasSelectedService };
			});

			const syncedPassengers =
				transportAccompanyingSelection.syncAccompanyingPassengers(nextPassengers);

			setTransportServicePax((previousPassengers) =>
				isTransportPassengerListequal(previousPassengers, syncedPassengers)
					? previousPassengers
					: syncedPassengers
			);
		},
		[
			orderedPassengersWithNames,
			selectedPassengers,
			transportAccompanyingSelection,
			transportationData,
		]
	);

	useEffect(() => {
		if (!selectedTransportServiceId) {
			return;
		}

		syncTransportPassengersByService(selectedTransportServiceId);
	}, [selectedTransportServiceId, syncTransportPassengersByService]);

	useEffect(() => {
		if (!open) {
			return;
		}

		const storedServiceId = (Object.keys(SERVICE_ID_TO_SSR_CODE) as TransportServiceId[]).find(
			(serviceId) => {
				const ssrCode = SERVICE_ID_TO_SSR_CODE[serviceId];
				const scopedLfid = lfidBySsrCode.get(ssrCode);
				if (typeof scopedLfid !== "number") {
					return false;
				}

				return hasStoredTransportServiceForScope({
					passengers: selectedPassengers,
					ssrCode,
					lfid: scopedLfid,
				});
			}
		);

		const nextPricingServiceId = storedServiceId ?? null;
		setPricingTransportServiceId(nextPricingServiceId);
		syncTransportPassengersByService(nextPricingServiceId);
	}, [
		open,
		selectedPassengers,
		lfidBySsrCode,
		setPricingTransportServiceId,
		syncTransportPassengersByService,
	]);

	const currentSelectionTotal = useMemo(
		() =>
			transportServicePax
				.filter((passenger) => passenger.checked && !isInfantPassenger(passenger.passengerTypeCode))
				.reduce((total, passenger) => total + getPassengerAmount(passenger.passengerTypeCode), 0),
		[transportServicePax, getPassengerAmount]
	);

	const passengersWithAmount = useMemo(
		() =>
			transportServicePax.map((passenger) => {
				const isOutOfStock =
					hasOutOfStockPassengers &&
					!passenger.checked &&
					!isInfantPassenger(passenger.passengerTypeCode);

				return {
					...passenger,
					price: getPassengerAmount(passenger.passengerTypeCode),
					disabled: isOutOfStock,
					status: isOutOfStock ? transportServiceLabels("out_of_stock") : undefined,
				};
			}),
		[transportServicePax, hasOutOfStockPassengers, getPassengerAmount, transportServiceLabels]
	);

	const toggleTransportServicePax = (id: string, checked: boolean) => {
		setTransportServicePax((previousPassengers) =>
			toggleTransportPassengerSelection({
				passengers: previousPassengers,
				targetId: id,
				nextChecked: checked,
				stockLimit: selectedServiceStockLimit,
			})
		);
	};

	const toggleTransportServiceSelectAll = (checked: boolean) => {
		setTransportServicePax((previousPassengers) =>
			toggleTransportSelectAllPassengers({
				passengers: previousPassengers,
				nextChecked: checked,
				stockLimit: selectedServiceStockLimit,
			})
		);
	};

	return {
		transportServicePax,
		passengersWithAmount,
		hasOutOfStockPassengers,
		currentSelectionTotal,
		selectedTransportPassengerCount,
		toggleTransportServicePax,
		toggleTransportServiceSelectAll,
	};
}
