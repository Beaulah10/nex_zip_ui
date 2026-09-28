/**
 * File: use-confirmation-baggage.ts
 * Description: Custom hook for managing baggage selection and errors on the confirmation page.
 * Provides functions to open baggage dialogs, handle errors, and process baggage offers.
 */

import type { useTranslations } from "next-intl";
import { BAGGAGE_INVENTORY_TYPE } from "@/modules/utils/constants/confirmation/confirmation.constants";
import { getAirportRouteLabel } from "@/modules/utils/helpers/airport";
import { getBaggageOffersByPassengerType } from "@/modules/utils/helpers/baggage-service/baggage-offers/baggage-offers";
import { flattenPassengerServicesByCategory } from "@/modules/utils/helpers/baggage-service/build-baggage-selection/build-baggage-selection";
import { getAncillaryOffersErrorCodeFromBoundaryError } from "@/modules/utils/helpers/common/ancillary-error-code/ancillary.errors";
import {
	type BookingFlowDirection,
	getBookingDirectionLabel,
	getBookingStageSegment,
} from "@/modules/utils/helpers/common/flow-router/flow-router";
import { getSelectedAncillarySegment } from "@/modules/utils/helpers/common/get-ancillary-segment/get-ancillary-segment";
import {
	getGroupedContentSuffix,
	resolveConfirmationBaggageInventory,
} from "@/modules/utils/helpers/confirmation/confirmation-baggage/baggage-availability/baggage-availability/baggage-availability";
import {
	applyBaggageShortageChanges,
	outOfStockValidationForUpdatedServices,
	removeAllBaggageServicesForPassengers,
} from "@/modules/utils/helpers/confirmation/confirmation-baggage/baggage-helpers/baggage-helpers";
import { useAppSelector } from "@/store/hooks";
import {
	buildRetrieveOfferAncillariesRequest,
	fetchAncillaryOffers,
} from "@/store/slices/common/ancillary-offers/ancillary-offers";
import {
	saveConfirmationDisabledFlags,
	selectConfirmationDisabledFlags,
} from "@/store/slices/confirmation/confirmation-disabled-flags.slice";
import { removeService } from "@/store/slices/passenger/passenger.slice";
import type { BaggageOffersByPTCType } from "@/types/baggage-selection/baggage-selection.types";
import type { UseConfirmationBaggageParams } from "@/types/confirmation/confirmation.types";
export type BaggageTranslations = ReturnType<typeof useTranslations<"baggage_service">>;
export type AncillaryTranslations = ReturnType<typeof useTranslations<"ancillary_service">>;

