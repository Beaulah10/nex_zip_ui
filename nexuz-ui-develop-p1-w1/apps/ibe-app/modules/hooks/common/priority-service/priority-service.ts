import { useTranslations } from "next-intl";
import { useEffect, useMemo, useState } from "react";
import type { selectCustomersListItem } from "@/components/common/select-customers/select-customers";
import { createSelectCustomerListItems } from "@/components/common/select-customers/select-customers";
import { createAccompanyingSelectionHelpers } from "@/modules/hooks/common/accompanying-selection/accompanying-selection";
import { usePassengerOrder } from "@/modules/hooks/common/passenger-order/passenger-order";
import { ANCILLARY_SERVICE_CONFIG } from "@/modules/utils/constants/ancillary-service.constants";
import { UNDER_SIX_DEPENDENT_TYPES } from "@/modules/utils/constants/priority-service/passenger-types.constants";
import { resolveAncillaryServiceOffer } from "@/modules/utils/helpers/ancillary/ancillary-service";
import {
	type BookingFlowDirection,
	getBookingStageSegment,
} from "@/modules/utils/helpers/common/flow-router/flow-router";
import { getSelectedAncillarySegment } from "@/modules/utils/helpers/common/get-ancillary-segment/get-ancillary-segment";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
	selectAncillaryOffersDataByDirectionAndServiceCategory,
	selectAncillaryPricingBySsrCode,
} from "@/store/slices/common/ancillary-offers/ancillary-offers";
import { selectConfirmedFlight } from "@/store/slices/flight-selection/flight-selection.slice";
import {
	addService,
	removeService,
	selectPassengers,
} from "@/store/slices/passenger/passenger.slice";
import type {
	PriorityServicePassenger,
	PriorityServiceSelection,
} from "@/types/priority-service/priority-services.types";

const expressAccompanyingSelection = createAccompanyingSelectionHelpers({
	autoSelectPassengerTypes: UNDER_SIX_DEPENDENT_TYPES,
	normalizePassengerTypeCode: (passengerTypeCode) => passengerTypeCode?.toLowerCase() ?? "",
});

/**Checks whether the passenger is an under-six dependent.*/
function isUnderSixDependentPassenger(passenger: PriorityServicePassenger) {
	return expressAccompanyingSelection.isAutoSelectedPassengerType(passenger.passengerTypeCode);
}

/**
 * Creates passenger rows with default selection, pricing,
 * stock availability, and dependency rules applied.
 */
function getPassengerRowsWithDefaults(
	orderedPassengersWithNames: PriorityServicePassenger[],
	selectedAdultIds: Set<string>,
	amount: number,
	quantityAvailable: number,
	lockedAdultIds: Set<string>,
	outOfStockLabel: string
): selectCustomersListItem[] {
	// Only show out of stock status when more passengers than available stock AND selected reaches limit
	const stockExhausted =
		quantityAvailable < orderedPassengersWithNames.length &&
		selectedAdultIds.size >= quantityAvailable;
	const baseRows = createSelectCustomerListItems(orderedPassengersWithNames).map(
		(passenger, index) => {
			const sourcePassenger = orderedPassengersWithNames[index];
			if (!sourcePassenger) {
				return passenger;
			}
			const isDependentPassenger = isUnderSixDependentPassenger(sourcePassenger);
			if (isDependentPassenger) {
				return {
					...passenger,
					price: 0,
					checked: false,
					disabled: true,
				};
			}
			const isLockedByTransitCoverage = lockedAdultIds.has(passenger.id);
			const isSelected = isLockedByTransitCoverage || selectedAdultIds.has(passenger.id);

			const isOutOfStock = !isLockedByTransitCoverage && stockExhausted && !isSelected;
			return {
				...passenger,
				price: amount,
				checked: isSelected,
				disabled: isLockedByTransitCoverage || isOutOfStock,
				status: isOutOfStock ? outOfStockLabel : undefined,
			};
		}
	);

	return expressAccompanyingSelection.syncAccompanyingPassengers(baseRows);
}

/**
 * Returns dependent passengers whose associated adult passenger
 * is currently selected.
 */
