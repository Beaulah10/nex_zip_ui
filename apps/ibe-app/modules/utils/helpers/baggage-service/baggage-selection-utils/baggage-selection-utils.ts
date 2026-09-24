/**
 * File: baggage-selection-utils.ts
 * Description: Utility functions for managing baggage selection. It includes functions to handle baggage inventory, validate selections, and dispatch changes to the store.
 */

import {
	bundleCodeToBundleIdMap,
	DEFAULT_BAGGAGE_BY_BUNDLE,
} from "@/modules/utils/constants/baggage-service/baggage-selection-constants";
import { getQuantity } from "@/modules/utils/helpers/baggage-service/baggage-validation/baggage-validation";
import {
	type BookingFlowDirection,
	getBookingStageSegment,
} from "@/modules/utils/helpers/common/flow-router/flow-router";
import type { AppDispatch } from "@/store";
import type {
	ConfirmedFlightPayload,
	SelectedSegment,
} from "@/store/slices/flight-selection/flight-selection.slice";
import { addService, removeService } from "@/store/slices/passenger/passenger.slice";
import type {
	BaggageCategoryId,
	CheckedInBaggageMap,
	DefaultBaggageBundle,
	GetDefaultBaggageActionsParams,
	SportsEquipmentMap,
} from "@/types/baggage-selection/baggage-selection.types";
import type { BundleCode, PassengerService } from "@/types/passenger/passenger.type";

// ....................... Flight Segment Helper Functions ...........................
// get flight segment details
export const getFlightSegment = ({
	confirmedFlight,
	direction,
}: {
	confirmedFlight: ConfirmedFlightPayload;
	direction: BookingFlowDirection;
}): SelectedSegment | undefined => {
	const stageSegment = getBookingStageSegment({ confirmedFlight, direction });

	if (stageSegment === "segment1") {
		return confirmedFlight.flights.outbound.segments[0];
	}

	if (stageSegment === "segment2") {
		return (
			confirmedFlight.flights.outbound.segments[1] ?? confirmedFlight.flights.inbound?.segments[0]
		);
	}

	return direction === "outbound"
		? confirmedFlight.flights.outbound.segments[0]
		: (confirmedFlight.flights.inbound?.segments[0] ??
				confirmedFlight.flights.outbound.segments[0]);
};

// get connecting segement info for baggage selection
export const getConnectingSegmentInfo = ({
	direction,
	confirmedFlight,
}: {
	direction: BookingFlowDirection;
	confirmedFlight: ConfirmedFlightPayload;
}) => {
	const stageSegment = getBookingStageSegment({ confirmedFlight, direction });
	const isConnectingFlight = stageSegment === "segment1" || stageSegment === "segment2";

	let otherStageLabel: string | undefined;
	let otherLfid: number | undefined;
	if (stageSegment === "segment1") {
		otherStageLabel = "Segment 2";
		otherLfid =
			confirmedFlight.flights.inbound?.segments[0]?.lfid ??
			confirmedFlight.flights.outbound.segments[1]?.lfid;
	} else if (stageSegment === "segment2") {
		otherStageLabel = "Segment 1";
		otherLfid = confirmedFlight.flights.outbound.segments[0]?.lfid;
	} else {
		otherStageLabel = undefined;
	}

	return {
		isConnectingFlight,
		otherStageLabel,
		otherLfid,
	};
};

// Helper to dispatch add service actions
const normalizeBaggageServiceForAdd = (service: PassengerService): PassengerService => {
	if (service.bundleCode !== "NOBN") {
		return service;
	}

	const { bundleCode: _bundleCode, ...serviceWithoutBundleCode } = service;
	return serviceWithoutBundleCode;
};

const dispatchAddService = ({
	dispatch,
	passengerId,
	currentLfid,
	service,
	times = 1,
}: {
	dispatch: AppDispatch;
	passengerId: string;
	currentLfid?: number;
	service: PassengerService;
	times?: number;
}) => {
	for (let i = 0; i < times; i++) {
		dispatch(
			addService({
				passengerId,
				lfid: Number(currentLfid),
				service: {
					...normalizeBaggageServiceForAdd(service),
					applicableAmount: service?.applicableAmount ?? service?.amount,
				},
				serviceCategory: "baggage",
			})
		);
	}
};