export function useConfirmationBaggage({
	dispatch,
	confirmedFlight,
	passengerList,
	storedPassengers,
	orderedPassengersWithNames,
	outboundServicePassengers,
	inboundServicePassengers,
	baggageErrorState,
	setBaggageDialogState,
	setBaggageErrorState,
	setIsServiceLoading,
	baggageServiceT,
	ancillaryServiceT,
	returnToTop,
}: UseConfirmationBaggageParams) {
	const persistedDisabledFlags = useAppSelector(selectConfirmationDisabledFlags);
	const openBaggageDialog = (passengerId: string, direction: BookingFlowDirection) => {
		if (!confirmedFlight) {
			return;
		}

		const selectedSegment = getSelectedAncillarySegment({ confirmedFlight, direction });

		if (!selectedSegment) {
			return;
		}

		setBaggageDialogState({
			open: true,
			passengerId,
			direction,
			stageLabel: getBookingDirectionLabel({ confirmedFlight, direction }),
			routeLabel: getAirportRouteLabel([selectedSegment]),
		});
	};

	const openBaggageServiceUnavailableError = () => {
		setBaggageErrorState({
			open: true,
			title: ancillaryServiceT("service_unavailable_session_title"),
			content: ancillaryServiceT("service_unavailable_session_message"),
			action: "returnToTop",
			pendingBaggageDialogPassenger: null,
		});
	};

	const openBaggageBundleOutOfStockError = () => {
		setBaggageErrorState({
			open: true,
			title: baggageServiceT("dialog_title_bundle_out_of_stock"),
			content: baggageServiceT("dialog_content_bundle_out_of_stock"),
			buttonLabel: baggageServiceT("button_return_to_top"),
			action: "returnToTop",
			pendingBaggageDialogPassenger: null,
		});
	};

	const openNoBundleBaggageOutOfStockError = () => {
		setBaggageErrorState({
			open: true,
			title: baggageServiceT("dialog_title_no_bundle_out_of_stock"),
			content: baggageServiceT("dialog_content_no_bundle_out_of_stock"),
			buttonLabel: ancillaryServiceT("dialog_button_ok"),
			action: "close",
			pendingBaggageDialogPassenger: null,
		});
	};

	const handleFetchedBaggageOffers = ({
		passengerId,
		direction,
		currentLfid,
		baggageOffersByPassengerType,
	}: {
		passengerId: string;
		direction: BookingFlowDirection;
		currentLfid: number;
		baggageOffersByPassengerType: Record<string, BaggageOffersByPTCType>;
	}) => {
		const servicePassengers =
			direction === "outbound" ? outboundServicePassengers : inboundServicePassengers;
		const inventoryResolution = resolveConfirmationBaggageInventory({
			passengerList: storedPassengers,
			servicePassengers,
			currentLfid,
			orderedPassengerIds: orderedPassengersWithNames.map((passenger) => passenger.id),
			baggageOffersByPassengerType,
		});

		if (inventoryResolution.type === BAGGAGE_INVENTORY_TYPE.NO_BUNDLE_OUT_OF_STOCK) {
			removeAllBaggageServicesForPassengers({
				dispatch,
				baggageSelectionsByPassengerId: inventoryResolution.baggageSelectionsByPassengerId,
				currentLfid,
			});
			dispatch(
				saveConfirmationDisabledFlags({
					baggage: {
						...persistedDisabledFlags.baggage,
						[direction]: inventoryResolution.disabledPassengerIds,
					},
				})
			);
			openNoBundleBaggageOutOfStockError();
			return;
		}

		if (inventoryResolution.type === BAGGAGE_INVENTORY_TYPE.BUNDLE_OUT_OF_STOCK) {
			removeAllBaggageServicesForPassengers({
				dispatch,
				baggageSelectionsByPassengerId: inventoryResolution.baggageSelectionsByPassengerId,
				currentLfid,
			});
			openBaggageBundleOutOfStockError();
			return;
		}

		if (inventoryResolution.type === BAGGAGE_INVENTORY_TYPE.SELECTED_BAGGAGE_UNAVAILABLE) {
			const isOutOfStock = outOfStockValidationForUpdatedServices({
				updatedBaggageServicesByPassengerId:
					inventoryResolution.updatedBaggageServicesByPassengerId,
				baggageSelectionsByPassengerId: inventoryResolution.baggageSelectionsByPassengerId,
			});
			if (isOutOfStock) {
				removeAllBaggageServicesForPassengers({
					dispatch,
					baggageSelectionsByPassengerId: inventoryResolution.baggageSelectionsByPassengerId,
					currentLfid,
				});
				openBaggageBundleOutOfStockError();
				return;
			}
			applyBaggageShortageChanges({
				dispatch,
				baggageSelectionsByPassengerId: inventoryResolution.baggageSelectionsByPassengerId,
				updatedBaggageServicesByPassengerId:
					inventoryResolution.updatedBaggageServicesByPassengerId,
				currentLfid,
			});

			const unavailableBaggageByPassenger = getGroupedContentSuffix(
				inventoryResolution.unavailableBaggage
			);
			const contentSuffix = Array.from(unavailableBaggageByPassenger.values())
				.map(
					({ baggageName, quantity, passengerName }) =>
						`${baggageServiceT(baggageName)} x ${quantity}: ${passengerName}`
				)
				.join("\n");

			setBaggageErrorState({
				open: true,
				title: baggageServiceT("dialog_title_stock_shortage"),
				content: contentSuffix
					? `${baggageServiceT("dialog_content_stock_shortage")}\n\n${contentSuffix}`
					: baggageServiceT("dialog_content_stock_shortage"),
				buttonLabel: baggageServiceT("button_ok"),
				action: "close",
				pendingBaggageDialogPassenger: null,
				affectedPassengerId: inventoryResolution.firstAffectedPassengerId,
				affectedDirection: direction,
			});
			return;
		}

		openBaggageDialog(passengerId, direction);
	};

	const handleBaggageChange = async (passengerId: string, direction: BookingFlowDirection) => {
		if (!confirmedFlight) {
			return;
		}

		setIsServiceLoading(true);

		try {
			const selectedSegment = getSelectedAncillarySegment({
				confirmedFlight,
				direction,
			});

			if (!selectedSegment) {
				return;
			}

			let request: ReturnType<typeof buildRetrieveOfferAncillariesRequest>;

			try {
				request = buildRetrieveOfferAncillariesRequest({
					confirmedFlight,
					segment: selectedSegment,
					passengers: passengerList,
					serviceCategory: "BAGGAGE",
				});
			} catch {
				openBaggageServiceUnavailableError();
				return;
			}

			const scope = getBookingStageSegment({ confirmedFlight, direction });
			const resultAction = await dispatch(
				fetchAncillaryOffers({
					scope,
					request,
				})
			);

			if (fetchAncillaryOffers.fulfilled.match(resultAction)) {
				const baggageOffersByPassengerType = getBaggageOffersByPassengerType(resultAction.payload);
				handleFetchedBaggageOffers({
					passengerId,
					direction,
					currentLfid: selectedSegment.lfid,
					baggageOffersByPassengerType,
				});
				return;
			}

			if (resultAction.meta.condition) {
				return;
			}
			if (fetchAncillaryOffers.rejected.match(resultAction)) {
				const ancillaryOffersErrorMessage = resultAction.payload ?? resultAction.error.message;
				const errorCode = getAncillaryOffersErrorCodeFromBoundaryError(
					ancillaryOffersErrorMessage ? new Error(ancillaryOffersErrorMessage) : undefined
				);

				if (errorCode === "NEXUZCMNE004") {
					const baggageServicesByPassenger = passengerList.flatMap((passenger) =>
						flattenPassengerServicesByCategory(passenger.services, "baggage").map((service) => ({
							passengerId: passenger.id,
							service,
						}))
					);
					const filteredServices =
						selectedSegment.lfid !== undefined
							? baggageServicesByPassenger.filter(
									(service) => service.service.lfid === selectedSegment.lfid
								)
							: [];
					for (const { passengerId, service } of filteredServices) {
						dispatch(
							removeService({
								passengerId,
								lfid: Number(selectedSegment.lfid),
								serviceID: service.serviceID,
								ssrCode: service.ssrCode,
							})
						);
					}
					const disabledPassengerIds: string[] = passengerList.map((passenger) => passenger.id);
					dispatch(
						saveConfirmationDisabledFlags({
							baggage: {
								...persistedDisabledFlags.baggage,
								[direction]: disabledPassengerIds,
							},
						})
					);
					openNoBundleBaggageOutOfStockError();
					return;
				}
				if (errorCode === "NEXUZR004E102") {
					openBaggageBundleOutOfStockError();
					return;
				}
				openBaggageServiceUnavailableError();
				return;
			}
			openBaggageServiceUnavailableError();
		} finally {
			setIsServiceLoading(false);
		}
	};

	const handleBaggageErrorDialogClose = () => {
		const shouldReturnToTop = baggageErrorState.action === "returnToTop";

		setBaggageErrorState((state) => ({
			...state,
			open: false,
			pendingBaggageDialogPassenger: null,
			affectedPassengerId: null,
			affectedDirection: null,
		}));

		if (shouldReturnToTop) {
			returnToTop();
			return;
		}
	};

	return {
		handleBaggageChange,
		handleBaggageErrorDialogClose,
	};
}
