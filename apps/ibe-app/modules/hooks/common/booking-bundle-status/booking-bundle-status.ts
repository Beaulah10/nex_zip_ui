import { useMemo } from "react";
import type { BookingFlowDirection } from "@/modules/utils/helpers/common/flow-router/flow-router";
import { useServicePassengers } from "../service-passengers/service-passengers";

export type BookingBundleStatus = "Bundle" | "NoBundle";

const BUNDLE_INCLUDED_LABELS = new Set(["Value", "Premium", "Flex Biz"]);

/**
 * Resolves current-direction bundle status for the whole booking.
 * Returns "Bundle" when any passenger has Value, Premium, or Flex Biz
 * on the currently selected direction segments; otherwise returns "NoBundle".
 */
export function useBookingBundleStatus(direction: BookingFlowDirection): BookingBundleStatus {
	const { servicePassengers } = useServicePassengers(direction);

	return useMemo(
		() =>
			servicePassengers.some((passenger) => BUNDLE_INCLUDED_LABELS.has(passenger.bundleLabel))
				? "Bundle"
				: "NoBundle",
		[servicePassengers]
	);
}