// Dispatches quantity-based baggage changes (sports equipment, checked-in baggage)
const dispatchQuantityChanges = ({
	dispatch,
	passengerId,
	currentLfid,
	originalMap,
	updatedMap,
	changeType,
	ssrCodeFilter,
}: {
	dispatch: AppDispatch;
	passengerId: string;
	currentLfid?: number;
	originalMap: SportsEquipmentMap | CheckedInBaggageMap;
	updatedMap: SportsEquipmentMap | CheckedInBaggageMap;
	changeType: "sports" | "checked-in";
	ssrCodeFilter?: string;
}) => {
	const allSsrCodes = new Set([...Object.keys(originalMap), ...Object.keys(updatedMap)]);
	for (const ssrCode of allSsrCodes) {
		if (ssrCodeFilter && ssrCode !== ssrCodeFilter) continue;

		const oldQty = getQuantity(originalMap, ssrCode);
		const newQty = getQuantity(updatedMap, ssrCode);
		if (oldQty === newQty) continue;

		const quantityBasedService = updatedMap[ssrCode] ?? originalMap[ssrCode];
		if (!quantityBasedService) continue;

		const { service: svc } = quantityBasedService;
		const isFlexBizBundle =
			svc?.bundleCode !== undefined &&
			bundleCodeToBundleIdMap[svc.bundleCode as BundleCode] === "FLEXBIZ";

		// Sports: optimize by adding only delta when increasing
		if (changeType === "sports" && newQty > oldQty) {
			dispatchAddService({
				dispatch,
				passengerId,
				currentLfid,
				service: svc,
				times: newQty - oldQty,
			});
		}
		if (changeType === "checked-in" && newQty > oldQty) {
			if (svc?.bundleCode === "NOBN" || isFlexBizBundle) {
				dispatchAddService({
					dispatch,
					passengerId,
					currentLfid,
					service: { ...svc, applicableAmount: svc?.amount },
					times: newQty - oldQty,
				});
			} else if (oldQty === 0 && newQty > 0) {
				dispatchAddService({
					dispatch,
					passengerId,
					currentLfid,
					service: { ...svc, applicableAmount: 0 },
					times: 1,
				});

				if (newQty - oldQty > 1) {
					dispatchAddService({
						dispatch,
						passengerId,
						currentLfid,
						service: { ...svc, applicableAmount: svc?.amount },
						times: newQty - oldQty - 1,
					});
				}

				continue;
			} else {
				dispatchAddService({
					dispatch,
					passengerId,
					currentLfid,
					service: svc,
					times: newQty - oldQty,
				});
			}
		}
		// When decreasing: remove all and re-add new quantity
		if (oldQty > newQty) {
			dispatch(
				removeService({
					passengerId,
					lfid: Number(currentLfid),
					ssrCode: svc.ssrCode,
				})
			);
			if (newQty > 0) {
				if (changeType === "checked-in") {
					if (svc?.bundleCode === "NOBN" || isFlexBizBundle) {
						dispatchAddService({
							dispatch,
							passengerId,
							currentLfid,
							service: { ...svc, applicableAmount: svc?.amount },
							times: newQty,
						});
					} else if (newQty > 0) {
						dispatchAddService({
							dispatch,
							passengerId,
							currentLfid,
							service: { ...svc, applicableAmount: 0 },
							times: 1,
						});

						if (newQty > 1) {
							dispatchAddService({
								dispatch,
								passengerId,
								currentLfid,
								service: { ...svc, applicableAmount: svc?.amount },
								times: newQty - 1,
							});
						}
					}

					continue;
				}

				dispatchAddService({
					dispatch,
					passengerId,
					currentLfid,
					service: { ...svc, applicableAmount: svc?.amount },
					times: newQty,
				});
			}
		}
	}
};