function getSelectedDependentPassengers(
	orderedPassengersWithNames: PriorityServicePassenger[],
	selectedAdultIds: Set<string>
): PriorityServicePassenger[] {
	return orderedPassengersWithNames.filter(
		(passenger) =>
			expressAccompanyingSelection.isAutoSelectedPassengerType(passenger.passengerTypeCode) &&
			Boolean(passenger.mappedAdultId) &&
			selectedAdultIds.has(passenger.mappedAdultId ?? "")
	);
}

/**
 * Removes the specified service from the given passengers
 * for the selected flight segment.
 */
function removePassengerServices(
	dispatch: ReturnType<typeof useAppDispatch>,
	passengers: PriorityServicePassenger[],
	segmentLfid: number,
	serviceSsrCode: string,
	serviceId: number
) {
	for (const passenger of passengers) {
		dispatch(
			removeService({
				passengerId: passenger.id,
				lfid: segmentLfid,
				ssrCode: serviceSsrCode,
				serviceID: serviceId,
			})
		);
	}
}

/**
 * Manages Priority Service passenger selection, pricing,
 * stock availability, transit coverage rules, and service persistence.
 * Returns passenger data, total amount, stock information,
 * and handlers for passenger selection and confirmation.
 * @param direction Flight direction for which the priority service is being managed.
 * @param isOpen Indicates whether the selection dialog is currently open.
 */

