"use client";

import { usePathname } from "next/navigation";
import { FlightMenuBar } from "@/components/common/flight-menu-bar/flight-menu-bar";
import { isPaymentFlowRoute } from "@/modules/utils/constants/payment/constants";

/**
 * Conditionally renders FlightMenuBar.
 * Hidden on payment flow pages: completion, pending, payment-failure.
 */
export function ConditionalFlightMenuBar(): React.ReactElement | null {
	const pathname = usePathname();

	if (isPaymentFlowRoute(pathname)) {
		return null;
	}

	return <FlightMenuBar />;
}
