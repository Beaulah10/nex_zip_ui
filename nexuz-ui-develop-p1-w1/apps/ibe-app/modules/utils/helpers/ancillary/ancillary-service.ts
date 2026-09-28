import type { NEXUZR004OffersSpecialService } from "@repo/sdk";
import type { selectCustomersListItem } from "@/components/common/select-customers/select-customers";
import type {
	AncillaryServiceOffer,
	AncillaryServiceOfferArgs,
	AncillaryServiceOfferResult,
	BuildSelectablePassengerListArgs,
	PassengerDisplayNameSource,
	ServiceWithQuantity,
} from "@/types/ancillary/ancillary-service.types";

/**
 * Build a display name from the passenger's available name fields.
 */
export function getPassengerDisplayName(passenger: PassengerDisplayNameSource): string {
	return [passenger.firstName, passenger.middleName, passenger.lastName].filter(Boolean).join(" ");
}

/**
 * Resolve the best matching service for the selected segment, then fall back to any available
 * service or the first entry if nothing is explicitly matched.
 */
export function resolveServiceBySegment<TService extends ServiceWithQuantity>(
	services: TService[],
	selectedSegmentLfid?: number
): TService | undefined {
	return (
		services.find((service) => service.lfid === selectedSegmentLfid) ??
		services.find((service) => service.qtyAvailable > 0) ??
		services[0]
	);
}

/**
 * Resolve the ancillary amount and availability for a passenger type and SSR code.
 */
export function getAncillaryServiceOffer({
	servicesPerPassengerType,
	passengerType,
	ssrCode,
	selectedSegmentLfid,
}: AncillaryServiceOfferArgs): AncillaryServiceOfferResult {
	const targetPassengerType = servicesPerPassengerType.find(
		(entry) => entry.passengerType.toLowerCase() === passengerType.toLowerCase()
	);

	if (!targetPassengerType) {
		return { amount: 0, qtyAvailable: 0 };
	}

	const specialServices = targetPassengerType.categories.flatMap(
		(category) => category.specialServices
	);
	const filteredServices = specialServices.filter(
		(service: NEXUZR004OffersSpecialService) => service.ssrCode === ssrCode
	);
	const matchingService = resolveServiceBySegment(filteredServices, selectedSegmentLfid);

	return {
		amount: matchingService?.amount ?? 0,
		qtyAvailable: matchingService?.qtyAvailable ?? 0,
	};
}

/**
 * Resolve the exact ancillary service row for a passenger type, SSR code, and segment.
 */
export function resolveAncillaryServiceOffer({
	servicesPerPassengerType,
	passengerType,
	ssrCode,
	selectedSegmentLfid,
}: AncillaryServiceOfferArgs): AncillaryServiceOffer | undefined {
	const targetPassengerType = servicesPerPassengerType.find(
		(entry) => entry.passengerType.toLowerCase() === passengerType.toLowerCase()
	);

	if (!targetPassengerType) {
		return undefined;
	}

	const matchingCategory = targetPassengerType.categories.find((category) =>
		category.specialServices.some(
			(service) => service.ssrCode === ssrCode && service.lfid === selectedSegmentLfid
		)
	);

	if (!matchingCategory) {
		return undefined;
	}

	const matchingService = matchingCategory.specialServices.find(
		(service) => service.ssrCode === ssrCode && service.lfid === selectedSegmentLfid
	);

	if (!matchingService) {
		return undefined;
	}

	return {
		amount: matchingService.amount,
		qtyAvailable: matchingService.qtyAvailable,
		categoryId: matchingCategory.categoryId,
		passengerType,
		service: matchingService,
	};
}

/**
 * Convert ordered passengers into selectable rows for ancillary dialogs.
 */
export function buildSelectablePassengerList({
	passengers,
	amount,
	quantityAvailable,
	selectedPassengers,
}: BuildSelectablePassengerListArgs): selectCustomersListItem[] {
	const selectedCount = selectedPassengers?.filter((passenger) => passenger.checked).length ?? 0;
	const hasAvailability = quantityAvailable > 0;
	const isSelectionLimitReached = hasAvailability && selectedCount >= quantityAvailable;

	return passengers.map((passenger) => {
		const selectedPassenger = selectedPassengers?.find((item) => item.id === passenger.id);
		const isSelected = selectedPassenger?.checked ?? false;
		const isDisabled = !hasAvailability ? true : isSelected ? false : isSelectionLimitReached;

		return {
			id: passenger.id,
			name: getPassengerDisplayName(passenger),
			category: passenger.passengerTypeCode ?? "Passenger",
			price: amount,
			checked: isSelected,
			disabled: isDisabled,
			passengerTypeCode: passenger.passengerTypeCode,
		};
	});
}