export const usePriorityService = (
	direction: BookingFlowDirection,
	isOpen = true
): PriorityServiceSelection => {
	const dispatch = useAppDispatch();
	const confirmedFlight = useAppSelector(selectConfirmedFlight);
	const { orderedPassengersWithNames } = usePassengerOrder();
	const passengers = useAppSelector(selectPassengers);

	const t = useTranslations("express_service");
	const outOfStockLabel = t("out_of_stock_message");

	const expressAncillaryDirection = useMemo(
		() => (confirmedFlight ? getBookingStageSegment({ confirmedFlight, direction }) : undefined),
		[confirmedFlight, direction]
	);

	const expressSelectedSegment = useMemo(
		() =>
			confirmedFlight ? getSelectedAncillarySegment({ confirmedFlight, direction }) : undefined,
		[confirmedFlight, direction]
	);

	const expressPricing = useAppSelector((state) =>
		expressAncillaryDirection && expressSelectedSegment
			? selectAncillaryPricingBySsrCode(
					state,
					expressAncillaryDirection,
					ANCILLARY_SERVICE_CONFIG.express.serviceCategory,
					ANCILLARY_SERVICE_CONFIG.express.ssrCode,
					ANCILLARY_SERVICE_CONFIG.express.pricingPassengerType,
					expressSelectedSegment.lfid
				)
			: { amount: 0, quantityAvailable: 1 }
	);

	const firstConnectingSegmentLfid = confirmedFlight?.flights.outbound.segments[0]?.lfid;
	const isTransitSecondSegment = expressAncillaryDirection === "segment2";

	const transitCoveredAdultIds = useMemo(() => {
		if (!isTransitSecondSegment || firstConnectingSegmentLfid === undefined) {
			return new Set<string>();
		}

		return new Set(
			passengers
				.filter((passenger) => !isUnderSixDependentPassenger(passenger))
				.filter((passenger) =>
					passenger.services?.express?.some(
						(service) => service.lfid === firstConnectingSegmentLfid
					)
				)
				.map((passenger) => passenger.id)
		);
	}, [isTransitSecondSegment, firstConnectingSegmentLfid, passengers]);

	const showTransitApplicabilityWarning = transitCoveredAdultIds.size > 0;

	const expressOffersData = useAppSelector((state) =>
		expressAncillaryDirection
			? selectAncillaryOffersDataByDirectionAndServiceCategory(
					state,
					expressAncillaryDirection,
					ANCILLARY_SERVICE_CONFIG.express.serviceCategory
				)
			: undefined
	);

	const expressService = useMemo(
		() =>
			expressOffersData?.data && expressSelectedSegment
				? resolveAncillaryServiceOffer({
						servicesPerPassengerType: expressOffersData.data.servicesPerPassengerType,
						passengerType: ANCILLARY_SERVICE_CONFIG.express.pricingPassengerType,
						ssrCode: ANCILLARY_SERVICE_CONFIG.express.ssrCode,
						selectedSegmentLfid: expressSelectedSegment.lfid,
					})
				: undefined,
		[expressOffersData, expressSelectedSegment]
	);

	const persistedPriorityPassengerIds = useMemo(() => {
		if (!expressSelectedSegment) {
			return new Set<string>();
		}

		return new Set(
			passengers
				.filter((passenger) =>
					passenger.services?.express?.some(
						(service) => service.lfid === expressSelectedSegment.lfid
					)
				)
				.filter((passenger) => !isUnderSixDependentPassenger(passenger))
				.map((passenger) => passenger.id)
		);
	}, [expressSelectedSegment, passengers]);

	const [selectedPassengers, setSelectedPassengers] = useState<selectCustomersListItem[]>(() =>
		getPassengerRowsWithDefaults(
			orderedPassengersWithNames,
			persistedPriorityPassengerIds,
			expressPricing.amount,
			expressPricing.quantityAvailable,
			transitCoveredAdultIds,
			outOfStockLabel
		)
	);

	useEffect(() => {
		if (!isOpen) {
			return;
		}

		setSelectedPassengers(
			getPassengerRowsWithDefaults(
				orderedPassengersWithNames,
				persistedPriorityPassengerIds,
				expressPricing.amount,
				expressPricing.quantityAvailable,
				transitCoveredAdultIds,
				outOfStockLabel
			)
		);
	}, [
		isOpen,
		orderedPassengersWithNames,
		persistedPriorityPassengerIds,
		expressPricing.amount,
		expressPricing.quantityAvailable,
		transitCoveredAdultIds,
		outOfStockLabel,
	]);

	const selectedAdultIds = useMemo(
		() =>
			new Set(
				selectedPassengers
					.filter((passenger) => passenger.checked && !passenger.disabled)
					.map((passenger) => passenger.id)
			),
		[selectedPassengers]
	);
	const priorityServicePassengers = useMemo(
		() =>
			getPassengerRowsWithDefaults(
				orderedPassengersWithNames,
				selectedAdultIds,
				expressPricing.amount,
				expressPricing.quantityAvailable,
				transitCoveredAdultIds,
				outOfStockLabel
			),
		[
			orderedPassengersWithNames,
			selectedAdultIds,
			expressPricing.amount,
			expressPricing.quantityAvailable,
			transitCoveredAdultIds,
			outOfStockLabel,
		]
	);

	const priorityServiceTotalAmount = priorityServicePassengers
		.filter((passenger) => passenger.checked && !passenger.disabled)
		.reduce((sum, passenger) => sum + passenger.price, 0);

	// Show banner only when:
	// 1. More passengers than available stock AND
	// 2. Selected count reaches the available stock limit
	const hasOutOfStockPassengers =
		expressPricing.quantityAvailable < orderedPassengersWithNames.length &&
		selectedAdultIds.size >= expressPricing.quantityAvailable;
	const stockLabelThreshold = 10;
	const remainingStocksLabel = useMemo(() => {
		if (hasOutOfStockPassengers || expressPricing.quantityAvailable >= stockLabelThreshold) {
			return undefined;
		}

		const remainingStock = Math.max(expressPricing.quantityAvailable - selectedAdultIds.size, 0);

		if (remainingStock === 0) {
			return undefined;
		}

		return t("remaining_stocks_label", { count: remainingStock });
	}, [hasOutOfStockPassengers, expressPricing.quantityAvailable, selectedAdultIds, t]);

	const togglePriorityPax = (id: string, checked: boolean) => {
		const targetPassenger = orderedPassengersWithNames.find((passenger) => passenger.id === id);
		if (
			!targetPassenger ||
			isUnderSixDependentPassenger(targetPassenger) ||
			transitCoveredAdultIds.has(id)
		) {
			return;
		}

		setSelectedPassengers((prev) => {
			const next = prev.map((passenger) => {
				if (passenger.id !== id) {
					return passenger;
				}

				if (!checked) {
					return {
						...passenger,
						checked: false,
					};
				}

				const selectedCount = prev.filter((item) => item.checked && !item.disabled).length;

				if (selectedCount >= expressPricing.quantityAvailable) {
					return passenger;
				}

				return {
					...passenger,
					checked: true,
				};
			});

			return next;
		});
	};

	const togglePrioritySelectAll = (checked: boolean) => {
		setSelectedPassengers((prev) => {
			const selectablePassengers = prev.filter((passenger) => !passenger.disabled);

			if (!checked) {
				return prev.map((passenger) =>
					passenger.disabled ? passenger : { ...passenger, checked: false }
				);
			}

			let remainingSlots = Math.max(
				expressPricing.quantityAvailable -
					selectablePassengers.filter((item) => item.checked).length,
				0
			);

			return prev.map((passenger) => {
				if (passenger.disabled) {
					return passenger;
				}

				if (passenger.checked || remainingSlots <= 0) {
					return passenger;
				}

				remainingSlots -= 1;
				return { ...passenger, checked: true };
			});
		});
	};

	const confirmPrioritySelection = () => {
		if (!expressService || !expressSelectedSegment) {
			return;
		}

		if (!isTransitSecondSegment) {
			const persistedExpressPassengers = passengers.filter((passenger) =>
				passenger.services?.express?.some((service) => service.lfid === expressSelectedSegment.lfid)
			);

			if (persistedExpressPassengers.length > 0) {
				removePassengerServices(
					dispatch,
					persistedExpressPassengers,
					expressSelectedSegment.lfid,
					ANCILLARY_SERVICE_CONFIG.express.ssrCode,
					expressService.service.ssrId
				);
			}
		}

		const selectedAdults = orderedPassengersWithNames.filter(
			(passenger) => !isUnderSixDependentPassenger(passenger) && selectedAdultIds.has(passenger.id)
		);

		const dependentPassengers = getSelectedDependentPassengers(
			orderedPassengersWithNames,
			selectedAdultIds
		);

		const uniqueDependentIds = new Set<string>();

		for (const passenger of selectedAdults) {
			dispatch(
				addService({
					passengerId: passenger.id,
					lfid: expressSelectedSegment.lfid,
					serviceCategory: "express",
					service: {
						lfid: expressSelectedSegment.lfid,
						amount: expressService.amount,
						categoryId: expressService.categoryId,
						cutOffHours: expressService.service.cutOffHours,
						description: expressService.service.description,
						maxCountServiceLevel: expressService.service.maxCountServiceLevel,
						passengerType: expressService.passengerType,
						qtyAvailable: expressService.service.qtyAvailable,
						ssrCode: ANCILLARY_SERVICE_CONFIG.express.ssrCode,
						serviceID: expressService.service.ssrId,
						pfid: expressService.service.pfid ?? expressSelectedSegment.pfid ?? 0,
						chargeComment: expressService.service.description,
						bundleCode: "",
					},
				})
			);
		}

		for (const dependentPassenger of dependentPassengers) {
			if (uniqueDependentIds.has(dependentPassenger.id)) {
				continue;
			}

			uniqueDependentIds.add(dependentPassenger.id);
			dispatch(
				addService({
					passengerId: dependentPassenger.id,
					lfid: expressSelectedSegment.lfid,
					serviceCategory: "express",
					service: {
						lfid: expressSelectedSegment.lfid,
						amount: 0,
						categoryId: expressService.categoryId,
						cutOffHours: expressService.service.cutOffHours,
						description: expressService.service.description,
						maxCountServiceLevel: expressService.service.maxCountServiceLevel,
						passengerType: expressService.passengerType,
						qtyAvailable: 0,
						ssrCode: ANCILLARY_SERVICE_CONFIG.express.ssrCode,
						serviceID: expressService.service.ssrId,
						pfid: expressService.service.pfid ?? expressSelectedSegment.pfid ?? 0,
						chargeComment: expressService.service.description,
						bundleCode: "",
					},
				})
			);
		}
	};

	return {
		priorityServicePassengers,
		priorityServiceTotalAmount,
		hasOutOfStockPassengers,
		remainingStocksLabel,
		showTransitApplicabilityWarning,
		togglePriorityPax,
		togglePrioritySelectAll,
		confirmPrioritySelection,
	};
};
