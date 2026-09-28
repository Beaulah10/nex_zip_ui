import { useMemo } from "react";
import type { selectCustomersListItem } from "@/components/common/select-customers/select-customers";

/**
 * Represents a passenger used in accompanying passenger selection logic.
 *
 * Includes only the properties required to determine selection state
 * and passenger relationships (e.g., adult-child mappings).
 */
type AccompanyingSelectionPassenger = Pick<
	selectCustomersListItem,
	"id" | "checked" | "passengerTypeCode" | "mappedAdultId"
>;

/**
 * Configuration options for accompanying passenger auto-selection behavior.
 */
type AccompanyingSelectionConfig = {
	/**
	 * Passenger types that should be automatically selected when
	 * accompanying passenger rules are applied.
	 */
	autoSelectPassengerTypes: Iterable<string>;

	/**
	 * Optional function to normalize passenger type codes before
	 * evaluating selection rules.
	 *
	 * @param passengerTypeCode - Raw passenger type code.
	 * @returns Normalized passenger type code.
	 */
	normalizePassengerTypeCode?: (passengerTypeCode?: string) => string;

	/**
	 * When true, only primary passengers without a mapped adult
	 * relationship are eligible for auto-selection.
	 *
	 * @default false
	 */
	primaryRequiresNoMappedAdult?: boolean;
};

/**
 * Parameters for toggling the selection state of a single primary passenger.
 */
type TogglePrimarySelectionParams<TPassenger extends AccompanyingSelectionPassenger> = {
	/** Full list of passengers to operate on. */
	passengers: TPassenger[];
	/** ID of the passenger whose selection should be toggled. */
	targetId: string;
	/** The desired checked state to apply to the target passenger. */
	nextChecked: boolean;
	/** Maximum number of primary passengers that may be selected, or null for unlimited. */
	stockLimit: number | null;
};

/**
 * Parameters for toggling the selection state of all primary passengers at once.
 */
type TogglePrimarySelectAllParams<TPassenger extends AccompanyingSelectionPassenger> = {
	/** Full list of passengers to operate on. */
	passengers: TPassenger[];
	/** Whether all primary passengers should be selected or deselected. */
	nextChecked: boolean;
	/** Maximum number of primary passengers that may be selected, or null for unlimited. */
	stockLimit: number | null;
};

/**
 * Collection of helper functions returned by {@link createAccompanyingSelectionHelpers}.
 */
type AccompanyingSelectionHelpers = {
	/** Returns true if the given passenger type code is automatically selected (e.g. infant). */
	isAutoSelectedPassengerType: (passengerTypeCode?: string) => boolean;
	/** Returns the number of checked primary passengers in the list. */
	getSelectedPrimaryPassengerCount: <TPassenger extends AccompanyingSelectionPassenger>(
		passengers: TPassenger[]
	) => number;
	/** Ensures accompanying passengers mirror the checked state of their mapped adult. */
	syncAccompanyingPassengers: <TPassenger extends AccompanyingSelectionPassenger>(
		passengers: TPassenger[]
	) => TPassenger[];
	/** Toggles the selection of a single primary passenger, enforcing stock limits. */
	togglePrimaryPassengerSelection: <TPassenger extends AccompanyingSelectionPassenger>(
		params: TogglePrimarySelectionParams<TPassenger>
	) => TPassenger[];
	/** Selects or deselects all primary passengers, respecting stock limits. */
	toggleSelectAllPrimaryPassengers: <TPassenger extends AccompanyingSelectionPassenger>(
		params: TogglePrimarySelectAllParams<TPassenger>
	) => TPassenger[];
};

/**
 * Creates helpers to auto-select accompanying passengers (for example infant/childC)
 * whenever their mapped adult passenger is selected.
 */
