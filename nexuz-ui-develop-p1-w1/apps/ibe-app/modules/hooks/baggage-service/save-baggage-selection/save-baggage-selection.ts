/**
 * File: save-baggage-selection.ts
 * Description: main hook for saving baggage selections for a passenger.
 * It handles the logic for validating baggage selections, comparing segment selections, and dispatching changes to the store. It also manages the state for segment mismatch dialogs and validation messages.
 */

import { useTranslations } from "next-intl";
import { useCallback, useRef } from "react";
import { buildBaggageCategories } from "@/modules/utils/helpers/baggage-service/baggage-categories/baggage-categories";
import { dispatchBaggageChanges } from "@/modules/utils/helpers/baggage-service/baggage-selection-utils/baggage-selection-utils";
import {
	compareSegmentSelections,
	hasAnyBaggageSelection,
	hasCabn,
} from "@/modules/utils/helpers/baggage-service/baggage-validation/baggage-validation";
import { buildPassengerBaggageServicesFromSelection } from "@/modules/utils/helpers/baggage-service/build-baggage-selection/build-baggage-selection";
import type { AppDispatch } from "@/store";
import type {
	BaggageOffersByPTCType,
	BaggageSelectionValues,
	PassengerBaggageSelectionMap,
	PassengerWithBaggageSelection,
} from "@/types/baggage-selection/baggage-selection.types";

export const useSavePassengerBaggageSelection = ({
	selectedPassengerId,
	selectedPassenger,
	editingSelection,
	currentLfid,
	baggageOffersByPassengerType,
	editingSelectionPrice,
	isConnectingFlight,
	stageLabel,
	otherSegmentSelections,
	acknowledgedSegmentMismatch,
	dispatch,
	handleBackToPassengerList,
	setBaggageSelections,
	setSegmentValidationMessage,
	setIsSegmentMismatchDialogOpen,
	setAcknowledgedSegmentMismatch,
}: {
	selectedPassengerId: string | null;
	selectedPassenger: PassengerWithBaggageSelection | null | undefined;
	editingSelection: BaggageSelectionValues | null;
	currentLfid: number | undefined;
	baggageOffersByPassengerType: Record<string, BaggageOffersByPTCType>;
	editingSelectionPrice: number;
	isConnectingFlight: boolean;
	stageLabel: string;
	otherSegmentSelections: PassengerBaggageSelectionMap;
	acknowledgedSegmentMismatch: boolean;
	dispatch: AppDispatch;
	handleBackToPassengerList: () => void;
	setBaggageSelections: (
		value:
			| PassengerBaggageSelectionMap
			| ((prev: PassengerBaggageSelectionMap) => PassengerBaggageSelectionMap)
	) => void;
	setSegmentValidationMessage: (message: string | null) => void;
	setIsSegmentMismatchDialogOpen: (open: boolean) => void;
	setAcknowledgedSegmentMismatch: (acknowledged: boolean) => void;
}) => {
	const baggageServiceLabels = useTranslations("baggage_service");
	const baggageValidationRef = useRef<() => boolean>(() => true);

	const savePassengerBaggageSelection = useCallback(() => {
		if (
			!selectedPassengerId ||
			!selectedPassenger ||
			!editingSelection ||
			currentLfid === undefined
		) {
			return;
		}

		if (!baggageValidationRef.current()) {
			return;
		}
		setSegmentValidationMessage(null);
		const baggageServices = buildPassengerBaggageServicesFromSelection({
			baggageOffersByPassengerType,
			selection: editingSelection,
			selectedPassenger,
		});
		const previousBaggageServices = selectedPassenger.baggageServices;

		const updatedPassengerSelection = {
			passenger: selectedPassenger.passenger,
			baggageServices,
			categories: buildBaggageCategories({
				passenger: selectedPassenger.passenger,
				baggageServices,
			}),
			totalPrice: editingSelectionPrice,
		};
		if (isConnectingFlight && stageLabel === "Segment 2") {
			const otherSelection = otherSegmentSelections[selectedPassengerId];
			const shouldCompare = otherSelection && hasAnyBaggageSelection(otherSelection);
			const hasCurrentSelection = hasAnyBaggageSelection(updatedPassengerSelection);

			if (shouldCompare) {
				const comparison = compareSegmentSelections(updatedPassengerSelection, otherSelection);

				if (comparison.hasCurrentGreater && !acknowledgedSegmentMismatch) {
					setIsSegmentMismatchDialogOpen(true);
					return;
				}

				if (comparison.hasOtherGreater) {
					setSegmentValidationMessage(
						baggageServiceLabels("error_labels.error_description_segment_mismatch")
					);
					return;
				}
			} else if (!acknowledgedSegmentMismatch && hasCurrentSelection) {
				setIsSegmentMismatchDialogOpen(true);
				return;
			}
		}

		const passengerId = selectedPassenger.passenger.id;

		const originalHasCabn = hasCabn(previousBaggageServices.carryOn);
		const updatedHasCabn = hasCabn(baggageServices.carryOn);
		const carryOnService = baggageServices.carryOn.CABN ?? previousBaggageServices.carryOn.CABN;

		dispatchBaggageChanges({
			dispatch,
			passengerId,
			currentLfid,
			changeType: "carry-on",
			original: originalHasCabn,
			updated: updatedHasCabn,
			service: carryOnService,
		});

		dispatchBaggageChanges({
			dispatch,
			passengerId,
			currentLfid,
			changeType: "checked-in",
			original: previousBaggageServices.checkedIn,
			updated: baggageServices.checkedIn,
			ssrCodeFilter: "BAGN",
		});

		dispatchBaggageChanges({
			dispatch,
			passengerId,
			currentLfid,
			changeType: "sports",
			original: previousBaggageServices.sportsEquipment,
			updated: baggageServices.sportsEquipment,
		});

		setBaggageSelections((previousSelections) => ({
			...previousSelections,
			[passengerId]: updatedPassengerSelection,
		}));

		setAcknowledgedSegmentMismatch(false);
		setIsSegmentMismatchDialogOpen(false);

		handleBackToPassengerList();
	}, [
		selectedPassengerId,
		selectedPassenger,
		editingSelection,
		currentLfid,
		baggageOffersByPassengerType,
		editingSelectionPrice,
		isConnectingFlight,
		stageLabel,
		otherSegmentSelections,
		acknowledgedSegmentMismatch,
		dispatch,
		handleBackToPassengerList,
		setBaggageSelections,
		setSegmentValidationMessage,
		setIsSegmentMismatchDialogOpen,
		baggageServiceLabels,
		setAcknowledgedSegmentMismatch,
	]);

	return { savePassengerBaggageSelection, baggageValidationRef };
};
