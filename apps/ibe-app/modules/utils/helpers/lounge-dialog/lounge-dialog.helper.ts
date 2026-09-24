import { UNDER_SIX_DEPENDENT_TYPES } from "@/modules/utils/constants/priority-service/passenger-types.constants";
import type { AncillaryServiceOption } from "@/modules/utils/lounge.utils";
import type { PassengerService, PassengerValues } from "@/types/passenger/passenger.type";
import type { selectCustomersListItem } from "@/types/select-customer/select-customer.types";

/**
 * Creates a Map of saved passengers keyed by passenger ID.
 */
export function createSavedPassengerMap(
	savedPassengers: PassengerValues[]
): Map<string, PassengerValues> {
	return new Map(savedPassengers.map((passenger) => [passenger.id, passenger]));
}

/**
 * Creates a lounge service object for the given passenger.
 * Dependent passengers (under 6) receive zero amount and zero stock.
 * Returns undefined if no matching lounge option exists.
 */
export function createLoungeServiceForPassenger(
	passenger: selectCustomersListItem,
	loungeOptionByPassengerType: Map<string, AncillaryServiceOption>,
	loungeServiceData: AncillaryServiceOption[]
): PassengerService | undefined {
	const passengerTypeCode = passenger.passengerTypeCode?.toLowerCase() ?? "";
	const isDependentPassenger = UNDER_SIX_DEPENDENT_TYPES.has(passengerTypeCode);

	const matchedOption = loungeOptionByPassengerType.get(passengerTypeCode) ?? loungeServiceData[0];

	if (!matchedOption) {
		return undefined;
	}

	const { service } = matchedOption;

	return {
		lfid: service.lfid,
		pfid: service.pfid ?? 0,
		amount: isDependentPassenger ? 0 : service.amount,
		categoryId: matchedOption.categoryId,
		cutOffHours: service.cutOffHours ?? 0,
		description: service.description,
		maxCountServiceLevel: service.maxCountServiceLevel ?? 0,
		passengerType: passenger.passengerTypeCode ?? matchedOption.passengerType,
		qtyAvailable: isDependentPassenger ? 0 : (service.qtyAvailable ?? 0),
		ssrCode: service.ssrCode,
		serviceID: service.ssrId,
		chargeComment: "",
		bundleCode: "",
	};
}

/**
 * Builds per-passenger lounge service selections and removable option mappings.
 * Only checked passengers receive a lounge service entry.
 */
export function getPassengerLoungeSelections(
	loungePassengers: selectCustomersListItem[],
	loungeServiceData: AncillaryServiceOption[],
	loungeOptionByPassengerType: Map<string, AncillaryServiceOption>
): {
	selectedLoungeServiceByPassengerId: Map<string, PassengerService>;
	removableOptionsByPassengerId: Map<string, AncillaryServiceOption[]>;
} {
	const selectedLoungeServiceByPassengerId = new Map<string, PassengerService>();
	const removableOptionsByPassengerId = new Map<string, AncillaryServiceOption[]>();

	for (const passenger of loungePassengers) {
		const passengerTypeCode = passenger.passengerTypeCode?.toLowerCase() ?? "";

		const optionsForPassengerType = loungeServiceData.filter(
			(option) => option.passengerType.toLowerCase() === passengerTypeCode
		);

		removableOptionsByPassengerId.set(
			passenger.id,
			optionsForPassengerType.length > 0 ? optionsForPassengerType : loungeServiceData
		);

		if (!passenger.checked) {
			continue;
		}

		const passengerService = createLoungeServiceForPassenger(
			passenger,
			loungeOptionByPassengerType,
			loungeServiceData
		);

		if (passengerService) {
			selectedLoungeServiceByPassengerId.set(passenger.id, passengerService);
		}
	}

	return { selectedLoungeServiceByPassengerId, removableOptionsByPassengerId };
}

/**
 * Returns an updated passenger record with lounge services merged/replaced.
 * Existing removable lounge entries are stripped before adding the selected one.
 */
export function updatePassengerServices(
	passenger: PassengerValues,
	removableOptions: AncillaryServiceOption[],
	selectedLoungeService?: PassengerService
): PassengerValues {
	const existingServices = passenger.services ?? {};
	const existingLounge = existingServices.lounge ?? [];
	const existingNonChargeable = existingServices["non-chargeable"] ?? [];

	const isRemovable = (service: PassengerService) =>
		removableOptions.some(
			(option) =>
				service.lfid === option.service.lfid &&
				service.ssrCode === option.service.ssrCode &&
				service.serviceID === option.service.ssrId
		);

	return {
		...passenger,
		services: {
			...existingServices,
			lounge: selectedLoungeService
				? [...existingLounge.filter((s) => !isRemovable(s)), selectedLoungeService]
				: existingLounge.filter((s) => !isRemovable(s)),
			"non-chargeable": existingNonChargeable.filter((s) => !isRemovable(s)),
		},
	};
}

/**
 * Returns the full saved passengers list with lounge services updated
 * for passengers that appear in the current dialog passenger list.
 */
export function updateExistingPassengers(
	savedPassengers: PassengerValues[],
	passengerLists: selectCustomersListItem[],
	loungeServiceData: AncillaryServiceOption[],
	selectedLoungeServiceByPassengerId: Map<string, PassengerService>,
	removableOptionsByPassengerId: Map<string, AncillaryServiceOption[]>
): PassengerValues[] {
	const passengerListIds = new Set(passengerLists.map((p) => p.id));

	return savedPassengers.map((passenger) => {
		if (!passengerListIds.has(passenger.id)) {
			return passenger;
		}
		const removableOptions = removableOptionsByPassengerId.get(passenger.id) ?? loungeServiceData;
		const selectedLoungeService = selectedLoungeServiceByPassengerId.get(passenger.id);
		return updatePassengerServices(passenger, removableOptions, selectedLoungeService);
	});
}

/**
 * Pushes newly encountered passengers (not yet in savedPassengers) into nextPassengers
 * with their lounge service attached. Dependent passengers with no lounge service are skipped.
 */
export function appendNewPassengers(
	nextPassengers: PassengerValues[],
	passengerLists: selectCustomersListItem[],
	savedPassengerById: Map<string, PassengerValues>,
	selectedLoungeServiceByPassengerId: Map<string, PassengerService>
): void {
	for (const passenger of passengerLists) {
		if (savedPassengerById.has(passenger.id)) {
			continue;
		}

		const passengerTypeCode = passenger.passengerTypeCode?.toLowerCase() ?? "";
		const isDependentPassenger = UNDER_SIX_DEPENDENT_TYPES.has(passengerTypeCode);
		const loungeService = selectedLoungeServiceByPassengerId.get(passenger.id);

		if (isDependentPassenger && !loungeService) {
			continue;
		}

		nextPassengers.push({
			id: passenger.id,
			passengerTypeCode,
			firstName: passenger.name,
			lastName: "",
			services: {
				lounge: loungeService ? [loungeService] : [],
				"non-chargeable": [],
			},
		});
	}
}
