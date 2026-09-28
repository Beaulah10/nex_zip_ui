import { useMemo } from "react";
import { usePrimaryPassenger } from "@/modules/hooks/common/primary-passenger/primary-passenger";
import { useAppSelector } from "@/store/hooks";
import type { PassengerValues } from "@/types/passenger/passenger.type";

const ADULT_PASSENGER_TYPE = "adult";
const REMAINING_PASSENGER_TYPE_ORDER = ["childA", "childB", "childC", "infant"] as const;

/** Returns passengerOrder for child/infant passenger type ordering. */
const getPassengerTypeOrder = (passengerTypeCode?: string) => {
	const passengerOrder = REMAINING_PASSENGER_TYPE_ORDER.indexOf(
		(passengerTypeCode ?? "") as (typeof REMAINING_PASSENGER_TYPE_ORDER)[number]
	);

	return passengerOrder;
};

/** Display the primary passenger first, followed by their associated child/infant passengers.
 *  Then display each remaining adult passenger with their associated child/infant passengers. */
const sortPassengersByConfiguredOrder = (
	passengers: PassengerValues[],
	originalIndexById: Map<string, number>
) =>
	[...passengers].sort((firstPassenger, secondPassenger) => {
		const firstPassengerOrder = getPassengerTypeOrder(firstPassenger.passengerTypeCode);
		const secondPassengerOrder = getPassengerTypeOrder(secondPassenger.passengerTypeCode);

		if (firstPassengerOrder !== secondPassengerOrder) {
			return firstPassengerOrder - secondPassengerOrder;
		}

		return (
			(originalIndexById.get(firstPassenger.id) ?? 0) -
			(originalIndexById.get(secondPassenger.id) ?? 0)
		);
	});

/**
 * Builds ordered passenger lists for display.
 */
export const usePassengerOrder = () => {
	const passengerNameList = useAppSelector((state) => state.passenger?.passengers ?? []);
	const { primaryPassengerId } = usePrimaryPassenger();

	const orderedPassengers = useMemo(() => {
		if (passengerNameList.length <= 1) {
			return passengerNameList;
		}

		const originalIndexById = new Map(
			passengerNameList.map((passenger, index) => [passenger.id, index])
		);
		/** Maps passenger id to its associated adult passenger id. */
		const accompanyingAdultByPassengerId = new Map(
			passengerNameList.map((passenger: PassengerValues) => [
				passenger.id,
				passenger.associateWithPassengerId?.trim() ?? "",
			])
		);
		const adults = passengerNameList.filter(
			(passenger) => passenger.passengerTypeCode === ADULT_PASSENGER_TYPE
		);
		const nonAdultPassenger = passengerNameList.filter(
			(passenger) => passenger.passengerTypeCode !== ADULT_PASSENGER_TYPE
		);

		/** Groups child/infant passengers by their associated adult id. */
		const dependentsByAdultId = new Map<string, PassengerValues[]>();

		for (const passenger of nonAdultPassenger) {
			const accompanyingAdultId = accompanyingAdultByPassengerId.get(passenger.id) ?? "";

			if (!accompanyingAdultId) {
				continue;
			}

			const currentPassengers = dependentsByAdultId.get(accompanyingAdultId) ?? [];
			currentPassengers.push(passenger);
			dependentsByAdultId.set(accompanyingAdultId, currentPassengers);
		}

		/** Stores passengers in their final display order. */
		const orderedList: PassengerValues[] = [];
		/** Checks passengers already added to avoid duplicates. */
		const addedPassengerIds = new Set<string>();

		/** Adds a passenger to the ordered list only if not already added. */
		const addUniquePassenger = (passenger?: PassengerValues) => {
			if (!passenger || addedPassengerIds.has(passenger.id)) {
				return;
			}

			orderedList.push(passenger);
			addedPassengerIds.add(passenger.id);
		};
		/** Adds an adult passenger followed by their associated child/infant passengers. */
		const accompanyingPassenger = (adultPassenger?: PassengerValues) => {
			if (!adultPassenger) {
				return;
			}

			addUniquePassenger(adultPassenger);

			const passengerAssociatedWithAdult = sortPassengersByConfiguredOrder(
				dependentsByAdultId.get(adultPassenger.id) ?? [],
				originalIndexById
			);

			for (const dependentPassenger of passengerAssociatedWithAdult) {
				addUniquePassenger(dependentPassenger);
			}
		};

		const primaryAdultPassenger =
			adults.find((adultPassenger) => adultPassenger.id === primaryPassengerId) ?? adults[0];

		accompanyingPassenger(primaryAdultPassenger);

		for (const adultPassenger of adults) {
			if (adultPassenger.id === primaryAdultPassenger?.id) {
				continue;
			}

			if ((dependentsByAdultId.get(adultPassenger.id) ?? []).length === 0) {
				continue;
			}

			accompanyingPassenger(adultPassenger);
		}

		for (const adultPassenger of adults) {
			addUniquePassenger(adultPassenger);
		}

		const remainingNonAdults = sortPassengersByConfiguredOrder(
			nonAdultPassenger.filter((passenger) => !addedPassengerIds.has(passenger.id)),
			originalIndexById
		);

		for (const passenger of remainingNonAdults) {
			addUniquePassenger(passenger);
		}

		for (const passenger of passengerNameList) {
			addUniquePassenger(passenger);
		}

		return orderedList;
	}, [passengerNameList, primaryPassengerId]);

	const orderedPassengersWithNames = useMemo(() => {
		const passengerNameById = new Map(
			passengerNameList.map((passenger: PassengerValues) => [passenger.id, passenger])
		);

		return orderedPassengers.map((passenger) => {
			const passengerName = passengerNameById.get(passenger.id);

			return {
				...passenger,
				firstName: passengerName?.firstName ?? "",
				lastName: passengerName?.lastName ?? "",
				mappedAdultId: passengerName?.associateWithPassengerId ?? "",
			};
		});
	}, [orderedPassengers, passengerNameList]);

	return {
		orderedPassengers,
		orderedPassengersWithNames,
	};
};
