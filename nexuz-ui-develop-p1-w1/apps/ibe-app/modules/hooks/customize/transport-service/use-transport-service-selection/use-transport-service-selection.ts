/**
 * File: use-transport-service-selection.ts
 * Description: Manages transport service selection, stock availability, and service detail state.
 * Provides selected service information and transport card actions for the booking flow.
 */
import { useMemo, useState } from "react";
import {
	getAdultServiceQtyAvailable,
	getServiceStockLimit,
	hasStoredTransportServiceForScope,
	mapServiceIdToSsrCode,
	SERVICE_ID_TO_SSR_CODE,
} from "@/modules/utils/helpers/customize/transport-service/transport-service-response/transport-service-api-response";
import type {
	SelectedTransportService,
	TransportServiceId,
	TransportServiceItem,
	UseTransportServiceSelectionParams,
} from "@/types/customize/transport-service/transport-service.types";

/**
 * Handles transport service selection, stock tracking,
 * and service-specific display data.
 */
export function useTransportServiceSelection({
	transportationData,
	transportServices,
	lfidBySsrCode,
	selectedPassengers,
	transportServiceLabels,
	setPricingTransportServiceId,
	trolleyDesktopImage,
}: UseTransportServiceSelectionParams) {
	const [selectedTransportServiceId, setSelectedTransportServiceId] =
		useState<TransportServiceId | null>(null);

	const selectedSsrCode = mapServiceIdToSsrCode(selectedTransportServiceId);
	const selectedAdultQtyAvailable = getAdultServiceQtyAvailable(
		transportationData,
		selectedSsrCode
	);
	const selectedServiceStockLimit = getServiceStockLimit(transportationData, selectedSsrCode);

	const remainingStockCount =
		selectedTransportServiceId !== null ? selectedAdultQtyAvailable : null;
	const shouldShowRemainingStock = remainingStockCount !== null && remainingStockCount < 10;

	const selectedService = useMemo<SelectedTransportService | undefined>(
		() =>
			transportServices
				.flatMap((activity) =>
					activity.services.map((service) => {
						const isTrolleyService = service.id.startsWith("trolley-");
						return {
							...service,
							activityImage: service.imageSrc,
							activityDesktopImage: isTrolleyService ? trolleyDesktopImage : undefined,
							activityDescription: activity.description,
						};
					})
				)
				.find((service) => service.id === selectedTransportServiceId),
		[selectedTransportServiceId, transportServices, trolleyDesktopImage]
	);

	const selectedServiceDescription = selectedService?.id?.startsWith("shuttle-")
		? transportServiceLabels("lealea_airport_shuttle_popup_description")
		: selectedService?.activityDescription;

	/**
	 **Opens the transport service detail view
	 * for the selected transport service.
	 */
	const openTransportServiceDetails = (serviceId: TransportServiceId) => {
		setPricingTransportServiceId(serviceId);
		setSelectedTransportServiceId(serviceId);
	};

	/**
	 **Returns to the transport service last view.
	 */
	const handleBackFromTransportServiceDetails = () => {
		setSelectedTransportServiceId(null);
	};

	/**
	 * Maps transport card*services with selection state
	 * and click handlers for the UI.
	 */
	const getTransportCardServices = (services: TransportServiceItem["services"]) =>
		services.map((service) => {
			const ssrCode = SERVICE_ID_TO_SSR_CODE[service.id];
			const scopedLfid = lfidBySsrCode.get(ssrCode);

			const isSelected =
				typeof scopedLfid === "number"
					? hasStoredTransportServiceForScope({
							passengers: selectedPassengers,
							ssrCode,
							lfid: scopedLfid,
						})
					: false;

			return {
				label: service.label,
				selected: isSelected,
				onAdd: () => openTransportServiceDetails(service.id),
			};
		});

	return {
		selectedTransportServiceId,
		setSelectedTransportServiceId,
		selectedServiceStockLimit,
		remainingStockCount,
		shouldShowRemainingStock,
		selectedService,
		selectedServiceDescription,
		handleBackFromTransportServiceDetails,
		getTransportCardServices,
	};
}