// Unified baggage dispatch handler for all baggage change types
export const dispatchBaggageChanges = ({
	dispatch,
	passengerId,
	currentLfid,
	changeType,
	original,
	updated,
	service,
	ssrCodeFilter,
}: {
	dispatch: AppDispatch;
	passengerId: string;
	currentLfid?: number;
	changeType: "carry-on" | "sports" | "checked-in";
	original: boolean | SportsEquipmentMap | CheckedInBaggageMap;
	updated: boolean | SportsEquipmentMap | CheckedInBaggageMap;
	service?: PassengerService;
	ssrCodeFilter?: string;
}) => {
	// Handle carry-on toggle (boolean)
	if (changeType === "carry-on") {
		if (!service) return;

		const hadCabn = original as boolean;
		const hasCabn = updated as boolean;

		if (hadCabn && !hasCabn) {
			dispatch(
				removeService({
					passengerId,
					lfid: Number(currentLfid),
					serviceID: service.serviceID,
					ssrCode: service.ssrCode,
				})
			);
		}

		if (!hadCabn && hasCabn) {
			const applicableAmount =
				service?.bundleCode === "NOBN" ||
				bundleCodeToBundleIdMap[service?.bundleCode as BundleCode] === "VALUE"
					? service?.amount
					: 0;
			dispatchAddService({
				dispatch,
				passengerId,
				currentLfid,
				service: { ...service, applicableAmount },
			});
		}

		return;
	}

	// Handle quantity-based changes (sports, checked-in)
	dispatchQuantityChanges({
		dispatch,
		passengerId,
		currentLfid,
		originalMap: original as SportsEquipmentMap | CheckedInBaggageMap,
		updatedMap: updated as SportsEquipmentMap | CheckedInBaggageMap,
		changeType,
		ssrCodeFilter,
	});
};

// ................... For Default selection ...........................
export const hasBaggageService = ({
	services,
	lfid,
	ssrCode,
	categoryId,
}: {
	services: PassengerService[] | undefined;
	lfid: number;
	ssrCode: string;
	categoryId: BaggageCategoryId;
}): boolean =>
	(services ?? []).some(
		(service) =>
			service.lfid === lfid && service.ssrCode === ssrCode && service.categoryId === categoryId
	);

export const getDefaultBaggageActions = ({
	currentLfid,
	currentPfid,
	servicePassengers,
	orderedPassengersWithNames,
}: GetDefaultBaggageActionsParams) => {
	const actions = [];

	for (const servicePassenger of servicePassengers) {
		const passenger = orderedPassengersWithNames.find(
			(item: (typeof orderedPassengersWithNames)[number]) => item.id === servicePassenger.id
		);

		if (!passenger) {
			continue;
		}

		const bundleId = bundleCodeToBundleIdMap[servicePassenger.bundleCode as BundleCode];
		const isDefaultBaggageBundle = bundleId in DEFAULT_BAGGAGE_BY_BUNDLE;

		if (!isDefaultBaggageBundle) {
			continue;
		}

		const servicesToAdd = DEFAULT_BAGGAGE_BY_BUNDLE[bundleId as DefaultBaggageBundle];
		const existingBaggageServices = passenger.services?.baggage;

		for (const { ssrCode, categoryId } of servicesToAdd) {
			const serviceAlreadyExists = hasBaggageService({
				services: existingBaggageServices,
				lfid: currentLfid,
				ssrCode,
				categoryId,
			});

			if (serviceAlreadyExists) {
				continue;
			}

			actions.push(
				addService({
					passengerId: passenger.id,
					lfid: currentLfid,
					serviceCategory: "baggage",
					service: normalizeBaggageServiceForAdd({
						categoryId: categoryId as BaggageCategoryId,
						ssrCode,
						lfid: currentLfid,
						pfid: currentPfid ?? 0,
						passengerType: servicePassenger.passengerTypeCode,
						cutOffHours: 0,
						description: "",
						maxCountServiceLevel: 0,
						qtyAvailable: 0,
						serviceID: 0,
						chargeComment: "",
						amount: 0,
						...(servicePassenger.bundleCode ? { bundleCode: servicePassenger.bundleCode } : {}),
						applicableAmount: 0,
					}),
				})
			);
		}
	}

	return actions;
};