export function createAccompanyingSelectionHelpers({
	autoSelectPassengerTypes,
	normalizePassengerTypeCode = (value) => value?.toLowerCase() ?? "",
	primaryRequiresNoMappedAdult = false,
}: AccompanyingSelectionConfig): AccompanyingSelectionHelpers {
	const normalizedAutoSelectTypes = new Set(
		Array.from(autoSelectPassengerTypes, (passengerTypeCode) =>
			normalizePassengerTypeCode(passengerTypeCode)
		)
	);

	/**
	 * Returns true if the given passenger type code belongs to the auto-selected set
	 * (e.g. infants that are always selected alongside their mapped adult).
	 */
	const isAutoSelectedPassengerType = (passengerTypeCode?: string) =>
		normalizedAutoSelectTypes.has(normalizePassengerTypeCode(passengerTypeCode));

	/**
	 * Returns true if the passenger is a primary (manually selectable) passenger —
	 * i.e. not an auto-selected type, and (when required) has no mapped adult.
	 */
	const isPrimaryPassenger = (passenger: AccompanyingSelectionPassenger) =>
		!isAutoSelectedPassengerType(passenger.passengerTypeCode) &&
		(!primaryRequiresNoMappedAdult || !passenger.mappedAdultId);

	/**
	 * Counts how many primary passengers in the list are currently checked.
	 */
	const getSelectedPrimaryPassengerCount = <TPassenger extends AccompanyingSelectionPassenger>(
		passengers: TPassenger[]
	): number =>
		passengers.filter((passenger) => passenger.checked && isPrimaryPassenger(passenger)).length;

	/**
	 * Syncs the checked state of auto-selected passengers (e.g. infants) to match
	 * their mapped adult. Passengers without a mappedAdultId are left unchanged.
	 */
	const syncAccompanyingPassengers = <TPassenger extends AccompanyingSelectionPassenger>(
		passengers: TPassenger[]
	): TPassenger[] => {
		const checkedPrimaryIds = new Set(
			passengers
				.filter((passenger) => passenger.checked && isPrimaryPassenger(passenger))
				.map((passenger) => passenger.id)
		);

		return passengers.map((passenger) => {
			if (!isAutoSelectedPassengerType(passenger.passengerTypeCode)) {
				return passenger;
			}

			if (!passenger.mappedAdultId) {
				return passenger;
			}

			const shouldBeChecked = checkedPrimaryIds.has(passenger.mappedAdultId);
			if (passenger.checked === shouldBeChecked) {
				return passenger;
			}

			return {
				...passenger,
				checked: shouldBeChecked,
			};
		});
	};

	/**
	 * Toggles the checked state of a single primary passenger identified by `targetId`.
	 * Respects the stock limit — prevents selection when the limit is already reached.
	 * Automatically syncs accompanying passengers after the change.
	 */
	const togglePrimaryPassengerSelection = <TPassenger extends AccompanyingSelectionPassenger>({
		passengers,
		targetId,
		nextChecked,
		stockLimit,
	}: TogglePrimarySelectionParams<TPassenger>): TPassenger[] => {
		const targetPassenger = passengers.find((passenger) => passenger.id === targetId);
		if (!targetPassenger || !isPrimaryPassenger(targetPassenger)) {
			return passengers;
		}

		if (!nextChecked) {
			return syncAccompanyingPassengers(
				passengers.map((passenger) =>
					passenger.id === targetId ? { ...passenger, checked: false } : passenger
				)
			);
		}

		if (
			stockLimit !== null &&
			!targetPassenger.checked &&
			getSelectedPrimaryPassengerCount(passengers) >= stockLimit
		) {
			return passengers;
		}

		return syncAccompanyingPassengers(
			passengers.map((passenger) =>
				passenger.id === targetId ? { ...passenger, checked: true } : passenger
			)
		);
	};

	/**
	 * Selects or deselects all primary passengers at once.
	 * When selecting, fills available slots up to `stockLimit` in list order.
	 * Automatically syncs accompanying passengers after the change.
	 */
	const toggleSelectAllPrimaryPassengers = <TPassenger extends AccompanyingSelectionPassenger>({
		passengers,
		nextChecked,
		stockLimit,
	}: TogglePrimarySelectAllParams<TPassenger>): TPassenger[] => {
		if (!nextChecked) {
			return syncAccompanyingPassengers(
				passengers.map((passenger) =>
					isPrimaryPassenger(passenger) ? { ...passenger, checked: false } : passenger
				)
			);
		}

		if (stockLimit === null) {
			return syncAccompanyingPassengers(
				passengers.map((passenger) =>
					isPrimaryPassenger(passenger) ? { ...passenger, checked: true } : passenger
				)
			);
		}

		let remainingSlots = Math.max(stockLimit - getSelectedPrimaryPassengerCount(passengers), 0);

		return syncAccompanyingPassengers(
			passengers.map((passenger) => {
				if (!isPrimaryPassenger(passenger)) {
					return passenger;
				}

				if (passenger.checked || remainingSlots <= 0) {
					return passenger;
				}

				remainingSlots -= 1;
				return { ...passenger, checked: true };
			})
		);
	};

	return {
		isAutoSelectedPassengerType,
		getSelectedPrimaryPassengerCount,
		syncAccompanyingPassengers,
		togglePrimaryPassengerSelection,
		toggleSelectAllPrimaryPassengers,
	};
}

/**
 * Hook wrapper for accompanying-passenger selection helpers.
 */
export function useAccompanyingSelectionHelpers(
	config: AccompanyingSelectionConfig
): AccompanyingSelectionHelpers {
	const { autoSelectPassengerTypes, normalizePassengerTypeCode, primaryRequiresNoMappedAdult } =
		config;

	return useMemo(
		() =>
			createAccompanyingSelectionHelpers({
				autoSelectPassengerTypes,
				normalizePassengerTypeCode,
				primaryRequiresNoMappedAdult,
			}),
		[autoSelectPassengerTypes, normalizePassengerTypeCode, primaryRequiresNoMappedAdult]
	);
}
