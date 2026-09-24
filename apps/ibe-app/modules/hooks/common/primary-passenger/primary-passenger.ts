import { useMemo } from "react";
import type { RootState } from "@/store";
import { useAppSelector } from "@/store/hooks";
import type { PassengerValues } from "@/types/passenger/passenger.type";

/**
 * Returns the primary passenger (adult) and corresponding id from passenger slice.
 */
export const usePrimaryPassenger = () => {
	const passengerList =
		useAppSelector((state: RootState) => state.passenger?.passengers ?? []) ?? [];

	const primaryPassenger = useMemo(
		() => passengerList.find((p) => p.passengerTypeCode === "adult") as PassengerValues | undefined,
		[passengerList]
	);

	return {
		primaryPassenger,
		primaryPassengerId: primaryPassenger?.id,
	};
};
