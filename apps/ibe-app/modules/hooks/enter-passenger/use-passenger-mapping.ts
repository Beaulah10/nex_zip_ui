import { useMemo } from "react";
import type { PassengerFormValues } from "@/modules/utils/validations/passenger.schema/passenger.schema";
import type { PassengerSection, PassengerValues } from "@/types/passenger/passenger.type";

export const usePassengerMapping = ({
	processedPassengerSections,
	savedPassengers,
}: {
	processedPassengerSections: PassengerSection[];
	savedPassengers: PassengerValues[];
}): PassengerFormValues =>
	useMemo(() => {
		// Group saved passengers by passengerTypeCode, preserving the original order within each type.
		const savedByType = new Map<string, PassengerValues[]>();
		for (const passenger of savedPassengers) {
			const list = savedByType.get(passenger.passengerTypeCode) ?? [];
			list.push(passenger);
			savedByType.set(passenger.passengerTypeCode, list);
		}
		const typeIndexCounter = new Map<string, number>();

		// Build the set of adult IDs in the current sections to validate associations.
		const newAdultIds = new Set(
			processedPassengerSections
				.filter((section) => section.passengerTypeCode === "adult")
				.map((section) => section.id)
		);

		return {
			passengers: processedPassengerSections.map((section) => {
				const passengerListType = savedByType.get(section.passengerTypeCode) ?? [];
				const passengerTypeIndex = typeIndexCounter.get(section.passengerTypeCode) ?? 0;
				const savedPassenger = passengerListType[passengerTypeIndex];
				typeIndexCounter.set(section.passengerTypeCode, passengerTypeIndex + 1);

				const savedAdultRef = savedPassenger?.associateWithPassengerId;
				const accompanyingAdult =
					savedAdultRef && newAdultIds.has(savedAdultRef) ? savedAdultRef : undefined;

				return {
					id: section.id,
					lastName: savedPassenger?.lastName ?? "",
					firstName: savedPassenger?.firstName ?? "",
					accompanyingAdult,
					hasAccompanyingAdult: section.hasAccompanyingAdult,
					passengerTypeCode: section.passengerTypeCode,
				};
			}),
		};
	}, [processedPassengerSections, savedPassengers]);
