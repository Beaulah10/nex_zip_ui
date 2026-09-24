/**
 * File: baggage-selection-state.ts
 * Description: main hook for managing baggage selection state. It tracks the baggage selections for all passengers, the currently selected passenger, and the editing selection.
 * It provides functions to update the state based on user interactions and dialog visibility.
 */

import { useEffect, useState } from "react";
import type {
	BaggageSelectionValues,
	PassengerBaggageSelectionMap,
} from "@/types/baggage-selection/baggage-selection.types";

export const useBaggageSelectionState = (
	baggageSelectionsForAllPassengers: PassengerBaggageSelectionMap,
	openBaggageDialog: boolean
) => {
	const [baggageSelections, setBaggageSelections] = useState<PassengerBaggageSelectionMap>(
		baggageSelectionsForAllPassengers
	);

	const [selectedPassengerId, setSelectedPassengerId] = useState<string | null>(null);

	const [editingSelection, setEditingSelection] = useState<BaggageSelectionValues | null>(null);

	useEffect(() => {
		if (!openBaggageDialog || selectedPassengerId !== null) {
			return;
		}

		setBaggageSelections(baggageSelectionsForAllPassengers);
	}, [openBaggageDialog, baggageSelectionsForAllPassengers, selectedPassengerId]);

	return {
		baggageSelections,
		setBaggageSelections,

		selectedPassengerId,
		setSelectedPassengerId,

		editingSelection,
		setEditingSelection,
	};
};
